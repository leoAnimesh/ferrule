import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { run, add, addWorkletsPlugin, check, checkSetup, CliError, findRawColors, findViolations, fixBabel, init, parseVersion, readRegistry } from './index.js';

const quiet = () => {};

function project(pkg = { dependencies: { 'react-native': '0.88.1' } }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ferrule-cli-'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
  return dir;
}

function installed(dir, name, version, extra) {
  fs.mkdirSync(path.join(dir, 'node_modules', name), { recursive: true });
  fs.writeFileSync(path.join(dir, 'node_modules', name, 'package.json'), JSON.stringify({ version }));
  if (extra) fs.writeFileSync(path.join(dir, 'node_modules', name, 'compatibility.json'), JSON.stringify(extra));
}

function goodPeers(dir) {
  installed(dir, 'react-native', '0.88.1');
  installed(dir, 'react-native-worklets', '0.13.0');
  installed(dir, 'react-native-reanimated', '4.7.1', { fabric: { '4.7.x': { 'react-native-worklets': ['0.13.x'] } } });
}

test('parseVersion reads versions and simple ranges', () => {
  assert.deepEqual(parseVersion('4.7.1'), [4, 7, 1]);
  assert.deepEqual(parseVersion('^4.7'), [4, 7, 0]);
  assert.deepEqual(parseVersion('~58.0.23'), [58, 0, 23]);
  assert.equal(parseVersion(undefined), null);
});

test('checkSetup reports missing peers with the exact install command per tool', () => {
  const bare = project();
  const [missing] = checkSetup(bare);
  assert.match(missing.message, /react-native-reanimated, react-native-worklets/);
  assert.match(missing.fix, /^npm install react-native-reanimated react-native-worklets/);
  const yarn = project();
  fs.writeFileSync(path.join(yarn, 'yarn.lock'), '');
  assert.match(checkSetup(yarn)[0].fix, /^yarn add/);
  const expo = project({ dependencies: { 'react-native': '0.88.1', expo: '~58.0.0' } });
  assert.match(checkSetup(expo)[0].fix, /^npx expo install/);
});

test('checkSetup flags versions that are too old and pairs Reanimated with Worklets', () => {
  const old = project();
  goodPeers(old);
  installed(old, 'react-native-reanimated', '3.19.0');
  assert.ok(checkSetup(old).some((p) => /older than/.test(p.message)));
  const oldRn = project();
  goodPeers(oldRn);
  installed(oldRn, 'react-native', '0.80.0');
  assert.ok(checkSetup(oldRn).some((p) => /react-native 0.80.0 is older/.test(p.message)));
  const unpaired = project();
  goodPeers(unpaired);
  installed(unpaired, 'react-native-worklets', '0.14.0');
  const problem = checkSetup(unpaired).find((p) => /does not pair/.test(p.message));
  assert.match(problem.fix, /react-native-worklets@0.13/);
});

test('checkSetup requires the Babel plugin on bare apps, but not with the Expo preset', () => {
  const bare = project();
  goodPeers(bare);
  assert.equal(checkSetup(bare).length, 1);
  assert.equal(checkSetup(bare)[0].babel, 'create');
  fs.writeFileSync(path.join(bare, 'babel.config.js'), `module.exports = { presets: ['x'], plugins: ['react-native-worklets/plugin'] };`);
  assert.deepEqual(checkSetup(bare), []);
  const expo = project({ dependencies: { 'react-native': '0.88.1', expo: '~58.0.0' } });
  goodPeers(expo);
  assert.deepEqual(checkSetup(expo), []);
});

