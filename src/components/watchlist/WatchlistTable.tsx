import {
  AccountTile,
  Reach,
  RiskMeter,
  SeverityChip,
  StatusChip,
  ThreatChip,
} from "@/components/watchlist/chips";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  formatRelativeTime,
  PLATFORM_LABELS,
  STATUSES,
  STATUS_LABELS,
  THREAT_LABELS,
  type Status,
} from "@/lib/watchlist";
import { MoreHorizontal, ShieldAlert, CheckCircle, FileText } from "lucide-react";

type FlaggedAccount = Doc<"flaggedAccounts">;

export function WatchlistTable({
  entries,
  onSelect,
  onStatusChange,
  onGenerateTakedown,
}: {
  entries: FlaggedAccount[];
  onSelect: (entry: FlaggedAccount) => void;
  onStatusChange: (entry: FlaggedAccount, status: Status) => void;
  onGenerateTakedown?: (entry: FlaggedAccount) => void;
}) {
  const statusActions = (entry: FlaggedAccount) =>
    STATUSES.map((status) => (
      <DropdownMenuItem
        key={status}
        disabled={status === entry.status}
        onSelect={() => {
          if (status !== entry.status) onStatusChange(entry, status);
        }}
        className="cursor-pointer"
      >
        {status === entry.status
          ? `Current: ${STATUS_LABELS[status]}`
          : `Mark as ${STATUS_LABELS[status]}`}
      </DropdownMenuItem>
    ));

  return (
    <>
      {/* -------------------------------------------------------------- */}
      {/* Desktop: data table                                             */}
      {/* -------------------------------------------------------------- */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[260px] pl-5">Account / Threat</TableHead>
                <TableHead className="hidden lg:table-cell">Client</TableHead>
                <TableHead>Channel Threat</TableHead>
                <TableHead className="w-[120px]">Risk Score</TableHead>
                <TableHead className="min-w-[220px] hidden xl:table-cell">Top Evidence Signal</TableHead>
                <TableHead className="hidden lg:table-cell">Detected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[170px] pr-4 text-right">
                  Action Center
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry._id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => onSelect(entry)}
                >
                  <TableCell className="pl-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <AccountTile name={entry.displayName} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {entry.displayName}
                          </p>
                          {entry.publisherMismatch && (
                            <span className="shrink-0 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              Publisher Mismatch
                            </span>
                          )}
                          {entry.homoglyphSubstitution && (
                            <span className="shrink-0 rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                              Homoglyph
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs font-mono text-muted-foreground">
                          {entry.handle}
                          <span className="hidden lg:inline font-sans">
                            {" · "}
                            {PLATFORM_LABELS[entry.platform]}
                          </span>
                        </p>
                        {entry.publisherName && (
                          <p className="truncate text-[10px] text-amber-600/90 dark:text-amber-400/90">
                            Rogue Dev: {entry.publisherName} (Official: {entry.officialPublisher || "Verified Brand Entity"})
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-sm font-medium text-foreground lg:table-cell">
                    {entry.brandName}
                  </TableCell>
                  <TableCell>
                    <ThreatChip threat={entry.threatType} />
                  </TableCell>
                  <TableCell>
                    <RiskMeter
                      score={entry.riskScore}
                      severity={entry.severity}
                    />
                  </TableCell>
                  <TableCell className="hidden xl:table-cell max-w-[240px]">
                    <p className="truncate text-xs text-muted-foreground" title={entry.signals[0] || entry.summary}>
                      {entry.signals[0] || entry.summary}
                    </p>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground lg:table-cell">
                    {formatRelativeTime(entry.detectedAt)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={entry.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {onGenerateTakedown && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 px-2.5 text-xs font-medium text-red-600 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40"
                          onClick={() => onGenerateTakedown(entry)}
                          title="Generate DMCA / Trademark Takedown Notice"
                        >
                          <FileText className="size-3.5" />
                          <span>Takedown</span>
                        </Button>
                      )}

                      {entry.status === "new" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          onClick={() => onStatusChange(entry, "investigating")}
                        >
                          Mark Reported
                        </Button>
                      ) : entry.status === "investigating" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          onClick={() => onStatusChange(entry, "resolved")}
                        >
                          Resolve
                        </Button>
                      ) : null}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${entry.displayName}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Status workflow
                          </DropdownMenuLabel>
                          {statusActions(entry)}
                          <DropdownMenuSeparator />
                          {onGenerateTakedown && (
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600"
                              onSelect={() => onGenerateTakedown(entry)}
                            >
                              Generate Takedown Notice
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => onSelect(entry)}
                          >
                            Inspect Forensic Evidence
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Mobile: stacked cards                                           */}
      {/* -------------------------------------------------------------- */}
      <div className="space-y-3 md:hidden">
        {entries.map((entry) => (
          <div
            key={entry._id}
            className="surface-card w-full p-4 transition-colors hover:border-[var(--signal-line)]"
          >
            <div className="flex items-start justify-between gap-3">
              <SeverityChip severity={entry.severity} />
              <StatusChip status={entry.status} />
            </div>

            <div
              className="mt-3 flex items-center gap-3 cursor-pointer"
              onClick={() => onSelect(entry)}
            >
              <AccountTile name={entry.displayName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    {entry.displayName}
                  </p>
                  {entry.publisherMismatch && (
                    <span className="shrink-0 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                      Publisher Mismatch
                    </span>
                  )}
                  {entry.homoglyphSubstitution && (
                    <span className="shrink-0 rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-purple-600 dark:text-purple-400">
                      Homoglyph
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-mono text-muted-foreground">
                  {entry.handle} · {PLATFORM_LABELS[entry.platform]}
                </p>
                {entry.publisherName && (
                  <p className="truncate text-[10px] text-amber-600 dark:text-amber-400">
                    Rogue: {entry.publisherName}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2.5 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground line-clamp-2">
              {entry.signals[0] || entry.summary}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
              <p className="truncate text-xs text-muted-foreground">
                {THREAT_LABELS[entry.threatType]} · {entry.brandName}
              </p>
              <p className="shrink-0 text-xs font-bold tabular-nums">
                Risk {entry.riskScore}/100
              </p>
            </div>

            {/* Mobile Actions */}
            <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border/50">
              {onGenerateTakedown && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs text-red-600 border-red-200"
                  onClick={() => onGenerateTakedown(entry)}
                >
                  <FileText className="mr-1 size-3" /> Takedown
                </Button>
              )}
              {entry.status === "new" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onStatusChange(entry, "investigating")}
                >
                  Mark Reported
                </Button>
              ) : entry.status === "investigating" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs text-emerald-600"
                  onClick={() => onStatusChange(entry, "resolved")}
                >
                  Resolve
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
