"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Edit3,
	Trash2,
	Save,
	X,
	Calendar,
	Tag,
	Eye,
	EyeOff,
	DollarSign,
	Palette,
	Package,
	Clock,
	MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { WARDROBE_CATEGORIES } from "@/data/constants";
import type { WardrobeItem } from "@/data/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WardrobeItemDetailModalProps {
	item: WardrobeItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onItemUpdated?: () => void;
	onItemDeleted?: () => void;
}

const COMMON_BRANDS = [
	"Nike",
	"Adidas",
	"Zara",
	"H&M",
	"Uniqlo",
	"Forever 21",
	"Urban Outfitters",
	"Gap",
	"Old Navy",
	"Target",
	"Custom/Handmade",
	"Unknown",
	"Other",
];

const COMMON_COLORS = [
	"Black",
	"White",
	"Gray",
	"Navy",
	"Blue",
	"Red",
	"Pink",
	"Purple",
	"Green",
	"Yellow",
	"Orange",
	"Brown",
	"Beige",
	"Cream",
	"Gold",
	"Silver",
];

const VISIBILITY_OPTIONS = [
	{ value: "private", label: "Private (Only me)" },
	{ value: "family", label: "Family" },
	{ value: "friends", label: "Friends" },
	{ value: "public", label: "Public" },
];

