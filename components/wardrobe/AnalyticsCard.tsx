import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	calculateConvexAnalytics,
	getItemDisplayName,
	getItemBrand,
	type ConvexWardrobeItem,
} from "@/lib/convex-analytics";
import {
	BarChart3,
	Tag,
	CheckCircle,
	Calendar,
	RotateCcw,
	User,
	Shield,
	Palette,
	Clock,
	Sparkles,
	TrendingUp,
	Scale,
	DollarSign,
	Leaf,
	Target,
	Activity,
	Zap,
	Heart,
	Award,
} from "lucide-react";

interface AnalyticsCardProps {
	wardrobeItems: ConvexWardrobeItem[];
	userPreferences?: {
		stylePreferences?: string[];
		bodyType?: string;
		favoriteBrands?: string[];
		preferredCurrency?: string;
		name?: string;
	} | null;
}

export function AnalyticsCard({
	wardrobeItems,
	userPreferences,
}: AnalyticsCardProps) {
	// Calculate all analytics using the Convex analytics module
	const analytics = calculateConvexAnalytics(wardrobeItems);
	const {
		totalItems,
		categoryStats,
		wearStats,
		timeBasedStats,
		usageStats,
		sustainabilityStats,
	} = analytics;

	const StatItem = ({
		icon,
		label,
		value,
		subtitle,
	}: {
		icon: React.ReactNode;
		label: string;
		value: string | number;
		subtitle?: string;
	}) => (
		<div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors min-w-0">
			<div className="flex items-center gap-3 min-w-0 flex-1">
				<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
					{icon}
				</div>
				<div className="min-w-0 flex-1">
					<span className="text-sm font-medium block truncate">
						{label}
					</span>
					{subtitle && (
						<p className="text-xs text-muted-foreground truncate">
							{subtitle}
						</p>
					)}
				</div>
			</div>
			<span className="font-bold text-sm sm:text-base ml-2 flex-shrink-0 text-right">
				{typeof value === "string" && value.length > 8 ? (
					<span className="text-xs">{value}</span>
				) : (
					value
				)}
			</span>
		</div>
	);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<BarChart3 className="w-5 h-5" />
					Wardrobe Analytics
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="categories">Categories</TabsTrigger>
						<TabsTrigger value="usage">Usage</TabsTrigger>
						<TabsTrigger value="sustainability">Impact</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4 mt-4">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
							<StatItem
								icon={<Tag className="w-4 h-4 text-primary" />}
								label="Total Items"
								value={totalItems}
								subtitle="Your complete wardrobe"
							/>
							<StatItem
								icon={
									<Activity className="w-4 h-4 text-chart-1" />
								}
								label="Weekly Active"
								value={timeBasedStats.weeklyWorn}
								subtitle="Items worn this week"
							/>
							<StatItem
								icon={
									<TrendingUp className="w-4 h-4 text-chart-2" />
								}
								label="Monthly Active"
								value={timeBasedStats.monthlyWorn}
								subtitle="Items worn this month"
							/>
							<StatItem
								icon={
									<Target className="w-4 h-4 text-chart-3" />
								}
								label="Repeat Rate"
								value={`${usageStats.repeatPercentage}%`}
								subtitle="Items worn multiple times"
							/>
							<StatItem
								icon={
									<DollarSign className="w-4 h-4 text-chart-4" />
								}
								label="Avg Cost/Wear"
								value={`$${usageStats.costPerWear.average.toFixed(2)}`}
								subtitle="Cost efficiency"
							/>
							<StatItem
								icon={<Leaf className="w-4 h-4 text-chart-5" />}
								label="Sustainability Score"
								value={`${sustainabilityStats.sustainabilityScore.toFixed(0)}%`}
								subtitle="Environmental impact"
							/>
						</div>

						{/* Personalized Insights */}
						{userPreferences && (
							<div className="bg-gradient-to-r from-primary/10 to-accent/20 rounded-lg p-4 border">
								<div className="flex items-center gap-2 mb-3">
									<Sparkles className="w-4 h-4 text-primary" />
									<span className="text-sm font-semibold text-foreground">
										Personalized Insights
									</span>
								</div>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
									{userPreferences.stylePreferences &&
										userPreferences.stylePreferences
											.length > 0 && (
											<div className="space-y-2">
												<div className="font-medium text-foreground">
													Style Match
												</div>
												<div className="flex flex-wrap gap-1">
													{userPreferences.stylePreferences
														.slice(0, 3)
														.map((style, index) => (
															<Badge
																key={index}
																variant="outline"
																className="text-xs"
															>
																{style}
															</Badge>
														))}
													{userPreferences
														.stylePreferences
														.length > 3 && (
														<Badge
															variant="outline"
															className="text-xs"
														>
															+
															{userPreferences
																.stylePreferences
																.length -
																3}{" "}
															more
														</Badge>
													)}
												</div>
											</div>
										)}
									{userPreferences.bodyType && (
										<div className="space-y-2">
											<div className="font-medium text-foreground">
												Body Type
											</div>
											<Badge variant="outline">
												{userPreferences.bodyType}
											</Badge>
										</div>
									)}
									{userPreferences.favoriteBrands &&
										userPreferences.favoriteBrands.length >
											0 && (
											<div className="space-y-2">
												<div className="font-medium text-foreground">
													Favorite Brands
												</div>
												<div className="flex flex-wrap gap-1">
													{userPreferences.favoriteBrands
														.slice(0, 2)
														.map((brand, index) => (
															<Badge
																key={index}
																variant="outline"
																className="text-xs"
															>
																{brand}
															</Badge>
														))}
													{userPreferences
														.favoriteBrands.length >
														2 && (
														<Badge
															variant="outline"
															className="text-xs"
														>
															+
															{userPreferences
																.favoriteBrands
																.length -
																2}{" "}
															more
														</Badge>
													)}
												</div>
											</div>
										)}
									{userPreferences.preferredCurrency && (
										<div className="space-y-2">
											<div className="font-medium text-foreground">
												Currency
											</div>
											<Badge variant="outline">
												{
													userPreferences.preferredCurrency
												}
											</Badge>
										</div>
									)}
								</div>
							</div>
						)}

						<div className="pt-4 border-t space-y-4">
							{/* Wear Progress */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Wardrobe Utilization
									</span>
									<Badge variant="outline">
										{totalItems - usageStats.leftToWear} /{" "}
										{totalItems} worn
									</Badge>
								</div>
								<div className="w-full bg-muted rounded-full h-3">
									<div
										className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
										style={{
											width: `${
												((totalItems -
													usageStats.leftToWear) /
													totalItems) *
												100
											}%`,
										}}
									/>
								</div>
								<div className="flex justify-between text-xs text-muted-foreground mt-1">
									<span>
										Worn:{" "}
										{totalItems - usageStats.leftToWear}
									</span>
									<span>Unworn: {usageStats.leftToWear}</span>
								</div>
							</div>

							{/* Wear Frequency Distribution */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Wear Frequency
									</span>
									<Badge variant="secondary">
										{wearStats.wearFrequency.daily +
											wearStats.wearFrequency.weekly +
											wearStats.wearFrequency
												.monthly}{" "}
										active items
									</Badge>
								</div>
								<div className="grid grid-cols-3 gap-2 text-xs">
									<div className="text-center p-2 bg-chart-1/10 rounded">
										<div className="font-bold text-chart-1">
											{wearStats.wearFrequency.daily}
										</div>
										<div className="text-muted-foreground">
											Daily
										</div>
									</div>
									<div className="text-center p-2 bg-chart-2/10 rounded">
										<div className="font-bold text-chart-2">
											{wearStats.wearFrequency.weekly}
										</div>
										<div className="text-muted-foreground">
											Weekly
										</div>
									</div>
									<div className="text-center p-2 bg-chart-3/10 rounded">
										<div className="font-bold text-chart-3">
											{wearStats.wearFrequency.monthly}
										</div>
										<div className="text-muted-foreground">
											Monthly
										</div>
									</div>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="categories" className="space-y-4 mt-4">
						<div className="grid grid-cols-1 gap-3">
							<StatItem
								icon={<User className="w-4 h-4 text-chart-1" />}
								label="Tops"
								value={categoryStats.tops}
							/>
							<StatItem
								icon={
									<Shield className="w-4 h-4 text-chart-2" />
								}
								label="Bottoms"
								value={categoryStats.bottoms}
							/>
							<StatItem
								icon={
									<Palette className="w-4 h-4 text-chart-3" />
								}
								label="Dresses"
								value={categoryStats.dresses}
							/>
							<StatItem
								icon={
									<Clock className="w-4 h-4 text-chart-4" />
								}
								label="Outerwear"
								value={categoryStats.outerwear}
							/>
							<StatItem
								icon={
									<TrendingUp className="w-4 h-4 text-chart-5" />
								}
								label="Shoes"
								value={categoryStats.shoes}
							/>
							<StatItem
								icon={
									<Sparkles className="w-4 h-4 text-primary" />
								}
								label="Accessories"
								value={categoryStats.accessories}
							/>
						</div>
					</TabsContent>

					<TabsContent value="usage" className="space-y-4 mt-4">
						<div className="space-y-3">
							<div className="p-4 rounded-lg border bg-card">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Most Worn Item
									</span>
									<Badge>
										{wearStats.mostWornItem?.wearCount || 0}{" "}
										times
									</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									{wearStats.mostWornItem
										? getItemDisplayName(
												wearStats.mostWornItem
											)
										: "No items"}
								</p>
							</div>

							<div className="p-4 rounded-lg border bg-card">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Least Worn Item
									</span>
									<Badge variant="outline">
										{wearStats.leastWornItem?.wearCount ||
											0}{" "}
										times
									</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									{wearStats.leastWornItem
										? getItemDisplayName(
												wearStats.leastWornItem
											)
										: "No items"}
								</p>
							</div>

							<StatItem
								icon={
									<TrendingUp className="w-4 h-4 text-chart-1" />
								}
								label="Total Wears"
								value={wearStats.totalWorn}
							/>

							<StatItem
								icon={
									<Scale className="w-4 h-4 text-chart-2" />
								}
								label="Average Wear"
								value={wearStats.averageWear.toFixed(1)}
								subtitle="Per item usage"
							/>
						</div>

						{/* Efficiency Insights */}
						<div className="pt-4 border-t">
							<h4 className="text-sm font-medium mb-3 flex items-center gap-2">
								<Award className="w-4 h-4" />
								Efficiency Champions
							</h4>
							<div className="space-y-3">
								{usageStats.costPerWear.mostEfficient ? (
									<div className="p-3 rounded-lg bg-chart-1/10 border">
										<div className="flex items-center justify-between mb-1 min-w-0">
											<span className="text-sm font-medium text-chart-1 truncate">
												Most Efficient
											</span>
											<Badge
												variant="secondary"
												className="text-xs flex-shrink-0 ml-2"
											>
												$
												{(
													(usageStats.costPerWear
														.mostEfficient
														.purchasePrice || 0) /
													Math.max(
														usageStats.costPerWear
															.mostEfficient
															.wearCount || 1,
														1
													)
												).toFixed(2)}
												/wear
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground truncate">
											{getItemDisplayName(
												usageStats.costPerWear
													.mostEfficient
											)}
										</p>
									</div>
								) : (
									<div className="p-3 rounded-lg bg-muted/50 border">
										<div className="flex items-center justify-between mb-1 min-w-0">
											<span className="text-sm font-medium truncate">
												Most Efficient
											</span>
											<Badge
												variant="secondary"
												className="text-xs flex-shrink-0 ml-2"
											>
												No data
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground truncate">
											No items with cost data
										</p>
									</div>
								)}

								{usageStats.costPerWear.leastEfficient ? (
									<div className="p-3 rounded-lg bg-chart-5/10 border">
										<div className="flex items-center justify-between mb-1 min-w-0">
											<span className="text-sm font-medium text-chart-5 truncate">
												Needs More Love
											</span>
											<Badge
												variant="outline"
												className="text-xs flex-shrink-0 ml-2"
											>
												$
												{(
													(usageStats.costPerWear
														.leastEfficient
														.purchasePrice || 0) /
													Math.max(
														usageStats.costPerWear
															.leastEfficient
															.wearCount || 1,
														1
													)
												).toFixed(2)}
												/wear
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground truncate">
											{getItemDisplayName(
												usageStats.costPerWear
													.leastEfficient
											)}
										</p>
									</div>
								) : (
									<div className="p-3 rounded-lg bg-muted/50 border">
										<div className="flex items-center justify-between mb-1 min-w-0">
											<span className="text-sm font-medium truncate">
												Needs More Love
											</span>
											<Badge
												variant="outline"
												className="text-xs flex-shrink-0 ml-2"
											>
												No data
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground truncate">
											No items with cost data
										</p>
									</div>
								)}
							</div>
						</div>
					</TabsContent>

					<TabsContent
						value="sustainability"
						className="space-y-4 mt-4"
					>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
							<StatItem
								icon={
									<DollarSign className="w-4 h-4 text-chart-1" />
								}
								label="Total Investment"
								value={`$${
									sustainabilityStats.totalInvestment >= 1000
										? (
												sustainabilityStats.totalInvestment /
												1000
											).toFixed(1) + "k"
										: sustainabilityStats.totalInvestment.toFixed(
												0
											)
								}`}
								subtitle="Your wardrobe value"
							/>
							<StatItem
								icon={
									<Heart className="w-4 h-4 text-chart-2" />
								}
								label="Avg Item Cost"
								value={`$${sustainabilityStats.averageCostPerItem.toFixed(0)}`}
								subtitle="Average purchase price"
							/>
							<StatItem
								icon={<Leaf className="w-4 h-4 text-chart-3" />}
								label="Sustainability Score"
								value={`${sustainabilityStats.sustainabilityScore.toFixed(0)}%`}
								subtitle="Environmental impact rating"
							/>
							<StatItem
								icon={<Zap className="w-4 h-4 text-chart-4" />}
								label="CO₂ Saved"
								value={`${
									sustainabilityStats.co2SavedFromRewearing >=
									1000
										? (
												sustainabilityStats.co2SavedFromRewearing /
												1000
											).toFixed(1) + "t"
										: sustainabilityStats.co2SavedFromRewearing.toFixed(
												0
											) + "kg"
								}`}
								subtitle="From re-wearing items"
							/>
						</div>

						{/* Sustainability Progress */}
						<div className="pt-4 border-t">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">
									Sustainability Progress
								</span>
								<Badge
									variant={
										sustainabilityStats.sustainabilityScore >=
										70
											? "default"
											: "secondary"
									}
								>
									{sustainabilityStats.sustainabilityScore >=
									70
										? "Excellent"
										: sustainabilityStats.sustainabilityScore >=
											  50
											? "Good"
											: "Room for Improvement"}
								</Badge>
							</div>
							<div className="w-full bg-muted rounded-full h-3">
								<div
									className="h-3 rounded-full transition-all bg-gradient-to-r from-primary to-chart-1"
									style={{
										width: `${Math.min(sustainabilityStats.sustainabilityScore, 100)}%`,
									}}
								/>
							</div>
							<div className="flex justify-between text-xs text-muted-foreground mt-1">
								<span>
									Current:{" "}
									{sustainabilityStats.sustainabilityScore.toFixed(
										0
									)}
									%
								</span>
								<span>Target: 70%+</span>
							</div>
						</div>

						{/* Environmental Impact */}
						<div className="pt-4 border-t">
							<h4 className="text-sm font-medium mb-3 flex items-center gap-2">
								<Leaf className="w-4 h-4" />
								Environmental Impact
							</h4>
							<div className="grid grid-cols-2 gap-3">
								<div className="text-center p-3 bg-chart-1/10 rounded-lg border min-w-0">
									<div className="text-base sm:text-lg font-bold text-chart-1 break-words">
										{(() => {
											const co2Value = Math.max(
												0,
												sustainabilityStats.co2SavedFromRewearing
											);
											if (co2Value >= 1000) {
												return `${(co2Value / 1000).toFixed(1)}t`;
											}
											return `${co2Value.toFixed(0)}kg`;
										})()}
									</div>
									<p className="text-xs text-muted-foreground">
										CO₂ Prevented
									</p>
								</div>
								<div className="text-center p-3 bg-chart-2/10 rounded-lg border min-w-0">
									<div className="text-base sm:text-lg font-bold text-chart-2 break-words">
										{Math.floor(
											sustainabilityStats.co2SavedFromRewearing /
												33
										)}
									</div>
									<p className="text-xs text-muted-foreground">
										Items Not Bought
									</p>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
