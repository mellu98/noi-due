'use client';

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

type GlobalWithSupabase = typeof globalThis & {
  __supabaseBrowserClient?: SupabaseClient;
};

function getTokenFromStorage(): string | null {
  try {
    const raw = localStorage.getItem('sb-wzcauthqplvdvtfquhag-auth-token');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token || null;
  } catch {
    return null;
  }
}

export function createClient() {
  const g = globalThis as GlobalWithSupabase;
  if (g.__supabaseBrowserClient) {
    return g.__supabaseBrowserClient;
  }

  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const url = input.toString();
          const headers = new Headers(init?.headers);
          const authHeader = headers.get('Authorization') || 'NONE';
          console.log('[FETCH]', url.substring(url.lastIndexOf('/') + 1), 'auth:', authHeader.substring(0, 40));
          if (!headers.has('Authorization')) {
            const token = getTokenFromStorage();
            if (token) {
              headers.set('Authorization', `Bearer ${token}`);
            }
          }
          return fetch(input, { ...init, headers });
        },
      },
    }
  );

  g.__supabaseBrowserClient = client;
  return client;
}
