export interface WardrobeItem {
	id: number;
	name: string;
	category: string;
	color: string;
	brand: string;
	image: string;
	tags: string[];
	timesWorn?: number;
	lastWorn?: string;
	purchaseDate?: string;
}

export interface Outfit {
	id: number;
	name: string;
	items: string[];
	occasion: string;
	lastWorn: string;
}

export interface RecommendedOutfit {
	name: string;
	items: string[];
	confidence: number;
	reason: string;
}

export interface AlternativeOutfit {
	name: string;
	items: string[];
	confidence: number;
}

export interface DayPlan {
	day: string;
	date: string;
	weather: string;
	schedule: string[];
	recommendedOutfit: RecommendedOutfit;
	alternatives: AlternativeOutfit[];
}

export interface WardrobeData {
	all: WardrobeItem[];
	outfits: Outfit[];
	weeklyPlan: DayPlan[];
}

// Analytics-related types
export interface CategoryStats {
	shirts: number;
	pants: number;
	jackets: number;
	shoes: number;
	accessories: number;
}

export interface WearStats {
	totalWorn: number;
	averageWear: number;
	mostWornItem: WardrobeItem;
	leastWornItem: WardrobeItem;
}

export interface TimeBasedStats {
	weeklyWorn: number;
	monthlyWorn: number;
}

export interface UsageStats {
	neverWorn: number;
	leftToWear: number;
	itemsWornMultipleTimes: number;
	repeatPercentage: number;
}

export interface AnalyticsData {
	totalItems: number;
	categoryStats: CategoryStats;
	wearStats: WearStats;
	timeBasedStats: TimeBasedStats;
	usageStats: UsageStats;
}

// Chart data types
export interface CategoryChartData {
	name: string;
	value: number;
	fill: string;
}

export interface WearFrequencyData {
	name: string;
	wears: number;
	category: string;
}

export interface UsageTrendData {
	period: string;
	count: number;
}
