# Implementation notes

How each phase in [plan.md](plan.md) is built, and how it was tested. These notes are for the developers who will carry this design into production.

## Running it

```bash
npm install
npm run dev                         # http://localhost:5174
npm run build && npm start          # production build, also on port 5174
npm run lint
```

Port 5174 is used because the current XOTO site usually runs on 5173.

## Phase 1: foundation and landing hero

### Files

| File | Role |
|---|---|
| `src/components/home/HeroSection.jsx` | Server component with the eyebrow, `h1`, `h2`, buttons and features. Animates in with CSS on first paint. |
| `src/components/home/HeroVideo.jsx` | Background video with its poster image. |
| `src/components/home/HeroCity.jsx` | Loads the 3D scene, places the link pins, the Chat with XO button and XO's landing spot, and falls back to a still image. |
| `src/lib/three/downtownScene.js` | The three.js scene: the model, camera framing, drag interaction, render loop and quality control. |
| `src/lib/device.js` | Inline `<head>` script that marks low-end devices before first paint, plus a WebGL check. |
| `src/lib/xo/mascotController.js` | XO's flight. Adds `via` waypoints (a smooth curve), entry from the top-left, `expectHome` and `setHome`. |
| `src/components/layout/SiteHeader.jsx` | Navbar with accessible dropdown menus, and a full-screen menu below 1240 px. |
| `src/data/navigation.js`, `src/data/home.js` | Menu and hero content, taken from the live site. |
| `src/components/ui/PhaseLink.jsx` | Link to a page from a later phase. XO explains which phase covers it. |
| `public/video/` | `hero-1280.mp4` (1.2 MB), `hero-720.mp4` (0.5 MB) and `hero-poster.webp`. |
| `public/images/hero-city.webp` | Transparent still of the model (68 KB), used on low-end phones and without WebGL. |

### The video

- **Source:** the first 2.8 s of `XOTO_Corporate.mp4`, which is the only stretch with no text. It is slowed to half speed with motion interpolation, played forwards then backwards so the loop has no jump, slightly desaturated, and has no audio track.
- **Encoding:** H.264 with fast start, which every browser plays. AV1 came out larger at the same quality, so it was dropped.
- **Loading:** the poster is an optimised `next/image` that paints at once. The video has `preload="none"` and starts downloading only after the page's `load` event, when the browser is idle. It fades in over the poster.
- **Phones:** download the 720-wide file through `<source media>`.
- **Pausing:** stops while the hero is off screen or the tab is hidden.
- **Skipped entirely** for reduced motion, Data Saver and low-end devices, which keep the poster.
- **Accessibility:** `aria-hidden` with no text in it. It is decoration, so screen readers and search engines lose nothing.

### The 3D model

- **Built from code:** 29 bricks for the Y-shaped tower with spiralling setbacks and the spire, 15 neighbouring towers (one is One by Omniyat, `HQ_TOWER`), the lake, and a plinth with contour rings. The only file it loads is `xo-sprite.webp` (15 KB).
- **Colours:** the Burj uses a small canvas texture of silver glass and steel fins. The neighbours use blue-grey, dark-glass and stone colours with faint floor lines. One by Omniyat uses dark mirrored glass with flat-shaded facets and steel edges.
- **Assembly:** each brick flies from the left or right on a small arc and spins into place. After the spire lands, the 29 bricks are swapped for one merged mesh, which cuts draw calls for the rest of the visit.
- **LED screen:** the real Burj Khalifa's facade carries about 1.14 million LED pixels on light sticks, and shows text with the letters stacked. The model copies this with a second shader pass over the merged tower's own surface, so there is no extra geometry. The content (XOTO stacked, on brand purple, with a green underline) is a small canvas texture projected from the viewer's direction, so it reads the same from every side. It is drawn as round LED dots, sampled at each dot's centre so the letters look pixelated. The dots soften when they get very small on screen to avoid shimmer. The screen switches on from the top down behind a green scan line. A slight twinkle updates only on frames that are drawn anyway, so the screen never adds frames.
- **XO in 3D:** a sprite with depth testing, so towers pass in front of XO as it spirals around the tower. It lands at the same on-screen size as the page XO (`xoPx`), then `onXoArrive` hands over to the page XO with an `instant` landing. The page XO stays hidden meanwhile (`xoController.cameo`).
- **Lazy:** three.js (about 140 KB compressed) is a separate chunk, imported 0.65 s after mount at idle time, so the headline is never waiting on it.
- **Renders only when needed:** while it enters, while you drag, during momentum, and for the slow idle spin, which is capped at 30 frames per second. It stops when off screen or in a background tab. The beacon's pulse is CSS, so it costs no 3D frames.
- **Adaptive quality:** the scene watches its own frame times. If frames run slow, it first drops to 1× pixel density, then stops the idle spin.
- **Light to draw:** Lambert materials, pixel density capped at 1.5, and shaders compiled in parallel where the browser supports `KHR_parallel_shader_compile`.
- **Interaction:** horizontal drag turns the model, with gentle, capped momentum. Vertical drag tilts the camera between 4° and 40° and eases back to 15° after 1.8 s, so XO and the Chat button follow the spire (`xoController.refreshAnchor`). On phones, `touch-action: pan-y` means a swipe that starts vertically scrolls the page; one that starts sideways turns and tilts the model. The mouse wheel is never captured. The model holds still while the pointer is over it, so pins are easy to click.
- **Pins:** real `<a href>` links projected onto three towers. Keyboard focus turns the model so the focused pin faces the viewer. Pins on the far side fade out and stop taking clicks.
- **Framing:** solved on every resize so the spire tip sits at 19–20% of the box height and the plinth fits the width. The tip position is passed to CSS (`--tip-x`, `--tip-y`) for XO's landing spot and the Chat with XO button.
- **Fallback:** without WebGL, on low-end devices or with Data Saver, the page shows `hero-city.webp` and places XO on its spire using `STILL_TIP`. On low-end devices this is decided by an inline script before first paint, so the image is the first thing drawn there.

