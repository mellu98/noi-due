'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DateIdea } from '@/types';
import { IdeaCard } from '@/components/app/IdeaCard';
import { RandomIdeaButton } from '@/components/app/RandomIdeaButton';
import { EmptyState } from '@/components/app/EmptyState';
import { Loader2, Lightbulb, Plus, X } from 'lucide-react';

export default function IdeasPage() {
  const supabase = createClient();
  const [ideas, setIdeas] = useState<DateIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cena');
  const [level, setLevel] = useState<DateIdea['level']>('romantic');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const res = await fetch(`/api/ideas?user_id=${userData.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.ideas || []);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: member } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', userData.user.id)
      .single();
    if (!member) return;

    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        couple_id: member.couple_id,
        title,
        category,
        level,
        estimated_budget: estimatedBudget ? parseFloat(estimatedBudget) : null,
        estimated_duration: estimatedDuration || null,
        location: location || null,
        description: description || null,
        user_id: userData.user.id,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.idea) {
        setIdeas([data.idea, ...ideas]);
      }
      setShowForm(false);
      setTitle('');
      setEstimatedBudget('');
      setEstimatedDuration('');
      setLocation('');
      setDescription('');
    }
    setSaving(false);
  }

  if (loading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Idee</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Chiudi' : 'Nuova'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            placeholder="Titolo idea"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            >
              {['Cena', 'Cinema', 'Spa', 'Weekend', 'Picnic', 'Gita', 'Serata a casa', 'Degustazione', 'Evento', 'Viaggio'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as DateIdea['level'])}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            >
              <option value="chill">Relax</option>
              <option value="romantic">Romantico</option>
              <option value="adventure">Avventura</option>
              <option value="home">A casa</option>
              <option value="surprise">Sorpresa</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={0}
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
              placeholder="Budget €"
            />
            <input
              type="text"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
              placeholder="Durata (es. 3 ore)"
            />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            placeholder="Luogo"
          />
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            placeholder="Descrizione..."
          />
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salva idea'}
          </button>
        </form>
      )}

      <RandomIdeaButton ideas={ideas} />

      {ideas.length > 0 ? (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title="Nessuna idea"
          description="Aggiungete le vostre idee per non rimanere mai senza ispirazione."
        />
      )}
    </div>
  );
}
