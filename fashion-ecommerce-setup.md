# Fashion E-commerce Aggregator - Complete Setup Guide

## Prerequisites

- **Clerk**: For authentication.
    
- **Convex**: For backend database and logic.
    
- **Razorpay**: For payment processing.

## Project Setup

### 1. Initialize the Next.js Project

```bash
npx create-next-app@latest stylegence --typescript --tailwind --eslint --app
cd stylegence
```

### 2. Install Dependencies

```bash
npm install @clerk/nextjs convex razorpay @types/razorpay axios
npm install @clerk/backend svix
# Optionally install body-parser and crypto for Node.js webhook verification.
npm install body-parser crypto
```

- 1. and 2. are done
### 3. Environment Variables

Create `.env.local`:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://formal-hornet-318.convex.cloud
CONVEX_DEPLOY_KEY=dev:formal-hornet-318|eyJ2MiI6IjRjMzk3Y2ZmZjgxMDQyNmQ5MWYyYzM1Yjg1MzQ0ZDMxIn0=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3VtbWFyeS10ZXRyYS04NC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_2Cs61euEZ6ee09AcwsiK8nr9ZRJVX3K63m25wmmmwD
CLERK_JWT_ISSUER_DOMAIN=https://summary-tetra-84.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Razorpay (India)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Convex Setup

### Initialize Convex

```bash
npx convex dev
```

### Database Schema (`convex/schema.ts`)

