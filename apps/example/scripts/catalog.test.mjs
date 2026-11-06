import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const EXAMPLE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(fs.readFileSync(path.join(EXAMPLE, '../../packages/ferrule/registry/registry.json'), 'utf8'));
const catalog = fs.readFileSync(path.join(EXAMPLE, 'src/catalog.ts'), 'utf8');
const ids = [...catalog.matchAll(/entry\('([\w-]+)'/g)].map((match) => match[1]);

test('every registry component has a catalog entry and a demo file', () => {
  const names = Object.keys(registry.components);
  assert.ok(names.length > 0);
  const missing = names.filter((name) => !ids.includes(name) || !fs.existsSync(path.join(EXAMPLE, 'src/demos', `${name}.tsx`)));
  assert.deepEqual(missing, []);
});

test('every catalog entry imports its demo file', () => {
  const missing = ids.filter((id) => !catalog.includes(`'./demos/${id}'`));
  assert.deepEqual(missing, []);
});

test('every demo file exports Demo', () => {
  for (const file of fs.readdirSync(path.join(EXAMPLE, 'src/demos'))) {
    assert.match(fs.readFileSync(path.join(EXAMPLE, 'src/demos', file), 'utf8'), /export (function|const) Demo\b/, file);
  }
});

test('no two entries share an id', () => assert.equal(new Set(ids).size, ids.length));

test('the iOS suite visits every catalog entry', () => {
  const swift = fs.readFileSync(path.join(EXAMPLE, 'e2e/ios/FerruleHarnessUITests.swift'), 'utf8');
  const list = swift.match(/for component in \[([^\]]+)\]/)[1];
  assert.deepEqual(ids.filter((id) => !list.includes(`"${id}"`)), []);
});
