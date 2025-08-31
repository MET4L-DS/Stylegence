import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Settings } from "lucide-react";

interface WeeklyOverviewProps {
	daysPlanned?: number;
	avgConfidence?: number;
	itemsUsed?: number;
	versatilePieces?: number;
	onRegenerateWeek?: () => void;
	onOpenPreferences?: () => void;
}

export function WeeklyOverview({
	daysPlanned = 7,
	avgConfidence = 89,
	itemsUsed = 12,
	versatilePieces = 3,
	onRegenerateWeek,
	onOpenPreferences,
}: WeeklyOverviewProps) {
	return (
		<Card className="mt-6">
			<CardHeader>
				<CardTitle className="text-lg">Weekly Overview</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
						<div className="text-xl font-bold text-foreground">
							{daysPlanned}
						</div>
						<p className="text-xs text-muted-foreground">
							Days Planned
						</p>
					</div>
					<div className="text-center p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
						<div className="text-xl font-bold text-foreground">
							{avgConfidence}%
						</div>
						<p className="text-xs text-muted-foreground">
							Avg Confidence
						</p>
					</div>
					<div className="text-center p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
						<div className="text-xl font-bold text-foreground">
							{itemsUsed}
						</div>
						<p className="text-xs text-muted-foreground">
							Items Used
						</p>
					</div>
					<div className="text-center p-3 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
						<div className="text-xl font-bold text-foreground">
							{versatilePieces}
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
						onClick={onRegenerateWeek}
					>
						<RotateCcw className="w-4 h-4 mr-2" />
						Regenerate Week
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						onClick={onOpenPreferences}
					>
						<Settings className="w-4 h-4 mr-2" />
						Preferences
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
