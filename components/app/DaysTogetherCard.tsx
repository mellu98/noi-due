import { Heart } from 'lucide-react';

interface DaysTogetherCardProps {
  createdAt: string;
}

export function DaysTogetherCard({ createdAt }: DaysTogetherCardProps) {
  const start = new Date(createdAt).getTime();
  const now = Date.now();
  const days = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-500/10">
        <Heart className="h-6 w-6 text-rose-500" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{days}</p>
        <p className="text-xs text-muted-foreground">
          {days === 1 ? 'giorno insieme' : 'giorni insieme'}
        </p>
      </div>
    </div>
  );
}
