'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import SplitText from '@/components/ui/SplitText';
import Button from '@/components/ui/Button';
import Arrow from '@/components/ui/Arrow';
import ChapterScreen from '@/components/home/ChapterScreen';
import XoStop from '@/components/xo/XoStop';
import { useXo } from '@/components/xo/XoProvider';
import useScrollScrub from '@/hooks/useScrollScrub';
import { clamp } from '@/lib/motion/scrollEngine';
import { CHAPTERS } from '@/data/home';
import styles from './XoInActionSection.module.css';

/** Pinned story: the list on the left advances with scroll while XO's chat changes on the right. */
export default function XoInActionSection() {
  const xo = useXo();
  const ref = useRef(null);
  const railRef = useRef(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useScrollScrub(ref, (p) => {
    if (railRef.current) railRef.current.style.transform = `scaleY(${p})`;
    const i = clamp(Math.floor(p * CHAPTERS.length), 0, CHAPTERS.length - 1);
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActive(i);
    }
  }, { mode: 'pin' });

  const jump = (i) => {
    const r = ref.current.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    window.scrollTo({ top: window.scrollY + r.top + span * ((i + .08) / CHAPTERS.length), behavior: 'smooth' });
  };

  return (
    <section ref={ref} className={styles.section} aria-labelledby="xo-action-title">
      <XoStop config={{ anchor: '#xo-device', ax: .92, say: 'This is me at work. Scroll and watch.', pose: 'point', phone: true }} />
      <div className={styles.stage}>
        <div className={`wrap ${styles.grid}`}>
          <div className={styles.left}>
            <p className="eyebrow">XO in action</p>
            <SplitText className={`display h2 ${styles.title}`} parts="We don't just talk. XO gets it done." />
            <span id="xo-action-title" className="sr-only">XO in action</span>
            <div className={styles.list}>
              <div className={styles.rail} aria-hidden="true"><i ref={railRef} /></div>
              {CHAPTERS.map((c, i) => (
                <div key={c.title} className={styles.item} data-active={i === active || undefined}>
                  <button type="button" className={styles.itemHead} onClick={() => jump(i)} aria-current={i === active ? 'step' : undefined}>
                    <span className={`num ${styles.index}`}>0{i + 1}</span>
                    <span className={styles.itemTitle}>{c.title}</span>
                  </button>
                  <div className={styles.itemBody}>
                    <div>
                      <p>{c.text}</p>
                      <Button variant="ghost" className={styles.try} onClick={() => xo.openChat(c.prompt)}>Try it with XO <Arrow /></Button>
                    </div>
                  </div>
                  <div className={styles.inlineDevice}><ChapterScreen screen={c.screen} /></div>
                </div>
              ))}
            </div>
          </div>

          <div id="xo-device" className={styles.device}>
            <div className={styles.deviceHead}>
              <span className={styles.avatar}><Image src="/xo/xo-full.webp" alt="" width={800} height={800} sizes="60px" /></span>
              <b>XO</b>
              <span className={styles.status}>Online</span>
            </div>
            <div className={styles.deck}>
              {CHAPTERS.map((c, i) => (
                <div key={c.screen} className={styles.card} data-state={i === active ? 'on' : i < active ? 'past' : 'next'} aria-hidden={i !== active}>
                  <ChapterScreen screen={c.screen} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
