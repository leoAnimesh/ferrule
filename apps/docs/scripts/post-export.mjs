// GitHub Pages serves files, so each route gets its own index.html with its own title. 404.html handles anything else.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const GEN = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/generated');
const pages = JSON.parse(fs.readFileSync(path.join(GEN, 'pages.json'), 'utf8'));
const props = JSON.parse(fs.readFileSync(path.join(GEN, 'props.json'), 'utf8'));
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function write(route, title, description) {
  const page = html
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(description)}`);
  const dir = path.join(DIST, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page);
}

for (const [id, page] of Object.entries(pages)) write(`docs/${id}`, `${page.title} · Ferrule`, page.blurb);
for (const id of Object.keys(props)) write(`docs/${id}`, `${id} · Ferrule`, `The ${id} component: preview, usage, props and accessibility.`);
fs.copyFileSync(path.join(DIST, 'index.html'), path.join(DIST, '404.html'));
console.log(`site: ${Object.keys(pages).length + Object.keys(props).length} routes written to ${DIST}`);
