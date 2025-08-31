import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, SIZE_SYSTEMS } from "@/data/profile";
import { ProfileData } from "@/data/types";

interface BasicInfoTabProps {
	formData: ProfileData;
	setFormData: React.Dispatch<React.SetStateAction<ProfileData>>;
	convexUser: any;
}

export function BasicInfoTab({
	formData,
	setFormData,
	convexUser,
}: BasicInfoTabProps) {
	return (
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
					<Label htmlFor="currency">Currency</Label>
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
							{CURRENCIES.map((currency) => (
								<SelectItem
									key={currency.value}
									value={currency.value}
								>
									{currency.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="sizeSystem">Size System</Label>
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
							{SIZE_SYSTEMS.map((system) => (
								<SelectItem
									key={system.value}
									value={system.value}
								>
									{system.label}
								</SelectItem>
							))}
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
	);
}
