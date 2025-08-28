import { WardrobeItem } from "@/data";
import { WardrobeItemCard } from "./WardrobeItemCard";

interface WardrobeGridProps {
	items: WardrobeItem[];
}

export function WardrobeGrid({ items }: WardrobeGridProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{items.map((item) => (
				<WardrobeItemCard key={item.id} item={item} />
			))}
		</div>
	);
}
