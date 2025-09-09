import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

/**
 * Generate an upload URL for a file
 */
export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		// Check if user is authenticated
		await getCurrentUserOrThrow(ctx);

		// Generate upload URL
		return await ctx.storage.generateUploadUrl();
	},
});

/**
 * Store image metadata after upload
 */
export const storeImageMetadata = mutation({
	args: {
		storageId: v.id("_storage"),
		filename: v.string(),
		contentType: v.string(),
		size: v.number(),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Get the file URL from storage
		const fileUrl = await ctx.storage.getUrl(args.storageId);

		return {
			storageId: args.storageId,
			url: fileUrl,
			filename: args.filename,
			contentType: args.contentType,
			size: args.size,
		};
	},
});

/**
 * Get file URL from storage ID
 */
export const getImageUrl = query({
	args: {
		storageId: v.id("_storage"),
	},
	handler: async (ctx, args) => {
		return await ctx.storage.getUrl(args.storageId);
	},
});

/**
 * Delete a file from storage
 */
export const deleteFile = mutation({
	args: {
		storageId: v.id("_storage"),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Delete the file from storage
		await ctx.storage.delete(args.storageId);

		return { success: true };
	},
});
