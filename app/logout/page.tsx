'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function doLogout() {
      await supabase.auth.signOut();
      document.cookie = 'sb-auth-token=; path=/; SameSite=Lax; Secure; max-age=0';
      localStorage.clear();
      router.push('/login');
    }
    doLogout();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Logout in corso...</p>
    </div>
  );
}
