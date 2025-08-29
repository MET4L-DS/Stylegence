import {
	internalMutation,
	mutation,
	query,
	QueryCtx,
} from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

/**
 * Return the currently authenticated user (Convex users table row) or null.
 */
export const current = query({
	args: {},
	handler: async (ctx) => {
		return await getCurrentUser(ctx);
	},
});

/**
 * Upsert user record from Clerk webhook / sync.
 *
 * - Only map safe fields from Clerk.
 * - Preserve existing sensitive/app-specific fields on patch (measurementHistory, linkedAccounts, pointsBalance, meta, etc).
 * - Set default consent flags and pointsBalance on first insert.
 */
export const upsertFromClerk = internalMutation({
	args: { data: v.any() as Validator<UserJSON> },
	async handler(ctx, { data }) {
		// Build display name safely
		const first = (data.first_name || "").trim();
		const last = (data.last_name || "").trim();
		const displayName =
			first || last ? `${first} ${last}`.trim() : "Anonymous";

		// Pick primary email if available
		const email =
			(data.email_addresses &&
				data.email_addresses[0] &&
				data.email_addresses[0].email_address) ||
			"";

		// Explicitly type incoming to ensure profilePictureUrl is string | undefined (not null)
		const incoming: {
			name: string;
			email: string;
			externalId: string;
			profilePictureUrl?: string;
		} = {
			name: displayName,
			email,
			externalId: data.id, // Clerk ID (immutable)
			// Convex schema expects optional string | undefined (not null). Cast to string | undefined.
			profilePictureUrl: (data.image_url ?? undefined) as
				| string
				| undefined,
		};

		// Check existing user by externalId
		const existing = await userByExternalId(ctx, data.id);

		const now = Date.now();

		if (existing === null) {
			// Insert with sensible defaults for fields we manage
			await ctx.db.insert("users", {
				name: incoming.name,
				email: incoming.email,
				externalId: incoming.externalId,
				// Ensure null is converted to undefined for Convex schema (profilePictureUrl expects string | undefined)
				profilePictureUrl: incoming.profilePictureUrl ?? undefined,
				createdAt: now,
				updatedAt: now,
				// consent flags default to false until user opts in
				consent_storeBodyMetrics: false,
				consent_shareReviewsPublic: false,
				// Minimal pref arrays / placeholders
				stylePreferences: [],
				favoriteBrands: [],
				// Reward default
				pointsBalance: 0,
				// computed/meta placeholder
				meta: {},
			});
		} else {
			// Patch only the non-sensitive fields we want updated from Clerk
			// Preserve existing createdAt, measurementHistory, linkedAccounts, pointsBalance, meta, etc.
			await ctx.db.patch(existing._id, {
				name: incoming.name,
				email: incoming.email,
				// Convert null -> undefined before patching to match Convex types
				profilePictureUrl: incoming.profilePictureUrl ?? undefined,
				// don't overwrite externalId or createdAt
				updatedAt: now,
			});
		}
	},
});

/**
 * Delete a Convex user when Clerk user deleted (or requested).
 */
export const deleteFromClerk = internalMutation({
	args: { clerkUserId: v.string() },
	async handler(ctx, { clerkUserId }) {
		const user = await userByExternalId(ctx, clerkUserId);
		if (user !== null) {
			await ctx.db.delete(user._id);
		} else {
			// Keep server-side logs — not throwing because webhook deletions may be retried
			console.warn(
				`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`
			);
		}
	},
});

/**
 * Update user profile information
 */
export const updateProfile = mutation({
	args: {
		username: v.optional(v.string()),
		stylePreferences: v.optional(v.array(v.string())),
		favoriteBrands: v.optional(v.array(v.string())),
		preferredCurrency: v.optional(v.string()),
		preferredSizeSystem: v.optional(v.string()),
		bodyType: v.optional(v.string()),
		sizeLabel: v.optional(v.string()),
		consent_storeBodyMetrics: v.optional(v.boolean()),
		consent_shareReviewsPublic: v.optional(v.boolean()),
	},
	async handler(ctx, args) {
		// Check authentication first
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("User not authenticated");
		}

		// Try to get user, create if doesn't exist
		let user = await userByExternalId(ctx, identity.subject);

		if (!user) {
			// User doesn't exist in Convex database, create it
			const now = Date.now();
			const userId = await ctx.db.insert("users", {
				name: identity.name || "Anonymous",
				email: identity.email || "",
				externalId: identity.subject,
				profilePictureUrl: identity.pictureUrl,
				createdAt: now,
				updatedAt: now,
				consent_storeBodyMetrics: false,
				consent_shareReviewsPublic: false,
				stylePreferences: [],
				favoriteBrands: [],
				pointsBalance: 0,
				meta: {},
			});

			// Fetch the newly created user
			user = await ctx.db.get(userId);
			if (!user) {
				throw new Error("Failed to create user");
			}
		}

		const updateData: any = {
			updatedAt: Date.now(),
		};

		// Add all provided fields to update
		Object.keys(args).forEach((key) => {
			if (args[key as keyof typeof args] !== undefined) {
				updateData[key] = args[key as keyof typeof args];
			}
		});

		await ctx.db.patch(user._id, updateData);
		return user._id;
	},
});

