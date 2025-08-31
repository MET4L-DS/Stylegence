"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Info } from "lucide-react";

interface ProfileSetupGuardProps {
	children: React.ReactNode;
}

export function ProfileSetupGuard({ children }: ProfileSetupGuardProps) {
	const user = useQuery(api.users.current);

	// Show loading while checking user data
	if (user === undefined) {
		return (
			<div className="flex items-center justify-center min-h-96">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Show profile completion reminder if incomplete
	const showProfileReminder = user && !isProfileComplete(user);

	return (
		<>
			{showProfileReminder && (
				<div className="mb-4 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
					<div className="flex items-start gap-3">
						<Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
						<div className="text-sm text-amber-800 dark:text-amber-300">
							<p className="font-medium mb-1">
								Complete Your Profile
							</p>
							<p>
								Get personalized style recommendations by
								completing your profile settings. Click on your
								avatar in the sidebar to access{" "}
								<strong>Profile Settings</strong>.
							</p>
						</div>
					</div>
				</div>
			)}
			{children}
		</>
	);
}

function isProfileComplete(user: any): boolean {
	// Check if essential profile information is complete
	const hasBasicInfo =
		user.username && user.preferredCurrency && user.preferredSizeSystem;
	const hasStylePrefs =
		user.stylePreferences && user.stylePreferences.length > 0;
	const hasBodyType = user.bodyType;
	const hasConsent =
		user.consent_storeBodyMetrics !== undefined &&
		user.consent_shareReviewsPublic !== undefined;

	return !!(hasBasicInfo && hasStylePrefs && hasBodyType && hasConsent);
}
