import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CategoryFilterProps {
	categories: string[];
	selectedCategory: string;
	onCategorySelect: (category: string) => void;
}

export function CategoryFilter({
	categories,
	selectedCategory,
	onCategorySelect,
}: CategoryFilterProps) {
	return (
		<div className="flex space-x-2">
			{categories.map((category) => (
				<Button
					key={category}
					variant={
						selectedCategory === category ? "default" : "outline"
					}
					size="sm"
					onClick={() => onCategorySelect(category)}
				>
					{category}
				</Button>
			))}
		</div>
	);
}
