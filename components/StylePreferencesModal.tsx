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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
	Heart,
	Save,
	Check,
	X,
	User,
	Ruler,
	Shield,
	Eye,
	EyeOff,
} from "lucide-react";
import { toast } from "sonner";

// Style preferences options
const STYLE_PREFERENCES = [
	"Minimalist",
	"Boho",
	"Classic",
	"Trendy",
	"Athleisure",
	"Business Casual",
	"Formal",
	"Streetwear",
	"Vintage",
	"Romantic",
	"Edgy",
	"Preppy",
	"Artistic",
	"Casual",
];

// Body type options
const BODY_TYPES = [
	"Hourglass",
	"Pear",
	"Apple",
	"Rectangle",
	"Inverted Triangle",
	"Petite",
	"Tall",
	"Plus Size",
	"Athletic",
];

// Popular brands
const POPULAR_BRANDS = [
	"Zara",
	"H&M",
	"Uniqlo",
	"Nike",
	"Adidas",
	"Levi's",
	"Gap",
	"Banana Republic",
	"J.Crew",
	"Madewell",
	"ASOS",
	"Urban Outfitters",
	"Free People",
	"Anthropologie",
	"Target",
	"Old Navy",
	"Express",
	"American Eagle",
	"Hollister",
	"Forever 21",
];

interface StylePreferencesData {
	username: string;
	stylePreferences: string[];
	favoriteBrands: string[];
	bodyType: string;
	preferredCurrency: string;
	preferredSizeSystem: string;
	sizeLabel: string;
	consent_storeBodyMetrics: boolean;
	consent_shareReviewsPublic: boolean;
}

interface BodyMeasurements {
	heightCm: number | undefined;
	weightKg: number | undefined;
	bustCm: number | undefined;
	waistCm: number | undefined;
	hipsCm: number | undefined;
	inseamCm: number | undefined;
	shoulderCm: number | undefined;
	neckCm: number | undefined;
	notes: string;
}

