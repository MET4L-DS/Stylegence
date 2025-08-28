import { DayPlan } from "./types";

export const weeklyPlan: DayPlan[] = [
	{
		day: "Monday",
		date: "2025-08-25",
		weather: "Sunny, 22°C",
		schedule: ["9:00 AM - Team Meeting", "2:00 PM - Client Presentation"],
		recommendedOutfit: {
			name: "Professional Power",
			items: [
				"Classic White Button-Down",
				"Black Blazer",
				"High-Waisted Trousers",
			],
			confidence: 95,
			reason: "Perfect for important meetings and presentations",
		},
		alternatives: [
			{
				name: "Smart Casual",
				items: [
					"Striped Long Sleeve Tee",
					"Black Blazer",
					"Dark Wash Skinny Jeans",
				],
				confidence: 80,
			},
		],
	},
	{
		day: "Tuesday",
		date: "2025-08-26",
		weather: "Cloudy, 18°C",
		schedule: [
			"10:00 AM - Casual Team Sync",
			"4:00 PM - Coffee with Friends",
		],
		recommendedOutfit: {
			name: "Casual Comfort",
			items: ["Striped Long Sleeve Tee", "Dark Wash Skinny Jeans"],
			confidence: 90,
			reason: "Comfortable for casual work and social activities",
		},
		alternatives: [
			{
				name: "Layered Look",
				items: [
					"Classic White Button-Down",
					"Wool Coat",
					"Dark Wash Skinny Jeans",
				],
				confidence: 75,
			},
		],
	},
	{
		day: "Wednesday",
		date: "2025-08-27",
		weather: "Rainy, 15°C",
		schedule: ["Working from Home"],
		recommendedOutfit: {
			name: "Cozy WFH",
			items: ["Striped Long Sleeve Tee", "Dark Wash Skinny Jeans"],
			confidence: 85,
			reason: "Comfortable for video calls and home productivity",
		},
		alternatives: [],
	},
	{
		day: "Thursday",
		date: "2025-08-28",
		weather: "Partly Cloudy, 20°C",
		schedule: ["11:00 AM - Department Meeting", "6:00 PM - Dinner Date"],
		recommendedOutfit: {
			name: "Day to Night",
			items: [
				"Classic White Button-Down",
				"Black Blazer",
				"High-Waisted Trousers",
			],
			confidence: 92,
			reason: "Versatile enough for work and can transition to evening",
		},
		alternatives: [
			{
				name: "Chic Alternative",
				items: [
					"Striped Long Sleeve Tee",
					"Wool Coat",
					"High-Waisted Trousers",
				],
				confidence: 78,
			},
		],
	},
	{
		day: "Friday",
		date: "2025-08-29",
		weather: "Sunny, 25°C",
		schedule: ["Casual Friday", "7:00 PM - Happy Hour"],
		recommendedOutfit: {
			name: "Casual Friday",
			items: ["Striped Long Sleeve Tee", "Dark Wash Skinny Jeans"],
			confidence: 88,
			reason: "Perfect for relaxed work atmosphere and after-work socializing",
		},
		alternatives: [
			{
				name: "Smart Casual",
				items: ["Classic White Button-Down", "Dark Wash Skinny Jeans"],
				confidence: 82,
			},
		],
	},
	{
		day: "Saturday",
		date: "2025-08-30",
		weather: "Sunny, 27°C",
		schedule: ["10:00 AM - Brunch", "3:00 PM - Shopping"],
		recommendedOutfit: {
			name: "Weekend Chic",
			items: ["Striped Long Sleeve Tee", "Dark Wash Skinny Jeans"],
			confidence: 90,
			reason: "Comfortable for walking and stylish for social activities",
		},
		alternatives: [],
	},
	{
		day: "Sunday",
		date: "2025-08-31",
		weather: "Cloudy, 19°C",
		schedule: ["Relaxation Day", "2:00 PM - Family Visit"],
		recommendedOutfit: {
			name: "Cozy Comfort",
			items: ["Striped Long Sleeve Tee", "Dark Wash Skinny Jeans"],
			confidence: 85,
			reason: "Comfortable for relaxing and appropriate for family time",
		},
		alternatives: [
			{
				name: "Polished Casual",
				items: ["Classic White Button-Down", "Dark Wash Skinny Jeans"],
				confidence: 75,
			},
		],
	},
];
