import { CalendarEvent } from '@/types';
import { Banknote, Wallet } from 'lucide-react';

interface BudgetSummaryCardProps {
  events: CalendarEvent[];
}

export function BudgetSummaryCard({ events }: BudgetSummaryCardProps) {
  const withBudget = events.filter((e) => e.budget && e.budget > 0);
  const total = withBudget.reduce((sum, e) => sum + (e.budget || 0), 0);

  const byType: Record<string, number> = {};
  withBudget.forEach((e) => {
    byType[e.type] = (byType[e.type] || 0) + (e.budget || 0);
  });

  const typeLabels: Record<string, string> = {
    date: 'Appuntamenti',
    escape: 'Fughe',
    big_trip: 'Viaggi',
    custom: 'Altro',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Budget totale pianificato</p>
          <p className="text-xl font-bold text-foreground">{total.toLocaleString('it-IT')} €</p>
        </div>
      </div>

      {Object.entries(byType).length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Per categoria</h3>
          <div className="space-y-2">
            {Object.entries(byType).map(([type, amount]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Banknote className="h-4 w-4" />
                  {typeLabels[type] || type}
                </span>
                <span className="text-sm font-medium text-foreground">{amount.toLocaleString('it-IT')} €</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {withBudget.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nessun evento con budget pianificato.
        </p>
      )}
    </div>
  );
}
