import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Ruler, Eye, EyeOff, Save } from "lucide-react";
import { BodyMeasurements, ProfileData } from "@/data/types";

interface BodyMeasurementsTabProps {
	formData: ProfileData;
	measurements: BodyMeasurements;
	setMeasurements: React.Dispatch<React.SetStateAction<BodyMeasurements>>;
	isLoading: boolean;
	onSaveMeasurements: () => Promise<void>;
}

export function BodyMeasurementsTab({
	formData,
	measurements,
	setMeasurements,
	isLoading,
	onSaveMeasurements,
}: BodyMeasurementsTabProps) {
	const [showMeasurements, setShowMeasurements] = useState(false);

	if (!formData.consent_storeBodyMetrics) {
		return (
			<div className="text-center py-8 space-y-4">
				<Ruler className="w-12 h-12 mx-auto text-muted-foreground" />
				<div>
					<h3 className="font-medium">Enable Body Measurements</h3>
					<p className="text-sm text-muted-foreground mt-1">
						To use this feature, please enable body measurements in
						the Privacy tab.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label>Show Measurements</Label>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setShowMeasurements(!showMeasurements)}
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
						<Label htmlFor="height">Height (cm)</Label>
						<Input
							id="height"
							type="number"
							placeholder="170"
							value={measurements.heightCm || ""}
							onChange={(e) =>
								setMeasurements((prev) => ({
									...prev,
									heightCm: e.target.value
										? Number(e.target.value)
										: undefined,
								}))
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="weight">Weight (kg)</Label>
						<Input
							id="weight"
							type="number"
							placeholder="65"
							value={measurements.weightKg || ""}
							onChange={(e) =>
								setMeasurements((prev) => ({
									...prev,
									weightKg: e.target.value
										? Number(e.target.value)
										: undefined,
								}))
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="bust">Bust/Chest (cm)</Label>
						<Input
							id="bust"
							type="number"
							placeholder="90"
							value={measurements.bustCm || ""}
							onChange={(e) =>
								setMeasurements((prev) => ({
									...prev,
									bustCm: e.target.value
										? Number(e.target.value)
										: undefined,
								}))
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="waist">Waist (cm)</Label>
						<Input
							id="waist"
							type="number"
							placeholder="70"
							value={measurements.waistCm || ""}
							onChange={(e) =>
								setMeasurements((prev) => ({
									...prev,
									waistCm: e.target.value
										? Number(e.target.value)
										: undefined,
								}))
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="hips">Hips (cm)</Label>
						<Input
							id="hips"
							type="number"
							placeholder="95"
							value={measurements.hipsCm || ""}
							onChange={(e) =>
								setMeasurements((prev) => ({
									...prev,
									hipsCm: e.target.value
										? Number(e.target.value)
										: undefined,
								}))
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="inseam">Inseam (cm)</Label>
						<Input
							id="inseam"
							type="number"
							placeholder="75"
							value={measurements.inseamCm || ""}
							onChange={(e) =>
								setMeasurements((prev) => ({
									...prev,
									inseamCm: e.target.value
										? Number(e.target.value)
										: undefined,
								}))
							}
						/>
					</div>
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="notes">Notes (optional)</Label>
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
				onClick={onSaveMeasurements}
				disabled={isLoading || !formData.consent_storeBodyMetrics}
				className="w-full"
			>
				<Save className="w-4 h-4 mr-2" />
				{isLoading ? "Saving..." : "Save Measurements"}
			</Button>
		</div>
	);
}
