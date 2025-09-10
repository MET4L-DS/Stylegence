import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
	Heart,
	Calendar,
	Star,
	Users,
	Eye,
	Thermometer,
	Cloud,
	Leaf,
	Zap,
	TrendingUp,
	DollarSign,
	User,
	Palette,
	Brain,
	Save,
	Check,
	RefreshCw,
	Trash2,
	Edit3,
	ImageIcon,
	ShoppingBag,
	Timer,
	Award,
} from "lucide-react";

interface OutfitDetailModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	outfit?: {
		_id?: string;
		name?: string;
		description?: string;
		tags?: string[];
		occasion?: string;
		visibility?: "PUBLIC" | "PRIVATE" | "GROUP";
		items: Array<{
			_id: string;
			customName?: string;
			aiCategory?: string;
			imageUrl?: string;
			dominantColors?: string[];
			purchasePrice?: number;
			purchaseCurrency?: string;
			wearCount?: number;
			lastWornAt?: number;
			aiTags?: string[];
		}>;
		metadata?: {
			totalCost?: number;
			avgWearCount?: number;
			sustainabilityScore?: number;
			isAIGenerated?: boolean;
			comfortLevel?: number;
			generatedAt?: number;
		};
		createdAt?: number;
		lastWorn?: string;
	};
	context?: "recommendation" | "weekly" | "saved";
	dayInfo?: {
		day: string;
		occasion: string;
		weather: string;
	};
	onSaveOutfit?: () => void;
	onDeleteOutfit?: () => void;
}

