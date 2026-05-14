import Link from 'next/link';
import { CalendarEvent } from '@/types';
import { formatDate } from '@/lib/utils/dates';
import { Calendar, MapPin, Banknote } from 'lucide-react';
import { clsx } from 'clsx';

const typeStyles: Record<string, string> = {
  date: 'bg-primary/10 text-primary border-primary/20',
  escape: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
  big_trip: 'bg-accent/30 text-accent-foreground border-accent/40',
  custom: 'bg-muted text-muted-foreground border-border',
};

const typeLabels: Record<string, string> = {
  date: 'Appuntamento',
  escape: 'Fuga',
  big_trip: 'Viaggio',
  custom: 'Altro',
};

interface EventCardProps {
  event: CalendarEvent;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground line-clamp-1">{event.title}</h3>
        <span
          className={clsx(
            'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            typeStyles[event.type] || typeStyles.custom
          )}
        >
          {typeLabels[event.type] || 'Altro'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formatDate(event.start_date)}
        </span>
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {event.location}
          </span>
        )}
        {event.budget && (
          <span className="flex items-center gap-1">
            <Banknote className="h-4 w-4" />
            {event.budget} €
          </span>
        )}
      </div>

      {event.status === 'done' && (
        <span className="mt-3 inline-block rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
          Completato
        </span>
      )}
    </Link>
  );
}
