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
import { OutfitDetailModal } from "./OutfitDetailModal";
import {
	Cloud,
	Star,
	Palette,
	Brain,
	Leaf,
	TrendingUp,
	DollarSign,
	RefreshCw,
	Heart,
	Save,
	Eye,
} from "lucide-react";

interface TodaysRecommendationCardProps {
	selectedDay: string;
	userPreferences?: {
		stylePreferences?: string[];
		bodyType?: string;
		favoriteBrands?: string[];
		preferredCurrency?: string;
		name?: string;
	} | null;
}

export function TodaysRecommendationCard({
	selectedDay,
	userPreferences,
}: TodaysRecommendationCardProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [savedOutfitName, setSavedOutfitName] = useState("");
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [justSaved, setJustSaved] = useState(false);
	const [showOutfitDetail, setShowOutfitDetail] = useState(false);

	// Get outfit suggestion from Convex
	const outfitSuggestion = useQuery(api.outfits.generateOutfitSuggestion, {
		occasion:
			selectedDay === "Saturday" || selectedDay === "Sunday"
				? "weekend"
				: "casual",
		weather: "mild", // This could be dynamic based on weather API
	});

	// Get user's saved outfits to check if this combination is already saved
	const userOutfits = useQuery(api.outfits.getUserOutfits, {});
	const saveOutfit = useMutation(api.outfits.saveOutfit);

	// Check if this outfit combination is already saved
	const isOutfitSaved =
		(outfitSuggestion?.items &&
			userOutfits?.some((outfit) => {
				const outfitItemIds = outfit.items
					.map((item) => item?._id)
					.filter(Boolean)
					.sort();
				const currentItemIds = outfitSuggestion.items
					.map((item) => item._id)
					.sort();
				return (
					outfitItemIds.length === currentItemIds.length &&
					outfitItemIds.every(
						(id, index) => id === currentItemIds[index]
					)
				);
			})) ||
		false;

	const handleSaveOutfit = async () => {
		if (!outfitSuggestion?.items || !savedOutfitName.trim()) return;

		setIsSaving(true);
		try {
			await saveOutfit({
				name: savedOutfitName,
				description: `AI-generated outfit for ${selectedDay}`,
				wardrobeItemIds: outfitSuggestion.items.map(
					(item) => item._id as any
				),
				tags: ["ai-generated", selectedDay.toLowerCase()],
				occasion: outfitSuggestion.metadata.occasion,
				visibility: "PRIVATE",
			});

			setShowSaveDialog(false);
			setSavedOutfitName("");
			setIsSaving(false);

			// Show success toast
			toast.success("Outfit saved successfully!", {
				description: `"${savedOutfitName}" has been added to your wardrobe`,
				duration: 3000,
			});

			// Show "Saved!" state temporarily
			setJustSaved(true);
			setTimeout(() => setJustSaved(false), 2000);
		} catch (error) {
			console.error("Failed to save outfit:", error);
			setIsSaving(false);

			// Show error toast
			toast.error("Failed to save outfit", {
				description: "Please try again later",
				duration: 4000,
			});
		}
	};

	const handleRefreshOutfit = () => {
		setIsGenerating(true);

		// Show loading toast
		toast.loading("Generating new outfit suggestion...", {
			duration: 1000,
		});

		// Force re-query by invalidating the cache
		setTimeout(() => {
			setIsGenerating(false);
			toast.success("New outfit generated!", {
				description: "Fresh style suggestions ready for you",
				duration: 2000,
			});
		}, 1000);
	};

	if (!outfitSuggestion) {
		return (
			<Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
				<CardHeader className="pt-6">
					<CardTitle className="text-lg">
						Generating Your Perfect Look...
					</CardTitle>
					<CardDescription>
						<div className="flex items-center gap-2">
							<RefreshCw className="w-4 h-4 animate-spin" />
							Creating personalized outfit suggestion
						</div>
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const { items, metadata } = outfitSuggestion;
	const isAIGenerated = metadata.isAIGenerated;
	const sustainabilityScore = metadata.sustainabilityScore;
	const estimatedCost = metadata.totalCost;
	const comfortLevel = Math.min(
		100,
		Math.max(50, 100 - metadata.avgWearCount)
	); // Comfort based on wear frequency

	return (
		<Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
			{/* AI Badge */}
			{isAIGenerated && (
				<div className="absolute top-4 left-4 z-10">
					<Badge
						variant="secondary"
						className="bg-chart-5/10 text-chart-5 border-chart-5/20 text-xs"
					>
						<Brain className="w-3 h-3 mr-1" />
						AI Curated
					</Badge>
				</div>
			)}

			<CardHeader className="pt-6">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg">
							{selectedDay === "Wednesday"
								? "Today's"
								: `${selectedDay}'s`}{" "}
							Perfect Look
						</CardTitle>
						<CardDescription className="flex items-center gap-2 mt-1">
							<Cloud className="w-4 h-4" />
							{selectedDay},{" "}
							{new Date().toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
							})}{" "}
							• {metadata.weather}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleRefreshOutfit}
							disabled={isGenerating}
						>
							<RefreshCw
								className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
							/>
						</Button>
						<div className="flex items-center gap-1">
							<Star className="w-5 h-5 text-chart-3" />
							<span className="text-lg font-bold">
								{comfortLevel}%
							</span>
						</div>
					</div>
				</div>

				{/* Quick Stats */}
				<div className="flex gap-2 mt-3">
					{sustainabilityScore > 0 && (
						<Badge variant="outline" className="text-xs">
							<Leaf className="w-3 h-3 mr-1" />
							{sustainabilityScore.toFixed(0)}% Eco
						</Badge>
					)}
					{comfortLevel > 0 && (
						<Badge variant="outline" className="text-xs">
							<TrendingUp className="w-3 h-3 mr-1" />
							{comfortLevel}% Comfort
						</Badge>
					)}
					{estimatedCost > 0 && (
						<Badge variant="outline" className="text-xs">
							<DollarSign className="w-3 h-3 mr-1" />$
							{estimatedCost.toFixed(0)}
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Outfit Items Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
					{items.map((item, index) => (
						<div
							key={item._id}
							className="group relative bg-background rounded-lg border p-2 hover:shadow-md transition-shadow"
						>
							<div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
								{item.imageUrl ? (
									<img
										src={item.imageUrl}
										alt={item.customName || "Wardrobe item"}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<Palette className="w-8 h-8 text-muted-foreground" />
									</div>
								)}
							</div>
							<div className="space-y-1">
								<p className="text-xs font-medium line-clamp-1">
									{item.customName || "Untitled Item"}
								</p>
								<p className="text-xs text-muted-foreground capitalize">
									{item.aiCategory || "Item"}
								</p>
							</div>
							{/* Category indicator */}
							<div className="absolute top-1 left-1">
								<div
									className={`w-3 h-3 rounded-full ${
										index === 0
											? "bg-chart-1"
											: index === 1
												? "bg-chart-2"
												: index === 2
													? "bg-chart-3"
													: "bg-chart-4"
									}`}
								></div>
							</div>
						</div>
					))}
				</div>

				{/* Outfit Insights */}
				<div className="space-y-3">
					<div className="grid grid-cols-3 gap-3">
						<div className="text-center p-3 bg-muted/50 rounded-lg">
							<DollarSign className="w-4 h-4 mx-auto mb-1 text-chart-1" />
							<p className="text-xs text-muted-foreground">
								Total Cost
							</p>
							<p className="text-sm font-semibold">
								${estimatedCost.toFixed(0)}
							</p>
						</div>
						<div className="text-center p-3 bg-muted/50 rounded-lg">
							<Leaf className="w-4 h-4 mx-auto mb-1 text-chart-2" />
							<p className="text-xs text-muted-foreground">
								Eco Score
							</p>
							<p className="text-sm font-semibold">
								{sustainabilityScore.toFixed(0)}%
							</p>
						</div>
						<div className="text-center p-3 bg-muted/50 rounded-lg">
							<Star className="w-4 h-4 mx-auto mb-1 text-chart-3" />
							<p className="text-xs text-muted-foreground">
								Comfort
							</p>
							<p className="text-sm font-semibold">
								{comfortLevel}%
							</p>
						</div>
					</div>

					{/* AI Insights */}
					{isAIGenerated && (
						<div className="bg-chart-5/10 rounded-lg p-4 border border-chart-5/20">
							<div className="flex items-center gap-2 mb-3">
								<Brain className="w-4 h-4 text-chart-5" />
								<h4 className="text-sm font-semibold text-chart-5">
									AI Styling Notes
								</h4>
							</div>
							<div className="space-y-2 text-sm text-chart-5">
								<p>
									• Perfect for {metadata.occasion} occasions
								</p>
								<p>
									• Weather-appropriate for {metadata.weather}{" "}
									conditions
								</p>
								<p>
									•{" "}
									{sustainabilityScore > 70
										? "Highly sustainable"
										: "Moderately sustainable"}{" "}
									choice
								</p>
								{estimatedCost > 200 && (
									<p>• Premium outfit with quality pieces</p>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Status indicators */}
				{(isOutfitSaved || justSaved) && (
					<div className="flex items-center gap-2 mb-3">
						<div className="flex items-center gap-1 px-2 py-1 bg-chart-2/10 text-chart-2 border border-chart-2/20 rounded-md text-xs">
							<Heart className="h-3 w-3 fill-current" />
							{justSaved ? "Saved!" : "Saved"}
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-2 pt-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefreshOutfit}
						disabled={isGenerating}
						className="flex-1"
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}
						/>
						New Suggestion
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowOutfitDetail(true)}
						className="flex-1"
					>
						<Eye className="w-4 h-4 mr-2" />
						View Details
					</Button>
					<Button
						size="sm"
						onClick={() => {
							if (isOutfitSaved || justSaved) {
								toast.warning("Outfit already saved", {
									description:
										"This outfit combination is already in your wardrobe",
									duration: 3000,
								});
							} else {
								setShowSaveDialog(true);
							}
						}}
						disabled={false}
						className="flex-1"
						variant={
							isOutfitSaved || justSaved ? "outline" : "default"
						}
					>
						<Heart
							className={`w-4 h-4 mr-2 ${isOutfitSaved ? "fill-current" : ""}`}
						/>
						{justSaved
							? "Saved!"
							: isOutfitSaved
								? "Already Saved"
								: "Save Outfit"}
					</Button>
				</div>

				{/* Save Dialog */}
				{showSaveDialog && (
					<div className="border rounded-lg p-4 bg-background">
						<h4 className="font-semibold mb-3">Save This Outfit</h4>
						{isOutfitSaved && (
							<div className="text-sm text-chart-3 mb-3 p-2 bg-chart-3/10 rounded border border-chart-3/20">
								⚠️ This outfit combination is already saved.
								Saving again will create a duplicate.
							</div>
						)}
						<div className="space-y-3">
							<input
								type="text"
								placeholder="Enter outfit name..."
								value={savedOutfitName}
								onChange={(e) =>
									setSavedOutfitName(e.target.value)
								}
								className="w-full px-3 py-2 border rounded-md text-sm"
								autoFocus
								disabled={isSaving}
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
											<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
									onClick={() => {
										setShowSaveDialog(false);
										setSavedOutfitName("");
									}}
									className="flex-1"
									disabled={isSaving}
								>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				)}
			</CardContent>

			{/* Outfit Detail Modal */}
			{outfitSuggestion && (
				<OutfitDetailModal
					open={showOutfitDetail}
					onOpenChange={setShowOutfitDetail}
					outfit={{
						name: `${selectedDay}'s Outfit`,
						description: "AI-generated outfit recommendation",
						items: outfitSuggestion.items,
						metadata: outfitSuggestion.metadata,
						tags: ["ai-generated", selectedDay.toLowerCase()],
						occasion:
							selectedDay === "Saturday" ||
							selectedDay === "Sunday"
								? "weekend"
								: "casual",
					}}
					context="recommendation"
					dayInfo={{
						day: selectedDay,
						occasion:
							selectedDay === "Saturday" ||
							selectedDay === "Sunday"
								? "weekend"
								: "casual",
						weather: "mild",
					}}
					onSaveOutfit={() => {
						// Refresh the user outfits query to update the saved status
						setJustSaved(true);
						setTimeout(() => setJustSaved(false), 3000);
					}}
				/>
			)}
		</Card>
	);
}
