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
				"wardrobe_1", // Classic White Button-Down
				"wardrobe_3", // Black Blazer
				"wardrobe_6", // High-Waisted Trousers
				"wardrobe_8", // Black Heels
				"wardrobe_9", // Gold Watch
			],
			confidence: 95,
			reason: "Perfect for important meetings and presentations",
			aiGenerated: true,
			compatibilityScore: 0.95,
		},
		alternatives: [
			{
				name: "Smart Casual Alternative",
				items: [
					"wardrobe_4", // Striped Long Sleeve Tee
					"wardrobe_3", // Black Blazer
					"wardrobe_2", // Dark Wash Skinny Jeans
					"wardrobe_7", // White Sneakers
				],
				confidence: 80,
				substituteFor: "wardrobe_1",
			},
		],
		weatherConditions: {
			temperature: 22,
			condition: "sunny",
			humidity: 45,
			precipitation: 0,
		},
		calendarEvents: [
			{
				title: "Team Meeting",
				time: "9:00 AM",
				type: "work",
			},
			{
				title: "Client Presentation",
				time: "2:00 PM",
				type: "formal",
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
			items: [
				"wardrobe_4", // Striped Long Sleeve Tee
				"wardrobe_2", // Dark Wash Skinny Jeans
				"wardrobe_7", // White Sneakers
			],
			confidence: 90,
			reason: "Comfortable for casual work and social activities",
			aiGenerated: true,
			compatibilityScore: 0.88,
		},
		alternatives: [
			{
				name: "Layered Look",
				items: [
					"wardrobe_1", // Classic White Button-Down
					"wardrobe_5", // Wool Coat
					"wardrobe_2", // Dark Wash Skinny Jeans
				],
				confidence: 75,
				substituteFor: "wardrobe_4",
			},
		],
		weatherConditions: {
			temperature: 18,
			condition: "cloudy",
			humidity: 65,
			precipitation: 10,
		},
		calendarEvents: [
			{
				title: "Casual Team Sync",
				time: "10:00 AM",
				type: "casual",
			},
			{
				title: "Coffee with Friends",
				time: "4:00 PM",
				type: "casual",
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
			items: [
				"wardrobe_4", // Striped Long Sleeve Tee
				"wardrobe_2", // Dark Wash Skinny Jeans
			],
			confidence: 85,
			reason: "Comfortable for video calls and home productivity",
			aiGenerated: true,
			compatibilityScore: 0.85,
		},
		alternatives: [],
		weatherConditions: {
			temperature: 15,
			condition: "rainy",
			humidity: 85,
			precipitation: 80,
		},
		calendarEvents: [
			{
				title: "Working from Home",
				time: "9:00 AM",
				type: "work",
			},
		],
	},
	{
		day: "Thursday",
		date: "2025-08-28",
		weather: "Partly Cloudy, 20°C",
		schedule: ["11:00 AM - Department Meeting", "6:00 PM - Dinner Date"],
		recommendedOutfit: {
			name: "Day to Night",
			items: [
				"wardrobe_1", // Classic White Button-Down
				"wardrobe_3", // Black Blazer
				"wardrobe_6", // High-Waisted Trousers
				"wardrobe_8", // Black Heels
				"wardrobe_10", // Silk Scarf
			],
			confidence: 92,
			reason: "Versatile enough for work and can transition to evening",
			aiGenerated: true,
			compatibilityScore: 0.91,
		},
		alternatives: [
			{
				name: "Chic Alternative",
				items: [
					"wardrobe_4", // Striped Long Sleeve Tee
					"wardrobe_5", // Wool Coat
					"wardrobe_6", // High-Waisted Trousers
					"wardrobe_8", // Black Heels
				],
				confidence: 78,
				substituteFor: "wardrobe_1",
			},
		],
		weatherConditions: {
			temperature: 20,
			condition: "cloudy",
			humidity: 55,
			precipitation: 20,
		},
		calendarEvents: [
			{
				title: "Department Meeting",
				time: "11:00 AM",
				type: "work",
			},
			{
				title: "Dinner Date",
				time: "6:00 PM",
				type: "formal",
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
			items: [
				"wardrobe_4", // Striped Long Sleeve Tee
				"wardrobe_2", // Dark Wash Skinny Jeans
				"wardrobe_7", // White Sneakers
			],
			confidence: 88,
			reason: "Perfect for relaxed work atmosphere and after-work socializing",
			aiGenerated: true,
			compatibilityScore: 0.87,
		},
		alternatives: [
			{
				name: "Smart Casual",
				items: [
					"wardrobe_1", // Classic White Button-Down
					"wardrobe_2", // Dark Wash Skinny Jeans
					"wardrobe_7", // White Sneakers
				],
				confidence: 82,
				substituteFor: "wardrobe_4",
			},
		],
		weatherConditions: {
			temperature: 25,
			condition: "sunny",
			humidity: 40,
			precipitation: 0,
		},
		calendarEvents: [
			{
				title: "Casual Friday",
				time: "9:00 AM",
				type: "casual",
			},
			{
				title: "Happy Hour",
				time: "7:00 PM",
				type: "casual",
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
			items: [
				"wardrobe_4", // Striped Long Sleeve Tee
				"wardrobe_2", // Dark Wash Skinny Jeans
				"wardrobe_7", // White Sneakers
			],
			confidence: 90,
			reason: "Comfortable for walking and stylish for social activities",
			aiGenerated: true,
			compatibilityScore: 0.89,
		},
		alternatives: [],
		weatherConditions: {
			temperature: 27,
			condition: "sunny",
			humidity: 35,
			precipitation: 0,
		},
		calendarEvents: [
			{
				title: "Brunch",
				time: "10:00 AM",
				type: "casual",
			},
			{
				title: "Shopping",
				time: "3:00 PM",
				type: "casual",
			},
		],
	},
	{
		day: "Sunday",
		date: "2025-08-31",
		weather: "Cloudy, 19°C",
		schedule: ["Relaxation Day", "2:00 PM - Family Visit"],
		recommendedOutfit: {
			name: "Cozy Comfort",
			items: [
				"wardrobe_4", // Striped Long Sleeve Tee
				"wardrobe_2", // Dark Wash Skinny Jeans
				"wardrobe_7", // White Sneakers
			],
			confidence: 85,
			reason: "Comfortable for relaxing and appropriate for family time",
			aiGenerated: true,
			compatibilityScore: 0.84,
		},
		alternatives: [
			{
				name: "Polished Casual",
				items: [
					"wardrobe_1", // Classic White Button-Down
					"wardrobe_2", // Dark Wash Skinny Jeans
					"wardrobe_7", // White Sneakers
				],
				confidence: 75,
				substituteFor: "wardrobe_4",
			},
		],
		weatherConditions: {
			temperature: 19,
			condition: "cloudy",
			humidity: 60,
			precipitation: 30,
		},
		calendarEvents: [
			{
				title: "Relaxation Day",
				time: "9:00 AM",
				type: "casual",
			},
			{
				title: "Family Visit",
				time: "2:00 PM",
				type: "casual",
			},
		],
	},
];
