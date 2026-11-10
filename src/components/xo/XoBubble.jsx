'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { xoController } from '@/lib/xo/mascotController';
import styles from './XoBubble.module.css';

export default function XoBubble({ onOpenChat }) {
  const [bubble, setBubble] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const onBubble = (e) => setBubble(e.detail);
    window.addEventListener('xo:bubble', onBubble);
    return () => window.removeEventListener('xo:bubble', onBubble);
  }, []);

  useLayoutEffect(() => {
    if (bubble && ref.current) {
      ref.current.dataset.on = 'true';
      xoController.bubbleRendered(ref.current);
    } else if (ref.current) {
      delete ref.current.dataset.on;
    }
  }, [bubble]);

  return (
    <div ref={ref} className={styles.bubble} role="status" aria-live="polite">
      {bubble && (
        <div className={styles.inner}>
          <span>{bubble.text}</span>
          {bubble.cta && (
            <button type="button" className={styles.cta} onClick={() => onOpenChat(bubble.prompt)}>
              {bubble.cta}
            </button>
          )}
          <button type="button" className={styles.close} aria-label="Dismiss message" onClick={() => xoController.dismissBubble()}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
