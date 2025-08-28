"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, RotateCcw, Settings, Heart } from "lucide-react";
import { wardrobeData, WARDROBE_CATEGORIES, USER_PROFILE } from "@/data";
import {
	TodaysRecommendationCard,
	WardrobeItemCard,
	OutfitCard,
	AnalyticsCard,
	WeeklyPlanCard,
} from "@/components/wardrobe";

// Use imported data
const wardrobeItems = wardrobeData;

export default function WardrobePage() {
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

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
			{/* Welcome Section with Today's Outfit */}
			<div className="mb-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						<h2 className="text-3xl font-bold text-foreground mb-2">
							Welcome back, John!
						</h2>
						<p className="text-muted-foreground mb-6">
							Manage your wardrobe and create amazing outfits.
						</p>

						{/* Day Switcher */}
						<div className="mb-6">
							<div className="flex items-center gap-2 mb-3">
								<Calendar className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm font-medium text-muted-foreground">
									View outfit for:
								</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{wardrobeItems.weeklyPlan.map((dayPlan) => (
									<Button
										key={dayPlan.day}
										variant={
											selectedDay === dayPlan.day
												? "default"
												: "outline"
										}
										size="sm"
										onClick={() =>
											setSelectedDay(dayPlan.day)
										}
										className="text-xs"
									>
										<div className="flex flex-col items-center">
											<span className="font-medium">
												{dayPlan.day.slice(0, 3)}
											</span>
											<span className="text-xs opacity-70">
												{dayPlan.date.split("-")[2]}
											</span>
										</div>
									</Button>
								))}
							</div>
						</div>

						<TodaysRecommendationCard
							selectedDay={selectedDay}
							selectedDayOutfit={selectedDayOutfit}
						/>
					</div>

					{/* Compact Analytics */}
					<div className="space-y-4">
						<AnalyticsCard wardrobeItems={wardrobeItems} />

						{/* Weekly Progress */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">
									This Week
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex justify-between text-sm">
										<span>Outfits Planned</span>
										<span className="font-medium">5/7</span>
									</div>
									<div className="w-full bg-muted rounded-full h-2">
										<div
											className="bg-primary h-2 rounded-full"
											style={{ width: "71%" }}
										></div>
									</div>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>Avg Confidence: 89%</span>
										<span>3 Versatile Pieces</span>
									</div>
								</div>
							</CardContent>
						</Card>
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
					{/* Category Filter */}
					<div className="flex space-x-2">
						{categories.map((category) => (
							<Button
								key={category}
								variant={
									selectedCategory === category
										? "default"
										: "outline"
								}
								size="sm"
								onClick={() => setSelectedCategory(category)}
							>
								{category}
							</Button>
						))}
					</div>

					{/* Items Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredItems.map((item) => (
							<WardrobeItemCard key={item.id} item={item} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="outfits" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{wardrobeItems.outfits.map((outfit) => (
							<OutfitCard key={outfit.id} outfit={outfit} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="weekly" className="space-y-6">
					<div className="mb-6">
						<h3 className="text-xl font-semibold text-foreground mb-2">
							This Week's Outfit Recommendations
						</h3>
						<p className="text-muted-foreground">
							AI-powered outfit suggestions based on your
							schedule, weather, and style preferences
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{wardrobeItems.weeklyPlan.map((dayPlan) => (
							<WeeklyPlanCard
								key={dayPlan.day}
								dayPlan={dayPlan}
							/>
						))}
					</div>

					{/* Simplified Weekly Overview */}
					<Card className="mt-6">
						<CardHeader>
							<CardTitle className="text-lg">
								Weekly Overview
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center p-3 bg-primary/5 rounded-lg">
									<div className="text-xl font-bold text-foreground">
										7
									</div>
									<p className="text-xs text-muted-foreground">
										Days Planned
									</p>
								</div>
								<div className="text-center p-3 bg-green-50 rounded-lg">
									<div className="text-xl font-bold text-foreground">
										89%
									</div>
									<p className="text-xs text-muted-foreground">
										Avg Confidence
									</p>
								</div>
								<div className="text-center p-3 bg-blue-50 rounded-lg">
									<div className="text-xl font-bold text-foreground">
										12
									</div>
									<p className="text-xs text-muted-foreground">
										Items Used
									</p>
								</div>
								<div className="text-center p-3 bg-yellow-50 rounded-lg">
									<div className="text-xl font-bold text-foreground">
										3
									</div>
									<p className="text-xs text-muted-foreground">
										Versatile Pieces
									</p>
								</div>
							</div>
							<div className="mt-4 flex gap-2">
								<Button
									variant="outline"
									size="sm"
									className="flex-1"
								>
									<RotateCcw className="w-4 h-4 mr-2" />
									Regenerate Week
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="flex-1"
								>
									<Settings className="w-4 h-4 mr-2" />
									Preferences
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="wishlist" className="space-y-6">
					<div className="text-center py-12">
						<div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
							<Heart className="w-12 h-12 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold mb-2">
							Your wishlist is empty
						</h3>
						<p className="text-muted-foreground mb-4">
							Start adding items you'd like to purchase
						</p>
						<Button>Browse Shop</Button>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
