# Adhithyan S — Portfolio

Personal developer portfolio: full-stack and applied GenAI. A static site made of plain HTML, CSS and JavaScript. No framework and no build step, so it opens instantly and deploys anywhere.

**Features**
- Three themes (Paper, Mono, Night) built on CSS variables. The choice is remembered, and the first visit follows the visitor's system setting.
- "Ask this page": an in-browser search (TF-IDF) that answers recruiter questions using only the page's own text and cites the section each answer came from. No language model, no API, no server.
- Projects with measured results, expandable "How I built it" details, and stamps that land once as cards scroll into view.
- Keyboard-friendly, mobile-first, respects `prefers-reduced-motion`, printable.

## Run it

Easiest: double-click `index.html`.

Or with a local server (recommended, closer to production):

```bash
npm run dev        # serves http://localhost:3000  (needs Node.js)
```

Before you deploy, run the sanity check:

```bash
npm run check
```

## Folder tour

```
adhithyan-portfolio/
├── index.html            All the content and structure (edit your text here)
├── css/styles.css        Design tokens (themes) at the top, then components
├── js/main.js            Themes, mobile menu, expand/collapse, stamps, scroll-spy, copy email, photo
├── js/ask.js             The "Ask this page" retrieval engine
├── assets/
│   ├── favicon.svg
│   ├── og-image.png      1200x630 social preview (shown when the link is shared)
│   └── photo.jpg         (you add this) your portrait; appears automatically
├── resume.pdf            Linked from the Résumé buttons
├── robots.txt, sitemap.xml, vercel.json
├── scripts/              set-domain.mjs and check.mjs helpers
├── DEPLOY.md             Step-by-step deployment for beginners
├── TODO.md               What you still need to fill in
└── docs/ARCHITECTURE.md  Why it is built this way + interview talking points
```

## How to change things

**Add or edit a project.** In `index.html`, find a block that starts `<article class="box entry"` and copy it. Change the title, sentence, metric numbers, tags and links. Give it a colour with `style="--a:var(--a3)"` (pick `--a1` to `--a7`). The search picks it up automatically because the block carries a `data-chunk="..."` label.

**Change colours or fonts.** Open `css/styles.css`. The first 30 lines hold every colour for each theme (`:root`, `[data-theme="dark"]`, `[data-theme="mono"]`).

**Add your photo.** Save it as `assets/photo.jpg` (around 800 x 880 px, portrait). It replaces the yellow "AS" card by itself.

**Replace the drawn product previews with screenshots.** In the project block, replace the `<div class="preview ...">` with `<img class="preview" src="assets/lexicon.png" alt="Lexicon search results with citations" loading="lazy">`.

**Change the social preview.** Replace `assets/og-image.png` (keep 1200 x 630).

## Deploy

See **DEPLOY.md**. Short version: push to GitHub, import the repo in Vercel, click Deploy, then run `npm run set-domain -- https://your-address`.

## Credits

Design and code by Adhithyan S. Fonts: Archivo and IBM Plex Mono via Google Fonts (SIL Open Font License).