```typescript
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
          notes: v.optional(v.string())
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
          searchableAsGroup: v.optional(v.boolean()) // allow group searches
        })
      )
    ),

    familyGroupIds: v.optional(v.array(v.string())), // group documents (see familyGroups table)

    // rewards summary
    pointsBalance: v.optional(v.number()),

    // computed / metadata
    meta: v.optional(v.object({})) // freeform computed values
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
        shareMetrics: v.optional(v.boolean()) // subject to per-user consent
      })
    ),
    groupPreferences: v.optional(
      v.object({
        preferredCategories: v.optional(v.array(v.string())),
        preferredPriceMin: v.optional(v.number()),
        preferredPriceMax: v.optional(v.number()),
        occasionProfiles: v.optional(v.array(v.string()))
      })
    ),
    searchable: v.optional(v.boolean()), // allow group-based searches
    meta: v.optional(v.object({}))
  }).index("byOwner", ["ownerUserId"]),

  //
  // BRANDS, CATEGORIES (unchanged but add slug/index)
  //
  brands: defineTable({
    name: v.string(),
    logoUrl: v.optional(v.string()),
    description: v.optional(v.string())
  }).index("byName", ["name"]),

  categories: defineTable({
    name: v.string(),
    parentCategoryId: v.optional(v.id("categories")),
    slug: v.string()
  }).index("bySlug", ["slug"]),

  //
  // ATTRIBUTE SYSTEM (same)
  //
  attributes: defineTable({
    name: v.string(),
    displayName: v.string()
  }),

  attributeValues: defineTable({
    attributeId: v.id("attributes"),
    value: v.string()
  }),

  productVariantAttributes: defineTable({
    productVariantId: v.id("productVariants"),
    attributeId: v.id("attributes"),
    attributeValueId: v.id("attributeValues")
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
        recommendedForGroups: v.optional(v.object({})) // e.g., { "couple_outing": {score:0.9,notes:""} }
      })
    ),

    meta: v.optional(v.object({}))
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

    meta: v.optional(v.object({}))
  }).index("bySku", ["sku"])
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
    uploadedAt: v.optional(v.number())
  }).index("byProductVariant", ["productVariantId"])
    .index("byWardrobeItem", ["wardrobeItemId"]),

  //
  // SOURCES & SELLERS & LISTINGS
  //
  sources: defineTable({
    name: v.string(),
    baseUrl: v.string()
  }).index("byName", ["name"]),

  sellers: defineTable({
    sourceId: v.id("sources"),
    name: v.string(),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number())
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
    meta: v.optional(v.object({}))
  }).index("byProductVariant", ["productVariantId"]),

  priceHistory: defineTable({
    sourceListingId: v.id("sourceListings"),
    price: v.number(),
    mrp: v.optional(v.number()),
    timestamp: v.number()
  }).index("byListing", ["sourceListingId"]),

  offers: defineTable({
    sourceListingId: v.id("sourceListings"),
    description: v.string(),
    type: v.string(),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number())
  }).index("byListing", ["sourceListingId"]),

  //
  // WISHLIST
  //
  wishlistItems: defineTable({
    userId: v.id("users"),
    productVariantId: v.id("productVariants"),
    addedAt: v.number()
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
          permissions: v.optional(v.array(v.string())) // ["view","use_for_outfit","edit"]
        })
      )
    ),

    // compatibility & computed lists
    compatibleProfiles: v.optional(v.array(v.string())), // cluster ids or user ids
    createdFromPhoto: v.optional(v.boolean()),
    addedAt: v.number(),
    lastWornAt: v.optional(v.number()),
    wearCount: v.optional(v.number()),

    meta: v.optional(v.object({}))
  }).index("byUser", ["userId"])
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
    tags: v.optional(v.array(v.string()))
  }).index("byUser", ["userId"]),

  outfitItems: defineTable({
    outfitId: v.id("outfits"),
    // can reference a wardrobeItem or a productVariant (for ephemeral outfits)
    wardrobeItemId: v.optional(v.id("wardrobeItems")),
    productVariantId: v.optional(v.id("productVariants")),
    displayOrder: v.optional(v.number())
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
    media: v.optional(v.array(v.string())) // array of image URLs or storage ids
  }).index("byUser", ["userId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number()
  }).index("byFollower", ["followerId"])
    .index("byFollowing", ["followingId"]),

  interactions: defineTable({
    userId: v.id("users"),
    // polymorphic target: store the id plus a type to resolve in app logic
    targetId: v.string(),
    targetType: v.string(), // "POST" | "OUTFIT" | "COMMENT"
    interactionType: v.string(), // "LIKE" | "COMMENT" | "SAVE"
    commentBody: v.optional(v.string()),
    createdAt: v.number()
  }).index("byTarget", ["targetId", "targetType"])
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
        hipsCm: v.optional(v.number())
      })
    ),
    helpfulCount: v.optional(v.number()),
    meta: v.optional(v.object({}))
  }).index("byProductVariant", ["productVariantId"])
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
    metadata: v.optional(v.object({}))
  }).index("byUser", ["userId"])
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
    metadata: v.optional(v.object({}))
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
    completedAt: v.optional(v.number())
  }).index("byUser", ["userId"]),

  //
  // CRAWL / TRACKING
  //
  crawlFrontier: defineTable({
    url: v.string(),
    productVariantId: v.optional(v.id("productVariants")),
    source: v.optional(v.string()),           // e.g., "myntra"
    domain: v.optional(v.string()),           // e.g., "myntra.com"
    nextCheckAt: v.number(),                  // epoch ms - scheduler uses this
    lastCheckedAt: v.optional(v.number()),
    lastChangedAt: v.optional(v.number()),
    fingerprint: v.optional(v.string()),      // cheap content hash
    semanticFingerprintId: v.optional(v.string()), // pointer to last semantic fingerprint / embedding id
    priorityScore: v.optional(v.number()),
    status: v.optional(v.string()),           // queued | in-progress | paused | error
    errorCount: v.optional(v.number()),
    backoffUntil: v.optional(v.number()),
    createdAt: v.number(),
    meta: v.optional(v.object({}))            // freeform metadata for crawler
  }).index("byNextCheck", ["nextCheckAt"]).index("byDomain", ["domain"]),

  // Snapshots / versioned raw + parsed
  productSnapshots: defineTable({
    productVariantId: v.id("productVariants"),
    snapshotPath: v.string(),   // e.g., s3://bucket/path/to/snapshot.json
    snapshotHash: v.optional(v.string()),
    snapshotSize: v.optional(v.number()),
    parsedCanonical: v.optional(v.object({})), // small canonical JSON (title, price, attrs)
    createdAt: v.number(),
    meta: v.optional(v.object({}))
  }).index("byProductVariant", ["productVariantId"]),

  // Immutable changelog for each variant
  productChangeLog: defineTable({
    productVariantId: v.id("productVariants"),
    changedAt: v.number(),
    changeType: v.string(),       // price | availability | content | images | metadata
    changedFields: v.optional(v.array(v.string())),
    diffSummary: v.optional(v.string()),
    changeScore: v.optional(v.number()), // semantic change score
    snapshotId: v.optional(v.id("productSnapshots")),
    createdAt: v.number(),
    meta: v.optional(v.object({}))
  }).index("byProductVariant", ["productVariantId"]),

  // Per-domain crawling configuration (robots, rate limits)
  domainConfigs: defineTable({
    domain: v.string(),
    maxRps: v.optional(v.number()),        // requests per second budget
    crawlDelaySeconds: v.optional(v.number()),
    useRenderer: v.optional(v.boolean()),  // use headless renderer on failure / always
    allowedPaths: v.optional(v.array(v.string())),
    disallowedPaths: v.optional(v.array(v.string())),
    robotsParsed: v.optional(v.boolean()),
    lastUpdatedAt: v.optional(v.number()),
    meta: v.optional(v.object({}))
  }).index("byDomain", ["domain"]),

  //
  // EMBEDDING / ENRICHMENT JOBS
  //
  embeddingJobs: defineTable({
    entityType: v.string(),     // "productVariant" | "wardrobeItem" | "userPreference"
    entityId: v.string(),       // the id of the entity (stringified)
    jobType: v.optional(v.string()), // "text" | "image" | "both"
    status: v.optional(v.string()), // queued | running | succeeded | failed
    attempts: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    meta: v.optional(v.object({}))
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
    processedAt: v.optional(v.number())
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
    meta: v.optional(v.object({}))
  }).index("byUser", ["userId"])
    .index("byWardrobeItem", ["wardrobeItemId"]),

  //
  // AFFILIATE CALLBACKS / RAW PAYLOADS (audit trail)
  //
  affiliateCallbacks: defineTable({
    affiliateNetwork: v.string(),
    payload: v.object({}), // store raw JSON for auditing and reprocessing
    processed: v.optional(v.boolean()),
    processedAt: v.optional(v.number()),
    createdAt: v.number()
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
    meta: v.optional(v.object({}))
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
    createdAt: v.number()
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
    meta: v.optional(v.object({}))
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
    createdAt: v.number()
  }).index("byUser", ["userId"])
});


});
```

