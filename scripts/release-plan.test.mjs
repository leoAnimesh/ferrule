import assert from 'node:assert/strict';
import test from 'node:test';
import { consistency, decide, notesFor } from './release-plan.mjs';

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
