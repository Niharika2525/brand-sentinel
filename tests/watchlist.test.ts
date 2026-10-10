import { describe, expect, test } from "bun:test";
import {
  formatFollowers,
  initials,
  isOpen,
  SEVERITIES,
  SEVERITY_LABELS,
  severityForScore,
  STATUSES,
  STATUS_LABELS,
  THREAT_HINTS,
  THREAT_LABELS,
  THREAT_TYPES,
} from "@/lib/watchlist";

describe("severityForScore", () => {
  test("buckets risk scores at the documented boundaries", () => {
    expect(severityForScore(100)).toBe("critical");
    expect(severityForScore(85)).toBe("critical");
    expect(severityForScore(84)).toBe("high");
    expect(severityForScore(72)).toBe("high");
    expect(severityForScore(71)).toBe("medium");
    expect(severityForScore(55)).toBe("medium");
    expect(severityForScore(54)).toBe("low");
    expect(severityForScore(0)).toBe("low");
  });
});

describe("formatFollowers", () => {
  test("renders audience counts compactly", () => {
    expect(formatFollowers(undefined)).toBe("—");
    expect(formatFollowers(0)).toBe("0");
    expect(formatFollowers(999)).toBe("999");
    expect(formatFollowers(1_000)).toBe("1.0K");
    expect(formatFollowers(12_400)).toBe("12K");
    expect(formatFollowers(44_000)).toBe("44K");
    expect(formatFollowers(1_000_000)).toBe("1.0M");
    expect(formatFollowers(1_200_000)).toBe("1.2M");
  });
});

describe("initials", () => {
  test("takes the first letter of the first two words", () => {
    expect(initials("Northline Bank Official")).toBe("NB");
    expect(initials("lumen \u2013 skin analyzer")).toBe("LS");
    expect(initials("Voyager")).toBe("VO");
    expect(initials("")).toBe("?");
  });
});

describe("isOpen", () => {
  test("open means new or investigating", () => {
    expect(isOpen("new")).toBe(true);
    expect(isOpen("investigating")).toBe(true);
    expect(isOpen("resolved")).toBe(false);
    expect(isOpen("dismissed")).toBe(false);
  });
});

describe("label maps", () => {
  test("cover every enum member exactly once", () => {
    expect(new Set(STATUSES).size).toBe(STATUSES.length);
    expect(new Set(THREAT_TYPES).size).toBe(THREAT_TYPES.length);
    expect(new Set(SEVERITIES).size).toBe(SEVERITIES.length);

    for (const status of STATUSES) {
      expect(STATUS_LABELS[status]).toBeTruthy();
    }
    for (const threat of THREAT_TYPES) {
      expect(THREAT_LABELS[threat]).toBeTruthy();
      expect(THREAT_HINTS[threat]).toBeTruthy();
    }
    for (const severity of SEVERITIES) {
      expect(SEVERITY_LABELS[severity]).toBeTruthy();
    }
  });
});