### Authentication Config (`convex/auth.config.ts`)

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

### User Management (`convex/users.ts`)

```typescript
import { internalMutation, query, QueryCtx } from "./_generated/server";
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
    const displayName = (first || last) ? `${first} ${last}`.trim() : "Anonymous";

    // Pick primary email if available
    const email = (data.email_addresses && data.email_addresses[0] && data.email_addresses[0].email_address) || "";

    const incoming = {
      name: displayName,
      email,
      externalId: data.id, // Clerk ID (immutable)
      profilePictureUrl: data.image_url || null,
    };

    // Check existing user by externalId
    const existing = await userByExternalId(ctx, data.id);

    const now = Date.now();

    if (existing === null) {
      // Insert with sensible defaults for fields we manage
      await ctx.db.insert("users", {
        ...incoming,
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
        profilePictureUrl: incoming.profilePictureUrl,
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
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`);
    }
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
```

### Webhook Handler (`convex/http.ts`) 
- change this in accordance to razorpay

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

// Clerk webhook handler
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateClerkRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted": {
        const clerkUserId = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }
      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

// Stripe webhook handler
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    try {
      const body = await request.text();
      const event = JSON.parse(body); // In production, verify with Stripe's webhook secret

      switch (event.type) {
        case "checkout.session.completed":
          await ctx.runMutation(internal.payments.fulfillPayment, {
            sessionId: event.data.object.id,
          });
          break;
        case "payment_intent.succeeded":
          console.log("Payment succeeded:", event.data.object.id);
          break;
        default:
          console.log("Unhandled Stripe event:", event.type);
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      return new Response("Webhook error", { status: 400 });
    }
  }),
});

async function validateClerkRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;
```

