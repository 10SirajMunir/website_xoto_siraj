import Arrow from '@/components/ui/Arrow';
import SplitText from '@/components/ui/SplitText';
import PhaseLink from '@/components/ui/PhaseLink';
import { PARTNERS } from '@/data/home';
import styles from './PartnersSection.module.css';

export default function PartnersSection() {
  return (
    <section className={`section ${styles.section}`} aria-label="Partner with XOTO">
      <div className="wrap">
        <p className="eyebrow">Partner ecosystem</p>
        <SplitText className={`display h2 ${styles.title}`} parts="Built with the people who close deals." />
        <ul className={styles.list}>
          {PARTNERS.map((p, i) => (
            <li key={p.title} data-reveal style={{ '--i': i }}>
              <PhaseLink href={p.href} phase={6} page={p.title} className={styles.row}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                {p.soon
                  ? <span className={styles.soon}>Coming soon</span>
                  : <span className={styles.cta}>{p.cta} <Arrow /></span>}
              </PhaseLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
