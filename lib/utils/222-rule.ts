import { parseISO, differenceInDays, addDays, addMonths, addYears, isValid } from 'date-fns';
import type { CalendarEvent, RitualState, Rule222State, EventType } from '@/types';

const RULES: Record<Exclude<EventType, 'custom'>, { days: number; label: string }> = {
  date: { days: 14, label: '2 settimane' },
  escape: { days: 60, label: '2 mesi' },
  big_trip: { days: 730, label: '2 anni' },
};

function computeRitualState(
  events: CalendarEvent[],
  type: Exclude<EventType, 'custom'>
): RitualState {
  const rule = RULES[type];
  const relevant = events
    .filter((e) => e.type === type && e.status === 'done')
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  const last_event = relevant[0] ?? null;

  if (!last_event) {
    return {
      status: 'missing',
      last_event: null,
      next_due_date: null,
      days_remaining: null,
    };
  }

  const lastDate = parseISO(last_event.start_date);
  if (!isValid(lastDate)) {
    return {
      status: 'missing',
      last_event,
      next_due_date: null,
      days_remaining: null,
    };
  }

  let nextDue: Date;
  if (type === 'date') nextDue = addDays(lastDate, rule.days);
  else if (type === 'escape') nextDue = addMonths(lastDate, 2);
  else nextDue = addYears(lastDate, 2);

  const remaining = differenceInDays(nextDue, new Date());

  let status: RitualState['status'] = 'ok';
  if (remaining < 0) status = 'missing';
  else if (remaining <= 3) status = 'due';

  return {
    status,
    last_event,
    next_due_date: nextDue,
    days_remaining: remaining,
  };
}

export function computeRule222(events: CalendarEvent[]): Rule222State {
  return {
    date: computeRitualState(events, 'date'),
    escape: computeRitualState(events, 'escape'),
    big_trip: computeRitualState(events, 'big_trip'),
  };
}