### Payment Integration (`convex/payments.ts`)

```typescript
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const createPayment = mutation({
  args: {
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    return await ctx.db.insert("payments", {
      userId: user._id,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

export const getUserPayments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    return await ctx.db
      .query("payments")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const fulfillPayment = internalMutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("stripeSessionId"), args.sessionId))
      .unique();

    if (payment) {
      await ctx.db.patch(payment._id, {
        status: "completed",
        completedAt: Date.now(),
      });
    }
  },
});
```

## Razorpay Payment Integration in Next.js 14+

## A. Backend: Create Order API

`app/api/createOrder/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Load from .env.local
const key_id = process.env.RAZORPAY_KEY_ID as string;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string;

const razorpay = new Razorpay({ key_id, key_secret });

export type OrderBody = { amount: number; currency: string; };

export async function POST(req: NextRequest) {
  try {
    const { amount, currency }: OrderBody = await req.json();
    // Amount is in paise. Multiply by 100.
    const options = {
      amount,
      currency: currency || "INR",
      receipt: `receipt#${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Order creation failed", error }, { status: 500 });
  }
}
```

## B. Frontend: Razorpay Checkout Button

`components/PaymentButton.tsx`

```typescript
"use client";
import React from "react";
import Script from "next/script";
import axios from "axios";

export default function PaymentButton({ amount, description, userInfo }: { amount: number; description: string; userInfo: any; }) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Create Razorpay order (api route)
      const orderRes = await axios.post("/api/createOrder", { amount: amount * 100, currency: "INR" }); // RxPay expects paise
      const order = orderRes.data;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Fashion Aggregator",
        description,
        order_id: order.id,
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
        },
        handler: async function (response: any) {
          // Optionally verify payment server-side
          await axios.post("/api/verifyOrder", {
            razorpay_order_id: order.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          alert("Payment Successful!");
        },
        theme: { color: "#3399cc" },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        alert("Payment failed. Please try again.");
        console.error(response.error);
      });
      razorpay.open();
    } catch (error) {
      alert("Payment failed. Please try again.");
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700" onClick={handlePayment} disabled={isLoading}>
        {isLoading ? "Processing..." : "Pay Now"}
      </button>
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
    </>
  );
}
```

## C. Backend: Payment Signature Verification

`app/api/verifyOrder/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    const sign_str = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected_signature = crypto.createHmac("sha256", secret).update(sign_str).digest("hex");
    if (expected_signature === razorpay_signature) {
      // Update payment status in Convex database here
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    }
    return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Verification failure", success: false }, { status: 500 });
  }
}
```

## D. Razorpay Webhook (Server-side confirmation, optional)

- Set up a `/api/webhooks/razorpay` endpoint with signature validation. Use the same `.env` secret for HMAC.
    
- Select events like `payment.captured` in Razorpay Dashboard to listen for final confirmations.
    
- Ensure all successful payments update the corresponding payment record in Convex, e.g. set `status: "completed"` in your schema.[](https://sreyas.com/blog/razorpay-webhooks-with-node-js/)

### Wishlist Management (`convex/wishlist.ts`)

```typescript
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
```

## Next.js Frontend Setup

### Middleware (`middleware.ts`)

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### Convex Provider (`app/components/ConvexClientProvider.tsx`)

```typescript
"use client";
import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your environment variables");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
```

### Root Layout (`app/layout.tsx`)

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "./components/ConvexClientProvider";
import { Geist, Geist_Mono } from 'next/font/google'

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fashion Aggregator",
  description: "Your complete fashion shopping destination",
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Clerk Next.js Quickstart',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### Main Page (`app/page.tsx`)

```typescript
"use client";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Fashion Aggregator</h1>
          <Authenticated>
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton />
          </Unauthenticated>
        </header>

        <Authenticated>
          <Dashboard />
        </Authenticated>
        
        <Unauthenticated>
          <div className="text-center py-16">
            <h2 className="text-2xl mb-4">Welcome to Fashion Aggregator</h2>
            <p className="text-gray-600 mb-8">
              Discover, curate, and shop the latest fashion trends from multiple platforms.
            </p>
            <SignInButton>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Get Started
              </button>
            </SignInButton>
          </div>
        </Unauthenticated>
      </div>
    </main>
  );
}

