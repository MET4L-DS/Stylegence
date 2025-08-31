import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WardrobeData, calculateAnalytics } from "@/data";
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
	wardrobeItems: WardrobeData;
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
	// Calculate all analytics using the data module
	const analytics = calculateAnalytics(wardrobeItems);
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
		color = "primary",
		subtitle,
	}: {
		icon: React.ReactNode;
		label: string;
		value: string | number;
		color?: string;
		subtitle?: string;
	}) => (
		<div className="flex items-center justify-between p-3 rounded-lg border bg-background/50 dark:bg-gray-900/50 hover:bg-accent/50 transition-colors min-w-0">
			<div className="flex items-center gap-3 min-w-0 flex-1">
				<div
					className={`w-8 h-8 bg-${color}-100 dark:bg-${color}-900/20 rounded-full flex items-center justify-center flex-shrink-0`}
				>
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
								icon={<Tag className="w-4 h-4 text-blue-600" />}
								label="Total Items"
								value={totalItems}
								color="blue"
								subtitle="Your complete wardrobe"
							/>
							<StatItem
								icon={
									<Activity className="w-4 h-4 text-green-600" />
								}
								label="Weekly Active"
								value={timeBasedStats.weeklyWorn}
								color="green"
								subtitle="Items worn this week"
							/>
							<StatItem
								icon={
									<TrendingUp className="w-4 h-4 text-purple-600" />
								}
								label="Monthly Active"
								value={timeBasedStats.monthlyWorn}
								color="purple"
								subtitle="Items worn this month"
							/>
							<StatItem
								icon={
									<Target className="w-4 h-4 text-orange-600" />
								}
								label="Repeat Rate"
								value={`${usageStats.repeatPercentage}%`}
								color="orange"
								subtitle="Items worn multiple times"
							/>
							<StatItem
								icon={
									<DollarSign className="w-4 h-4 text-emerald-600" />
								}
								label="Avg Cost/Wear"
								value={`$${usageStats.costPerWear.average.toFixed(2)}`}
								color="emerald"
								subtitle="Cost efficiency"
							/>
							<StatItem
								icon={
									<Leaf className="w-4 h-4 text-teal-600" />
								}
								label="Sustainability Score"
								value={`${sustainabilityStats.sustainabilityScore.toFixed(0)}%`}
								color="teal"
								subtitle="Environmental impact"
							/>
						</div>

						{/* Personalized Insights */}
						{userPreferences && (
							<div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
								<div className="flex items-center gap-2 mb-3">
									<Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
									<span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
										Personalized Insights
									</span>
								</div>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
									{userPreferences.stylePreferences &&
										userPreferences.stylePreferences
											.length > 0 && (
											<div className="space-y-2">
												<div className="font-medium text-blue-700">
													Style Match
												</div>
												<div className="flex flex-wrap gap-1">
													{userPreferences.stylePreferences
														.slice(0, 3)
														.map((style, index) => (
															<Badge
																key={index}
																variant="outline"
																className="text-xs bg-blue-100 text-blue-700 border-blue-300"
															>
																{style}
															</Badge>
														))}
													{userPreferences
														.stylePreferences
														.length > 3 && (
														<Badge
															variant="outline"
															className="text-xs bg-blue-100 text-blue-700 border-blue-300"
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
											<div className="font-medium text-blue-700">
												Body Type
											</div>
											<Badge
												variant="outline"
												className="bg-purple-100 text-purple-700 border-purple-300"
											>
												{userPreferences.bodyType}
											</Badge>
										</div>
									)}
									{userPreferences.favoriteBrands &&
										userPreferences.favoriteBrands.length >
											0 && (
											<div className="space-y-2">
												<div className="font-medium text-blue-700">
													Favorite Brands
												</div>
												<div className="flex flex-wrap gap-1">
													{userPreferences.favoriteBrands
														.slice(0, 2)
														.map((brand, index) => (
															<Badge
																key={index}
																variant="outline"
																className="text-xs bg-green-100 text-green-700 border-green-300"
															>
																{brand}
															</Badge>
														))}
													{userPreferences
														.favoriteBrands.length >
														2 && (
														<Badge
															variant="outline"
															className="text-xs bg-green-100 text-green-700 border-green-300"
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
											<div className="font-medium text-blue-700">
												Currency
											</div>
											<Badge
												variant="outline"
												className="bg-amber-100 text-amber-700 border-amber-300"
											>
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
									<div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
										<div className="font-bold text-green-700 dark:text-green-300">
											{wearStats.wearFrequency.daily}
										</div>
										<div className="text-green-600 dark:text-green-400">
											Daily
										</div>
									</div>
									<div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
										<div className="font-bold text-blue-700 dark:text-blue-300">
											{wearStats.wearFrequency.weekly}
										</div>
										<div className="text-blue-600 dark:text-blue-400">
											Weekly
										</div>
									</div>
									<div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
										<div className="font-bold text-purple-700 dark:text-purple-300">
											{wearStats.wearFrequency.monthly}
										</div>
										<div className="text-purple-600 dark:text-purple-400">
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
								icon={
									<User className="w-4 h-4 text-blue-600" />
								}
								label="Tops"
								value={categoryStats.tops}
								color="blue"
							/>
							<StatItem
								icon={
									<Shield className="w-4 h-4 text-green-600" />
								}
								label="Bottoms"
								value={categoryStats.bottoms}
								color="green"
							/>
							<StatItem
								icon={
									<Palette className="w-4 h-4 text-purple-600" />
								}
								label="Dresses"
								value={categoryStats.dresses}
								color="purple"
							/>
							<StatItem
								icon={
									<Clock className="w-4 h-4 text-yellow-600" />
								}
								label="Outerwear"
								value={categoryStats.outerwear}
								color="yellow"
							/>
							<StatItem
								icon={
									<TrendingUp className="w-4 h-4 text-orange-600" />
								}
								label="Shoes"
								value={categoryStats.shoes}
								color="orange"
							/>
							<StatItem
								icon={
									<Sparkles className="w-4 h-4 text-pink-600" />
								}
								label="Accessories"
								value={categoryStats.accessories}
								color="pink"
							/>
						</div>
					</TabsContent>

					<TabsContent value="usage" className="space-y-4 mt-4">
						<div className="space-y-3">
							<div className="p-4 rounded-lg border bg-background/50 dark:bg-gray-900/50">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Most Worn Item
									</span>
									<Badge>
										{wearStats.mostWornItem.wearCount || 0}{" "}
										times
									</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									{wearStats.mostWornItem.name}
								</p>
							</div>

							<div className="p-4 rounded-lg border bg-background/50 dark:bg-gray-900/50">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Least Worn Item
									</span>
									<Badge variant="outline">
										{wearStats.leastWornItem.wearCount || 0}{" "}
										times
									</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									{wearStats.leastWornItem.name}
								</p>
							</div>

							<StatItem
								icon={
									<TrendingUp className="w-4 h-4 text-orange-600" />
								}
								label="Total Wears"
								value={wearStats.totalWorn}
								color="orange"
							/>

							<StatItem
								icon={
									<Scale className="w-4 h-4 text-teal-600" />
								}
								label="Average Wear"
								value={wearStats.averageWear.toFixed(1)}
								color="teal"
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
								<div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border">
									<div className="flex items-center justify-between mb-1 min-w-0">
										<span className="text-sm font-medium text-green-700 dark:text-green-300 truncate">
											Most Efficient
										</span>
										<Badge
											variant="secondary"
											className="bg-green-100 dark:bg-green-800 text-xs flex-shrink-0 ml-2"
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
									<p className="text-xs text-green-600 dark:text-green-400 truncate">
										{
											usageStats.costPerWear.mostEfficient
												.name
										}
									</p>
								</div>
								<div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border">
									<div className="flex items-center justify-between mb-1 min-w-0">
										<span className="text-sm font-medium text-orange-700 dark:text-orange-300 truncate">
											Needs More Love
										</span>
										<Badge
											variant="outline"
											className="bg-orange-100 dark:bg-orange-800 text-xs flex-shrink-0 ml-2"
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
									<p className="text-xs text-orange-600 dark:text-orange-400 truncate">
										{
											usageStats.costPerWear
												.leastEfficient.name
										}
									</p>
								</div>
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
									<DollarSign className="w-4 h-4 text-emerald-600" />
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
								color="emerald"
								subtitle="Your wardrobe value"
							/>
							<StatItem
								icon={
									<Heart className="w-4 h-4 text-pink-600" />
								}
								label="Avg Item Cost"
								value={`$${sustainabilityStats.averageCostPerItem.toFixed(0)}`}
								color="pink"
								subtitle="Average purchase price"
							/>
							<StatItem
								icon={
									<Leaf className="w-4 h-4 text-green-600" />
								}
								label="Sustainability Score"
								value={`${sustainabilityStats.sustainabilityScore.toFixed(0)}%`}
								color="green"
								subtitle="Environmental impact rating"
							/>
							<StatItem
								icon={<Zap className="w-4 h-4 text-blue-600" />}
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
								color="blue"
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
									className={
										sustainabilityStats.sustainabilityScore >=
										70
											? "bg-green-600"
											: ""
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
									className={`h-3 rounded-full transition-all ${
										sustainabilityStats.sustainabilityScore >=
										70
											? "bg-gradient-to-r from-green-500 to-emerald-500"
											: sustainabilityStats.sustainabilityScore >=
												  50
												? "bg-gradient-to-r from-yellow-400 to-orange-500"
												: "bg-gradient-to-r from-red-400 to-orange-500"
									}`}
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
								<div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border min-w-0">
									<div className="text-base sm:text-lg font-bold text-green-700 dark:text-green-300 break-words">
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
									<p className="text-xs text-green-600 dark:text-green-400">
										CO₂ Prevented
									</p>
								</div>
								<div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border min-w-0">
									<div className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-300 break-words">
										{Math.floor(
											sustainabilityStats.co2SavedFromRewearing /
												33
										)}
									</div>
									<p className="text-xs text-blue-600 dark:text-blue-400">
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
