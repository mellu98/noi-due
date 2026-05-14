'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    async function run() {
      const l: string[] = [];
      const supabase = createClient();

      l.push('=== localStorage keys ===');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key);
          l.push(`${key}: ${val ? val.substring(0, 100) + '...' : 'null'}`);
        }
      }

      l.push('=== getSession ===');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      l.push(`session error: ${sessionError?.message ?? 'none'}`);
      l.push(`session present: ${!!sessionData.session}`);
      if (sessionData.session) {
        l.push(`access_token prefix: ${sessionData.session.access_token.substring(0, 20)}...`);
        l.push(`expires_at: ${sessionData.session.expires_at}`);
      }

      l.push('=== getUser ===');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      l.push(`user error: ${userError?.message ?? 'none'}`);
      l.push(`user present: ${!!userData.user}`);
      if (userData.user) {
        l.push(`user id: ${userData.user.id}`);
        l.push(`user email: ${userData.user.email}`);
      }

      setLogs(l);
    }
    run();
  }, []);

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Debug Auth</h1>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        className="rounded-xl bg-destructive px-4 py-2 text-white"
      >
        Pulisci localStorage & Ricarica
      </button>
      <pre className="rounded-xl bg-muted p-4 text-xs overflow-auto whitespace-pre-wrap">
        {logs.join('\n')}
      </pre>
    </div>
  );
}
