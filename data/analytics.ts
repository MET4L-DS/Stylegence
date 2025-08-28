import {
	WardrobeData,
	WardrobeItem,
	CategoryStats,
	WearStats,
	TimeBasedStats,
	UsageStats,
	SustainabilityStats,
	AnalyticsData,
	CategoryChartData,
	WearFrequencyData,
	UsageTrendData,
} from "./types";

/**
 * Calculate category breakdown statistics
 */
export function calculateCategoryStats(items: WardrobeItem[]): CategoryStats {
	return {
		tops: items.filter((item) => item.category === "tops").length,
		bottoms: items.filter((item) => item.category === "bottoms").length,
		dresses: items.filter((item) => item.category === "dresses").length,
		outerwear: items.filter((item) => item.category === "outerwear").length,
		shoes: items.filter((item) => item.category === "shoes").length,
		accessories: items.filter((item) => item.category === "accessories")
			.length,
	};
}

/**
 * Calculate wear-related statistics
 */
export function calculateWearStats(items: WardrobeItem[]): WearStats {
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
			const wearRate = (item.wearCount || 0) / daysSinceAdded;
			return wearRate >= 0.8; // Worn almost daily
		}).length,
		weekly: items.filter((item) => {
			const daysSinceAdded =
				(Date.now() - (item.addedAt || 0)) / (1000 * 60 * 60 * 24);
			const wearRate = (item.wearCount || 0) / daysSinceAdded;
			return wearRate >= 0.1 && wearRate < 0.8; // Worn weekly
		}).length,
		monthly: items.filter((item) => {
			const daysSinceAdded =
				(Date.now() - (item.addedAt || 0)) / (1000 * 60 * 60 * 24);
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
export function calculateTimeBasedStats(items: WardrobeItem[]): TimeBasedStats {
	const now = Date.now();
	const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
	const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

	const weeklyWorn = items.filter(
		(item) => item.lastWornAt && item.lastWornAt >= oneWeekAgo
	).length;

	const monthlyWorn = items.filter(
		(item) => item.lastWornAt && item.lastWornAt >= oneMonthAgo
	).length;

	// Calculate seasonal trends
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
export function calculateUsageStats(items: WardrobeItem[]): UsageStats {
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

	const mostEfficientItem = itemsWithPrice.reduce((prev, current) => {
		const prevCPW = (prev.purchasePrice || 0) / (prev.wearCount || 1);
		const currentCPW =
			(current.purchasePrice || 0) / (current.wearCount || 1);
		return currentCPW < prevCPW ? current : prev;
	}, itemsWithPrice[0] || items[0]);

	const leastEfficientItem = itemsWithPrice.reduce((prev, current) => {
		const prevCPW = (prev.purchasePrice || 0) / (prev.wearCount || 1);
		const currentCPW =
			(current.purchasePrice || 0) / (current.wearCount || 1);
		return currentCPW > prevCPW ? current : prev;
	}, itemsWithPrice[0] || items[0]);

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
	items: WardrobeItem[]
): SustainabilityStats {
	const totalInvestment = items.reduce(
		(sum, item) => sum + (item.purchasePrice || 0),
		0
	);
	const averageCostPerItem = totalInvestment / items.length;

	// Simple sustainability score based on wear frequency and cost efficiency
	const totalWears = items.reduce(
		(sum, item) => sum + (item.wearCount || 0),
		0
	);
	const sustainabilityScore = Math.min(100, (totalWears / items.length) * 10);

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
 * Calculate all analytics data for a wardrobe
 */
export function calculateAnalytics(wardrobeData: WardrobeData): AnalyticsData {
	const items = wardrobeData.all;
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
 * Get category data formatted for charts
 */
export function getCategoryChartData(
	categoryStats: CategoryStats
): CategoryChartData[] {
	return [
		{ name: "Tops", value: categoryStats.tops, fill: "#3b82f6" },
		{ name: "Bottoms", value: categoryStats.bottoms, fill: "#10b981" },
		{ name: "Dresses", value: categoryStats.dresses, fill: "#f59e0b" },
		{ name: "Outerwear", value: categoryStats.outerwear, fill: "#8b5cf6" },
		{ name: "Shoes", value: categoryStats.shoes, fill: "#ec4899" },
		{
			name: "Accessories",
			value: categoryStats.accessories,
			fill: "#06b6d4",
		},
	].filter((item) => item.value > 0);
}

/**
 * Get wear frequency data formatted for charts
 */
export function getWearFrequencyData(
	items: WardrobeItem[]
): WearFrequencyData[] {
	return items
		.map((item) => {
			const costPerWear =
				(item.purchasePrice || 0) / Math.max(item.wearCount || 1, 1);
			return {
				name:
					item.name.length > 12
						? item.name.substring(0, 12) + "..."
						: item.name,
				wears: item.wearCount || 0,
				category: item.category,
				efficiency: Math.max(0, 100 - costPerWear), // Higher efficiency = lower cost per wear
			};
		})
		.sort((a, b) => b.wears - a.wears);
}

/**
 * Get usage trend data formatted for charts
 */
export function getUsageTrendData(items: WardrobeItem[]): UsageTrendData[] {
	return [
		{
			period: "Never",
			count: items.filter(
				(item) => !item.wearCount || item.wearCount === 0
			).length,
		},
		{
			period: "1-5x",
			count: items.filter(
				(item) =>
					(item.wearCount || 0) >= 1 && (item.wearCount || 0) <= 5
			).length,
		},
		{
			period: "6-10x",
			count: items.filter(
				(item) =>
					(item.wearCount || 0) >= 6 && (item.wearCount || 0) <= 10
			).length,
		},
		{
			period: "11+",
			count: items.filter((item) => (item.wearCount || 0) >= 11).length,
		},
	];
}
