interface WelcomeSectionProps {
	userName?: string;
	subtitle?: string;
	children?: React.ReactNode;
}

export function WelcomeSection({
	userName = "John",
	subtitle = "Manage your wardrobe and create amazing outfits.",
	children,
}: WelcomeSectionProps) {
	return (
		<div className="bg-card border rounded-lg p-6">
			<h2 className="text-3xl font-bold text-foreground mb-2">
				Welcome back, {userName}!
			</h2>
			<p className="text-muted-foreground mb-4">{subtitle}</p>
			{children}
		</div>
	);
}
