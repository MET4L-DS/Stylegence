import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DayPlan } from "@/data";
import { Cloud, Star, User, Shield, Palette, Plus } from "lucide-react";

interface TodaysRecommendationCardProps {
	selectedDay: string;
	selectedDayOutfit: DayPlan | undefined;
}

export function TodaysRecommendationCard({
	selectedDay,
	selectedDayOutfit,
}: TodaysRecommendationCardProps) {
	return (
		<Card className="bg-primary/5 border-primary/20">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg">
							{selectedDay === "Wednesday"
								? "Today's"
								: `${selectedDay}'s`}{" "}
							Perfect Look
						</CardTitle>
						<CardDescription className="flex items-center gap-2">
							<Cloud className="w-4 h-4" />
							{selectedDayOutfit?.day},{" "}
							{new Date(
								selectedDayOutfit?.date || "2025-08-21"
							).toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
							})}{" "}
							• {selectedDayOutfit?.weather}
						</CardDescription>
					</div>
					<div className="flex items-center gap-1">
						<Star className="w-5 h-5 text-yellow-500" />
						<span className="text-lg font-bold">
							{selectedDayOutfit?.recommendedOutfit.confidence}%
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
					{/* Enhanced Outfit Template */}
					<div className="relative mx-auto md:mx-0 p-2">
						<div className="w-full max-w-xs h-80 bg-gradient-to-b from-background to-muted/30 rounded-xl border border-border shadow-sm relative">
							{/* Top Wear */}
							<div className="absolute inset-6 grid grid-cols-2 gap-4">
								{/* Top Wear */}
								<div className="bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 p-3">
									<div className="text-center">
										<User className="w-10 h-10 mx-auto mb-2 text-primary/70" />
										<span className="text-sm text-primary font-semibold">
											Tee
										</span>
									</div>
								</div>

								{/* Bottom Wear */}
								<div className="bg-secondary/10 rounded-xl flex items-center justify-center border border-secondary/20 p-3">
									<div className="text-center">
										<Shield className="w-10 h-10 mx-auto mb-2 text-secondary/70" />
										<span className="text-sm text-secondary font-semibold">
											Jeans
										</span>
									</div>
								</div>

								{/* Footwear */}
								<div className="bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20 p-3">
									<div className="text-center">
										<Palette className="w-10 h-10 mx-auto mb-2 text-accent/70" />
										<span className="text-sm text-accent font-semibold">
											Shoes
										</span>
									</div>
								</div>

								{/* Optional Accessory */}
								<div className="bg-muted/30 rounded-xl flex items-center justify-center border border-muted-foreground/10 opacity-60 p-3">
									<div className="text-center">
										<Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
										<span className="text-xs text-muted-foreground/50 font-medium">
											Optional
										</span>
									</div>
								</div>
							</div>

							{/* Outfit Name Badge */}
							<div className="absolute bottom-4 left-4 right-4">
								<div className="bg-background/95 backdrop-blur-sm rounded-lg px-4 py-3 border border-border/60 shadow-sm">
									<p className="text-base font-semibold text-center">
										{
											selectedDayOutfit?.recommendedOutfit
												.name
										}
									</p>
								</div>
							</div>
						</div>

						{/* Confidence Badge - Positioned outside container */}
						<div className="absolute -top-1 -right-1">
							<Badge className="text-xs px-3 py-1 font-semibold shadow-sm">
								{
									selectedDayOutfit?.recommendedOutfit
										.confidence
								}
								% Match
							</Badge>
						</div>
					</div>

					{/* Outfit Details */}
					<div className="space-y-4">
						<div>
							<h3 className="text-xl font-bold mb-2">
								{selectedDayOutfit?.recommendedOutfit.name}
							</h3>
							<p className="text-muted-foreground">
								{selectedDayOutfit?.recommendedOutfit.reason}
							</p>
						</div>

						<div className="space-y-2">
							<h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
								{selectedDay === "Wednesday"
									? "Today's"
									: `${selectedDay}'s`}{" "}
								Items
							</h4>
							<div className="space-y-2">
								{selectedDayOutfit?.recommendedOutfit.items.map(
									(item, index) => (
										<div
											key={index}
											className="flex items-center gap-3"
										>
											<div
												className={`w-3 h-3 rounded-full border ${
													index === 0
														? "bg-primary/20 border-primary/40"
														: index === 1
															? "bg-secondary/20 border-secondary/40"
															: "bg-accent/20 border-accent/40"
												}`}
											></div>
											<span className="text-sm">
												{item}
											</span>
										</div>
									)
								)}
							</div>
						</div>

						{/* Schedule for selected day */}
						{selectedDayOutfit?.schedule &&
							selectedDayOutfit.schedule.length > 0 && (
								<div className="space-y-2">
									<h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
										{selectedDay === "Wednesday"
											? "Today's"
											: `${selectedDay}'s`}{" "}
										Schedule
									</h4>
									<div className="space-y-1">
										{selectedDayOutfit.schedule
											.slice(0, 2)
											.map((event, index) => (
												<div
													key={index}
													className="flex items-center gap-2 text-sm text-muted-foreground"
												>
													<div className="w-2 h-2 bg-primary/60 rounded-full"></div>
													{event}
												</div>
											))}
									</div>
								</div>
							)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
