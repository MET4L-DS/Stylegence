"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, User } from "lucide-react";
import { toast } from "sonner";
import { ProfileData, BodyMeasurements, ProfileModalProps } from "@/data/types";
import {
	BasicInfoTab,
	StylePreferencesTab,
	BodyMeasurementsTab,
	PrivacyTab,
} from "@/components/profile";

export function ProfileModal({
	children,
	isOpen: externalIsOpen,
	onOpenChange: externalOnOpenChange,
}: ProfileModalProps) {
	const { user: clerkUser } = useUser();
	const convexUser = useQuery(api.users.current);
	const updateProfile = useMutation(api.users.updateProfile);
	const updateBodyMeasurements = useMutation(
		api.users.updateBodyMeasurements
	);

	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<ProfileData>({
		username: "",
		stylePreferences: [],
		favoriteBrands: [],
		bodyType: "",
		preferredCurrency: "USD",
		preferredSizeSystem: "US",
		sizeLabel: "",
		consent_storeBodyMetrics: false,
		consent_shareReviewsPublic: false,
	});

	const [measurements, setMeasurements] = useState<BodyMeasurements>({
		heightCm: undefined,
		weightKg: undefined,
		bustCm: undefined,
		waistCm: undefined,
		hipsCm: undefined,
		inseamCm: undefined,
		shoulderCm: undefined,
		neckCm: undefined,
		notes: "",
	});

	// Use external state if provided, otherwise use internal state
	const isOpen =
		externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
	const setIsOpen = externalOnOpenChange || setInternalIsOpen;

	// Load existing data when modal opens and user data is available
	useEffect(() => {
		if (isOpen && convexUser) {
			setFormData({
				username: convexUser.username || "",
				stylePreferences: convexUser.stylePreferences || [],
				favoriteBrands: convexUser.favoriteBrands || [],
				bodyType: convexUser.bodyType || "",
				preferredCurrency: convexUser.preferredCurrency || "USD",
				preferredSizeSystem: convexUser.preferredSizeSystem || "US",
				sizeLabel: convexUser.sizeLabel || "",
				consent_storeBodyMetrics:
					convexUser.consent_storeBodyMetrics || false,
				consent_shareReviewsPublic:
					convexUser.consent_shareReviewsPublic || false,
			});

			if (convexUser.consent_storeBodyMetrics) {
				setMeasurements({
					heightCm: convexUser.heightCm,
					weightKg: convexUser.weightKg,
					bustCm: convexUser.bustCm,
					waistCm: convexUser.waistCm,
					hipsCm: convexUser.hipsCm,
					inseamCm: convexUser.inseamCm,
					shoulderCm: convexUser.shoulderCm,
					neckCm: convexUser.neckCm,
					notes: "",
				});
			}
		}
	}, [isOpen, convexUser]);

	const handleSave = async () => {
		if (!clerkUser?.id) {
			toast.error("Please sign in to save preferences");
			return;
		}

		setIsLoading(true);
		try {
			await updateProfile({ ...formData });
			toast.success("Profile saved successfully!");
			setIsOpen(false);
		} catch (error) {
			console.error("Error saving preferences:", error);
			toast.error("Failed to save preferences. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveMeasurements = async () => {
		if (!formData.consent_storeBodyMetrics) {
			toast.error("Please consent to storing body measurements first.");
			return;
		}

		setIsLoading(true);
		try {
			await updateBodyMeasurements(measurements);
			toast.success("Body measurements updated successfully!");
		} catch (error) {
			console.error("Measurements update error:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update measurements. Please try again.";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			{children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
			<DrawerContent className="max-h-[90vh] max-w-2xl mx-auto flex flex-col">
				<DrawerHeader className="flex-shrink-0">
					<DrawerTitle className="flex items-center gap-2">
						<User className="w-5 h-5" />
						Profile Settings
					</DrawerTitle>
					<DrawerDescription>
						Update your profile, style preferences, and privacy
						settings.
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto px-4">
					<Tabs defaultValue="basic" className="w-full">
						<TabsList className="grid w-full grid-cols-4 mb-6">
							<TabsTrigger value="basic">Basic</TabsTrigger>
							<TabsTrigger value="style">Style</TabsTrigger>
							<TabsTrigger value="measurements">Body</TabsTrigger>
							<TabsTrigger value="privacy">Privacy</TabsTrigger>
						</TabsList>

						<TabsContent value="basic" className="space-y-4">
							<BasicInfoTab
								formData={formData}
								setFormData={setFormData}
								convexUser={convexUser}
							/>
						</TabsContent>

						<TabsContent value="style" className="space-y-6">
							<StylePreferencesTab
								formData={formData}
								setFormData={setFormData}
							/>
						</TabsContent>

						<TabsContent value="measurements" className="space-y-4">
							<BodyMeasurementsTab
								formData={formData}
								measurements={measurements}
								setMeasurements={setMeasurements}
								isLoading={isLoading}
								onSaveMeasurements={handleSaveMeasurements}
							/>
						</TabsContent>

						<TabsContent value="privacy" className="space-y-4">
							<PrivacyTab
								formData={formData}
								setFormData={setFormData}
							/>
						</TabsContent>
					</Tabs>
				</div>

				<DrawerFooter className="flex-shrink-0">
					<div className="flex gap-2">
						<Button
							onClick={handleSave}
							disabled={isLoading}
							className="flex-1"
						>
							<Save className="w-4 h-4 mr-2" />
							{isLoading ? "Saving..." : "Save Profile"}
						</Button>
						<DrawerClose asChild>
							<Button variant="outline" className="flex-1">
								<X className="w-4 h-4 mr-2" />
								Cancel
							</Button>
						</DrawerClose>
					</div>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

// Keep the old export for backward compatibility
export { ProfileModal as StylePreferencesModal };
