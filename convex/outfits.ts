import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

/**
 * Generate a random outfit suggestion from user's wardrobe
 */
export const generateOutfitSuggestion = query({
	args: {
		occasion: v.optional(v.string()),
		weather: v.optional(v.string()),
		preferredCategories: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Get user's wardrobe items
		const wardrobeItems = await ctx.db
			.query("wardrobeItems")
			.withIndex("byUser", (q) => q.eq("userId", user._id))
			.collect();

		if (wardrobeItems.length === 0) {
			return null;
		}

		// Categorize items for outfit generation
		const itemsByCategory = {
			tops: wardrobeItems.filter(
				(item) =>
					item.aiCategory &&
					[
						"tops",
						"shirt",
						"blouse",
						"sweater",
						"hoodie",
						"tank",
					].some((cat) =>
						item.aiCategory!.toLowerCase().includes(cat)
					)
			),
			bottoms: wardrobeItems.filter(
				(item) =>
					item.aiCategory &&
					[
						"bottoms",
						"pants",
						"jeans",
						"shorts",
						"skirt",
						"trouser",
					].some((cat) =>
						item.aiCategory!.toLowerCase().includes(cat)
					)
			),
			dresses: wardrobeItems.filter(
				(item) =>
					item.aiCategory &&
					["dress", "gown"].some((cat) =>
						item.aiCategory!.toLowerCase().includes(cat)
					)
			),
			outerwear: wardrobeItems.filter(
				(item) =>
					item.aiCategory &&
					["jacket", "coat", "blazer", "cardigan", "outerwear"].some(
						(cat) => item.aiCategory!.toLowerCase().includes(cat)
					)
			),
			shoes: wardrobeItems.filter(
				(item) =>
					item.aiCategory &&
					["shoe", "boot", "sneaker", "sandal", "heel", "flat"].some(
						(cat) => item.aiCategory!.toLowerCase().includes(cat)
					)
			),
			accessories: wardrobeItems.filter(
				(item) =>
					item.aiCategory &&
					[
						"accessory",
						"bag",
						"belt",
						"jewelry",
						"hat",
						"scarf",
					].some((cat) =>
						item.aiCategory!.toLowerCase().includes(cat)
					)
			),
		};

		// Generate random outfit combination
		const outfitItems = [];

		// Choose either a dress OR top + bottom combination
		if (itemsByCategory.dresses.length > 0 && Math.random() > 0.6) {
			// Dress-based outfit
			const randomDress =
				itemsByCategory.dresses[
					Math.floor(Math.random() * itemsByCategory.dresses.length)
				];
			outfitItems.push(randomDress);
		} else {
			// Top + Bottom combination
			if (itemsByCategory.tops.length > 0) {
				const randomTop =
					itemsByCategory.tops[
						Math.floor(Math.random() * itemsByCategory.tops.length)
					];
				outfitItems.push(randomTop);
			}
			if (itemsByCategory.bottoms.length > 0) {
				const randomBottom =
					itemsByCategory.bottoms[
						Math.floor(
							Math.random() * itemsByCategory.bottoms.length
						)
					];
				outfitItems.push(randomBottom);
			}
		}

		// Add shoes if available
		if (itemsByCategory.shoes.length > 0) {
			const randomShoes =
				itemsByCategory.shoes[
					Math.floor(Math.random() * itemsByCategory.shoes.length)
				];
			outfitItems.push(randomShoes);
		}

		// Optionally add outerwear (30% chance)
		if (itemsByCategory.outerwear.length > 0 && Math.random() > 0.7) {
			const randomOuterwear =
				itemsByCategory.outerwear[
					Math.floor(Math.random() * itemsByCategory.outerwear.length)
				];
			outfitItems.push(randomOuterwear);
		}

		// Optionally add accessories (40% chance)
		if (itemsByCategory.accessories.length > 0 && Math.random() > 0.6) {
			const randomAccessory =
				itemsByCategory.accessories[
					Math.floor(
						Math.random() * itemsByCategory.accessories.length
					)
				];
			outfitItems.push(randomAccessory);
		}

		// Calculate outfit metadata
		const totalCost = outfitItems.reduce(
			(sum, item) => sum + (item.purchasePrice || 0),
			0
		);
		const avgWearCount =
			outfitItems.reduce((sum, item) => sum + (item.wearCount || 0), 0) /
			outfitItems.length;
		const sustainabilityScore = Math.min(100, avgWearCount * 15); // Simple sustainability calculation

		return {
			items: outfitItems,
			metadata: {
				totalCost,
				avgWearCount,
				sustainabilityScore,
				occasion: args.occasion || "casual",
				weather: args.weather || "mild",
				isAIGenerated: true,
				generatedAt: Date.now(),
			},
		};
	},
});

