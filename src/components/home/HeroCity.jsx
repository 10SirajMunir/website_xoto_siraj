'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import PhaseLink from '@/components/ui/PhaseLink';
import { useXo } from '@/components/xo/XoProvider';
import { xoController } from '@/lib/xo/mascotController';
import { prefersReducedMotion } from '@/lib/motion/scrollEngine';
import { isLiteDevice, supportsWebGL } from '@/lib/device';
import styles from './HeroCity.module.css';

// The model starts assembling once the headline has settled.
const ENTRY_DELAY = 650;
// Where the spire tip sits in /images/hero-city.webp, as fractions of the image.
const STILL_TIP = { x: .4997, y: .19 };
// Where the page XO perches. With the 3D model, XO circles the tower inside the scene and is handed over
// on the spire (`instant`); with the still image, the page XO flies in from the top-left instead.
const XO_HOME = { anchor: '#xo-spire', ax: .5, ay: 4, scale: .85, via: [{ x: .1, y: .2 }, { x: .4, y: .1 }] };
const XO_SIZE = { phone: 68, desktop: 102 }; // baseSize x scale in mascotController

/**
 * Interactive Downtown Dubai model. three.js loads after first paint; until then (or without WebGL)
 * the space shows a still render. Pins are real links, so they work with a keyboard and for search engines.
 */
export default function HeroCity({ pins }) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const pinEls = useRef({});
  const stillRef = useRef(null);
  const homeRef = useRef(null);
  const [mode, setMode] = useState('loading');
  const xo = useXo();

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    let cancelled = false;
    let releaseHome = () => {};
    const releaseExpect = xoController.expectHome();
    const offerHome = (extra) => {
      if (!cancelled) releaseHome = xoController.setHome({ ...XO_HOME, ...extra });
    };
    homeRef.current = offerHome;
    // Without WebGL, on low-end phones or with Data Saver, show the still render instead (placeStill offers XO's spot).
    const fail = () => {
      if (cancelled) return;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      xoController.cameo(false);
      setMode('still');
    };
    if (isLiteDevice() || !supportsWebGL()) {
      fail();
      if (stillRef.current?.complete && stillRef.current.naturalWidth) placeStill(stillRef.current);
      return () => {
        cancelled = true;
        releaseExpect();
        releaseHome();
      };
    }

    const start = async () => {
      try {
        const { createDowntownScene } = await import('@/lib/three/downtownScene');
        if (cancelled) return;
        const still = prefersReducedMotion();
        if (!still) xoController.cameo(true);
        sceneRef.current = createDowntownScene({
          canvas,
          host,
          pins,
          still,
          xoPx: window.innerWidth <= 720 ? XO_SIZE.phone : XO_SIZE.desktop,
          onLayout: ({ x, y }) => {
            host.style.setProperty('--tip-x', `${x.toFixed(1)}px`);
            host.style.setProperty('--tip-y', `${y.toFixed(1)}px`);
            xoController.refreshAnchor();
          },
          onXoArrive: () => {
            offerHome({ instant: true });
            xoController.cameo(false);
          },
          onPin: (id, x, y, facing) => {
            const el = pinEls.current[id];
            if (!el) return;
            el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
            el.toggleAttribute('data-back', facing < -.2);
          },
          onEntered: () => {
            host.dataset.entered = '';
            if (still) offerHome();
          },
        });
        setMode('live');
      } catch {
        fail();
      }
    };

    canvas.addEventListener('webglcontextlost', fail);
    // The headline reveals first; the model rises in once it has settled.
    let idle;
    const wait = setTimeout(() => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 300 }) : setTimeout(start, 50);
    }, ENTRY_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(wait);
      if (window.cancelIdleCallback && idle) window.cancelIdleCallback(idle);
      clearTimeout(idle);
      canvas.removeEventListener('webglcontextlost', fail);
      releaseExpect();
      releaseHome();
      xoController.cameo(false);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [pins]);

  const highlight = (id) => sceneRef.current?.highlight(id);

  // Put XO's landing spot on the spire of the still image, wherever object-fit: contain placed it.
  function placeStill(img) {
    const host = hostRef.current;
    if (!host || !img.naturalWidth || host.dataset.entered !== undefined) return;
    const scale = Math.min(host.clientWidth / img.naturalWidth, host.clientHeight / img.naturalHeight);
    const left = (host.clientWidth - img.naturalWidth * scale) / 2;
    const top = (host.clientHeight - img.naturalHeight * scale) / 2;
    host.style.setProperty('--tip-x', `${(left + STILL_TIP.x * img.naturalWidth * scale).toFixed(1)}px`);
    host.style.setProperty('--tip-y', `${(top + STILL_TIP.y * img.naturalHeight * scale).toFixed(1)}px`);
    host.dataset.entered = '';
    homeRef.current?.();
  }

  return (
    <div
      ref={hostRef}
      className={styles.city}
      data-mode={mode}
      onPointerEnter={(e) => e.pointerType === 'mouse' && sceneRef.current?.hold(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && sceneRef.current?.hold(false)}
      onFocus={() => sceneRef.current?.hold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && sceneRef.current?.hold(false)}
    >
      <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label="3D model of Downtown Dubai with the Burj Khalifa and XOTO's office in One by Omniyat, Business Bay. Drag to turn and tilt it." />
      {/* Always in the HTML; CSS shows it before first paint on lite devices (html.lite) or once 3D is ruled out. */}
      <Image
        ref={stillRef}
        src="/images/hero-city.webp"
        alt=""
        fill
        sizes="(max-width: 900px) 100vw, 52vw"
        className={styles.still}
        onLoad={(e) => mode === 'still' && placeStill(e.currentTarget)}
      />

      {pins.map((pin) => (
        <PhaseLink
          key={pin.id}
          ref={(el) => { pinEls.current[pin.id] = el; }}
          href={pin.href}
          phase={pin.phase}
          page={pin.page}
          className={styles.pin}
          data-kind={pin.kind}
          onPointerEnter={() => highlight(pin.id)}
          onPointerLeave={() => highlight(null)}
          onFocus={() => {
            sceneRef.current?.face(pin.id);
            highlight(pin.id);
          }}
          onBlur={() => highlight(null)}
        >
          <span className={styles.pinBody}>
            <span className={styles.pinDot} aria-hidden="true" />
            <b>{pin.label}</b>
            <small>{pin.text}</small>
          </span>
        </PhaseLink>
      ))}

      <div id="xo-spire" className={styles.spire} aria-hidden="true" />
      <button type="button" className={styles.chat} onClick={() => xo.openChat()}>
        <span className={styles.chatDot} aria-hidden="true" />
        Chat with XO
      </button>

      <p className={styles.hint} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 1v14M1 8h14M5.5 3.5 8 1l2.5 2.5M5.5 12.5 8 15l2.5-2.5M3.5 5.5 1 8l2.5 2.5M12.5 5.5 15 8l-2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Drag to explore
      </p>
    </div>
  );
}
