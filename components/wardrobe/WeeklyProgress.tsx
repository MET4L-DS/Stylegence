import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklyProgressProps {
	outfitsPlanned?: number;
	totalDays?: number;
	avgConfidence?: number;
	versatilePieces?: number;
}

export function WeeklyProgress({
	outfitsPlanned = 5,
	totalDays = 7,
	avgConfidence = 89,
	versatilePieces = 3,
}: WeeklyProgressProps) {
	const progressPercentage = (outfitsPlanned / totalDays) * 100;

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">This Week</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<div className="flex justify-between text-sm">
						<span>Outfits Planned</span>
						<span className="font-medium">
							{outfitsPlanned}/{totalDays}
						</span>
					</div>
					<div className="w-full bg-muted rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full"
							style={{ width: `${progressPercentage}%` }}
						></div>
					</div>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Avg Confidence: {avgConfidence}%</span>
						<span>{versatilePieces} Versatile Pieces</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
