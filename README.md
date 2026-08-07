# Prism — Financial Education PWA (Phase 1)

> *Filter the Noise. Invest in Your Life.*
> Free financial-education tools for India's Gen Z. **No login, no PII, no real money.**
> Everything is for **learning purposes only** — Prism is **not** a SEBI Registered Investment Advisor.

A self-contained, offline-capable Progressive Web App built to the *Prism – Phase 1* spec.
UI follows **Google Material Design 3 (Material You)** with the brand "Verdant" palette
(forest green `#1d6b3a` + saffron `#e07b1a`). Every tool and lesson is grounded in
published **behavioural-science research** (a running "Behaviour Lab" thread).

## Run it

No build step, no dependencies. Any static server works:

```bash
cd web
python3 -m http.server 8080
# open http://localhost:8080
```

Or deploy the `web/` folder as-is to Vercel / Netlify / GitHub Pages / any static CDN.

> **Note:** ES modules + the service worker require `http://` (not `file://`).
> For local development you may want a server that sends `Cache-Control: no-store`
> so module edits reload instantly.

## What's inside (Phase 1 scope, all built)

| Screen | Contents |
|---|---|
| **Home** | Hero, rotating "Today's Financial Fact" (30), popular-tools strip, featured lessons, footer disclaimer |
| **Simulate** | 6 working calculators: SIP · Lumpsum vs SIP · FIRE · Opportunity Cost · Budget (50/30/20) · Stress Test |
| **Learn** | 10 fully-written lessons, each with 1 interactive widget, a Behaviour Lab, a shareable takeaway, and a CTA |
| **Decode** | 19-instrument decoder with fuzzy client-side search + category filters and risk meters |
| **About** | What/why/promise, the science, 20-question Quick Answers (FAQ), Phase-2 teaser, **waitlist** (only data field), full disclaimers, privacy note |

- **PWA**: `manifest.json` + `sw.js` (cache-first, all calculators & lessons work fully offline; installable on Android/iOS home screen).
- **Light + dark mode** (follows system, manual toggle in the top bar).
- **Mobile-first** (375px) with a Material bottom navigation bar; desktop top nav.
- **All maths client-side** — no backend, no API latency. Returns are **category-level assumptions**, never fund-specific.
- **Charts** are hand-rolled dependency-free SVG (donut / line / bars) — no CDN, keeps it tiny and offline.
- **Privacy**: cookieless by design; the waitlist email is the only PII the app can collect (wired as a demo — connect Resend/Mailchimp for production).

## Behavioural science woven in

Loss aversion & prospect theory (Kahneman & Tversky), present bias / hyperbolic discounting
(Laibson), mental accounting & *Save More Tomorrow* (Thaler; Thaler & Benartzi), *Nudge*
defaults (Thaler & Sunstein), delayed gratification (Mischel), the pain of paying (Prelec &
Loewenstein), and the UPI/BNPL friction problem — each surfaced where it changes a decision.

## Structure

```
web/
├── index.html            # app shell, fonts, inline SVG icon sprite, nav
├── manifest.json         # PWA manifest (data-URI icons)
├── sw.js                 # offline service worker
├── css/styles.css        # Material Design 3 design system + Verdant theme
└── js/
    ├── app.js            # hash router, nav, theme, PWA registration
    ├── ui.js             # DOM helpers + shared components (disclaimers, sliders…)
    ├── finance.js        # pure client-side financial math (SIP, FIRE, budget, …)
    ├── charts.js         # dependency-free SVG charts
    ├── data/             # facts · modules · instruments · faq (all hardcoded)
    └── screens/          # home · simulate · learn · decode · about
```

## Compliance (Phase 1 = Financial Education)

- Footer legal disclaimer on every page; "for learning purposes only" on every calculator result.
- "Educational overview. Not a recommendation to buy or sell." on every instrument.
- No "buy this fund" language; no specific fund recommendations; calculators use category returns.
- Explicit risk warnings on F&O, crypto, and chit-fund cards.
- No tracking cookies, no consent banner needed.

## Not built in Phase 1 (by design)

Login/OTP, KYC/PAN/Aadhaar, real SIP execution, persistent portfolios, bank linking (AA),
payments, gamification/streaks, and the personalised "Artha" AI coach — all deferred to Phase 2
(replaced here by session-only tools, the static Learning Path, and the Quick Answers FAQ).
