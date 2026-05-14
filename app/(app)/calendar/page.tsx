export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EventCard } from '@/components/app/EventCard';
import { EmptyState } from '@/components/app/EmptyState';
import Link from 'next/link';
import { Plus, CalendarDays } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
} from 'date-fns';
import { it } from 'date-fns/locale';

export default async function CalendarPage() {
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

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('couple_id', member.couple_id)
    .order('start_date', { ascending: true });

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const typeDot: Record<string, string> = {
    date: 'bg-primary',
    escape: 'bg-secondary-foreground',
    big_trip: 'bg-accent-foreground',
    custom: 'bg-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          {format(today, 'MMMM yyyy', { locale: it })}
        </h1>
        <Link
          href="/events/new"
          className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Nuovo
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayEvents =
              events?.filter((e) => isSameDay(parseISO(e.start_date), day)) ?? [];
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`relative flex h-10 flex-col items-center justify-center rounded-lg text-sm ${
                  isToday ? 'bg-primary/10 font-bold text-primary' : 'text-foreground'
                }`}
              >
                {format(day, 'd')}
                {dayEvents.length > 0 && (
                  <div className="mt-0.5 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${typeDot[e.type] || typeDot.custom}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Prossimi eventi
        </h2>
        {events && events.length > 0 ? (
          <div className="space-y-3">
            {events
              .filter((e) => e.status === 'planned')
              .slice(0, 10)
              .map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Nessun evento"
            description="Inizia a pianificare il vostro tempo insieme."
            action={
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Aggiungi evento
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
