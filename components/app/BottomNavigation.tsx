'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Home, CalendarDays, Lightbulb, ImageIcon, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/calendar', label: 'Calendario', icon: CalendarDays },
  { href: '/ideas', label: 'Idee', icon: Lightbulb },
  { href: '/memories', label: 'Ricordi', icon: ImageIcon },
  { href: '/settings', label: 'Impostazioni', icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Prefetch all routes on mount for instant navigation
    links.forEach((link) => router.prefetch(link.href));
  }, [router]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto max-w-md flex justify-around py-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
