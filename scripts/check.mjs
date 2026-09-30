// Usage: npm run check
// Quick sanity check before you deploy: every local file the page links to must exist,
// every in-page #link must point at a real id, and leftover placeholders are listed.
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
let problems = 0;
const fail = (m) => { console.error('x ' + m); problems++; };

const files = [...html.matchAll(/(?:src|href)="([^"#?:]+\.[a-z0-9]+)"/gi)].map((m) => m[1]).filter((f) => !f.startsWith('http'));
const optional = new Set(['assets/photo.jpg']); // shown automatically once you add it
for (const f of new Set(files)) if (!existsSync(f) && !optional.has(f)) fail(`missing file: ${f}`);

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!ids.has(m[1])) fail(`broken in-page link: #${m[1]}`);

if (html.includes('YOUR-SITE.vercel.app')) console.warn('! domain placeholder still present: run  npm run set-domain -- https://your-address');
if (!existsSync('assets/photo.jpg')) console.warn('! no assets/photo.jpg yet: the AS placeholder is showing');
console.log(problems ? `\n${problems} problem(s) found` : '\nAll local links and files are fine.');
process.exit(problems ? 1 : 0);
