import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const createPayment = mutation({
  args: {
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    return await ctx.db.insert("payments", {
      userId: user._id,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

export const getUserPayments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    return await ctx.db
      .query("payments")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const fulfillPayment = internalMutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("stripeSessionId"), args.sessionId))
      .unique();

    if (payment) {
      await ctx.db.patch(payment._id, {
        status: "completed",
        completedAt: Date.now(),
      });
    }
  },
});
