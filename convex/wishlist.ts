import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

/**
 * Add a product variant to the current user's wishlist.
 * Returns the created wishlist item record.
 */
export const addToWishlist = mutation({
  args: {
    productVariantId: v.id("productVariants"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Ensure the product variant exists
    const productVariant = await ctx.db.get(args.productVariantId);
    if (!productVariant) {
      throw new Error("Product variant not found");
    }

    // Check if already in wishlist (by user + productVariant)
    const existing = await ctx.db
      .query("wishlistItems")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("productVariantId"), args.productVariantId))
      .unique();

    if (existing) {
      // Return existing item instead of throwing — caller can decide.
      // If you prefer to throw, replace with: throw new Error("Item already in wishlist");
      return existing;
    }

    // Insert new wishlist item
    const now = Date.now();
    const inserted = await ctx.db.insert("wishlistItems", {
      userId: user._id,
      productVariantId: args.productVariantId,
      addedAt: now,
    });

    return inserted;
  },
});

/**
 * Remove a product variant from the current user's wishlist.
 * Returns true if an item was deleted, false otherwise.
 */
export const removeFromWishlist = mutation({
  args: {
    productVariantId: v.id("productVariants"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const wishlistItem = await ctx.db
      .query("wishlistItems")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("productVariantId"), args.productVariantId))
      .unique();

    if (wishlistItem) {
      await ctx.db.delete(wishlistItem._id);
      return true;
    }

    return false;
  },
});

/**
 * Get the current user's wishlist, enriched with productVariant / productGroup / brand.
 * Returns an array of objects: { wishlistItem, productVariant, productGroup, brand }
 */
export const getUserWishlist = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Fetch wishlist items (most recent first)
    const wishlistItems = await ctx.db
      .query("wishlistItems")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Enrich each wishlist item with productVariant -> productGroup -> brand.
    // Note: consider batching if the wishlist grows large.
    const enriched = await Promise.all(
      wishlistItems.map(async (item) => {
        const productVariant = item.productVariantId ? await ctx.db.get(item.productVariantId) : null;

        let productGroup = null;
        let brand = null;

        if (productVariant && productVariant.productGroupId) {
          productGroup = await ctx.db.get(productVariant.productGroupId);
          if (productGroup && productGroup.brandId) {
            brand = await ctx.db.get(productGroup.brandId);
          }
        }

        return {
          wishlistItem: item,
          productVariant,
          productGroup,
          brand,
        };
      })
    );

    return enriched;
  },
});
