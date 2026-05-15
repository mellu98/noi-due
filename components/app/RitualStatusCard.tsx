import { Rule222State, RitualState } from '@/types';
import { Heart, Plane, Tent } from 'lucide-react';

interface RitualStatusCardProps {
  state: Rule222State;
}

const config: Record<string, { label: string; icon: typeof Heart; color: string; bg: string }> = {
  date: { label: 'Appuntamento', icon: Heart, color: 'text-primary', bg: 'bg-primary/10' },
  escape: { label: 'Fuga', icon: Tent, color: 'text-secondary-foreground', bg: 'bg-secondary/20' },
  big_trip: { label: 'Viaggio', icon: Plane, color: 'text-accent-foreground', bg: 'bg-accent/30' },
};

function RitualItem({ type, ritual }: { type: string; ritual: RitualState }) {
  const c = config[type];
  const Icon = c.icon;

  const statusText = {
    ok: 'A posto',
    due: 'In scadenza',
    missing: 'Da pianificare',
  }[ritual.status];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${c.bg}`}>
        <Icon className={`h-5 w-5 ${c.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{c.label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {ritual.days_remaining !== null && ritual.days_remaining >= 0
            ? `Tra ${ritual.days_remaining} giorni`
            : ritual.days_remaining !== null
            ? `In ritardo di ${Math.abs(ritual.days_remaining)} giorni`
            : 'Mai fatto'}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          ritual.status === 'ok'
            ? 'bg-success/10 text-success'
            : ritual.status === 'due'
            ? 'bg-warning/10 text-warning-foreground'
            : 'bg-destructive/10 text-destructive'
        }`}
      >
        {statusText}
      </span>
    </div>
  );
}

export function RitualStatusCard({ state }: RitualStatusCardProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Regola 2/2/2
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Un appuntamento ogni 2 settimane, una fuga ogni 2 mesi, un viaggio ogni 2 anni.
        </p>
      </div>
      <div className="space-y-2">
        <RitualItem type="date" ritual={state.date} />
        <RitualItem type="escape" ritual={state.escape} />
        <RitualItem type="big_trip" ritual={state.big_trip} />
      </div>
    </div>
  );
}
