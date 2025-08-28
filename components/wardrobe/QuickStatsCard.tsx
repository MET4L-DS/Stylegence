import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WardrobeData } from "@/data";
import { Tag, Heart, TrendingUp, Star } from "lucide-react";

interface QuickStatsCardProps {
	wardrobeItems: WardrobeData;
}

export function QuickStatsCard({ wardrobeItems }: QuickStatsCardProps) {
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
					<span className="font-bold">
						{wardrobeItems.all.length}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
							<Heart className="w-4 h-4 text-red-600" />
						</div>
						<span className="text-sm">Saved Outfits</span>
					</div>
					<span className="font-bold">
						{wardrobeItems.outfits.length}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
							<TrendingUp className="w-4 h-4 text-green-600" />
						</div>
						<span className="text-sm">Most Worn</span>
					</div>
					<span className="font-bold text-sm">Jeans</span>
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
