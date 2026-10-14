import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // The watchlist: accounts and apps flagged by the AI monitoring sweep.
    flaggedAccounts: defineTable({
      handle: v.string(), // @handle, or package id for app-store entries
      displayName: v.string(), // account / app display name
      platform: v.union(
        v.literal("instagram"),
        v.literal("x"),
        v.literal("facebook"),
        v.literal("tiktok"),
        v.literal("youtube"),
        v.literal("telegram"),
        v.literal("linkedin"),
        v.literal("googleplay"),
        v.literal("appstore"),
      ),
      brandName: v.string(), // client brand the entry was detected against
      threatType: v.union(
        v.literal("fake_profile"),
        v.literal("impersonation"),
        v.literal("scam_account"),
        v.literal("suspicious_app"),
      ),
      severity: v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low"),
      ),
      riskScore: v.number(), // AI confidence 0-100 that this is a threat
      status: v.union(
        v.literal("new"),
        v.literal("investigating"),
        v.literal("resolved"),
        v.literal("dismissed"),
      ),
      summary: v.string(), // AI-written detection summary
      signals: v.array(v.string()), // evidence signals backing the score
      followers: v.optional(v.number()), // audience size (social entries only)
      detectedAt: v.number(), // when the sweep flagged it
      publisherName: v.optional(v.string()), // For apps: rogue developer/publisher
      publisherMismatch: v.optional(v.boolean()), // True if rogue developer != official publisher
      officialPublisher: v.optional(v.string()), // For apps: legitimate brand publisher
      homoglyphSubstitution: v.optional(v.string()), // e.g. "o -> 0 in handle"
    })
      .index("by_status", ["status"])
      .index("by_brand", ["brandName"])
      .index("by_detectedAt", ["detectedAt"]),

    // Legitimate Brand Profiles & Verified Assets (15% Hackathon Weight)
    brandProfiles: defineTable({
      brandName: v.string(), // e.g. "Zomato", "PhonePe", "Nike", "Northline Bank"
      officialWebsite: v.optional(v.string()),
      officialLogoUrl: v.optional(v.string()),
      officialPublisher: v.string(), // e.g. "Zomato Media Pvt. Ltd."
      officialHandles: v.array(v.string()), // e.g. ["@zomato", "@zomatocare"]
      officialPackages: v.array(v.string()), // e.g. ["com.application.zomato", "id434613896"]
      description: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_brand", ["brandName"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
