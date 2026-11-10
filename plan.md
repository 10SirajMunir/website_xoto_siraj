# XOTO website redesign plan

The redesign of [xoto.ae](https://www.xoto.ae) runs in **8 phases**. Each phase ends with a review, and the next phase starts only after XOTO has signed off or sent changes. This file is the plan. How each phase is built is in [implement.md](implement.md).

**Status:** Phase 1 is ready for review (4 November 2026).

## Goals for every page

| Goal | What it means in practice |
|---|---|
| **Minimal** | White is the main colour, purple is used for headings and buttons, and black is kept for body text. Blue and green are small accents. One idea per screen. |
| **Easy to use** | Every action is a real button or link that is 44 px or larger, works with a keyboard, and has a clear label. Nothing important is hidden behind animation, hover or 3D. |
| **Fast** | Text appears on the first paint. Heavy media (video, 3D) loads after the page is usable, pauses when off screen, and is skipped for reduced motion or Data Saver. |
| **Good for SEO** | Headings, copy and links are server-rendered HTML. Each page has one `h1`, a title and a description. Words are never baked into video or 3D. |
| **More than a chatbot** | XO is the guide, but every page leads with XOTO's real services: buying, renting, selling, mortgages, home upgrades and the partner ecosystem. |

## The 8 phases

| Phase | Covers | Live pages it replaces | Status |
|---|---|---|---|
| **1. Foundation and landing hero** | Design tokens, navbar with dropdowns, hero (video, headings, 3D Downtown model, XO landing on the Burj Khalifa), XO chat widget | `/` (hero) | **Ready for review** |
| **2. Homepage** | Every section below the hero, and the footer | `/` | Sections from the earlier draft are in place and will be reviewed and redesigned |
| **3. Mortgages** | Mortgage service page, calculators, product pages, document upload and application flow | `/service/mortgage`, `/mortgages`, `/mortgages/calculator`, `/mortgages-product`, `/mortgage/*` | Not started |
| **4. Properties** | Buy and sell listings, property detail, rent search, results | `/properties`, `/buy-results`, `/Property`, `/rent/search`, `/results` | Not started |
| **5. Home upgrades** | Interiors, landscaping, AI design planner, XOTO Store, estimates and quotations | `/service/interior`, `/service/landscaping`, `/aiPlanner/*`, `/store`, `/estimate`, `/quotation` | Not started |
| **6. Ecosystem** | Agent ecosystem, partner ecosystem (developers, banks, service partners), Meet XO | `/agents`, `/ecosystem`, `/how-it-works` | Not started |
| **7. Knowledge and company** | Knowledge Hub (blogs, case studies, training), About, Contact, privacy policy, terms, 404 | `/Blogs`, `/blog/*`, `/case-studies`, `/training`, `/about`, `/contact`, `/privacy-policy` | Not started |
| **8. Accounts and launch** | Customer and partner log-in, registration, password reset, dashboard shell; Arabic right-to-left and other languages; accessibility, SEO and performance audit; testing in Safari and on real phones | `/login`, `/user/login`, `/register`, `/forgot-password`, `/dashboard/*` | Not started |

Links to pages from later phases stay in place. When someone clicks one, XO says which phase covers it, so a reviewer never reaches a dead end.

## Phase 1 in detail

**Hero layout (desktop).** The navbar sits at the top. The two headings, the buttons and the four features are on the left. The interactive 3D model is on the right. The skyline video plays behind everything at 30% opacity.

**Hero layout (phone).** The headings and buttons come first, with the model below them. The video plays behind both.

**Sequence when the page opens:**
1. The headline and buttons animate in on the first paint.
2. After about 0.65 s the Downtown Dubai model assembles. The neighbouring towers slide in from their side of the plinth, and the Burj Khalifa's bricks fly in alternately from the left and the right and stack up in the middle, with the spire dropping in last.
3. While it assembles, XO flies in from the top-left inside the 3D scene and circles the tower, passing behind the buildings, then lands on the tip of the spire beside the floating **Chat with XO** button and says hello.
4. The Burj Khalifa's LED facade switches on from the top down, like the real tower's light shows, and shows XOTO in purple and white with the letters stacked. It reads the same from whichever side the model is turned to.
5. Visitors can drag the model sideways to turn it and up or down to tilt it. After a tilt it eases back so XO's perch lines up again.
6. When the visitor scrolls past the hero, XO flies down to the floating chat button in the bottom-right corner, where it stays across the site.

**The model:**
- The Burj Khalifa is silver reflective glass with stainless-steel fins.
- The neighbours mix blue-grey glass, dark glazing and sand-coloured stone.
- XOTO's office is **One by Omniyat** in Business Bay, drawn as a dark mirrored-glass tower widening toward a cut-diamond crown on a stone podium. Its purple **XOTO HQ** pin links to Contact.

**Content** comes from the live site:

| Element | Text |
|---|---|
| Eyebrow | Discover · Finance · Enhance |
| `h1` | Your home journey, powered by AI |
| `h2` | Buy, rent, finance and upgrade your home in the UAE, all in one place. |
| Buttons | Get a home loan, Explore homes |
| Features | One-stop solution, Faster turnaround, Professional teams, Across the UAE |
| Model pins | Buy, Rent, Mortgages, XOTO HQ (One by Omniyat, Business Bay) |

**Navigation** follows the live site's menu: Buy, Rent, Sell, Mortgages, then dropdowns for Home upgrades, Partners and Knowledge Hub, with the language picker, Log in (Customer or Partner) and Contact us on the right. Below 1240 px wide these move into a full-screen menu.

## Decisions for XOTO to confirm

1. **Video:** the hero loop uses the first 2.8 seconds of `XOTO_Corporate.mp4`, slowed down and played forwards then backwards. Please confirm XOTO owns this footage, or supply another clip.
2. **3D model:** it is a stylised model built in code rather than an exact replica of Downtown Dubai. The surrounding towers are generic, so there are no licensing or likeness issues. A detailed model from a 3D artist could replace it later.
6. **Office:** please confirm the office is in **One by Omniyat** (One Business Bay), the tower at the Sheikh Zayed Road entrance to Business Bay. It is placed on the plinth where visitors can see it; the model is not to scale or a map.
7. **Background video:** we kept the current skyline loop. The Gemini clip shows the Business Bay canal, where the office is, but it has text burned in after 1.5 s. A version without text would be a strong replacement.
3. **Headlines and features** reuse the live copy. "Across the UAE" replaces "PAN UAE Presence".
4. **Buttons:** "Become an agent" and "Design my space" moved from the hero to the Partners and Home upgrades menus to keep the hero simple.
5. **Sell** links to `/properties`, as it does on the live site, until Phase 4 gives selling its own page.
