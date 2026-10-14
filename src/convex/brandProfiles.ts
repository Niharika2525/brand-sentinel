import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

export const DEFAULT_BRAND_PROFILES = [
  {
    brandName: "Zomato",
    officialWebsite: "https://www.zomato.com",
    officialLogoUrl: "https://b.zmtcdn.com/web_assets/b40b97e677bc7b2ca77c58c61db266fe1603954218.png",
    officialPublisher: "Zomato Media Pvt. Ltd.",
    officialHandles: ["@zomato", "@zomatocare", "@zomato_in", "zomato"],
    officialPackages: ["com.application.zomato", "id434613896"],
    description: "Leading online restaurant search, online ordering and food delivery platform.",
  },
  {
    brandName: "PhonePe",
    officialWebsite: "https://www.phonepe.com",
    officialLogoUrl: "https://www.phonepe.com/img/phonepe-logo.svg",
    officialPublisher: "PhonePe Internet Pvt. Ltd.",
    officialHandles: ["@phonepe", "@phonepesupport", "@phonepe_in", "phonepe"],
    officialPackages: ["com.phonepe.app", "id1170055821"],
    description: "Fintech platform for digital payments, investments, and UPI transfers in India.",
  },
  {
    brandName: "Nike",
    officialWebsite: "https://www.nike.com",
    officialLogoUrl: "https://www.nike.com/assets/experience/ciclp/static/v1/latest/images/swoosh.svg",
    officialPublisher: "Nike Inc.",
    officialHandles: ["@nike", "@nikestore", "@nikesupport", "@nikerunning", "nike"],
    officialPackages: ["com.nike.omega", "id1095459556", "com.nike.plus.snkrs"],
    description: "Global athletic apparel, footwear, and sports equipment design and retail.",
  },
  {
    brandName: "Northline Bank",
    officialWebsite: "https://www.northlinebank.com",
    officialLogoUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128&q=80",
    officialPublisher: "Northline Financial Services Group LLC",
    officialHandles: ["@northlinebank", "@northline_official", "@northline_care"],
    officialPackages: ["com.northline.mobilebank", "id982314561"],
    description: "Multi-jurisdiction commercial and retail banking institution.",
  },
  {
    brandName: "Binance",
    officialWebsite: "https://www.binance.com",
    officialLogoUrl: "https://bin.bnbstatic.com/static/images/common/favicon.ico",
    officialPublisher: "Binance Holdings Limited",
    officialHandles: ["@binance", "@binancehelpdesk", "@binance_official"],
    officialPackages: ["com.binance.dev", "id1436799971"],
    description: "Global digital asset and cryptocurrency exchange infrastructure.",
  },
];

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

/**
 * List all registered brand profiles
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    const profiles = await ctx.db.query("brandProfiles").collect();
    return profiles.sort((a, b) => a.brandName.localeCompare(b.brandName));
  },
});

/**
 * Get profile for a specific brand
 */
export const get = query({
  args: {
    brandName: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.db
      .query("brandProfiles")
      .withIndex("by_brand", (q) => q.eq("brandName", args.brandName.trim()))
      .first();
  },
});

/**
 * Seed default legitimate brand profiles if table is empty
 */
export const ensureDefaultProfiles = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    const existing = await ctx.db.query("brandProfiles").take(1);
    if (existing.length > 0) {
      return { seeded: 0 };
    }

    const now = Date.now();
    for (const profile of DEFAULT_BRAND_PROFILES) {
      await ctx.db.insert("brandProfiles", {
        ...profile,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { seeded: DEFAULT_BRAND_PROFILES.length };
  },
});

/**
 * Create or update a brand profile and its legitimate verified assets
 */
export const upsert = mutation({
  args: {
    brandName: v.string(),
    officialWebsite: v.optional(v.string()),
    officialLogoUrl: v.optional(v.string()),
    officialPublisher: v.string(),
    officialHandles: v.array(v.string()),
    officialPackages: v.array(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    const brandName = args.brandName.trim();
    if (!brandName) {
      throw new Error("Brand name is required");
    }
    if (!args.officialPublisher.trim()) {
      throw new Error("Official publisher / developer name is required");
    }

    // Clean and normalize handles & packages
    const officialHandles = args.officialHandles
      .map((h) => h.trim())
      .filter(Boolean);
    const officialPackages = args.officialPackages
      .map((p) => p.trim())
      .filter(Boolean);

    const now = Date.now();

    const existing = await ctx.db
      .query("brandProfiles")
      .withIndex("by_brand", (q) => q.eq("brandName", brandName))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        officialWebsite: args.officialWebsite?.trim(),
        officialLogoUrl: args.officialLogoUrl?.trim(),
        officialPublisher: args.officialPublisher.trim(),
        officialHandles,
        officialPackages,
        description: args.description?.trim(),
        updatedAt: now,
      });
      return { id: existing._id, action: "updated" };
    } else {
      const id = await ctx.db.insert("brandProfiles", {
        brandName,
        officialWebsite: args.officialWebsite?.trim(),
        officialLogoUrl: args.officialLogoUrl?.trim(),
        officialPublisher: args.officialPublisher.trim(),
        officialHandles,
        officialPackages,
        description: args.description?.trim(),
        createdAt: now,
        updatedAt: now,
      });
      return { id, action: "created" };
    }
  },
});

/**
 * Remove a brand profile
 */
export const remove = mutation({
  args: {
    id: v.id("brandProfiles"),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

