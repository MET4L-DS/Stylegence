import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import { STYLE_PREFERENCES, BODY_TYPES, POPULAR_BRANDS } from "@/data/profile";
import { ProfileData } from "@/data/types";

interface StylePreferencesTabProps {
	formData: ProfileData;
	setFormData: React.Dispatch<React.SetStateAction<ProfileData>>;
}

export function StylePreferencesTab({
	formData,
	setFormData,
}: StylePreferencesTabProps) {
	const handleStyleToggle = (style: string) => {
		setFormData((prev) => ({
			...prev,
			stylePreferences: prev.stylePreferences.includes(style)
				? prev.stylePreferences.filter((s) => s !== style)
				: [...prev.stylePreferences, style],
		}));
	};

	const handleBrandToggle = (brand: string) => {
		setFormData((prev) => ({
			...prev,
			favoriteBrands: prev.favoriteBrands.includes(brand)
				? prev.favoriteBrands.filter((b) => b !== brand)
				: [...prev.favoriteBrands, brand],
		}));
	};

	return (
		<div className="space-y-6">
			{/* Style Preferences Section */}
			<div className="space-y-3">
				<Label className="text-base font-medium">
					Style Preferences ({formData.stylePreferences.length}{" "}
					selected)
				</Label>
				<div className="flex flex-wrap gap-2">
					{STYLE_PREFERENCES.map((style) => (
						<Badge
							key={style}
							variant={
								formData.stylePreferences.includes(style)
									? "default"
									: "outline"
							}
							className="cursor-pointer hover:bg-primary/80 transition-colors"
							onClick={() => handleStyleToggle(style)}
						>
							{formData.stylePreferences.includes(style) && (
								<Check className="w-3 h-3 mr-1" />
							)}
							{style}
						</Badge>
					))}
				</div>
			</div>

			<Separator />

			{/* Body Type Section */}
			<div className="space-y-3">
				<Label className="text-base font-medium">Body Type</Label>
				<Select
					value={formData.bodyType}
					onValueChange={(value) =>
						setFormData((prev) => ({
							...prev,
							bodyType: value,
						}))
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select your body type" />
					</SelectTrigger>
					<SelectContent>
						{BODY_TYPES.map((type) => (
							<SelectItem key={type} value={type}>
								{type}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Separator />

			{/* Favorite Brands Section */}
			<div className="space-y-3">
				<Label className="text-base font-medium">
					Favorite Brands ({formData.favoriteBrands.length} selected)
				</Label>
				<div className="flex flex-wrap gap-2">
					{POPULAR_BRANDS.map((brand) => (
						<Badge
							key={brand}
							variant={
								formData.favoriteBrands.includes(brand)
									? "default"
									: "outline"
							}
							className="cursor-pointer hover:bg-primary/80 transition-colors"
							onClick={() => handleBrandToggle(brand)}
						>
							{formData.favoriteBrands.includes(brand) && (
								<Check className="w-3 h-3 mr-1" />
							)}
							{brand}
						</Badge>
					))}
				</div>
			</div>
		</div>
	);
}
