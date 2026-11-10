'use client';

import { useRef } from 'react';
import Image from 'next/image';
import useScrollScrub from '@/hooks/useScrollScrub';
import { range } from '@/lib/motion/scrollEngine';
import styles from './StatementSection.module.css';

const SENTENCE = [
  'From', 'the', 'first', { image: '/images/pill-search.webp' }, 'search', 'to', 'the', { image: '/images/pill-mortgage.webp' }, 'mortgage',
  'to', 'the', 'day', 'you', 'get', 'your', { image: '/images/pill-keys.webp' }, 'keys,', 'XOTO', 'keeps', 'every', 'step', 'in', 'one', 'place.',
];

/** The sentence fills in word by word as it travels through the viewport. */
export default function StatementSection() {
  const ref = useRef(null);
  const items = useRef([]);
  const lit = useRef(0);

  useScrollScrub(ref, (p) => {
    const count = Math.round(range(p, .24, .58) * items.current.length);
    if (count === lit.current) return;
    items.current.forEach((el, i) => el?.toggleAttribute('data-on', i < count));
    lit.current = count;
  });

  return (
    <section ref={ref} className={`section ${styles.section}`}>
      <div className="wrap">
        <p className="eyebrow">What we do</p>
        <h2 className={styles.text}>
          {SENTENCE.map((item, i) => {
            const set = (el) => { items.current[i] = el; };
            if (item.image) {
              return (
                <span key={item.image} ref={set} className={styles.pill} aria-hidden="true">
                  <Image src={item.image} alt="" width={280} height={160} sizes="128px" />
                </span>
              );
            }
            return <span key={`${item}-${i}`}><span ref={set} className={styles.word}>{item}</span> </span>;
          })}
        </h2>
      </div>
    </section>
  );
}
