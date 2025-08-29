"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
	User,
	Heart,
	Ruler,
	Shield,
	Save,
	Check,
	Star,
	ShoppingBag,
	Globe,
	Settings,
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

interface ProfileFormData {
	username: string;
	stylePreferences: string[];
	favoriteBrands: string[];
	preferredCurrency: string;
	preferredSizeSystem: string;
	bodyType: string;
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

export default function ProfilePage() {
	const { user: clerkUser } = useUser();
	const searchParams = useSearchParams();
	const isSetupMode = searchParams.get("setup") === "true";
	const convexUser = useQuery(api.users.current);
	const updateProfile = useMutation(api.users.updateProfile);
	const updateBodyMeasurements = useMutation(
		api.users.updateBodyMeasurements
	);
	const createUser = useMutation(api.users.createUser);

	const [formData, setFormData] = useState<ProfileFormData>({
		username: "",
		stylePreferences: [],
		favoriteBrands: [],
		preferredCurrency: "USD",
		preferredSizeSystem: "US",
		bodyType: "",
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

	const [isLoading, setIsLoading] = useState(false);
	const [showMeasurements, setShowMeasurements] = useState(false);

	// Calculate setup progress
	const getSetupProgress = () => {
		if (!convexUser) return 0;

		let completed = 0;
		const total = 4;

		// Basic info (25%)
		if (
			convexUser.username &&
			convexUser.preferredCurrency &&
			convexUser.preferredSizeSystem
		) {
			completed += 1;
		}

		// Style preferences (25%)
		if (
			convexUser.stylePreferences &&
			convexUser.stylePreferences.length > 0
		) {
			completed += 1;
		}

		// Body type (25%)
		if (convexUser.bodyType) {
			completed += 1;
		}

		// Consent (25%)
		if (
			convexUser.consent_storeBodyMetrics !== undefined &&
			convexUser.consent_shareReviewsPublic !== undefined
		) {
			completed += 1;
		}

		return (completed / total) * 100;
	};

	// Create user in Convex if they don't exist
	useEffect(() => {
		if (clerkUser && convexUser === null) {
			// User is authenticated in Clerk but doesn't exist in Convex
			createUser()
				.then(() => {
					// User created successfully, the query will refetch automatically
				})
				.catch((error) => {
					console.error("Failed to create user:", error);
					toast.error(
						"Failed to initialize user profile. Please refresh the page."
					);
				});
		}
	}, [clerkUser, convexUser, createUser]);

	// Load existing user data
	useEffect(() => {
		if (convexUser) {
			setFormData({
				username: convexUser.username || "",
				stylePreferences: convexUser.stylePreferences || [],
				favoriteBrands: convexUser.favoriteBrands || [],
				preferredCurrency: convexUser.preferredCurrency || "USD",
				preferredSizeSystem: convexUser.preferredSizeSystem || "US",
				bodyType: convexUser.bodyType || "",
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
	}, [convexUser]);

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

	const handleSaveProfile = async () => {
		setIsLoading(true);
		try {
			await updateProfile(formData);
			toast.success("Profile updated successfully!");
		} catch (error) {
			console.error("Profile update error:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update profile. Please try again.";
			toast.error(errorMessage);
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

	if (!clerkUser || convexUser === undefined) {
		return (
			<div className="flex items-center justify-center min-h-96">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading profile...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center gap-4 mb-6">
				<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
					<User className="w-6 h-6 text-primary" />
				</div>
				<div>
					<h1 className="text-2xl font-bold">
						{isSetupMode
							? "Complete Your Profile"
							: "Profile Settings"}
					</h1>
					<p className="text-muted-foreground">
						{isSetupMode
							? "Let's personalize your Stylegence experience with a few quick details"
							: "Personalize your Stylegence experience"}
					</p>
					{isSetupMode && (
						<div className="space-y-2 mt-3">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
								<span className="text-sm text-yellow-600 font-medium">
									Setup Required
								</span>
								<span className="text-sm text-muted-foreground">
									{Math.round(getSetupProgress())}% complete
								</span>
							</div>
							<div className="w-full bg-muted rounded-full h-2">
								<div
									className="bg-primary h-2 rounded-full transition-all duration-300"
									style={{ width: `${getSetupProgress()}%` }}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			<Tabs defaultValue="basic" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="basic">Basic Info</TabsTrigger>
					<TabsTrigger value="preferences">
						Style & Brands
					</TabsTrigger>
					<TabsTrigger value="measurements">
						Body Measurements
					</TabsTrigger>
					<TabsTrigger value="privacy">Privacy & Consent</TabsTrigger>
				</TabsList>

				<TabsContent value="basic" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="w-5 h-5" />
								Basic Information
							</CardTitle>
							<CardDescription>
								Your basic profile information and display
								preferences.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

								<div className="space-y-2">
									<Label htmlFor="currency">
										Preferred Currency
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

							<Button
								onClick={handleSaveProfile}
								disabled={isLoading}
								className="w-full"
							>
								<Save className="w-4 h-4 mr-2" />
								{isLoading
									? "Saving..."
									: "Save Basic Information"}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="preferences" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Heart className="w-5 h-5" />
								Style Preferences
							</CardTitle>
							<CardDescription>
								Select your preferred styles to get better
								recommendations.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<Label>
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
											className="cursor-pointer"
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

							<div className="space-y-3">
								<Label>Body Type</Label>
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

							<Button
								onClick={handleSaveProfile}
								disabled={isLoading}
								className="w-full"
							>
								<Save className="w-4 h-4 mr-2" />
								{isLoading
									? "Saving..."
									: "Save Style Preferences"}
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ShoppingBag className="w-5 h-5" />
								Favorite Brands
							</CardTitle>
							<CardDescription>
								Choose brands you love for personalized
								recommendations.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<Label>
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
											className="cursor-pointer"
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

							<Button
								onClick={handleSaveProfile}
								disabled={isLoading}
								className="w-full"
							>
								<Save className="w-4 h-4 mr-2" />
								{isLoading
									? "Saving..."
									: "Save Favorite Brands"}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="measurements" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Ruler className="w-5 h-5" />
								Body Measurements
							</CardTitle>
							<CardDescription>
								Optional measurements for better fit
								recommendations. Your data is encrypted and
								private.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{!formData.consent_storeBodyMetrics ? (
								<div className="text-center py-8 space-y-4">
									<Ruler className="w-12 h-12 mx-auto text-muted-foreground" />
									<div>
										<h3 className="font-medium">
											Enable Body Measurements
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											To use this feature, please enable
											body measurements in the Privacy &
											Consent tab.
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
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

											<div className="space-y-2">
												<Label htmlFor="shoulder">
													Shoulder (cm)
												</Label>
												<Input
													id="shoulder"
													type="number"
													placeholder="40"
													value={
														measurements.shoulderCm ||
														""
													}
													onChange={(e) =>
														setMeasurements(
															(prev) => ({
																...prev,
																shoulderCm: e
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
												<Label htmlFor="neck">
													Neck (cm)
												</Label>
												<Input
													id="neck"
													type="number"
													placeholder="35"
													value={
														measurements.neckCm ||
														""
													}
													onChange={(e) =>
														setMeasurements(
															(prev) => ({
																...prev,
																neckCm: e.target
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
										disabled={isLoading}
										className="w-full"
									>
										<Save className="w-4 h-4 mr-2" />
										{isLoading
											? "Saving..."
											: "Save Measurements"}
									</Button>
								</>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="privacy" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="w-5 h-5" />
								Privacy & Consent
							</CardTitle>
							<CardDescription>
								Control how your data is used and shared.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
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

							<Button
								onClick={handleSaveProfile}
								disabled={isLoading}
								className="w-full"
							>
								<Save className="w-4 h-4 mr-2" />
								{isLoading
									? "Saving..."
									: "Save Privacy Settings"}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
