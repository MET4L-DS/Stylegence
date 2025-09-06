"use client";

import { useState } from "react";
import { WardrobeItem } from "@/data";
import { WardrobeItemCard } from "./WardrobeItemCard";
import { WardrobeItemDetailModal } from "./WardrobeItemDetailModal";

interface WardrobeGridProps {
	items: WardrobeItem[];
}

export function WardrobeGrid({ items }: WardrobeGridProps) {
	const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleItemClick = (item: WardrobeItem) => {
		setSelectedItem(item);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		// Clear the selected item after animation completes
		setTimeout(() => {
			setSelectedItem(null);
		}, 300); // Standard drawer animation duration
	};

	const handleItemUpdated = () => {
		// Convex will automatically refetch the data
		// Close modal to see updated data
		handleCloseModal();
	};

	const handleItemDeleted = () => {
		// Convex will automatically refetch the data
		// Close modal since item is deleted
		handleCloseModal();
	};

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{items.map((item) => (
					<WardrobeItemCard
						key={item.id}
						item={item}
						onClick={handleItemClick}
					/>
				))}
			</div>

			{selectedItem && (
				<WardrobeItemDetailModal
					item={selectedItem}
					open={isModalOpen}
					onOpenChange={(open) => {
						if (!open) {
							handleCloseModal();
						}
					}}
					onItemUpdated={handleItemUpdated}
					onItemDeleted={handleItemDeleted}
				/>
			)}
		</>
	);
}
