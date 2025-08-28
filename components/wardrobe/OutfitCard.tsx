import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Outfit } from "@/data";
import {
	Heart,
	Calendar,
	Star,
	Users,
	Eye,
	Thermometer,
	Cloud,
} from "lucide-react";

interface OutfitCardProps {
	outfit: Outfit;
}

export function OutfitCard({ outfit }: OutfitCardProps) {
	const isFavorited = (outfit as any).favorited || false;
	const wearCount = (outfit as any).wearCount || 0;
	const isRecentlyWorn = outfit.lastWorn
		? new Date(outfit.lastWorn) >
			new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
		: false;
	const weatherSuitability = (outfit as any).weatherSuitability || [];
	const styleRating = (outfit as any).styleRating || 0;

	return (
		<Card className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden">
			{/* Status Indicators */}
			<div className="absolute top-3 right-3 z-10 flex gap-1">
				{isFavorited && (
					<Badge
						variant="secondary"
						className="text-xs bg-red-100 text-red-700"
					>
						<Heart className="w-3 h-3 mr-1 fill-current" />
						Loved
					</Badge>
				)}
				{isRecentlyWorn && (
					<Badge
						variant="secondary"
						className="text-xs bg-blue-100 text-blue-700"
					>
						Recent
					</Badge>
				)}
			</div>

			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<CardTitle className="text-lg">{outfit.name}</CardTitle>
						<CardDescription className="flex items-center gap-4 mt-1">
							{outfit.lastWorn && (
								<span className="flex items-center gap-1">
									<Calendar className="w-3 h-3" />
									Last worn:{" "}
									{new Date(
										outfit.lastWorn
									).toLocaleDateString()}
								</span>
							)}
							{wearCount > 0 && (
								<span className="flex items-center gap-1">
									<Users className="w-3 h-3" />
									{wearCount} times
								</span>
							)}
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Occasion and Weather */}
				<div className="flex items-center gap-2 flex-wrap">
					<Badge
						variant="outline"
						className="flex items-center gap-1"
					>
						<Star className="w-3 h-3" />
						{outfit.occasion}
					</Badge>
					{weatherSuitability.length > 0 && (
						<Badge
							variant="secondary"
							className="flex items-center gap-1"
						>
							<Cloud className="w-3 h-3" />
							{weatherSuitability[0]}
						</Badge>
					)}
					{styleRating > 0 && (
						<Badge
							variant="secondary"
							className="flex items-center gap-1"
						>
							<Eye className="w-3 h-3" />
							{styleRating}/5
						</Badge>
					)}
				</div>

				{/* Items List */}
				<div className="space-y-2">
					<p className="text-sm font-medium flex items-center gap-1">
						<span>Items ({outfit.items.length})</span>
					</p>
					<div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto">
						{outfit.items.slice(0, 4).map((item, index) => (
							<p
								key={index}
								className="text-sm text-muted-foreground flex items-center gap-2"
							>
								<span className="w-1 h-1 bg-muted-foreground rounded-full" />
								{item}
							</p>
						))}
						{outfit.items.length > 4 && (
							<p className="text-xs text-muted-foreground italic">
								+{outfit.items.length - 4} more items
							</p>
						)}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex space-x-2 pt-2 border-t">
					<Button size="sm" variant="outline" className="flex-1">
						Edit
					</Button>
					<Button size="sm" className="flex-1">
						Wear Today
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
