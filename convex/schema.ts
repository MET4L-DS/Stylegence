import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	//
	// USERS
	//
	users: defineTable({
		// identity
		name: v.optional(v.string()),
		email: v.string(),
		externalId: v.string(), // Clerk user ID (immutable)
		username: v.optional(v.string()),
		profilePictureUrl: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.optional(v.number()),

		// consent flags
		consent_storeBodyMetrics: v.optional(v.boolean()), // explicit opt-in
		consent_shareReviewsPublic: v.optional(v.boolean()),

		// preferences & computed pointers
		stylePreferences: v.optional(v.array(v.string())), // e.g., ["boho","athleisure"]
		favoriteBrands: v.optional(v.array(v.string())),
		preferredCurrency: v.optional(v.string()),
		preferredSizeSystem: v.optional(v.string()), // e.g., "IN","US","EU","Alpha"
		preferenceEmbeddingId: v.optional(v.string()), // pointer to vector DB

		// body & fit metrics (PII — must be gated by consent flags above)
		bodyType: v.optional(v.string()), // canonical label: hourglass, pear, apple, rectangle, petite, etc.
		heightCm: v.optional(v.number()),
		weightKg: v.optional(v.number()),
		bustCm: v.optional(v.number()),
		waistCm: v.optional(v.number()),
		hipsCm: v.optional(v.number()),
		inseamCm: v.optional(v.number()),
		shoulderCm: v.optional(v.number()),
		neckCm: v.optional(v.number()),
		sizeLabel: v.optional(v.string()), // e.g., "M" or "32"

		// measurement history (time series)
		measurementHistory: v.optional(
			v.array(
				v.object({
					timestamp: v.number(),
					heightCm: v.optional(v.number()),
					weightKg: v.optional(v.number()),
					bustCm: v.optional(v.number()),
					waistCm: v.optional(v.number()),
					hipsCm: v.optional(v.number()),
					notes: v.optional(v.string()),
				})
			)
		),

		// integrations
		calendarProvider: v.optional(v.string()), // "google" / "ical"
		calendarId: v.optional(v.string()),
		calendarLastSyncedAt: v.optional(v.number()),

		// activity refs (denormalized caches)
		purchasedProductIds: v.optional(v.array(v.string())), // kept for quick reads (authoritative in interactions table)
		reviewIds: v.optional(v.array(v.id("reviews"))),
		wardrobeItemIds: v.optional(v.array(v.id("wardrobeItems"))),
		outfitIds: v.optional(v.array(v.id("outfits"))),

		// linked accounts & family (quick list)
		linkedAccounts: v.optional(
			v.array(
				v.object({
					linkedUserId: v.string(),
					relationship: v.optional(v.string()), // spouse, child, friend
					addedAt: v.number(),
					shareProfileMetrics: v.optional(v.boolean()), // allow linked to see metrics
					searchableAsGroup: v.optional(v.boolean()), // allow group searches
				})
			)
		),

		familyGroupIds: v.optional(v.array(v.string())), // group documents (see familyGroups table)

		// rewards summary
		pointsBalance: v.optional(v.number()),

		// computed / metadata
		meta: v.optional(v.object({})), // freeform computed values
	})
		.index("byExternalId", ["externalId"])
		.index("byEmail", ["email"])
		.index("byUsername", ["username"]),

	//
	// FAMILY / GROUPS (support 'couple' searches and shared preferences)
	//
	familyGroups: defineTable({
		name: v.optional(v.string()),
		ownerUserId: v.id("users"),
		createdAt: v.number(),
		members: v.array(
			v.object({
				userId: v.id("users"),
				relationship: v.optional(v.string()), // partner, spouse, child, friend
				role: v.optional(v.string()), // owner/member/guest
				shareMetrics: v.optional(v.boolean()), // subject to per-user consent
			})
		),
		groupPreferences: v.optional(
			v.object({
				preferredCategories: v.optional(v.array(v.string())),
				preferredPriceMin: v.optional(v.number()),
				preferredPriceMax: v.optional(v.number()),
				occasionProfiles: v.optional(v.array(v.string())),
			})
		),
		searchable: v.optional(v.boolean()), // allow group-based searches
		meta: v.optional(v.object({})),
	}).index("byOwner", ["ownerUserId"]),

	//
	// BRANDS, CATEGORIES (unchanged but add slug/index)
	//
	brands: defineTable({
		name: v.string(),
		logoUrl: v.optional(v.string()),
		description: v.optional(v.string()),
	}).index("byName", ["name"]),

	categories: defineTable({
		name: v.string(),
		parentCategoryId: v.optional(v.id("categories")),
		slug: v.string(),
	}).index("bySlug", ["slug"]),

	//
	// ATTRIBUTE SYSTEM (same)
	//
	attributes: defineTable({
		name: v.string(),
		displayName: v.string(),
	}),

	attributeValues: defineTable({
		attributeId: v.id("attributes"),
		value: v.string(),
	}),

	productVariantAttributes: defineTable({
		productVariantId: v.id("productVariants"),
		attributeId: v.id("attributes"),
		attributeValueId: v.id("attributeValues"),
	}),

	//
	// PRODUCT CATALOG (productGroups + productVariants expanded)
	//
	productGroups: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		brandId: v.optional(v.id("brands")),
		categoryId: v.optional(v.id("categories")),
		baseProductCode: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.optional(v.number()),

		// personalization pointers
		normalizedTags: v.optional(v.array(v.string())),
		styleClusterScores: v.optional(v.object({})), // freeform map cluster->score
		pairingRecommendations: v.optional(
			v.object({
				// optional precomputed pairing metadata stored at group-level
				pairedProductIds: v.optional(v.array(v.string())),
				recommendedForGroups: v.optional(v.object({})), // e.g., { "couple_outing": {score:0.9,notes:""} }
			})
		),

		meta: v.optional(v.object({})),
	}).index("byBaseCode", ["baseProductCode"]),

	productVariants: defineTable({
		productGroupId: v.id("productGroups"),
		sku: v.string(),
		// variant attributes
		colorPrimary: v.optional(v.string()),
		colorSecondary: v.optional(v.string()),
		sizeLabel: v.optional(v.string()),
		sizeSystem: v.optional(v.string()),
		availabilityStatus: v.optional(v.string()),
		inventory: v.optional(v.number()),

		// source / crawling
		createdAt: v.number(),
		updatedAt: v.optional(v.number()),
		sourceMarketplace: v.optional(v.string()),
		sourcePdpUrl: v.optional(v.string()),
		sourceProductId: v.optional(v.string()),

		// affiliate info & click tracking pointer defaults
		affiliateLink: v.optional(v.string()),
		affiliateNetwork: v.optional(v.string()),
		affiliateSku: v.optional(v.string()),

		// embeddings (store IDs only)
		embeddingTextId: v.optional(v.string()),
		embeddingImageIds: v.optional(v.array(v.string())), // allow multiple image vectors

		// ratings / fit aggregates
		averageRating: v.optional(v.number()),
		reviewCount: v.optional(v.number()),
		ratingsHistogram: v.optional(v.object({})),
		fitInfo: v.optional(v.object({})),
		suitableBodyTypes: v.optional(v.array(v.string())), // ['pear','hourglass'...]
		sizeRecommendationsByBodyType: v.optional(v.object({})), // map body_type -> {size_label,confidence}

		// pairing / personalization
		styleClusterScores: v.optional(v.object({})),
		pairing: v.optional(v.object({})),

		// crawl metadata
		crawlFirstSeenAt: v.optional(v.number()),
		crawlLastSeenAt: v.optional(v.number()),
		crawlFingerprint: v.optional(v.string()),

		meta: v.optional(v.object({})),
	})
		.index("bySku", ["sku"])
		.index("byProductGroup", ["productGroupId"]),

	//
	// IMAGES (link to productVariants and wardrobe items)
	//
	images: defineTable({
		productVariantId: v.optional(v.id("productVariants")),
		wardrobeItemId: v.optional(v.id("wardrobeItems")),
		storageId: v.optional(v.id("_storage")),
		urlTemplate: v.optional(v.string()),
		url: v.optional(v.string()),
		isPrimary: v.optional(v.boolean()),
		width: v.optional(v.number()),
		height: v.optional(v.number()),
		dominantColorHex: v.optional(v.string()),
		uploadedAt: v.optional(v.number()),
	})
		.index("byProductVariant", ["productVariantId"])
		.index("byWardrobeItem", ["wardrobeItemId"]),

	//
	// SOURCES & SELLERS & LISTINGS
	//
	sources: defineTable({
		name: v.string(),
		baseUrl: v.string(),
	}).index("byName", ["name"]),

	sellers: defineTable({
		sourceId: v.id("sources"),
		name: v.string(),
		rating: v.optional(v.number()),
		reviewCount: v.optional(v.number()),
	}).index("bySource", ["sourceId"]),

	sourceListings: defineTable({
		productVariantId: v.id("productVariants"),
		sourceId: v.id("sources"),
		sellerId: v.optional(v.id("sellers")),
		url: v.string(),
		sourceProductId: v.string(),
		currentPrice: v.optional(v.number()),
		mrp: v.optional(v.number()),
		discountPercentage: v.optional(v.number()),
		availabilityStatus: v.optional(v.string()),
		lastCheckedAt: v.optional(v.number()),
		meta: v.optional(v.object({})),
	}).index("byProductVariant", ["productVariantId"]),

	priceHistory: defineTable({
		sourceListingId: v.id("sourceListings"),
		price: v.number(),
		mrp: v.optional(v.number()),
		timestamp: v.number(),
	}).index("byListing", ["sourceListingId"]),

	offers: defineTable({
		sourceListingId: v.id("sourceListings"),
		description: v.string(),
		type: v.string(),
		validFrom: v.optional(v.number()),
		validTo: v.optional(v.number()),
	}).index("byListing", ["sourceListingId"]),

	//
	// WISHLIST
	//
	wishlistItems: defineTable({
		userId: v.id("users"),
		productVariantId: v.id("productVariants"),
		addedAt: v.number(),
	}).index("byUser", ["userId"]),

	//
	// WARDROBE (single unified wardrobe item type — catalog or uploaded)
	//
	wardrobeItems: defineTable({
		userId: v.id("users"),
		productVariantId: v.optional(v.id("productVariants")), // link if catalog
		sourceType: v.string(), // "CATALOG" | "USER_UPLOADED"
		customName: v.optional(v.string()),
		addedDate: v.optional(v.number()),
		purchasePrice: v.optional(v.number()),
		purchaseCurrency: v.optional(v.string()),

		// images + embeddings
		imageStorageId: v.optional(v.id("_storage")),
		imageUrl: v.optional(v.string()),
		imageEmbeddingId: v.optional(v.string()), // pointer to image vector
		textEmbeddingId: v.optional(v.string()),

		// AI-enriched info (populated by enrichment pipeline when user uploads)
		aiCategory: v.optional(v.string()),
		aiTags: v.optional(v.array(v.string())),
		dominantColors: v.optional(v.array(v.string())),

		// sharing / visibility
		visibility: v.optional(v.string()), // "private" | "family" | "friends" | "public"
		sharedWith: v.optional(
			v.array(
				v.object({
					userId: v.id("users"),
					permissions: v.optional(v.array(v.string())), // ["view","use_for_outfit","edit"]
				})
			)
		),

		// compatibility & computed lists
		compatibleProfiles: v.optional(v.array(v.string())), // cluster ids or user ids
		createdFromPhoto: v.optional(v.boolean()),
		addedAt: v.number(),
		lastWornAt: v.optional(v.number()),
		wearCount: v.optional(v.number()),

		meta: v.optional(v.object({})),
	})
		.index("byUser", ["userId"])
		.index("byProductVariant", ["productVariantId"]),

	//
	// OUTFITS + OUTFIT ITEMS
	//
	outfits: defineTable({
		userId: v.id("users"),
		name: v.string(),
		description: v.optional(v.string()),
		visibility: v.string(), // "PUBLIC" | "PRIVATE" | "GROUP"
		createdAt: v.number(),
		updatedAt: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
	}).index("byUser", ["userId"]),

	outfitItems: defineTable({
		outfitId: v.id("outfits"),
		// can reference a wardrobeItem or a productVariant (for ephemeral outfits)
		wardrobeItemId: v.optional(v.id("wardrobeItems")),
		productVariantId: v.optional(v.id("productVariants")),
		displayOrder: v.optional(v.number()),
	}).index("byOutfit", ["outfitId"]),

	//
	// SOCIAL: POSTS, FOLLOWS, INTERACTIONS
	//
	posts: defineTable({
		userId: v.id("users"),
		caption: v.optional(v.string()),
		outfitId: v.optional(v.id("outfits")),
		taggedProductVariantIds: v.optional(v.array(v.id("productVariants"))),
		location: v.optional(v.string()),
		createdAt: v.number(),
		media: v.optional(v.array(v.string())), // array of image URLs or storage ids
	}).index("byUser", ["userId"]),

	follows: defineTable({
		followerId: v.id("users"),
		followingId: v.id("users"),
		createdAt: v.number(),
	})
		.index("byFollower", ["followerId"])
		.index("byFollowing", ["followingId"]),

	interactions: defineTable({
		userId: v.id("users"),
		// polymorphic target: store the id plus a type to resolve in app logic
		targetId: v.string(),
		targetType: v.string(), // "POST" | "OUTFIT" | "COMMENT"
		interactionType: v.string(), // "LIKE" | "COMMENT" | "SAVE"
		commentBody: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("byTarget", ["targetId", "targetType"])
		.index("byUser", ["userId"]),

	//
	// REVIEWS (English only — translate before inserting)
	//
	reviews: defineTable({
		userId: v.id("users"),
		productVariantId: v.id("productVariants"),
		rating: v.number(), // 1..5
		title: v.optional(v.string()),
		body: v.string(), // MUST be English (translate upstream)
		createdAt: v.number(),
		verifiedPurchase: v.optional(v.boolean()),
		verificationMethod: v.optional(v.string()), // affiliate | receipt_upload | self_report | marketplace
		fitFeedback: v.optional(v.string()), // "runs small" etc.
		sentimentScore: v.optional(v.number()), // -1..1
		reviewImages: v.optional(v.array(v.string())),
		reviewerConsentMetrics: v.optional(v.boolean()),
		reviewerMetricsSnapshot: v.optional(
			v.object({
				bodyType: v.optional(v.string()),
				heightCm: v.optional(v.number()),
				weightKg: v.optional(v.number()),
				bustCm: v.optional(v.number()),
				waistCm: v.optional(v.number()),
				hipsCm: v.optional(v.number()),
			})
		),
		helpfulCount: v.optional(v.number()),
		meta: v.optional(v.object({})),
	})
		.index("byProductVariant", ["productVariantId"])
		.index("byUser", ["userId"]),

	//
	// USER-PRODUCT INTERACTIONS (clicks, affiliate callbacks, receipts)
	//
	userProductInteractions: defineTable({
		userId: v.id("users"),
		productVariantId: v.id("productVariants"),
		eventType: v.string(), // click | affiliate_click | affiliate_confirm | purchase_confirmed | self_report_purchase | receipt_upload
		clickId: v.optional(v.string()), // your click tracker id
		affiliateTag: v.optional(v.string()),
		affiliateNetwork: v.optional(v.string()),
		receiptUploadUrl: v.optional(v.string()),
		purchaseAmount: v.optional(v.number()),
		currency: v.optional(v.string()),
		confirmedAt: v.optional(v.number()),
		createdAt: v.number(),
		metadata: v.optional(v.object({})),
	})
		.index("byUser", ["userId"])
		.index("byProductVariant", ["productVariantId"]),

	//
	// REWARDS / LEDGER
	//
	rewardEvents: defineTable({
		userId: v.id("users"),
		type: v.string(), // review | purchase | affiliate_reward | referral | redemption | manual_adjustment
		points: v.number(),
		relatedId: v.optional(v.string()), // reviewId or interactionId
		timestamp: v.number(),
		metadata: v.optional(v.object({})),
	}).index("byUser", ["userId"]),

	//
	// PAYMENTS (if you keep it)
	//
	payments: defineTable({
		userId: v.id("users"),
		amount: v.number(),
		currency: v.string(),
		status: v.string(), // "pending", "completed", "failed"
		stripeSessionId: v.optional(v.string()),
		stripePaymentIntentId: v.optional(v.string()),
		description: v.optional(v.string()),
		createdAt: v.number(),
		completedAt: v.optional(v.number()),
	}).index("byUser", ["userId"]),

	//
	// CRAWL / TRACKING
	//
	crawlFrontier: defineTable({
		url: v.string(),
		productVariantId: v.optional(v.id("productVariants")),
		source: v.optional(v.string()), // e.g., "myntra"
		domain: v.optional(v.string()), // e.g., "myntra.com"
		nextCheckAt: v.number(), // epoch ms - scheduler uses this
		lastCheckedAt: v.optional(v.number()),
		lastChangedAt: v.optional(v.number()),
		fingerprint: v.optional(v.string()), // cheap content hash
		semanticFingerprintId: v.optional(v.string()), // pointer to last semantic fingerprint / embedding id
		priorityScore: v.optional(v.number()),
		status: v.optional(v.string()), // queued | in-progress | paused | error
		errorCount: v.optional(v.number()),
		backoffUntil: v.optional(v.number()),
		createdAt: v.number(),
		meta: v.optional(v.object({})), // freeform metadata for crawler
	})
		.index("byNextCheck", ["nextCheckAt"])
		.index("byDomain", ["domain"]),

	// Snapshots / versioned raw + parsed
	productSnapshots: defineTable({
		productVariantId: v.id("productVariants"),
		snapshotPath: v.string(), // e.g., s3://bucket/path/to/snapshot.json
		snapshotHash: v.optional(v.string()),
		snapshotSize: v.optional(v.number()),
		parsedCanonical: v.optional(v.object({})), // small canonical JSON (title, price, attrs)
		createdAt: v.number(),
		meta: v.optional(v.object({})),
	}).index("byProductVariant", ["productVariantId"]),

	// Immutable changelog for each variant
	productChangeLog: defineTable({
		productVariantId: v.id("productVariants"),
		changedAt: v.number(),
		changeType: v.string(), // price | availability | content | images | metadata
		changedFields: v.optional(v.array(v.string())),
		diffSummary: v.optional(v.string()),
		changeScore: v.optional(v.number()), // semantic change score
		snapshotId: v.optional(v.id("productSnapshots")),
		createdAt: v.number(),
		meta: v.optional(v.object({})),
	}).index("byProductVariant", ["productVariantId"]),

	// Per-domain crawling configuration (robots, rate limits)
	domainConfigs: defineTable({
		domain: v.string(),
		maxRps: v.optional(v.number()), // requests per second budget
		crawlDelaySeconds: v.optional(v.number()),
		useRenderer: v.optional(v.boolean()), // use headless renderer on failure / always
		allowedPaths: v.optional(v.array(v.string())),
		disallowedPaths: v.optional(v.array(v.string())),
		robotsParsed: v.optional(v.boolean()),
		lastUpdatedAt: v.optional(v.number()),
		meta: v.optional(v.object({})),
	}).index("byDomain", ["domain"]),

	//
	// EMBEDDING / ENRICHMENT JOBS
	//
	embeddingJobs: defineTable({
		entityType: v.string(), // "productVariant" | "wardrobeItem" | "userPreference"
		entityId: v.string(), // the id of the entity (stringified)
		jobType: v.optional(v.string()), // "text" | "image" | "both"
		status: v.optional(v.string()), // queued | running | succeeded | failed
		attempts: v.optional(v.number()),
		lastError: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.optional(v.number()),
		meta: v.optional(v.object({})),
	}).index("byEntity", ["entityType", "entityId"]),

	//
	// UPLOADS / RECEIPTS / IMAGE PROCESSING
	//
	uploads: defineTable({
		userId: v.optional(v.id("users")),
		type: v.string(), // 'receipt', 'wardrobe_photo', 'profile_pic', etc.
		storageId: v.optional(v.id("_storage")),
		url: v.string(),
		metadata: v.optional(v.object({})),
		status: v.optional(v.string()), // pending | validated | rejected
		createdAt: v.number(),
		processedAt: v.optional(v.number()),
	}).index("byUser", ["userId"]),

	imageUploads: defineTable({
		userId: v.optional(v.id("users")),
		wardrobeItemId: v.optional(v.id("wardrobeItems")),
		storageId: v.optional(v.id("_storage")),
		url: v.string(),
		width: v.optional(v.number()),
		height: v.optional(v.number()),
		dominantColor: v.optional(v.string()),
		processedAt: v.optional(v.number()),
		embeddingId: v.optional(v.string()),
		status: v.optional(v.string()), // pending/processed/failed
		createdAt: v.number(),
		meta: v.optional(v.object({})),
	})
		.index("byUser", ["userId"])
		.index("byWardrobeItem", ["wardrobeItemId"]),

	//
	// AFFILIATE CALLBACKS / RAW PAYLOADS (audit trail)
	//
	affiliateCallbacks: defineTable({
		affiliateNetwork: v.string(),
		payload: v.object({}), // store raw JSON for auditing and reprocessing
		processed: v.optional(v.boolean()),
		processedAt: v.optional(v.number()),
		createdAt: v.number(),
	}).index("byNetwork", ["affiliateNetwork"]),

	//
	// MODERATION QUEUE
	//
	moderationQueue: defineTable({
		entityType: v.string(), // 'review' | 'post' | 'image'
		entityId: v.string(),
		reason: v.optional(v.string()),
		reporterUserId: v.optional(v.id("users")),
		status: v.optional(v.string()), // pending | reviewed | resolved
		assignedTo: v.optional(v.id("users")),
		createdAt: v.number(),
		resolvedAt: v.optional(v.number()),
		meta: v.optional(v.object({})),
	}).index("byStatus", ["status"]),

	//
	// AUDIT LOGS
	//
	auditLogs: defineTable({
		actorUserId: v.optional(v.id("users")), // or null/system
		action: v.string(), // 'consent.updated','reward.issued','user.deleted', etc
		targetType: v.optional(v.string()),
		targetId: v.optional(v.string()),
		payload: v.optional(v.object({})),
		createdAt: v.number(),
	}).index("byActor", ["actorUserId"]),

	//
	// NOTIFICATIONS (in-app / email / push)
	//
	notifications: defineTable({
		userId: v.id("users"),
		type: v.string(), // 'review_prompt','reward','social','system'
		payload: v.optional(v.object({})),
		delivered: v.optional(v.boolean()),
		createdAt: v.number(),
		deliveredAt: v.optional(v.number()),
		meta: v.optional(v.object({})),
	}).index("byUser", ["userId"]),

	//
	// ANALYTICS / EVENTS (lightweight event sink for ML pipelines)
	//
	analyticsEvents: defineTable({
		userId: v.optional(v.id("users")),
		eventType: v.string(), // 'view','click','search','impression'
		entityType: v.optional(v.string()),
		entityId: v.optional(v.string()),
		properties: v.optional(v.object({})),
		createdAt: v.number(),
	}).index("byUser", ["userId"]),
});
