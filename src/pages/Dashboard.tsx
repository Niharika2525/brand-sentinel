import { LogoDropdown } from "@/components/LogoDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSheet } from "@/components/watchlist/AccountSheet";
import { BrandProfileManager } from "@/components/watchlist/BrandProfileManager";
import { BrandScanBanner } from "@/components/watchlist/BrandScanBanner";
import { StatTiles } from "@/components/watchlist/StatTiles";
import { TakedownNoticeModal } from "@/components/watchlist/TakedownNoticeModal";
import { WatchlistTable } from "@/components/watchlist/WatchlistTable";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { ThreatChannel } from "@/convex/scanner";
import { useAuth } from "@/hooks/use-auth";
import {
  isOpen,
  STATUSES,
  STATUS_LABELS,
  THREAT_LABELS,
  THREAT_TYPES,
  type Status,
  type ThreatType,
} from "@/lib/watchlist";
import { useMutation, useQuery } from "convex/react";
import {
  Inbox,
  Loader2,
  LogOut,
  Radar,
  Search,
  Sparkles,
  ShieldAlert,
  Building2,
  ShieldCheck,
  X,
  PlusCircle,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type FlaggedAccount = Doc<"flaggedAccounts">;

const ALL = "all";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const accounts = useQuery(api.flaggedAccounts.list);
  const brandProfiles = useQuery(api.brandProfiles.list);
  const ensureSeed = useMutation(api.flaggedAccounts.ensureSeed);
  const ensureDefaultProfiles = useMutation(
    api.brandProfiles.ensureDefaultProfiles,
  );
  const setStatus = useMutation(api.flaggedAccounts.setStatus);
  const runBrandScanMutation = useMutation(api.scanner.runBrandScanMutation);
  const updateThreatStatus = useMutation(api.scanner.updateThreatStatus);
  const analyzeTestAccount = useMutation(api.flaggedAccounts.analyzeTestAccount);

  // Active view tab state (Threats vs Brand Profiles)
  const [activeTab, setActiveTab] = useState<"threats" | "profiles">("threats");

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);

  // Takedown notice modal state
  const [takedownTarget, setTakedownTarget] = useState<FlaggedAccount | null>(null);

  // Manual test account state
  const [showManualForm, setShowManualForm] = useState(false);
  const [newHandle, setNewHandle] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newPlatform, setNewPlatform] = useState<
    | "instagram"
    | "x"
    | "facebook"
    | "tiktok"
    | "youtube"
    | "telegram"
    | "googleplay"
    | "appstore"
  >("instagram");
  const [newEvidence, setNewEvidence] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Populate the demo watchlist and brand profiles the first time a signed-in user lands here.
  const seedAttempted = useRef(false);
  useEffect(() => {
    if (seedAttempted.current) return;
    seedAttempted.current = true;
    ensureSeed({}).catch((error) => {
      console.error("Watchlist seed failed:", error);
    });
    ensureDefaultProfiles({}).catch((error) => {
      console.error("Brand profile seed failed:", error);
    });
  }, [ensureSeed, ensureDefaultProfiles]);

  /* -------------------------------------------------------------- */
  /* Filters                                                          */
  /* -------------------------------------------------------------- */
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState<string>(ALL);
  const [threat, setThreat] = useState<"all" | ThreatType>(ALL);
  const [status, setStatusFilter] = useState<"all" | Status>(ALL);
  const [selectedId, setSelectedId] = useState<Id<"flaggedAccounts"> | null>(
    null,
  );

  const brands = useMemo(() => {
    if (!accounts) return [];
    return [...new Set(accounts.map((entry) => entry.brandName))].sort();
  }, [accounts]);

  const hasActiveFilters =
    search.trim() !== "" || brand !== ALL || threat !== ALL || status !== ALL;

  const resetFilters = () => {
    setSearch("");
    setBrand(ALL);
    setThreat(ALL);
    setStatusFilter(ALL);
  };

  /** Open flags first, then risk score, then recency. */
  const visible = useMemo(() => {
    if (!accounts) return [];
    const query = search.trim().toLowerCase();
    const filtered = accounts.filter((entry) => {
      if (brand !== ALL && entry.brandName !== brand) return false;
      if (threat !== ALL && entry.threatType !== threat) return false;
      if (status !== ALL && entry.status !== status) return false;
      if (query) {
        const haystack =
          `${entry.displayName} ${entry.handle} ${entry.brandName}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const openDelta = Number(isOpen(b.status)) - Number(isOpen(a.status));
      if (openDelta !== 0) return openDelta;
      if (a.riskScore !== b.riskScore) return b.riskScore - a.riskScore;
      return b.detectedAt - a.detectedAt;
    });
  }, [accounts, search, brand, threat, status]);

  /* -------------------------------------------------------------- */
  /* Actions                                                        */
  /* -------------------------------------------------------------- */
  const selected =
    accounts?.find((entry) => entry._id === selectedId) ?? null;

  const handleStatusChange = async (
    entry: FlaggedAccount,
    nextStatus: Status,
  ) => {
    try {
      await setStatus({ id: entry._id, status: nextStatus });
      toast.success(`${STATUS_LABELS[nextStatus]} — ${entry.displayName}`, {
        description: `${entry.brandName} · watchlist updated.`,
      });
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("Could not update the status", {
        description: "Please try again.",
      });
    }
  };

  // Automated AI Deep Threat Scan
  const handleRunAIBrandScan = async (
    targetBrand: string,
    channels: ThreatChannel[],
  ) => {
    setIsScanning(true);
    try {
      // Allow user to see multi-stage animation steps
      await new Promise((resolve) => setTimeout(resolve, 3800));

      const result = await runBrandScanMutation({
        brandName: targetBrand,
        channels,
      });

      // Filter automatically to scanned brand to highlight immediate results
      setBrand(targetBrand);

      toast.success(`AI Scan Complete: ${targetBrand}`, {
        description: `Discovered ${result.savedCount} threat nodes. Whitelist guard strictly verified & excluded ${result.whitelistedExcluded?.length || 0} legitimate assets.`,
      });
    } catch (error) {
      console.error("AI Brand Scan error:", error);
      toast.error("Scan Failed", {
        description:
          error instanceof Error ? error.message : "Network error during scan.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualAnalyzeSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const evidence = newEvidence
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (
      !newHandle.trim() ||
      !newDisplayName.trim() ||
      !newBrandName.trim() ||
      evidence.length === 0
    ) {
      toast.error("Complete all fields and provide at least one evidence item.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeTestAccount({
        handle: newHandle.trim(),
        displayName: newDisplayName.trim(),
        brandName: newBrandName.trim(),
        platform: newPlatform,
        evidence,
      });

      toast.success("Assessment saved", {
        description: `Risk score: ${result.riskScore}/100. The result is now in your watchlist.`,
      });

      setNewHandle("");
      setNewDisplayName("");
      setNewBrandName("");
      setNewEvidence("");
      setShowManualForm(false);
    } catch (error) {
      console.error("Account assessment failed:", error);
      toast.error("Assessment failed", {
        description:
          error instanceof Error
            ? error.message
            : "Please check the backend and try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  /* -------------------------------------------------------------- */
  /* Render                                                         */
  /* -------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-background">
      {/* App bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <LogoDropdown />
            <span className="hidden h-5 w-px bg-border sm:block" />
            <p className="hidden truncate text-sm font-semibold tracking-tight sm:block">
              Brand Sentinel
            </p>
            <span className="hidden rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground lg:inline-flex">
              Digital Risk Protection Platform
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user?.email && (
              <span className="hidden max-w-[220px] truncate rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground md:inline-block">
                {user.email}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--signal-text)] uppercase">
              Brand Intelligence & Enforcement
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Threat Intelligence & Takedown Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Autonomous AI-powered brand defense against typosquatting, credential harvesters, rogue APKs, and executive impersonation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[var(--signal-line)] bg-[var(--signal-soft)] px-3 py-1 text-xs font-medium text-[var(--signal-text)]">
              <span className="pulse-dot" />
              AI Sentinel Engine Active
            </span>
          </div>
        </div>

        {accounts === undefined ? (
          <div className="flex min-h-[45vh] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "threats" | "profiles")}
            className="mt-6 sm:mt-8 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-3">
              <TabsList className="bg-muted/70 p-1">
                <TabsTrigger
                  value="threats"
                  className="gap-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-background"
                >
                  <Radar className="size-3.5 text-[var(--signal-text)]" />
                  <span>Threat Scanner & Watchlist</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                    {accounts.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="profiles"
                  className="gap-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-background"
                >
                  <Building2 className="size-3.5 text-emerald-500" />
                  <span>Brand Profiles & Whitelist</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    15% Criteria
                  </span>
                </TabsTrigger>
              </TabsList>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Legitimate brand assets strictly whitelisted</span>
              </span>
            </div>

            <TabsContent value="threats" className="mt-6 flex flex-col gap-6">
            {/* Core Requirement 2: High-Impact AI Brand Scanner Component */}
            <BrandScanBanner
              onRunScan={handleRunAIBrandScan}
              isScanning={isScanning}
              onBrandPresetSelect={(preset) => {
                // Preselect brand filter if it matches existing
                if (brands.includes(preset)) {
                  setBrand(preset);
                }
              }}
            />

            {/* Core Requirement 2: Financial risk exposure & threat aggregates */}
            <StatTiles entries={accounts} />

            {/* Manual test account toggle (retained and augmented) */}
            <div className="flex items-center justify-between border-t border-border/60 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldAlert className="size-4 text-[var(--signal-text)]" />
                <span>Need custom manual inspection?</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowManualForm(!showManualForm)}
              >
                <PlusCircle className="size-3.5" />
                {showManualForm ? "Hide Manual Form" : "Custom Threat Analyzer"}
              </Button>
            </div>

            {showManualForm && (
              <section className="surface-card rounded-xl border border-border p-5">
                <div className="mb-4">
                  <h2 className="text-base font-semibold">
                    Custom Account Evidence Analyzer
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submit custom threat evidence logs for specialized heuristic scoring.
                  </p>
                </div>

                <form
                  onSubmit={handleManualAnalyzeSubmit}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div className="grid gap-1.5">
                    <label htmlFor="test-handle" className="text-xs font-medium">
                      Account handle / Package ID
                    </label>
                    <Input
                      id="test-handle"
                      value={newHandle}
                      onChange={(event) => setNewHandle(event.target.value)}
                      placeholder="@example_account or com.fake.app"
                      required
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label
                      htmlFor="test-display-name"
                      className="text-xs font-medium"
                    >
                      Display name
                    </label>
                    <Input
                      id="test-display-name"
                      value={newDisplayName}
                      onChange={(event) => setNewDisplayName(event.target.value)}
                      placeholder="Example Account"
                      required
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label htmlFor="test-brand" className="text-xs font-medium">
                      Target brand
                    </label>
                    <Input
                      id="test-brand"
                      value={newBrandName}
                      onChange={(event) => setNewBrandName(event.target.value)}
                      placeholder="e.g. Nike"
                      required
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label htmlFor="test-platform" className="text-xs font-medium">
                      Channel / Platform
                    </label>
                    <select
                      id="test-platform"
                      value={newPlatform}
                      onChange={(event) =>
                        setNewPlatform(event.target.value as typeof newPlatform)
                      }
                      className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="x">X (Twitter)</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                      <option value="telegram">Telegram</option>
                      <option value="googleplay">Google Play</option>
                      <option value="appstore">App Store</option>
                    </select>
                  </div>

                  <div className="grid gap-1.5 sm:col-span-2">
                    <label
                      htmlFor="test-evidence"
                      className="text-xs font-medium"
                    >
                      Evidence items (one item per line)
                    </label>
                    <textarea
                      id="test-evidence"
                      value={newEvidence}
                      onChange={(event) => setNewEvidence(event.target.value)}
                      placeholder={
                        "Example: Typosquatting homoglyph substitution\nExample: Bio contains credential harvesting phishing URL"
                      }
                      required
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      disabled={isAnalyzing}
                      size="sm"
                      className="gap-2"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Radar className="size-3.5" />
                      )}
                      {isAnalyzing ? "Analyzing..." : "Save Custom Threat Flag"}
                    </Button>
                  </div>
                </form>
              </section>
            )}

            {/* Filters */}
            <div className="surface-card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  aria-hidden
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Filter discovered handles, packages, evidence, or brands..."
                  aria-label="Search flagged accounts"
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger
                    className="w-[170px] cursor-pointer text-xs"
                    aria-label="Filter by client brand"
                  >
                    <SelectValue placeholder="Client brand" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value={ALL} className="text-xs">
                      All client brands ({brands.length})
                    </SelectItem>
                    {brands.map((name) => (
                      <SelectItem key={name} value={name} className="text-xs">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={threat}
                  onValueChange={(value) =>
                    setThreat(value as "all" | ThreatType)
                  }
                >
                  <SelectTrigger
                    className="w-[165px] cursor-pointer text-xs"
                    aria-label="Filter by threat type"
                  >
                    <SelectValue placeholder="Threat type" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value={ALL} className="text-xs">
                      All threat vectors
                    </SelectItem>
                    {THREAT_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-xs">
                        {THREAT_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatusFilter(value as "all" | Status)
                  }
                >
                  <SelectTrigger
                    className="w-[160px] cursor-pointer text-xs"
                    aria-label="Filter by status"
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value={ALL} className="text-xs">
                      All statuses
                    </SelectItem>
                    {STATUSES.map((option) => (
                      <SelectItem key={option} value={option} className="text-xs">
                        {STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground"
                    onClick={resetFilters}
                  >
                    <X className="size-3.5" />
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Result count */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Displaying{" "}
                <span className="font-semibold text-foreground">
                  {visible.length}
                </span>{" "}
                of {accounts.length} indexed threat vectors
                {brand !== ALL && (
                  <span className="ml-1.5 font-medium text-[var(--signal-text)]">
                    (Filtered to: {brand})
                  </span>
                )}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Triage order: Open Risk &gt; Homoglyph vectors &gt; Recency
              </p>
            </div>

            {/* The watchlist & Action Center */}
            {accounts.length === 0 ? (
              <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Radar className="size-5 text-muted-foreground" />
                </span>
                <h2 className="text-base font-semibold tracking-tight">
                  No active threats detected yet
                </h2>
                <p className="max-w-sm text-xs leading-6 text-muted-foreground">
                  Launch the automated AI Brand Scan above or run a sweep to populate threat intelligence records.
                </p>
              </div>
            ) : visible.length === 0 ? (
              <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Inbox className="size-5 text-muted-foreground" />
                </span>
                <h2 className="text-base font-semibold tracking-tight">
                  No threats match current filter criteria
                </h2>
                <p className="max-w-sm text-xs leading-6 text-muted-foreground">
                  Clear the filters or enter another brand to inspect flagged vectors.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1 gap-1.5 text-xs"
                  onClick={resetFilters}
                >
                  <X className="size-3.5" />
                  Clear filters
                </Button>
              </div>
            ) : (
              <WatchlistTable
                entries={visible}
                onSelect={(entry) => setSelectedId(entry._id)}
                onStatusChange={handleStatusChange}
                onGenerateTakedown={(entry) => setTakedownTarget(entry)}
              />
            )}
            </TabsContent>

            {/* Core Requirement 1: Brand Profile & Legitimate Asset Definition View */}
            <TabsContent value="profiles" className="mt-6">
              <BrandProfileManager
                onSelectBrandForScan={(selectedBrand) => {
                  setActiveTab("threats");
                  setBrand(selectedBrand);
                  toast.info(`Configured threat scanner for ${selectedBrand}`);
                }}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Flag forensic detail sheet */}
      <AccountSheet
        entry={selected}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleStatusChange}
        onGenerateTakedown={(entry) => setTakedownTarget(entry)}
      />

      {/* Core Requirement 3: One-Click Takedown Generator Modal */}
      <TakedownNoticeModal
        threat={takedownTarget}
        isOpen={takedownTarget !== null}
        onClose={() => setTakedownTarget(null)}
        onMarkReported={() => {
          if (takedownTarget) {
            handleStatusChange(takedownTarget, "investigating");
          }
        }}
      />
    </main>
  );
}
