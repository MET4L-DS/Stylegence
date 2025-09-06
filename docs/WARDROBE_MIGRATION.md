# Wardrobe Data Migration Guide

## Overview

The wardrobe data has been migrated from static files to the Convex database for better performance and real-time updates.

## What Changed

### Before (Static Data)

- Wardrobe items were stored in `/data/wardrobeItems.ts`
- Data was read-only and couldn't be updated
- No real-time synchronization

### After (Convex Database)

- Wardrobe items are stored in the `wardrobeItems` table
- Full CRUD operations (Create, Read, Update, Delete)
- Real-time updates across sessions
- User-specific data with proper relationships

## Migration Features

### 1. Static Data Upload

The `uploadStaticWardrobeData` mutation uploads sample wardrobe items including:

- 10 diverse clothing items (tops, bottoms, shoes, dresses, accessories)
- Realistic wear history and purchase data
- Proper categorization and tagging
- Brand information stored in structured tags

### 2. Data Transformation

Convex data is transformed to match the existing UI interface:

- Maps database fields to display fields
- Extracts brand info from structured tags
- Handles color and category mapping
- Maintains backward compatibility

### 3. Migration Panel

The `WardrobeMigrationPanel` component provides:

- One-click upload of sample data
- Clear all items functionality
- Status display showing item counts
- Sync verification indicators

## Database Schema Alignment

```typescript
// Convex Schema Fields → UI Display Fields
{
  _id → id
  customName → name
  aiCategory → category
  dominantColors[0] → color
  aiTags (filtered) → tags
  imageUrl → image
  wearCount → timesWorn
  lastWornAt → lastWorn (formatted)
  addedDate → purchaseDate (formatted)
}
```

## Usage Instructions

1. **First Time Setup**: Visit the wardrobe page and click "Upload Sample Wardrobe"
2. **Adding Items**: Use the "Add Item" button to upload new wardrobe pieces
3. **Data Management**: Use the migration panel to reset or add more sample data
4. **Real-time Updates**: Changes are immediately reflected across all sessions

## Benefits

- ✅ Real user data storage
- ✅ Personalized wardrobe tracking
- ✅ Full item management (add, edit, delete)
- ✅ Wear history tracking
- ✅ User-specific privacy settings
- ✅ Database relationships (user ↔ wardrobe items)
- ✅ Performance optimization through indexing

The migration maintains full backward compatibility while enabling powerful new features for wardrobe management.
