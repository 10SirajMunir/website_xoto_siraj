import Arrow from '@/components/ui/Arrow';
import PhaseLink from '@/components/ui/PhaseLink';
import SplitText from '@/components/ui/SplitText';
import { buttonClass } from '@/components/ui/Button';
import { HERO } from '@/data/home';
import HeroVideo from './HeroVideo';
import HeroCity from './HeroCity';
import styles from './HeroSection.module.css';

/**
 * Landing hero: the skyline video at low opacity, the two headings on the left and the
 * interactive Downtown model on the right, where XO lands on the Burj Khalifa's spire.
 * Everything a search engine needs (headings, links) is plain HTML rendered on the server.
 */
export default function HeroSection() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <HeroVideo />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`eyebrow ${styles.intro}`}>{HERO.eyebrow}</p>
          <SplitText as="h1" className={`display ${styles.title}`} parts={HERO.title} reveal={false} />
          <h2 className={`${styles.subtitle} ${styles.intro}`} style={{ '--i': 4 }}>{HERO.subtitle}</h2>
          <div className={`${styles.actions} ${styles.intro}`} style={{ '--i': 6 }}>
            {HERO.actions.map((a) => (
              <PhaseLink key={a.label} href={a.href} phase={a.phase} page={a.page} className={buttonClass(a.variant, styles[a.variant])}>
                {a.label}
                {a.variant === 'primary' && <Arrow />}
              </PhaseLink>
            ))}
          </div>
          <ul className={`${styles.features} ${styles.intro}`} style={{ '--i': 8 }}>
            {HERO.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
        <div className={styles.model}>
          <HeroCity pins={HERO.pins} />
        </div>
      </div>
    </section>
  );
}
