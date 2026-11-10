import Image from 'next/image';
import PhaseLink from '@/components/ui/PhaseLink';
import { FOOTER_GROUPS, SOCIAL } from '@/data/navigation';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Image src="/images/logo-purple.webp" alt="XOTO" width={420} height={147} sizes="104px" />
            <p>A unified ecosystem creating lifetime property value. Scalable. AI-powered. Asset-light.</p>
            <ul className={styles.contact}>
              <li><a href="mailto:care@xoto.ae">Customers: care@xoto.ae</a></li>
              <li><a href="mailto:biz@xoto.ae">Partners: biz@xoto.ae</a></li>
            </ul>
          </div>
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <PhaseLink href={link.href} phase={link.phase} page={link.label}>
                      {link.label}
                      {link.soon && <span className={styles.soon}>Soon</span>}
                    </PhaseLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.base}>
          <p>©2026 XOTO. All rights reserved. XO gives estimates, not offers. Figures are subject to lender approval.</p>
          <ul className={styles.social}>
            {SOCIAL.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
