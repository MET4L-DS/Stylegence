/**
 * Analytics functions specifically for Convex wardrobe data
 * This module provides analytics calculations that work directly with Convex wardrobe items
 */

export interface ConvexWardrobeItem {
	_id: string;
	_creationTime?: number;
	userId: string;
	productVariantId?: string;
	sourceType: string; // Changed from union type to string to match schema
	customName?: string;
	addedDate?: number;
	purchasePrice?: number;
	purchaseCurrency?: string;
	imageUrl?: string;
	aiCategory?: string;
	aiTags?: string[];
	dominantColors?: string[];
	visibility?: string; // Changed from union type to string
	addedAt: number;
	lastWornAt?: number;
	wearCount?: number;
	meta?: Record<string, any>;
}

export interface ConvexAnalyticsData {
	totalItems: number;
	categoryStats: CategoryStats;
	wearStats: WearStats;
	timeBasedStats: TimeBasedStats;
	usageStats: UsageStats;
	sustainabilityStats: SustainabilityStats;
}

export interface CategoryStats {
	tops: number;
	bottoms: number;
	dresses: number;
	outerwear: number;
	shoes: number;
	accessories: number;
}

export interface WearStats {
	totalWorn: number;
	averageWear: number;
	mostWornItem: ConvexWardrobeItem | null;
	leastWornItem: ConvexWardrobeItem | null;
	wearFrequency: {
		daily: number;
		weekly: number;
		monthly: number;
	};
}

export interface TimeBasedStats {
	weeklyWorn: number;
	monthlyWorn: number;
	seasonalTrends: Array<{
		season: string;
		itemsAdded: number;
		mostWornCategory: string;
	}>;
}

export interface UsageStats {
	neverWorn: number;
	leftToWear: number;
	itemsWornMultipleTimes: number;
	repeatPercentage: number;
	costPerWear: {
		average: number;
		mostEfficient: ConvexWardrobeItem | null;
		leastEfficient: ConvexWardrobeItem | null;
	};
}

export interface SustainabilityStats {
	totalInvestment: number;
	averageCostPerItem: number;
	sustainabilityScore: number;
	co2SavedFromRewearing: number;
}

/**
 * Calculate category breakdown statistics
 */
export function calculateCategoryStats(
	items: ConvexWardrobeItem[]
): CategoryStats {
	const categorizeItem = (category?: string): keyof CategoryStats => {
		if (!category) return "accessories";

		const lowerCategory = category.toLowerCase();

		// Map various category names to standard categories
		if (
			lowerCategory.includes("top") ||
			lowerCategory.includes("shirt") ||
			lowerCategory.includes("blouse") ||
			lowerCategory.includes("sweater") ||
			lowerCategory.includes("hoodie") ||
			lowerCategory.includes("tank")
		) {
			return "tops";
		}
		if (
			lowerCategory.includes("bottom") ||
			lowerCategory.includes("pant") ||
			lowerCategory.includes("jean") ||
			lowerCategory.includes("short") ||
			lowerCategory.includes("skirt") ||
			lowerCategory.includes("trouser")
		) {
			return "bottoms";
		}
		if (lowerCategory.includes("dress") || lowerCategory.includes("gown")) {
			return "dresses";
		}
		if (
			lowerCategory.includes("jacket") ||
			lowerCategory.includes("coat") ||
			lowerCategory.includes("blazer") ||
			lowerCategory.includes("cardigan") ||
			lowerCategory.includes("outerwear")
		) {
			return "outerwear";
		}
		if (
			lowerCategory.includes("shoe") ||
			lowerCategory.includes("boot") ||
			lowerCategory.includes("sneaker") ||
			lowerCategory.includes("sandal") ||
			lowerCategory.includes("heel") ||
			lowerCategory.includes("flat")
		) {
			return "shoes";
		}

		// Default to accessories for jewelry, bags, belts, etc.
		return "accessories";
	};

	return items.reduce(
		(stats, item) => {
			const category = categorizeItem(item.aiCategory);
			stats[category]++;
			return stats;
		},
		{
			tops: 0,
			bottoms: 0,
			dresses: 0,
			outerwear: 0,
			shoes: 0,
			accessories: 0,
		}
	);
}

