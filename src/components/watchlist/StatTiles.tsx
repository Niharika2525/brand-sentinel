import type { Doc } from "@/convex/_generated/dataModel";
import { isOpen } from "@/lib/watchlist";
import { cn } from "@/lib/utils";
import { ShieldAlert, DollarSign, Activity, CheckCircle2 } from "lucide-react";

type FlaggedAccount = Doc<"flaggedAccounts">;

function StatTile({
  label,
  value,
  note,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  tone?: "critical" | "investigating" | "signal" | "success";
  icon?: typeof ShieldAlert;
}) {
  const valueClass =
    tone === "critical"
      ? "text-[var(--sev-critical)]"
      : tone === "investigating"
        ? "text-[var(--status-investigating)]"
        : tone === "signal"
          ? "text-[var(--signal-text)]"
          : tone === "success"
            ? "text-emerald-500"
            : "text-foreground";

  const iconBg =
    tone === "critical"
      ? "bg-red-500/10 text-red-500"
      : tone === "investigating"
        ? "bg-amber-500/10 text-amber-500"
        : tone === "signal"
          ? "bg-[var(--signal-soft)] text-[var(--signal-text)]"
          : "bg-emerald-500/10 text-emerald-500";

  return (
    <div className="surface-card p-4 transition-all hover:border-[var(--signal-line)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <div className={cn("flex size-7 items-center justify-center rounded-md", iconBg)}>
            <Icon className="size-4" />
          </div>
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight tabular-nums",
          valueClass,
        )}
      >
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground/80">{note}</p>
    </div>
  );
}

/** Aggregates of the watchlist including Financial Exposure Metrics & Phishing Nodes */
export function StatTiles({ entries }: { entries: FlaggedAccount[] }) {
  const brands = new Set(entries.map((entry) => entry.brandName)).size;
  const newCount = entries.filter((entry) => entry.status === "new").length;
  const criticalOpen = entries.filter(
    (entry) => entry.severity === "critical" && isOpen(entry.status),
  ).length;

  // Active phishing nodes: entries with high/critical risk and open status
  const activePhishingNodes = entries.filter(
    (entry) =>
      isOpen(entry.status) &&
      (entry.severity === "critical" || entry.severity === "high"),
  ).length;

  // Financial Risk Exposure estimation: computed dynamically based on audience reach and risk
  const estimatedTrustLossUSD = entries
    .filter((e) => isOpen(e.status))
    .reduce((acc, curr) => {
      const baseWeight = curr.riskScore >= 90 ? 45000 : curr.riskScore >= 75 ? 22000 : 8500;
      const reachMultiplier = curr.followers ? Math.min(curr.followers / 500, 15) : 2;
      return acc + Math.round(baseWeight * reachMultiplier);
    }, 0);

  const formattedLoss =
    estimatedTrustLossUSD >= 1_000_000
      ? `$${(estimatedTrustLossUSD / 1_000_000).toFixed(2)}M`
      : `$${(estimatedTrustLossUSD / 1_000).toFixed(0)}K`;

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatTile
        label="Active Phishing Nodes"
        value={activePhishingNodes}
        note={`High/Critical vectors active across ${brands} brand${brands === 1 ? "" : "s"}`}
        tone="critical"
        icon={ShieldAlert}
      />
      <StatTile
        label="Estimated Trust Exposure"
        value={formattedLoss}
        note="Calculated brand & customer damage potential"
        tone="signal"
        icon={DollarSign}
      />
      <StatTile
        label="Critical Open Takedowns"
        value={criticalOpen}
        note="Requires expedited DMCA enforcement"
        tone="investigating"
        icon={Activity}
      />
      <StatTile
        label="Total Monitored Threats"
        value={entries.length}
        note={`${newCount} unreviewed · ${entries.filter((e) => e.status === "resolved").length} neutralized`}
        tone="success"
        icon={CheckCircle2}
      />
    </div>
  );
}
