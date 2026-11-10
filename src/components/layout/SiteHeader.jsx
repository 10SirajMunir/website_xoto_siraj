'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PhaseLink from '@/components/ui/PhaseLink';
import { buttonClass } from '@/components/ui/Button';
import { addTicker } from '@/lib/motion/scrollEngine';
import { CONTACT, LOGIN, NAV } from '@/data/navigation';
import styles from './SiteHeader.module.css';

function Chevron() {
  return (
    <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A disclosure menu: opens on hover for mice, on click or Enter for everyone, and closes on Escape or focus leaving. */
function Dropdown({ id, label, items, open, onOpen, onClose, align = 'start' }) {
  const closeTimer = useRef(null);
  const buttonRef = useRef(null);

  const enter = (e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(closeTimer.current);
    onOpen(id);
  };
  const leave = (e) => {
    if (e.pointerType !== 'mouse') return;
    closeTimer.current = setTimeout(onClose, 140);
  };

  return (
    <div
      className={styles.drop}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          onClose();
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.dropBtn}
        aria-expanded={open}
        aria-controls={`menu-${id}`}
        onClick={() => (open ? onClose() : onOpen(id))}
      >
        {label}
        <Chevron />
      </button>
      <div id={`menu-${id}`} className={styles.panel} data-open={open || undefined} data-align={align} inert={!open}>
        <ul>
          {items.map((item) => (
            <li key={item.label}>
              <PhaseLink href={item.href} phase={item.phase} page={item.page || item.label} onClick={onClose}>
                <b>{item.label}</b>
                {item.text && <small>{item.text}</small>}
              </PhaseLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const headerRef = useRef(null);
  const buttonRef = useRef(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // A click anywhere outside closes an open dropdown.
  useEffect(() => {
    if (!menu) return undefined;
    const onDown = (e) => {
      if (!headerRef.current.contains(e.target)) setMenu(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menu]);

  // Header steps aside on the way down and returns on the way up; it turns solid once the hero is behind it.
  useEffect(() => {
    let last = window.scrollY;
    return addTicker((y) => {
      headerRef.current.toggleAttribute('data-solid', y > 24);
      if (Math.abs(y - last) < 6) return;
      const hide = y > last && y > 240 && !openRef.current;
      headerRef.current.toggleAttribute('data-hidden', hide);
      if (hide) setMenu(null);
      last = y;
    });
  }, []);

  const close = () => setOpen(false);
  const closeMenu = () => setMenu(null);
  const groups = NAV.filter((n) => n.items);

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <nav className={styles.nav} aria-label="Main">
          <Link href="/" className={styles.logo} aria-label="XOTO home">
            <Image src="/images/logo-purple.webp" alt="XOTO" width={420} height={147} sizes="78px" preload />
          </Link>

          <div className={styles.links}>
            {NAV.map((item) => (item.items ? (
              <Dropdown key={item.label} id={item.label} label={item.label} items={item.items} open={menu === item.label} onOpen={setMenu} onClose={closeMenu} />
            ) : (
              <PhaseLink key={item.label} href={item.href} phase={item.phase} page={item.page} className={styles.link}>{item.label}</PhaseLink>
            )))}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.lang} aria-label="Language: English">EN</button>
            <div className={styles.login}>
              <Dropdown id="login" label="Log in" items={LOGIN} open={menu === 'login'} onOpen={setMenu} onClose={closeMenu} align="end" />
            </div>
            <PhaseLink href={CONTACT.href} phase={CONTACT.phase} page={CONTACT.page} className={`${buttonClass('primary')} ${styles.actionBtn} ${styles.contact}`}>
              {CONTACT.label}
            </PhaseLink>
            <button
              ref={buttonRef}
              type="button"
              className={styles.menuBtn}
              data-open={open || undefined}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen(!open)}
            >
              <i /><i />
            </button>
          </div>
        </nav>
      </header>

      <div id="site-menu" className={styles.menu} data-open={open || undefined} inert={!open}>
        <div className={styles.menuGrid}>
          <div className={styles.menuMain}>
            <h2>Property and finance</h2>
            {NAV.filter((n) => !n.items).map((item) => (
              <PhaseLink key={item.label} href={item.href} phase={item.phase} page={item.page} onClick={close}>{item.label}</PhaseLink>
            ))}
          </div>
          {groups.map((group) => (
            <div key={group.label} className={styles.menuSub}>
              <h2>{group.label}</h2>
              {group.items.map((item) => (
                <PhaseLink key={item.label} href={item.href} phase={item.phase} page={item.page || item.label} onClick={close}>{item.label}</PhaseLink>
              ))}
            </div>
          ))}
          <div className={styles.menuSub}>
            <h2>Log in</h2>
            {LOGIN.map((item) => (
              <PhaseLink key={item.label} href={item.href} phase={item.phase} page={item.page} onClick={close}>{item.label}</PhaseLink>
            ))}
            <PhaseLink href={CONTACT.href} phase={CONTACT.phase} page={CONTACT.page} onClick={close}>{CONTACT.label}</PhaseLink>
          </div>
        </div>
      </div>
    </>
  );
}
