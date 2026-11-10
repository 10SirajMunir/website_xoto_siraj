/* Drives XO's flight, poses and section stops by writing to the DOM directly.
   Running this outside React keeps flight at full frame rate with no re-renders. */
import { addTicker, clamp, prefersReducedMotion } from '@/lib/motion/scrollEngine';

const TIPS = [
  { say: 'Still deciding? I can check what you can borrow in under a minute.', cta: 'Check my mortgage', prompt: 'How much can I borrow on AED 30,000 a month?', x: .14, y: .3 },
  { say: 'Prefer Arabic, Hindi or Urdu? I speak 21 languages. Just ask.', x: .84, y: .26 },
];
const HELLO = "Hi, I'm XO, XOTO's AI guide. Ask me about buying, renting or financing a home.";
// Phones get a shorter greeting so the bubble never outsizes the hero headline (it would become the page's LCP).
const HELLO_PHONE = "Hi, I'm XO. Tap me for any home question.";
const ARRIVE_AT = 2200;
const HOME_WAIT = 4500; // How long arrival waits for the hero to offer a landing spot.
const CAMEO_MAX = 9000; // Longest the page XO stays hidden while the hero's 3D XO is flying.
const PATROL_AFTER = 16000;
const DWELL = 420;

function createController() {
  const state = {
    x: 0, y: 0, s: 1, tilt: 0,
    flying: false, docked: false, live: false, quiet: false, panelOpen: false,
    anchor: null, anchorTop: 0, stop: null, pendingStop: null, onHome: false,
  };
  const stops = new Map();
  const seen = new Set();
  let els = null;
  let homeConfig = null;
  let homeExpected = false;
  let homeVisited = false;
  let homeReady = () => {};
  let cameoActive = false;
  let cameoEnd = () => {};
  let baseSize = 120;
  let flightId = 0;
  let stopObserver = null;
  let bubbleTimer;
  let patrolTimer;
  let patrols = 0;
  let bubbleSize = { w: 0, h: 0 };
  let bubbleBelow = false;
  let dwellTimer;
  let freedEl = null;
  let onBubble = () => {};
  let removeTicker = () => {};
  let destroyed = false;

  const isMobile = () => window.innerWidth <= 720;
  const visual = (s = state.s) => baseSize * s;
  const dockScale = () => (isMobile() ? 1 : .8);

  function write() {
    if (!els) return;
    els.root.style.transform = `translate3d(${state.x}px,${state.y}px,0) scale(${state.s})`;
    placeBubble();
  }

  function placeBubble() {
    if (!els?.bubble || !els.bubble.dataset.on) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = visual();
    const onRight = state.x + size / 2 > w / 2;
    let bx = onRight ? state.x - bubbleSize.w + size * .08 : state.x + size * .92;
    let by = state.y - bubbleSize.h * .35;
    if (bubbleBelow) {
      bx = state.x + size / 2 - bubbleSize.w / 2;
      by = state.y + size + 4;
    }
    if (isMobile()) {
      bx = 16;
      by = bubbleBelow ? state.y + size + 4 : state.y - bubbleSize.h - 8;
    }
    bx = clamp(bx, 16, Math.max(16, w - bubbleSize.w - 16));
    by = clamp(by, 72, Math.max(72, h - bubbleSize.h - 12));
    els.bubble.style.transform = `translate3d(${bx}px,${by}px,0)`;
    els.bubble.style.setProperty('--origin', onRight ? '100% 60%' : '0 60%');
  }

  function pose(name) {
    if (!els) return;
    delete els.root.dataset.pose;
    if (!name) return;
    void els.root.offsetWidth; // Restart the pose animation.
    els.root.dataset.pose = name;
  }

  function targetFor(spec) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const s = spec.scale || 1;
    const size = visual(s);
    if (spec.anchorEl) {
      const r = spec.anchorEl.getBoundingClientRect();
      if (spec.fit) {
        const fitted = r.width / baseSize;
        spec.ay = baseSize * fitted * .96;
        return { x: r.left, y: r.top, s: fitted };
      }
      return { x: r.left + r.width * (spec.ax ?? .9) - size / 2, y: r.top + (spec.ay || 0) - size * .96, s };
    }
    if (spec.dock) return { x: w - size - (isMobile() ? 8 : 20), y: h - size - (isMobile() ? 8 : 14), s };
    return { x: w * spec.x - size / 2, y: h * spec.y - size / 2, s };
  }

  /* A point on a smooth curve through every waypoint (Catmull-Rom), for flights with `via` stops. */
  function along(points, e) {
    const n = points.length - 1;
    const f = Math.min(e * n, n - 1e-6);
    const i = Math.floor(f);
    const t = f - i;
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n, i + 2)];
    const c = (a, b, cc, d) => .5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t * t + (-a + 3 * b - 3 * cc + d) * t * t * t);
    return { x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y) };
  }

  function flyTo(spec) {
    if (!els) return Promise.resolve();
    const id = ++flightId;
    const start = { x: state.x, y: state.y, s: state.s };
    state.anchor = null;
    state.docked = false;
    hideBubble();
    pose(null);
    let target = targetFor(spec);
    const dist = Math.hypot(target.x - start.x, target.y - start.y);

    return new Promise((resolve) => {
      if (prefersReducedMotion() || dist < 4 || spec.instant) {
        Object.assign(state, target, { tilt: 0 });
        els.tilt.style.transform = '';
        settle(spec);
        resolve();
        return;
      }
      const via = (spec.via || []).map((v) => {
        const size = visual(v.scale || start.s);
        return { x: window.innerWidth * v.x - size / 2, y: window.innerHeight * v.y - size / 2 };
      });
      let pathLength = dist;
      if (via.length) {
        pathLength = 0;
        [start, ...via, target].reduce((a, b) => {
          pathLength += Math.hypot(b.x - a.x, b.y - a.y);
          return b;
        });
      }
      const dur = via.length ? clamp(pathLength * .95, 1400, 3200) : clamp(dist * 1.05, 620, 1500);
      const lift = Math.min(dist * .28, 170);
      const cx = (start.x + target.x) / 2 + (target.y - start.y) * .08;
      const cy = (start.y + target.y) / 2 - lift;
      const t0 = performance.now();
      let px = start.x;
      let py = start.y;
      state.flying = true;
      els.root.dataset.fly = target.x < start.x ? 'left' : 'right';
      delete els.root.dataset.idle;

      const step = (now) => {
        if (id !== flightId || destroyed) {
          resolve();
          return;
        }
        const t = clamp((now - t0) / dur);
        const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const u = 1 - e;
        if (spec.anchorEl) target = targetFor(spec);
        if (via.length) {
          const p = along([start, ...via, target], e);
          state.x = p.x;
          state.y = p.y;
        } else {
          state.x = u * u * start.x + 2 * u * e * cx + e * e * target.x;
          state.y = u * u * start.y + 2 * u * e * cy + e * e * target.y;
        }
        state.s = start.s + (target.s - start.s) * e;
        const vx = state.x - px;
        const vy = state.y - py;
        px = state.x;
        py = state.y;
        if (Math.hypot(vx, vy) > .4) {
          const want = clamp(Math.atan2(vx, -vy) * 57.3, -78, 78);
          state.tilt += (want - state.tilt) * .14;
        }
        const damp = t > .78 ? (1 - t) / .22 : 1;
        els.tilt.style.transform = `rotate(${state.tilt * damp}deg)`;
        write();
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          state.tilt = 0;
          els.tilt.style.transform = '';
          settle(spec);
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  function settle(spec) {
    state.flying = false;
    delete els.root.dataset.fly;
    els.root.dataset.idle = '';
    if (spec.anchorEl && !spec.fixedAnchor) {
      state.anchor = spec;
      state.anchorTop = spec.anchorEl.getBoundingClientRect().top + window.scrollY + (spec.ay || 0);
    }
    write();
    pose(spec.pose || 'land');
    state.docked = !!spec.dock;
    if (spec.say) say(spec.say, spec);
    if (spec.dock && !goHome()) armPatrol();
  }

  function dock() {
    state.stop = null;
    releaseFigure();
    return flyTo({ dock: true, scale: dockScale() });
  }

  function say(text, opts = {}) {
    if (state.panelOpen || !els) return;
    if (state.quiet && !opts.force) return;
    bubbleBelow = !!opts.below;
    onBubble({ text, cta: opts.cta, prompt: opts.prompt });
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(hideBubble, opts.ms || 6500);
  }

  function hideBubble() {
    clearTimeout(bubbleTimer);
    onBubble(null);
  }

  function bubbleRendered(el) {
    if (!els) return;
    els.bubble = el;
    bubbleSize = { w: el.offsetWidth, h: el.offsetHeight };
    placeBubble();
  }

  function dismissBubble() {
    hideBubble();
    state.quiet = true; // A dismissed XO stays quiet and docked for this visit.
    clearTimeout(patrolTimer);
    if (!state.docked) dock();
  }

  function releaseFigure() {
    if (freedEl) delete freedEl.dataset.xoHere;
    freedEl = null;
  }

  function visit(el) {
    const config = stops.get(el);
    if (state.quiet) return;
    state.stop = el;
    const spec = { ...config };
    if (isMobile()) {
      // On phones XO only hops between the bottom corners, on fewer stops, so content stays readable.
      if (!config.phone) {
        state.stop = null;
        return;
      }
      delete spec.anchor;
      delete spec.fit;
      const left = seen.size % 2 === 1;
      const size = visual(1);
      spec.x = (left ? size / 2 + 8 : window.innerWidth - size / 2 - 8) / window.innerWidth;
      spec.y = (window.innerHeight - size / 2 - 8) / window.innerHeight;
      spec.scale = 1;
      spec.ms = 3800;
    } else if (config.anchor) {
      spec.anchorEl = document.querySelector(config.anchor);
      if (config.fit && spec.anchorEl) {
        spec.anchorEl.dataset.xoHere = '';
        freedEl = spec.anchorEl;
      }
    }
    flyTo(spec);
  }

  function ensureObserver() {
    if (stopObserver) return;
    stopObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) {
          if (state.pendingStop === e.target) {
            clearTimeout(dwellTimer);
            state.pendingStop = null;
          }
          if (state.stop === e.target) {
            hideBubble();
            dock();
          }
          return;
        }
        if (seen.has(e.target) || !state.live || state.panelOpen) return;
        // Only visit once the reader pauses here, so fast scrolling does not use up XO's stops.
        clearTimeout(dwellTimer);
        state.pendingStop = e.target;
        dwellTimer = setTimeout(() => {
          state.pendingStop = null;
          if (state.panelOpen) return;
          seen.add(e.target);
          visit(e.target);
        }, DWELL);
      });
    }, { rootMargin: '-46% 0px -46% 0px' });
  }

  function registerStop(el, config) {
    ensureObserver();
    stops.set(el, config);
    stopObserver.observe(el);
    return () => {
      stops.delete(el);
      stopObserver.unobserve(el);
    };
  }

  function armPatrol() {
    clearTimeout(patrolTimer);
    if (prefersReducedMotion() || patrols >= TIPS.length || state.quiet) return;
    patrolTimer = setTimeout(() => {
      if (!state.docked || state.panelOpen || state.flying || document.hidden || isMobile()) {
        armPatrol();
        return;
      }
      const tip = TIPS[patrols++];
      flyTo({ ...tip, pose: 'wave' }).then(() => {
        setTimeout(() => {
          if (!state.panelOpen && !state.stop && !destroyed) dock();
        }, 6000);
      });
    }, PATROL_AFTER);
  }

  function chatOpened(panelEl) {
    state.panelOpen = true;
    hideBubble();
    clearTimeout(patrolTimer);
    if (isMobile()) {
      els.root.style.opacity = '0';
      els.hit.tabIndex = -1;
    } else if (state.live) {
      // XO hops up and perches on the top edge of the chat window.
      flyTo({ anchorEl: panelEl, fixedAnchor: true, ax: .14, ay: 8, scale: .72, pose: 'wave' });
    }
  }

  function chatClosed() {
    state.panelOpen = false;
    els.root.style.opacity = '';
    els.hit.tabIndex = 0;
    if (state.live) dock();
  }

  function onScroll(y) {
    if (state.anchor && !state.flying && !state.panelOpen) {
      state.y = state.anchorTop - y - visual() * .96;
      write();
    }
    if (state.onHome && y > window.innerHeight * .28) {
      state.onHome = false;
      dock();
    }
    if (state.docked) armPatrol();
  }

  function onResize() {
    baseSize = isMobile() ? 68 : 120;
    if (state.docked && state.live) {
      Object.assign(state, targetFor({ dock: true, scale: dockScale() }));
      write();
    }
  }

  async function arrive() {
    const images = [...els.root.querySelectorAll('img')];
    await Promise.all(images.map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
    await new Promise((r) => setTimeout(r, Math.max(0, ARRIVE_AT - performance.now())));
    if (destroyed || !els) return;
    if (cameoActive) {
      await Promise.race([new Promise((r) => { cameoEnd = r; }), new Promise((r) => setTimeout(r, CAMEO_MAX))]);
      if (destroyed || !els) return;
      setCameo(false);
    }
    if (homeExpected && !homeConfig) {
      await Promise.race([new Promise((r) => { homeReady = r; }), new Promise((r) => setTimeout(r, HOME_WAIT))]);
      if (destroyed || !els) return;
    }
    state.live = true;
    els.root.dataset.live = '';
    if (!goHome()) {
      await dock();
      if (isMobile() && window.scrollY < 80) say(HELLO_PHONE, { ms: 5000 });
    }
  }

  /* While the hero shows XO flying inside the 3D scene, the page XO stays out of sight. */
  function setCameo(on) {
    cameoActive = on;
    if (els) els.root.style.visibility = on ? 'hidden' : '';
    if (!on) cameoEnd();
  }

  /* Land on the hero's spot if the reader is still at the top and it is on screen. */
  function goHome() {
    if (!homeConfig || homeVisited || state.quiet || state.panelOpen || window.scrollY > window.innerHeight * .2) return false;
    const anchorEl = homeConfig.anchor ? document.querySelector(homeConfig.anchor) : null;
    if (homeConfig.anchor) {
      const r = anchorEl?.getBoundingClientRect();
      if (!r || r.top < 0 || r.bottom > window.innerHeight) return false;
    }
    homeVisited = true;
    state.onHome = true;
    const spec = { ...homeConfig, anchorEl, say: homeConfig.say || HELLO, pose: homeConfig.pose || 'wave' };
    if (state.docked) {
      delete spec.via; // Already on screen: fly straight up rather than re-entering.
      delete spec.instant;
    }
    if (isMobile()) {
      spec.scale = 1;
      spec.below = true;
      spec.say = homeConfig.say || HELLO_PHONE;
      delete spec.via;
    }
    flyTo(spec);
    return true;
  }

  return {
    attach(elements, { bubble }) {
      destroyed = false;
      els = elements;
      onBubble = bubble;
      baseSize = isMobile() ? 68 : 120;
      state.x = -200; // XO enters from the top-left.
      state.y = -180;
      write();
      removeTicker = addTicker(onScroll);
      window.addEventListener('resize', onResize, { passive: true });
      arrive();
    },
    detach() {
      destroyed = true;
      flightId++;
      clearTimeout(bubbleTimer);
      clearTimeout(patrolTimer);
      clearTimeout(dwellTimer);
      removeTicker();
      window.removeEventListener('resize', onResize);
      els = null;
    },
    /** The hero's 3D XO is flying (true) or has landed (false). */
    cameo(on) {
      setCameo(on);
      if (!on && state.live && !state.flying && !state.onHome && !goHome() && !state.docked) dock();
    },
    /** Re-pin XO to its anchor after the anchor moved without a scroll, e.g. when the hero model tilts. */
    refreshAnchor() {
      const spec = state.anchor;
      if (!spec || state.flying || state.panelOpen || !els) return;
      const t = targetFor(spec);
      state.x = t.x;
      state.y = t.y;
      state.anchorTop = spec.anchorEl.getBoundingClientRect().top + window.scrollY + (spec.ay || 0);
      write();
    },
    /** The page will offer a landing spot shortly (e.g. once the hero model has loaded), so arrival waits for it. */
    expectHome() {
      homeExpected = true;
      return () => { homeExpected = false; };
    },
    setHome(config) {
      homeConfig = config;
      homeReady();
      if (state.live && state.docked && !state.flying) goHome();
      return () => {
        homeConfig = null;
        homeVisited = false;
      };
    },
    registerStop, say, dock, pose, flyTo, bubbleRendered, dismissBubble, chatOpened, chatClosed,
  };
}

export const xoController = createController();
