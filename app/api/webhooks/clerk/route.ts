import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local");
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Forward to Convex webhook handler
  const convexUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/api', '')}/clerk-users-webhook`;
  
  try {
    const response = await fetch(convexUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      },
      body: body,
    });

    if (!response.ok) {
      console.error("Error forwarding to Convex:", response.statusText);
    }
  } catch (error) {
    console.error("Error forwarding to Convex:", error);
  }

  return new NextResponse("", { status: 200 });
}
