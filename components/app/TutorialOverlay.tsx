'use client';

import { useState, useEffect } from 'react';
import { Heart, CalendarDays, Lightbulb, ImageIcon, Bell, X, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: Heart,
    title: 'Benvenuti su NoiDue',
    description: 'La vostra app privata per pianificare tempo di qualità insieme e custodire i momenti speciali.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: CalendarDays,
    title: 'La regola 2/2/2',
    description: 'Ogni 2 settimane un appuntamento, ogni 2 mesi una piccola fuga, ogni 2 anni un viaggio da sogno.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Lightbulb,
    title: 'Idee e Calendario',
    description: 'Aggiungete eventi al calendario condiviso, create checklist e scoprite nuove idee per i vostri appuntamenti.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: ImageIcon,
    title: 'Ricordi',
    description: 'Quando completate un evento, salvate foto e note per conservare per sempre il ricordo di quel momento.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Bell,
    title: 'Rimanete connessi',
    description: 'Ricevete notifiche quando il vostro partner aggiunge eventi, idee o ricordi. Sempre aggiornati, sempre insieme.',
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
  },
];

const STORAGE_KEY = 'noi-due-tutorial-seen';

export function TutorialOverlay() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    }
  }, []);

  function close() {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }

  function next() {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else close();
  }

  if (!open) return null;

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl">
        <div className="flex justify-end">
          <button
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${current.bg}`}>
            <Icon className={`h-8 w-8 ${current.color}`} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-foreground">{current.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.description}</p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 rounded-xl border border-border bg-background py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Indietro
            </button>
          )}
          <button
            onClick={next}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            {step === steps.length - 1 ? 'Inizia' : 'Avanti'}
            {step < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
