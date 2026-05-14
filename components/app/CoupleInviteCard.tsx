'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CoupleInviteCardProps {
  inviteCode: string;
}

export function CoupleInviteCard({ inviteCode }: CoupleInviteCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="text-sm text-muted-foreground">Codice invito della coppia</p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <code className="rounded-lg bg-muted px-3 py-1.5 text-lg font-bold tracking-widest text-foreground">
          {inviteCode}
        </code>
        <button
          onClick={handleCopy}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
