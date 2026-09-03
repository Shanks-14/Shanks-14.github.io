# Shashank Shetty — 3D Portfolio

An interactive, WebGL-powered portfolio for Shashank Shetty, Data Analyst
(SQL · Python · Azure · Data Visualisation). Built with **Vite + vanilla
JavaScript + Three.js + GSAP** — no framework, but real 3D, real
scroll-driven animation, and a build pipeline that produces a fully static
site deployable to **GitHub Pages**.

This is a from-scratch, original implementation. It was built after
reviewing the general feature set of `akashrmalhotra.netlify.app` (a WebGL
hero scene, GSAP-driven scroll animation, a custom cursor, and 3D hover
interactions) and recreating that *category* of experience with original
visuals, original code, and content built around Shashank's actual résumé —
nothing here is copied from that site's source, assets, or design.

---

## 1. What's new versus the previous (static) version

| Feature | Before | Now |
|---|---|---|
| Hero background | CSS grid pattern | Live WebGL "data constellation" — a rotating wireframe icosahedron (structured schema) inside a particle field (unstructured data), connected by pulsing query lines, with mouse-parallax and scroll-reactive camera |
| Scroll animation | `IntersectionObserver` fade-ins | GSAP + ScrollTrigger timelines, with a staggered hero entrance sequence |
| Cursor | Native | Custom dot + trailing ring cursor that expands over links/buttons (mouse-only; untouched on touch devices) |
| Cards | Flat | Real 3D tilt-on-hover (perspective + rotateX/rotateY, driven by cursor position) on every card in the page |
| Build | None (plain files) | Vite — bundled, minified, code-split (Three.js loads as a separate lazy chunk so it never blocks the rest of the page) |
| Hosting | Any static host | GitHub Pages, with a GitHub Actions workflow that deploys automatically on every push |

All of the original content — About, Skills, Experience, Projects,
Education, Contact — is unchanged in substance; it's the same résumé data,
now presented with real depth.

---

## 2. Project structure

```
portfolio3d/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions: build + deploy to GitHub Pages on push
├── public/                      # Copied as-is into the build output
│   ├── icons/favicon.svg
│   └── resume/Shashank_Shetty_Resume.pdf
├── src/
│   ├── main.js                  # Entry point — wires up every module
│   ├── modules/
│   │   ├── scene.js              # Three.js hero scene (the "data constellation")
│   │   ├── cursor.js             # Custom cursor (mouse-only, safe on touch)
│   │   ├── tilt.js                # 3D tilt-on-hover for cards
│   │   ├── reveal.js              # GSAP + ScrollTrigger scroll animations
│   │   ├── nav.js                 # Header, mobile menu, active-link, smooth scroll
│   │   ├── typewriter.js          # Hero's animated SQL query
│   │   └── contactForm.js         # mailto form + copy-to-clipboard
│   └── styles/
│       └── main.css               # All styling: design tokens, layout, responsive rules
├── index.html                    # Single HTML entry point (Vite processes this directly)
├── vite.config.js                # `base: './'` — makes the build portable to any GitHub Pages path
├── package.json
└── README.md
```

Every module in `src/modules/` does one job and is independent: if the 3D
scene fails to initialise (e.g. no WebGL support), the rest of the site —
navigation, content, the contact form — keeps working normally. This is
enforced in `main.js`, which wraps every module's startup in its own
try/catch.

---

## 3. Run it locally

