import { describe, expect, test } from "bun:test";
import { SEED_ENTRIES } from "@/convex/flaggedAccounts";
import { severityForScore } from "@/lib/watchlist";

/**
 * Invariants of the seeded watchlist. These guard the exact class of bug the
 * product already shipped once: numbers in copy drifting away from the data.
 */
describe("watchlist seed data", () => {
  test("contains exactly 16 flags across 5 client brands", () => {
    expect(SEED_ENTRIES).toHaveLength(16);
    expect(new Set(SEED_ENTRIES.map((entry) => entry.brandName)).size).toBe(5);
  });

  test("covers every review status and threat class", () => {
    expect(new Set(SEED_ENTRIES.map((entry) => entry.status))).toEqual(
      new Set(["new", "investigating", "resolved", "dismissed"]),
    );
    expect(new Set(SEED_ENTRIES.map((entry) => entry.threatType))).toEqual(
      new Set(["fake_profile", "impersonation", "scam_account", "suspicious_app"]),
    );
  });

  test("handles are unique", () => {
    const handles = SEED_ENTRIES.map((entry) => entry.handle);
    expect(new Set(handles).size).toBe(handles.length);
  });

  test("risk scores are 0-100 and severity matches the score bucket", () => {
    for (const entry of SEED_ENTRIES) {
      expect(entry.riskScore).toBeGreaterThanOrEqual(0);
      expect(entry.riskScore).toBeLessThanOrEqual(100);
      expect(entry.severity).toBe(severityForScore(entry.riskScore));
    }
  });

  test("every flag carries a summary and at least three evidence signals", () => {
    for (const entry of SEED_ENTRIES) {
      expect(entry.summary.length).toBeGreaterThan(20);
      expect(entry.signals.length).toBeGreaterThanOrEqual(3);
      expect(entry.minutesAgo).toBeGreaterThan(0);
    }
  });

  test("social flags carry audience size; app-store listings do not", () => {
    for (const entry of SEED_ENTRIES) {
      if (entry.platform === "googleplay" || entry.platform === "appstore") {
        expect(entry.followers).toBeUndefined();
      } else {
        expect(entry.followers).toBeGreaterThan(0);
      }
    }
  });

  test("per-brand counts sum to 16 (matches the landing portfolio panel)", () => {
    const byBrand = new Map<string, number>();
    for (const entry of SEED_ENTRIES) {
      byBrand.set(entry.brandName, (byBrand.get(entry.brandName) ?? 0) + 1);
    }
    expect(Object.fromEntries(byBrand)).toEqual({
      "Northline Bank": 5,
      "Solace Health": 4,
      "Voyager Air": 3,
      "Lumen Cosmetics": 2,
      "Peakline Outdoors": 2,
    });
  });
});