interface StylePreferencesModalProps {
	children?: React.ReactNode;
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function StylePreferencesModal({
	children,
	isOpen: externalIsOpen,
	onOpenChange: externalOnOpenChange,
}: StylePreferencesModalProps) {
	const { user: clerkUser } = useUser();
	const convexUser = useQuery(api.users.current);
	const updateProfile = useMutation(api.users.updateProfile);
	const updateBodyMeasurements = useMutation(
		api.users.updateBodyMeasurements
	);

	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showMeasurements, setShowMeasurements] = useState(false);
	const [formData, setFormData] = useState<StylePreferencesData>({
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

	const handleSave = async () => {
		if (!clerkUser?.id) {
			toast.error("Please sign in to save preferences");
			return;
		}

		setIsLoading(true);
		try {
			// updateProfile handles user creation automatically if user doesn't exist
			await updateProfile({
				...formData,
			});

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
			<DrawerContent className="max-h-[90vh] flex flex-col">
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
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Display Name</Label>
									<Input
										id="name"
										value={convexUser?.name || ""}
										disabled
										className="bg-muted"
									/>
									<p className="text-xs text-muted-foreground">
										Managed by your account provider
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										value={convexUser?.email || ""}
										disabled
										className="bg-muted"
									/>
									<p className="text-xs text-muted-foreground">
										Managed by your account provider
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="username">Username</Label>
									<Input
										id="username"
										placeholder="Choose a unique username"
										value={formData.username}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												username: e.target.value,
											}))
										}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="currency">
											Currency
										</Label>
										<Select
											value={formData.preferredCurrency}
											onValueChange={(value) =>
												setFormData((prev) => ({
													...prev,
													preferredCurrency: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="USD">
													USD ($)
												</SelectItem>
												<SelectItem value="EUR">
													EUR (€)
												</SelectItem>
												<SelectItem value="GBP">
													GBP (£)
												</SelectItem>
												<SelectItem value="CAD">
													CAD (C$)
												</SelectItem>
												<SelectItem value="AUD">
													AUD (A$)
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="sizeSystem">
											Size System
										</Label>
										<Select
											value={formData.preferredSizeSystem}
											onValueChange={(value) =>
												setFormData((prev) => ({
													...prev,
													preferredSizeSystem: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="US">
													US
												</SelectItem>
												<SelectItem value="EU">
													EU
												</SelectItem>
												<SelectItem value="UK">
													UK
												</SelectItem>
												<SelectItem value="Alpha">
													Alpha (S/M/L/XL)
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="size">Your Size</Label>
									<Input
										id="size"
										placeholder="e.g. M, 32, 10"
										value={formData.sizeLabel}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												sizeLabel: e.target.value,
											}))
										}
									/>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="style" className="space-y-6">
							{/* Style Preferences Section */}
							<div className="space-y-3">
								<Label className="text-base font-medium">
									Style Preferences (
									{formData.stylePreferences.length} selected)
								</Label>
								<div className="flex flex-wrap gap-2">
									{STYLE_PREFERENCES.map((style) => (
										<Badge
											key={style}
											variant={
												formData.stylePreferences.includes(
													style
												)
													? "default"
													: "outline"
											}
											className="cursor-pointer hover:bg-primary/80 transition-colors"
											onClick={() =>
												handleStyleToggle(style)
											}
										>
											{formData.stylePreferences.includes(
												style
											) && (
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
								<Label className="text-base font-medium">
									Body Type
								</Label>
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
									Favorite Brands (
									{formData.favoriteBrands.length} selected)
								</Label>
								<div className="flex flex-wrap gap-2">
									{POPULAR_BRANDS.map((brand) => (
										<Badge
											key={brand}
											variant={
												formData.favoriteBrands.includes(
													brand
												)
													? "default"
													: "outline"
											}
											className="cursor-pointer hover:bg-primary/80 transition-colors"
											onClick={() =>
												handleBrandToggle(brand)
											}
										>
											{formData.favoriteBrands.includes(
												brand
											) && (
												<Check className="w-3 h-3 mr-1" />
											)}
											{brand}
										</Badge>
									))}
								</div>
							</div>
						</TabsContent>

						<TabsContent value="measurements" className="space-y-4">
							{!formData.consent_storeBodyMetrics ? (
								<div className="text-center py-8 space-y-4">
									<Ruler className="w-12 h-12 mx-auto text-muted-foreground" />
									<div>
										<h3 className="font-medium">
											Enable Body Measurements
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											To use this feature, please enable
											body measurements in the Privacy
											tab.
										</p>
									</div>
								</div>
							) : (
								<>
									<div className="flex items-center justify-between">
										<Label>Show Measurements</Label>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												setShowMeasurements(
													!showMeasurements
												)
											}
										>
											{showMeasurements ? (
												<EyeOff className="w-4 h-4" />
											) : (
												<Eye className="w-4 h-4" />
											)}
										</Button>
									</div>

									{showMeasurements && (
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="height">
													Height (cm)
												</Label>
												<Input
													id="height"
													type="number"
													placeholder="170"
													value={
														measurements.heightCm ||
														""
													}
													onChange={(e) =>
														setMeasurements(
															(prev) => ({
																...prev,
																heightCm: e
																	.target
																	.value
																	? Number(
																			e
																				.target
																				.value
																		)
																	: undefined,
															})
														)
													}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="weight">
													Weight (kg)
												</Label>
												<Input
													id="weight"
													type="number"
													placeholder="65"
													value={
														measurements.weightKg ||
														""
													}
													onChange={(e) =>
														setMeasurements(
															(prev) => ({
																...prev,
																weightKg: e
																	.target
																	.value
																	? Number(
																			e
																				.target
																				.value
																		)
																	: undefined,
															})
														)
													}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="bust">
													Bust/Chest (cm)
												</Label>
												<Input
													id="bust"
													type="number"
													placeholder="90"
													value={
														measurements.bustCm ||
														""
													}
													onChange={(e) =>
														setMeasurements(
															(prev) => ({
																...prev,
																bustCm: e.target
																	.value
																	? Number(
																			e
																				.target
																				.value
																		)
																	: undefined,
															})
														)
													}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="waist">
													Waist (cm)
												</Label>
												<Input
													id="waist"
													type="number"
													placeholder="70"
													value={
														measurements.waistCm ||
														""
													}
													onChange={(e) =>
														setMeasurements(
															(prev) => ({
																...prev,
																waistCm: e
																	.target
																	.value
																	? Number(
																			e
																				.target
																				.value
																		)
																	: undefined,
															})
														)
													}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="hips">
													Hips (cm)
												</Label>
												<Input
													id="hips"
													type="number"
													placeholder="95"
													value={
														measurements.hipsCm ||
														""
													}
													onChange={(e) =>
														setMeasurements(
															(prev) => ({
																...prev,
																hipsCm: e.target
																	.value
																	? Number(
																			e
																				.target
																				.value
																		)
																	: undefined,
															})
														)
													}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="inseam">
													Inseam (cm)
												</Label>
												<Input
													id="inseam"
													type="number"
													placeholder="75"
													value={
														measurements.inseamCm ||
														""
													}
													onChange={(e) =>
														setMeasurements(
															(prev) => ({
																...prev,
																inseamCm: e
																	.target
																	.value
																	? Number(
																			e
																				.target
																				.value
																		)
																	: undefined,
															})
														)
													}
												/>
											</div>
										</div>
									)}

									<div className="space-y-2">
										<Label htmlFor="notes">
											Notes (optional)
										</Label>
										<Textarea
											id="notes"
											placeholder="Any additional notes about your measurements..."
											value={measurements.notes}
											onChange={(e) =>
												setMeasurements((prev) => ({
													...prev,
													notes: e.target.value,
												}))
											}
										/>
									</div>

									<Button
										onClick={handleSaveMeasurements}
										disabled={
											isLoading ||
											!formData.consent_storeBodyMetrics
										}
										className="w-full"
									>
										<Save className="w-4 h-4 mr-2" />
										{isLoading
											? "Saving..."
											: "Save Measurements"}
									</Button>
								</>
							)}
						</TabsContent>

						<TabsContent value="privacy" className="space-y-4">
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<Checkbox
										id="bodyMetrics"
										checked={
											formData.consent_storeBodyMetrics
										}
										onCheckedChange={(checked) =>
											setFormData((prev) => ({
												...prev,
												consent_storeBodyMetrics:
													checked as boolean,
											}))
										}
									/>
									<div className="flex-1 space-y-1">
										<Label
											htmlFor="bodyMetrics"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Store Body Measurements
										</Label>
										<p className="text-xs text-muted-foreground">
											Allow Stylegence to store your body
											measurements for better fit
											recommendations. This data is
											encrypted and never shared with
											third parties.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-3">
									<Checkbox
										id="shareReviews"
										checked={
											formData.consent_shareReviewsPublic
										}
										onCheckedChange={(checked) =>
											setFormData((prev) => ({
												...prev,
												consent_shareReviewsPublic:
													checked as boolean,
											}))
										}
									/>
									<div className="flex-1 space-y-1">
										<Label
											htmlFor="shareReviews"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Share Reviews Publicly
										</Label>
										<p className="text-xs text-muted-foreground">
											Allow your product reviews and
											ratings to be visible to other
											users. Your personal information
											will remain private.
										</p>
									</div>
								</div>
							</div>
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
