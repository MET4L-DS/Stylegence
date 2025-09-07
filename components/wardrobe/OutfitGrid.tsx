import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OutfitCard } from "./OutfitCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";

export function OutfitGrid() {
	const userOutfits = useQuery(api.outfits.getUserOutfits, {});

	if (!userOutfits) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, index) => (
					<div
						key={index}
						className="aspect-[3/4] bg-muted rounded-lg animate-pulse"
					/>
				))}
			</div>
		);
	}

	if (userOutfits.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="bg-muted/30 rounded-full p-6 w-fit mx-auto mb-4">
					<Sparkles className="w-8 h-8 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-semibold mb-2">No Saved Outfits</h3>
				<p className="text-muted-foreground mb-6">
					Start creating outfits from today's recommendations to see
					them here
				</p>
				<Button variant="outline">
					<RefreshCw className="w-4 h-4 mr-2" />
					Generate New Recommendations
				</Button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{userOutfits.map((outfit) => (
				<OutfitCard
					key={outfit._id}
					outfitId={outfit._id}
					onDelete={() => {
						// Optional: Add refresh logic here if needed
					}}
				/>
			))}
		</div>
	);
}
