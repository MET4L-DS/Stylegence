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
					<div className="text-center p-3 bg-primary/5 rounded-lg">
						<div className="text-xl font-bold text-foreground">
							{daysPlanned}
						</div>
						<p className="text-xs text-muted-foreground">
							Days Planned
						</p>
					</div>
					<div className="text-center p-3 bg-green-50 rounded-lg">
						<div className="text-xl font-bold text-foreground">
							{avgConfidence}%
						</div>
						<p className="text-xs text-muted-foreground">
							Avg Confidence
						</p>
					</div>
					<div className="text-center p-3 bg-blue-50 rounded-lg">
						<div className="text-xl font-bold text-foreground">
							{itemsUsed}
						</div>
						<p className="text-xs text-muted-foreground">
							Items Used
						</p>
					</div>
					<div className="text-center p-3 bg-yellow-50 rounded-lg">
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
