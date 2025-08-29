"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ProfileSetupGuardProps {
	children: React.ReactNode;
}

export function ProfileSetupGuard({ children }: ProfileSetupGuardProps) {
	const router = useRouter();
	const user = useQuery(api.users.current);

	useEffect(() => {
		if (user && !isProfileComplete(user)) {
			// Only redirect if we're not already on the profile page
			if (window.location.pathname !== "/dashboard/profile") {
				router.push("/dashboard/profile?setup=true");
			}
		}
	}, [user, router]);

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

	return <>{children}</>;
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
