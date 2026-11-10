'use client';

import { useEffect, useRef, useState } from 'react';
import { useXo } from '@/components/xo/XoProvider';
import { prefersReducedMotion } from '@/lib/motion/scrollEngine';
import { HERO_PROMPTS } from '@/data/home';
import styles from './PromptBar.module.css';

/** The "ask XO" bar. Placeholders rotate through real questions so visitors see what XO can do. */
export default function PromptBar({ label = 'Ask XO', className = '' }) {
  const xo = useXo();
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const id = setInterval(() => {
      if (!document.hidden && document.activeElement !== inputRef.current) {
        setIndex((i) => (i + 1) % HERO_PROMPTS.length);
      }
    }, 3400);
    return () => clearInterval(id);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const value = inputRef.current.value.trim();
    inputRef.current.value = '';
    xo.openChat(value || HERO_PROMPTS[index]);
  };

  return (
    <form className={`${styles.bar} ${className}`} onSubmit={submit} role="search">
      <span className={styles.spark} aria-hidden="true" />
      <input ref={inputRef} type="text" aria-label={label} placeholder={HERO_PROMPTS[index]} autoComplete="off" />
      <button type="submit" className={styles.send}>
        <span>{label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20V4M5 11l7-7 7 7" /></svg>
      </button>
    </form>
  );
}
