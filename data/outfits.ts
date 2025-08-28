import { Outfit } from "./types";
import { USER_PROFILE } from "./constants";

// Generate timestamp for dates
const now = Date.now();
const daysAgo = (days: number) => now - days * 24 * 60 * 60 * 1000;

export const outfits: Outfit[] = [
	{
		id: "outfit_1",
		userId: USER_PROFILE.userId,
		name: "Business Meeting",
		description:
			"Professional outfit for important meetings and presentations",
		visibility: "PRIVATE",
		createdAt: daysAgo(30),
		updatedAt: daysAgo(15),
		tags: ["business", "professional", "formal"],
		items: [
			"wardrobe_1", // Classic White Button-Down
			"wardrobe_3", // Black Blazer
			"wardrobe_6", // High-Waisted Trousers
			"wardrobe_8", // Black Heels
			"wardrobe_9", // Gold Watch
		],
		occasion: "work",
		lastWorn: "2025-08-15",
	},
	{
		id: "outfit_2",
		userId: USER_PROFILE.userId,
		name: "Weekend Casual",
		description: "Relaxed and comfortable outfit for weekend activities",
		visibility: "PRIVATE",
		createdAt: daysAgo(20),
		updatedAt: daysAgo(5),
		tags: ["casual", "weekend", "comfortable"],
		items: [
			"wardrobe_4", // Striped Long Sleeve Tee
			"wardrobe_2", // Dark Wash Skinny Jeans
			"wardrobe_7", // White Sneakers
		],
		occasion: "casual",
		lastWorn: "2025-08-18",
	},
	{
		id: "outfit_3",
		userId: USER_PROFILE.userId,
		name: "Date Night",
		description: "Elegant evening outfit for special occasions",
		visibility: "PRIVATE",
		createdAt: daysAgo(45),
		updatedAt: daysAgo(2),
		tags: ["date", "evening", "elegant"],
		items: [
			"wardrobe_1", // Classic White Button-Down
			"wardrobe_6", // High-Waisted Trousers
			"wardrobe_8", // Black Heels
			"wardrobe_10", // Silk Scarf
		],
		occasion: "date",
		lastWorn: "2025-08-12",
	},
	{
		id: "outfit_4",
		userId: USER_PROFILE.userId,
		name: "Winter Office Look",
		description: "Warm and professional outfit for cold weather",
		visibility: "PRIVATE",
		createdAt: daysAgo(60),
		tags: ["winter", "office", "warm"],
		items: [
			"wardrobe_1", // Classic White Button-Down
			"wardrobe_6", // High-Waisted Trousers
			"wardrobe_5", // Wool Coat
			"wardrobe_8", // Black Heels
		],
		occasion: "work",
		lastWorn: "2025-08-08",
	},
];
