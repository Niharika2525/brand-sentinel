import { describe, expect, test } from "bun:test";
import { resolveRedirectAfterAuth } from "@/lib/redirect";

describe("resolveRedirectAfterAuth", () => {
  test("keeps same-site paths, including query and hash", () => {
    expect(resolveRedirectAfterAuth("/dashboard")).toBe("/dashboard");
    expect(resolveRedirectAfterAuth("/dashboard?tab=evidence#top")).toBe(
      "/dashboard?tab=evidence#top",
    );
    expect(resolveRedirectAfterAuth("/")).toBe("/");
  });

  test("rejects absolute, protocol-relative and bare targets", () => {
    expect(resolveRedirectAfterAuth("https://evil.example")).toBe("/dashboard");
    expect(resolveRedirectAfterAuth("//evil.example")).toBe("/dashboard");
    expect(resolveRedirectAfterAuth("dashboard")).toBe("/dashboard");
    expect(resolveRedirectAfterAuth(null)).toBe("/dashboard");
  });

  test("honours a custom fallback when provided", () => {
    expect(resolveRedirectAfterAuth(null, "/")).toBe("/");
    expect(resolveRedirectAfterAuth(null, undefined)).toBe("/dashboard");
    expect(resolveRedirectAfterAuth("//evil.example", "/landing")).toBe(
      "/landing",
    );
  });
});
