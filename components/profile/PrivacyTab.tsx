import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProfileData } from "@/data/types";

interface PrivacyTabProps {
	formData: ProfileData;
	setFormData: React.Dispatch<React.SetStateAction<ProfileData>>;
}

export function PrivacyTab({ formData, setFormData }: PrivacyTabProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-start space-x-3">
				<Checkbox
					id="bodyMetrics"
					checked={formData.consent_storeBodyMetrics}
					onCheckedChange={(checked) =>
						setFormData((prev) => ({
							...prev,
							consent_storeBodyMetrics: checked as boolean,
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
						Allow Stylegence to store your body measurements for
						better fit recommendations. This data is encrypted and
						never shared with third parties.
					</p>
				</div>
			</div>

			<div className="flex items-start space-x-3">
				<Checkbox
					id="shareReviews"
					checked={formData.consent_shareReviewsPublic}
					onCheckedChange={(checked) =>
						setFormData((prev) => ({
							...prev,
							consent_shareReviewsPublic: checked as boolean,
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
						Allow your product reviews and ratings to be visible to
						other users. Your personal information will remain
						private.
					</p>
				</div>
			</div>
		</div>
	);
}
