import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WardrobeItem } from "@/data";
import {
	DollarSign,
	Heart,
	BarChart3,
	Calendar,
	Star,
	ShoppingBag,
	Leaf,
} from "lucide-react";

interface WardrobeItemCardProps {
	item: WardrobeItem;
}

export function WardrobeItemCard({ item }: WardrobeItemCardProps) {
	const wearCount = item.wearCount || 0;
	const costPerWear =
		item.purchasePrice && wearCount > 0
			? item.purchasePrice / wearCount
			: null;

	const sustainabilityScore = (item as any).sustainabilityScore || 0;
	const isHighValue = wearCount >= 10;
	const isRecentlyAdded =
		new Date(item.addedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const isFavorited = (item as any).favorited || false;

	return (
		<Card className="group cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden">
			{/* Status Indicators */}
			<div className="absolute top-2 right-2 z-10 flex gap-1">
				{isRecentlyAdded && (
					<Badge
						variant="secondary"
						className="text-xs bg-blue-100 text-blue-700"
					>
						New
					</Badge>
				)}
				{isHighValue && (
					<Badge
						variant="secondary"
						className="text-xs bg-green-100 text-green-700"
					>
						<Star className="w-3 h-3 mr-1" />
						High Value
					</Badge>
				)}
			</div>

			<CardContent className="p-4">
				<div className="aspect-[3/4] bg-muted rounded-lg mb-4 flex items-center justify-center relative">
					<span className="text-muted-foreground text-sm">Image</span>
					{/* Favorited indicator */}
					{isFavorited && (
						<div className="absolute top-2 left-2">
							<Heart className="w-4 h-4 text-red-500 fill-current" />
						</div>
					)}
				</div>

				<div className="space-y-3">
					<div>
						<h3 className="font-semibold text-sm line-clamp-1">
							{item.name}
						</h3>
						<p className="text-xs text-muted-foreground">
							{item.brand}
						</p>
					</div>

					{/* Category and Color */}
					<div className="flex items-center justify-between">
						<Badge variant="secondary" className="text-xs">
							{item.category}
						</Badge>
						<span className="text-xs text-muted-foreground">
							{item.color}
						</span>
					</div>

					{/* Stats Row */}
					<div className="grid grid-cols-3 gap-2 text-xs">
						<div className="text-center">
							<div className="flex items-center justify-center mb-1">
								<BarChart3 className="w-3 h-3 text-blue-500" />
							</div>
							<div className="font-medium">{wearCount}</div>
							<div className="text-muted-foreground">Wears</div>
						</div>

						{costPerWear && (
							<div className="text-center">
								<div className="flex items-center justify-center mb-1">
									<DollarSign className="w-3 h-3 text-green-500" />
								</div>
								<div className="font-medium">
									${costPerWear.toFixed(2)}
								</div>
								<div className="text-muted-foreground">
									Per Wear
								</div>
							</div>
						)}

						{sustainabilityScore > 0 && (
							<div className="text-center">
								<div className="flex items-center justify-center mb-1">
									<Leaf className="w-3 h-3 text-green-600" />
								</div>
								<div className="font-medium">
									{sustainabilityScore}%
								</div>
								<div className="text-muted-foreground">
									Eco Score
								</div>
							</div>
						)}
					</div>

					{/* Purchase Info */}
					{(item.purchasePrice || item.purchaseDate) && (
						<div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
							{item.purchasePrice && (
								<div className="flex items-center gap-1">
									<ShoppingBag className="w-3 h-3" />
									<span>${item.purchasePrice}</span>
								</div>
							)}
							{item.purchaseDate && (
								<div className="flex items-center gap-1">
									<Calendar className="w-3 h-3" />
									<span>
										{new Date(
											item.purchaseDate
										).toLocaleDateString()}
									</span>
								</div>
							)}
						</div>
					)}

					{/* Tags */}
					<div className="flex flex-wrap gap-1">
						{item.tags.slice(0, 3).map((tag) => (
							<Badge
								key={tag}
								variant="outline"
								className="text-xs"
							>
								{tag}
							</Badge>
						))}
						{item.tags.length > 3 && (
							<Badge
								variant="outline"
								className="text-xs text-muted-foreground"
							>
								+{item.tags.length - 3}
							</Badge>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
