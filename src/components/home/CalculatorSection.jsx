'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Arrow from '@/components/ui/Arrow';
import SplitText from '@/components/ui/SplitText';
import XoStop from '@/components/xo/XoStop';
import { useXo } from '@/components/xo/XoProvider';
import { aed, DEFAULT_RATE, mortgageEstimate, monthlyPayment, RESIDENCY, VERDICT_LABEL } from '@/lib/finance';
import { prefersReducedMotion } from '@/lib/motion/scrollEngine';
import styles from './CalculatorSection.module.css';

const REACTIONS = {
  yes: 'Nice. That sits inside the 50% debt-burden cap.',
  mid: 'You still qualify, for a lower amount. Clearing a loan would lift it.',
  no: 'Your commitments are at the 50% cap. An advisor can look at your options.',
};

function Slider({ id, label, value, min, max, step, format, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="num">{format(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--pct': `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Rolls a displayed number toward its new value without re-rendering the whole calculator. */
function useRollingNumber(value, format) {
  const ref = useRef(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion()) {
      el.textContent = format(value);
      shown.current = value;
      return undefined;
    }
    let raf;
    const from = shown.current;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 420);
      shown.current = from + (value - from) * (1 - Math.pow(1 - t, 3));
      el.textContent = format(shown.current);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, format]);
  return ref;
}

export default function CalculatorSection() {
  const xo = useXo();
  const [salary, setSalary] = useState(30000);
  const [debts, setDebts] = useState(3000);
  const [years, setYears] = useState(25);
  const [residency, setResidency] = useState('resident');

  const ltv = RESIDENCY.find((r) => r.id === residency).ltv;
  const result = useMemo(() => mortgageEstimate({ salary, debts, years, ltv }), [salary, debts, years, ltv]);
  const priceRef = useRollingNumber(result.price, aed);
  const loanRef = useRollingNumber(result.loan, aed);
  const monthlyRef = useRollingNumber(result.loan ? monthlyPayment(result.loan, DEFAULT_RATE, years) : 0, aed);

  const lastVerdict = useRef(result.verdict);
  useEffect(() => {
    if (result.verdict !== lastVerdict.current) {
      lastVerdict.current = result.verdict;
      xo.say(REACTIONS[result.verdict], { ms: 4800 });
    }
  }, [result.verdict, xo]);

  const debtShare = Math.min(100, (debts / salary) * 100);
  const roomShare = (result.room / salary) * 100;

  return (
    <section className={`section ${styles.section}`} aria-labelledby="calc-title">
      <XoStop config={{ anchor: '#calc-card', ax: .86, say: 'Go on, move the sliders. I calculate as you go.', pose: 'wave', phone: true }} />
      <div className="wrap">
        <header className={styles.head}>
          <p className="eyebrow">Live, right here</p>
          <SplitText className="display h1" parts="Don't take our word for it. Run your numbers." />
          <span id="calc-title" className="sr-only">Mortgage estimate calculator</span>
        </header>

        <div id="calc-card" className={styles.card} data-reveal="scale">
          <form className={styles.inputs} onSubmit={(e) => e.preventDefault()}>
            <Slider id="salary" label="Monthly salary" value={salary} min={10000} max={150000} step={1000} format={aed} onChange={setSalary} />
            <Slider id="debts" label="Existing monthly loans and cards" value={debts} min={0} max={40000} step={500} format={aed} onChange={setDebts} />
            <Slider id="years" label="Mortgage length" value={years} min={5} max={25} step={1} format={(v) => `${v} years`} onChange={setYears} />
            <fieldset className={styles.segment}>
              <legend>I am a</legend>
              <div>
                {RESIDENCY.map((r) => (
                  <label key={r.id} data-on={residency === r.id || undefined}>
                    <input type="radio" name="residency" value={r.id} checked={residency === r.id} onChange={() => setResidency(r.id)} />
                    {r.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </form>

          <div className={styles.result} aria-live="polite">
            <span className={styles.verdict} data-verdict={result.verdict}>{VERDICT_LABEL[result.verdict]}</span>
            <p className={styles.resultLabel}>Property price you could consider</p>
            <p className={`num ${styles.price}`} ref={priceRef}>{aed(result.price)}</p>

            <div className={styles.meter}>
              <div className={styles.bar}>
                <i className={styles.barDebt} style={{ width: `${debtShare}%` }} />
                <i className={styles.barRoom} style={{ width: `${roomShare}%` }} />
                <span className={styles.capMark} aria-hidden="true" />
              </div>
              <div className={styles.legend}>
                <span>Existing loans</span>
                <span>Room for a mortgage</span>
                <span className={styles.capLabel}>50% cap</span>
              </div>
            </div>

            <dl className={styles.stats}>
              <div><dt>You could borrow</dt><dd className="num" ref={loanRef}>{aed(result.loan)}</dd></div>
              <div><dt>Monthly payment</dt><dd className="num" ref={monthlyRef}>{aed(result.room)}</dd></div>
            </dl>

            <Button className={styles.cta} onClick={() => xo.openChat(`How much can I borrow on AED ${salary} a month?`)}>
              Continue with XO <Arrow />
            </Button>
            <p className={`note ${styles.assume}`}>
              Estimate, not an offer. Illustrative {DEFAULT_RATE}% rate and {Math.round(ltv * 100)}% loan-to-value. Subject to lender approval.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