### XO's arrival

1. `HeroCity` calls `xoController.expectHome()` on mount. When the 3D scene starts, it also calls `cameo(true)`, so the page XO waits (up to 9 s) while the 3D XO circles the tower.
2. When the 3D XO reaches the spire, `setHome({ instant: true })` puts the page XO on the `#xo-spire` anchor, and `cameo(false)` shows it.
3. Without 3D (still image or reduced motion), the page XO flies along a curve from the top-left, through two waypoints across the top, to the spire. If it had already gone to the corner, it flies straight up once it settles there.
4. Scrolling past 28% of the hero sends XO to the corner chat button.
5. Phones get a shorter greeting in a narrower bubble. A long bubble would be the largest thing on screen and become the page's Largest Contentful Paint.

### SEO

- **Server-rendered HTML** includes one `h1`, the `h2`, both buttons and the three pin links, all with real `href`s.
- **Metadata:** the title and description follow the live xoto.ae wording. A canonical URL, robots and Open Graph tags are set through the Next.js `metadata` export.
- **Hidden from search engines:** video and canvas carry no words, so nothing that needs indexing is inside them.
- **Still to do in Phase 8:** an Open Graph image, structured data (Organization and LocalBusiness), a sitemap and per-language `hreflang`.

## Test results (4 November 2026)

All tests ran on the production build, in Playwright's Chromium on a MacBook (Apple M5), using the real graphics card unless noted. Scripts are in the session scratchpad (`pw/hero.mjs`, `pw/ux-gpu.mjs`, `pw/lite.mjs`).

### Speed and stability

| Check | Desktop 1440×900 | Phone 390×844 |
|---|---|---|
| CPU slowed to a quarter of its speed: hero idle | 60 fps, 0 slow frames | 60 fps, 0 slow frames |
| CPU slowed to a quarter: full-page scroll | 60 fps, 0 frames over 33 ms | 60 fps, 0 frames over 33 ms |
| Largest Contentful Paint | 0.20 s (the `h1`) | 0.29 s (the `h1`) |
| Cumulative Layout Shift | 0.011 | 0 |
| Longest task | 0.2 s | 0.2 s |
| Download: JS, video, images | 312 KB, 1.2 MB, 0.6 MB | 312 KB, 0.5 MB, 0.4 MB |
| CPU slowed to a quarter: during the assembly | 60 fps, 2 frames over 33 ms in 4.4 s | 60 fps, 1 frame over 33 ms in 4.4 s |
| Console errors | None | None |

### Fallbacks (phone, CPU slowed 6×, slow 4G at 1.6 Mbps and 150 ms latency)

| Device | What it gets | JS | Largest Contentful Paint |
|---|---|---|---|
| Mid-range phone (4 GB, 8 cores) | Video and 3D | 312 KB | 0.8 s |
| Low-end phone (1 GB, 2 cores) | Poster and still model; no video, no three.js | 164 KB | 1.5 s |
| WebGL switched off | Video and still model; three.js never downloaded | 164 KB | 2.9 s |

### Interaction

- **Menus:** dropdowns open on hover, close on leave, and also open with Enter and close with Escape.
- **Keyboard:** tab order runs skip link, logo, menu, buttons, the three pins, then Chat with XO.
- **3D model:** dragging turns it, and phones keep `touch-action: pan-y`, so vertical swipes still scroll the page.
- **XO:** lands on the spire. Chat with XO opens the chat, and scrolling sends XO to the corner.
- **Reduced motion:** no video downloaded, the model is shown without its entrance, and all text is visible.
- **Layout:** no horizontal scrolling at 390, 1280 or 1440 px.

### Not yet tested

- Safari and Firefox
- Real phones, especially older Android devices and iPhones with Low Power Mode, which can block autoplay video. In that case the poster stays, which is fine.
- Real network conditions from the UAE

These come in Phase 8.

Headless Chromium using software 3D (SwiftShader) showed 20–30 fps for the 3D on desktop. The same page measured 60 fps on the real graphics card, so the low figure reflects the software renderer rather than real devices.
