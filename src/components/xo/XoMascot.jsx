'use client';

import { useEffect, useRef } from 'react';
import { xoController } from '@/lib/xo/mascotController';
import styles from './XoMascot.module.css';

// Decorative rig layers: plain <img> keeps them out of the image optimiser, since they must stack pixel-perfect.
/* eslint-disable @next/next/no-img-element */
function Part({ name, className, children }) {
  return (
    <div className={`${styles.part} ${className || ''}`}>
      <img src={`/xo/xo-${name}.webp`} alt="" width="560" height="560" decoding="async" draggable="false" />
      {children}
    </div>
  );
}

export default function XoMascot({ onToggleChat, chatOpen }) {
  const rootRef = useRef(null);
  const tiltRef = useRef(null);
  const hitRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    xoController.attach({ root, tilt: tiltRef.current, hit: hitRef.current }, {
      bubble: (b) => window.dispatchEvent(new CustomEvent('xo:bubble', { detail: b })),
    });
    return () => xoController.detach();
  }, []);

  return (
    <div ref={rootRef} className={styles.xo}>
      <div ref={tiltRef} className={styles.tilt}>
        <div className={styles.trail} />
        <div className={styles.bob}>
          <div className={styles.cape}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="xoCape" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#4A027C" />
                  <stop offset="1" stopColor="#5C039B" />
                </linearGradient>
              </defs>
              <path fill="url(#xoCape)" d="M32 0 C 44 5 58 5 70 0 C 80 28 92 64 100 92 C 88 84 82 100 70 92 C 60 84 54 100 42 92 C 32 86 24 100 12 92 C 8 90 4 90 0 94 C 10 62 22 28 32 0 Z" />
            </svg>
          </div>
          <div className={`${styles.jet} ${styles.jetL}`} />
          <div className={`${styles.jet} ${styles.jetR}`} />
          <Part name="pack" />
          <Part name="leg-l" className={styles.legL} />
          <Part name="leg-r" className={styles.legR} />
          <Part name="arm-l" className={styles.armL} />
          <Part name="arm-r" className={styles.armR} />
          <Part name="torso" />
          <Part name="head" className={styles.head}>
            <i className={`${styles.lid} ${styles.lidL}`} />
            <i className={`${styles.lid} ${styles.lidR}`} />
          </Part>
          <button
            ref={hitRef}
            type="button"
            className={styles.hit}
            aria-label={chatOpen ? 'Close chat with XO' : 'Chat with XO, your property and mortgage assistant'}
            aria-expanded={chatOpen}
            onClick={onToggleChat}
            onPointerEnter={() => xoController.pose('wave')}
          />
        </div>
      </div>
    </div>
  );
}
