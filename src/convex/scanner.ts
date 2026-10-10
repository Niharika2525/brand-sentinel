import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

export type ThreatChannel =
  | "instagram"
  | "twitter"
  | "telegram"
  | "play_store"
  | "app_store";

export type ThreatRiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ThreatStatus = "active" | "reported" | "resolved";

export type GeneratedThreat = {
  channel: ThreatChannel;
  handleOrPackage: string;
  displayName: string;
  riskLevel: ThreatRiskLevel;
  riskScore: number;
  evidence: string[];
  status: ThreatStatus;
};

// Map backend channel to schema platform representation
function channelToPlatform(
  channel: ThreatChannel,
): "instagram" | "x" | "telegram" | "googleplay" | "appstore" {
  switch (channel) {
    case "twitter":
      return "x";
    case "play_store":
      return "googleplay";
    case "app_store":
      return "appstore";
    case "instagram":
      return "instagram";
    case "telegram":
      return "telegram";
    default:
      return "x";
  }
}

// Map risk level to schema severity
function riskLevelToSeverity(
  risk: ThreatRiskLevel,
): "critical" | "high" | "medium" | "low" {
  switch (risk) {
    case "CRITICAL":
      return "critical";
    case "HIGH":
      return "high";
    case "MEDIUM":
      return "medium";
    case "LOW":
      return "low";
  }
}

// Map threat status to schema status
function threatStatusToDbStatus(
  status: ThreatStatus,
): "new" | "investigating" | "resolved" {
  switch (status) {
    case "active":
      return "new";
    case "reported":
      return "investigating";
    case "resolved":
      return "resolved";
  }
}

/**
 * Intelligent generator simulating OSINT & dark-web crawlers
 * Produces realistic, high-fidelity threats for any brand name across selected channels.
 */
