// Categories for filtering wardrobe items
export const WARDROBE_CATEGORIES = [
	"Shirts",
	"Pants",
	"Jackets",
	"Shoes",
	"Accessories",
] as const;

// User profile data
export const USER_PROFILE = {
	name: "John Doe",
	email: "john@example.com",
	avatar: "/api/placeholder/32/32",
	initials: "JD",
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

export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
