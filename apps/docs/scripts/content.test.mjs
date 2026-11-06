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

test('the landing page shows the same screen as the harness demo it sits beside', () => {
  const body = (file) => fs.readFileSync(path.join(file), 'utf8').replace(/^import .*\n/gm, '').replace(/\/\*\*.*\*\/\n/, '').replace(/export function \w+/, '').trim();
  assert.equal(body(new URL('../src/Showcase.tsx', import.meta.url).pathname), body(new URL('../../example/src/demos/composite.tsx', import.meta.url).pathname));
});

test('jpegSize reads a real capture and rejects anything else', () => {
  const file = path.join(DOCS, 'public/media/ios-glass.jpg');
  const [width, height] = jpegSize(fs.readFileSync(file));
  assert.equal(width, 560);
  assert.ok(height > 100);
  assert.throws(() => jpegSize(Buffer.from('not an image, just some text')));
});
