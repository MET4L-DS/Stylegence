import {
	WardrobeData,
	WardrobeItem,
	CategoryStats,
	WearStats,
	TimeBasedStats,
	UsageStats,
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
		shirts: items.filter((item) => item.category === "Shirts").length,
		pants: items.filter((item) => item.category === "Pants").length,
		jackets: items.filter((item) => item.category === "Jackets").length,
		shoes: items.filter((item) => item.category === "Shoes").length,
		accessories: items.filter((item) => item.category === "Accessories")
			.length,
	};
}

/**
 * Calculate wear-related statistics
 */
export function calculateWearStats(items: WardrobeItem[]): WearStats {
	const totalWorn = items.reduce(
		(sum, item) => sum + (item.timesWorn || 0),
		0
	);
	const averageWear = totalWorn / items.length;

	const mostWornItem = items.reduce((prev, current) =>
		(current.timesWorn || 0) > (prev.timesWorn || 0) ? current : prev
	);

	const leastWornItem = items.reduce((prev, current) =>
		(current.timesWorn || 0) < (prev.timesWorn || 0) ? current : prev
	);

	return {
		totalWorn,
		averageWear,
		mostWornItem,
		leastWornItem,
	};
}

/**
 * Calculate time-based wear statistics
 */
export function calculateTimeBasedStats(items: WardrobeItem[]): TimeBasedStats {
	const now = new Date();
	const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const weeklyWorn = items.filter(
		(item) => item.lastWorn && new Date(item.lastWorn) >= oneWeekAgo
	).length;

	const monthlyWorn = items.filter(
		(item) => item.lastWorn && new Date(item.lastWorn) >= oneMonthAgo
	).length;

	return {
		weeklyWorn,
		monthlyWorn,
	};
}

/**
 * Calculate usage-related statistics
 */
export function calculateUsageStats(items: WardrobeItem[]): UsageStats {
	const neverWorn = items.filter(
		(item) => !item.timesWorn || item.timesWorn === 0
	).length;
	const leftToWear = neverWorn;
	const itemsWornMultipleTimes = items.filter(
		(item) => (item.timesWorn || 0) > 1
	).length;
	const repeatPercentage =
		items.length > 0
			? Math.round((itemsWornMultipleTimes / items.length) * 100)
			: 0;

	return {
		neverWorn,
		leftToWear,
		itemsWornMultipleTimes,
		repeatPercentage,
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
	};
}

/**
 * Get category data formatted for charts
 */
export function getCategoryChartData(
	categoryStats: CategoryStats
): CategoryChartData[] {
	return [
		{ name: "Shirts", value: categoryStats.shirts, fill: "#3b82f6" },
		{ name: "Pants", value: categoryStats.pants, fill: "#10b981" },
		{ name: "Jackets", value: categoryStats.jackets, fill: "#f59e0b" },
		{ name: "Shoes", value: categoryStats.shoes, fill: "#8b5cf6" },
		{
			name: "Accessories",
			value: categoryStats.accessories,
			fill: "#ec4899",
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
		.map((item) => ({
			name:
				item.name.length > 12
					? item.name.substring(0, 12) + "..."
					: item.name,
			wears: item.timesWorn || 0,
			category: item.category,
		}))
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
				(item) => !item.timesWorn || item.timesWorn === 0
			).length,
		},
		{
			period: "1-5x",
			count: items.filter(
				(item) =>
					(item.timesWorn || 0) >= 1 && (item.timesWorn || 0) <= 5
			).length,
		},
		{
			period: "6-10x",
			count: items.filter(
				(item) =>
					(item.timesWorn || 0) >= 6 && (item.timesWorn || 0) <= 10
			).length,
		},
		{
			period: "11+",
			count: items.filter((item) => (item.timesWorn || 0) >= 11).length,
		},
	];
}
