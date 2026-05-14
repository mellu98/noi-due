'use client';

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

function getCookieToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\\s*)sb-auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function createClient() {
  const token = getCookieToken();

  if (!client) {
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined,
      }
    );
  } else if (token) {
    // Aggiorna il token se è cambiato
    client.auth.setSession({ access_token: token, refresh_token: '' });
  }

  return client;
}
