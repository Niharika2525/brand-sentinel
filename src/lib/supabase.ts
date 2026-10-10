import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase browser client for Brand Sentinel.
 *
 * Configuration comes from the project's Keys tab (never committed):
 *   VITE_SUPABASE_URL      – Project URL      (Supabase Dashboard → Settings → API)
 *   VITE_SUPABASE_ANON_KEY – Anon / public API key (safe to expose in browsers)
 *
 * The client is created lazily: the app keeps working before the keys are
 * configured, and `getSupabase()` throws a clear error only when something
 * actually tries to talk to Supabase without keys in place.
 *
 * Never put the service-role key (`SUPABASE_SERVICE_ROLE_KEY`) behind a
 * `VITE_` prefix — it bypasses row-level security and must only ever be
 * read server-side (e.g. from a Convex "use node" action via process.env).
 */

let client: SupabaseClient | null = null;

/** True when both public keys are present in the environment. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
}

/** Returns the shared Supabase client, creating it on first use. */
export function getSupabase(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the project's Keys tab, then reload.",
    );
  }

  client ??= createClient(url, anonKey);
  return client;
}
