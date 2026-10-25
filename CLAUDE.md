# CLAUDE.md

## What this is

A humorous PWA for League of Legends players that suggests what to do **instead of queueing up**. Not a quit-League app: the goal is to break the "one more game" autopilot with a concrete, short, fun alternative. The user will play again, and that's fine.

## Source of truth: `research.md`

[research.md](research.md) is the source of truth for **audience, tone and content**. Read it before writing any copy, tips, categories or features. If something here conflicts with it, `research.md` wins (except tech decisions, which live here).

Key sections:
- §1–3: who the user is, why they keep queueing (hooks), what they complain about
- §4: numbers to use in copy (**1 game ≈ 27 min**, 2-loss stop rule)
- §5: tone of voice, DO/DON'T list, example lines
- §6: slang glossary
- §7: current events for "tip of the day" (**these expire**: re-check dates before shipping content)
- §8: MVP categories and rules for tips
- §9: feature ideas

## Tone (short version)

- **A fellow player and friend, not a therapist.** Casual, short, self-ironic. Joke *with* the user, never *at* them.
- Use League slang naturally, not in every sentence: tilt, one more game, can't end on a loss, ranked, LP, autofill, ff15, dodge, int, gg, diff, /mute all. **Don't use "touch grass"** anywhere in app copy (user decision, overrides research.md).
- **Zero moralizing.** No "you're wasting your life", no guilt about time or money, no clinical/addiction language anywhere in the UI.
- Tips are specific and doable in **≤ 27 minutes** ("20 push-ups", "one episode", "30 pages"). Roughly half of them carry a League reference; the rest are plain so it doesn't feel forced.
- Interface language: **English** (all UI text, tips, notifications, meta tags).

Good: "Dodge this queue. No LP penalty in real life."
Bad: "Gaming too much can harm your wellbeing. Consider taking a break."

## Legal / branding

- No Riot logos, champion/splash art, LoL wordmark, official fonts or UI look-alikes. Naming the game, champions and events in text is fine.
- Don't mock real pro players or be mean about specific champions' players.
- Include a short "not endorsed by Riot Games" disclaimer (footer/about).

## Tech

- **Static site, no backend.** Vite + React (plain JSX, no TypeScript) + framer-motion. No Tailwind, no shadcn, no CSS-in-JS: styling is plain CSS built on `tokens.css`.
- **Hosted on GitHub Pages.** `npm run build` writes the site to `dist/`; [.github/workflows/deploy.yml](.github/workflows/deploy.yml) publishes it on push to `main` (one-time: Settings → Pages → Source: GitHub Actions). The site lives under a subpath (`https://<user>.github.io/<repo>/`), so `vite.config.js` uses `base: "./"` and everything uses **relative paths**, including the future manifest `start_url`/`scope` and service worker cache list. In code, build public-file URLs from `import.meta.env.BASE_URL`.
- **PWA** via `vite-plugin-pwa` (config in `vite.config.js`): it writes `manifest.webmanifest` (name "Recall", standalone, portrait, colors `#0B0D10`, icons from `public/icons/`) and a Workbox service worker that precaches every page, script, style, font and icon, so the app works offline. `registerType: "autoUpdate"`: a new deploy is picked up on the next launch; no manual cache versioning. iPhone launch screens (`public/splash/*.jpg`, one per screen size) and the Apple meta tags live in `index.html`. Icons and launch screens are rendered from the real fonts and tokens; regenerate them if the logo or background changes.
- **Not indexed by search engines:** `<meta name="robots" content="noindex, nofollow">` on every page plus `public/robots.txt`.
- **User data stays on the device**: `localStorage` (or IndexedDB if it outgrows that). No accounts, no analytics, no third-party trackers, no network calls with user data. Wrap storage access in try/catch and keep the app usable when storage is unavailable. Version the stored data shape so future changes can migrate it.
- **Content as data**: tips, categories and tips-of-the-day live in `src/content.json`, separate from UI code, so content can be updated without touching logic. Tips of the day carry start/end dates so expired ones drop out automatically.

### Project structure

```
index.html            the app (Vite entry) -> src/main.jsx -> src/App.jsx
styleguide.html       styleguide (Vite entry)  -> src/styleguide.jsx
tips-review.html      content proofreading     -> src/tips-review.js
public/icons.svg      Lucide sprite, copied as-is to the build
src/content.json      all tip text
src/styles/           tokens.css, components.css, app.css (screen layouts), fonts/
src/App.jsx           screen switching: onboarding (first launch) -> main <-> settings
src/screens/          Onboarding (intro + category picker), MainScreen, Settings
src/components/       Splash, SwipeDeck, TipCard (+ CategoryTag), DailyTip, CategoryPicker,
                      Buttons (Button, IconButton, TwoStepButton), ScreenHeader, Icon,
                      IntroCarousel, IntroArt (3 SVG graphics), ProgressButton,
                      CategoryCloud (+ ChipCloud, CloudChip), BottomSheet, ReasonSheet, Beam
public/icons/, splash/ app icons and iPhone launch screens (PWA)
.github/workflows/    deploy.yml: build + publish to GitHub Pages on push to main
src/lib/              content helpers, useInfiniteDeck (shuffle bag), motionTokens, storage
vite.config.js        multi-page build, base "./"
```

