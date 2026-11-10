'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { prefersReducedMotion } from '@/lib/motion/scrollEngine';

/** Reveals every [data-reveal] and [data-split] element on the page, so sections can stay server components. */
export default function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const items = document.querySelectorAll('[data-reveal],[data-split]');
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