/**
 * Update user body measurements (requires consent)
 */
export const updateBodyMeasurements = mutation({
	args: {
		heightCm: v.optional(v.number()),
		weightKg: v.optional(v.number()),
		bustCm: v.optional(v.number()),
		waistCm: v.optional(v.number()),
		hipsCm: v.optional(v.number()),
		inseamCm: v.optional(v.number()),
		shoulderCm: v.optional(v.number()),
		neckCm: v.optional(v.number()),
		notes: v.optional(v.string()),
	},
	async handler(ctx, args) {
		// Check authentication first
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("User not authenticated");
		}

		// Try to get user
		let user = await userByExternalId(ctx, identity.subject);

		if (!user) {
			throw new Error(
				"User not found in database. Please complete profile setup first."
			);
		}

		// Check consent
		if (!user.consent_storeBodyMetrics) {
			throw new Error("User has not consented to storing body metrics");
		}

		const updateData: any = {
			updatedAt: Date.now(),
		};

		// Add all provided measurements
		Object.keys(args).forEach((key) => {
			if (
				args[key as keyof typeof args] !== undefined &&
				key !== "notes"
			) {
				updateData[key] = args[key as keyof typeof args];
			}
		});

		// Add to measurement history if any measurements are provided
		const measurementFields = [
			"heightCm",
			"weightKg",
			"bustCm",
			"waistCm",
			"hipsCm",
		];
		const hasMeasurements = measurementFields.some(
			(field) => args[field as keyof typeof args] !== undefined
		);

		if (hasMeasurements) {
			const historyEntry = {
				timestamp: Date.now(),
				heightCm: args.heightCm,
				weightKg: args.weightKg,
				bustCm: args.bustCm,
				waistCm: args.waistCm,
				hipsCm: args.hipsCm,
				notes: args.notes,
			};

			const currentHistory = user.measurementHistory || [];
			updateData.measurementHistory = [...currentHistory, historyEntry];
		}

		await ctx.db.patch(user._id, updateData);
		return user._id;
	},
});

/**
 * Create user in Convex database if not exists (manual sync)
 */
export const createUser = mutation({
	args: {},
	async handler(ctx) {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("User not authenticated");
		}

		// Check if user already exists
		const existing = await userByExternalId(ctx, identity.subject);
		if (existing) {
			return existing._id;
		}

		// Create new user
		const now = Date.now();
		const userId = await ctx.db.insert("users", {
			name: identity.name || "Anonymous",
			email: identity.email || "",
			externalId: identity.subject,
			profilePictureUrl: identity.pictureUrl,
			createdAt: now,
			updatedAt: now,
			consent_storeBodyMetrics: false,
			consent_shareReviewsPublic: false,
			stylePreferences: [],
			favoriteBrands: [],
			pointsBalance: 0,
			meta: {},
		});

		return userId;
	},
});

/**
 * Helper: get current user or throw (used by server actions that require auth)
 */
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
	const userRecord = await getCurrentUser(ctx);
	if (!userRecord) throw new Error("Can't get current user");
	return userRecord;
}

/**
 * Helper: get current user (Convex row) by auth identity.
 * Returns null if not signed in or not found in users table.
 */
export async function getCurrentUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (identity === null) {
		return null;
	}
	return await userByExternalId(ctx, identity.subject);
}

/**
 * Lookup user by Clerk external id using the users.byExternalId index.
 */
async function userByExternalId(ctx: QueryCtx, externalId: string) {
	return await ctx.db
		.query("users")
		.withIndex("byExternalId", (q) => q.eq("externalId", externalId))
		.unique();
}
