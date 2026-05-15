'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CalendarEvent, EventChecklistItem, Memory } from '@/types';
import { formatDateTime } from '@/lib/utils/dates';
import { Loader2, Check, Trash2, ImagePlus } from 'lucide-react';
import Link from 'next/link';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [checklist, setChecklist] = useState<EventChecklistItem[]>([]);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryNote, setMemoryNote] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/events/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setChecklist(data.checklist || []);
        setMemory(data.memory);
        if (data.memory) {
          setMemoryTitle(data.memory.title);
          setMemoryNote(data.memory.note || '');
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function toggleChecklist(item: EventChecklistItem) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const res = await fetch(`/api/checklist/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: !item.is_done, user_id: userId }),
    });
    if (res.ok) {
      const data = await res.json();
      setChecklist((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
    }
  }

  async function markDone() {
    if (!event) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSaving(false);
      return;
    }

    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done', user_id: userId }),
    });
    if (res.ok) {
      setEvent({ ...event, status: 'done' });
    }
    setSaving(false);
  }

  async function saveMemory() {
    if (!event) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    let photoUrl: string | null = memory?.photo_url ?? null;

    if (photoFile) {
      const filePath = `${event.couple_id}/${event.id}/${Date.now()}-${photoFile.name}`;
      const { error: upError } = await supabase.storage
        .from('memories')
        .upload(filePath, photoFile);
      if (!upError) {
        const { data: urlData } = supabase.storage.from('memories').getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }
    }

    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: memory?.id,
        couple_id: event.couple_id,
        event_id: event.id,
        title: memoryTitle,
        note: memoryNote,
        photo_url: photoUrl,
        user_id: userId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setMemory(data.memory);
    }
    setSaving(false);
  }

  async function deleteEvent() {
    if (!event) return;
    if (!confirm('Eliminare questo evento?')) return;
    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/calendar');
    }
  }

  if (loading) return <div className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!event) return <p className="text-center text-muted-foreground">Evento non trovato.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
            {event.type}
          </span>
          <h1 className="mt-2 text-xl font-bold text-foreground">{event.title}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(event.start_date)}</p>
        </div>
        <button
          onClick={deleteEvent}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {event.location && (
        <p className="text-sm text-muted-foreground">📍 {event.location}</p>
      )}
      {event.budget && (
        <p className="text-sm text-muted-foreground">💶 Budget: {event.budget} €</p>
      )}
      {event.description && (
        <p className="text-sm text-foreground">{event.description}</p>
      )}

      {event.status !== 'done' && (
        <button
          onClick={markDone}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-semibold text-success-foreground shadow-sm"
        >
          <Check className="h-4 w-4" />
          Segna come completato
        </button>
      )}

      {checklist.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Checklist
          </h2>
          <div className="space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklist(item)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  item.is_done
                    ? 'border-border bg-muted text-muted-foreground line-through'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    item.is_done ? 'border-success bg-success text-success-foreground' : 'border-muted-foreground'
                  }`}
                >
                  {item.is_done && <Check className="h-3.5 w-3.5" />}
                </div>
                <span className="text-sm">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {event.status === 'done' && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Ricordo
          </h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Titolo</label>
            <input
              type="text"
              value={memoryTitle}
              onChange={(e) => setMemoryTitle(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
              placeholder="Un titolo per il ricordo..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Nota</label>
            <textarea
              rows={3}
              value={memoryNote}
              onChange={(e) => setMemoryNote(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
              placeholder="Come è andata?..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Foto</label>
            {memory?.photo_url && (
              <img src={memory.photo_url} alt="" className="mb-2 h-32 w-full rounded-xl object-cover" />
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
              <ImagePlus className="h-4 w-4" />
              {photoFile ? photoFile.name : 'Carica una foto'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <button
            onClick={saveMemory}
            disabled={saving}
            className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : memory ? 'Aggiorna ricordo' : 'Salva ricordo'}
          </button>
        </div>
      )}

      <Link href="/calendar" className="block text-center text-sm text-muted-foreground hover:text-foreground">
        ← Torna al calendario
      </Link>
    </div>
  );
}
