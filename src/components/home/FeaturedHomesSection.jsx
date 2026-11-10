'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Arrow from '@/components/ui/Arrow';
import PhaseLink from '@/components/ui/PhaseLink';
import { buttonClass } from '@/components/ui/Button';
import XoStop from '@/components/xo/XoStop';
import useScrollScrub from '@/hooks/useScrollScrub';
import { clamp, range } from '@/lib/motion/scrollEngine';
import { FEATURED_HOMES } from '@/data/home';
import styles from './FeaturedHomesSection.module.css';

/** The picture opens up to full screen, then homes change behind a floating card as you scroll. */
export default function FeaturedHomesSection() {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const pinned = useRef(true);

  useScrollScrub(ref, (p) => {
    if (!pinned.current) return;
    const e = 1 - Math.pow(1 - range(p, 0, .2), 3);
    frameRef.current.style.transform = `scale(${.74 + .26 * e})`;
    const i = clamp(Math.floor(range(p, .12, 1) * FEATURED_HOMES.length), 0, FEATURED_HOMES.length - 1);
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActive(i);
    }
  }, {
    mode: 'pin',
    onMeasure: () => {
      pinned.current = window.innerWidth > 900;
      if (!pinned.current) frameRef.current.style.transform = '';
    },
  });

  const home = FEATURED_HOMES[active];

  return (
    <section ref={ref} className={styles.section} aria-labelledby="homes-title">
      <XoStop config={{ x: .9, y: .72, say: 'Every home shows its estimated monthly payment, so there are no surprises.', pose: 'point' }} />
      <div className={styles.stage}>
        <div ref={frameRef} className={styles.frame}>
          {FEATURED_HOMES.map((h, i) => (
            <div key={h.title} className={styles.image} data-on={i === active || undefined}>
              <Image src={h.image} alt="" fill sizes="100vw" quality={70} loading="lazy" style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        <div className={styles.card}>
          <h2 id="homes-title" className={`display ${styles.title}`}>Homes that fit, not just homes</h2>
          <div key={home.title} className={styles.detail}>
            <p className={styles.name}>{home.title}</p>
            <p className={styles.tag}>{home.tagline}</p>
            <dl className={styles.stats}>
              <div><dt>Price</dt><dd className="num">{home.price}</dd></div>
              <div><dt>Est. monthly</dt><dd className="num">{home.monthly}</dd></div>
            </dl>
          </div>
          <PhaseLink href="/properties" phase={4} page="Properties" className={buttonClass('primary', styles.cta)}>
            Explore homes <Arrow />
          </PhaseLink>
          <p className={`num ${styles.count}`}>
            <b>0{active + 1}</b> / 0{FEATURED_HOMES.length}
          </p>
          <p className="note">Sample homes for design review. Estimates, not offers.</p>
        </div>
      </div>
    </section>
  );
}