test('addWorkletsPlugin keeps the rest of the config and goes last', () => {
  const load = (code) => {
    const module = { exports: {} };
    new Function('module', code)(module);
    return module.exports;
  };
  const plain = `module.exports = {\n  presets: ['module:@react-native/babel-preset'],\n};\n`;
  assert.deepEqual(load(addWorkletsPlugin(plain)), { presets: ['module:@react-native/babel-preset'], plugins: ['react-native-worklets/plugin'] });
  const noComma = `module.exports = { presets: ['a'] };`;
  assert.deepEqual(load(addWorkletsPlugin(noComma)).plugins, ['react-native-worklets/plugin']);
  const existing = `module.exports = {\n  presets: ['a'],\n  plugins: [\n    'one',\n    ['two', { x: ']' }],\n  ],\n  env: { a: 1 },\n};\n`;
  const next = load(addWorkletsPlugin(existing));
  assert.deepEqual(next.plugins, ['one', ['two', { x: ']' }], 'react-native-worklets/plugin']);
  assert.deepEqual(next.env, { a: 1 });
  assert.deepEqual(load(addWorkletsPlugin(`module.exports = { presets: ['a'], plugins: ['one'] };`)).plugins, ['one', 'react-native-worklets/plugin']);
  assert.deepEqual(load(addWorkletsPlugin(`module.exports = { presets: ['a'], plugins: [] };`)).plugins, ['react-native-worklets/plugin']);
  assert.equal(addWorkletsPlugin(`module.exports = makeConfig();`), null);
});

test('init --fix edits or creates Babel config, and leaves unknown shapes untouched', () => {
  const edit = project();
  goodPeers(edit);
  fs.writeFileSync(path.join(edit, 'babel.config.js'), `module.exports = { presets: ['a'] };`);
  init(edit, { fix: true, log: quiet });
  assert.match(fs.readFileSync(path.join(edit, 'babel.config.js'), 'utf8'), /react-native-worklets\/plugin/);
  assert.deepEqual(checkSetup(edit), []);

  const create = project();
  goodPeers(create);
  init(create, { fix: true, log: quiet });
  assert.match(fs.readFileSync(path.join(create, 'babel.config.js'), 'utf8'), /react-native-worklets\/plugin/);

  const custom = project();
  goodPeers(custom);
  const source = 'module.exports = makeConfig();';
  fs.writeFileSync(path.join(custom, 'babel.config.js'), source);
  const notes = fixBabel(custom, checkSetup(custom));
  assert.match(notes[0], /left it unchanged/);
  assert.equal(fs.readFileSync(path.join(custom, 'babel.config.js'), 'utf8'), source);
  assert.equal(checkSetup(custom).length, 1);
});

test('the old Reanimated plugin is flagged and renamed', () => {
  const dir = project();
  goodPeers(dir);
  fs.writeFileSync(path.join(dir, 'babel.config.js'), `module.exports = { plugins: ['react-native-reanimated/plugin'] };`);
  const problems = checkSetup(dir);
  assert.match(problems[0].message, /old Reanimated/);
  fixBabel(dir, problems);
  assert.deepEqual(checkSetup(dir), []);
});

test('init does not edit Babel config without --fix', () => {
  const dir = project();
  goodPeers(dir);
  fs.writeFileSync(path.join(dir, 'babel.config.js'), `module.exports = { presets: ['a'] };`);
  const lines = [];
  init(dir, { log: (line) => lines.push(line) });
  assert.equal(fs.readFileSync(path.join(dir, 'babel.config.js'), 'utf8'), `module.exports = { presets: ['a'] };`);
  assert.ok(lines.join('\n').includes('LAST entry'));
});

test('add warns when Reanimated is not set up, and still copies', () => {
  const dir = project();
  init(dir, { log: quiet });
  const lines = [];
  const { copied, problems } = add(dir, ['badge'], { log: (line) => lines.push(line) });
  assert.ok(copied.includes('badge'));
  assert.ok(problems.length > 0);
  assert.ok(lines.join('\n').includes('need Reanimated'));
});

test('findRawColors catches hex, rgb and named colors but allows tokens, transparent and comments', () => {
  assert.equal(findRawColors(`color: '#fff'`).length, 1);
  assert.equal(findRawColors(`backgroundColor: 'rgba(0,0,0,.5)'`).length, 1);
  assert.equal(findRawColors(`color: "white"`).length, 1);
  assert.deepEqual(findRawColors(`color: colors.primary, borderColor: 'transparent' // not #fff here`), []);
});

test('no registry component contains a raw color', () => {
  const dir = new URL('../registry/components/', import.meta.url);
  for (const file of fs.readdirSync(dir)) {
    assert.deepEqual(findRawColors(fs.readFileSync(new URL(file, dir), 'utf8')), [], file);
  }
});

