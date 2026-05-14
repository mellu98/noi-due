import { CalendarEvent } from '@/types';
import { countdownText, daysUntil, formatDate } from '@/lib/utils/dates';
import { CalendarHeart } from 'lucide-react';

interface CountdownCardProps {
  event: CalendarEvent;
}

export function CountdownCard({ event }: CountdownCardProps) {
  const days = daysUntil(event.start_date);
  const isSoon = days >= 0 && days <= 7;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <CalendarHeart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Prossimo evento
          </p>
          <h3 className="font-semibold text-foreground">{event.title}</h3>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground">
            {days < 0 ? 0 : days}
          </p>
          <p className="text-sm text-muted-foreground">
            {days === 1 ? 'giorno' : 'giorni'} rimanenti
          </p>
        </div>
        <div className="text-right">
          <p className={clsx('text-sm font-medium', isSoon ? 'text-primary' : 'text-muted-foreground')}>
            {countdownText(event.start_date)}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(event.start_date)}</p>
        </div>
      </div>
    </div>
  );
}

// helper inline since clsx may not be imported above
function clsx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
