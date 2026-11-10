# XOTO website redesign (design build)

Next.js 16 (App Router), JavaScript, CSS Modules, three.js for the hero model. No animation libraries.

The work runs in 8 phases: see [plan.md](plan.md) for what each phase covers and [implement.md](implement.md) for how it is built and tested.

```bash
npm install
npm run dev     # http://localhost:5174 (5173 is left free for the current XOTO site)
```

## Structure

```
public/
  images/            Optimised photos, logos, contour motif, hero-city.webp (still of the 3D model)
  video/             Hero background loop (1280 and 720 wide) and its poster
  xo/                XO mascot rig layers (one file per body part)
src/
  app/               layout.js, page.js, globals.css (design tokens), fonts.js
  components/
    layout/          SiteHeader, SiteFooter, MotionProvider
    ui/              Button, PromptBar, SplitText, PhaseLink, Arrow
    xo/              XoProvider, XoMascot, XoBubble, XoChatPanel, XoStop
    home/            One component per homepage section; the hero is HeroSection + HeroVideo + HeroCity
  data/              Site content: navigation, homepage copy, languages
  hooks/             useScrollScrub
  lib/
    motion/          scrollEngine: the single scroll loop
    three/           downtownScene: the hero's 3D Downtown Dubai model
    xo/              mascotController (flight), answers (scripted replies)
    device.js        Low-end device detection (still hero instead of video and 3D)
    finance.js       Stand-in mortgage maths
```

## Adding XO to a section

Put this inside any `position: relative` section. XO flies there once the visitor pauses.

```jsx
<XoStop config={{ x: .85, y: .3, say: 'Your message', pose: 'wave', phone: true }} />
```

Poses: `wave`, `cheer`, `point`, `land`. Use `anchor: '#id'` to perch on an element. `phone: true` includes the stop on phones.

## Before production

- `src/lib/xo/answers.js` holds scripted replies. Replace it with the XO API.
- `src/lib/finance.js` holds illustrative maths. Replace it with XOTO's rule tables.
- `src/data/home.js` holds sample homes. Replace them with XOTO Grid data.
- `PhaseLink` shows a message for pages not designed yet. Swap it for `next/link` as pages are built.
- Confirm XOTO owns the corporate video the hero loop is cut from (`public/video`).
- After changing the 3D model, re-render `public/images/hero-city.webp` and update `STILL_TIP` in `HeroCity.jsx`.
