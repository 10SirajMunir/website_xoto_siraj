'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Arrow from '@/components/ui/Arrow';
import SplitText from '@/components/ui/SplitText';
import PhaseLink from '@/components/ui/PhaseLink';
import useScrollScrub from '@/hooks/useScrollScrub';
import { SERVICES } from '@/data/home';
import styles from './ServicesSection.module.css';

/** Vertical scroll drives a horizontal track. Phones get a native swipe row instead. */
export default function ServicesSection() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const overflow = useRef(0);

  useScrollScrub(ref, (p) => {
    if (overflow.current > 0) trackRef.current.style.transform = `translate3d(${-overflow.current * p}px,0,0)`;
  }, {
    mode: 'pin',
    onMeasure: () => {
      const pinned = window.innerWidth > 900;
      overflow.current = pinned ? trackRef.current.scrollWidth - window.innerWidth : 0;
      if (!pinned) trackRef.current.style.transform = '';
    },
  });

  return (
    <section ref={ref} className={styles.section} aria-label="Our services">
      <div className={styles.stage}>
        <div ref={trackRef} className={styles.track}>
          <div className={styles.intro}>
            <p className="eyebrow">One platform</p>
            <SplitText className={`display ${styles.title}`} parts="Everything you need for your property journey." />
            <p className="lead">Search, finance and home transformation, on one intelligent platform.</p>
          </div>
          {SERVICES.map((s) => (
            <PhaseLink key={s.n} href={s.href} phase={s.phase} page={s.page} className={styles.card}>
              <div className={styles.media}>
                <Image src={s.image} alt="" fill sizes="(max-width: 900px) 80vw, 34vw" quality={70} loading="lazy" style={{ objectFit: 'cover' }} />
              </div>
              <div className={styles.body}>
                <span className={`num ${styles.n}`}>{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className={styles.go}><Arrow /></span>
              </div>
            </PhaseLink>
          ))}
        </div>
      </div>
    </section>
  );
}
