import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WeeklyPlanCard } from "./WeeklyPlanCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar } from "lucide-react";

export function WeeklyPlanGrid() {
	const weeklyPlan = useQuery(api.outfits.generateWeeklyPlan, {});

	if (!weeklyPlan) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{Array.from({ length: 7 }).map((_, index) => (
					<div
						key={index}
						className="aspect-[3/4] bg-muted rounded-lg animate-pulse"
					/>
				))}
			</div>
		);
	}

	if (weeklyPlan.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="bg-muted/30 rounded-full p-6 w-fit mx-auto mb-4">
					<Calendar className="w-8 h-8 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-semibold mb-2">
					No Weekly Plan Available
				</h3>
				<p className="text-muted-foreground mb-6">
					Add some wardrobe items to generate a weekly outfit plan
				</p>
				<Button variant="outline">
					<RefreshCw className="w-4 h-4 mr-2" />
					Refresh Plan
				</Button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{weeklyPlan
				.filter((dayPlan) => dayPlan.recommendedOutfit !== null)
				.map((dayPlan) => (
					<WeeklyPlanCard
						key={dayPlan.day}
						dayPlan={dayPlan as any}
					/>
				))}
		</div>
	);
}
