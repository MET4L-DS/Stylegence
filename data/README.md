# Data Structure

This folder contains all the placeholder data for the StyleSense application, organized into separate files for better maintainability.

## Files

### `types.ts`

Contains TypeScript type definitions for all data structures:

-   `WardrobeItem` - Individual clothing items
-   `Outfit` - Saved outfit combinations
-   `DayPlan` - Daily outfit recommendations with weather and schedule
-   `WardrobeData` - Combined data structure

### `constants.ts`

Contains application constants:

-   `WARDROBE_CATEGORIES` - Categories for filtering wardrobe items
-   `USER_PROFILE` - User profile information
-   `DAYS_OF_WEEK` - Days of the week constants

### `wardrobeItems.ts`

Contains individual clothing items in the user's wardrobe. Each item includes:

-   Basic information (name, category, color, brand)
-   Image URL
-   Tags for filtering and recommendations

### `outfits.ts`

Contains saved outfit combinations that reference wardrobe items by name.

### `weeklyPlan.ts`

Contains the weekly outfit planning data including:

-   Daily weather information
-   Schedule/events for each day
-   Recommended outfits with confidence scores
-   Alternative outfit suggestions

### `index.ts`

Main export file that:

-   Exports all types and constants
-   Exports individual data arrays
-   Provides a combined `wardrobeData` object for backward compatibility

## Usage

```typescript
// Import individual data sets
import { wardrobeItems, outfits, weeklyPlan } from "@/data";

// Import combined data (for backward compatibility)
import { wardrobeData } from "@/data";

// Import types
import { WardrobeItem, Outfit, DayPlan } from "@/data";

// Import constants
import { WARDROBE_CATEGORIES, USER_PROFILE } from "@/data";
```

## Benefits of This Structure

1. **Separation of Concerns**: Each data type is in its own file
2. **Type Safety**: Strong TypeScript typing for all data structures
3. **Reusability**: Data can be imported individually or combined
4. **Maintainability**: Easy to add, modify, or remove data
5. **Scalability**: Easy to extend with new data types or sources
6. **Backward Compatibility**: Existing code continues to work with `wardrobeData`
