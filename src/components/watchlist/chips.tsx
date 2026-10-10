import { cn } from "@/lib/utils";
import {
  formatFollowers,
  initials,
  SEVERITY_DOT,
  SEVERITY_LABELS,
  SEVERITY_META,
  STATUS_META,
  THREAT_LABELS,
  type Severity,
  type Status,
  type ThreatType,
} from "@/lib/watchlist";

/** Severity pill with a colored dot — critical/high/medium/low. */
export function SeverityChip({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase",
        SEVERITY_META[severity].className,
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", SEVERITY_DOT[severity])}
        aria-hidden
      />
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

/** Review-status pill: New / Investigating / Resolved / Dismissed. */
export function StatusChip({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        STATUS_META[status].className,
        className,
      )}
    >
      {STATUS_META[status].label}
    </span>
  );
}

/** Neutral pill for the threat class of a flag. */
export function ThreatChip({ threat }: { threat: ThreatType }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-foreground">
      {THREAT_LABELS[threat]}
    </span>
  );
}

/** Compact risk score with a severity-colored meter. */
export function RiskMeter({
  score,
  severity,
}: {
  score: number;
  severity: Severity;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-right text-sm font-semibold tabular-nums">
        {score}
      </span>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted sm:w-16">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${score}%`,
            backgroundColor: `var(--sev-${severity})`,
          }}
        />
      </span>
    </div>
  );
}

/** Initials tile standing in for an avatar. */
export function AccountTile({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground"
    >
      {initials(name)}
    </span>
  );
}

/** Audience size (social entries) or an em dash for app listings. */
export function Reach({ followers }: { followers: number | undefined }) {
  return (
    <span className="text-sm tabular-nums text-muted-foreground">
      {formatFollowers(followers)}
    </span>
  );
}
