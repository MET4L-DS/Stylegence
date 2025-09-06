"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Upload,
	Trash2,
	RefreshCw,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function WardrobeMigrationPanel() {
	const [isUploading, setIsUploading] = useState(false);
	const [isClearing, setIsClearing] = useState(false);

	const convexUser = useQuery(api.users.current);
	const wardrobeSummary = useQuery(api.wardrobeItems.getWardrobeSummary);

	const uploadStaticData = useMutation(
		api.migrations.uploadStaticWardrobeData
	);
	const clearWardrobeItems = useMutation(
		api.migrations.clearUserWardrobeItems
	);

	const handleUploadStaticData = async () => {
		if (!convexUser) {
			toast.error("User not found");
			return;
		}

		setIsUploading(true);
		try {
			const result = await uploadStaticData({ userId: convexUser._id });
			toast.success(result.message);
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Failed to upload wardrobe data");
		} finally {
			setIsUploading(false);
		}
	};

	const handleClearWardrobe = async () => {
		if (!convexUser) {
			toast.error("User not found");
			return;
		}

		setIsClearing(true);
		try {
			const result = await clearWardrobeItems({ userId: convexUser._id });
			toast.success(result.message);
		} catch (error) {
			console.error("Clear error:", error);
			toast.error("Failed to clear wardrobe data");
		} finally {
			setIsClearing(false);
		}
	};

	if (!convexUser) {
		return null;
	}

	const hasWardrobeItems = wardrobeSummary && wardrobeSummary.totalItems > 0;

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<RefreshCw className="w-5 h-5" />
					Wardrobe Data Migration
				</CardTitle>
				<CardDescription>
					Upload sample wardrobe data to get started with your virtual
					closet
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Status Display */}
				<div className="flex items-center justify-between p-4 bg-muted rounded-lg">
					<div className="flex items-center gap-2">
						{hasWardrobeItems ? (
							<CheckCircle className="w-5 h-5 text-green-500" />
						) : (
							<AlertCircle className="w-5 h-5 text-orange-500" />
						)}
						<span className="font-medium">
							{hasWardrobeItems
								? "Wardrobe Items Found"
								: "No Wardrobe Items"}
						</span>
					</div>
					{wardrobeSummary && (
						<div className="text-sm text-muted-foreground">
							Items: {wardrobeSummary.totalItems} | IDs:{" "}
							{wardrobeSummary.userWardrobeItemIdsCount} |
							{wardrobeSummary.itemsMatch
								? " ✓ Synced"
								: " ❌ Not Synced"}
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-3">
					<Button
						onClick={handleUploadStaticData}
						disabled={isUploading}
						className="flex-1"
						variant={hasWardrobeItems ? "outline" : "default"}
					>
						{isUploading ? (
							<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<Upload className="w-4 h-4 mr-2" />
						)}
						{hasWardrobeItems
							? "Add More Sample Items"
							: "Upload Sample Wardrobe"}
					</Button>

					{hasWardrobeItems && (
						<Button
							onClick={handleClearWardrobe}
							disabled={isClearing}
							variant="destructive"
							className="flex-1"
						>
							{isClearing ? (
								<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Trash2 className="w-4 h-4 mr-2" />
							)}
							Clear All Items
						</Button>
					)}
				</div>

				{/* Help Text */}
				<div className="text-sm text-muted-foreground">
					<p>
						{hasWardrobeItems
							? "Your wardrobe is populated with items. You can add more sample data or clear everything to start fresh."
							: "Upload sample wardrobe data to see how the wardrobe features work. This includes clothing items with categories, colors, and wear history."}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