export function generateSimulatedThreats(
  brandName: string,
  channels: ThreatChannel[],
): GeneratedThreat[] {
  const cleanBrand = brandName.trim();
  const lowerBrand = cleanBrand.toLowerCase().replace(/[^a-z0-9]/g, "");

  const results: GeneratedThreat[] = [];

  const threatTemplates: Record<
    ThreatChannel,
    Array<{
      handlePattern: (b: string) => string;
      displayNamePattern: (b: string) => string;
      riskLevel: ThreatRiskLevel;
      riskScore: number;
      evidence: (b: string) => string[];
    }>
  > = {
    instagram: [
      {
        handlePattern: (b) => `@${b}_official_care`,
        displayNamePattern: () => `${cleanBrand} Official Support`,
        riskLevel: "CRITICAL",
        riskScore: 95,
        evidence: (b) => [
          `Typosquatting detected: homoglyph substitution on verified '${cleanBrand}' brand mark`,
          `Bio contains malicious credential-harvesting link: https://support-${b}-verify.secure-auth.cc`,
          `Profile picture 96% pixel match to official ${cleanBrand} trademark vector`,
          `Account created 4 days ago with 1,840 automated DM outreach attempts flagged`,
        ],
      },
      {
        handlePattern: (b) => `@${b}.promo.rewards`,
        displayNamePattern: () => `${cleanBrand} Giveaways & Rewards`,
        riskLevel: "HIGH",
        riskScore: 84,
        evidence: () => [
          `Phishing campaign lures users to claim fake VIP vouchers via external telegram bot`,
          `Stolen brand marketing collateral reused across 14 recent scam reels`,
          `High negative sentiment and 38 user complaints submitted in the last 48 hours`,
        ],
      },
    ],
    twitter: [
      {
        handlePattern: (b) => `@${b}_DeskSupport`,
        displayNamePattern: () => `${cleanBrand} Help & Escalations`,
        riskLevel: "CRITICAL",
        riskScore: 92,
        evidence: (b) => [
          `Automated reply bot targeting unhappy ${cleanBrand} customers within 12 seconds of posting`,
          `Redirector chain via bit.ly/help-${b}-live masks malicious APK payload delivery`,
          `Zero affiliation with authorized customer service handle registry`,
          `Account bio falsely asserts 'Official 24/7 Verified Representative'`,
        ],
      },
      {
        handlePattern: (b) => `@real_${b}_refunds`,
        displayNamePattern: () => `${cleanBrand} Instant Refund Desk`,
        riskLevel: "HIGH",
        riskScore: 88,
        evidence: (b) => [
          `Demands immediate OTP and banking credentials under false guise of dispute reversal`,
          `Phishing domain '${b}-support-portal.net' registered 72 hours ago in Seychelles`,
          `Intercepted 50+ payment grievance hashtags matching ${cleanBrand}`,
        ],
      },
    ],
    telegram: [
      {
        handlePattern: (b) => `t.me/${b}_VIP_VIPSupport_Bot`,
        displayNamePattern: () => `${cleanBrand} VIP Executive Desk`,
        riskLevel: "CRITICAL",
        riskScore: 97,
        evidence: () => [
          `Demands cryptocurrency (USDT) deposits for fraudulent VIP privilege activation`,
          `Impersonating senior leadership of ${cleanBrand} with forged digital badges`,
          `Over 3,400 victims channeled into unmoderated scam broadcast rooms`,
          `Leaked customer database references circulating in channel discussion threads`,
        ],
      },
      {
        handlePattern: (b) => `t.me/${b}_InsiderDeals_Leak`,
        displayNamePattern: () => `${cleanBrand} Employee Discount Club`,
        riskLevel: "MEDIUM",
        riskScore: 68,
        evidence: () => [
          `Distributing unauthorized license keys and counterfeit voucher codes`,
          `Requires users to install secondary side-loaded Trojan dropper`,
          `Brand logo watermark infringed without license or legal authorization`,
        ],
      },
    ],
    play_store: [
      {
        handlePattern: (b) => `com.fake.${b}.secure.app`,
        displayNamePattern: () => `${cleanBrand} Secure Quick Pass`,
        riskLevel: "CRITICAL",
        riskScore: 94,
        evidence: () => [
          `Trojanized APK requesting invasive permissions: READ_SMS, QUERY_ALL_PACKAGES, ACCESSIBILITY_SERVICE`,
          `Reverse-engineered and repackaged assets from legitimate ${cleanBrand} Android release`,
          `Untrusted developer signature self-signed 3 days ago`,
          `C2 server communication detected pinging raw IP endpoint in Eastern Europe`,
        ],
      },
      {
        handlePattern: (b) => `org.fast.${b}.payhelp`,
        displayNamePattern: () => `${cleanBrand} Mobile Agent`,
        riskLevel: "HIGH",
        riskScore: 79,
        evidence: () => [
          `Falsely claims to be a certified third-party companion app for ${cleanBrand}`,
          `Buried extortionate recurring weekly subscription ($89.99) with deceptive trial screen`,
          `High uninstall velocity with 120+ malware reports filed`,
        ],
      },
    ],
    app_store: [
      {
        handlePattern: (b) => `id6472891.${b}.authenticator`,
        displayNamePattern: () => `${cleanBrand} Authenticator Pro`,
        riskLevel: "HIGH",
        riskScore: 82,
        evidence: () => [
          `Unauthorized use of registered trademark '${cleanBrand}' in App Store metadata`,
          `Phishes session tokens and two-factor recovery keys during setup onboarding`,
          `Developer entity lacks verified D-U-N-S registration with Apple Developer Program`,
        ],
      },
    ],
  };

  for (const channel of channels) {
    const templates = threatTemplates[channel];
    if (templates) {
      for (const t of templates) {
        results.push({
          channel,
          handleOrPackage: t.handlePattern(lowerBrand),
          displayName: t.displayNamePattern(lowerBrand),
          riskLevel: t.riskLevel,
          riskScore: t.riskScore,
          evidence: t.evidence(lowerBrand),
          status: "active",
        });
      }
    }
  }

  // Ensure fallback items if empty
  if (results.length === 0) {
    results.push({
      channel: "instagram",
      handleOrPackage: `@${lowerBrand}_official_care`,
      displayName: `${cleanBrand} Official Support`,
      riskLevel: "CRITICAL",
      riskScore: 94,
      evidence: [
        `Typosquatting detected: homoglyph substitution on brand mark`,
        `Bio contains malicious credential harvest link`,
        `Profile picture 95% pixel match to official ${cleanBrand} logo`,
      ],
      status: "active",
    });
  }

  return results;
}

/**
 * Save newly scanned threats into the database
 */
