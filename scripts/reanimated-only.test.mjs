import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FROM_RN = /\b(import|export)\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]react-native['"]/g;

export function problems(source) {
  const found = [];
  for (const [, kind, names] of source.matchAll(FROM_RN)) {
    for (const raw of names.split(',')) {
      const name = raw.trim().split(/\s+/)[0];
      if (['Animated', 'Easing', 'LayoutAnimation'].includes(name)) found.push(name);
      // Apps may still take this one from `ferrule`, so only using it in the library counts.
      if (name === 'KeyboardAvoidingView' && kind === 'import') found.push(name);
    }
  }
  if (/from\s*['"]react-native\/Libraries\/(Animated|LayoutAnimation)/.test(source)) found.push('a deep import');
  return found;
}

const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? files(full) : /\.tsx?$/.test(entry.name) ? [full] : [];
});

test('the guard catches what it should', () => {
  assert.deepEqual(problems("import { View, Animated } from 'react-native';"), ['Animated']);
  assert.deepEqual(problems("import {\n  Easing,\n  LayoutAnimation as L,\n} from 'react-native';"), ['Easing', 'LayoutAnimation']);
  assert.deepEqual(problems("import { KeyboardAvoidingView } from 'react-native';"), ['KeyboardAvoidingView']);
  assert.deepEqual(problems("export { KeyboardAvoidingView } from 'react-native';"), []);
  assert.deepEqual(problems("export { Animated } from 'react-native';"), ['Animated']);
  assert.deepEqual(problems("import { Animated } from './motion';"), []);
});

test('library code animates only with Reanimated', () => {
  for (const dir of ['packages/ferrule/src', 'packages/ferrule/registry']) {
    for (const file of files(path.join(ROOT, dir))) {
      assert.deepEqual(problems(fs.readFileSync(file, 'utf8')), [], path.relative(ROOT, file));
    }
  }
});
