import { Outfit } from "@/data";
import { OutfitCard } from "./OutfitCard";

interface OutfitGridProps {
	outfits: Outfit[];
}

export function OutfitGrid({ outfits }: OutfitGridProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{outfits.map((outfit) => (
				<OutfitCard key={outfit.id} outfit={outfit} />
			))}
		</div>
	);
}
