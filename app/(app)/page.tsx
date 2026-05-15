export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { computeRule222 } from '@/lib/utils/222-rule';
import { CountdownCard } from '@/components/app/CountdownCard';
import { RitualStatusCard } from '@/components/app/RitualStatusCard';
import { EmptyState } from '@/components/app/EmptyState';

import { MemoryCard } from '@/components/app/MemoryCard';
import { RandomIdeaButton } from '@/components/app/RandomIdeaButton';
import { DaysTogetherCard } from '@/components/app/DaysTogetherCard';
import { TutorialOverlay } from '@/components/app/TutorialOverlay';
import Link from 'next/link';
import { Plus, CalendarHeart, ImageOff } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!member) redirect('/onboarding');

  const coupleId = member.couple_id;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: couple } = await supabase
    .from('couples')
    .select('created_at')
    .eq('id', coupleId)
    .single();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('couple_id', coupleId)
    .order('start_date', { ascending: true });

  const { data: ideas } = await supabase
    .from('date_ideas')
    .select('*')
    .eq('couple_id', coupleId);

  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })
    .limit(3);

  const upcoming = events?.filter((e) => e.status === 'planned') ?? [];
  const nextEvent = upcoming[0] ?? null;
  const rule222 = computeRule222(events ?? []);

  const hour = new Date().getHours();
  let greeting = 'Buonasera';
  if (hour < 12) greeting = 'Buongiorno';
  else if (hour < 18) greeting = 'Buon pomeriggio';

  return (
    <>
      <TutorialOverlay />
      <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {profile?.full_name?.split(' ')[0] || 'tesoro'}
        </h1>
        <p className="text-sm text-muted-foreground">Ecco come va il vostro percorso.</p>
      </header>

      {couple && <DaysTogetherCard createdAt={couple.created_at} />}

      {nextEvent ? (
        <CountdownCard event={nextEvent} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <CalendarHeart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Nessun evento in programma</p>
          <Link
            href="/events/new"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Aggiungi evento
          </Link>
        </div>
      )}

      <RitualStatusCard state={rule222} />

      <div className="flex gap-3">
        <Link
          href="/events/new"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Aggiungi evento
        </Link>
      </div>

      {ideas && ideas.length > 0 && <RandomIdeaButton ideas={ideas} />}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Ultimi ricordi
          </h2>
          <Link href="/memories" className="text-xs text-primary">
            Vedi tutti
          </Link>
        </div>
        {memories && memories.length > 0 ? (
          <div className="grid gap-4">
            {memories.map((m) => (
              <MemoryCard key={m.id} memory={m} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ImageOff}
            title="Nessun ricordo"
            description="Completa un evento e aggiungi un ricordo per vederlo qui."
          />
        )}
      </div>
      </div>
    </>
  );
}
