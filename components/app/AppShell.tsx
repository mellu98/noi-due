'use client';

import { BottomNavigation } from './BottomNavigation';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto max-w-md min-h-screen flex flex-col bg-background">
      <main className="flex-1 px-4 pb-24 pt-6">{children}</main>
      <BottomNavigation />
    </div>
  );
}