You'll need **Node.js 18 or later** (Node 20 recommended — it's what the
GitHub Actions workflow uses).

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (hot-reloads on save)
npm run dev
```

Vite will print a local URL (typically **http://localhost:5173**) — open
it in a browser.

**Other useful commands:**

```bash
npm run build     # Produces the production build in dist/
npm run preview   # Serves the dist/ build locally, exactly as it will run when deployed
```

Always run `npm run build && npm run preview` at least once before
deploying — it's the closest thing to what a visitor will actually see.

---

## 4. Before you publish

Two contact links are placeholders because the résumé only listed
"Linkedin" / "Github" as labels, not URLs. In `index.html`, find and
update these two lines with your real profile URLs:

```html
<a href="#" class="contact-value" id="linkedin-link" ...>linkedin.com/in/shashank-shetty</a>
<a href="#" class="contact-value" id="github-link" ...>github.com/shashank-shetty</a>
```

---

## 5. Host it on GitHub Pages

The build output is fully static, so GitHub Pages is free and requires no
server. This project includes a ready-to-use GitHub Actions workflow that
builds and deploys automatically — you don't need to build locally or push
a `dist/` folder yourself.

### Step 1 — Create a repository and push this project

```bash
git init
git add .
git commit -m "Initial 3D portfolio"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

(If your repo is named exactly `<your-username>.github.io`, your site will
be live at the root of that domain. Any other repo name works too — see
Step 3 for the resulting URL.)

### Step 2 — Turn on GitHub Pages with the "GitHub Actions" source

1. In your repository on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**
   (*not* "Deploy from a branch" — this project ships its own workflow).
3. That's it — no further configuration needed. The workflow at
   `.github/workflows/deploy.yml` handles the rest.

### Step 3 — Watch it deploy

1. Go to the **Actions** tab in your repository. You should see a
   "Deploy to GitHub Pages" run start automatically (triggered by your
   push in Step 1).
2. Once it finishes (usually under a minute), go back to
   **Settings → Pages** — GitHub will show your live URL:
   - `https://<your-username>.github.io` if your repo is named
     `<your-username>.github.io`
   - `https://<your-username>.github.io/<repo-name>` for any other repo name

Thanks to `base: './'` in `vite.config.js`, the build works correctly at
either kind of URL without any changes.

### Updating the site later

```bash
git add .
git commit -m "Update portfolio"
git push
```

Every push to `main` re-triggers the Actions workflow and redeploys
automatically — there's nothing else to run.

---

## 6. Tech stack & why

| Tool | Why it's here |
|---|---|
| **Vite** | Fast dev server, minimal config, first-class ES module bundling, and a build output that's just static files — perfect for GitHub Pages |
| **Three.js** | The hero's WebGL scene (wireframe icosahedron, particle field, camera/mouse interaction) |
| **GSAP + ScrollTrigger** | Scroll-triggered reveals and the hero's entrance timeline. Every GSAP plugin — including ScrollTrigger, which used to require a paid Club GreenSock membership — has been 100% free, including for commercial use, since Webflow acquired GreenSock in 2024 and made the whole toolset free in April 2025. No license key or account is needed; `npm install gsap` gives you everything. ([source](https://webflow.com/blog/gsap-becomes-free)) |
| Vanilla JS (no framework) | The site has no client-side routing or complex shared state — a framework would add bundle size and build complexity without a real benefit here |

---

## 7. Accessibility & performance notes (from the code review pass)

- **`prefers-reduced-motion` is respected everywhere**: the 3D scene skips
  its animation loop and renders a single static frame, GSAP timelines
  jump straight to their end state, the custom cursor stops using a
  trailing-lerp animation, and card tilt is disabled outright.
- **Touch devices never get a broken cursor or stuck hover state**: the
  custom cursor and 3D tilt both check `window.matchMedia('(pointer:
  fine)')` before activating, and re-verify on every pointer event so a
  2-in-1 device switching between touch and mouse doesn't get stuck in the
  wrong mode.
- **The WebGL scene pauses when it can't be seen**: an
  `IntersectionObserver` stops the render loop the moment the hero
  scrolls out of view, and the Page Visibility API stops it when the tab
  is backgrounded — it never spends CPU/GPU/battery on an invisible
  canvas.
- **Three.js is code-split**: it's dynamically `import()`-ed only when a
  hero canvas exists, so it loads as its own ~130KB (gzipped) chunk that
  never blocks the rest of the page's JS from parsing and running.
