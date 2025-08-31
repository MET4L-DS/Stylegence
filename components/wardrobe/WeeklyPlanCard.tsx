import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DayPlan } from "@/data";
import {
	Star,
	Cloud,
	User,
	Shield,
	Info,
	Sparkles,
	Plus,
	Leaf,
	Zap,
	TrendingUp,
} from "lucide-react";

interface WeeklyPlanCardProps {
	dayPlan: DayPlan;
}

export function WeeklyPlanCard({ dayPlan }: WeeklyPlanCardProps) {
	const sustainabilityScore =
		(dayPlan.recommendedOutfit as any).sustainabilityScore || 0;
	const isHighSustainability = sustainabilityScore >= 80;
	const isAIRecommended =
		(dayPlan.recommendedOutfit as any).isAIGenerated || false;
	const comfortLevel = (dayPlan.recommendedOutfit as any).comfortLevel || 0;

	return (
		<Card className="hover:shadow-md transition-shadow relative">
			{/* Enhanced Status Indicators */}
			<div className="absolute top-2 right-2 z-10 flex gap-1">
				{isHighSustainability && (
					<Badge
						variant="secondary"
						className="text-xs bg-green-100 text-green-700"
					>
						<Leaf className="w-3 h-3" />
					</Badge>
				)}
				{isAIRecommended && (
					<Badge
						variant="secondary"
						className="text-xs bg-purple-100 text-purple-700"
					>
						<Zap className="w-3 h-3" />
					</Badge>
				)}
			</div>

			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="text-base">
							{dayPlan.day}
						</CardTitle>
						<CardDescription className="text-xs">
							{dayPlan.date}
						</CardDescription>
					</div>
					<div className="flex items-center gap-1">
						<Star className="w-3 h-3 text-yellow-500" />
						<span className="text-xs font-medium">
							{dayPlan.recommendedOutfit.confidence}%
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Weather and Stats */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Cloud className="w-3 h-3" />
						{dayPlan.weather}
					</div>
					{comfortLevel > 0 && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<TrendingUp className="w-3 h-3" />
							{comfortLevel}/5 comfort
						</div>
					)}
				</div>

				{/* Outfit Image Template */}
				<div className="relative">
					<div className="aspect-[3/4] bg-gradient-to-b from-background to-muted/30 rounded-lg flex flex-col items-center justify-center border border-border relative overflow-hidden">
						{/* Clothing Items Collection */}
						<div className="absolute inset-2 grid grid-cols-2 gap-1">
							{/* Top Wear */}
							<div className="bg-primary/10 rounded-md flex items-center justify-center border border-primary/20">
								<div className="text-center">
									<User className="w-4 h-4 mx-auto mb-1 text-primary/60" />
									<span className="text-xs text-primary/80 font-medium">
										Top
									</span>
								</div>
							</div>

							{/* Bottom Wear */}
							<div className="bg-secondary/10 rounded-md flex items-center justify-center border border-secondary/20">
								<div className="text-center">
									<Shield className="w-4 h-4 mx-auto mb-1 text-secondary/60" />
									<span className="text-xs text-secondary/80 font-medium">
										Bottom
									</span>
								</div>
							</div>

							{/* Footwear */}
							<div className="bg-accent/10 rounded-md flex items-center justify-center border border-accent/20">
								<div className="text-center">
									<Info className="w-4 h-4 mx-auto mb-1 text-accent/60" />
									<span className="text-xs text-accent/80 font-medium">
										Shoes
									</span>
								</div>
							</div>

							{/* Accessory (conditional) */}
							{dayPlan.recommendedOutfit.items.some(
								(item) =>
									item.includes("Blazer") ||
									item.includes("Coat") ||
									item.includes("Scarf") ||
									item.includes("Hat") ||
									item.includes("Belt") ||
									item.includes("Bag")
							) ? (
								<div className="bg-yellow-100/50 dark:bg-yellow-900/20 rounded-md flex items-center justify-center border border-yellow-200 dark:border-yellow-800">
									<div className="text-center">
										<Sparkles className="w-4 h-4 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
										<span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
											Extra
										</span>
									</div>
								</div>
							) : (
								<div className="bg-muted/30 rounded-md flex items-center justify-center border border-muted-foreground/10 opacity-50">
									<div className="text-center">
										<Plus className="w-3 h-3 mx-auto mb-1 text-muted-foreground/40" />
										<span className="text-xs text-muted-foreground/40 font-medium">
											Optional
										</span>
									</div>
								</div>
							)}
						</div>

						{/* Outfit Name */}
						<div className="absolute bottom-1 left-1 right-1">
							<div className="bg-background/95 backdrop-blur-sm rounded px-2 py-1 border border-border/50">
								<p className="text-xs font-medium text-center truncate">
									{dayPlan.recommendedOutfit.name}
								</p>
							</div>
						</div>
					</div>

					{/* Confidence Badge */}
					<Badge
						variant="default"
						className="absolute -top-2 -right-2 text-xs px-2 py-1"
					>
						{dayPlan.recommendedOutfit.confidence}%
					</Badge>
				</div>

				{/* Schedule Preview */}
				<div className="space-y-1">
					<p className="text-xs font-medium">Today's Schedule:</p>
					{dayPlan.schedule.slice(0, 2).map((event, index) => (
						<p
							key={index}
							className="text-xs text-muted-foreground flex items-center gap-1"
						>
							<svg
								className="w-2 h-2"
								fill="currentColor"
								viewBox="0 0 8 8"
							>
								<circle cx="4" cy="4" r="3" />
							</svg>
							{event.length > 25
								? event.substring(0, 25) + "..."
								: event}
						</p>
					))}
					{dayPlan.schedule.length > 2 && (
						<p className="text-xs text-muted-foreground">
							+{dayPlan.schedule.length - 2} more
						</p>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex gap-1">
					<Button size="sm" className="flex-1 text-xs">
						Select
					</Button>
					{dayPlan.alternatives.length > 0 && (
						<Button size="sm" variant="outline" className="text-xs">
							{dayPlan.alternatives.length} Alt
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
