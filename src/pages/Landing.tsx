import { BrandLogo } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  SEVERITY_DOT,
  SEVERITY_META,
  THREAT_HINTS,
  type Severity,
} from "@/lib/watchlist";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  Fingerprint,
  Gauge,
  ListChecks,
  Radar,
  Smartphone,
  UserX,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto flex max-w-2xl flex-col items-center text-center"
          : "flex max-w-2xl flex-col"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--signal-text)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero preview — a sample of the watchlist itself                     */
/* ------------------------------------------------------------------ */

type PreviewFlag = {
  severity: Severity;
  name: string;
  handle: string;
  platform: string;
  score: number;
};

const PREVIEW_FLAGS: PreviewFlag[] = [
  {
    severity: "critical",
    name: "Northline Bank Official",
    handle: "@northline.support.official",
    platform: "Instagram",
    score: 96,
  },
  {
    severity: "critical",
    name: "NorthLine Quick Loans",
    handle: "com.northline.quickloan",
    platform: "Google Play",
    score: 93,
  },
  {
    severity: "critical",
    name: "Voyager Air Refunds",
    handle: "@voyagerair_deals",
    platform: "X",
    score: 91,
  },
  {
    severity: "high",
    name: "Solace Health Care",
    handle: "@solace.health.care",
    platform: "Instagram",
    score: 84,
  },
  {
    severity: "high",
    name: "Peakline Outdoors Sale",
    handle: "@peakline.outdoor.sale",
    platform: "TikTok",
    score: 79,
  },
];

function WatchlistPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="surface-card relative overflow-hidden">
      {/* scanning sweep line */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--signal)] to-transparent opacity-70"
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold tracking-tight">
            Flagged watchlist
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--signal-line)] bg-[var(--signal-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--signal-text)]">
            <span className="pulse-dot" />
            Live
          </span>
        </div>
        <span className="text-xs text-muted-foreground">5 client brands</span>
      </div>

      <div className="divide-y divide-border/70">
        {PREVIEW_FLAGS.map((flag, index) => (
          <Reveal key={flag.handle} delay={0.25 + index * 0.09}>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${SEVERITY_META[flag.severity].className}`}
              >
                <span
                  className={`size-1.5 rounded-full ${SEVERITY_DOT[flag.severity]}`}
                />
                {SEVERITY_META[flag.severity].label}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{flag.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {flag.handle} · {flag.platform}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {flag.score}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Risk
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-border/80 bg-muted/50 px-5 py-3">
        <Radar className="size-3.5 animate-[spin_4s_linear_infinite] text-[var(--signal-text)]" />
        <p className="text-xs text-muted-foreground">
          AI sweep running · signals scored continuously
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const CAPABILITIES = [
  {
    icon: UserX,
    title: "Fake profiles",
    body: THREAT_HINTS.fake_profile,
    where: "Instagram · TikTok · Facebook",
  },
  {
    icon: Fingerprint,
    title: "Impersonation",
    body: THREAT_HINTS.impersonation,
    where: "X · Instagram · YouTube",
  },
  {
    icon: CircleDollarSign,
    title: "Scam accounts",
    body: THREAT_HINTS.scam_account,
    where: "X · Telegram · Facebook",
  },
  {
    icon: Smartphone,
    title: "Suspicious apps",
    body: THREAT_HINTS.suspicious_app,
    where: "Google Play · App Store",
  },
] as const;

const STEPS = [
  {
    number: "01",
    icon: Radar,
    title: "Sweep",
    body: "Continuous monitoring across eight social platforms and both app stores, scoped to each client brand you manage.",
  },
  {
    number: "02",
    icon: Gauge,
    title: "Score",
    body: "AI correlates handles, bios, visuals, permissions and behaviour into a 0–100 risk score with the evidence attached.",
  },
  {
    number: "03",
    icon: ListChecks,
    title: "Triage",
    body: "Flags land on one watchlist: filter by brand, open the evidence, and move each account through your review workflow.",
  },
] as const;

const PORTFOLIO = [
  { brand: "Northline Bank", flags: 5 },
  { brand: "Solace Health", flags: 4 },
  { brand: "Voyager Air", flags: 3 },
  { brand: "Lumen Cosmetics", flags: 2 },
  { brand: "Peakline Outdoors", flags: 2 },
] as const;

const AGENCY_POINTS = [
  "Portfolio coverage — every client's accounts and apps in one workspace.",
  "Evidence with every flag — AI summaries plus the signals behind the score.",
  "A workflow, not a maybe — New, Investigating, Resolved, Dismissed.",
  "Severity-first triage — critical impersonation surfaces at the top.",
] as const;

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/dashboard" : "/auth";
  const primaryLabel = isAuthenticated ? "Dashboard" : "Open the watchlist";

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      {/* ---------------------------------------------------------------- */}
      {/* Navbar                                                            */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-2.5">
            <BrandLogo className="size-9" />
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">
                Brand Sentinel
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Threat monitoring
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a
              href="#capabilities"
              className="transition-colors hover:text-foreground"
            >
              Capabilities
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a
              href="#agencies"
              className="transition-colors hover:text-foreground"
            >
              For agencies
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Button
                asChild
                variant="ghost"
                className="hidden text-muted-foreground sm:inline-flex"
              >
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
            <Button asChild className="gap-1.5">
              <Link to={primaryHref}>
                {primaryLabel}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 right-[-12rem] size-[28rem] rounded-full bg-[var(--signal)] opacity-[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-[-10rem] size-[24rem] rounded-full bg-[var(--signal)] opacity-[0.05] blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-28">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--signal-line)] bg-[var(--signal-soft)] px-3 py-1 text-xs font-medium text-[var(--signal-text)]">
                <span className="pulse-dot" />
                AI-powered social &amp; app monitoring
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-6 text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Fake profiles and scam apps, caught before your clients notice.
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Brand Sentinel sweeps eight platforms and both app stores,
                scores every suspicious account with AI, and drops the worst of
                it onto a single watchlist your agency can act on.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <a href="#how">See how it works</a>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {[
                  "8 platforms watched",
                  "4 threat types detected",
                  "Built for client portfolios",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-[var(--signal-text)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="w-full">
            <WatchlistPreview />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Metrics strip                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-4">
        <Reveal>
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-4">
            {[
              { value: "8", label: "Platforms swept" },
              { value: "4", label: "Threat classes" },
              { value: "0–100", label: "AI risk score" },
              { value: "24/7", label: "Continuous sweeps" },
            ].map((metric, index) => (
              <div
                key={metric.label}
                className={`px-6 py-7 ${index % 2 === 1 ? "border-l border-border" : ""} ${index >= 2 ? "border-t border-border md:border-t-0" : ""} ${index === 2 ? "md:border-l" : ""} ${index === 3 ? "md:border-l" : ""}`}
              >
                <p className="text-2xl font-semibold tracking-tight tabular-nums">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Capabilities                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section id="capabilities" className="scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Capabilities"
              title="What the sweep catches"
              description="Four threat classes, one consistent treatment: scored, evidenced, and queued for review."
            />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {CAPABILITIES.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <Reveal key={capability.title} delay={index * 0.07}>
                  <div className="surface-card group flex h-full flex-col p-6 transition-colors hover:border-[var(--signal-line)]">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted text-foreground transition-colors group-hover:border-[var(--signal-line)] group-hover:bg-[var(--signal-soft)] group-hover:text-[var(--signal-text)]">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold tracking-tight">
                      {capability.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                      {capability.body}
                    </p>
                    <p className="mt-5 text-xs font-medium text-muted-foreground/80">
                      {capability.where}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section id="how" className="scroll-mt-20 border-y border-border/70 bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="From raw signal to a reviewed decision"
              description="The watchlist is the product: everything upstream exists to make one screen trustworthy."
            />
          </Reveal>

          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.number} delay={index * 0.1}>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums text-[var(--signal-text)]">
                        {step.number}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* For agencies                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section id="agencies" className="scroll-mt-20">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="For agencies"
                title="One watchlist for every client brand"
                description="You manage reputations you don't own. Brand Sentinel keeps every portfolio brand in the same triage queue, with the same evidence standard."
              />
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="mt-8 space-y-4">
                {AGENCY_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[var(--signal-line)] bg-[var(--signal-soft)]">
                      <Check className="size-3 text-[var(--signal-text)]" />
                    </span>
                    <span className="text-sm leading-6 text-muted-foreground">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="surface-card p-6 md:p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight">
                  Client portfolio
                </h3>
                <span className="text-xs text-muted-foreground">
                  16 flags tracked
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {PORTFOLIO.map((entry) => (
                  <span
                    key={entry.brand}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-sm"
                  >
                    <span className="font-medium">{entry.brand}</span>
                    <span className="rounded-full bg-background px-1.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                      {entry.flags}
                    </span>
                  </span>
                ))}
              </div>

              <div className="my-6 h-px bg-border" />

              <h3 className="text-sm font-semibold tracking-tight">
                Severity legend
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(["critical", "high", "medium", "low"] as Severity[]).map(
                  (severity) => (
                    <div
                      key={severity}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-wider ${SEVERITY_META[severity].className}`}
                    >
                      <span
                        className={`size-2 rounded-full ${SEVERITY_DOT[severity]}`}
                      />
                      {SEVERITY_META[severity].label}
                    </div>
                  ),
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA                                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-20 md:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground md:px-14 md:py-16">
            <div className="pointer-events-none absolute -top-24 right-[-6rem] size-72 rounded-full bg-[var(--signal)] opacity-25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-[-6rem] size-64 rounded-full bg-[var(--signal)] opacity-15 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Put every fake account on one screen.
              </h2>
              <p className="mt-4 text-base leading-7 opacity-70">
                Sign in and the flagged-account watchlist is ready — seeded
                across five sample client brands, with evidence on every flag.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  <Link to={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                {!isAuthenticated && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/25 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                  >
                    <Link to="/auth">Sign in with email</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="size-8" />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">
                Brand Sentinel
              </p>
              <p className="text-xs text-muted-foreground">
                AI social &amp; app threat monitoring for agencies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#capabilities"
              className="transition-colors hover:text-foreground"
            >
              Capabilities
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <Link
              to="/auth"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl border-t border-border/70 px-5 py-5">
          <p className="text-xs text-muted-foreground">
            © 2026 Brand Sentinel. Monitoring output is advisory and should be
            reviewed by your team.
          </p>
        </div>
      </footer>
    </div>
  );
}
