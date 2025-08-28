import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface EmptyWishlistProps {
	onBrowseShop?: () => void;
}

export function EmptyWishlist({ onBrowseShop }: EmptyWishlistProps) {
	return (
		<div className="text-center py-12">
			<div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
				<Heart className="w-12 h-12 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold mb-2">
				Your wishlist is empty
			</h3>
			<p className="text-muted-foreground mb-4">
				Start adding items you'd like to purchase
			</p>
			<Button onClick={onBrowseShop}>Browse Shop</Button>
		</div>
	);
}
