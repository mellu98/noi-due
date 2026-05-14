'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export default function NewEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'date' | 'escape' | 'big_trip' | 'custom'>('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState<string[]>(['']);
  const [error, setError] = useState('');

  function addChecklistItem() {
    setChecklist([...checklist, '']);
  }

  function removeChecklistItem(index: number) {
    setChecklist(checklist.filter((_, i) => i !== index));
  }

  function updateChecklistItem(index: number, value: string) {
    const next = [...checklist];
    next[index] = value;
    setChecklist(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError('Sessione scaduta.');
      setLoading(false);
      return;
    }

    const { data: member } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', userData.user.id)
      .single();

    if (!member) {
      setError('Non fai parte di una coppia.');
      setLoading(false);
      return;
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        couple_id: member.couple_id,
        title,
        type,
        start_date: startDate,
        end_date: endDate || null,
        location: location || null,
        budget: budget ? parseFloat(budget) : null,
        description: description || null,
        status: 'planned',
        created_by: userData.user.id,
      })
      .select()
      .single();

    if (eventError || !event) {
      setError(eventError?.message || 'Errore nella creazione.');
      setLoading(false);
      return;
    }

    const validItems = checklist.map((t) => t.trim()).filter(Boolean);
    if (validItems.length > 0) {
      await supabase.from('event_checklist_items').insert(
        validItems.map((text) => ({
          event_id: event.id,
          text,
        }))
      );
    }

    router.push('/calendar');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Nuovo evento</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Titolo</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            placeholder="Titolo dell'evento"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
          >
            <option value="date">Appuntamento</option>
            <option value="escape">Fuga</option>
            <option value="big_trip">Viaggio</option>
            <option value="custom">Altro</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Inizio</label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Fine (opz.)</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Luogo</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            placeholder="Dove si svolge?"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Budget (€)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Descrizione</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
            placeholder="Note aggiuntive..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Checklist</label>
          {checklist.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateChecklistItem(index, e.target.value)}
                className="flex-1 rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2"
                placeholder="Aggiungi un task..."
              />
              {checklist.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChecklistItem(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addChecklistItem}
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            <Plus className="h-4 w-4" />
            Aggiungi task
          </button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salva evento'}
        </button>
      </form>
    </div>
  );
}