test('check flags raw colors only inside the components directory', () => {
  const dir = project();
  init(dir, { log: quiet });
  fs.mkdirSync(path.join(dir, 'components/ui'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'components/ui/x.tsx'), `const a = '#ff0000';\n`);
  fs.writeFileSync(path.join(dir, 'App.tsx'), `const a = '#ff0000';\n`);
  const results = check(dir);
  assert.equal(results.length, 1);
  assert.match(results[0].file, /x\.tsx:1$/);
});

test('init writes the chosen palette and rejects an unknown one', () => {
  const dir = project();
  init(dir, { palette: 'cobalt', log: quiet });
  assert.match(fs.readFileSync(path.join(dir, 'ferrule.theme.js'), 'utf8'), /palette: 'cobalt'/);
  assert.throws(() => init(project(), { palette: 'neon', log: quiet }), CliError);
});

test('init writes config and JS theme, and refuses a non-RN project', () => {
  const dir = project();
  const { created } = init(dir, { log: quiet });
  assert.deepEqual(created, ['ferrule.json', 'ferrule.theme.js']);
  assert.throws(() => init(project({ dependencies: {} }), { log: quiet }), CliError);
});

test('init picks a TS theme and keeps existing files', () => {
  const dir = project();
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), '{}');
  fs.writeFileSync(path.join(dir, 'ferrule.theme.ts'), 'mine');
  const { created } = init(dir, { log: quiet });
  assert.deepEqual(created, ['ferrule.json']);
  assert.equal(fs.readFileSync(path.join(dir, 'ferrule.theme.ts'), 'utf8'), 'mine');
});

test('init and add refuse directories outside the project', () => {
  const dir = project();
  assert.throws(() => init(dir, { componentsDir: '../escape', log: quiet }), /outside the project/);
  init(dir, { log: quiet });
  fs.writeFileSync(path.join(dir, 'ferrule.json'), JSON.stringify({ componentsDir: '../../escape' }));
  assert.throws(() => add(dir, ['badge'], { log: quiet }), /outside the project/);
});

test('add refuses a symlinked directory leading outside the project', () => {
  const dir = project();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ferrule-outside-'));
  fs.symlinkSync(outside, path.join(dir, 'link'));
  init(dir, { log: quiet });
  fs.writeFileSync(path.join(dir, 'ferrule.json'), JSON.stringify({ componentsDir: 'link/ui' }));
  assert.throws(() => add(dir, ['badge'], { log: quiet }), /resolves outside/);
  assert.deepEqual(fs.readdirSync(outside), []);
});

test('add copies a component with its dependencies', () => {
  const dir = project();
  init(dir, { log: quiet });
  const { copied } = add(dir, ['button'], { log: quiet });
  assert.deepEqual(copied.sort(), ['button', 'spinner', 'text']);
  assert.ok(fs.existsSync(path.join(dir, 'components/ui/button.tsx')));
});

test('add rejects unknown and path-like names and prototype keys, writing nothing', () => {
  const dir = project();
  init(dir, { log: quiet });
  for (const name of ['nope', '../../etc/passwd', '__proto__', 'constructor']) {
    assert.throws(() => add(dir, [name], { log: quiet }), /Unknown component/);
  }
  assert.ok(!fs.existsSync(path.join(dir, 'components')));
});

test('add needs init first and at least one name', () => {
  const dir = project();
  assert.throws(() => add(dir, ['badge'], { log: quiet }), /ferrule init/);
  init(dir, { log: quiet });
  assert.throws(() => add(dir, [], { log: quiet }), /at least one/);
});

test('add never replaces local edits unless told to', () => {
  const dir = project();
  init(dir, { log: quiet });
  add(dir, ['badge'], { log: quiet });
  const file = path.join(dir, 'components/ui/badge.tsx');
  fs.writeFileSync(file, 'edited');
  assert.deepEqual(add(dir, ['badge'], { log: quiet }).skipped.sort(), ['badge', 'text']);
  assert.equal(fs.readFileSync(file, 'utf8'), 'edited');
  add(dir, ['badge'], { overwrite: true, log: quiet });
  assert.notEqual(fs.readFileSync(file, 'utf8'), 'edited');
});

