# Architecture and decisions

Written in plain English so you can explain any part in an interview.

## The shape of the project
A static site: `index.html` holds the content, `css/styles.css` the look, `js/main.js` the behaviour, `js/ask.js` the search. Nothing is compiled. What you write is what the browser runs.

## Decisions and the reason for each
1. **No framework.** A portfolio is mostly reading. Plain HTML, CSS and JS loads faster, has nothing to break when dependencies change, and shows I understand what frameworks do for me. A move to Next.js later is easy because the content is already in clear sections.
2. **Themes with CSS variables.** Every colour is a variable. A theme is one block that redefines them, chosen through a `data-theme` attribute on `<html>`. No JavaScript re-paints anything, so switching is instant and there is no flash.
3. **System preference first.** With no saved choice, `prefers-color-scheme` decides. The saved choice is written to `localStorage` inside try/catch, because some browsers block storage.
4. **Accessibility built in.** Real buttons and links, one `h1`, a proper heading order, visible keyboard focus, 44px touch targets, `aria-expanded` on toggles, `inert` on closed panels, and `prefers-reduced-motion` switches off non-essential motion.
5. **Restrained motion.** Only things that respond to a user action, plus the ticker and one stamp per card. Everything animates `transform` and `opacity`, which the browser can do cheaply.
6. **Expand and collapse without measuring height.** Panels use `grid-template-rows: 0fr` to `1fr`. The browser animates the height, so no JavaScript has to measure anything.
7. **"Ask this page" is TF-IDF, not an LLM.** TF-IDF scores a word higher when it is rare across the page and frequent in a section. Cosine-style normalisation stops long sections winning by length. A tiny synonym map covers words like "cloud" meaning Azure. It is instant, free, needs no key, and cannot invent facts, which fits the principle behind my projects: answers must be traceable to a source.
8. **The search reads the page itself.** Every block marked `data-chunk` is indexed at load. Adding a project needs no search code.
9. **Sharing and SEO.** Open Graph and Twitter tags with a 1200 x 630 image, JSON-LD Person data, canonical URL, sitemap and robots.txt. `npm run set-domain` fills in the real address.
10. **Fonts.** Two families: Archivo (variable width and weight, so one file gives every headline style) and IBM Plex Mono for small labels. Loaded with `display=swap` so text is visible immediately.

## Eight interview talking points
1. Why I chose no framework, and how I would migrate to Next.js.
2. How CSS variables drive three themes and remove the flash of the wrong theme.
3. How TF-IDF retrieval works and why I chose it over an LLM here.
4. How the search picks the best sentence and highlights matched words.
5. The 0fr to 1fr grid trick for animated expand and collapse.
6. What I did for accessibility (keyboard, focus, inert, reduced motion).
7. How I keep motion cheap (transform and opacity, IntersectionObserver instead of scroll listeners).
8. How deployment works: Git push, Vercel builds, the site updates, and how the domain and DNS connect.

## Where each idea lives
- Themes: top of `css/styles.css` and `applyTheme()` in `js/main.js`.
- Cards and stamps: `.box`, `.entry`, `.stamp` in the CSS and the stamp observer in `js/main.js`.
- Search: `js/ask.js`, functions `tokens`, `expand`, `search`, `snippet`.