function Dashboard() {
  const user = useQuery(api.users.current);
  const wishlist = useQuery(api.wishlist.getUserWishlist);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Welcome back, {user?.name || "User"}!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Wishlist Items</h3>
            <p className="text-3xl font-bold text-blue-600">
              {wishlist?.length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Wardrobe Items</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Outfits Created</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### Clerk Webhook (`app/api/webhooks/clerk/route.ts`)

```typescript
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local");
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Forward to Convex webhook handler
  const convexUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/api', '')}/clerk-users-webhook`;
  
  try {
    const response = await fetch(convexUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      },
      body: body,
    });

    if (!response.ok) {
      console.error("Error forwarding to Convex:", response.statusText);
    }
  } catch (error) {
    console.error("Error forwarding to Convex:", error);
  }

  return new NextResponse("", { status: 200 });
}
```

## Deployment Steps

### 1. Deploy Convex

```bash
npx convex deploy
```

### 2. Configure Webhooks

#### Clerk Webhook
- Go to Clerk Dashboard → Webhooks
- Add endpoint: `https://your-domain.com/api/webhooks/clerk`
- Select events: `user.created`, `user.updated`, `user.deleted`

#### Stripe Webhook
- Go to Stripe Dashboard → Webhooks
- Add endpoint: `https://your-convex-deployment.convex.site/stripe-webhook`
- Select events: `checkout.session.completed`, `payment_intent.succeeded`

### 3. Set Environment Variables

Update all environment variables in:
- `.env.local` (local development)
- Convex Dashboard (Convex environment variables)
- Vercel/Netlify (production deployment)

### 4. Deploy to Vercel

```bash
npm run build
vercel --prod
```

## Usage Examples

### Adding Items to Wishlist

```typescript
const addToWishlist = useMutation(api.wishlist.addToWishlist);

// Usage
await addToWishlist({ productVariantId: "some-product-id" });
```

### Processing Payments

```typescript
const createCheckout = useAction(api.stripe.createCheckoutSession);

// Usage
const result = await createCheckout({
  amount: 29.99,
  description: "Premium Subscription"
});
```

### Creating Outfits

```typescript
// This would be implemented in convex/outfits.ts
const createOutfit = useMutation(api.outfits.create);

await createOutfit({
  name: "Summer Beach Look",
  description: "Perfect for a day at the beach",
  visibility: "public"
});
```

This complete implementation provides:

1. **Full Authentication**: Clerk integration with user sync to Convex
2. **Comprehensive Database**: All schemas from the markdown implemented in Convex
3. **Payment Processing**: Razorpay integration for transactions
4. **Real-time Updates**: Convex's reactive queries for live data
5. **Social Features**: Foundation for posts, follows, and interactions
6. **File Storage**: Built-in support for images and media
7. **Webhooks**: Proper sync between all services