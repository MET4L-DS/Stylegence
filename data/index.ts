export * from "./types";
export * from "./constants";
export * from "./analytics";
export { wardrobeItems } from "./wardrobeItems";
export { outfits } from "./outfits";
export { weeklyPlan } from "./weeklyPlan";

import { wardrobeItems } from "./wardrobeItems";
import { outfits } from "./outfits";
import { weeklyPlan } from "./weeklyPlan";
import { WardrobeData } from "./types";

// Combined data object for backward compatibility
export const wardrobeData: WardrobeData = {
	all: wardrobeItems,
	outfits,
	weeklyPlan,
};
