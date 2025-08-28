import { DayPlan } from "@/data";
import { WeeklyPlanCard } from "./WeeklyPlanCard";

interface WeeklyPlanGridProps {
	weeklyPlan: DayPlan[];
}

export function WeeklyPlanGrid({ weeklyPlan }: WeeklyPlanGridProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{weeklyPlan.map((dayPlan) => (
				<WeeklyPlanCard key={dayPlan.day} dayPlan={dayPlan} />
			))}
		</div>
	);
}
