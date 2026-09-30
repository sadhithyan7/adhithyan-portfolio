// Usage: npm run set-domain -- https://your-site.vercel.app
// Replaces the YOUR-SITE.vercel.app placeholder in index.html, sitemap.xml and robots.txt.
import { readFileSync, writeFileSync } from 'node:fs';

const arg = process.argv[2];
if (!arg || !/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(arg)) {
  console.error('Give the full address without a trailing slash, for example:\n  npm run set-domain -- https://adhithyan.vercel.app');
  process.exit(1);
}
const host = arg.replace(/^https:\/\//, '');
for (const file of ['index.html', 'sitemap.xml', 'robots.txt']) {
  const before = readFileSync(file, 'utf8');
  const after = before.replaceAll('YOUR-SITE.vercel.app', host);
  writeFileSync(file, after);
  console.log(`${file}: ${before === after ? 'nothing to change' : 'updated'}`);
}
