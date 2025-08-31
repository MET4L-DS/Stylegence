"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { wardrobeData, WARDROBE_CATEGORIES } from "@/data";
import {
	TodaysRecommendationCard,
	AnalyticsCard,
	DaySwitcher,
	WeeklyProgress,
	WeeklyOverview,
	CategoryFilter,
	EmptyWishlist,
	WardrobeGrid,
	OutfitGrid,
	WeeklyPlanGrid,
	WelcomeSection,
} from "@/components/wardrobe";

// Use imported data (will be replaced with Convex data in future)
const wardrobeItems = wardrobeData;

export default function WardrobePage() {
	const { user: clerkUser } = useUser();
	const convexUser = useQuery(api.users.current);

	const [activeTab, setActiveTab] = useState("all");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedDay, setSelectedDay] = useState("Wednesday"); // Default to today

	const categories = ["All", ...WARDROBE_CATEGORIES];

	const filteredItems =
		selectedCategory === "All"
			? wardrobeItems.all
			: wardrobeItems.all.filter(
					(item) => item.category === selectedCategory
				);

	// Get selected day's outfit data
	const selectedDayOutfit =
		wardrobeItems.weeklyPlan.find(
			(dayPlan) => dayPlan.day === selectedDay
		) ||
		wardrobeItems.weeklyPlan.find((dayPlan) => dayPlan.day === "Wednesday"); // Fallback to Wednesday

	// Show loading state while user data is loading
	if (!clerkUser || convexUser === undefined) {
		return (
			<div className="flex items-center justify-center min-h-96">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading wardrobe...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
			{/* Welcome Section with Today's Outfit */}
			<div className="mb-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<WelcomeSection
						userName={
							convexUser?.username ||
							convexUser?.name ||
							clerkUser?.firstName ||
							"there"
						}
						subtitle="Manage your wardrobe and create amazing outfits tailored to your style."
					>
						<DaySwitcher
							weeklyPlan={wardrobeItems.weeklyPlan}
							selectedDay={selectedDay}
							onDaySelect={setSelectedDay}
						/>
						<TodaysRecommendationCard
							selectedDay={selectedDay}
							selectedDayOutfit={selectedDayOutfit}
							userPreferences={convexUser}
						/>
					</WelcomeSection>

					{/* Compact Analytics */}
					<div className="space-y-4">
						<AnalyticsCard
							wardrobeItems={wardrobeItems}
							userPreferences={convexUser}
						/>
						<WeeklyProgress />
					</div>
				</div>
			</div>

			{/* Wardrobe Management */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-6"
			>
				<div className="flex justify-between items-center">
					<TabsList>
						<TabsTrigger value="all">All Items</TabsTrigger>
						<TabsTrigger value="outfits">Saved Outfits</TabsTrigger>
						<TabsTrigger value="weekly">Weekly Planner</TabsTrigger>
						<TabsTrigger value="wishlist">Wishlist</TabsTrigger>
					</TabsList>

					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Add Item
					</Button>
				</div>

				<TabsContent value="all" className="space-y-6">
					<CategoryFilter
						selectedCategory={selectedCategory}
						onCategorySelect={setSelectedCategory}
						categories={categories}
					/>

					<WardrobeGrid items={filteredItems} />
				</TabsContent>

				<TabsContent value="outfits" className="space-y-6">
					<OutfitGrid outfits={wardrobeItems.outfits} />
				</TabsContent>

				<TabsContent value="weekly" className="space-y-6">
					<WeeklyOverview />
					<WeeklyPlanGrid weeklyPlan={wardrobeItems.weeklyPlan} />
				</TabsContent>

				<TabsContent value="wishlist" className="space-y-6">
					<EmptyWishlist />
				</TabsContent>
			</Tabs>
		</div>
	);
}
