import { formatDistanceToNow } from "date-fns";

/** Platforms the monitoring sweep watches. */
export type Platform =
  | "instagram"
  | "x"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "telegram"
  | "linkedin"
  | "googleplay"
  | "appstore";

/** What kind of threat a flag represents. */
export type ThreatType =
  | "fake_profile"
  | "impersonation"
  | "scam_account"
  | "suspicious_app";

export type Severity = "critical" | "high" | "medium" | "low";

export type Status = "new" | "investigating" | "resolved" | "dismissed";

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  x: "X (Twitter)",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  googleplay: "Google Play Store",
  appstore: "Apple App Store",
};

export const THREAT_LABELS: Record<ThreatType, string> = {
  fake_profile: "Fake profile",
  impersonation: "Impersonation",
  scam_account: "Scam account",
  suspicious_app: "Suspicious app",
};

export const THREAT_TYPES: ThreatType[] = [
  "fake_profile",
  "impersonation",
  "scam_account",
  "suspicious_app",
];

export const THREAT_HINTS: Record<ThreatType, string> = {
  fake_profile:
    "Accounts posing as your brand or its people to farm followers or sell counterfeit goods.",
  impersonation:
    "Profiles copying names, bios and avatars to harvest credentials or payments.",
  scam_account:
    "Accounts running refunds, giveaways or support fraud under the brand's name.",
  suspicious_app:
    "Store listings borrowing the brand's identity to harvest data or money.",
};

type Meta<T extends string> = Record<T, { label: string; className: string }>;

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

/** Chip classes per severity — colors come from the theme tokens. */
export const SEVERITY_META: Meta<Severity> = {
  critical: {
    label: "Critical",
    className:
      "border border-[var(--sev-critical-line)] bg-[var(--sev-critical-soft)] text-[var(--sev-critical)]",
  },
  high: {
    label: "High",
    className:
      "border border-[var(--sev-high-line)] bg-[var(--sev-high-soft)] text-[var(--sev-high)]",
  },
  medium: {
    label: "Medium",
    className:
      "border border-[var(--sev-medium-line)] bg-[var(--sev-medium-soft)] text-[var(--sev-medium)]",
  },
  low: {
    label: "Low",
    className:
      "border border-[var(--sev-low-line)] bg-[var(--sev-low-soft)] text-[var(--sev-low)]",
  },
};

/** Dot classes per severity, for compact table cells. */
export const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-[var(--sev-critical)]",
  high: "bg-[var(--sev-high)]",
  medium: "bg-[var(--sev-medium)]",
  low: "bg-[var(--sev-low)]",
};

export const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  investigating: "Investigating",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const STATUSES: Status[] = [
  "new",
  "investigating",
  "resolved",
  "dismissed",
];

/** Chip classes per review status. */
export const STATUS_META: Meta<Status> = {
  new: {
    label: "New",
    className:
      "border border-[var(--status-new-line)] bg-[var(--status-new-soft)] text-[var(--status-new)]",
  },
  investigating: {
    label: "Investigating",
    className:
      "border border-[var(--status-investigating-line)] bg-[var(--status-investigating-soft)] text-[var(--status-investigating)]",
  },
  resolved: {
    label: "Resolved",
    className:
      "border border-[var(--status-resolved-line)] bg-[var(--status-resolved-soft)] text-[var(--status-resolved)]",
  },
  dismissed: {
    label: "Dismissed",
    className:
      "border border-[var(--status-dismissed-line)] bg-[var(--status-dismissed-soft)] text-[var(--status-dismissed)]",
  },
};

/** True when the flag still needs the agency's attention. */
export function isOpen(status: Status): boolean {
  return status === "new" || status === "investigating";
}

/** Severity bucket for a risk score (used by previews and legends). */
export function severityForScore(score: number): Severity {
  if (score >= 85) return "critical";
  if (score >= 72) return "high";
  if (score >= 55) return "medium";
  return "low";
}

/** "3 hours ago" style relative timestamps. */
export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(timestamp, { addSuffix: true });
}

/** Compact audience counts: 1.0K, 12K, 1.2M. */
export function formatFollowers(followers: number | undefined): string {
  if (followers === undefined) return "—";
  if (followers >= 1_000_000) return `${(followers / 1_000_000).toFixed(1)}M`;
  if (followers >= 10_000) return `${Math.round(followers / 1_000)}K`;
  if (followers >= 1_000) return `${(followers / 1_000).toFixed(1)}K`;
  return String(followers);
}

/** Initials for the account tile (max two letters). */
export function initials(name: string): string {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
