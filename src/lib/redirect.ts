/**
 * Resolves where the auth flow lands after a successful sign-in.
 *
 * `returnTo` comes from the URL (set by RequireAuth) and must stay a
 * same-site path. Anything else — absolute URLs, protocol-relative
 * "//host" targets, or plain paths without a leading slash — falls back
 * to the route's default destination.
 */
export function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}
