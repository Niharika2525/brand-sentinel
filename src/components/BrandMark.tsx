import { cn } from "@/lib/utils";

/**
 * Brand Sentinel mark: a signal/broadcast glyph with a live-teal core.
 * Waves use currentColor so the mark adapts to light and dark surfaces.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-5", className)}
    >
      <circle cx="12" cy="12" r="2.3" fill="var(--signal)" />
      <g
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M8.9 15.1 Q7.3 12 8.9 8.9" />
        <path d="M15.1 8.9 Q16.7 12 15.1 15.1" />
        <path d="M6.5 17.5 Q4 12 6.5 6.5" />
        <path d="M17.5 6.5 Q20 12 17.5 17.5" />
      </g>
    </svg>
  );
}

/** The mark inside its rounded tile — used in navbars and footers. */
export function BrandLogo({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[11px] bg-primary text-primary-foreground",
        className,
      )}
    >
      <BrandMark className={cn("size-[60%]", markClassName)} />
    </span>
  );
}
