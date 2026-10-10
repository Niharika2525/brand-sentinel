import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Radar,
  ShieldAlert,
  Search,
  Sparkles,
  Layers,
  Smartphone,
  Send,
  Globe,
  Radio,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ThreatChannel } from "@/convex/scanner";

interface BrandScanBannerProps {
  onRunScan: (brandName: string, channels: ThreatChannel[]) => Promise<void>;
  isScanning: boolean;
  onBrandPresetSelect?: (brand: string) => void;
}

const CHANNELS: Array<{
  id: ThreatChannel;
  label: string;
  sub: string;
  icon: typeof Globe;
}> = [
  {
    id: "instagram",
    label: "Instagram",
    sub: "Visual & Profile Clones",
    icon: Globe,
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    sub: "Automated Support Bots",
    icon: Radio,
  },
  {
    id: "telegram",
    label: "Telegram",
    sub: "Black-market & VIP Scams",
    icon: Send,
  },
  {
    id: "play_store",
    label: "Google Play Store",
    sub: "Trojan APK Signatures",
    icon: Smartphone,
  },
  {
    id: "app_store",
    label: "Apple App Store",
    sub: "Trademark Metadata Infringement",
    icon: Layers,
  },
];

const SCAN_STAGES = [
  { step: 1, label: "Crawling OSINT social graphs & rogue accounts..." },
  { step: 2, label: "Analyzing typosquatting vectors & homoglyph substitutions..." },
  { step: 3, label: "Evaluating visual brand similarity & avatar pixel matches..." },
  { step: 4, label: "Scanning app store APK signatures & C2 server endpoints..." },
  { step: 5, label: "Compiling forensic risk scores & synthesizing evidence..." },
];

const PRESET_BRANDS = ["Zomato", "PhonePe", "Nike", "Northline Bank", "Binance"];

export function BrandScanBanner({
  onRunScan,
  isScanning,
  onBrandPresetSelect,
}: BrandScanBannerProps) {
  const [brandName, setBrandName] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<ThreatChannel[]>([
    "instagram",
    "twitter",
    "telegram",
    "play_store",
  ]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Cycle through scanner stages during scan
  useEffect(() => {
    if (!isScanning) {
      setCurrentStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1) % SCAN_STAGES.length);
    }, 900);

    return () => clearInterval(interval);
  }, [isScanning]);

  const toggleChannel = (channel: ThreatChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  const handleSelectAllChannels = () => {
    if (selectedChannels.length === CHANNELS.length) {
      setSelectedChannels(["instagram", "twitter"]);
    } else {
      setSelectedChannels(CHANNELS.map((c) => c.id));
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = brandName.trim();
    if (!clean) return;
    onRunScan(clean, selectedChannels);
  };

  const handlePresetClick = (brand: string) => {
    setBrandName(brand);
    if (onBrandPresetSelect) {
      onBrandPresetSelect(brand);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--signal-line)] bg-gradient-to-b from-card via-card to-muted/20 p-5 shadow-sm sm:p-6">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[var(--signal)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 size-60 rounded-full bg-red-500/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header & Badges */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--signal-soft)] text-[var(--signal-text)] ring-1 ring-[var(--signal-line)]">
              <Zap className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                  Automated AI Deep Threat Scanner
                </h2>
                <Badge
                  variant="outline"
                  className="hidden border-[var(--signal-line)] bg-[var(--signal-soft)] text-[10px] font-semibold text-[var(--signal-text)] sm:inline-flex"
                >
                  <Sparkles className="mr-1 size-3" /> OSINT & Dark Web Engine
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Autonomous real-time reconnaissance for brand impersonation, fraudulent domains, and rogue apps.
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground mr-1 text-[11px]">Quick presets:</span>
            {PRESET_BRANDS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="cursor-pointer rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:border-[var(--signal-line)] hover:bg-[var(--signal-soft)] hover:text-[var(--signal-text)]"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Action */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter protected brand name (e.g. Zomato, PhonePe, Nike, Apple)..."
                disabled={isScanning}
                className="h-11 pl-10 text-sm font-medium bg-background shadow-none border-border focus-visible:border-[var(--signal)] focus-visible:ring-[var(--signal-line)]"
              />
            </div>

            <Button
              type="submit"
              disabled={isScanning || !brandName.trim() || selectedChannels.length === 0}
              className="h-11 cursor-pointer gap-2 bg-[var(--primary)] px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-95 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Radar className="size-4 animate-spin text-[var(--signal)]" />
                  <span>Scanning Threat Vectors...</span>
                </>
              ) : (
                <>
                  <Radar className="size-4 text-[var(--signal)]" />
                  <span>Run AI Brand Scan</span>
                </>
              )}
            </Button>
          </div>

          {/* Channels Selection */}
          <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-background/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Intelligence Discovery Channels ({selectedChannels.length}/{CHANNELS.length})
              </span>
              <button
                type="button"
                onClick={handleSelectAllChannels}
                className="text-[11px] font-medium text-[var(--signal-text)] hover:underline cursor-pointer"
              >
                {selectedChannels.length === CHANNELS.length ? "Deselect All" : "Select All Channels"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {CHANNELS.map((channel) => {
                const isSelected = selectedChannels.includes(channel.id);
                const Icon = channel.icon;
                return (
                  <label
                    key={channel.id}
                    className={`flex cursor-pointer select-none items-center gap-2.5 rounded-lg border p-2 text-xs transition-colors ${
                      isSelected
                        ? "border-[var(--signal-line)] bg-[var(--signal-soft)] text-foreground"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleChannel(channel.id)}
                      disabled={isScanning}
                      className="size-3.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{channel.label}</span>
                      </div>
                      <span className="block text-[10px] text-muted-foreground truncate">
                        {channel.sub}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        {/* Live multi-stage scan animation */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-xl border border-[var(--signal-line)] bg-muted/30 p-4"
            >
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="pulse-dot" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--signal-text)]">
                    Deep Inspection Pipeline In Progress
                  </span>
                </div>
                <span className="text-xs font-mono font-medium text-muted-foreground">
                  Phase {currentStageIndex + 1} of {SCAN_STAGES.length}
                </span>
              </div>

              {/* Progress track */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-[var(--signal)]"
                  initial={{ width: "15%" }}
                  animate={{
                    width: `${((currentStageIndex + 1) / SCAN_STAGES.length) * 100}%`,
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Step checklist */}
              <div className="mt-3.5 grid gap-1.5 sm:grid-cols-2">
                {SCAN_STAGES.map((st, i) => {
                  const isDone = i < currentStageIndex;
                  const isCurrent = i === currentStageIndex;
                  return (
                    <div
                      key={st.step}
                      className={`flex items-center gap-2 text-xs transition-opacity ${
                        isCurrent
                          ? "font-semibold text-foreground"
                          : isDone
                            ? "text-muted-foreground opacity-80"
                            : "text-muted-foreground opacity-40"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Radar className="size-3.5 animate-spin text-[var(--signal)] shrink-0" />
                      ) : (
                        <Clock className="size-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate">{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
