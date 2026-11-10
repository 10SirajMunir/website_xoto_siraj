import Image from 'next/image';
import styles from './ChapterScreen.module.css';

const Row = ({ k, v, strong }) => (
  <div className={styles.row} data-strong={strong || undefined}><span>{k}</span><b className="num">{v}</b></div>
);

const SCREENS = {
  eligibility: {
    ask: 'I earn AED 30,000 a month with AED 3,000 in loans.',
    body: (
      <>
        <span className={styles.chip}>Eligible</span>
        <p className={styles.big}><span className="num">AED 2,158,924</span></p>
        <p className="note">You could borrow up to</p>
        <div className={styles.rows}>
          <Row k="Property price supported" v="AED 2,698,655" />
          <Row k="Monthly payment" v="AED 12,000" />
          <Row k="Debt burden after loan" v="50%" />
        </div>
      </>
    ),
  },
  homes: {
    ask: 'Show me homes in my budget.',
    body: (
      <>
        <p className={styles.head}>3 sample matches under AED 2.7M</p>
        <ul className={styles.homes}>
          {[
            ['/images/thumb-1.webp', '2 bed, Dubai Marina', 'AED 2.40M', 'AED 10,672 / mo'],
            ['/images/thumb-2.webp', '3 bed, Yas Island', 'AED 2.65M', 'AED 11,783 / mo'],
            ['/images/thumb-3.webp', '1 bed, Business Bay', 'AED 1.85M', 'AED 8,226 / mo'],
          ].map(([src, name, price, monthly]) => (
            <li key={name}>
              <Image src={src} alt="" width={240} height={240} sizes="60px" />
              <div><b>{name}</b><span className="num">{price}</span></div>
              <span className={`num ${styles.monthly}`}>{monthly}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  costs: {
    ask: 'What will the Marina home really cost me upfront?',
    body: (
      <>
        <p className={styles.head}>Upfront on AED 2,400,000 in Dubai</p>
        <div className={styles.rows}>
          <Row k="Down payment (20%)" v="480,000" />
          <Row k="DLD registration (4%)" v="96,000" />
          <Row k="Agent fee (2%)" v="48,000" />
          <Row k="Bank fee, up to 1%" v="19,200" />
          <Row k="Mortgage registration" v="4,800" />
          <Row k="Trustee fee" v="4,200" />
          <Row k="Cash needed" v="AED 652,200" strong />
        </div>
      </>
    ),
  },
  advisor: {
    ask: 'Can I speak to someone about this?',
    body: (
      <>
        <p className={styles.head}>Of course. Please check your details.</p>
        <div className={styles.rows}>
          <Row k="Name" v="Your name" />
          <Row k="Number" v="+971 5X XXX XXXX" />
          <Row k="Language" v="Arabic" />
        </div>
        <div className={styles.confirm}>Confirm callback</div>
        <p className={`note ${styles.center}`}>Your request goes to the right XOTO team.</p>
      </>
    ),
  },
};

/** A still of XO's chat for one chapter. Figures are samples, marked as estimates. */
export default function ChapterScreen({ screen }) {
  const { ask, body } = SCREENS[screen];
  return (
    <div className={styles.screen}>
      <p className={styles.ask}>{ask}</p>
      <div className={styles.answer}>{body}</div>
      <p className={styles.foot}>Sample conversation. Estimates, not offers.</p>
    </div>
  );
}
