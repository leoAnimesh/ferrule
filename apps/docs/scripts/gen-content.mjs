// Builds the site's content from the repo itself, so the docs cannot drift from the code:
// markdown pages from the project's docs, prop tables from the registry's TypeScript, and code samples from the examples that really run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import { createCssVariablesTheme, createHighlighter } from 'shiki';
import ts from 'typescript';

// Same markup as <Code> in src/chrome.tsx: Feather copy and check icons, labelled for screen readers.
const COPY_BUTTON = `<button type="button" class="copy" data-copy aria-label="Copy" title="Copy"><svg class="i-copy" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><svg class="i-check" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></button>`;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.resolve(HERE, '..');
const ROOT = path.resolve(DOCS, '../..');
const REGISTRY = path.join(ROOT, 'packages/ferrule/registry/components');
const OUT = path.join(DOCS, 'src/generated');

/** Width and height from a JPEG's start-of-frame marker. */
export function jpegSize(bytes) {
  for (let at = 2; at + 9 < bytes.length; at += 2 + bytes.readUInt16BE(at + 2)) {
    if (bytes[at] !== 0xff) break;
    const marker = bytes[at + 1];
    const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) return [bytes.readUInt16BE(at + 7), bytes.readUInt16BE(at + 5)];
  }
  throw new Error('Not a JPEG with a frame header');
}
export const REPO = 'https://github.com/leoAnimesh/ferrule';
const BASE_URL = JSON.parse(fs.readFileSync(path.join(DOCS, 'app.json'), 'utf8')).expo.experiments.baseUrl;

// title, source file, and optionally the sections it takes from or leaves out of that file.
export const PAGES = {
  'getting-started': { title: 'Getting started', file: 'apps/docs/content/getting-started.md', blurb: 'Install Ferrule in a bare React Native or Expo app.' },
  cli: { title: 'CLI', file: 'apps/docs/content/cli.md', blurb: 'init, add, list and check.' },
  theming: { title: 'Theming', file: 'packages/ferrule/docs/theming.md', drop: ['Palettes', 'Identical text on every platform'], blurb: 'Tokens, slots, nested themes and the rest of the one system.' },
  palettes: { title: 'Palettes', file: 'packages/ferrule/docs/theming.md', take: 'Palettes', blurb: 'Seven inks, or your own from one color.' },
  fonts: { title: 'Fonts', file: 'packages/ferrule/docs/theming.md', take: 'Identical text on every platform', blurb: 'The system font by default, and every place you can set your own.' },
  icons: { title: 'Icons', file: 'apps/docs/content/icons.md', blurb: 'All 287 Feather icons, by name.' },
  native: { title: 'Native variants', file: 'packages/ferrule-native/README.md', blurb: 'The optional @leoanimesh/ferrule-native package: SwiftUI, UIKit and Jetpack Compose.' },
  coverage: { title: 'Native coverage', file: 'packages/ferrule-native/docs/coverage.md', blurb: 'What exists on each platform, and how far each view has been checked.' },
  platforms: { title: 'Platform status', file: 'apps/docs/content/platforms.md', blurb: 'What has been run, on what, and what has not.' },
  contributing: { title: 'Contributing', file: 'CONTRIBUTING.md', also: 'packages/ferrule-native/docs/adding-a-component.md', blurb: 'Set up the repo, add a component, add a native view.' },
};
const ROUTE_FOR = {
  'packages/ferrule/docs/theming.md': 'theming',
  'packages/ferrule/docs/components.md': 'button',
  'packages/ferrule-native/README.md': 'native',
  'packages/ferrule-native/docs/coverage.md': 'coverage',
  'packages/ferrule-native/docs/adding-a-component.md': 'contributing',
  'CONTRIBUTING.md': 'contributing',
};
const SECTION_ROUTE = { 'identical-text-on-every-platform': 'fonts', palettes: 'palettes', 'your-own-palette': 'palettes' };

export const slug = (text) => text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[`'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Splits markdown on `## ` headings, ignoring any inside code fences. */
export function sections(markdown) {
  const parts = [{ heading: null, lines: [] }];
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) fenced = !fenced;
    if (!fenced && line.startsWith('## ')) parts.push({ heading: line.slice(3).trim(), lines: [] });
    parts.at(-1).lines.push(line);
  }
  return parts;
}

