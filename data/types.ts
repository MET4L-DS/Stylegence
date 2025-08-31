// Updated types aligned with Convex schema

export interface Brand {
	id: string;
	name: string;
	logoUrl?: string;
	description?: string;
}

export interface Category {
	id: string;
	name: string;
	parentCategoryId?: string;
	slug: string;
}

export interface ProductGroup {
	id: string;
	title: string;
	description?: string;
	brandId?: string;
	categoryId?: string;
	baseProductCode?: string;
	normalizedTags?: string[];
	createdAt: number;
	updatedAt?: number;
}

export interface ProductVariant {
	id: string;
	productGroupId: string;
	sku: string;
	colorPrimary?: string;
	colorSecondary?: string;
	sizeLabel?: string;
	sizeSystem?: string;
	availabilityStatus?: string;
	inventory?: number;
	sourceMarketplace?: string;
	sourcePdpUrl?: string;
	affiliateLink?: string;
	averageRating?: number;
	reviewCount?: number;
	createdAt: number;
	updatedAt?: number;
}

export interface WardrobeItem {
	id: string;
	userId: string;
	productVariantId?: string;
	sourceType: "CATALOG" | "USER_UPLOADED";
	customName?: string;
	addedDate?: number;
	purchasePrice?: number;
	purchaseCurrency?: string;
	imageUrl?: string;
	aiCategory?: string;
	aiTags?: string[];
	dominantColors?: string[];
	visibility?: "private" | "family" | "friends" | "public";
	addedAt: number;
	lastWornAt?: number;
	wearCount?: number;

	// Computed/display fields for compatibility
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
	id: string;
	userId: string;
	name: string;
	description?: string;
	visibility: "PUBLIC" | "PRIVATE" | "GROUP";
	createdAt: number;
	updatedAt?: number;
	tags?: string[];
	items: string[]; // wardrobeItem IDs
	occasion?: string;
	lastWorn?: string;
}

export interface OutfitItem {
	id: string;
	outfitId: string;
	wardrobeItemId?: string;
	productVariantId?: string;
	displayOrder?: number;
}

export interface RecommendedOutfit {
	name: string;
	items: string[];
	confidence: number;
	reason: string;
	aiGenerated?: boolean;
	compatibilityScore?: number;
}

export interface AlternativeOutfit {
	name: string;
	items: string[];
	confidence: number;
	substituteFor?: string; // item being substituted
}

export interface DayPlan {
	day: string;
	date: string;
	weather: string;
	schedule: string[];
	recommendedOutfit: RecommendedOutfit;
	alternatives: AlternativeOutfit[];
	weatherConditions?: {
		temperature: number;
		condition: string;
		humidity?: number;
		precipitation?: number;
	};
	calendarEvents?: {
		title: string;
		time: string;
		type: "work" | "casual" | "formal" | "sport";
	}[];
}

export interface WardrobeData {
	all: WardrobeItem[];
	outfits: Outfit[];
	weeklyPlan: DayPlan[];
	brands: Brand[];
	categories: Category[];
}

// Analytics-related types (enhanced)
export interface CategoryStats {
	tops: number;
	bottoms: number;
	dresses: number;
	shoes: number;
	accessories: number;
	outerwear: number;
}

export interface WearStats {
	totalWorn: number;
	averageWear: number;
	mostWornItem: WardrobeItem;
	leastWornItem: WardrobeItem;
	wearFrequency: {
		daily: number;
		weekly: number;
		monthly: number;
	};
}

export interface TimeBasedStats {
	weeklyWorn: number;
	monthlyWorn: number;
	seasonalTrends: {
		season: string;
		itemsAdded: number;
		mostWornCategory: string;
	}[];
}

export interface UsageStats {
	neverWorn: number;
	leftToWear: number;
	itemsWornMultipleTimes: number;
	repeatPercentage: number;
	costPerWear: {
		average: number;
		mostEfficient: WardrobeItem;
		leastEfficient: WardrobeItem;
	};
}

export interface SustainabilityStats {
	totalInvestment: number;
	averageCostPerItem: number;
	sustainabilityScore: number;
	co2SavedFromRewearing: number;
}

export interface AnalyticsData {
	totalItems: number;
	categoryStats: CategoryStats;
	wearStats: WearStats;
	timeBasedStats: TimeBasedStats;
	usageStats: UsageStats;
	sustainabilityStats: SustainabilityStats;
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
	efficiency: number;
}

export interface UsageTrendData {
	period: string;
	count: number;
	category?: string;
}

export interface SeasonalData {
	season: string;
	items: number;
	spending: number;
}

// User preferences and AI-related types
export interface StylePreference {
	id: string;
	name: string;
	weight: number; // 0-1 preference strength
}

export interface FitPreference {
	bodyType: string;
	preferredFit: "loose" | "fitted" | "regular";
	sizingNotes?: string;
}

export interface WeatherPreference {
	temperature: number;
	preferredLayers: number;
	weatherSensitivity: "low" | "medium" | "high";
}

// Profile-related types
export interface ProfileData {
	username: string;
	stylePreferences: string[];
	favoriteBrands: string[];
	bodyType: string;
	preferredCurrency: string;
	preferredSizeSystem: string;
	sizeLabel: string;
	consent_storeBodyMetrics: boolean;
	consent_shareReviewsPublic: boolean;
}

export interface BodyMeasurements {
	heightCm: number | undefined;
	weightKg: number | undefined;
	bustCm: number | undefined;
	waistCm: number | undefined;
	hipsCm: number | undefined;
	inseamCm: number | undefined;
	shoulderCm: number | undefined;
	neckCm: number | undefined;
	notes: string;
}

export interface ProfileModalProps {
	children?: React.ReactNode;
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}
