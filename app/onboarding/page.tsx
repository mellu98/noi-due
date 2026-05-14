'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Users, UserPlus } from 'lucide-react';

export default function OnboardingPage() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [coupleName, setCoupleName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('[ONBOARDING] Getting session...');
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    console.log('[ONBOARDING] session:', { present: !!sessionData.session, error: sessionErr?.message });
    const user = sessionData.session?.user;
    if (!user) {
      setError('Sessione scaduta. Effettua il login.');
      setLoading(false);
      router.push('/login');
      return;
    }
    // FIX: Force the client to activate the session so REST headers are set
    if (sessionData.session) {
      await supabase.auth.setSession({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      });
      console.log('[ONBOARDING] Session forced into client');
    }
    console.log('[ONBOARDING] user id:', user.id);

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    console.log('[ONBOARDING] Inserting couple with created_by:', user.id);
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .insert({ name: coupleName, invite_code: code, created_by: user.id })
      .select()
      .single();
    console.log('[ONBOARDING] couple result:', { data: !!couple, error: coupleError?.message });

    if (coupleError || !couple) {
      setError(coupleError?.message || 'Errore nella creazione della coppia.');
      setLoading(false);
      return;
    }

    const { error: memberError } = await supabase.from('couple_members').insert({
      couple_id: couple.id,
      user_id: user.id,
      role: 'admin',
    });

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    router.push('/');
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setError('Sessione scaduta. Effettua il login.');
      setLoading(false);
      router.push('/login');
      return;
    }

    const { data: couple, error: findError } = await supabase
      .from('couples')
      .select('id')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single();

    if (findError || !couple) {
      setError('Codice invito non valido.');
      setLoading(false);
      return;
    }

    const { error: memberError } = await supabase.from('couple_members').insert({
      couple_id: couple.id,
      user_id: user.id,
      role: 'member',
    });

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    router.push('/');
  }

  if (mode === 'choose') {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold text-foreground">Benvenuti su NoiDue</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Create la vostra coppia o unitevi con un codice invito.
        </p>
        <div className="mt-8 grid w-full gap-4">
          <button
            onClick={() => setMode('create')}
            className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Crea una coppia</p>
              <p className="text-xs text-muted-foreground">Iniziate un nuovo percorso insieme</p>
            </div>
          </button>
          <button
            onClick={() => setMode('join')}
            className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
              <UserPlus className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Entra in una coppia</p>
              <p className="text-xs text-muted-foreground">Usa il codice invito del partner</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
      <button
        onClick={() => setMode('choose')}
        className="mb-4 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Indietro
      </button>
      <h1 className="text-2xl font-bold text-foreground">
        {mode === 'create' ? 'Crea la vostra coppia' : 'Entra nella coppia'}
      </h1>

      <form
        onSubmit={mode === 'create' ? handleCreate : handleJoin}
        className="mt-6 w-full space-y-4"
      >
        {mode === 'create' ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Nome coppia</label>
            <input
              type="text"
              required
              value={coupleName}
              onChange={(e) => setCoupleName(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
              placeholder="Es. Noi Due"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Codice invito</label>
            <input
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring focus:ring-2 uppercase"
              placeholder="ABC123"
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'create' ? 'Crea coppia' : 'Entra'}
        </button>
      </form>
    </div>
  );
}
