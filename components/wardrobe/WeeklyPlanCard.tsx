import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import {
	Star,
	Cloud,
	User,
	Shield,
	Info,
	Sparkles,
	Plus,
	Leaf,
	Zap,
	TrendingUp,
	Palette,
	DollarSign,
	Heart,
	Save,
	Check,
} from "lucide-react";

// Updated interface to match Convex return type
interface WeeklyPlanDayProps {
	day: string;
	occasion: string;
	weather: string;
	recommendedOutfit: {
		items: Array<{
			_id: string;
			customName?: string;
			aiCategory?: string;
			imageUrl?: string;
		}>;
		metadata: {
			totalCost: number;
			avgWearCount: number;
			sustainabilityScore: number;
			isAIGenerated: boolean;
			comfortLevel: number;
			generatedAt: number;
		};
	};
}

interface WeeklyPlanCardProps {
	dayPlan: WeeklyPlanDayProps;
}

export function WeeklyPlanCard({ dayPlan }: WeeklyPlanCardProps) {
	const [savedOutfitName, setSavedOutfitName] = useState("");
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [justSaved, setJustSaved] = useState(false);

	const sustainabilityScore =
		dayPlan.recommendedOutfit.metadata.sustainabilityScore;
	const isHighSustainability = sustainabilityScore >= 70;
	const isAIRecommended = dayPlan.recommendedOutfit.metadata.isAIGenerated;
	const comfortLevel = dayPlan.recommendedOutfit.metadata.comfortLevel;
	const totalCost = dayPlan.recommendedOutfit.metadata.totalCost;

	// Get user's saved outfits to check if this combination is already saved
	const userOutfits = useQuery(api.outfits.getUserOutfits, {});
	const saveOutfit = useMutation(api.outfits.saveOutfit);

	// Check if this outfit combination is already saved
	const isOutfitSaved =
		userOutfits?.some((outfit) => {
			const outfitItemIds = outfit.items
				.map((item) => item?._id)
				.filter(Boolean)
				.sort();
			const currentItemIds = dayPlan.recommendedOutfit.items
				.map((item) => item._id)
				.sort();
			return (
				outfitItemIds.length === currentItemIds.length &&
				outfitItemIds.every((id, index) => id === currentItemIds[index])
			);
		}) || false;

	const handleSaveOutfit = async () => {
		if (!dayPlan.recommendedOutfit.items || !savedOutfitName.trim()) return;

		setIsSaving(true);
		try {
			await saveOutfit({
				name: savedOutfitName,
				description: `${dayPlan.day} outfit - ${dayPlan.occasion}`,
				wardrobeItemIds: dayPlan.recommendedOutfit.items.map(
					(item) => item._id as any
				),
				tags: [
					"ai-generated",
					dayPlan.day.toLowerCase(),
					dayPlan.occasion,
				],
				visibility: "PRIVATE",
			});

			setShowSaveDialog(false);
			setSavedOutfitName("");
			setJustSaved(true);

			// Show success toast
			toast.success("Outfit saved successfully!", {
				description: `"${savedOutfitName}" has been added to your wardrobe`,
				duration: 3000,
			});

			// Reset the "just saved" indicator after 3 seconds
			setTimeout(() => setJustSaved(false), 3000);
		} catch (error) {
			console.error("Failed to save outfit:", error);

			// Show error toast
			toast.error("Failed to save outfit", {
				description: "Please try again later",
				duration: 4000,
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Card className="hover:shadow-md transition-shadow relative">
			{/* Enhanced Status Indicators */}
			<div className="absolute top-2 right-2 z-10 flex gap-1">
				{(isOutfitSaved || justSaved) && (
					<Badge
						variant="secondary"
						className="text-xs bg-blue-100 text-blue-700"
					>
						<Heart className="w-3 h-3 fill-current" />
					</Badge>
				)}
				{isHighSustainability && (
					<Badge
						variant="secondary"
						className="text-xs bg-green-100 text-green-700"
					>
						<Leaf className="w-3 h-3" />
					</Badge>
				)}
				{isAIRecommended && (
					<Badge
						variant="secondary"
						className="text-xs bg-purple-100 text-purple-700"
					>
						<Zap className="w-3 h-3" />
					</Badge>
				)}
			</div>

			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="text-base">
							{dayPlan.day}
						</CardTitle>
						<CardDescription className="text-xs">
							{new Date().toLocaleDateString()}
						</CardDescription>
					</div>
					<div className="flex items-center gap-1">
						<Star className="w-3 h-3 text-yellow-500" />
						<span className="text-xs font-medium">
							{comfortLevel}%
						</span>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{/* Weather and Stats */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Cloud className="w-3 h-3" />
						{dayPlan.weather} • {dayPlan.occasion}
					</div>
					{comfortLevel > 0 && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<TrendingUp className="w-3 h-3" />
							{Math.round(comfortLevel / 20)}/5 comfort
						</div>
					)}
				</div>

				{/* Outfit Items Grid */}
				<div className="relative">
					<div className="aspect-[3/4] bg-gradient-to-b from-background to-muted/30 rounded-lg flex flex-col items-center justify-center border border-border relative overflow-hidden">
						{/* Clothing Items Grid */}
						<div className="absolute inset-2 grid grid-cols-2 gap-1">
							{dayPlan.recommendedOutfit.items
								.slice(0, 4)
								.map((item, index) => (
									<div
										key={item._id}
										className="bg-primary/10 rounded-md flex items-center justify-center border border-primary/20 overflow-hidden"
									>
										{item.imageUrl ? (
											<img
												src={item.imageUrl}
												alt={item.customName || "Item"}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="text-center">
												<User className="w-4 h-4 mx-auto mb-1 text-primary/60" />
												<span className="text-xs text-primary/80 font-medium truncate px-1">
													{item.customName ||
														item.aiCategory ||
														"Item"}
												</span>
											</div>
										)}
									</div>
								))}
							{/* Fill remaining slots if less than 4 items */}
							{Array.from({
								length: Math.max(
									0,
									4 - dayPlan.recommendedOutfit.items.length
								),
							}).map((_, index) => (
								<div
									key={`empty-${index}`}
									className="bg-muted/30 rounded-md flex items-center justify-center border border-muted"
								>
									<Palette className="w-3 h-3 text-muted-foreground" />
								</div>
							))}
						</div>

						{/* Central AI Icon */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="bg-background/90 rounded-full p-2 border border-primary/30 shadow-sm">
								<Sparkles className="w-6 h-6 text-primary" />
							</div>
						</div>

						{/* Outfit count overlay */}
						<div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
							{dayPlan.recommendedOutfit.items.length} items
						</div>
					</div>
				</div>

				{/* Enhanced Stats Row */}
				<div className="grid grid-cols-3 gap-2 text-xs">
					<div className="text-center p-2 bg-muted/30 rounded">
						<DollarSign className="w-3 h-3 mx-auto mb-1 text-green-600" />
						<span className="text-muted-foreground">Cost</span>
						<p className="font-medium">${totalCost.toFixed(0)}</p>
					</div>
					<div className="text-center p-2 bg-muted/30 rounded">
						<Leaf className="w-3 h-3 mx-auto mb-1 text-green-600" />
						<span className="text-muted-foreground">Eco</span>
						<p className="font-medium">
							{sustainabilityScore.toFixed(0)}%
						</p>
					</div>
					<div className="text-center p-2 bg-muted/30 rounded">
						<Star className="w-3 h-3 mx-auto mb-1 text-yellow-600" />
						<span className="text-muted-foreground">Comfort</span>
						<p className="font-medium">
							{comfortLevel.toFixed(0)}%
						</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2 pt-2">
					<Button variant="outline" size="sm" className="flex-1">
						Use Today
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							if (isOutfitSaved) {
								toast.warning("Outfit already saved", {
									description:
										"This outfit combination is already in your wardrobe",
									duration: 3000,
								});
							} else {
								setShowSaveDialog(true);
							}
						}}
						disabled={isSaving}
						className="flex-1"
					>
						{isOutfitSaved ? (
							<>
								<Check className="w-4 h-4 mr-2" />
								Saved
							</>
						) : justSaved ? (
							<>
								<Check className="w-4 h-4 mr-2" />
								Saved!
							</>
						) : (
							<>
								<Heart className="w-4 h-4 mr-2" />
								Save Outfit
							</>
						)}
					</Button>
				</div>

				{/* Save Dialog */}
				{showSaveDialog && (
					<div className="border rounded-lg p-4 bg-background mt-3">
						<h4 className="font-semibold mb-3">Save This Outfit</h4>
						<div className="space-y-3">
							<input
								type="text"
								placeholder={`Enter name for ${dayPlan.day} outfit...`}
								value={savedOutfitName}
								onChange={(e) =>
									setSavedOutfitName(e.target.value)
								}
								className="w-full px-3 py-2 border rounded-md text-sm"
								autoFocus
							/>
							<div className="flex gap-2">
								<Button
									size="sm"
									onClick={handleSaveOutfit}
									disabled={
										!savedOutfitName.trim() || isSaving
									}
									className="flex-1"
								>
									{isSaving ? (
										<>
											<div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
											Saving...
										</>
									) : (
										<>
											<Save className="w-4 h-4 mr-2" />
											Save
										</>
									)}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowSaveDialog(false)}
									disabled={isSaving}
									className="flex-1"
								>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