export function WardrobeItemDetailModal({
	item,
	open,
	onOpenChange,
	onItemUpdated,
	onItemDeleted,
}: WardrobeItemDetailModalProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [editedTags, setEditedTags] = useState<string[]>([]);
	const [newTag, setNewTag] = useState("");
	const [daysSinceWorn, setDaysSinceWorn] = useState<number | null>(null);
	const [isClient, setIsClient] = useState(false);

	// Form state for editing
	const [formData, setFormData] = useState({
		customName: "",
		category: "",
		brand: "",
		color: "",
		notes: "",
		visibility: "private",
	});

	const updateWardrobeItem = useMutation(
		api.wardrobeItems.updateWardrobeItem
	);
	const deleteWardrobeItem = useMutation(
		api.wardrobeItems.deleteWardrobeItem
	);
	const recordWear = useMutation(api.wardrobeItems.recordWear);

	// Initialize form data when item changes
	useEffect(() => {
		if (item) {
			const brandTag = item.aiTags?.find((tag) =>
				tag.startsWith("brand:")
			);
			const notesTag = item.aiTags?.find((tag) =>
				tag.startsWith("notes:")
			);
			const regularTags =
				item.aiTags?.filter(
					(tag) =>
						!tag.startsWith("brand:") &&
						!tag.startsWith("size:") &&
						!tag.startsWith("notes:")
				) || [];

			setFormData({
				customName: item.customName || "",
				category: item.aiCategory || "",
				brand: brandTag?.replace("brand:", "") || "",
				color: item.dominantColors?.[0] || "",
				notes: notesTag?.replace("notes:", "") || "",
				visibility: item.visibility || "private",
			});
			setEditedTags(regularTags);
		}
	}, [item]);

	// Set client-side only values to prevent hydration mismatch
	useEffect(() => {
		setIsClient(true);
		if (item?.lastWornAt) {
			const days = Math.floor(
				(Date.now() - item.lastWornAt) / (1000 * 60 * 60 * 24)
			);
			setDaysSinceWorn(days);
		} else {
			setDaysSinceWorn(null);
		}
	}, [item?.lastWornAt]);

	if (!item) return null;

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		// Reset form data
		if (item) {
			const brandTag = item.aiTags?.find((tag) =>
				tag.startsWith("brand:")
			);
			const notesTag = item.aiTags?.find((tag) =>
				tag.startsWith("notes:")
			);
			const regularTags =
				item.aiTags?.filter(
					(tag) =>
						!tag.startsWith("brand:") &&
						!tag.startsWith("size:") &&
						!tag.startsWith("notes:")
				) || [];

			setFormData({
				customName: item.customName || "",
				category: item.aiCategory || "",
				brand: brandTag?.replace("brand:", "") || "",
				color: item.dominantColors?.[0] || "",
				notes: notesTag?.replace("notes:", "") || "",
				visibility: item.visibility || "private",
			});
			setEditedTags(regularTags);
		}
	};

	const handleSave = async () => {
		if (!item) return;

		setIsLoading(true);
		try {
			// Build tags array with structured metadata
			const tags = [...editedTags];
			if (formData.brand) {
				tags.push(`brand:${formData.brand}`);
			}
			if (formData.notes) {
				tags.push(`notes:${formData.notes}`);
			}

			await updateWardrobeItem({
				id: item.id as any,
				customName: formData.customName,
				category: formData.category,
				visibility: formData.visibility,
				tags: tags,
				notes: formData.notes,
			});

			toast.success("Item updated successfully!");
			setIsEditing(false);
			onItemUpdated?.();
		} catch (error) {
			console.error("Error updating item:", error);
			toast.error("Failed to update item");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!item) return;

		setIsLoading(true);
		try {
			await deleteWardrobeItem({
				id: item.id as any,
			});

			toast.success("Item deleted successfully!");
			setShowDeleteDialog(false);
			onOpenChange(false);
			onItemDeleted?.();
		} catch (error) {
			console.error("Error deleting item:", error);
			toast.error("Failed to delete item");
		} finally {
			setIsLoading(false);
		}
	};

	const handleRecordWear = async () => {
		if (!item) return;

		try {
			await recordWear({
				id: item.id as any,
			});

			toast.success("Wear recorded!");
			onItemUpdated?.();
		} catch (error) {
			console.error("Error recording wear:", error);
			toast.error("Failed to record wear");
		}
	};

	const handleAddTag = () => {
		if (newTag.trim() && !editedTags.includes(newTag.trim())) {
			setEditedTags([...editedTags, newTag.trim()]);
			setNewTag("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setEditedTags(editedTags.filter((tag) => tag !== tagToRemove));
	};

	const brandTag = item.aiTags?.find((tag) => tag.startsWith("brand:"));
	const notesTag = item.aiTags?.find((tag) => tag.startsWith("notes:"));
	const sizeTag = item.aiTags?.find((tag) => tag.startsWith("size:"));
	const regularTags =
		item.aiTags?.filter(
			(tag) =>
				!tag.startsWith("brand:") &&
				!tag.startsWith("size:") &&
				!tag.startsWith("notes:")
		) || [];

	return (
		<>
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent className="max-h-[90vh] max-w-6xl mx-auto flex flex-col">
					<DrawerHeader className="flex-shrink-0">
						<div className="flex items-center justify-between">
							<DrawerTitle className="flex items-center gap-2">
								{isEditing ? (
									<Input
										value={formData.customName}
										onChange={(e) =>
											setFormData({
												...formData,
												customName: e.target.value,
											})
										}
										className="text-lg font-semibold"
										placeholder="Item name"
									/>
								) : (
									<span>
										{item.customName || "Untitled Item"}
									</span>
								)}
							</DrawerTitle>

							<div className="flex items-center gap-2">
								{!isEditing && (
									<>
										<Button
											variant="outline"
											size="sm"
											onClick={handleRecordWear}
										>
											<Clock className="w-4 h-4 mr-1" />
											Worn Today
										</Button>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													size="sm"
												>
													<MoreHorizontal className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={handleEdit}
												>
													<Edit3 className="w-4 h-4 mr-2" />
													Edit Item
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() =>
														setShowDeleteDialog(
															true
														)
													}
													className="text-destructive"
												>
													<Trash2 className="w-4 h-4 mr-2" />
													Delete Item
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</>
								)}

								{isEditing && (
									<>
										<Button
											variant="outline"
											size="sm"
											onClick={handleCancelEdit}
										>
											<X className="w-4 h-4 mr-1" />
											Cancel
										</Button>
										<Button
											size="sm"
											onClick={handleSave}
											disabled={isLoading}
										>
											<Save className="w-4 h-4 mr-1" />
											Save
										</Button>
									</>
								)}
							</div>
						</div>
					</DrawerHeader>

					<div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
							{/* Image Section */}
							<div className="space-y-4">
								<Card>
									<CardContent className="p-4">
										<img
											src={
												item.imageUrl ||
												"/api/placeholder/400/500"
											}
											alt={
												item.customName ||
												"Wardrobe item"
											}
											className="w-full h-80 object-cover rounded-lg"
										/>
									</CardContent>
								</Card>

								{/* Quick Stats */}
								<div className="grid grid-cols-2 gap-4">
									<Card>
										<CardContent className="p-4 text-center">
											<div className="text-2xl font-bold text-primary">
												{item.wearCount || 0}
											</div>
											<div className="text-sm text-muted-foreground">
												Times Worn
											</div>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4 text-center">
											<div className="text-2xl font-bold text-primary">
												{isClient &&
												daysSinceWorn !== null
													? daysSinceWorn
													: "—"}
											</div>
											<div className="text-sm text-muted-foreground">
												Days Since Worn
											</div>
										</CardContent>
									</Card>
								</div>
							</div>

							{/* Details Section */}
							<div className="space-y-6">
								{/* Basic Info */}
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="category">
												Category
											</Label>
											{isEditing ? (
												<Select
													value={formData.category}
													onValueChange={(value) =>
														setFormData({
															...formData,
															category: value,
														})
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select category" />
													</SelectTrigger>
													<SelectContent>
														{WARDROBE_CATEGORIES.map(
															(category) => (
																<SelectItem
																	key={
																		category
																	}
																	value={
																		category
																	}
																>
																	{category
																		.charAt(
																			0
																		)
																		.toUpperCase() +
																		category.slice(
																			1
																		)}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											) : (
												<div className="flex items-center gap-2 p-2 bg-muted rounded">
													<Package className="w-4 h-4" />
													<span className="capitalize">
														{item.aiCategory ||
															"Uncategorized"}
													</span>
												</div>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="brand">Brand</Label>
											{isEditing ? (
												<Select
													value={formData.brand}
													onValueChange={(value) =>
														setFormData({
															...formData,
															brand: value,
														})
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select brand" />
													</SelectTrigger>
													<SelectContent>
														{COMMON_BRANDS.map(
															(brand) => (
																<SelectItem
																	key={brand}
																	value={
																		brand
																	}
																>
																	{brand}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											) : (
												<div className="flex items-center gap-2 p-2 bg-muted rounded">
													<Tag className="w-4 h-4" />
													<span>
														{brandTag?.replace(
															"brand:",
															""
														) || "Unknown"}
													</span>
												</div>
											)}
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="color">Color</Label>
											{isEditing ? (
												<Select
													value={formData.color}
													onValueChange={(value) =>
														setFormData({
															...formData,
															color: value,
														})
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select color" />
													</SelectTrigger>
													<SelectContent>
														{COMMON_COLORS.map(
															(color) => (
																<SelectItem
																	key={color}
																	value={
																		color
																	}
																>
																	<div className="flex items-center gap-2">
																		<Palette className="w-4 h-4" />
																		{color}
																	</div>
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											) : (
												<div className="flex items-center gap-2 p-2 bg-muted rounded">
													<Palette className="w-4 h-4" />
													<span>
														{item
															.dominantColors?.[0] ||
															"Unknown"}
													</span>
												</div>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="visibility">
												Visibility
											</Label>
											{isEditing ? (
												<Select
													value={formData.visibility}
													onValueChange={(value) =>
														setFormData({
															...formData,
															visibility: value,
														})
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{VISIBILITY_OPTIONS.map(
															(option) => (
																<SelectItem
																	key={
																		option.value
																	}
																	value={
																		option.value
																	}
																>
																	{
																		option.label
																	}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											) : (
												<div className="flex items-center gap-2 p-2 bg-muted rounded">
													{item.visibility ===
													"private" ? (
														<EyeOff className="w-4 h-4" />
													) : (
														<Eye className="w-4 h-4" />
													)}
													<span className="capitalize">
														{item.visibility ||
															"Private"}
													</span>
												</div>
											)}
										</div>
									</div>
								</div>

								<Separator />

								{/* Purchase Info */}
								<div className="space-y-4">
									<h3 className="font-semibold">
										Purchase Information
									</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="flex items-center gap-2 p-2 bg-muted rounded">
											<DollarSign className="w-4 h-4" />
											<span>
												{item.purchasePrice
													? `${item.purchaseCurrency || "USD"} ${item.purchasePrice}`
													: "Price not set"}
											</span>
										</div>
										<div className="flex items-center gap-2 p-2 bg-muted rounded">
											<Calendar className="w-4 h-4" />
											<span>
												{item.addedDate && isClient
													? new Date(
															item.addedDate
														).toLocaleDateString()
													: item.addedDate
														? "Date available"
														: "Date unknown"}
											</span>
										</div>
									</div>
									{sizeTag && (
										<div className="flex items-center gap-2 p-2 bg-muted rounded">
											<Package className="w-4 h-4" />
											<span>
												Size:{" "}
												{sizeTag.replace("size:", "")}
											</span>
										</div>
									)}
								</div>

								<Separator />

								{/* Tags */}
								<div className="space-y-4">
									<Label>Tags</Label>
									{isEditing ? (
										<>
											<div className="flex gap-2">
												<Input
													placeholder="Add a tag..."
													value={newTag}
													onChange={(e) =>
														setNewTag(
															e.target.value
														)
													}
													onKeyPress={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															handleAddTag();
														}
													}}
												/>
												<Button
													type="button"
													variant="outline"
													onClick={handleAddTag}
													disabled={!newTag.trim()}
												>
													Add
												</Button>
											</div>
											{editedTags.length > 0 && (
												<div className="flex flex-wrap gap-2">
													{editedTags.map((tag) => (
														<Badge
															key={tag}
															variant="secondary"
															className="flex items-center gap-1"
														>
															{tag}
															<button
																type="button"
																onClick={() =>
																	handleRemoveTag(
																		tag
																	)
																}
																className="ml-1 hover:text-destructive"
															>
																<X className="w-3 h-3" />
															</button>
														</Badge>
													))}
												</div>
											)}
										</>
									) : (
										<div className="flex flex-wrap gap-2">
											{regularTags.length > 0 ? (
												regularTags.map((tag) => (
													<Badge
														key={tag}
														variant="secondary"
													>
														{tag}
													</Badge>
												))
											) : (
												<span className="text-muted-foreground">
													No tags
												</span>
											)}
										</div>
									)}
								</div>

								{/* Notes */}
								<div className="space-y-2">
									<Label htmlFor="notes">Notes</Label>
									{isEditing ? (
										<Textarea
											id="notes"
											placeholder="Add notes about this item..."
											value={formData.notes}
											onChange={(e) =>
												setFormData({
													...formData,
													notes: e.target.value,
												})
											}
											rows={3}
										/>
									) : (
										<div className="p-2 bg-muted rounded min-h-[60px]">
											{notesTag?.replace("notes:", "") ||
												"No notes"}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</DrawerContent>
			</Drawer>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete Wardrobe Item
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "
							{item.customName || "this item"}"? This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isLoading ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
