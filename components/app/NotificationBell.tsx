'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const res = await fetch(`/api/notifications?user_id=${user.id}&unread=true`);
    if (!res.ok) return;
    const data = await res.json();
    setCount(data.notifications?.length || 0);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => router.push('/notifications')}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