export const saveScannedThreats = mutation({
  args: {
    brandName: v.string(),
    threats: v.array(
      v.object({
        channel: v.union(
          v.literal("instagram"),
          v.literal("twitter"),
          v.literal("telegram"),
          v.literal("play_store"),
          v.literal("app_store"),
        ),
        handleOrPackage: v.string(),
        displayName: v.string(),
        riskLevel: v.union(
          v.literal("CRITICAL"),
          v.literal("HIGH"),
          v.literal("MEDIUM"),
          v.literal("LOW"),
        ),
        riskScore: v.number(),
        evidence: v.array(v.string()),
        status: v.union(
          v.literal("active"),
          v.literal("reported"),
          v.literal("resolved"),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const insertedIds: string[] = [];
    const now = Date.now();

    for (let i = 0; i < args.threats.length; i++) {
      const threat = args.threats[i];
      const platform = channelToPlatform(threat.channel);
      const severity = riskLevelToSeverity(threat.riskLevel);
      const dbStatus = threatStatusToDbStatus(threat.status);

      const threatType =
        platform === "googleplay" || platform === "appstore"
          ? "suspicious_app"
          : threat.evidence.some((e) => /credential|phishing|login|otp/i.test(e))
            ? "scam_account"
            : threat.evidence.some((e) => /homoglyph|typosquatting|pixel match|impersonat/i.test(e))
              ? "impersonation"
              : "fake_profile";

      const summary = `AI Deep Threat Discovery flagged this ${threat.channel.toUpperCase()} node with a risk score of ${threat.riskScore}/100. Primary flags: ${threat.evidence[0] || "Suspicious brand activity detected"}.`;

      // Check if handle already exists for this brand to avoid duplication
      const existing = await ctx.db
        .query("flaggedAccounts")
        .withIndex("by_brand", (q) => q.eq("brandName", args.brandName))
        .filter((q) => q.eq(q.field("handle"), threat.handleOrPackage))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          riskScore: threat.riskScore,
          severity,
          signals: threat.evidence,
          summary,
          status: dbStatus,
        });
        insertedIds.push(existing._id);
      } else {
        const id = await ctx.db.insert("flaggedAccounts", {
          handle: threat.handleOrPackage,
          displayName: threat.displayName,
          platform,
          brandName: args.brandName,
          threatType,
          severity,
          riskScore: threat.riskScore,
          status: dbStatus,
          summary,
          signals: threat.evidence,
          followers: threat.channel === "play_store" || threat.channel === "app_store" ? undefined : Math.floor(Math.random() * 25000) + 1200,
          detectedAt: now - i * 60_000,
        });
        insertedIds.push(id);
      }
    }

    return { success: true, count: insertedIds.length, ids: insertedIds };
  },
});

/**
 * AI-Driven Threat Ingestion & Discovery Mutation
 * Directly simulates crawler execution and commits discovered threats.
 */
export const runBrandScanMutation = mutation({
  args: {
    brandName: v.string(),
    channels: v.array(
      v.union(
        v.literal("instagram"),
        v.literal("twitter"),
        v.literal("telegram"),
        v.literal("play_store"),
        v.literal("app_store"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const brand = args.brandName.trim();
    if (!brand) {
      throw new Error("Brand name is required");
    }

    const selectedChannels =
      args.channels.length > 0
        ? (args.channels as ThreatChannel[])
        : (["instagram", "twitter", "telegram", "play_store"] as ThreatChannel[]);

    // Generate high-risk realistic threats based on brand and channels
    const generatedThreats = generateSimulatedThreats(brand, selectedChannels);

    const insertedIds: string[] = [];
    const now = Date.now();

    for (let i = 0; i < generatedThreats.length; i++) {
      const threat = generatedThreats[i];
      const platform = channelToPlatform(threat.channel);
      const severity = riskLevelToSeverity(threat.riskLevel);
      const dbStatus = threatStatusToDbStatus(threat.status);

      const threatType =
        platform === "googleplay" || platform === "appstore"
          ? "suspicious_app"
          : threat.evidence.some((e) => /credential|phishing|login|otp/i.test(e))
            ? "scam_account"
            : threat.evidence.some((e) => /homoglyph|typosquatting|pixel match|impersonat/i.test(e))
              ? "impersonation"
              : "fake_profile";

      const summary = `AI Deep Threat Discovery flagged this ${threat.channel.toUpperCase()} node with a risk score of ${threat.riskScore}/100. Primary flags: ${threat.evidence[0] || "Suspicious brand activity detected"}.`;

      const existing = await ctx.db
        .query("flaggedAccounts")
        .withIndex("by_brand", (q) => q.eq("brandName", brand))
        .filter((q) => q.eq(q.field("handle"), threat.handleOrPackage))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          riskScore: threat.riskScore,
          severity,
          signals: threat.evidence,
          summary,
          status: dbStatus,
        });
        insertedIds.push(existing._id);
      } else {
        const id = await ctx.db.insert("flaggedAccounts", {
          handle: threat.handleOrPackage,
          displayName: threat.displayName,
          platform,
          brandName: brand,
          threatType,
          severity,
          riskScore: threat.riskScore,
          status: dbStatus,
          summary,
          signals: threat.evidence,
          followers: threat.channel === "play_store" || threat.channel === "app_store" ? undefined : Math.floor(Math.random() * 25000) + 1200,
          detectedAt: now - i * 60_000,
        });
        insertedIds.push(id);
      }
    }

    return {
      brandName: brand,
      scannedAt: now,
      threats: generatedThreats,
      savedCount: insertedIds.length,
    };
  },
});

/**
 * Quick status update helper specifically for threat UI ("active" | "reported" | "resolved")
 */
export const updateThreatStatus = mutation({
  args: {
    id: v.id("flaggedAccounts"),
    status: v.union(
      v.literal("active"),
      v.literal("reported"),
      v.literal("resolved"),
      v.literal("new"),
      v.literal("investigating"),
      v.literal("dismissed"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const threat = await ctx.db.get(args.id);
    if (!threat) {
      throw new Error("Threat not found");
    }

    let mappedStatus: "new" | "investigating" | "resolved" | "dismissed";
    if (args.status === "active") mappedStatus = "new";
    else if (args.status === "reported") mappedStatus = "investigating";
    else if (args.status === "resolved") mappedStatus = "resolved";
    else mappedStatus = args.status;

    await ctx.db.patch(args.id, { status: mappedStatus });
    return { success: true, updatedStatus: mappedStatus };
  },
});

/**
 * Legal Takedown Notice Generator
 * Generates ready-to-copy formal DMCA & Trademark Infringement notice
 */
export const generateTakedownNotice = query({
  args: {
    threatId: v.id("flaggedAccounts"),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.threatId);
    if (!account) {
      throw new Error("Threat not found");
    }

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const hostEntity =
      account.platform === "instagram"
        ? "Meta Platforms Inc. Legal & IP Escalations (ip@meta.com)"
        : account.platform === "x"
          ? "X Corp. Trust & Safety Legal Operations (copyright@x.com)"
          : account.platform === "telegram"
            ? "Telegram FZ-LLC Trust & Safety Team (stopCA@telegram.org / abuse@telegram.org)"
            : account.platform === "googleplay"
              ? "Google LLC Android Market Compliance & Legal Support (dmca-support@google.com)"
              : "Apple Inc. App Store Legal & Trademark Enforcement (appmarketlegal@apple.com)";

    const legalJurisdiction =
      "Digital Millennium Copyright Act (17 U.S.C. § 512), the Lanham Act (15 U.S.C. § 1051 et seq.), and International Anti-Cybersquatting Directives";

    const noticeText = `================================================================================
FORMAL NOTICE OF TRADEMARK INFRINGEMENT & DMCA CEASE AND DESIST
Generated via Brand Sentinel Digital Risk Protection Platform
Date: ${dateStr}
Reference: BS-CASE-${account._id.slice(-8).toUpperCase()}
================================================================================

TO:
${hostEntity}

FROM:
Brand Sentinel Cyber Risk Counsel
On behalf of: ${account.brandName} Global Brand Protection Unit

SUBJECT:
URGENT: Expedited Takedown Request for Intellectual Property Infringement & Fraudulent Impersonation
Target: ${account.displayName} (${account.handle})

LEGAL BASIS:
This notice constitutes formal notification under the ${legalJurisdiction}, regarding unauthorized commercial trademark misuse, consumer deception, and active security threats targeting the protected intellectual property of "${account.brandName}".

INFRINGING TARGET DETAILS:
- Platform / Channel: ${account.platform.toUpperCase()}
- Impersonating Handle / Identifier: ${account.handle}
- Display Name: ${account.displayName}
- Threat Classification: ${account.threatType.toUpperCase()}
- AI Risk Index: ${account.riskScore}/100 (${account.severity.toUpperCase()} RISK)
- First Discovered By Sentinel Crawlers: ${new Date(account.detectedAt).toUTCString()}

EVIDENCE & FORENSIC LOGS:
${account.signals.map((sig, i) => `  ${i + 1}. [FORENSIC MATCH] ${sig}`).join("\n")}

STATEMENT OF INFRINGEMENT:
The entity operating under the identifier "${account.handle}" is deliberately and deceitfully impersonating "${account.brandName}" without license, permission, or lawful authorization. The profile/package exhibits active behavioral markers consistent with credential harvesting, typosquatting vectors, consumer fraud, and irreparable brand dilution.

DEMANDED ACTION:
We formally demand that you immediately:
1. Suspend, terminate, and remove access to the infringing account / application (${account.handle}).
2. Preserve all server logs, IP connection records, and transaction histories associated with this target for future civil and criminal litigation.
3. Confirm in writing to takedown@brandsentinel.ai within twenty-four (24) hours once remediation is complete.

STATEMENT OF TRUTH:
I have a good faith belief that the disputed use of the trademarked and copyrighted materials described above is not authorized by the copyright/trademark owner, its agent, or the law. The information in this notification is accurate under penalty of perjury.

Respectfully submitted,

Authorized Brand Sentinel Legal Response Unit
Brand Protection Division · Brand Sentinel Inc.
Contact: enforcement@brandsentinel.ai | legal-desk@brandsentinel.ai
Case Ref: BS-${account._id.slice(-8).toUpperCase()}-${Date.now().toString().slice(-6)}
================================================================================`;

    return {
      threat: account,
      targetPlatform: account.platform,
      hostEntity,
      noticeText,
    };
  },
});
