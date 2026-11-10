import SplitText from '@/components/ui/SplitText';
import XoStop from '@/components/xo/XoStop';
import { LANGUAGES } from '@/data/languages';
import styles from './LanguagesSection.module.css';

const Row = ({ items, reverse }) => (
  <div className={styles.row} data-reverse={reverse || undefined} aria-hidden="true">
    {[0, 1].map((copy) => (
      <div key={copy} className={styles.set}>
        {items.map((l) => <span key={l}>{l}</span>)}
      </div>
    ))}
  </div>
);

export default function LanguagesSection() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="languages-title">
      <XoStop config={{ x: .14, y: .3, say: 'Marhaba! Namaste! Bonjour! Pick a language and keep your chat.', pose: 'cheer', phone: true }} />
      <div className={`wrap ${styles.head}`}>
        <p className="eyebrow">Speak it. Type it.</p>
        <SplitText as="h2" className={`display ${styles.title}`} parts="Your language. Your way." />
        <p id="languages-title" className="lead" data-reveal>Talk naturally and XO replies by voice, on any phone, tablet or laptop. Switch language any time. Your chat stays.</p>
        <p className="sr-only">XO speaks {LANGUAGES.length} languages: {LANGUAGES.join(', ')}.</p>
      </div>
      <div className={styles.marquee}>
        <Row items={LANGUAGES.slice(0, 11)} />
        <Row items={LANGUAGES.slice(11)} reverse />
      </div>
    </section>
  );
}