/**
 * Calculate wear-related statistics
 */
export function calculateWearStats(items: ConvexWardrobeItem[]): WearStats {
	if (items.length === 0) {
		return {
			totalWorn: 0,
			averageWear: 0,
			mostWornItem: null,
			leastWornItem: null,
			wearFrequency: {
				daily: 0,
				weekly: 0,
				monthly: 0,
			},
		};
	}

	const totalWorn = items.reduce(
		(sum, item) => sum + (item.wearCount || 0),
		0
	);
	const averageWear = totalWorn / items.length;

	const mostWornItem = items.reduce((prev, current) =>
		(current.wearCount || 0) > (prev.wearCount || 0) ? current : prev
	);

	const leastWornItem = items.reduce((prev, current) =>
		(current.wearCount || 0) < (prev.wearCount || 0) ? current : prev
	);

	// Calculate wear frequency distribution
	const wearFrequency = {
		daily: items.filter((item) => {
			const daysSinceAdded =
				(Date.now() - (item.addedAt || 0)) / (1000 * 60 * 60 * 24);
			if (daysSinceAdded === 0) return false;
			const wearRate = (item.wearCount || 0) / daysSinceAdded;
			return wearRate >= 0.8; // Worn almost daily
		}).length,
		weekly: items.filter((item) => {
			const daysSinceAdded =
				(Date.now() - (item.addedAt || 0)) / (1000 * 60 * 60 * 24);
			if (daysSinceAdded === 0) return false;
			const wearRate = (item.wearCount || 0) / daysSinceAdded;
			return wearRate >= 0.1 && wearRate < 0.8; // Worn weekly
		}).length,
		monthly: items.filter((item) => {
			const daysSinceAdded =
				(Date.now() - (item.addedAt || 0)) / (1000 * 60 * 60 * 24);
			if (daysSinceAdded === 0) return false;
			const wearRate = (item.wearCount || 0) / daysSinceAdded;
			return wearRate >= 0.03 && wearRate < 0.1; // Worn monthly
		}).length,
	};

	return {
		totalWorn,
		averageWear,
		mostWornItem,
		leastWornItem,
		wearFrequency,
	};
}

/**
 * Calculate time-based wear statistics
 */
export function calculateTimeBasedStats(
	items: ConvexWardrobeItem[]
): TimeBasedStats {
	const now = Date.now();
	const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
	const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

	const weeklyWorn = items.filter(
		(item) => item.lastWornAt && item.lastWornAt >= oneWeekAgo
	).length;

	const monthlyWorn = items.filter(
		(item) => item.lastWornAt && item.lastWornAt >= oneMonthAgo
	).length;

	// Calculate seasonal trends based on when items were added
	const seasonalTrends = [
		{
			season: "Spring",
			itemsAdded: items.filter((item) => {
				const addedDate = new Date(item.addedAt || 0);
				const month = addedDate.getMonth();
				return month >= 2 && month <= 4; // March-May
			}).length,
			mostWornCategory: "tops",
		},
		{
			season: "Summer",
			itemsAdded: items.filter((item) => {
				const addedDate = new Date(item.addedAt || 0);
				const month = addedDate.getMonth();
				return month >= 5 && month <= 7; // June-August
			}).length,
			mostWornCategory: "dresses",
		},
		{
			season: "Fall",
			itemsAdded: items.filter((item) => {
				const addedDate = new Date(item.addedAt || 0);
				const month = addedDate.getMonth();
				return month >= 8 && month <= 10; // September-November
			}).length,
			mostWornCategory: "outerwear",
		},
		{
			season: "Winter",
			itemsAdded: items.filter((item) => {
				const addedDate = new Date(item.addedAt || 0);
				const month = addedDate.getMonth();
				return month >= 11 || month <= 1; // December-February
			}).length,
			mostWornCategory: "outerwear",
		},
	];

	return {
		weeklyWorn,
		monthlyWorn,
		seasonalTrends,
	};
}

