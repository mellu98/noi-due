'use client';

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

type GlobalWithSupabase = typeof globalThis & {
  __supabaseBrowserClient?: SupabaseClient;
};

function getTokenFromStorage(): string | null {
  try {
    const raw = localStorage.getItem('sb-wzcauthqplvdvtfquhag-auth-token');
    if (!raw) {
      console.log('[TOKEN] localStorage key not found');
      return null;
    }
    const parsed = JSON.parse(raw);
    const token = parsed?.access_token || null;
    console.log('[TOKEN] found token:', token ? token.substring(0, 20) + '...' : 'null');
    return token;
  } catch (e) {
    console.log('[TOKEN] parse error:', e);
    return null;
  }
}

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
          const headers = new Headers(init?.headers);
          const hadAuth = headers.has('Authorization');
          if (!hadAuth) {
            const token = getTokenFromStorage();
            if (token) {
              headers.set('Authorization', `Bearer ${token}`);
              console.log('[FETCH] INJECTED auth for', url.substring(url.lastIndexOf('/') + 1));
            } else {
              console.log('[FETCH] NO token found for', url.substring(url.lastIndexOf('/') + 1));
            }
          } else {
            console.log('[FETCH] ALREADY had auth for', url.substring(url.lastIndexOf('/') + 1));
          }
          return fetch(input, { ...init, headers });
        },
      },
    }
  );

  g.__supabaseBrowserClient = client;
  return client;
}
