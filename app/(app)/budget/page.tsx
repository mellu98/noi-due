export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BudgetSummaryCard } from '@/components/app/BudgetSummaryCard';
import { EmptyState } from '@/components/app/EmptyState';
import { Banknote } from 'lucide-react';

export default async function BudgetPage() {
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
    .order('start_date', { ascending: false });

  const withBudget = events?.filter((e) => e.budget && e.budget > 0) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Budget</h1>

      {withBudget.length > 0 ? (
        <BudgetSummaryCard events={events ?? []} />
      ) : (
        <EmptyState
          icon={Banknote}
          title="Nessun budget"
          description="Aggiungete un budget agli eventi per tenere traccia delle vostre spese pianificate."
        />
      )}
    </div>
  );
}
