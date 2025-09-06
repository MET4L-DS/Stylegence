import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Migration: Sync existing wardrobe items to user.wardrobeItemIds
 * This should be run once to populate the wardrobeItemIds field for existing users
 */
export const syncWardrobeItemIds = mutation({
	args: {},
	handler: async (ctx) => {
		// Get all users
		const users = await ctx.db.query("users").collect();
		let updatedUsers = 0;

		for (const user of users) {
			// Get all wardrobe items for this user
			const wardrobeItems = await ctx.db
				.query("wardrobeItems")
				.withIndex("byUser", (q) => q.eq("userId", user._id))
				.collect();

			const wardrobeItemIds = wardrobeItems.map((item) => item._id);

			// Update user with current wardrobe item IDs
			await ctx.db.patch(user._id, {
				wardrobeItemIds: wardrobeItemIds,
			});

			updatedUsers++;
		}

		return {
			success: true,
			message: `Updated wardrobeItemIds for ${updatedUsers} users`,
		};
	},
});
