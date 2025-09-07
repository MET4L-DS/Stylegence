import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
	Heart,
	Calendar,
	Star,
	Users,
	Eye,
	Thermometer,
	Cloud,
	Leaf,
	Zap,
	TrendingUp,
	Trash2,
	User,
	Palette,
	DollarSign,
} from "lucide-react";

interface OutfitCardProps {
	outfitId: Id<"outfits">;
	onDelete?: () => void;
}

export function OutfitCard({ outfitId, onDelete }: OutfitCardProps) {
	// Get all user outfits and find the specific one
	const allOutfits = useQuery(api.outfits.getUserOutfits, {});
	const outfit = allOutfits?.find((o) => o._id === outfitId);

	const deleteOutfit = useMutation(api.outfits.deleteOutfit);

	const handleDelete = async () => {
		try {
			await deleteOutfit({ outfitId });
			onDelete?.();
		} catch (error) {
			console.error("Failed to delete outfit:", error);
		}
	};

	// Loading state
	if (!outfit) {
		return (
			<Card className="hover:shadow-md transition-shadow relative">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-start">
						<div>
							<div className="h-4 bg-muted rounded w-20 mb-1"></div>
							<div className="h-3 bg-muted rounded w-16"></div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="aspect-[3/4] bg-muted rounded-lg"></div>
				</CardContent>
			</Card>
		);
	}

	const sustainabilityScore =
		outfit.items.reduce((sum, item) => sum + (item?.wearCount || 0), 0) *
		10; // Simple calculation
	const isHighSustainability = sustainabilityScore >= 70;
	const isAIRecommended = outfit.tags?.includes("ai-generated") || false;
	const totalCost = outfit.items.reduce(
		(sum, item) => sum + (item?.purchasePrice || 0),
		0
	);
	const comfortLevel = Math.min(100, Math.max(50, sustainabilityScore));

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
							{outfit.name}
						</CardTitle>
						<CardDescription className="text-xs">
							{new Date(
								outfit._creationTime
							).toLocaleDateString()}
						</CardDescription>
					</div>
					<div className="flex items-center gap-1">
						<Star className="w-3 h-3 text-yellow-500" />
						<span className="text-xs font-medium">
							{comfortLevel}%
						</span>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{/* Weather and Stats */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Cloud className="w-3 h-3" />
						Saved outfit
					</div>
					{comfortLevel > 0 && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<TrendingUp className="w-3 h-3" />
							{Math.round(comfortLevel / 20)}/5 comfort
						</div>
					)}
				</div>

				{/* Outfit Items Grid - Similar to WeeklyPlanCard */}
				<div className="relative">
					<div className="aspect-[3/4] bg-gradient-to-b from-background to-muted/30 rounded-lg flex flex-col items-center justify-center border border-border relative overflow-hidden">
						{/* Clothing Items Grid */}
						<div className="absolute inset-2 grid grid-cols-2 gap-1">
							{outfit.items
								.filter((item) => item !== null)
								.slice(0, 4)
								.map((item, index) => (
									<div
										key={item!._id}
										className="bg-primary/10 rounded-md flex items-center justify-center border border-primary/20 overflow-hidden"
									>
										{item!.imageUrl ? (
											<img
												src={item!.imageUrl}
												alt={item!.customName || "Item"}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="text-center">
												<User className="w-4 h-4 mx-auto mb-1 text-primary/60" />
												<span className="text-xs text-primary/80 font-medium truncate px-1">
													{item!.customName ||
														item!.aiCategory ||
														"Item"}
												</span>
											</div>
										)}
									</div>
								))}
							{/* Fill remaining slots if less than 4 items */}
							{Array.from({
								length: Math.max(
									0,
									4 -
										outfit.items.filter(
											(item) => item !== null
										).length
								),
							}).map((_, index) => (
								<div
									key={`empty-${index}`}
									className="bg-muted/30 rounded-md flex items-center justify-center border border-muted"
								>
									<Palette className="w-3 h-3 text-muted-foreground" />
								</div>
							))}
						</div>

						{/* Outfit count overlay */}
						<div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
							{
								outfit.items.filter((item) => item !== null)
									.length
							}{" "}
							items
						</div>
					</div>
				</div>

				{/* Enhanced Stats Row */}
				<div className="grid grid-cols-3 gap-2 text-xs">
					<div className="text-center p-2 bg-muted/30 rounded">
						<DollarSign className="w-3 h-3 mx-auto mb-1 text-green-600" />
						<span className="text-muted-foreground">Cost</span>
						<p className="font-medium">${totalCost.toFixed(0)}</p>
					</div>
					<div className="text-center p-2 bg-muted/30 rounded">
						<Leaf className="w-3 h-3 mx-auto mb-1 text-green-600" />
						<span className="text-muted-foreground">Eco</span>
						<p className="font-medium">
							{sustainabilityScore.toFixed(0)}%
						</p>
					</div>
					<div className="text-center p-2 bg-muted/30 rounded">
						<Star className="w-3 h-3 mx-auto mb-1 text-yellow-600" />
						<span className="text-muted-foreground">Style</span>
						<p className="font-medium">
							{comfortLevel.toFixed(0)}%
						</p>
					</div>
				</div>

				{/* Tags */}
				{outfit.tags && outfit.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{outfit.tags.slice(0, 3).map((tag) => (
							<Badge
								key={tag}
								variant="outline"
								className="text-xs"
							>
								{tag}
							</Badge>
						))}
						{outfit.tags.length > 3 && (
							<Badge variant="outline" className="text-xs">
								+{outfit.tags.length - 3}
							</Badge>
						)}
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-2 pt-2">
					<Button variant="outline" size="sm" className="flex-1">
						<Eye className="w-4 h-4 mr-1" />
						View
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleDelete}
						className="px-3"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
