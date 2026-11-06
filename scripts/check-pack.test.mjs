import assert from 'node:assert/strict';
import test from 'node:test';
import { problems } from './check-pack.mjs';

test('flags files that must not ship', () => {
  for (const file of ['AGENTS.md', 'CLAUDE.md', 'apps/example/App.tsx', 'e2e/ios/run.sh', '.claude/skills/x/SKILL.md', 'docs/media/a.mp4', 'lib/x.test.js', 'android/build/out.bin']) {
    assert.deepEqual(problems([file], []), [`must not ship: ${file}`]);
  }
});

test('passes real package contents, and flags a missing file', () => {
  assert.deepEqual(problems(['lib/index.js', 'registry/components/button.tsx', 'docs/theming.md'], ['lib/index.js']), []);
  assert.deepEqual(problems([], ['LICENSE']), ['missing: LICENSE']);
});
