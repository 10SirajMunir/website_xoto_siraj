'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { LANGUAGES } from '@/data/languages';
import { XO_ADVISOR_PROMPT } from '@/lib/xo/answers';
import styles from './XoChatPanel.module.css';

const DISCLAIMER = 'XO gives estimates, not offers. Figures are subject to lender approval.';

const TILES = [
  { title: 'Find properties', text: 'By area, budget and bedrooms, including off-plan', q: 'Find me a 2-bed home in my budget' },
  { title: 'Check your mortgage', text: 'What you could borrow and pay each month', q: 'How much can I borrow on AED 30,000 a month?' },
  { title: 'Get clear answers', text: 'Fees, buying steps, Golden Visa, renting rules', q: 'What fees do I pay when buying in Dubai?' },
  { title: 'Talk to a person', text: 'Arrange a callback from a XOTO advisor', q: "I'd like to talk to an advisor" },
];

function Message({ message }) {
  if (message.role === 'me') return <div className={`${styles.msg} ${styles.me}`}>{message.text}</div>;
  if (message.text) return <div className={`${styles.msg} ${styles.bot}`}>{message.text}</div>;
  return (
    <div className={`${styles.msg} ${styles.card}`}>
      {message.verdict && <span className={styles.verdict} data-verdict={message.verdict}>{message.verdictLabel}</span>}
      {message.title && <b className={styles.cardTitle}>{message.title}</b>}
      {message.intro && <p className="note">{message.intro}</p>}
      <div className={styles.rows}>
        {message.rows.map(([k, v]) => (
          <div key={k} className={styles.row}><span>{k}</span><b>{v}</b></div>
        ))}
      </div>
      {message.note && <p className="note">{message.note}</p>}
    </div>
  );
}

const XoChatPanel = forwardRef(function XoChatPanel({ open, messages, typing, onAsk, onReply, onClose }, ref) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const hasDraft = !!draft.trim();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    if (!hasDraft) {
      onReply('Voice mode, with its listening, thinking and speaking states, comes with the chatbot redesign. For now, type your question here.');
      return;
    }
    onAsk(draft.trim());
    setDraft('');
  };

  return (
    <section ref={ref} className={styles.panel} data-open={open || undefined} inert={!open} role="dialog" aria-label="Chat with XO">
      <header className={styles.head}>
        <div className={styles.avatar}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/xo/xo-full.webp" alt="" width="60" height="60" loading="lazy" />
        </div>
        <div className={styles.title}><b>XO</b><span>Design preview</span></div>
        <select
          className={styles.lang}
          aria-label="Language"
          onChange={(e) => onReply(`Language switched to ${e.target.value}. Your chat stays right here.`)}
        >
          {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
        </select>
        <button type="button" className={styles.iconBtn} aria-label="Close chat" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" /></svg>
        </button>
      </header>

      <div ref={scrollRef} className={styles.scroll} aria-live="polite">
        {messages.length === 0 && (
          <div>
            <h2 className={styles.hello}>Hi, I&apos;m XO.</h2>
            <p className={styles.helloText}>Your guide to UAE property and mortgages. Ask in your own language.</p>
            <div className={styles.tiles}>
              {TILES.map((t) => (
                <button key={t.title} type="button" className={styles.tile} onClick={() => onAsk(t.q)}>
                  <b>{t.title}</b><span>{t.text}</span>
                </button>
              ))}
            </div>
            <button type="button" className={styles.human} onClick={() => onAsk(XO_ADVISOR_PROMPT)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" strokeLinejoin="round" /></svg>
              <span>Talk to a human advisor</span>
            </button>
          </div>
        )}
        {messages.map((m) => <Message key={m.id} message={m} />)}
        {typing && <div className={`${styles.msg} ${styles.bot} ${styles.typing}`} aria-label="XO is typing"><i /><i /><i /></div>}
      </div>

      <div className={styles.bar}>
        <form className={styles.form} onSubmit={submit}>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Message XO"
            placeholder="Ask XO anything"
            autoComplete="off"
          />
          <button type="submit" className={styles.send} aria-label={hasDraft ? 'Send message' : 'Talk to XO'}>
            {hasDraft ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20V4M5 11l7-7 7 7" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4" /></svg>
            )}
          </button>
        </form>
        <p className={styles.disclaimer}>{DISCLAIMER}</p>
      </div>
    </section>
  );
});

export default XoChatPanel;
