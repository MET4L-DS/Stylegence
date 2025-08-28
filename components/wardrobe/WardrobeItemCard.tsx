import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WardrobeItem } from "@/data";

interface WardrobeItemCardProps {
	item: WardrobeItem;
}

export function WardrobeItemCard({ item }: WardrobeItemCardProps) {
	return (
		<Card className="group cursor-pointer hover:shadow-md transition-shadow">
			<CardContent className="p-4">
				<div className="aspect-[3/4] bg-muted rounded-lg mb-4 flex items-center justify-center">
					<span className="text-muted-foreground text-sm">Image</span>
				</div>
				<div className="space-y-2">
					<h3 className="font-semibold text-sm">{item.name}</h3>
					<p className="text-xs text-muted-foreground">
						{item.brand}
					</p>
					<div className="flex items-center justify-between">
						<Badge variant="secondary" className="text-xs">
							{item.category}
						</Badge>
						<span className="text-xs text-muted-foreground">
							{item.color}
						</span>
					</div>
					<div className="flex flex-wrap gap-1">
						{item.tags.map((tag) => (
							<Badge
								key={tag}
								variant="outline"
								className="text-xs"
							>
								{tag}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
