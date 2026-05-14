import { DateIdea } from '@/types';
import { Lightbulb, MapPin, Banknote, Clock } from 'lucide-react';

const levelLabels: Record<string, string> = {
  chill: 'Relax',
  romantic: 'Romantico',
  adventure: 'Avventura',
  home: 'A casa',
  surprise: 'Sorpresa',
};

const levelColors: Record<string, string> = {
  chill: 'bg-muted text-muted-foreground',
  romantic: 'bg-primary/10 text-primary',
  adventure: 'bg-secondary/20 text-secondary-foreground',
  home: 'bg-accent/30 text-accent-foreground',
  surprise: 'bg-warning/10 text-warning-foreground',
};

interface IdeaCardProps {
  idea: DateIdea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">{idea.title}</h3>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            levelColors[idea.level] || levelColors.chill
          }`}
        >
          {levelLabels[idea.level] || idea.level}
        </span>
      </div>

      {idea.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {idea.category && <span className="rounded-md bg-muted px-2 py-0.5">{idea.category}</span>}
        {idea.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {idea.location}
          </span>
        )}
        {idea.estimated_budget && (
          <span className="flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5" />
            {idea.estimated_budget} €
          </span>
        )}
        {idea.estimated_duration && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {idea.estimated_duration}
          </span>
        )}
      </div>
    </div>
  );
}
