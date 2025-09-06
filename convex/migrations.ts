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

/**
 * Migration: Upload static wardrobe data to Convex database
 * This uploads all the sample wardrobe items from the data folder
 */
export const uploadStaticWardrobeData = mutation({
	args: {
		userId: v.id("users"), // The user to assign all wardrobe items to
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error("User not found");
		}

		// Static wardrobe data (from /data/wardrobeItems.ts)
		const wardrobeItemsData = [
			{
				customName: "Classic White Button-Down",
				aiCategory: "tops",
				aiTags: [
					"business",
					"casual",
					"versatile",
					"cotton",
					"brand:StyleSense",
				],
				dominantColors: ["White"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 89.99,
				purchaseCurrency: "USD",
				wearCount: 15,
				lastWornAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
				addedDate: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
			},
			{
				customName: "Dark Wash Skinny Jeans",
				aiCategory: "bottoms",
				aiTags: [
					"casual",
					"weekend",
					"denim",
					"skinny-fit",
					"brand:Denim Co",
				],
				dominantColors: ["Dark Blue"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 129.99,
				purchaseCurrency: "USD",
				wearCount: 22,
				lastWornAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
				addedDate: Date.now() - 120 * 24 * 60 * 60 * 1000, // 120 days ago
			},
			{
				customName: "Black Blazer",
				aiCategory: "outerwear",
				aiTags: [
					"business",
					"formal",
					"versatile",
					"structured",
					"brand:StyleSense",
				],
				dominantColors: ["Black"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 199.99,
				purchaseCurrency: "USD",
				wearCount: 8,
				lastWornAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
				addedDate: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
			},
			{
				customName: "Striped Long Sleeve Tee",
				aiCategory: "tops",
				aiTags: [
					"casual",
					"striped",
					"cotton",
					"long-sleeve",
					"brand:Basic Wear",
				],
				dominantColors: ["Navy", "White"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 39.99,
				purchaseCurrency: "USD",
				wearCount: 12,
				lastWornAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
				addedDate: Date.now() - 100 * 24 * 60 * 60 * 1000, // 100 days ago
			},
			{
				customName: "Wool Coat",
				aiCategory: "outerwear",
				aiTags: [
					"winter",
					"formal",
					"wool",
					"long",
					"brand:Urban Style",
				],
				dominantColors: ["Camel"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 299.99,
				purchaseCurrency: "USD",
				wearCount: 3,
				lastWornAt: Date.now() - 18 * 24 * 60 * 60 * 1000, // 18 days ago
				addedDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
			},
			{
				customName: "High-Waisted Trousers",
				aiCategory: "bottoms",
				aiTags: [
					"business",
					"formal",
					"high-waisted",
					"tailored",
					"brand:StyleSense",
				],
				dominantColors: ["Black"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 119.99,
				purchaseCurrency: "USD",
				wearCount: 9,
				lastWornAt: Date.now() - 9 * 24 * 60 * 60 * 1000, // 9 days ago
				addedDate: Date.now() - 75 * 24 * 60 * 60 * 1000, // 75 days ago
			},
			{
				customName: "White Sneakers",
				aiCategory: "shoes",
				aiTags: [
					"casual",
					"sport",
					"comfortable",
					"versatile",
					"brand:Athletic Wear",
				],
				dominantColors: ["White"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 89.99,
				purchaseCurrency: "USD",
				wearCount: 18,
				lastWornAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
				addedDate: Date.now() - 150 * 24 * 60 * 60 * 1000, // 150 days ago
			},
			{
				customName: "Black Heels",
				aiCategory: "shoes",
				aiTags: [
					"business",
					"formal",
					"heels",
					"elegant",
					"brand:Urban Style",
				],
				dominantColors: ["Black"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 149.99,
				purchaseCurrency: "USD",
				wearCount: 6,
				lastWornAt: Date.now() - 13 * 24 * 60 * 60 * 1000, // 13 days ago
				addedDate: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
			},
			{
				customName: "Casual Summer Dress",
				aiCategory: "dresses",
				aiTags: [
					"casual",
					"summer",
					"comfortable",
					"flowy",
					"brand:Urban Style",
				],
				dominantColors: ["Floral"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 79.99,
				purchaseCurrency: "USD",
				wearCount: 5,
				lastWornAt: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
				addedDate: Date.now() - 50 * 24 * 60 * 60 * 1000, // 50 days ago
			},
			{
				customName: "Leather Handbag",
				aiCategory: "accessories",
				aiTags: [
					"everyday",
					"leather",
					"versatile",
					"medium-size",
					"brand:Urban Style",
				],
				dominantColors: ["Brown"],
				imageUrl: "/api/placeholder/200/300",
				purchasePrice: 189.99,
				purchaseCurrency: "USD",
				wearCount: 25,
				lastWornAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
				addedDate: Date.now() - 200 * 24 * 60 * 60 * 1000, // 200 days ago
			},
		];

		let uploadedItems = 0;
		const wardrobeItemIds = [];

		// Upload each wardrobe item
		for (const itemData of wardrobeItemsData) {
			const wardrobeItem = await ctx.db.insert("wardrobeItems", {
				userId: args.userId,
				sourceType: "USER_UPLOADED",
				customName: itemData.customName,
				addedDate: itemData.addedDate,
				purchasePrice: itemData.purchasePrice,
				purchaseCurrency: itemData.purchaseCurrency,
				imageUrl: itemData.imageUrl,
				aiCategory: itemData.aiCategory,
				aiTags: itemData.aiTags,
				dominantColors: itemData.dominantColors,
				visibility: "private",
				addedAt: itemData.addedDate,
				lastWornAt: itemData.lastWornAt,
				wearCount: itemData.wearCount,
				meta: {},
			});

			wardrobeItemIds.push(wardrobeItem);
			uploadedItems++;
		}

		// Update user's wardrobeItemIds array
		const currentWardrobeItemIds = user.wardrobeItemIds || [];
		await ctx.db.patch(args.userId, {
			wardrobeItemIds: [...currentWardrobeItemIds, ...wardrobeItemIds],
		});

		return {
			success: true,
			message: `Uploaded ${uploadedItems} wardrobe items and updated user wardrobeItemIds`,
			uploadedItems,
			totalWardrobeItems:
				currentWardrobeItemIds.length + wardrobeItemIds.length,
		};
	},
});

/**
 * Migration: Clear all wardrobe items for a user
 * Useful for testing or resetting data
 */
export const clearUserWardrobeItems = mutation({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error("User not found");
		}

		// Get all wardrobe items for this user
		const wardrobeItems = await ctx.db
			.query("wardrobeItems")
			.withIndex("byUser", (q) => q.eq("userId", args.userId))
			.collect();

		// Delete all wardrobe items
		for (const item of wardrobeItems) {
			await ctx.db.delete(item._id);
		}

		// Clear user's wardrobeItemIds array
		await ctx.db.patch(args.userId, {
			wardrobeItemIds: [],
		});

		return {
			success: true,
			message: `Cleared ${wardrobeItems.length} wardrobe items for user`,
			deletedItems: wardrobeItems.length,
		};
	},
});