Stored on device (`localStorage`, prefix `recall:v1:`): `prefs` (`{ categories: [...], onboarded: true }`; missing = first launch, show onboarding), `seen` (category tip ids shown in the current round) and `reason` (`{ id, at }`: last "why play?" answer, `id: null` = skipped).
- Mobile-first (designed at 390px, checked at 320, 360, 390 and 430), dark theme only, respects `prefers-reduced-motion`, accessible (semantic HTML, keyboard, text contrast ≥ 4.5:1).
- Breakpoints (CSS can't use variables in media queries, so these two are fixed numbers): `max-width: 374px` = narrow phones, `max-height: 700px` = short phones.

## Design system

- App name: **Recall** (going back to base to reset). Tagline: "Less queueing. More living." Logo is typography only: "Recall." in Sora Bold with the period in brand purple.
- [src/styles/tokens.css](src/styles/tokens.css) holds all design tokens, including the swipe/deck motion values (`--swipe-*`, `--deck-*`, `--duration-swipe-*`, `--ease-in`, `--haptic-swipe`); [src/lib/motionTokens.js](src/lib/motionTokens.js) reads them for framer-motion, so never hard-code motion numbers in JS. **Screens use only these variables**: no raw hex, font sizes, spacing or radii in screen CSS. Need a new value? Add a token first and show it in the styleguide.
- [src/styles/components.css](src/styles/components.css) holds shared component styles; React components live in `src/components/`. [styleguide.html](styleguide.html) is the **source of truth for all UI**: add or change a component there first (with its tokens), then use it on screens. Screens only compose styleguide components.
- **Swipe deck** ([SwipeDeck.jsx](src/components/SwipeDeck.jsx)): drag the top card with a finger (no swipe buttons); both directions = next tip, no like/dislike, no labels, no green/red; the drag glow uses the card's category color. Cards are see-through glass; the next card's content fades in with the drag (`--reveal`). At rest the top card has a near-solid backing (`--swipe-card-rest-solid`) so it reads cleanly; the backing fades to 0 as the drag reaches the swipe threshold. Cards are keyed by tip id, never array index. The deck is infinite via `useInfiniteDeck` (only selected categories, shuffled, no repeats until all were shown, persisted in `seen`). `lockScroll` on full-screen decks. Arrow keys as the keyboard fallback, short vibration on swipe, honors reduce motion.
- **"Tip of the day"** is its own block **under the deck**, never inside a tip card. It carries the **border beam** (`Beam.jsx`, reusable): a thin brand-purple beam fading into the accent, travelling around the rounded border (pure CSS: masked ring + GPU-rotated conic gradient; phase follows the clock so it never restarts; paused when the app is hidden via `html[data-hidden]`; reduce motion = static soft border). Tokens `--beam-*`, `--duration-beam-loop`. The tip cards do not get a beam.
- **Main screen layout:** side margin `--gutter-deck` (28px) for everything (header, reason row, deck, hint, "Tip of the day"), so the fanned back cards keep ~16px from the screen edge at every width (checked at 320, 360, 390, 430). The deck sits in `.deck-area` and keeps `--card-aspect`. Scrolling screens keep `--gutter` (16px).
- **Screen transition "gather into the deck"** (picker -> main, reusable): selected chips fly into the deck spot, glow and dissolve (`ChipCloud gatherTo`), the rest fades; then the deck rises on a spring with the back cards fanning out after it (`SwipeDeck rise`, `.app--enter`). Under 1s, tokens `--duration-gather*`, `--gather-*`, `--ease-gather`, `--rise-*`, `--spring-rise-*`; reduce motion = crossfade.
- **Bottom sheet** (`BottomSheet.jsx`): reusable; slides up on a spring over a dimmed, slightly blurred backdrop; closes by dragging down, backdrop tap, Escape or the phone's back button (it pushes a history entry); everything behind it is inert while open; reduce motion = fade. Tokens: `--sheet-*`, `--spring-sheet-*`, `--radius-sheet`.
- **"Why play?" check-in** (`ReasonSheet.jsx`, research.md §2 hooks): the sheet slides up every time the main screen opens after a launch (after the splash) and right after first-time onboarding, `--sheet-open-delay` after the screen appears. Six single-select reasons as brand-purple cloud chips (`ChipCloud tone="brand"`), the last answer preselected. Tapping a chip only selects it; the footer button "Show me tips" (disabled until something is selected) confirms and closes the sheet; the reason is applied after the closing animation (`onExited`), then the reaction line fades in (`--duration-reaction-in`) and the deck swaps cards gently (non-swiped cards fade out instead of flying). Swipe down / backdrop / back = skip: on launch it clears the reason, after opening it from the reason pill it keeps the current one. With a reason, the main screen shows its reaction line and the deck deals that reason's tips first (`lead` in `useInfiniteDeck`), then the selected categories as usual. Reason content (`reasons`, `reasonTips` with ids `r-<reason>-NN`, each tip with a category for color/icon) lives in `content.json`.
- **Splash** (`Splash.jsx`) on every launch: the "Recall." wordmark alone fades and glows in, stays ~2s on first launch (then onboarding) or ~1s later (then the main screen), and fades out over that screen; a tap skips it; reduce motion = plain fade. Timings are `--duration-splash-*` tokens.
- **No white flash:** the first frame, the splash, the app body and the future PWA manifest (`background_color` and `theme_color`) all use `#0B0D10` = `--color-bg`. The inline style on `<html>` in `index.html` is the one allowed raw hex, because it paints before any CSS loads. Keep all of these in sync if the background ever changes.
- **App flow:** onboarding only on first launch: 3 swipeable intro screens (`IntroCarousel`: SVG graphic from `IntroArt`, headline, subtext; a `ProgressButton` whose ring fills a third per screen and turns into a checkmark on the last; "Skip" in the top corner), then the category picker: `CategoryCloud` (big pill chips that fall in with a spring, some tilted; selecting fills the chip with its category color and draws a checkmark in; "Continue" stays disabled until one category is picked). Settings keeps the compact two-column `CategoryPicker` (small selection chips). Intro copy lives in `INTRO_SLIDES` in `src/screens/Onboarding.jsx`. Later launches open straight to the main screen. Settings opens from the gear icon, has its own history entry (the phone's back gesture closes it), saves category changes immediately (at least one stays on) and has a two-step "Reset app" that clears all `recall:v1:` data and shows onboarding again.
- Brand purple (`--color-brand*`) is for UI only (buttons, toggles, links, focus, active). It's never used as a category color.
- Each of the 8 categories has its own color (`--cat-*`) and Lucide icon. Put `data-category="<id>"` on an element and use `var(--cat)`: it shows on the tag, the card's edge/glow and the icon. IDs: `sports`, `movies`, `reading`, `outdoors`, `cooking`, `sleep`, `music`, `friends`.
- Icons: Lucide only, from the [public/icons.svg](public/icons.svg) sprite (in React: `<Icon id="..."/>`). Add new icons to the sprite from the same Lucide version.
- Fonts: Sora 700 for headings and tip titles, Sora 600 for small headings and numbers, Inter 400/500 for everything else. They're **self-hosted** in `src/styles/fonts/` (variable woff2, latin + latin-ext, SIL OFL with license files) and declared in `tokens.css`. Never load fonts from Google Fonts or any other CDN: the app has to work offline (the service worker precaches them automatically).
- **No all-caps text.** Small labels (tags, hints, "Tip of the day") use the sentence-case `.label` style (Inter 500, `--text-label` 13px); group headings like Settings sections use `.section-label` (Sora 600, 15px).
- Style: clean and geometric. No hand-drawn elements (brush strokes, scribbles, sketched illustrations).

## Running locally

Install once, then start the dev server (`.claude/launch.json` has `dev` on port 5173 and `preview` on 4173):

```bash
npm install
```

```bash
npm run dev
```

Pages: `/` (main screen), `/styleguide.html`, `/tips-review.html`. `npm run build` then `npm run preview` checks the production build.

## Publishing

- Live app: **https://vikagorod26.github.io/recall/** · repository: https://github.com/vikagorod26/recall (public).
- To publish changes: commit and `git push` to `main`. The "Deploy to GitHub Pages" workflow builds and deploys in about 30 seconds (`gh run list` shows it). Users get the new version on their next launch (service worker auto-update).
- Commits use the GitHub noreply email (repo-local `git config user.email`), so the owner's real email never lands in the public history. Keep it that way.
- After deploying, test the live URL, not just `npm run dev`: the production build minifies CSS (e.g. `2000ms` becomes `2s`), which only shows up there. `src/lib/motionTokens.js` reads both `ms` and `s` for this reason.

## Content files

- [src/content.json](src/content.json) is the single source of all tip text: categories, 20 tips per category (title ≤ 6 words, text ≤ 15 words, `minutes` ≤ 27, `league` flag, ~half `true`), and `tipsOfTheDay` with `starts`/`expires` (inclusive) plus a `fact` noting what each is based on. Pages never hard-code tip text; they import it through `src/lib/content.js` (the review page imports the JSON directly).
- Before adding tips of the day, verify current events on the web (Worlds stage, patch, events, skins) and set `expires`. The last tip of the day currently expires 2027-01-20; after that "Tip of the day" disappears until new ones are added.
- [tips-review.html](tips-review.html) lists all content for proofreading, including the "why play?" reasons, their reaction lines and tips.

## Content checklist (before adding/changing copy)

1. Does it sound like a teammate in voice chat, not a wellness app?
2. Is it concrete and ≤ 27 min?
3. Any shame, guilt or moralizing? Remove it.
4. Slang used correctly (check the glossary in `research.md` §6)?
5. Time-bound reference (Worlds, patch, event)? Add an expiry date.
