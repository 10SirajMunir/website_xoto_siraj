'use client';

import { useXo } from '@/components/xo/XoProvider';

/** Link to a page designed in a later phase (see plan.md): XO explains instead of a dead end. Swap to next/link once built. */
export default function PhaseLink({ href, phase = 2, page, children, onClick, ...rest }) {
  const xo = useXo();
  const name = page || (typeof children === 'string' ? children : 'This page');

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        xo.say(`The ${name} page is designed in Phase ${phase}. This review covers the landing page.`, { force: true, ms: 4200 });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
