/* One passive scroll listener, one on-demand rAF, cached measurements.
   Scrubbed work only writes transforms and opacity, so scrolling never forces layout. */

const scrubs = new Set();
const tickers = new Set();
let scrollY = 0;
let viewportHeight = 0;
let queued = false;
let started = false;
let resizeTimer;

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const range = (p, a, b) => clamp((p - a) / (b - a));
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function frame() {
  queued = false;
  scrubs.forEach((s) => {
    // pin:  0 when the element top meets the viewport top, 1 when its bottom meets the viewport bottom.
    // pass: 0 as the element enters from below, 1 when it has left through the top.
    const span = s.mode === 'pin' ? s.height - viewportHeight : s.height + viewportHeight;
    const start = s.mode === 'pin' ? s.top : s.top - viewportHeight;
    const p = span > 0 ? clamp((scrollY - start) / span) : 0;
    if (p !== s.last) {
      s.last = p;
      s.fn(p);
    }
  });
  tickers.forEach((fn) => fn(scrollY));
}

function requestFrame() {
  scrollY = window.scrollY;
  if (!queued) {
    queued = true;
    requestAnimationFrame(frame);
  }
}

export function measure() {
  viewportHeight = window.innerHeight;
  scrollY = window.scrollY;
  scrubs.forEach((s) => {
    const r = s.el.getBoundingClientRect();
    s.top = r.top + scrollY;
    s.height = r.height;
    s.last = -1;
    if (s.onMeasure) s.onMeasure();
  });
  frame();
}

function start() {
  if (started) return;
  started = true;
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 120);
  }, { passive: true });
  window.addEventListener('load', measure);
  if (document.fonts?.ready) document.fonts.ready.then(measure);
}

export function addScrub(el, fn, { mode = 'pass', onMeasure } = {}) {
  start();
  const s = { el, fn, mode, onMeasure, top: 0, height: 0, last: -1 };
  scrubs.add(s);
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(measure, 0);
  return () => scrubs.delete(s);
}

export function addTicker(fn) {
  start();
  tickers.add(fn);
  return () => tickers.delete(fn);
}
