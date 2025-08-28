import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DayPlan } from "@/data";

interface DaySwitcherProps {
	weeklyPlan: DayPlan[];
	selectedDay: string;
	onDaySelect: (day: string) => void;
}

export function DaySwitcher({
	weeklyPlan,
	selectedDay,
	onDaySelect,
}: DaySwitcherProps) {
	return (
		<div className="mb-6">
			<div className="flex items-center gap-2 mb-3">
				<Calendar className="w-4 h-4 text-muted-foreground" />
				<span className="text-sm font-medium text-muted-foreground">
					View outfit for:
				</span>
			</div>
			<div className="flex flex-wrap gap-2">
				{weeklyPlan.map((dayPlan) => (
					<Button
						key={dayPlan.day}
						variant={
							selectedDay === dayPlan.day ? "default" : "outline"
						}
						size="sm"
						onClick={() => onDaySelect(dayPlan.day)}
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
	);
}
