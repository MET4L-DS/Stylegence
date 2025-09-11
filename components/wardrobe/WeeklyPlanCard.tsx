import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { OutfitDetailModal } from "./OutfitDetailModal";
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
	Eye,
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
	const [showOutfitDetail, setShowOutfitDetail] = useState(false);

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
		<Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20 border-2 border-muted hover:border-primary/30 overflow-hidden">
			{/* Enhanced Status Indicators */}
			<div className="absolute top-3 right-3 z-10 flex gap-1">
				{(isOutfitSaved || justSaved) && (
					<Badge variant="secondary" className="text-xs">
						<Heart className="w-3 h-3 fill-current mr-1" />
						Saved
					</Badge>
				)}
				{isHighSustainability && (
					<Badge variant="secondary" className="text-xs">
						<Leaf className="w-3 h-3 mr-1" />
						Eco
					</Badge>
				)}
				{isAIRecommended && (
					<Badge variant="secondary" className="text-xs">
						<Zap className="w-3 h-3 mr-1" />
						AI
					</Badge>
				)}
			</div>

			<CardHeader className="pb-3 px-4">
				<div className="flex justify-between items-start">
					<div className="min-w-0 flex-1 pr-4">
						<CardTitle className="text-lg font-bold text-foreground truncate">
							{dayPlan.day}
						</CardTitle>
						<CardDescription className="text-sm text-muted-foreground">
							{new Date().toLocaleDateString()}
						</CardDescription>
					</div>
					<div className="flex items-center gap-1 bg-chart-3/10 px-2 py-1 rounded-full border border-chart-3/20">
						<Star className="w-4 h-4 text-chart-3" />
						<span className="text-sm font-semibold text-chart-3">
							{comfortLevel}%
						</span>
					</div>
				</div>

				{/* Weather and Occasion Info */}
				<div className="flex items-center justify-between text-sm mt-3 p-2 bg-muted/30 rounded-lg">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Cloud className="w-4 h-4" />
						<span className="capitalize font-medium">
							{dayPlan.weather}
						</span>
					</div>
					<div className="text-right">
						<span className="capitalize font-semibold text-foreground">
							{dayPlan.occasion}
						</span>
					</div>
				</div>
			</CardHeader>

			<CardContent className="px-4 pb-4">
				<div className="space-y-4">
					{/* Outfit Items Display */}
					<div className="relative">
						<div className="aspect-[4/3] bg-gradient-to-br from-background via-muted/20 to-muted/40 rounded-xl border-2 border-dashed border-muted-foreground/20 relative overflow-hidden group-hover:border-primary/40 transition-colors">
							{/* Clothing Items Grid */}
							<div className="absolute inset-3">
								<div className="grid grid-cols-2 gap-2 h-full">
									{dayPlan.recommendedOutfit.items
										.slice(0, 4)
										.map((item, index) => (
											<div
												key={item._id}
												className="bg-background/90 backdrop-blur-sm rounded-lg flex items-center justify-center border border-border/50 overflow-hidden hover:scale-105 transition-transform shadow-sm"
											>
												{item.imageUrl ? (
													<>
														<img
															src={item.imageUrl}
															alt={
																item.customName ||
																"Item"
															}
															className="w-full h-full object-cover"
															onError={(e) => {
																const target =
																	e.target as HTMLImageElement;
																target.style.display =
																	"none";
																target.nextElementSibling?.classList.remove(
																	"hidden"
																);
															}}
														/>
														<div className="hidden">
															<div className="flex flex-col items-center justify-center text-center p-2">
																<User className="w-6 h-6 mb-1 text-primary/60" />
																<span className="text-xs text-primary/80 font-medium leading-tight">
																	{item.customName ||
																		item.aiCategory ||
																		"Item"}
																</span>
															</div>
														</div>
													</>
												) : (
													<div className="flex flex-col items-center justify-center text-center p-2">
														<User className="w-6 h-6 mb-1 text-primary/60" />
														<span className="text-xs text-primary/80 font-medium leading-tight">
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
											4 -
												dayPlan.recommendedOutfit.items
													.length
										),
									}).map((_, index) => (
										<div
											key={`empty-${index}`}
											className="bg-muted/30 rounded-lg flex items-center justify-center border border-muted"
										>
											<Palette className="w-5 h-5 text-muted-foreground" />
										</div>
									))}
								</div>
							</div>

							{/* Central AI Icon */}
							<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
								<div className="bg-primary/10 backdrop-blur-sm rounded-full p-3 border-2 border-primary/20 shadow-lg">
									<Sparkles className="w-7 h-7 text-primary" />
								</div>
							</div>

							{/* Item count badge */}
							<div className="absolute bottom-3 left-3 bg-black/80 text-white text-xs px-2 py-1 rounded-full font-medium">
								{dayPlan.recommendedOutfit.items.length} items
							</div>
						</div>
					</div>

					{/* Enhanced Stats Grid */}
					<div className="grid grid-cols-3 gap-3">
						<div className="text-center p-3 bg-chart-1/10 rounded-lg border border-chart-1/20">
							<DollarSign className="w-5 h-5 mx-auto mb-1 text-chart-1" />
							<span className="text-xs text-chart-1 font-medium block">
								Total Cost
							</span>
							<p className="text-sm font-bold text-chart-1">
								${totalCost.toFixed(0)}
							</p>
						</div>
						<div className="text-center p-3 bg-chart-2/10 rounded-lg border border-chart-2/20">
							<Leaf className="w-5 h-5 mx-auto mb-1 text-chart-2" />
							<span className="text-xs text-chart-2 font-medium block">
								Eco Score
							</span>
							<p className="text-sm font-bold text-chart-2">
								{sustainabilityScore.toFixed(0)}%
							</p>
						</div>
						<div className="text-center p-3 bg-chart-3/10 rounded-lg border border-chart-3/20">
							<Star className="w-5 h-5 mx-auto mb-1 text-chart-3" />
							<span className="text-xs text-chart-3 font-medium block">
								Comfort
							</span>
							<p className="text-sm font-bold text-chart-3">
								{comfortLevel.toFixed(0)}%
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="grid grid-cols-3 gap-2">
						<Button
							variant="outline"
							size="sm"
							className="text-xs font-medium hover:bg-primary/10 border-primary/20"
						>
							Use Today
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowOutfitDetail(true)}
							className="text-xs font-medium hover:bg-primary/10"
						>
							<Eye className="w-3 h-3 mr-1" />
							Details
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
							className={`text-xs font-medium ${
								isOutfitSaved || justSaved
									? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
									: "hover:bg-primary/10 border-primary/20"
							}`}
						>
							{isOutfitSaved ? (
								<>
									<Check className="w-3 h-3 mr-1" />
									Saved
								</>
							) : justSaved ? (
								<>
									<Check className="w-3 h-3 mr-1" />
									Saved!
								</>
							) : (
								<>
									<Heart className="w-3 h-3 mr-1" />
									Save
								</>
							)}
						</Button>
					</div>

					{/* Save Dialog */}
					{showSaveDialog && (
						<div className="border-2 border-primary/20 rounded-lg p-4 bg-gradient-to-b from-background to-muted/10 space-y-3">
							<h4 className="font-semibold text-base flex items-center gap-2">
								<Save className="w-4 h-4" />
								Save This Outfit
							</h4>
							<input
								type="text"
								placeholder={`Enter name for ${dayPlan.day} outfit...`}
								value={savedOutfitName}
								onChange={(e) =>
									setSavedOutfitName(e.target.value)
								}
								className="w-full px-3 py-2 border-2 border-muted rounded-lg text-sm focus:border-primary/50 focus:outline-none transition-colors"
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
											Save Outfit
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
					)}
				</div>
			</CardContent>

			{/* Outfit Detail Modal */}
			<OutfitDetailModal
				open={showOutfitDetail}
				onOpenChange={setShowOutfitDetail}
				outfit={{
					name: `${dayPlan.day} Weekly Plan`,
					description: `${dayPlan.day} outfit - ${dayPlan.occasion}`,
					items: dayPlan.recommendedOutfit.items,
					metadata: dayPlan.recommendedOutfit.metadata,
					tags: [dayPlan.day.toLowerCase(), "weekly-plan"],
					occasion: dayPlan.occasion,
				}}
				context="weekly"
				dayInfo={{
					day: dayPlan.day,
					occasion: dayPlan.occasion,
					weather: dayPlan.weather,
				}}
				onSaveOutfit={() => {
					// Refresh the user outfits query to update the saved status
					setJustSaved(true);
					setTimeout(() => setJustSaved(false), 3000);
				}}
			/>
		</Card>
	);
}
