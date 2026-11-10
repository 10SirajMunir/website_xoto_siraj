'use client';

import { useRef } from 'react';
import SplitText from '@/components/ui/SplitText';
import useScrollScrub from '@/hooks/useScrollScrub';
import { range } from '@/lib/motion/scrollEngine';
import { FACTS, TOOLS } from '@/data/home';
import styles from './EcosystemSection.module.css';

/** A line draws through the four tools as you scroll, showing one deal flowing through them all. */
export default function EcosystemSection() {
  const ref = useRef(null);
  const pathRef = useRef(null);
  const nodes = useRef([]);

  useScrollScrub(ref, (p) => {
    const t = range(p, .16, .52);
    pathRef.current.style.strokeDashoffset = String(1 - t);
    nodes.current.forEach((el, i) => el?.toggleAttribute('data-on', t >= i / TOOLS.length));
  });

  return (
    <section ref={ref} className={`section ${styles.section}`} aria-labelledby="eco-title">
      <div className="wrap">
        <p className="eyebrow">Scalable. AI-powered. Asset-light.</p>
        <SplitText className={`display h1 ${styles.title}`} parts="Four tools. One connected journey." />
        <span id="eco-title" className="sr-only">The XOTO ecosystem</span>
        <p className={`lead ${styles.lead}`} data-reveal>One deal flows through all four, with nothing re-entered.</p>

        <div className={styles.flow}>
          <svg className={styles.line} viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="flowLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#03A4F4" />
                <stop offset="1" stopColor="#64EF0A" />
              </linearGradient>
            </defs>
            <path d="M0 40 C 80 -10 170 90 250 40 S 420 -10 500 40 S 670 90 750 40 S 920 -10 1000 40" fill="none" stroke="rgba(92,3,155,.1)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            <path ref={pathRef} className={styles.linePath} d="M0 40 C 80 -10 170 90 250 40 S 420 -10 500 40 S 670 90 750 40 S 920 -10 1000 40" pathLength="1" fill="none" stroke="url(#flowLine)" strokeWidth="4" vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className={styles.tools}>
            {TOOLS.map((tool, i) => (
              <li key={tool.name} ref={(el) => { nodes.current[i] = el; }} className={styles.tool}>
                <span className={styles.dot} aria-hidden="true" />
                <h3>{tool.name}</h3>
                <p>{tool.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <dl className={styles.facts}>
          {FACTS.map((f, i) => (
            <div key={f.label} data-reveal style={{ '--i': i }}>
              <dd className={`num ${styles.value}`}>{f.value}</dd>
              <dt>{f.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
