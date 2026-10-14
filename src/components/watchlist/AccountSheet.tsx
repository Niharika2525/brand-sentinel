import {
  AccountTile,
  SeverityChip,
  StatusChip,
} from "@/components/watchlist/chips";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  formatFollowers,
  formatRelativeTime,
  PLATFORM_LABELS,
  STATUSES,
  STATUS_LABELS,
  THREAT_LABELS,
  type Status,
} from "@/lib/watchlist";
import { format } from "date-fns";
import { useState } from "react";
import { FileText, ShieldAlert } from "lucide-react";

type FlaggedAccount = Doc<"flaggedAccounts">;

function MetaItem({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AccountSheet({
  entry,
  onClose,
  onStatusChange,
  onGenerateTakedown,
}: {
  entry: FlaggedAccount | null;
  onClose: () => void;
  onStatusChange: (entry: FlaggedAccount, status: Status) => void;
  onGenerateTakedown?: (entry: FlaggedAccount) => void;
}) {
  // Keep the last opened entry so the sheet doesn't blank out mid-close.
  const [lastOpen, setLastOpen] = useState<FlaggedAccount | null>(entry);
  const shown = entry ?? lastOpen;

  return (
    <Sheet
      open={entry !== null}
      onOpenChange={(open) => {
        if (!open) {
          setLastOpen(entry);
          onClose();
        }
      }}
    >
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        {shown && (
          <>
            <SheetHeader className="gap-3 border-b border-border pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityChip severity={shown.severity} />
                <StatusChip status={shown.status} />
              </div>
              <SheetTitle className="text-lg tracking-tight">
                {shown.displayName}
              </SheetTitle>
              <SheetDescription className="break-words">
                {shown.handle} · {PLATFORM_LABELS[shown.platform]} ·{" "}
                {shown.brandName}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-8">
              {/* Risk score */}
              <section>
                <div className="flex items-end justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight tabular-nums">
                      {shown.riskScore}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / 100 risk score
                    </span>
                  </div>
                  <AccountTile name={shown.displayName} />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${shown.riskScore}%`,
                      backgroundColor: `var(--sev-${shown.severity})`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  AI confidence {shown.riskScore}% · classified as{" "}
                  {THREAT_LABELS[shown.threatType].toLowerCase()} against{" "}
                  {shown.brandName}
                </p>
              </section>

              {/* Takedown Action Quick Card */}
              {onGenerateTakedown && (
                <section className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="size-4 text-red-600 shrink-0" />
                      <span className="text-xs font-semibold text-red-950 dark:text-red-300">
                        Immediate Enforcement
                      </span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Generate an official Cease & Desist package ready for legal counsel or abuse dispatch.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3 w-full gap-2 bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                    onClick={() => {
                      onGenerateTakedown(shown);
                      onClose();
                    }}
                  >
                    <FileText className="size-3.5" />
                    Generate Legal Takedown Notice
                  </Button>
                </section>
              )}

              {/* Review workflow */}
              <section>
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Review status
                </h3>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {STATUSES.map((status) => {
                    const isCurrent = status === shown.status;
                    return (
                      <Button
                        key={status}
                        type="button"
                        size="sm"
                        variant={isCurrent ? "default" : "outline"}
                        disabled={isCurrent}
                        className={cn("justify-center", !isCurrent && "cursor-pointer")}
                        onClick={() => onStatusChange(shown, status)}
                      >
                        {STATUS_LABELS[status]}
                      </Button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {shown.status === "new"
                    ? "Not yet reviewed by your team."
                    : shown.status === "investigating"
                      ? "Someone on the team is actively reviewing this flag."
                      : shown.status === "resolved"
                        ? "Action taken — the account or app was dealt with."
                        : "Reviewed and dismissed as a non-threat."}
                </p>
              </section>

              {/* Publisher Mismatch Warning (Criteria 3 - 30% Weight) */}
              {shown.publisherMismatch && (
                <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="size-4 shrink-0" />
                    <span>App Store Publisher Mismatch Alert (30% Evaluation Weight)</span>
                  </div>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Official Brand Publisher:</strong>{" "}
                      {shown.officialPublisher || "Verified Client Organization"}
                    </p>
                    <p>
                      <strong className="text-foreground">Rogue Store Publisher:</strong>{" "}
                      <span className="font-mono text-red-500">{shown.publisherName}</span>
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300/80 pt-1">
                      ⚠️ App listing mimics brand name & assets but originates from an unauthorized publisher entity.
                    </p>
                  </div>
                </section>
              )}

              {/* Homoglyph / Typosquatting Analysis (Criteria 2 - Bonus Weight) */}
              {shown.homoglyphSubstitution && (
                <section className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-3.5 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-purple-600 dark:text-purple-400">
                    <ShieldAlert className="size-4 shrink-0" />
                    <span>Typosquatting & Homoglyph Substitution (Bonus Criteria)</span>
                  </div>
                  <p className="mt-1.5 text-muted-foreground">
                    <strong className="text-foreground">Analysis:</strong> {shown.homoglyphSubstitution}
                  </p>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300/80 pt-1">
                    🔍 Character-level homoglyph attacks are designed to fool human visual verification and evade simple string filters.
                  </p>
                </section>
              )}

              {/* AI summary */}
              <section>
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  AI Forensic Summary
                </h3>
                <p className="mt-2.5 rounded-lg border-l-2 border-[var(--signal-line)] bg-muted/60 px-4 py-3.5 text-sm leading-6">
                  {shown.summary}
                </p>
              </section>

              {/* Evidence signals */}
              <section>
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Detected signals & evidence{" "}
                  <span className="font-normal normal-case">
                    ({shown.signals.length})
                  </span>
                </h3>
                <ul className="mt-2.5 overflow-hidden rounded-lg border border-border">
                  {shown.signals.map((signal, index) => (
                    <li
                      key={signal}
                      className={cn(
                        "flex gap-3 px-4 py-3 text-sm",
                        index > 0 && "border-t border-border/70",
                        index % 2 === 1 && "bg-muted/40",
                      )}
                    >
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--signal-soft)] text-[10px] font-semibold text-[var(--signal-text)]">
                        {index + 1}
                      </span>
                      <span className="leading-6 text-muted-foreground">
                        {signal}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Details */}
              <section className="grid grid-cols-2 gap-x-4 gap-y-4">
                <MetaItem label="Client brand" value={shown.brandName} />
                <MetaItem
                  label="Platform"
                  value={PLATFORM_LABELS[shown.platform]}
                />
                <MetaItem
                  label="Threat class"
                  value={THREAT_LABELS[shown.threatType]}
                />
                <MetaItem
                  label="Audience"
                  value={formatFollowers(shown.followers)}
                />
                <MetaItem
                  label="First detected"
                  value={formatRelativeTime(shown.detectedAt)}
                  hint={format(shown.detectedAt, "MMM d, yyyy · HH:mm")}
                />
                <MetaItem
                  label="Severity"
                  value={shown.severity.charAt(0).toUpperCase() + shown.severity.slice(1)}
                />
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
