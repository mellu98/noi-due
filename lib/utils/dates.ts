import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { it } from 'date-fns/locale';

export function formatDate(date: string | Date, pattern = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, pattern, { locale: it });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, "dd MMM yyyy 'alle' HH:mm", { locale: it });
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 0;
  return differenceInDays(d, new Date());
}

export function countdownText(date: string | Date): string {
  const days = daysUntil(date);
  if (days < 0) return 'Passato';
  if (days === 0) return 'Oggi!';
  if (days === 1) return 'Domani';
  return `Tra ${days} giorni`;
}
