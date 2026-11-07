#!/usr/bin/env node
// Fails if a package would ship anything beyond what an app needs. Usage: node scripts/check-pack.mjs. Build first: `lib/` must exist.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FORBIDDEN = [/(^|\/)(AGENTS|CLAUDE)\.md$/, /^apps\//, /(^|\/)e2e\//, /(^|\/)baselines\//, /(^|\/)\.claude\//, /(^|\/)skills\//, /(^|\/)media\//, /\.(mp4|mov|webm|gif|jpe?g|tgz)$/i, /\.test\.[cm]?[jt]sx?$/, /(^|\/)(build|node_modules|\.gradle)\//];
// Every package must carry these, or an install would be useless or unlicensed.
const REQUIRED = { ferrule: ['package.json', 'README.md', 'LICENSE', 'lib/index.js', 'bin/ferrule.js', 'cli/index.js', 'registry/registry.json'], 'ferrule-native': ['package.json', 'README.md', 'LICENSE', 'src/index.ts', 'FerruleNative.podspec', 'android/build.gradle'] };

export const problems = (files, required) => [
  ...files.filter((file) => FORBIDDEN.some((pattern) => pattern.test(file))).map((file) => `must not ship: ${file}`),
  ...required.filter((file) => !files.includes(file)).map((file) => `missing: ${file}`),
];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let failed = false;
  for (const [name, required] of Object.entries(REQUIRED)) {
    const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: path.join(ROOT, 'packages', name), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const [{ files, size, unpackedSize }] = JSON.parse(out);
    const { exports: map = {} } = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages', name, 'package.json'), 'utf8'));
    const targets = Object.values(map).flatMap((entry) => (typeof entry === 'string' ? [entry] : Object.values(entry))).map((file) => file.replace('./', ''));
    const found = problems(files.map((file) => file.path), [...required, ...targets]);
    console.log(`${name}: ${files.length} files, ${(size / 1024).toFixed(0)} kB packed, ${(unpackedSize / 1024).toFixed(0)} kB unpacked`);
    for (const problem of found) console.log(`  ${problem}`);
    failed ||= found.length > 0;
  }
  process.exit(failed ? 1 : 0);
}