export function OutfitDetailModal({
	open,
	onOpenChange,
	outfit,
	context = "saved",
	dayInfo,
	onSaveOutfit,
	onDeleteOutfit,
}: OutfitDetailModalProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedName, setEditedName] = useState("");
	const [editedDescription, setEditedDescription] = useState("");
	const [savedOutfitName, setSavedOutfitName] = useState("");
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Get user's saved outfits to check if this combination is already saved
	const userOutfits = useQuery(api.outfits.getUserOutfits, {});
	const saveOutfit = useMutation(api.outfits.saveOutfit);
	const updateOutfit = useMutation(api.outfits.updateOutfit);
	const deleteOutfit = useMutation(api.outfits.deleteOutfit);

	// Check if this outfit combination is already saved (for recommendations/weekly)
	const isOutfitSaved =
		context !== "saved" &&
		outfit?.items &&
		userOutfits?.some((savedOutfit) => {
			const outfitItemIds = savedOutfit.items
				.map((item) => item?._id)
				.filter(Boolean)
				.sort();
			const currentItemIds = outfit.items.map((item) => item._id).sort();
			return (
				outfitItemIds.length === currentItemIds.length &&
				outfitItemIds.every((id, index) => id === currentItemIds[index])
			);
		});

	useEffect(() => {
		if (outfit && isEditing) {
			setEditedName(outfit.name || "");
			setEditedDescription(outfit.description || "");
		}
	}, [outfit, isEditing]);

	const handleSaveOutfit = async () => {
		if (!outfit?.items || !savedOutfitName.trim()) return;

		setIsSaving(true);
		try {
			await saveOutfit({
				name: savedOutfitName,
				description: dayInfo
					? `${dayInfo.day} outfit - ${dayInfo.occasion}`
					: outfit.description || "Saved outfit",
				wardrobeItemIds: outfit.items.map((item) => item._id as any),
				tags: [
					...(outfit.tags || []),
					...(dayInfo ? [dayInfo.day.toLowerCase()] : []),
					...(outfit.metadata?.isAIGenerated ? ["ai-generated"] : []),
				],
				occasion: dayInfo?.occasion || outfit.occasion || "casual",
				visibility: "PRIVATE",
			});

			setShowSaveDialog(false);
			setSavedOutfitName("");
			toast.success("Outfit saved successfully!");
			onSaveOutfit?.();
		} catch (error) {
			console.error("Failed to save outfit:", error);
			toast.error("Failed to save outfit");
		} finally {
			setIsSaving(false);
		}
	};

	const handleUpdateOutfit = async () => {
		if (!outfit?._id || !editedName.trim()) return;

		setIsSaving(true);
		try {
			await updateOutfit({
				outfitId: outfit._id as any,
				name: editedName,
				description: editedDescription,
			});

			setIsEditing(false);
			toast.success("Outfit updated successfully!");
		} catch (error) {
			console.error("Failed to update outfit:", error);
			toast.error("Failed to update outfit");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteOutfit = async () => {
		if (!outfit?._id) return;

		setIsDeleting(true);
		try {
			await deleteOutfit({ outfitId: outfit._id as any });
			toast.success("Outfit deleted successfully!");
			onDeleteOutfit?.();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete outfit:", error);
			toast.error("Failed to delete outfit");
		} finally {
			setIsDeleting(false);
		}
	};

	if (!outfit) return null;

	const totalCost = outfit.metadata?.totalCost || 0;
	const sustainabilityScore = outfit.metadata?.sustainabilityScore || 0;
	const comfortLevel = outfit.metadata?.comfortLevel || 0;
	const avgWearCount = outfit.metadata?.avgWearCount || 0;

	const getContextTitle = () => {
		switch (context) {
			case "recommendation":
				return dayInfo
					? `${dayInfo.day}'s Recommendation`
					: "Outfit Recommendation";
			case "weekly":
				return dayInfo
					? `${dayInfo.day} Weekly Plan`
					: "Weekly Plan Outfit";
			case "saved":
				return outfit.name || "Saved Outfit";
			default:
				return "Outfit Details";
		}
	};

	const getContextDescription = () => {
		switch (context) {
			case "recommendation":
				return "AI-generated outfit recommendation tailored to your preferences";
			case "weekly":
				return dayInfo
					? `Planned for ${dayInfo.occasion} on ${dayInfo.day}`
					: "Weekly planned outfit";
			case "saved":
				return outfit.description || "Your saved outfit details";
			default:
				return "";
		}
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="max-h-[85vh] mx-auto max-w-7xl w-full">
				<div className="flex flex-col h-full">
					<DrawerHeader className="px-4 sm:px-6 py-4 border-b">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex-1 min-w-0">
								{isEditing ? (
									<div className="space-y-3">
										<div>
											<Label htmlFor="outfit-name">
												Outfit Name
											</Label>
											<Input
												id="outfit-name"
												value={editedName}
												onChange={(e) =>
													setEditedName(
														e.target.value
													)
												}
												placeholder="Enter outfit name"
											/>
										</div>
										<div>
											<Label htmlFor="outfit-description">
												Description
											</Label>
											<Input
												id="outfit-description"
												value={editedDescription}
												onChange={(e) =>
													setEditedDescription(
														e.target.value
													)
												}
												placeholder="Enter outfit description"
											/>
										</div>
									</div>
								) : (
									<>
										<DrawerTitle className="text-xl sm:text-2xl truncate">
											{getContextTitle()}
										</DrawerTitle>
										<DrawerDescription className="text-sm sm:text-base mt-1">
											{getContextDescription()}
										</DrawerDescription>
									</>
								)}
							</div>
							<div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
								{context === "saved" && (
									<>
										{isEditing ? (
											<>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														setIsEditing(false)
													}
												>
													Cancel
												</Button>
												<Button
													size="sm"
													onClick={handleUpdateOutfit}
													disabled={
														isSaving ||
														!editedName.trim()
													}
												>
													{isSaving ? (
														<RefreshCw className="w-4 h-4 animate-spin mr-2" />
													) : (
														<Save className="w-4 h-4 mr-2" />
													)}
													<span className="hidden sm:inline">
														Save Changes
													</span>
													<span className="sm:hidden">
														Save
													</span>
												</Button>
											</>
										) : (
											<>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														setIsEditing(true)
													}
												>
													<Edit3 className="w-4 h-4 mr-2" />
													<span className="hidden sm:inline">
														Edit
													</span>
												</Button>
												<Button
													variant="destructive"
													size="sm"
													onClick={handleDeleteOutfit}
													disabled={isDeleting}
												>
													{isDeleting ? (
														<RefreshCw className="w-4 h-4 animate-spin mr-2" />
													) : (
														<Trash2 className="w-4 h-4 mr-2" />
													)}
													<span className="hidden sm:inline">
														Delete
													</span>
												</Button>
											</>
										)}
									</>
								)}
								{context !== "saved" && !isOutfitSaved && (
									<Button
										size="sm"
										onClick={() => setShowSaveDialog(true)}
										className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
									>
										<Heart className="w-4 h-4 mr-2" />
										<span className="hidden sm:inline">
											Save Outfit
										</span>
										<span className="sm:hidden">Save</span>
									</Button>
								)}
								{context !== "saved" && isOutfitSaved && (
									<Badge
										variant="secondary"
										className="bg-green-100 text-green-700"
									>
										<Check className="w-3 h-3 mr-1" />
										Saved
									</Badge>
								)}
							</div>
						</div>
					</DrawerHeader>

					<ScrollArea className="px-4 sm:px-6 py-4 h-[calc(85vh-120px)]">
						<div className="space-y-6 sm:space-y-8 pb-16">
							{/* Outfit Items Grid */}
							<div>
								<h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
									<ShoppingBag className="w-4 sm:w-5 h-4 sm:h-5" />
									Outfit Items ({outfit.items.length})
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
									{outfit.items.map((item, index) => (
										<Card
											key={item._id}
											className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] mb-2"
										>
											<CardContent className="p-3 sm:p-4">
												<div className="aspect-[3/4] bg-muted rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-muted/80 transition-colors">
													{item.imageUrl ? (
														<img
															src={item.imageUrl}
															alt={
																item.customName ||
																"Item"
															}
															className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
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
													) : null}
													<div
														className={`flex flex-col items-center justify-center text-muted-foreground ${item.imageUrl ? "hidden" : ""}`}
													>
														<ImageIcon className="w-12 h-12 mb-2" />
														<span className="text-sm text-center px-2">
															No Image
														</span>
													</div>
												</div>
												<div className="space-y-3 pb-2">
													<div>
														<h4 className="font-semibold text-base leading-tight">
															{item.customName ||
																"Untitled Item"}
														</h4>
														{item.aiCategory && (
															<p className="text-sm text-muted-foreground capitalize">
																{
																	item.aiCategory
																}
															</p>
														)}
													</div>

													{item.dominantColors &&
														item.dominantColors
															.length > 0 && (
															<div className="flex gap-2 items-center">
																<span className="text-xs text-muted-foreground">
																	Colors:
																</span>
																<div className="flex gap-1">
																	{item.dominantColors
																		.slice(
																			0,
																			4
																		)
																		.map(
																			(
																				color,
																				colorIndex
																			) => (
																				<div
																					key={
																						colorIndex
																					}
																					className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm"
																					style={{
																						backgroundColor:
																							color,
																					}}
																					title={
																						color
																					}
																				/>
																			)
																		)}
																</div>
															</div>
														)}

													<div className="flex flex-wrap gap-2">
														{item.purchasePrice && (
															<Badge
																variant="outline"
																className="text-xs"
															>
																<DollarSign className="w-3 h-3 mr-1" />
																{
																	item.purchasePrice
																}{" "}
																{item.purchaseCurrency ||
																	"USD"}
															</Badge>
														)}
														{item.wearCount !==
															undefined && (
															<Badge
																variant="outline"
																className="text-xs"
															>
																<Timer className="w-3 h-3 mr-1" />
																{item.wearCount}
																x worn
															</Badge>
														)}
													</div>

													{item.aiTags &&
														item.aiTags.length >
															0 && (
															<div className="flex flex-wrap gap-1">
																{item.aiTags
																	.slice(0, 3)
																	.map(
																		(
																			tag,
																			tagIndex
																		) => (
																			<Badge
																				key={
																					tagIndex
																				}
																				variant="secondary"
																				className="text-xs"
																			>
																				{
																					tag
																				}
																			</Badge>
																		)
																	)}
																{item.aiTags
																	.length >
																	3 && (
																	<Badge
																		variant="secondary"
																		className="text-xs"
																	>
																		+
																		{item
																			.aiTags
																			.length -
																			3}{" "}
																		more
																	</Badge>
																)}
															</div>
														)}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>

							<Separator />

							{/* Outfit Metadata */}
							{outfit.metadata && (
								<div>
									<h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
										<Award className="w-4 sm:w-5 h-4 sm:h-5" />
										Outfit Analytics
									</h3>
									<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
										{totalCost > 0 && (
											<Card className="hover:shadow-md transition-shadow">
												<CardContent className="p-3 sm:p-6 text-center">
													<DollarSign className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 sm:mb-3 text-green-600" />
													<div className="text-xl sm:text-3xl font-bold text-green-600">
														${totalCost}
													</div>
													<div className="text-xs sm:text-sm text-muted-foreground">
														Total Value
													</div>
												</CardContent>
											</Card>
										)}
										{sustainabilityScore > 0 && (
											<Card className="hover:shadow-md transition-shadow">
												<CardContent className="p-3 sm:p-6 text-center">
													<Leaf className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 sm:mb-3 text-green-600" />
													<div className="text-xl sm:text-3xl font-bold text-green-600">
														{sustainabilityScore}%
													</div>
													<div className="text-xs sm:text-sm text-muted-foreground">
														Sustainability
													</div>
												</CardContent>
											</Card>
										)}
										{comfortLevel > 0 && (
											<Card className="hover:shadow-md transition-shadow">
												<CardContent className="p-3 sm:p-6 text-center">
													<Star className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 sm:mb-3 text-yellow-500" />
													<div className="text-xl sm:text-3xl font-bold text-yellow-600">
														{comfortLevel}/10
													</div>
													<div className="text-xs sm:text-sm text-muted-foreground">
														Comfort Level
													</div>
												</CardContent>
											</Card>
										)}
										{avgWearCount > 0 && (
											<Card className="hover:shadow-md transition-shadow">
												<CardContent className="p-3 sm:p-6 text-center">
													<TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 sm:mb-3 text-blue-600" />
													<div className="text-xl sm:text-3xl font-bold text-blue-600">
														{avgWearCount.toFixed(
															1
														)}
													</div>
													<div className="text-xs sm:text-sm text-muted-foreground">
														Avg. Wear Count
													</div>
												</CardContent>
											</Card>
										)}
									</div>
								</div>
							)}

							{/* Outfit Tags */}
							{outfit.tags && outfit.tags.length > 0 && (
								<div>
									<h3 className="text-lg font-semibold mb-3">
										Tags
									</h3>
									<div className="flex flex-wrap gap-2">
										{outfit.tags.map((tag, index) => (
											<Badge
												key={index}
												variant="secondary"
												className="text-sm px-3 py-1"
											>
												{tag}
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Outfit Info */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
								{dayInfo && (
									<Card className="hover:shadow-md transition-shadow">
										<CardContent className="p-6">
											<h4 className="font-semibold mb-4 flex items-center gap-2">
												<Calendar className="w-5 h-5" />
												Day Information
											</h4>
											<div className="space-y-3 text-sm">
												<div className="flex justify-between">
													<span className="font-medium">
														Day:
													</span>
													<span>{dayInfo.day}</span>
												</div>
												<div className="flex justify-between">
													<span className="font-medium">
														Occasion:
													</span>
													<span className="capitalize">
														{dayInfo.occasion}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="font-medium">
														Weather:
													</span>
													<span className="capitalize">
														{dayInfo.weather}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								)}
								{outfit.metadata?.isAIGenerated && (
									<Card className="hover:shadow-md transition-shadow">
										<CardContent className="p-6">
											<h4 className="font-semibold mb-4 flex items-center gap-2">
												<Brain className="w-5 h-5" />
												AI Generated
											</h4>
											<div className="text-sm text-muted-foreground mb-3">
												This outfit was created using AI
												recommendations based on your
												style preferences and wardrobe.
											</div>
											{outfit.metadata.generatedAt && (
												<div className="text-xs text-muted-foreground">
													Generated:{" "}
													{new Date(
														outfit.metadata.generatedAt
													).toLocaleString()}
												</div>
											)}
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					</ScrollArea>
				</div>

				{/* Save Dialog */}
				{showSaveDialog && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
						<Card className="w-full max-w-md mx-4">
							<CardContent className="p-6">
								<h3 className="text-lg font-semibold mb-4">
									Save Outfit
								</h3>
								<div className="space-y-4">
									<div>
										<Label htmlFor="save-outfit-name">
											Outfit Name
										</Label>
										<Input
											id="save-outfit-name"
											value={savedOutfitName}
											onChange={(e) =>
												setSavedOutfitName(
													e.target.value
												)
											}
											placeholder="Enter a name for this outfit"
										/>
									</div>
									<div className="flex gap-3 justify-end">
										<Button
											variant="outline"
											onClick={() =>
												setShowSaveDialog(false)
											}
										>
											Cancel
										</Button>
										<Button
											onClick={handleSaveOutfit}
											disabled={
												isSaving ||
												!savedOutfitName.trim()
											}
										>
											{isSaving ? (
												<RefreshCw className="w-4 h-4 animate-spin mr-2" />
											) : (
												<Save className="w-4 h-4 mr-2" />
											)}
											Save Outfit
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
}
