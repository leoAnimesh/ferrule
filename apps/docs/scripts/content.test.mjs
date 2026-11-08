import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { extractProps, jpegSize, PAGES, pageMarkdown, resolveLink } from './gen-content.mjs';

const DOCS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.join(DOCS, '../..');
const fences = (md) => [...md.matchAll(/^```(\w+)[^\n]*\n([\s\S]*?)^```/gm)].map((m) => ({ lang: m[1], code: m[2] }));

/** Fragments are fine in prose, so a sample counts if it parses on its own or wrapped as JSX or as an object. */
function parses(code) {
  return [code, `<>${code}</>`, `({${code}})`].some((source) => {
    const { diagnostics } = ts.transpileModule(source, { reportDiagnostics: true, fileName: 'x.tsx', compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ESNext } });
    return !diagnostics.length;
  });
}

for (const [id, page] of Object.entries(PAGES)) {
  const md = pageMarkdown(page);
  test(`${id}: code samples parse`, () => {
    for (const { lang, code } of fences(md)) if (/^(tsx?|jsx?)$/.test(lang)) assert.ok(parses(code), `${id}:\n${code}`);
  });
  test(`${id}: links resolve`, () => {
    const prose = md.replace(/```[\s\S]*?```/g, '');
    for (const [, href] of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
      const to = resolveLink(href, page.file);
      assert.ok(!/\/blob\/main\/apps\/docs\/content\//.test(to), `${href} became ${to}`);
      if (/^https?:/.test(to) || to.startsWith('#')) continue;
      assert.ok(to.startsWith('/docs/'), `${href} became ${to}`);
    }
  });
  test(`${id}: says nothing of the removed native FlatList`, () => assert.doesNotMatch(md, /native ?flat ?list|FerruleFlatList/i));
}

test('extractProps reads an interface, its docs and defaults', () => {
  const [group] = extractProps(`export interface AProps {\n  /** Doc. */\n  size?: number;\n}\nexport function A({ size = 2 }: AProps) { return null; }`);
  assert.deepEqual(group.members, [{ name: 'size', optional: true, type: 'number', doc: 'Doc.', default: '2' }]);
});

test('every registry component has a docs page', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/ferrule/registry/registry.json'), 'utf8'));
  const docs = fs.readFileSync(path.join(DOCS, 'src/components.ts'), 'utf8');
  assert.deepEqual(Object.keys(registry.components).filter((name) => !docs.includes(`slug: '${name}'`)), []);
});

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('every registry component has a section in components.md, which mentions its public props', () => {
  const registry = JSON.parse(read('packages/ferrule/registry/registry.json'));
  const [, ...parts] = read('packages/ferrule/docs/components.md').split(/^## /m);
  const sections = Object.fromEntries(parts.map((part) => [part.slice(0, part.indexOf('\n')).trim().toLowerCase(), part]));
  const inherited = (body) => { const from = body.match(/^As (\w+)/m)?.[1]; return from ? body + sections[from] : body; };
  // Every component takes these, as the top of components.md says.
  const common = new Set(['style', 'testID', 'children']);
  const undocumented = [];
  for (const name of Object.keys(registry.components)) {
    if (!sections[name]) { undocumented.push(`${name}: no section`); continue; }
    const groups = extractProps(read(`packages/ferrule/registry/components/${registry.components[name].file}`));
    for (const prop of groups.flatMap((group) => group.members.map((member) => member.name.replace(/'/g, '')))) {
      if (!common.has(prop) && !inherited(sections[name]).includes(prop)) undocumented.push(`${name}: ${prop}`);
    }
  }
  assert.deepEqual(undocumented, []);
});

test('every CLI command and flag is in cli.md', () => {
  const cli = read('packages/ferrule/cli/index.js');
  const docs = read('apps/docs/content/cli.md');
  const flags = [...new Set(cli.match(/'--[a-z]+'/g).map((flag) => flag.slice(1, -1)))].filter((flag) => flag !== '--help');
  const commands = [...cli.matchAll(/case '(\w+)':/g)].map((match) => match[1]);
  assert.ok(flags.length && commands.length);
  assert.deepEqual([...flags, ...commands].filter((word) => !docs.includes(word)), []);
});

test('every native view is in the coverage table, and the landing page counts them right', () => {
  const views = [...new Set(read('packages/ferrule-native/src/components.tsx').match(/export (const|function) Native\w+/g).map((match) => match.split(' ').pop()))];
  const coverage = read('packages/ferrule-native/docs/coverage.md');
  assert.deepEqual(views.filter((view) => !coverage.includes(view)), []);
  assert.match(read('apps/docs/src/Landing.tsx'), new RegExp(`has ${views.length} views`));
});

test('the landing page shows the same screen as the harness demo it sits beside', () => {
  const body = (file) => fs.readFileSync(path.join(file), 'utf8').replace(/^import .*\n/gm, '').replace(/\/\*\*.*\*\/\n/, '').replace(/export function \w+/, '').trim();
  assert.equal(body(new URL('../src/Showcase.tsx', import.meta.url).pathname), body(new URL('../../example/src/demos/composite.tsx', import.meta.url).pathname));
});

test('the masonry keeps the first row in order and closes the columns', async () => {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(DOCS, 'src/masonry.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext } });
  const { distribute } = await import(`data:text/javascript,${encodeURIComponent(outputText)}`);
  const heights = [400, 410, 900, 120, 300, 280, 260, 240, 220, 200, 180, 160];
  const columns = distribute(heights, 4);
  assert.deepEqual(columns.map((column) => column[0]), [0, 1, 2, 3]);
  assert.deepEqual(columns.flat().sort((a, b) => a - b), [...heights.keys()]);
  const totals = columns.map((column) => column.reduce((sum, at) => sum + heights[at], 0));
  assert.ok(Math.max(...totals) - Math.min(...totals) <= Math.max(...heights), totals.join());
  for (const column of columns) assert.deepEqual(column, [...column].sort((a, b) => a - b));
});

test('the install steps use npm, with no old tarball links', () => {
  for (const file of ['apps/docs/src/Landing.tsx', 'apps/docs/content/getting-started.md', 'README.md', 'packages/ferrule-native/README.md']) {
    const text = fs.readFileSync(path.join(DOCS, '../..', file), 'utf8');
    assert.doesNotMatch(text, /releases\/download|not on npm|npm install ferrule\b/i, file);
    assert.match(text, /npm install @leoanimesh\/ferrule/, file);
  }
});

test('jpegSize reads a real capture and rejects anything else', () => {
  const file = path.join(DOCS, 'public/media/ios-glass.jpg');
  const [width, height] = jpegSize(fs.readFileSync(file));
  assert.equal(width, 560);
  assert.ok(height > 100);
  assert.throws(() => jpegSize(Buffer.from('not an image, just some text')));
});
