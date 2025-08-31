// Categories for filtering wardrobe items (aligned with schema)
export const WARDROBE_CATEGORIES = [
	"tops",
	"bottoms",
	"dresses",
	"outerwear",
	"shoes",
	"accessories",
] as const;

// Extended categories for detailed classification
export const DETAILED_CATEGORIES = {
	tops: ["shirts", "blouses", "t-shirts", "sweaters", "hoodies", "tank-tops"],
	bottoms: ["jeans", "trousers", "shorts", "skirts", "leggings"],
	dresses: [
		"casual-dresses",
		"formal-dresses",
		"cocktail-dresses",
		"maxi-dresses",
	],
	outerwear: ["jackets", "coats", "blazers", "cardigans", "vests"],
	shoes: ["sneakers", "boots", "heels", "flats", "sandals", "loafers"],
	accessories: ["bags", "jewelry", "belts", "scarves", "hats", "watches"],
} as const;

// Brands supported in the system
export const SUPPORTED_BRANDS = [
	"StyleSense",
	"Denim Co",
	"Basic Wear",
	"Urban Style",
	"Classic Collection",
	"Trendy Fashion",
	"Luxury Label",
	"Sustainable Style",
	"Athletic Wear",
	"Vintage Collection",
] as const;

// Color palette for items
export const COLOR_PALETTE = [
	"White",
	"Black",
	"Gray",
	"Navy",
	"Blue",
	"Red",
	"Green",
	"Brown",
	"Beige",
	"Pink",
	"Purple",
	"Yellow",
	"Orange",
	"Maroon",
	"Teal",
] as const;

// User profile data
export const USER_PROFILE = {
	name: "Alex Chen",
	email: "alex@example.com",
	avatar: "/api/placeholder/32/32",
	initials: "AC",
	userId: "user_123",
	stylePreferences: ["minimalist", "athleisure", "trendy"],
	bodyType: "athletic",
	preferredSizeSystem: "US",
	favoriteBrands: ["Nike", "Zara", "StyleSense"],
	preferredCurrency: "USD",
} as const;

// Days of the week
export const DAYS_OF_WEEK = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
] as const;

// Weather conditions
export const WEATHER_CONDITIONS = [
	"sunny",
	"cloudy",
	"rainy",
	"snowy",
	"windy",
	"stormy",
] as const;

// Occasion types
export const OCCASION_TYPES = [
	"work",
	"casual",
	"formal",
	"date",
	"sport",
	"travel",
	"party",
	"meeting",
] as const;

// Source types for wardrobe items
export const SOURCE_TYPES = ["CATALOG", "USER_UPLOADED"] as const;

// Visibility levels
export const VISIBILITY_LEVELS = [
	"private",
	"family",
	"friends",
	"public",
] as const;

export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
export type WeatherCondition = (typeof WEATHER_CONDITIONS)[number];
export type OccasionType = (typeof OCCASION_TYPES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];
export type VisibilityLevel = (typeof VISIBILITY_LEVELS)[number];
