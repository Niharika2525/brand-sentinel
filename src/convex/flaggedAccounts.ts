import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

type Platform =
  | "instagram"
  | "x"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "telegram"
  | "googleplay"
  | "appstore";

type ThreatType =
  | "fake_profile"
  | "impersonation"
  | "scam_account"
  | "suspicious_app";

type Severity = "critical" | "high" | "medium" | "low";

type Status = "new" | "investigating" | "resolved" | "dismissed";

const statusValidator = v.union(
  v.literal("new"),
  v.literal("investigating"),
  v.literal("resolved"),
  v.literal("dismissed"),
);

/** Watchlist mutations/queries are only available to signed-in agency users. */
async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  return userId;
}

/**
 * Every flagged account currently on the watchlist, newest detection first.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    const entries = await ctx.db.query("flaggedAccounts").collect();
    return entries.sort((a, b) => b.detectedAt - a.detectedAt);
  },
});

/**
 * Move a flagged account through the review workflow:
 * new -> investigating -> resolved / dismissed.
 */
export const setStatus = mutation({
  args: {
    id: v.id("flaggedAccounts"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const entry = await ctx.db.get(args.id);
    if (entry === null) {
      throw new Error("Flagged account not found");
    }
    await ctx.db.patch(args.id, { status: args.status });
  },
});

type SeedEntry = {
  handle: string;
  displayName: string;
  platform: Platform;
  brandName: string;
  threatType: ThreatType;
  severity: Severity;
  riskScore: number;
  status: Status;
  summary: string;
  signals: string[];
  followers?: number;
  minutesAgo: number;
};

export const SEED_ENTRIES: SeedEntry[] = [
  {
    handle: "@northline.support.official",
    displayName: "Northline Bank Official",
    platform: "instagram",
    brandName: "Northline Bank",
    threatType: "impersonation",
    severity: "critical",
    riskScore: 96,
    status: "new",
    summary:
      "Clones the bank's identity and DMs followers a 're-verification' link that leads to a credential-harvest page.",
    signals: [
      "Display name and avatar copied from the verified account",
      "Bio links to northline-verify.co, registered 4 days ago",
      "Sent 2,300+ DMs carrying the same verification link",
      "Posting cadence mirrors the official account within minutes",
    ],
    followers: 12400,
    minutesAgo: 35,
  },
  {
    handle: "com.northline.quickloan",
    displayName: "NorthLine Quick Loans",
    platform: "googleplay",
    brandName: "Northline Bank",
    threatType: "suspicious_app",
    severity: "critical",
    riskScore: 93,
    status: "new",
    summary:
      "Unofficial lending app impersonating the bank's mobile app while requesting SMS access and upfront fees.",
    signals: [
      "Requests READ_SMS and CONTACTS permissions",
      "Developer account created 6 days ago",
      "Listing copy lifted from the official app",
      "Demands a 'processing fee' payable by gift card",
    ],
    minutesAgo: 110,
  },
  {
    handle: "@voyagerair_deals",
    displayName: "Voyager Air Refunds",
    platform: "x",
    brandName: "Voyager Air",
    threatType: "scam_account",
    severity: "critical",
    riskScore: 91,
    status: "new",
    summary:
      "Replies to delayed-flight complaints within seconds, routing passengers to fake refund portals.",
    signals: [
      "Auto-replies under delay hashtags",
      "Links to voyager-air-refund[.]net",
      "No verified domain anywhere in the profile",
      "47 passenger complaints matched to this handle",
    ],
    followers: 8900,
    minutesAgo: 240,
  },
  {
    handle: "@solace.health.care",
    displayName: "Solace Health Care",
    platform: "instagram",
    brandName: "Solace Health",
    threatType: "fake_profile",
    severity: "high",
    riskScore: 84,
    status: "investigating",
    summary:
      "Poses as the clinic network and sells unapproved treatments through DMs to patients.",
    signals: [
      "Claims an affiliation that official channels never mention",
      "Promotes prescription-only treatments with no consultation",
      "Stock photography reused across 9 recent posts",
      "Reported by 12 patients this week",
    ],
    followers: 31200,
    minutesAgo: 420,
  },
  {
    handle: "@northline-help-center",
    displayName: "Northline Bank Help Center",
    platform: "facebook",
    brandName: "Northline Bank",
    threatType: "impersonation",
    severity: "high",
    riskScore: 82,
    status: "investigating",
    summary:
      "Facebook page mirrors the bank's support branding and harvests online-banking login details.",
    signals: [
      "Page name matches official support branding",
      "Requests payment details outside official channels",
      "Page created 3 weeks ago",
      "Redirects to a cloned online-banking login",
    ],
    followers: 6100,
    minutesAgo: 610,
  },
  {
    handle: "com.lumen.skinanalyzer",
    displayName: "Lumen – Skin Analyzer",
    platform: "appstore",
    brandName: "Lumen Cosmetics",
    threatType: "suspicious_app",
    severity: "medium",
    riskScore: 68,
    status: "new",
    summary:
      "App-store listing borrows Lumen's branding while funneling users into a hidden auto-renew subscription.",
    signals: [
      "Trademarked name used without authorization",
      "Auto-renewing subscription buried in the trial flow",
      "Developer has 11 prior app review rejections",
      "Permission set exceeds stated functionality",
    ],
    minutesAgo: 900,
  },
  {
    handle: "@solacecare_support",
    displayName: "Solace Care Support",
    platform: "telegram",
    brandName: "Solace Health",
    threatType: "scam_account",
    severity: "critical",
    riskScore: 90,
    status: "new",
    summary:
      "Runs a fake patient-support channel that steers victims into paid 'consultations' paid in crypto.",
    signals: [
      "Member invites sourced from a leaked contact list",
      "Upfront payment demanded in cryptocurrency",
      "Impersonates named physicians on staff",
      "No official link between the channel and the clinic",
    ],
    followers: 2400,
    minutesAgo: 1250,
  },
  {
    handle: "@voyager.airways.rescue",
    displayName: "Voyager Air Rescue",
    platform: "instagram",
    brandName: "Voyager Air",
    threatType: "scam_account",
    severity: "critical",
    riskScore: 89,
    status: "investigating",
    summary:
      "Targets stranded passengers with same-day rebooking fees sent to a fresh merchant account.",
    signals: [
      "Harvests booking references through DM",
      "Payment links point to a newly created merchant account",
      "Word-for-word copies the official rebooking policy",
      "Matched to 31 reported incidents",
    ],
    followers: 15700,
    minutesAgo: 1500,
  },
  {
    handle: "@peakline.outdoor.sale",
    displayName: "Peakline Outdoors Sale",
    platform: "tiktok",
    brandName: "Peakline Outdoors",
    threatType: "fake_profile",
    severity: "high",
    riskScore: 79,
    status: "new",
    summary:
      "Sells counterfeit Peakline gear at 'warehouse clearance' prices through off-platform checkout only.",
    signals: [
      "Product photos match known first-generation replicas",
      "Checkout happens entirely off-platform",
      "Brand name claimed in the bio",
      "Counterfeit reports match the listed images",
    ],
    followers: 44000,
    minutesAgo: 1900,
  },
  {
    handle: "@lumenbeauty.sale",
    displayName: "Lumen Beauty Flash Sale",
    platform: "x",
    brandName: "Lumen Cosmetics",
    threatType: "scam_account",
    severity: "high",
    riskScore: 76,
    status: "resolved",
    summary:
      "Phishing domain disguised as a limited-time cosmetics sale, harvesting card details at checkout.",
    signals: [
      "Domain lumen-beauty-sale[.]com registered 9 days ago",
      "Requests card details off-platform",
      "Impersonates the official campaign hashtag",
      "Account removed after the takedown report",
    ],
    followers: 5300,
    minutesAgo: 2600,
  },
  {
    handle: "@northline.private.client",
    displayName: "Northline Private Clients",
    platform: "instagram",
    brandName: "Northline Bank",
    threatType: "impersonation",
    severity: "medium",
    riskScore: 64,
    status: "new",
    summary:
      "Mimics the private-banking desk to harvest high-net-worth enquiries and account statements.",
    signals: [
      "Handle differs from the official account by one character",
      "Requests account statements via DM",
      "Follower-to-following ratio is heavily inverted",
      "Bio claims 'by invitation only'",
    ],
    followers: 2150,
    minutesAgo: 3400,
  },
  {
    handle: "app.solacecare.pro",
    displayName: "Solace Care Pro",
    platform: "googleplay",
    brandName: "Solace Health",
    threatType: "suspicious_app",
    severity: "high",
    riskScore: 73,
    status: "investigating",
    summary:
      "Clone telehealth app that exfiltrates intake forms to an unregistered analytics endpoint.",
    signals: [
      "Requests CAMERA and LOCATION at install",
      "No privacy policy linked in the listing",
      "Bundle ID typosquats the official package",
      "Signed with an unverified certificate",
    ],
    minutesAgo: 4300,
  },
  {
    handle: "@solace.health.daily",
    displayName: "Solace Health Daily",
    platform: "youtube",
    brandName: "Solace Health",
    threatType: "fake_profile",
    severity: "low",
    riskScore: 42,
    status: "dismissed",
    summary:
      "Fan-run health tips channel that uses the brand's name without monetization or staff claims.",
    signals: [
      "No contact details or payment requests",
      "Content does not impersonate clinic staff",
      "Attribution disclaimer present in the bio",
      "No reported harm",
    ],
    followers: 9800,
    minutesAgo: 5600,
  },
  {
    handle: "@peakline.gear.outlet",
    displayName: "Peakline Gear Outlet",
    platform: "instagram",
    brandName: "Peakline Outdoors",
    threatType: "fake_profile",
    severity: "medium",
    riskScore: 61,
    status: "new",
    summary:
      "Unofficial storefront trading on the brand name with checkout hosted on a third-party form.",
    signals: [
      "Not listed in the official retailer program",
      "Checkout hosted on a third-party form",
      "Return policy conflicts with brand policy",
      "Repeated complaints about non-delivery",
    ],
    followers: 7400,
    minutesAgo: 7200,
  },
  {
    handle: "@voyager-air-careers",
    displayName: "Voyager Air Careers",
    platform: "facebook",
    brandName: "Voyager Air",
    threatType: "impersonation",
    severity: "medium",
    riskScore: 58,
    status: "dismissed",
    summary:
      "Recruiter page collecting résumés; confirmed with the agency as an authorized hiring partner.",
    signals: [
      "Verified against the agency vendor list",
      "No payment requested from applicants",
      "Contact domain matches the partner agency",
      "Dismissed after client confirmation",
    ],
    followers: 3900,
    minutesAgo: 8800,
  },
  {
    handle: "@northline.bank.alerts",
    displayName: "Northline Alerts",
    platform: "x",
    brandName: "Northline Bank",
    threatType: "impersonation",
    severity: "high",
    riskScore: 77,
    status: "investigating",
    summary:
      "Posts fake 'account freeze' alerts that drive users to a phishing landing page via redirectors.",
    signals: [
      "Urgency language matching known campaign tactics",
      "Links shortened through 3 redirectors",
      "Claims official status without a verification badge",
      "412 reposts on the pinned alert",
    ],
    followers: 22100,
    minutesAgo: 10500,
  },
];

/**
 * Seeds the demo watchlist the first time a signed-in user opens the app.
 * Idempotent: safe to call on every page load.
 */
export const ensureSeed = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    const existing = await ctx.db.query("flaggedAccounts").take(1);
    if (existing.length > 0) {
      return { seeded: 0 };
    }

    const now = Date.now();
    for (const entry of SEED_ENTRIES) {
      const { minutesAgo, ...fields } = entry;
      await ctx.db.insert("flaggedAccounts", {
        ...fields,
        detectedAt: now - minutesAgo * 60_000,
      });
    }
    return { seeded: SEED_ENTRIES.length };
  },
});

