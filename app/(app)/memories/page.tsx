export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MemoryCard } from '@/components/app/MemoryCard';
import { EmptyState } from '@/components/app/EmptyState';
import { ImageOff } from 'lucide-react';

export default async function MemoriesPage() {
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

  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('couple_id', member.couple_id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Ricordi</h1>

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
          description="Completate un evento e aggiungete un ricordo per iniziare la vostra collezione."
        />
      )}
    </div>
  );
}
