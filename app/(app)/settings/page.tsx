'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Couple } from '@/types';
import { CoupleInviteCard } from '@/components/app/CoupleInviteCard';
import { LogOut, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const res = await fetch(`/api/settings?user_id=${userData.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCouple(data.couple);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Impostazioni</h1>

      {couple && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Nome coppia</p>
            <p className="text-lg font-semibold text-foreground">{couple.name}</p>
          </div>
          <CoupleInviteCard inviteCode={couple.invite_code} />
        </div>
      )}

      <button
        onClick={handleLogout}
        disabled={signingOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
      >
        {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        Esci
      </button>
    </div>
  );
}
