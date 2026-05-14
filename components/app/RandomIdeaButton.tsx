'use client';

import { useState } from 'react';
import { DateIdea } from '@/types';
import { Shuffle, X } from 'lucide-react';
import { IdeaCard } from './IdeaCard';

interface RandomIdeaButtonProps {
  ideas: DateIdea[];
}

export function RandomIdeaButton({ ideas }: RandomIdeaButtonProps) {
  const [picked, setPicked] = useState<DateIdea | null>(null);

  function handlePick() {
    if (ideas.length === 0) return;
    const random = ideas[Math.floor(Math.random() * ideas.length)];
    setPicked(random);
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handlePick}
        disabled={ideas.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Shuffle className="h-4 w-4" />
        Pesca idea casuale
      </button>

      {picked && (
        <div className="relative">
          <button
            onClick={() => setPicked(null)}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <IdeaCard idea={picked} />
        </div>
      )}
    </div>
  );
}
