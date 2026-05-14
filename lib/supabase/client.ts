'use client';

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

type GlobalWithSupabase = typeof globalThis & {
  __supabaseBrowserClient?: SupabaseClient;
};

export function createClient() {
  const g = globalThis as GlobalWithSupabase;
  if (g.__supabaseBrowserClient) return g.__supabaseBrowserClient;
  g.__supabaseBrowserClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return g.__supabaseBrowserClient;
}
