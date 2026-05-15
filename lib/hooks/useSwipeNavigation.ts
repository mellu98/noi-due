import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const routes = ['/', '/calendar', '/ideas', '/memories', '/settings'];
const SWIPE_THRESHOLD = 80;
const VERTICAL_TOLERANCE = 50;

export function useSwipeNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const start = touchStart.current;
      const end = e.changedTouches[0];
      const dx = end.clientX - start.x;
      const dy = end.clientY - start.y;
      touchStart.current = null;

      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      if (Math.abs(dy) > VERTICAL_TOLERANCE) return;

      const idx = routes.indexOf(pathname);
      if (idx === -1) return;

      if (dx < 0 && idx < routes.length - 1) {
        router.push(routes[idx + 1]);
      } else if (dx > 0 && idx > 0) {
        router.push(routes[idx - 1]);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [pathname, router]);
}