/**
 * Evidence-based account assessment for the Brand Sentinel demo.
 * This evaluates reviewer-supplied evidence; it does not fetch
 * or independently verify real social-media accounts.
 */
export const analyzeTestAccount = mutation({
  args: {
    handle: v.string(),
    displayName: v.string(),
    platform: v.union(
      v.literal("instagram"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("telegram"),
      v.literal("googleplay"),
      v.literal("appstore"),
    ),
    brandName: v.string(),
    evidence: v.array(v.string()),
  },

  handler: async (ctx, args) => {
    await requireUser(ctx);

    const handle = args.handle.trim();
    const displayName = args.displayName.trim();
    const brandName = args.brandName.trim();
    const evidence = args.evidence
      .map((item) => item.trim())
      .filter(Boolean);

    if (!handle || !displayName || !brandName) {
      throw new Error(
        "Handle, display name, and brand name are required.",
      );
    }

    if (evidence.length === 0) {
      throw new Error(
        "Provide at least one piece of evidence to assess.",
      );
    }

    const rules = [
      {
        label: "Requests passwords, OTPs, or banking credentials",
        pattern: /\b(password|otp|banking credentials|login credentials)\b/i,
        points: 35,
      },
      {
        label: "Uses a suspicious payment request",
        pattern: /\b(upfront fee|gift card payment|crypto payment|pay in cryptocurrency)\b/i,
        points: 25,
      },
      {
        label: "Uses a suspicious or unverified link",
        pattern: /\b(phishing link|fake login page|credential-harvest|unverified link)\b/i,
        points: 25,
      },
      {
        label: "Impersonates a brand or official account",
        pattern: /\b(copied branding|impersonat\w*|cloned identity|pretends to be official)\b/i,
        points: 20,
      },
      {
        label: "Has repeated reports of suspicious activity",
        pattern: /\b(repeated reports|multiple scam reports|reported by victims)\b/i,
        points: 15,
      },
    ];

    const matchedRules = rules.filter((rule) =>
      evidence.some((item) => rule.pattern.test(item)),
    );

    const riskScore = Math.min(
      100,
      matchedRules.reduce((total, rule) => total + rule.points, 0),
    );

    const signals = matchedRules.map((rule) => rule.label);

    const severity =
      riskScore >= 80
        ? "critical"
        : riskScore >= 60
          ? "high"
          : riskScore >= 30
            ? "medium"
            : "low";

    const threatType =
      matchedRules.some((rule) =>
        /password|phishing|suspicious link/i.test(rule.label),
      )
        ? "scam_account"
        : matchedRules.some((rule) =>
              /impersonates/i.test(rule.label),
            )
          ? "impersonation"
          : "fake_profile";

    const id = await ctx.db.insert("flaggedAccounts", {
      handle,
      displayName,
      platform: args.platform,
      brandName,
      threatType,
      severity,
      riskScore,
      status: "new",
      summary:
        matchedRules.length > 0
          ? `Rule-based assessment matched ${matchedRules.length} warning rule(s). This is not independent verification of the account.`
          : "No configured warning rules matched. This does not establish that the account is legitimate.",
      signals:
        signals.length > 0
          ? signals
          : ["No configured warning rules matched; further review is needed."],
      detectedAt: Date.now(),
    });

    return {
      id,
      riskScore,
      severity,
      threatType,
      signals,
      assessmentType: "rule-based; reviewer-supplied evidence",
    };
  },
});
