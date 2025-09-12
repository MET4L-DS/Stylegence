"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar } from "lucide-react";
import { WARDROBE_CATEGORIES } from "@/data";
import {
	TodaysRecommendationCard,
	AnalyticsCard,
	WeeklyProgress,
	WeeklyOverview,
	CategoryFilter,
	EmptyWishlist,
	WardrobeGrid,
	OutfitGrid,
	WeeklyPlanGrid,
	WelcomeSection,
	AddItemModal,
	WardrobeMigrationPanel,
} from "@/components/wardrobe";

export default function WardrobePage() {
	const { user: clerkUser } = useUser();
	const convexUser = useQuery(api.users.current);
	const wardrobeSummary = useQuery(api.wardrobeItems.getWardrobeSummary);
	const convexWardrobeItems = useQuery(
		api.wardrobeItems.getUserWardrobeItems
	);

	const [activeTab, setActiveTab] = useState("all");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedDay, setSelectedDay] = useState("Wednesday"); // Default to today
	const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

	const categories = ["All", ...WARDROBE_CATEGORIES];

	// Use Convex data if available, fallback to static data for other features
	const wardrobeItems = convexWardrobeItems || [];

	// Transform Convex data to match expected interface
	const transformedWardrobeItems = wardrobeItems.map((item) => ({
		id: item._id,
		userId: item.userId,
		productVariantId: item.productVariantId,
		sourceType: item.sourceType as "CATALOG" | "USER_UPLOADED",
		customName: item.customName,
		addedDate: item.addedDate,
		purchasePrice: item.purchasePrice,
		purchaseCurrency: item.purchaseCurrency,
		imageUrl: item.imageUrl,
		aiCategory: item.aiCategory,
		aiTags: item.aiTags,
		dominantColors: item.dominantColors,
		visibility: item.visibility as
			| "private"
			| "family"
			| "friends"
			| "public"
			| undefined,
		addedAt: item.addedAt,
		lastWornAt: item.lastWornAt,
		wearCount: item.wearCount,

		// Display fields for compatibility with WardrobeGrid
		name: item.customName || "Untitled Item",
		category: item.aiCategory || "uncategorized",
		color: item.dominantColors?.[0] || "Unknown",
		brand:
			item.aiTags
				?.find((tag) => tag.startsWith("brand:"))
				?.replace("brand:", "") || "Unknown",
		image: item.imageUrl || undefined,
		tags:
			item.aiTags?.filter(
				(tag) =>
					!tag.startsWith("brand:") &&
					!tag.startsWith("size:") &&
					!tag.startsWith("notes:")
			) || [],
		timesWorn: item.wearCount || 0,
		lastWorn: item.lastWornAt
			? new Date(item.lastWornAt).toISOString().split("T")[0]
			: undefined,
		purchaseDate: item.addedDate
			? new Date(item.addedDate).toISOString().split("T")[0]
			: undefined,
	}));

	const filteredItems =
		selectedCategory === "All"
			? transformedWardrobeItems
			: transformedWardrobeItems.filter(
					(item) => item.category === selectedCategory
				);

	// Show loading state while user data is loading
	if (
		!clerkUser ||
		convexUser === undefined ||
		convexWardrobeItems === undefined
	) {
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
		<div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
			{/* Hero Section - 2D Grid Layout */}
			<div className="hero-grid">
				{/* Welcome Section - Spans 2 columns on large screens */}
				<div className="welcome-area">
					<WelcomeSection
						userName={
							convexUser?.username ||
							convexUser?.name ||
							clerkUser?.firstName ||
							"there"
						}
						subtitle="Manage your wardrobe and create amazing outfits tailored to your style."
					/>
				</div>

				{/* Day Selector - Full width bar */}
				<div className="day-selector-area">
					<div className="bg-card border rounded-lg p-4">
						<div className="flex items-center gap-2 mb-3">
							<Calendar className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm font-medium text-muted-foreground">
								View outfit for:
							</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{[
								"Monday",
								"Tuesday",
								"Wednesday",
								"Thursday",
								"Friday",
								"Saturday",
								"Sunday",
							].map((day) => (
								<Button
									key={day}
									variant={
										selectedDay === day
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() => setSelectedDay(day)}
									className="min-w-[80px]"
								>
									{day}
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* Today's Recommendation - Large card */}
				<div className="recommendation-area">
					<TodaysRecommendationCard
						selectedDay={selectedDay}
						userPreferences={convexUser}
					/>
				</div>

				{/* Analytics Card - Right column */}
				<div className="analytics-area">
					<AnalyticsCard
						wardrobeItems={wardrobeItems}
						userPreferences={convexUser}
					/>
				</div>

				{/* Weekly Progress - Bottom right */}
				<div className="progress-area">
					<WeeklyProgress />
				</div>
			</div>

			{/* Wardrobe Management */}
			<div className="mt-8">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-6"
				>
					<div className="flex justify-between items-center">
						<TabsList>
							<TabsTrigger value="all">All Items</TabsTrigger>
							<TabsTrigger value="outfits">
								Saved Outfits
							</TabsTrigger>
							<TabsTrigger value="weekly">
								Weekly Planner
							</TabsTrigger>
							<TabsTrigger value="wishlist">Wishlist</TabsTrigger>
						</TabsList>

						<div className="flex gap-3 items-center">
							{/* Debug Info */}
							{wardrobeSummary && (
								<div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
									Items: {wardrobeSummary.totalItems} | IDs:{" "}
									{wardrobeSummary.userWardrobeItemIdsCount} |
									{wardrobeSummary.itemsMatch ? " ✓" : " ❌"}
								</div>
							)}

							<Button onClick={() => setIsAddItemModalOpen(true)}>
								<Plus className="w-4 h-4 mr-2" />
								Add Item
							</Button>
						</div>
					</div>

					<TabsContent value="all" className="space-y-6">
						<CategoryFilter
							selectedCategory={selectedCategory}
							onCategorySelect={setSelectedCategory}
							categories={categories}
						/>

						{transformedWardrobeItems.length === 0 ? (
							<div className="space-y-8">
								<div className="text-center py-12">
									<h3 className="text-lg font-semibold mb-2">
										Your wardrobe is empty
									</h3>
									<p className="text-muted-foreground mb-6">
										Start by uploading sample items or
										adding your own clothing pieces
									</p>
								</div>
								<WardrobeMigrationPanel />
							</div>
						) : (
							<WardrobeGrid items={filteredItems} />
						)}
					</TabsContent>

					<TabsContent value="outfits" className="space-y-6">
						<OutfitGrid />
					</TabsContent>

					<TabsContent value="weekly" className="space-y-6">
						<WeeklyOverview />
						<WeeklyPlanGrid />
					</TabsContent>

					<TabsContent value="wishlist" className="space-y-6">
						<EmptyWishlist />
					</TabsContent>
				</Tabs>
			</div>

			{/* Add Item Modal */}
			<AddItemModal
				open={isAddItemModalOpen}
				onOpenChange={setIsAddItemModalOpen}
			/>
		</div>
	);
}
