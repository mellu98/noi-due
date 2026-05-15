'use client';

import { useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation } from './BottomNavigation';
import { NotificationBell } from './NotificationBell';

interface AppShellProps {
  children: React.ReactNode;
}

const tabs = ['/', '/calendar', '/ideas', '/memories', '/settings'];

function getBaseTab(pathname: string): string {
  if (pathname === '/' || pathname.startsWith('/events') || pathname === '/notifications') return '/';
  if (pathname === '/calendar') return '/calendar';
  if (pathname === '/ideas') return '/ideas';
  if (pathname === '/memories') return '/memories';
  if (pathname === '/settings') return '/settings';
  return '/';
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return;
    }
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartRef.current.x - endX;
    const diffY = touchStartRef.current.y - endY;
    touchStartRef.current = null;

    if (Math.abs(diffY) > Math.abs(diffX)) return;
    if (Math.abs(diffX) < 80) return;

    const currentIndex = tabs.indexOf(getBaseTab(pathname));
    if (currentIndex === -1) return;

    if (diffX > 0) {
      const next = tabs[currentIndex + 1];
      if (next) router.push(next);
    } else {
      const prev = tabs[currentIndex - 1];
      if (prev) router.push(prev);
    }
  }

  return (
    <div
      className="mx-auto max-w-md min-h-screen flex flex-col bg-background relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="fixed top-4 right-4 z-50">
        <NotificationBell />
      </div>
      <main className="flex-1 px-4 pb-24 pt-6">{children}</main>
      <BottomNavigation />
    </div>
  );
}