/**
 * Save an outfit to user's collection
 */
export const saveOutfit = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		wardrobeItemIds: v.array(v.id("wardrobeItems")),
		tags: v.optional(v.array(v.string())),
		occasion: v.optional(v.string()),
		visibility: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Create the outfit
		const outfitId = await ctx.db.insert("outfits", {
			userId: user._id,
			name: args.name,
			description: args.description,
			visibility: args.visibility || "PRIVATE",
			createdAt: Date.now(),
			tags: args.tags,
		});

		// Add outfit items
		for (let i = 0; i < args.wardrobeItemIds.length; i++) {
			await ctx.db.insert("outfitItems", {
				outfitId,
				wardrobeItemId: args.wardrobeItemIds[i],
				displayOrder: i,
			});
		}

		return outfitId;
	},
});

/**
 * Get user's saved outfits with items
 */
export const getUserOutfits = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);

		const outfits = await ctx.db
			.query("outfits")
			.withIndex("byUser", (q) => q.eq("userId", user._id))
			.order("desc")
			.collect();

		// Get outfit items and wardrobe items for each outfit
		const outfitsWithItems = await Promise.all(
			outfits.map(async (outfit) => {
				const outfitItems = await ctx.db
					.query("outfitItems")
					.withIndex("byOutfit", (q) => q.eq("outfitId", outfit._id))
					.order("asc")
					.collect();

				const wardrobeItems = await Promise.all(
					outfitItems.map(async (outfitItem) => {
						if (outfitItem.wardrobeItemId) {
							return await ctx.db.get(outfitItem.wardrobeItemId);
						}
						return null;
					})
				);

				return {
					...outfit,
					items: wardrobeItems.filter(Boolean),
				};
			})
		);

		return outfitsWithItems;
	},
});

/**
 * Delete an outfit
 */
export const deleteOutfit = mutation({
	args: {
		outfitId: v.id("outfits"),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Verify outfit belongs to user
		const outfit = await ctx.db.get(args.outfitId);
		if (!outfit || outfit.userId !== user._id) {
			throw new Error("Outfit not found or access denied");
		}

		// Delete outfit items first
		const outfitItems = await ctx.db
			.query("outfitItems")
			.withIndex("byOutfit", (q) => q.eq("outfitId", args.outfitId))
			.collect();

		for (const item of outfitItems) {
			await ctx.db.delete(item._id);
		}

		// Delete the outfit
		await ctx.db.delete(args.outfitId);
	},
});

/**
 * Generate weekly outfit plan
 */
