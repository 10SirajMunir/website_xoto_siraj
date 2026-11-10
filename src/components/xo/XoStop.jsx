'use client';

import { useEffect, useRef } from 'react';
import { xoController } from '@/lib/xo/mascotController';

/**
 * Drop inside any position:relative section. When the section crosses the middle of the
 * viewport, XO flies to the given spot and pops a message. `home` marks the landing spot on arrival.
 */
export default function XoStop({ config, home = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (home) return xoController.setHome(config);
    return xoController.registerStop(ref.current, config);
    // The config is a static literal at each call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home]);

  return <div ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
}
