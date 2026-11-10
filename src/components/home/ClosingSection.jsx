'use client';

import Image from 'next/image';
import PromptBar from '@/components/ui/PromptBar';
import SplitText from '@/components/ui/SplitText';
import XoStop from '@/components/xo/XoStop';
import { useXo } from '@/components/xo/XoProvider';
import { ASK_TOPICS } from '@/data/home';
import styles from './ClosingSection.module.css';

export default function ClosingSection() {
  const xo = useXo();

  return (
    <section className={styles.section} aria-label="Start with XO">
      <XoStop config={{ anchor: '#xo-closing-spot', fit: true, say: 'This is where you come in. What would you like to know?', pose: 'wave' }} />
      <div className={styles.panel} data-reveal="scale">
        <div className={styles.copy}>
          <SplitText className={`display ${styles.title}`} parts="Your first question is one message away." />
          <PromptBar className={styles.prompt} />
          <div className={styles.topics}>
            <span>People also ask about</span>
            {ASK_TOPICS.map((t) => (
              <button key={t} type="button" onClick={() => xo.openChat(`Tell me about ${t}`)}>{t}</button>
            ))}
          </div>
        </div>
        {/* Stands in for XO on phones and when XO is elsewhere; XO flies into this spot on larger screens. */}
        <div id="xo-closing-spot" className={styles.figure} aria-hidden="true">
          <Image src="/xo/xo-full.webp" alt="" width={800} height={800} sizes="(max-width: 900px) 240px, 34vw" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
