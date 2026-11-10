'use client';

import { useEffect, useRef } from 'react';
import { addScrub } from '@/lib/motion/scrollEngine';

/** Calls fn(progress) as the referenced element moves through the viewport. See scrollEngine for modes. */
export default function useScrollScrub(ref, fn, options = {}) {
  const latest = useRef({ fn, options });

  useEffect(() => {
    latest.current = { fn, options };
  });

  useEffect(() => {
    if (!ref.current) return undefined;
    return addScrub(ref.current, (p) => latest.current.fn(p), {
      mode: latest.current.options.mode,
      onMeasure: () => latest.current.options.onMeasure?.(),
    });
  }, [ref]);
}
