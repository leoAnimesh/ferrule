import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import test from 'node:test';
import { consistency, decide, eventually, FERRULE, NATIVE, notesFor, tarball } from './release-plan.mjs';

const on = (ferrule, native) => ({ ferrule, native });
const run = (ferruleVersion, tags, releaseExists, onNpm) => decide({ ferruleVersion, tags, releaseExists, onNpm });
const nothing = { action: 'none', publishFerrule: false, publishNative: false, createRelease: false };

test('0.1.0 is tagged and released but not on npm: the first merge publishes nothing', () => {
  assert.deepEqual(run('0.1.0', ['v0.1.0'], true, on(false, false)), nothing);
});

test('a plain merge after a release does nothing', () => {
  assert.deepEqual(run('0.2.0', ['v0.1.0', 'v0.2.0'], true, on(true, true)), nothing);
});

test('a version bump publishes both, then releases', () => {
  assert.deepEqual(run('0.2.0', ['v0.1.0'], false, on(false, false)), { action: 'release', publishFerrule: true, publishNative: true, createRelease: true });
});

test('a rerun after ferrule published and ferrule-native failed publishes only ferrule-native', () => {
  assert.deepEqual(run('0.2.0', ['v0.1.0'], false, on(true, false)), { action: 'release', publishFerrule: false, publishNative: true, createRelease: true });
});

test('a rerun after both published and the release failed only creates the release', () => {
  assert.deepEqual(run('0.2.0', ['v0.1.0'], false, on(true, true)), { action: 'release', publishFerrule: false, publishNative: false, createRelease: true });
});

test('a tag whose GitHub release failed gets the release, and no publish', () => {
  assert.deepEqual(run('0.2.0', ['v0.2.0'], false, on(true, true)), { ...nothing, action: 'release', createRelease: true });
});

test('a tag never publishes over, even with no release and nothing on npm', () => {
  assert.throws(() => run('0.1.0', ['v0.1.0'], false, on(false, false)), /fix this by hand/);
});

test('a version older than a tag stops the run', () => {
  assert.throws(() => run('0.1.5', ['v0.1.0', 'v0.2.0'], false, on(false, false)), /older than the tagged 0\.2\.0/);
  assert.throws(() => run('0.9.0', ['v0.10.0'], false, on(false, false)), /older/);
});

const good = { ferruleVersion: '0.2.0', nativeVersion: '0.2.0', peerRange: '>=0.2.0', changelog: '## Unreleased\n\n## 0.2.0\n\nStuff\n\n## 0.1.0\n' };

test('versions, peer range and changelog must agree', () => {
  assert.deepEqual(consistency(good), []);
  assert.match(consistency({ ...good, nativeVersion: '0.1.0' })[0], /ferrule-native is 0\.1\.0/);
  assert.match(consistency({ ...good, peerRange: '>=0.1.0' })[0], /expected >=0\.2\.0/);
  assert.match(consistency({ ...good, changelog: '## Unreleased\n\n## 0.2.01\n' })[0], /no "## 0\.2\.0" section/);
  assert.match(consistency({ ...good, ferruleVersion: '0.2.0-beta.1', nativeVersion: '0.2.0-beta.1', peerRange: '>=0.2.0-beta.1', changelog: '## 0.2.0-beta.1' })[0], /plain x\.y\.z/);
});

test('release notes are one section of the changelog', () => {
  assert.equal(notesFor('# Changelog\n\n## Unreleased\n\nNext\n\n## 0.2.0 - 2026-12-01\n\nThese\n\n## 0.1.0\n\nOld\n', '0.2.0'), 'These');
  assert.equal(notesFor('## 0.1.0\n\nOld\n', '0.1.0'), 'Old');
  assert.throws(() => notesFor('## 0.1.0\n', '0.2.0'), /no section/);
});

// Both failed releases came from these paths: npm read `out/x.tgz` as a GitHub repo, and the scoped rename changed the file names.
test('every tarball path in release.yml starts with ./ and is what pnpm pack writes', () => {
  const workflow = fs.readFileSync(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
  const paths = [...workflow.matchAll(/"([^"\s]*\.tgz)"/g)].map((match) => match[1]);
  assert.ok(paths.length >= 4, paths.join());
  for (const file of paths) assert.match(file, /^\.\/out\//, file);
  const packed = (dir) => JSON.parse(execFileSync('pnpm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: new URL(`../packages/${dir}/`, import.meta.url), encoding: 'utf8' }));
  const expected = new Set();
  for (const [dir, name] of [['ferrule', FERRULE], ['ferrule-native', NATIVE]]) {
    const { filename, version } = packed(dir);
    assert.equal(filename, tarball(name, version));
    expected.add(`./out/${tarball(name, '$VERSION')}`);
  }
  assert.deepEqual(new Set(paths), expected);
});

test('tarball names match pnpm and npm for scoped packages', () => {
  assert.equal(tarball('@leoanimesh/ferrule', '0.2.0'), 'leoanimesh-ferrule-0.2.0.tgz');
  assert.equal(tarball('@leoanimesh/ferrule-native', '0.2.0'), 'leoanimesh-ferrule-native-0.2.0.tgz');
});

test('the published check waits out npm being slow to serve a new version, then gives up', async () => {
  const waits = [];
  const sleep = async (ms) => { waits.push(ms); };
  const answers = [false, false, true];
  assert.equal(await eventually(() => answers.shift(), { tries: 5, delayMs: 30, sleep }), true);
  assert.deepEqual(waits, [30, 30]);
  waits.length = 0;
  assert.equal(await eventually(() => false, { tries: 3, delayMs: 30, sleep }), false);
  assert.deepEqual(waits, [30, 30]);
  await assert.rejects(eventually(() => { throw new Error('ETIMEDOUT'); }, { sleep }), /ETIMEDOUT/);
});
