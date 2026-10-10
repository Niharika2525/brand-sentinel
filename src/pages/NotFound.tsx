import { BrandLogo } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16"
    >
      <div className="surface-card w-full max-w-md px-8 py-12 text-center">
        <span className="mx-auto flex w-fit items-center gap-2.5">
          <BrandLogo className="size-10" />
          <span className="text-base font-semibold tracking-tight">
            Brand Sentinel
          </span>
        </span>

        <p className="mt-8 text-xs font-semibold tracking-[0.16em] text-[var(--signal-text)] uppercase">
          Error 404
        </p>
        <h1 className="mt-2.5 text-2xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist — it may have been
          moved, or the link may be out of date. Your flagged-account watchlist
          is still right where you left it.
        </p>

        <div className="mt-8 flex flex-col gap-2.5">
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Open the watchlist</Link>
          </Button>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        AI social &amp; app threat monitoring for agencies
      </p>
    </motion.main>
  );
}