export const generateWeeklyPlan = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);

		const days = [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday",
		];
		const occasions = [
			"work",
			"casual",
			"date",
			"workout",
			"formal",
			"weekend",
			"social",
		];

		// Get user's wardrobe items
		const wardrobeItems = await ctx.db
			.query("wardrobeItems")
			.withIndex("byUser", (q) => q.eq("userId", user._id))
			.collect();

		if (wardrobeItems.length === 0) {
			return days.map((day) => ({
				day,
				occasion: "casual",
				weather: "mild",
				recommendedOutfit: null,
			}));
		}

		// Generate outfit for each day
		const weeklyPlan = await Promise.all(
			days.map(async (day, index) => {
				// Use the existing generateOutfitSuggestion logic
				const occasion = occasions[index % occasions.length];

				// Simple weather simulation
				const weatherOptions = ["sunny", "cloudy", "rainy", "cold"];
				const weather =
					weatherOptions[
						Math.floor(Math.random() * weatherOptions.length)
					];

				// Generate outfit similar to generateOutfitSuggestion
				const itemsByCategory = {
					tops: wardrobeItems.filter(
						(item) =>
							item.aiCategory &&
							[
								"tops",
								"shirt",
								"blouse",
								"sweater",
								"hoodie",
								"tank",
							].some((cat) =>
								item.aiCategory!.toLowerCase().includes(cat)
							)
					),
					bottoms: wardrobeItems.filter(
						(item) =>
							item.aiCategory &&
							[
								"bottoms",
								"pants",
								"jeans",
								"shorts",
								"skirt",
								"trouser",
							].some((cat) =>
								item.aiCategory!.toLowerCase().includes(cat)
							)
					),
					dresses: wardrobeItems.filter(
						(item) =>
							item.aiCategory &&
							["dress", "gown"].some((cat) =>
								item.aiCategory!.toLowerCase().includes(cat)
							)
					),
					outerwear: wardrobeItems.filter(
						(item) =>
							item.aiCategory &&
							[
								"jacket",
								"coat",
								"blazer",
								"cardigan",
								"outerwear",
							].some((cat) =>
								item.aiCategory!.toLowerCase().includes(cat)
							)
					),
					shoes: wardrobeItems.filter(
						(item) =>
							item.aiCategory &&
							[
								"shoe",
								"boot",
								"sneaker",
								"sandal",
								"heel",
								"flat",
							].some((cat) =>
								item.aiCategory!.toLowerCase().includes(cat)
							)
					),
				};

				const outfitItems = [];

				// Generate outfit based on occasion
				if (
					(occasion === "work" || occasion === "formal") &&
					itemsByCategory.dresses.length > 0 &&
					Math.random() > 0.5
				) {
					const randomDress =
						itemsByCategory.dresses[
							Math.floor(
								Math.random() * itemsByCategory.dresses.length
							)
						];
					outfitItems.push(randomDress);
				} else {
					if (itemsByCategory.tops.length > 0) {
						const randomTop =
							itemsByCategory.tops[
								Math.floor(
									Math.random() * itemsByCategory.tops.length
								)
							];
						outfitItems.push(randomTop);
					}
					if (itemsByCategory.bottoms.length > 0) {
						const randomBottom =
							itemsByCategory.bottoms[
								Math.floor(
									Math.random() *
										itemsByCategory.bottoms.length
								)
							];
						outfitItems.push(randomBottom);
					}
				}

				if (itemsByCategory.shoes.length > 0) {
					const randomShoes =
						itemsByCategory.shoes[
							Math.floor(
								Math.random() * itemsByCategory.shoes.length
							)
						];
					outfitItems.push(randomShoes);
				}

				// Add outerwear for cold weather or formal occasions
				if (
					itemsByCategory.outerwear.length > 0 &&
					(weather === "cold" ||
						weather === "rainy" ||
						occasion === "formal")
				) {
					const randomOuterwear =
						itemsByCategory.outerwear[
							Math.floor(
								Math.random() * itemsByCategory.outerwear.length
							)
						];
					outfitItems.push(randomOuterwear);
				}

				const totalCost = outfitItems.reduce(
					(sum, item) => sum + (item.purchasePrice || 0),
					0
				);
				const avgWearCount =
					outfitItems.reduce(
						(sum, item) => sum + (item.wearCount || 0),
						0
					) / (outfitItems.length || 1);
				const sustainabilityScore = Math.min(100, avgWearCount * 15);

				return {
					day,
					occasion,
					weather,
					recommendedOutfit: {
						items: outfitItems,
						metadata: {
							totalCost,
							avgWearCount,
							sustainabilityScore,
							isAIGenerated: true,
							comfortLevel: Math.floor(Math.random() * 40) + 60, // 60-100
							generatedAt: Date.now(),
						},
					},
				};
			})
		);

		return weeklyPlan;
	},
});