- **Graceful WebGL failure**: if WebGL isn't available at all (or
  `getContext` throws on some exotic browser/GPU combination), the canvas
  is simply removed — the hero's CSS gradient background is a complete,
  intentional-looking fallback on its own. The rest of the page is
  entirely unaffected.
- **A real bug was found and fixed during testing**: several cards use
  both a GSAP-driven scroll reveal (`.reveal-up`) and a CSS-driven 3D tilt
  (`.tilt`) on the same element. Originally, `.reveal-up`'s resting state
  declared a static `transform: translateY(28px)` in CSS; once GSAP
  finished animating and cleared its own inline transform, that static
  CSS rule won the cascade back from `.tilt` (same specificity, declared
  later in the stylesheet) and permanently froze the card at a flat
  offset — the tilt effect silently stopped working on any card that had
  ever scrolled into view. The fix: `.reveal-up` no longer declares
  `transform` in CSS at all; `reveal.js` now uses `gsap.fromTo()` to set
  that starting offset explicitly and in code, so once the reveal
  animation's `clearProps: 'transform'` runs, `.tilt`'s CSS rule is the
  only one left standing. Verified by comparing the computed transform
  matrix at opposite corners of a card after its reveal animation
  completed.
- **No inline `<style>` flash**: `.reveal-up` / `.reveal-line` elements
  are hidden via CSS `opacity: 0` by default (so there's no flash of fully
  visible content before JS attaches), and a `<noscript>` block forces
  them visible if JavaScript is disabled entirely, so the page still reads
  correctly with no script running at all.
- **Every feature module fails independently**: `main.js` wraps each
  module's initialisation in its own try/catch, so a failure in, say, the
  3D scene can never take down navigation, content, or the contact form.

---

## 8. Testing performed

- **Production build tested, not just dev mode** — every check below ran
  against `npm run build` + `npm run preview`, i.e. the real optimised
  output GitHub Pages will serve.
- **Automated browser testing (Playwright/Chromium)**, covering:
  - WebGL context creation and rendering on both a standard desktop
    viewport and real device emulation (iPhone 13)
  - The hero's typewriter animation and results-table reveal
  - GSAP scroll-reveal firing correctly across all 30 revealed elements
    on the page (verified with real incremental scrolling, not just a
    single full-page snapshot, which can under-report elements that
    haven't been scrolled past yet)
  - Animated stat counters
  - Custom cursor: position tracking, hover-state expansion, and —
    critically — that it stays **completely inactive** under real
    touch-device emulation (`pointer: coarse`), leaving the native cursor
    untouched
  - 3D tilt on every card type (stat cards, schema tables, timeline
    cards, project cards, education cards), including the cascade bug
    described above
  - Mobile navigation (open/close, closes on link click)
  - Contact form validation and the copy-to-clipboard button
  - Zero horizontal overflow at any scroll position, on both a 1440px
    desktop viewport and a 390px mobile viewport
  - Zero uncaught page errors (`pageerror` listener) across every test run
- **Manual visual review** of full-page screenshots at both desktop and
  mobile breakpoints, plus the mobile menu open state.

The only console noise observed during testing was (a) a `403` from
Google Fonts, which is specific to the sandboxed build environment's
network allowlist and not present on a normal internet connection, and
(b) informational WebGL driver messages from the test environment's
software GPU fallback (SwiftShader) — neither indicates a problem with
the site's code.

---

## 9. Customising further

- **Colours, fonts, spacing**: CSS custom properties at the top of
  `src/styles/main.css` under `:root`.
- **3D scene appearance**: `src/modules/scene.js` — geometry, particle
  count, colours, and rotation/parallax speeds are all clearly labelled
  constants near the top of the relevant functions.
- **Copy/content**: edit directly in `index.html`.
- **Resume file**: replace `public/resume/Shashank_Shetty_Resume.pdf` any
  time; keep the filename the same, or update the `href` on the nav's
  "resume" button in `index.html` if you rename it.

---

Built with Vite, Three.js, GSAP and vanilla JavaScript. No UI framework,
no CMS, no server — clone it, `npm install`, and it runs.