/**
 * Calculate usage-related statistics
 */
export function calculateUsageStats(items: ConvexWardrobeItem[]): UsageStats {
	const neverWorn = items.filter(
		(item) => !item.wearCount || item.wearCount === 0
	).length;
	const leftToWear = neverWorn;
	const itemsWornMultipleTimes = items.filter(
		(item) => (item.wearCount || 0) > 1
	).length;
	const repeatPercentage =
		items.length > 0
			? Math.round((itemsWornMultipleTimes / items.length) * 100)
			: 0;

	// Calculate cost per wear efficiency
	const itemsWithPrice = items.filter(
		(item) => item.purchasePrice && item.wearCount
	);
	const averageCostPerWear =
		itemsWithPrice.length > 0
			? itemsWithPrice.reduce(
					(sum, item) =>
						sum + (item.purchasePrice || 0) / (item.wearCount || 1),
					0
				) / itemsWithPrice.length
			: 0;

	const mostEfficientItem =
		itemsWithPrice.length > 0
			? itemsWithPrice.reduce((prev, current) => {
					const prevCPW =
						(prev.purchasePrice || 0) / (prev.wearCount || 1);
					const currentCPW =
						(current.purchasePrice || 0) / (current.wearCount || 1);
					return currentCPW < prevCPW ? current : prev;
				})
			: null;

	const leastEfficientItem =
		itemsWithPrice.length > 0
			? itemsWithPrice.reduce((prev, current) => {
					const prevCPW =
						(prev.purchasePrice || 0) / (prev.wearCount || 1);
					const currentCPW =
						(current.purchasePrice || 0) / (current.wearCount || 1);
					return currentCPW > prevCPW ? current : prev;
				})
			: null;

	return {
		neverWorn,
		leftToWear,
		itemsWornMultipleTimes,
		repeatPercentage,
		costPerWear: {
			average: averageCostPerWear,
			mostEfficient: mostEfficientItem,
			leastEfficient: leastEfficientItem,
		},
	};
}

/**
 * Calculate sustainability statistics
 */
export function calculateSustainabilityStats(
	items: ConvexWardrobeItem[]
): SustainabilityStats {
	const totalInvestment = items.reduce(
		(sum, item) => sum + (item.purchasePrice || 0),
		0
	);
	const averageCostPerItem =
		items.length > 0 ? totalInvestment / items.length : 0;

	// Simple sustainability score based on wear frequency and cost efficiency
	const totalWears = items.reduce(
		(sum, item) => sum + (item.wearCount || 0),
		0
	);
	const sustainabilityScore =
		items.length > 0 ? Math.min(100, (totalWears / items.length) * 10) : 0;

	// Estimate CO2 saved from re-wearing vs buying new
	const avgCO2PerNewItem = 33; // kg CO2 per garment (fashion industry average)
	const co2SavedFromRewearing =
		(totalWears - items.length) * avgCO2PerNewItem;

	return {
		totalInvestment,
		averageCostPerItem,
		sustainabilityScore,
		co2SavedFromRewearing: Math.max(0, co2SavedFromRewearing),
	};
}

/**
 * Calculate all analytics data for Convex wardrobe items
 */
export function calculateConvexAnalytics(
	items: ConvexWardrobeItem[]
): ConvexAnalyticsData {
	const totalItems = items.length;

	return {
		totalItems,
		categoryStats: calculateCategoryStats(items),
		wearStats: calculateWearStats(items),
		timeBasedStats: calculateTimeBasedStats(items),
		usageStats: calculateUsageStats(items),
		sustainabilityStats: calculateSustainabilityStats(items),
	};
}

/**
 * Helper function to get display name for an item
 */
export function getItemDisplayName(item: ConvexWardrobeItem): string {
	return item.customName || "Untitled Item";
}

/**
 * Helper function to get brand from AI tags
 */
export function getItemBrand(item: ConvexWardrobeItem): string {
	const brandTag = item.aiTags?.find((tag) => tag.startsWith("brand:"));
	return brandTag ? brandTag.replace("brand:", "") : "Unknown";
}
