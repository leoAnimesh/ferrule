// GitHub Pages serves files, so each route gets its own index.html with its own title. 404.html handles anything else.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const GEN = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/generated');
const pages = JSON.parse(fs.readFileSync(path.join(GEN, 'pages.json'), 'utf8'));
const props = JSON.parse(fs.readFileSync(path.join(GEN, 'props.json'), 'utf8'));
const samples = JSON.parse(fs.readFileSync(path.join(GEN, 'samples.json'), 'utf8'));
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const SITE = 'https://leoanimesh.github.io/ferrule/';
// The display name, as the page itself shows it: `swipe-row` is SwipeRow.
const componentName = (id) => props[id].find((group) => group.name.toLowerCase() === `${id.replace(/-/g, '')}props`)?.name.replace(/Props$/, '') ?? id;

const pkg = JSON.parse(fs.readFileSync(path.join(DIST, '../../../packages/ferrule/package.json'), 'utf8'));
const REPO = 'https://github.com/leoAnimesh/ferrule';
const IMAGE = { url: `${SITE}media/preview.jpg`, width: 1920, height: 1200, alt: 'Ferrule components on iOS, Android and web' };
// Each component's one-line summary, as the page shows it, from the docs app's own table.
const blurbs = Object.fromEntries([...fs.readFileSync(path.join(DIST, '../src/components.ts'), 'utf8').matchAll(/slug: '([a-z-]+)', title: '[^']+', blurb: '((?:[^'\\]|\\.)*)'/g)].map((m) => [m[1], m[2].replace(/\\'/g, "'")]));

/** Everything a crawler or a reader without JavaScript needs. The app replaces it on load with the same content, live. */
function staticBody({ title, description, body }) {
  const link = (route, text) => `<li><a href="/ferrule/${route}">${escape(text)}</a></li>`;
  const nav = [link('', 'Home'), ...Object.entries(pages).map(([id, page]) => link(`docs/${id}`, page.title)), ...Object.keys(props).map((id) => link(`docs/${id}`, componentName(id)))].join('');
  return `<div class="static"><main><h1>${escape(title)}</h1><p>${escape(description)}</p>${body}</main><nav aria-label="Docs"><ul>${nav}</ul></nav></div>`;
}

function propsTable(id) {
  const rows = props[id].flatMap((group) => group.members.map((member) => `<tr><td><code>${escape(member.name)}</code></td><td><code>${escape(member.type)}</code></td><td>${escape(member.default ?? '')}</td><td>${escape(member.doc ?? '')}</td></tr>`));
  return `<h2>Props</h2><table><thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

const json = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const routes = [];
const seen = { title: new Set(), description: new Set() };

function write(route, { title, heading = title, description, body = '', schema }) {
  routes.push(route);
  // Self-check, so a duplicate or a missing heading fails the build instead of reaching search results.
  for (const [key, value] of Object.entries({ title, description })) {
    if (seen[key].has(value)) throw new Error(`duplicate ${key} on /${route}: ${value}`);
    seen[key].add(value);
  }
  if (!heading || /<h1[\s>]/.test(body)) throw new Error(`/${route} needs exactly one h1`);
  const url = SITE + route;
  const page = html
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escape(description)}`)
    .replaceAll(SITE + '"', `${url}"`)
    .replace('</head>', `<meta property="og:image:width" content="${IMAGE.width}" /><meta property="og:image:height" content="${IMAGE.height}" /><meta property="og:image:alt" content="${IMAGE.alt}" /><meta name="twitter:title" content="${escape(title)}" /><meta name="twitter:description" content="${escape(description)}" /><meta name="twitter:image" content="${IMAGE.url}" />${json(schema(url, description))}<style>.static{max-width:46rem;margin:0 auto;padding:24px 16px;font:16px/1.5 system-ui,sans-serif}.static table{border-collapse:collapse}.static td,.static th{border:1px solid #ccc;padding:4px 8px;text-align:start}.static pre{overflow:auto}</style></head>`)
    .replace('<div id="root"></div>', `<div id="root">${staticBody({ title: heading, description, body })}</div>`);
  const dir = path.join(DIST, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page);
}

const article = (headline) => (url, description) => ({ '@context': 'https://schema.org', '@type': 'TechArticle', headline, description, url, inLanguage: 'en', isPartOf: { '@type': 'WebSite', name: 'Ferrule', url: SITE }, about: { '@type': 'SoftwareSourceCode', name: 'Ferrule', codeRepository: REPO } });
const homeDescription = html.match(/<meta name="description" content="([^"]*)"/)[1];
write('', {
  title: html.match(/<title>(.*?)<\/title>/)[1],
  heading: 'React Native UI library for iOS, Android and web',
  description: homeDescription,
  body: `<h2>Install</h2><pre><code>npm install ${pkg.name}\nnpx ferrule init --fix\nnpx ferrule add button input</code></pre><p>Ferrule is 0.x. <a href="/ferrule/docs/platforms">Platform status</a> says what has been run, on what.</p><p><a href="${REPO}">Source on GitHub</a>, MIT licensed.</p>`,
  schema: (url, description) => ({ '@context': 'https://schema.org', '@type': 'SoftwareSourceCode', name: 'Ferrule', description, url, codeRepository: REPO, programmingLanguage: ['TypeScript', 'Swift', 'Kotlin'], runtimePlatform: ['iOS', 'Android', 'Web'], license: 'https://opensource.org/licenses/MIT', version: pkg.version, author: { '@type': 'Person', name: pkg.author.replace(/\s*\(.*\)$/, ''), url: 'https://github.com/leoAnimesh' }, sameAs: [`https://www.npmjs.com/package/${pkg.name}`] }),
});
for (const [id, page] of Object.entries(pages)) write(`docs/${id}`, { title: `${page.title} · Ferrule React Native UI`, heading: page.title, description: `${page.title} for Ferrule, a React Native UI library for iOS, Android and web. ${page.blurb}`, body: page.html, schema: article(page.title) });
for (const id of Object.keys(props)) {
  const name = componentName(id);
  const description = `${name}, a React Native component for iOS, Android and web: ${blurbs[id] ?? 'preview, usage, props and accessibility.'}`;
  const sample = samples[id] ? `<h2>Usage</h2>${samples[id].html}` : '';
  write(`docs/${id}`, { title: `${name} · React Native component · Ferrule`, heading: name, description, body: sample + propsTable(id), schema: article(name) });
}

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${SITE}${route}</loc></url>`).join('\n')}\n</urlset>\n`);
// A project site cannot serve the host's robots.txt, so this one only helps where /ferrule/robots.txt is read. The sitemap is also linked from the docs.
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, '404.html'), html.replace(/<link rel="canonical"[^>]*>/, '').replace('</head>', '<meta name="robots" content="noindex" /></head>'));
console.log(`site: ${routes.length} routes written to ${DIST}`);
