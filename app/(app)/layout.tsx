'use client';

import { useEffect } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { createClient } from '@/lib/supabase/client';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  useEffect(() => {
    // Forza il caricamento della sessione da localStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        document.cookie = `sb-auth-token=${session.access_token}; path=/; SameSite=Lax; Secure`;
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        document.cookie = `sb-auth-token=${session.access_token}; path=/; SameSite=Lax; Secure`;
      } else {
        document.cookie = `sb-auth-token=; path=/; SameSite=Lax; Secure; max-age=0`;
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return <AppShell>{children}</AppShell>;
}
