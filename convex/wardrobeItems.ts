import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

/**
 * Add a user-uploaded item to the wardrobe
 */
export const addUserUploadedItem = mutation({
	args: {
		customName: v.string(),
		category: v.string(),
		brand: v.optional(v.string()),
		color: v.optional(v.string()),
		size: v.optional(v.string()),
		purchasePrice: v.optional(v.number()),
		purchaseCurrency: v.optional(v.string()),
		notes: v.optional(v.string()),
		visibility: v.optional(v.string()),
		imageUrl: v.string(),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Build AI tags array including user-provided tags and metadata
		const aiTags = [...(args.tags || [])];

		// Add brand, size, and notes as structured tags if provided
		if (args.brand) {
			aiTags.push(`brand:${args.brand}`);
		}
		if (args.size) {
			aiTags.push(`size:${args.size}`);
		}
		if (args.notes && args.notes.trim()) {
			aiTags.push(`notes:${args.notes.trim()}`);
		}

		const wardrobeItem = await ctx.db.insert("wardrobeItems", {
			userId: user._id,
			sourceType: "USER_UPLOADED",
			customName: args.customName,
			addedDate: Date.now(),
			purchasePrice: args.purchasePrice,
			purchaseCurrency: args.purchaseCurrency || "USD",
			imageUrl: args.imageUrl,
			aiCategory: args.category,
			aiTags: aiTags,
			dominantColors: args.color ? [args.color] : [],
			visibility: (args.visibility as any) || "private",
			addedAt: Date.now(),
			wearCount: 0,
			meta: {}, // Empty object as required by schema
		});

		return wardrobeItem;
	},
});

/**
 * Get all wardrobe items for the current user
 */
export const getUserWardrobeItems = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);

		const items = await ctx.db
			.query("wardrobeItems")
			.withIndex("byUser", (q) => q.eq("userId", user._id))
			.collect();

		return items;
	},
});

/**
 * Update a wardrobe item
 */
export const updateWardrobeItem = mutation({
	args: {
		id: v.id("wardrobeItems"),
		customName: v.optional(v.string()),
		category: v.optional(v.string()),
		visibility: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Verify ownership
		const item = await ctx.db.get(args.id);
		if (!item || item.userId !== user._id) {
			throw new Error("Wardrobe item not found or access denied");
		}

		const updateData: any = {};
		if (args.customName !== undefined)
			updateData.customName = args.customName;
		if (args.category !== undefined) updateData.aiCategory = args.category;
		if (args.visibility !== undefined)
			updateData.visibility = args.visibility;
		if (args.tags !== undefined) updateData.aiTags = args.tags;
		if (args.notes !== undefined) {
			updateData.meta = { ...item.meta, notes: args.notes };
		}

		await ctx.db.patch(args.id, updateData);
		return await ctx.db.get(args.id);
	},
});

/**
 * Delete a wardrobe item
 */
export const deleteWardrobeItem = mutation({
	args: {
		id: v.id("wardrobeItems"),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Verify ownership
		const item = await ctx.db.get(args.id);
		if (!item || item.userId !== user._id) {
			throw new Error("Wardrobe item not found or access denied");
		}

		await ctx.db.delete(args.id);
		return { success: true };
	},
});

/**
 * Record a wear event for a wardrobe item
 */
export const recordWear = mutation({
	args: {
		id: v.id("wardrobeItems"),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Verify ownership
		const item = await ctx.db.get(args.id);
		if (!item || item.userId !== user._id) {
			throw new Error("Wardrobe item not found or access denied");
		}

		await ctx.db.patch(args.id, {
			lastWornAt: Date.now(),
			wearCount: (item.wearCount || 0) + 1,
		});

		return await ctx.db.get(args.id);
	},
});

/**
 * Get wardrobe items by category
 */
export const getItemsByCategory = query({
	args: {
		category: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		const items = await ctx.db
			.query("wardrobeItems")
			.withIndex("byUser", (q) => q.eq("userId", user._id))
			.filter((q) => q.eq(q.field("aiCategory"), args.category))
			.collect();

		return items;
	},
});

/**
 * Search wardrobe items by tags or name
 */
export const searchWardrobeItems = query({
	args: {
		searchTerm: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		const items = await ctx.db
			.query("wardrobeItems")
			.withIndex("byUser", (q) => q.eq("userId", user._id))
			.collect();

		// Filter items that match the search term
		const searchTerm = args.searchTerm.toLowerCase();
		return items.filter((item) => {
			const nameMatch = item.customName
				?.toLowerCase()
				.includes(searchTerm);
			const tagMatch = item.aiTags?.some((tag) =>
				tag.toLowerCase().includes(searchTerm)
			);
			const categoryMatch = item.aiCategory
				?.toLowerCase()
				.includes(searchTerm);

			return nameMatch || tagMatch || categoryMatch;
		});
	},
});