test('add --all copies the whole registry, and every dependency and file exists', () => {
  const dir = project();
  init(dir, { log: quiet });
  const registry = readRegistry();
  assert.deepEqual(add(dir, [], { all: true, log: quiet }).copied.sort(), Object.keys(registry).sort());
  for (const entry of Object.values(registry)) {
    for (const dependency of entry.dependencies) assert.ok(registry[dependency], dependency);
  }
});

test('registry dependencies match what each file really imports', () => {
  const dir = project();
  init(dir, { log: quiet });
  add(dir, [], { all: true, log: quiet });
  for (const [name, entry] of Object.entries(readRegistry())) {
    const source = fs.readFileSync(path.join(dir, 'components/ui', entry.file), 'utf8');
    const imported = [...source.matchAll(/from '\.\/([a-z]+)'/g)].map((match) => match[1]);
    assert.deepEqual([...new Set(imported)].sort(), [...entry.dependencies].sort(), name);
  }
});

test('registry components import only from ferrule, react and siblings', () => {
  const registryDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'registry', 'components');
  for (const file of fs.readdirSync(registryDir)) {
    const source = fs.readFileSync(path.join(registryDir, file), 'utf8');
    for (const match of source.matchAll(/from '([^']+)'/g)) {
      assert.ok(['ferrule', 'ferrule/lib/feather', 'react'].includes(match[1]) || match[1].startsWith('./'), `${file}: ${match[1]}`);
    }
  }
});

test('findViolations catches every direct import form', () => {
  assert.deepEqual(findViolations(`import { View, Text as T } from 'react-native';`), ['"View" from react-native', '"Text" from react-native']);
  assert.equal(findViolations(`import RN from 'react-native';`).length, 1);
  assert.equal(findViolations(`import * as RN from 'react-native';`).length, 1);
  assert.equal(findViolations(`import RN, { Linking } from 'react-native';`).length, 1);
  assert.equal(findViolations(`const RN = require('react-native');`).length, 1);
  assert.equal(findViolations(`const RN = await import("react-native");`).length, 1);
  assert.equal(findViolations(`export { View } from 'react-native';`).length, 1);
  assert.equal(findViolations(`import 'react-native';`).length, 1);
});

test('findViolations allows APIs it does not cover, types, comments and lookalikes', () => {
  assert.deepEqual(findViolations(`import { Linking, Alert } from 'react-native';`), []);
  assert.deepEqual(findViolations(`import type { ViewProps } from 'react-native';`), []);
  assert.deepEqual(findViolations(`import { type ViewProps, Linking } from 'react-native';`), []);
  assert.deepEqual(findViolations(`// import { View } from 'react-native';`), []);
  assert.deepEqual(findViolations(`/* import { View } from 'react-native'; */`), []);
  assert.deepEqual(findViolations(`import x from 'react-native-svg';`), []);
  assert.deepEqual(findViolations(`import { View } from 'ferrule';\nconst url = 'https://x';`), []);
});

test('findViolations reads an import on its own, after a side-effect import', () => {
  assert.deepEqual(findViolations("import 'ferrule-native';\nimport { Linking } from 'react-native';\n"), []);
  assert.equal(findViolations("import 'ferrule-native';\nimport RN from 'react-native';\n").length, 1);
});

test('check walks source and skips node_modules and native folders', () => {
  const dir = project();
  fs.mkdirSync(path.join(dir, 'src'));
  fs.mkdirSync(path.join(dir, 'node_modules/x'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src/App.tsx'), `import { View } from 'react-native';`);
  fs.writeFileSync(path.join(dir, 'node_modules/x/i.js'), `import { View } from 'react-native';`);
  assert.deepEqual(check(dir), [{ file: path.join('src', 'App.tsx'), problem: '"View" from react-native' }]);
});

test('--version prints the package version and exits 0', async (t) => {
  const log = t.mock.method(console, 'log', () => {});
  assert.equal(await run(['--version']), 0);
  assert.equal(log.mock.calls[0].arguments[0], JSON.parse(fs.readFileSync(new URL('package.json', new URL('../', import.meta.url)), 'utf8')).version);
});