export function pageMarkdown(page, read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8')) {
  const parts = sections(read(page.file));
  let picked = parts;
  if (page.take) {
    picked = parts.filter((part) => part.heading === page.take);
    if (!picked.length) throw new Error(`${page.file} has no section "${page.take}"`);
  }
  if (page.drop) {
    for (const name of page.drop) if (!parts.some((part) => part.heading === name)) throw new Error(`${page.file} has no section "${name}"`);
    picked = parts.filter((part) => !page.drop.includes(part.heading));
  }
  // The page supplies its own title. A lifted section's `## ` stays out for the same reason.
  let text = picked.map((part) => part.lines.join('\n')).join('\n').replace(/^# .*\n/m, '');
  if (page.take) text = text.replace(/^## .*\n/, '');
  if (page.also) text += `\n${read(page.also).replace(/^# (.*)$/m, '## $1')}`;
  return text;
}

/** A link in a project markdown file, as it should be on the site. */
export function resolveLink(href, sourceFile) {
  if (/^(https?:|mailto:)/.test(href)) return href;
  if (href.startsWith('/docs/')) return href;
  if (href.startsWith('#')) return SECTION_ROUTE[href.slice(1)] ? `/docs/${SECTION_ROUTE[href.slice(1)]}` : href;
  const [file, hash] = href.split('#');
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), file));
  const route = ROUTE_FOR[target];
  if (route) {
    if (hash && SECTION_ROUTE[hash]) return `/docs/${SECTION_ROUTE[hash]}`;
    return `/docs/${route}${hash ? `#${hash}` : ''}`;
  }
  return `${REPO}/blob/main/${target}${hash ? `#${hash}` : ''}`;
}

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function main() {
  const theme = createCssVariablesTheme({ name: 'ink', variablePrefix: '--shiki-', fontStyle: true });
  const highlighter = await createHighlighter({ themes: [theme], langs: ['tsx', 'ts', 'sh', 'json', 'swift', 'kotlin'] });
  const LANG = { tsx: 'tsx', ts: 'ts', sh: 'sh', bash: 'sh', json: 'json', swift: 'swift', kotlin: 'kotlin' };
  const highlight = (code, lang) => (LANG[lang] ? highlighter.codeToHtml(code, { lang: LANG[lang], theme: 'ink' }) : `<pre class="shiki"><code>${escape(code)}</code></pre>`);

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  // Markdown pages.
  const pages = {};
  for (const [id, page] of Object.entries(PAGES)) {
    const headings = [];
    const marked = new Marked({
      renderer: {
        code({ text, lang }) {
          return `<div class="code">${COPY_BUTTON}${highlight(text, (lang ?? '').split(' ')[0])}</div>`;
        },
        heading({ tokens, depth }) {
          const html = this.parser.parseInline(tokens);
          const anchor = slug(html);
          if (depth === 2) headings.push({ id: anchor, text: html.replace(/<[^>]+>/g, '') });
          return `<h${depth} id="${anchor}">${html}</h${depth}>`;
        },
        table(token) {
          const cell = (c) => this.parser.parseInline(c.tokens);
          const head = token.header.map((c) => `<th scope="col">${cell(c)}</th>`).join('');
          const rows = token.rows.map((row) => `<tr>${row.map((c) => `<td>${cell(c)}</td>`).join('')}</tr>`).join('');
          return `<div class="table" tabindex="0" role="region" aria-label="Table"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
        },
        link({ href, tokens }) {
          const to = resolveLink(href, page.file);
          const external = /^https?:/.test(to);
          // With the base path, so opening a link in a new tab works too. The router accepts both.
          return `<a href="${to.startsWith('/') ? BASE_URL + to : to}"${external ? ' rel="noopener"' : ''}>${this.parser.parseInline(tokens)}</a>`;
        },
      },
    });
    pages[id] = { title: page.title, blurb: page.blurb, html: await marked.parse(pageMarkdown(page)), headings };
  }
  fs.writeFileSync(path.join(OUT, 'pages.json'), JSON.stringify(pages));

  // Code samples: the exact file that runs in the preview, with the import path as it is in an app.
  const samples = {};
  for (const file of fs.readdirSync(path.join(DOCS, 'examples')).filter((name) => name.endsWith('.tsx'))) {
    const code = fs.readFileSync(path.join(DOCS, 'examples', file), 'utf8').replace(/'\.\.\/components\/ui\//g, "'./components/ui/").replace(/'\.\.\/assets\//g, "'./assets/").trim();
    samples[file.replace('.tsx', '')] = { code, html: highlight(code, 'tsx') };
  }
  fs.writeFileSync(path.join(OUT, 'samples.json'), JSON.stringify(samples));

  // Prop tables, from the source of each component.
  const props = {};
  for (const file of fs.readdirSync(REGISTRY).filter((name) => name.endsWith('.tsx'))) props[file.replace('.tsx', '')] = extractProps(fs.readFileSync(path.join(REGISTRY, file), 'utf8'), file);
  fs.writeFileSync(path.join(OUT, 'props.json'), JSON.stringify(props));

  // Media sizes, so each frame reserves its shape before the file loads. A video's poster has the video's size.
  const sizes = {};
  const media = path.join(DOCS, 'public/media');
  for (const file of fs.readdirSync(media).filter((name) => name.endsWith('.jpg'))) {
    sizes[file.replace('.jpg', '')] = jpegSize(fs.readFileSync(path.join(media, file)));
  }
  fs.writeFileSync(path.join(OUT, 'media-sizes.json'), JSON.stringify(sizes));

  // The site's font, from its package, so no font file lives in the repo.
  const fonts = path.join(DOCS, 'public/fonts');
  const pkg = path.join(ROOT, 'node_modules/@fontsource-variable/archivo');
  fs.mkdirSync(fonts, { recursive: true });
  fs.copyFileSync(path.join(pkg, 'files/archivo-latin-standard-normal.woff2'), path.join(fonts, 'archivo.woff2'));
  fs.copyFileSync(path.join(pkg, 'LICENSE'), path.join(fonts, 'OFL.txt'));
  console.log(`docs content: ${Object.keys(pages).length} pages, ${Object.keys(samples).length} samples, ${Object.keys(props).length} components`);
}

// The comment itself, because `jsDoc` on the node came back empty with this TypeScript's parser.
const docComment = (source, node) => {
  const range = ts.getLeadingCommentRanges(source, node.pos)?.findLast((r) => source.startsWith('/**', r.pos));
  return range ? source.slice(range.pos + 3, range.end - 2).replace(/^\s*\* ?/gm, '').replace(/\s+/g, ' ').trim() : '';
};

export function extractProps(source, name = 'x.tsx') {
  const file = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const defaults = {};
  const groups = [];
  const member = (node) => ({
    name: node.name.getText(),
    optional: Boolean(node.questionToken),
    type: (node.type?.getText() ?? '').replace(/\s+/g, ' '),
    doc: docComment(source, node),
  });
  const walk = (node) => {
    if (ts.isObjectBindingPattern(node)) for (const el of node.elements) if (el.initializer) defaults[(el.propertyName ?? el.name).getText()] = el.initializer.getText();
    if (ts.isInterfaceDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      groups.push({ name: node.name.text, extends: node.heritageClauses?.flatMap((h) => h.types.map((t) => t.getText().replace(/\s+/g, ' '))) ?? [], members: node.members.filter((m) => ts.isPropertySignature(m)).map(member) });
    }
    // Parts such as CardHeader declare their props inline.
    if (ts.isFunctionDeclaration(node) && node.name && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) && /^[A-Z]/.test(node.name.text)) {
      const type = node.parameters[0]?.type;
      if (type && ts.isTypeLiteralNode(type)) groups.push({ name: node.name.text, extends: [], members: type.members.filter((m) => ts.isPropertySignature(m)).map(member) });
    }
    ts.forEachChild(node, walk);
  };
  walk(file);
  for (const group of groups) for (const m of group.members) if (defaults[m.name] !== undefined) m.default = defaults[m.name];
  return groups;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
