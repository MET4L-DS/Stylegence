"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
	onImageUploaded: (storageId: string, imageUrl: string) => void;
	currentImage?: string;
	onImageRemoved?: () => void;
	className?: string;
	label?: string;
	disabled?: boolean;
}

export function ImageUpload({
	onImageUploaded,
	currentImage,
	onImageRemoved,
	className = "",
	label = "Upload Image",
	disabled = false,
}: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const storeImageMetadata = useMutation(api.files.storeImageMetadata);

	const handleFileUpload = async (file: File) => {
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size must be less than 10MB");
			return;
		}

		setIsUploading(true);

		try {
			// Get upload URL
			const uploadUrl = await generateUploadUrl();

			// Upload file to Convex storage
			const result = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!result.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = await result.json();

			// Store metadata and get URL
			const imageData = await storeImageMetadata({
				storageId,
				filename: file.name,
				contentType: file.type,
				size: file.size,
			});

			if (imageData.url) {
				onImageUploaded(storageId, imageData.url);
				toast.success("Image uploaded successfully!");
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Failed to upload image. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setDragActive(false);

		if (disabled || isUploading) return;

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileUpload(files[0]);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!disabled && !isUploading) {
			setDragActive(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setDragActive(false);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			handleFileUpload(files[0]);
		}
	};

	const handleClick = () => {
		if (!disabled && !isUploading && fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleRemove = () => {
		if (onImageRemoved) {
			onImageRemoved();
		}
	};

	return (
		<div className={`space-y-2 ${className}`}>
			{currentImage ? (
				<div className="relative group">
					<div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
						<img
							src={currentImage}
							alt="Uploaded image"
							className="w-full h-full object-cover"
						/>
					</div>
					{onImageRemoved && (
						<Button
							variant="destructive"
							size="sm"
							className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={handleRemove}
							disabled={disabled}
						>
							<X className="w-4 h-4" />
						</Button>
					)}
				</div>
			) : (
				<div
					className={`
						aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center
						cursor-pointer transition-colors
						${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
						${disabled || isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}
					`}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onClick={handleClick}
				>
					<div className="text-center space-y-2">
						{isUploading ? (
							<>
								<div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
								<p className="text-sm text-muted-foreground">
									Uploading...
								</p>
							</>
						) : (
							<>
								<ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
								<div className="space-y-1">
									<p className="text-sm font-medium">
										{label}
									</p>
									<p className="text-xs text-muted-foreground">
										Drag & drop or click to select
									</p>
									<p className="text-xs text-muted-foreground">
										PNG, JPG up to 10MB
									</p>
								</div>
							</>
						)}
					</div>
				</div>
			)}

			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
				disabled={disabled || isUploading}
			/>
		</div>
	);
}
