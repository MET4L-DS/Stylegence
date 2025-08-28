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

interface OutfitCardProps {
	outfit: Outfit;
}

export function OutfitCard({ outfit }: OutfitCardProps) {
	return (
		<Card className="cursor-pointer hover:shadow-md transition-shadow">
			<CardHeader>
				<CardTitle className="text-lg">{outfit.name}</CardTitle>
				<CardDescription>
					Last worn: {new Date(outfit.lastWorn).toLocaleDateString()}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<Badge variant="outline">{outfit.occasion}</Badge>
					<div className="space-y-1">
						<p className="text-sm font-medium">Items:</p>
						{outfit.items.map((item, index) => (
							<p
								key={index}
								className="text-sm text-muted-foreground"
							>
								• {item}
							</p>
						))}
					</div>
					<div className="flex space-x-2 pt-2">
						<Button size="sm" variant="outline">
							Edit
						</Button>
						<Button size="sm">Wear Today</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
