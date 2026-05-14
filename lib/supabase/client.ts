'use client';

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

type GlobalWithSupabase = typeof globalThis & {
  __supabaseBrowserClient?: SupabaseClient;
};

export function createClient() {
  const g = globalThis as GlobalWithSupabase;
  if (g.__supabaseBrowserClient) {
    console.log('[CLIENT] Reusing existing singleton');
    return g.__supabaseBrowserClient;
  }
  console.log('[CLIENT] Creating NEW supabase client');

  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const url = input.toString();
          const headers = init?.headers as Record<string, string> | undefined;
          console.log('[FETCH]', url.substring(0, 80), 'auth:', headers?.['Authorization']?.substring(0, 30) || 'NONE');
          return fetch(input, init);
        },
      },
    }
  );

  g.__supabaseBrowserClient = client;
  return client;
}
