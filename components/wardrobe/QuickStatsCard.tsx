import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WardrobeData } from "@/data";
import {
	Tag,
	Heart,
	TrendingUp,
	Star,
	DollarSign,
	Leaf,
	Clock,
	Target,
} from "lucide-react";

interface QuickStatsCardProps {
	wardrobeItems: WardrobeData;
}

export function QuickStatsCard({ wardrobeItems }: QuickStatsCardProps) {
	// Calculate dynamic statistics
	const totalItems = wardrobeItems.all.length;
	const totalOutfits = wardrobeItems.outfits.length;

	// Find most worn item
	const mostWornItem = wardrobeItems.all.reduce((prev, current) => {
		const prevWears = (prev as any).wearCount || 0;
		const currentWears = (current as any).wearCount || 0;
		return currentWears > prevWears ? current : prev;
	}, wardrobeItems.all[0]);

	// Calculate total wardrobe value
	const totalValue = wardrobeItems.all.reduce((sum, item) => {
		return sum + ((item as any).purchasePrice || 0);
	}, 0);

	// Calculate average cost per wear
	const totalWears = wardrobeItems.all.reduce((sum, item) => {
		return sum + ((item as any).wearCount || 0);
	}, 0);
	const avgCostPerWear = totalWears > 0 ? totalValue / totalWears : 0;

	// Calculate sustainability score
	const sustainabilityScores = wardrobeItems.all.map(
		(item) => (item as any).sustainabilityScore || 0
	);
	const avgSustainabilityScore =
		sustainabilityScores.length > 0
			? sustainabilityScores.reduce((a, b) => a + b, 0) /
				sustainabilityScores.length
			: 0;

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Quick Stats</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
							<Tag className="w-4 h-4 text-primary" />
						</div>
						<span className="text-sm">Total Items</span>
					</div>
					<span className="font-bold">{totalItems}</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
							<Heart className="w-4 h-4 text-red-600" />
						</div>
						<span className="text-sm">Saved Outfits</span>
					</div>
					<span className="font-bold">{totalOutfits}</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
							<TrendingUp className="w-4 h-4 text-green-600" />
						</div>
						<span className="text-sm">Most Worn</span>
					</div>
					<span className="font-bold text-sm">
						{mostWornItem?.name || "N/A"}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
							<DollarSign className="w-4 h-4 text-blue-600" />
						</div>
						<span className="text-sm">Avg Cost/Wear</span>
					</div>
					<span className="font-bold">
						${avgCostPerWear.toFixed(2)}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
							<Leaf className="w-4 h-4 text-green-600" />
						</div>
						<span className="text-sm">Eco Score</span>
					</div>
					<span className="font-bold">
						{avgSustainabilityScore.toFixed(1)}%
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
							<Star className="w-4 h-4 text-yellow-600" />
						</div>
						<span className="text-sm">Style Score</span>
					</div>
					<span className="font-bold">8.5/10</span>
				</div>
			</CardContent>
		</Card>
	);
}
