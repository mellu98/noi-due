import { Memory } from '@/types';
import { formatDate } from '@/lib/utils/dates';
import { ImageOff } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      {memory.photo_url ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl">
          <img
            src={memory.photo_url}
            alt={memory.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="mt-3">
        <h3 className="font-semibold text-foreground">{memory.title}</h3>
        {memory.note && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{memory.note}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">{formatDate(memory.created_at)}</p>
      </div>
    </div>
  );
}
