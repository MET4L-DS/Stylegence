"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
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
import { Upload, X, Camera, Plus, Loader2, Tag, Palette } from "lucide-react";
import { toast } from "sonner";
import { WARDROBE_CATEGORIES } from "@/data/constants";

interface AddItemModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const CLOTHING_SIZES = [
	"XXS",
	"XS",
	"S",
	"M",
	"L",
	"XL",
	"XXL",
	"XXXL",
	"0",
	"2",
	"4",
	"6",
	"8",
	"10",
	"12",
	"14",
	"16",
	"18",
	"20",
];

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

export function AddItemModal({ open, onOpenChange }: AddItemModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [customTags, setCustomTags] = useState<string[]>([]);
	const [newTag, setNewTag] = useState("");

	// Form state
	const [formData, setFormData] = useState({
		customName: "",
		category: "",
		brand: "",
		color: "",
		size: "",
		purchasePrice: "",
		currency: "USD",
		notes: "",
		visibility: "private",
	});

	const addWardrobeItem = useMutation(api.wardrobeItems.addUserUploadedItem);

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 10 * 1024 * 1024) {
				// 10MB limit
				toast.error("Image size must be less than 10MB");
				return;
			}

			if (!file.type.startsWith("image/")) {
				toast.error("Please select a valid image file");
				return;
			}

			setSelectedImage(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setSelectedImage(null);
		setImagePreview(null);
	};

	const handleAddTag = () => {
		if (newTag.trim() && !customTags.includes(newTag.trim())) {
			setCustomTags([...customTags, newTag.trim()]);
			setNewTag("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setCustomTags(customTags.filter((tag) => tag !== tagToRemove));
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!selectedImage) {
			toast.error("Please select an image");
			return;
		}

		if (!formData.customName.trim()) {
			toast.error("Please enter a name for the item");
			return;
		}

		if (!formData.category) {
			toast.error("Please select a category");
			return;
		}

		setIsLoading(true);

		try {
			// Upload image to Convex storage
			const imageUrl = await uploadImage(selectedImage);

			// Create wardrobe item
			await addWardrobeItem({
				customName: formData.customName.trim(),
				category: formData.category,
				brand: formData.brand || undefined,
				color: formData.color || undefined,
				size: formData.size || undefined,
				purchasePrice: formData.purchasePrice
					? parseFloat(formData.purchasePrice)
					: undefined,
				purchaseCurrency: formData.currency,
				notes: formData.notes || undefined,
				visibility: formData.visibility as any,
				imageUrl,
				tags: customTags,
			});

			toast.success("Item added to wardrobe successfully!");
			handleClose();
		} catch (error) {
			console.error("Error adding item:", error);
			if (error instanceof Error) {
				toast.error(`Failed to add item: ${error.message}`);
			} else {
				toast.error("Failed to add item. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const uploadImage = async (file: File): Promise<string> => {
		// For now, return a placeholder URL
		// In production, this would upload to Convex storage and return the storage URL
		console.log("Uploading image:", file.name, file.size);
		return "/api/placeholder/200/300";
	};

	const handleClose = () => {
		// Reset form
		setFormData({
			customName: "",
			category: "",
			brand: "",
			color: "",
			size: "",
			purchasePrice: "",
			currency: "USD",
			notes: "",
			visibility: "private",
		});
		setSelectedImage(null);
		setImagePreview(null);
		setCustomTags([]);
		setNewTag("");
		onOpenChange(false);
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="max-h-[90vh] max-w-2xl mx-auto flex flex-col">
				<DrawerHeader className="flex-shrink-0">
					<DrawerTitle className="flex items-center gap-2">
						<Upload className="w-5 h-5" />
						Add Item to Wardrobe
					</DrawerTitle>
					<DrawerDescription>
						Upload a photo and add details about your clothing item.
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
					<form
						id="add-item-form"
						onSubmit={handleSubmit}
						className="space-y-6 pb-6"
					>
						{/* Image Upload Section */}
						<Card>
							<CardContent className="p-6">
								<Label className="text-sm font-medium">
									Item Photo *
								</Label>
								<div className="mt-2">
									{imagePreview ? (
										<div className="relative">
											<img
												src={imagePreview}
												alt="Item preview"
												className="w-full h-48 object-cover rounded-lg border"
											/>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												className="absolute top-2 right-2"
												onClick={handleRemoveImage}
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
									) : (
										<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
											<div className="flex flex-col items-center justify-center pt-5 pb-6">
												<Camera className="w-8 h-8 mb-4 text-muted-foreground" />
												<p className="mb-2 text-sm text-muted-foreground">
													<span className="font-semibold">
														Click to upload
													</span>{" "}
													or drag and drop
												</p>
												<p className="text-xs text-muted-foreground">
													PNG, JPG, GIF up to 10MB
												</p>
											</div>
											<input
												type="file"
												className="hidden"
												accept="image/*"
												onChange={handleImageSelect}
											/>
										</label>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Basic Details */}
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="customName">
										Item Name *
									</Label>
									<Input
										id="customName"
										placeholder="e.g., Blue Denim Jacket"
										value={formData.customName}
										onChange={(e) =>
											setFormData({
												...formData,
												customName: e.target.value,
											})
										}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="category">Category *</Label>
									<Select
										value={formData.category}
										onValueChange={(value) =>
											setFormData({
												...formData,
												category: value,
											})
										}
										required
									>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent className="max-h-60">
											{WARDROBE_CATEGORIES.map(
												(category) => (
													<SelectItem
														key={category}
														value={category}
													>
														{category
															.charAt(0)
															.toUpperCase() +
															category.slice(1)}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="brand">Brand</Label>
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
										<SelectContent className="max-h-60">
											{COMMON_BRANDS.map((brand) => (
												<SelectItem
													key={brand}
													value={brand}
												>
													{brand}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="color">Color</Label>
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
										<SelectContent className="max-h-60">
											{COMMON_COLORS.map((color) => (
												<SelectItem
													key={color}
													value={color}
												>
													<div className="flex items-center gap-2">
														<Palette className="w-4 h-4" />
														{color}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="size">Size</Label>
									<Select
										value={formData.size}
										onValueChange={(value) =>
											setFormData({
												...formData,
												size: value,
											})
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select size" />
										</SelectTrigger>
										<SelectContent className="max-h-60">
											{CLOTHING_SIZES.map((size) => (
												<SelectItem
													key={size}
													value={size}
												>
													{size}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="purchasePrice">
										Purchase Price
									</Label>
									<div className="flex">
										<Select
											value={formData.currency}
											onValueChange={(value) =>
												setFormData({
													...formData,
													currency: value,
												})
											}
										>
											<SelectTrigger className="w-20">
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="max-h-60">
												<SelectItem value="USD">
													USD
												</SelectItem>
												<SelectItem value="EUR">
													EUR
												</SelectItem>
												<SelectItem value="GBP">
													GBP
												</SelectItem>
												<SelectItem value="INR">
													INR
												</SelectItem>
											</SelectContent>
										</Select>
										<Input
											id="purchasePrice"
											type="number"
											placeholder="0.00"
											min="0"
											step="0.01"
											value={formData.purchasePrice}
											onChange={(e) =>
												setFormData({
													...formData,
													purchasePrice:
														e.target.value,
												})
											}
											className="flex-1 ml-2"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="visibility">
										Visibility
									</Label>
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
										<SelectContent className="max-h-60">
											{VISIBILITY_OPTIONS.map(
												(option) => (
													<SelectItem
														key={option.value}
														value={option.value}
													>
														{option.label}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<Separator />

						{/* Tags Section */}
						<div className="space-y-4">
							<Label>Tags</Label>
							<div className="flex gap-2">
								<Input
									placeholder="Add a tag..."
									value={newTag}
									onChange={(e) => setNewTag(e.target.value)}
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
									<Plus className="w-4 h-4" />
								</Button>
							</div>
							{customTags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{customTags.map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="flex items-center gap-1"
										>
											<Tag className="w-3 h-3" />
											{tag}
											<button
												type="button"
												onClick={() =>
													handleRemoveTag(tag)
												}
												className="ml-1 hover:text-destructive"
											>
												<X className="w-3 h-3" />
											</button>
										</Badge>
									))}
								</div>
							)}
						</div>

						{/* Notes Section */}
						<div className="space-y-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<Textarea
								id="notes"
								placeholder="Any additional notes about this item..."
								value={formData.notes}
								onChange={(e) =>
									setFormData({
										...formData,
										notes: e.target.value,
									})
								}
								rows={3}
							/>
						</div>
					</form>
				</div>

				{/* Fixed Action Buttons Footer */}
				<div className="flex-shrink-0 border-t border-border p-6">
					<div className="flex gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							className="flex-1"
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="add-item-form"
							className="flex-1"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Adding Item...
								</>
							) : (
								<>
									<Plus className="w-4 h-4 mr-2" />
									Add to Wardrobe
								</>
							)}
						</Button>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
