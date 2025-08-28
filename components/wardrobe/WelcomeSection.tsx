interface WelcomeSectionProps {
	userName?: string;
	subtitle?: string;
	children: React.ReactNode;
}

export function WelcomeSection({
	userName = "John",
	subtitle = "Manage your wardrobe and create amazing outfits.",
	children,
}: WelcomeSectionProps) {
	return (
		<div className="lg:col-span-2">
			<h2 className="text-3xl font-bold text-foreground mb-2">
				Welcome back, {userName}!
			</h2>
			<p className="text-muted-foreground mb-6">{subtitle}</p>
			{children}
		</div>
	);
}
