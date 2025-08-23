import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

// Clerk webhook handler
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateClerkRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted": {
        const clerkUserId = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }
      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

// Stripe webhook handler
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    try {
      const body = await request.text();
      const event = JSON.parse(body); // In production, verify with Stripe's webhook secret

      switch (event.type) {
        case "checkout.session.completed":
          await ctx.runMutation(internal.payments.fulfillPayment, {
            sessionId: event.data.object.id,
          });
          break;
        case "payment_intent.succeeded":
          console.log("Payment succeeded:", event.data.object.id);
          break;
        default:
          console.log("Unhandled Stripe event:", event.type);
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      return new Response("Webhook error", { status: 400 });
    }
  }),
});

async function validateClerkRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;
