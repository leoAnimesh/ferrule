#!/usr/bin/env node
// Decides what a push to main releases. Read-only: it asks git, npm and GitHub, and changes nothing.
// `node scripts/release-plan.mjs`             prints the plan as key=value lines, for GITHUB_OUTPUT
// `node scripts/release-plan.mjs --check`     only the checks that need no network, for pull requests
// `node scripts/release-plan.mjs --published` prints published=true if this version of `ferrule` is on npm
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const parse = (version) => version.split('.').map(Number);
const isGreater = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (const i of [0, 1, 2]) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

/** What must agree before anything can ship. Returns the problems. */
export function consistency({ ferruleVersion, nativeVersion, peerRange, changelog }) {
  const problems = [];
  if (!/^\d+\.\d+\.\d+$/.test(ferruleVersion)) problems.push(`version ${ferruleVersion} must be plain x.y.z`);
  if (nativeVersion !== ferruleVersion) problems.push(`ferrule is ${ferruleVersion} but ferrule-native is ${nativeVersion}`);
  if (peerRange !== `>=${ferruleVersion}`) problems.push(`ferrule-native's ferrule peer is ${peerRange}, expected >=${ferruleVersion}`);
  if (!new RegExp(`^## ${ferruleVersion.replace(/\./g, '\\.')}\\b`, 'm').test(changelog)) problems.push(`CHANGELOG.md has no "## ${ferruleVersion}" section`);
  return problems;
}

/**
 * The tag is the record that a version is finished, and it is created last, so:
 * - A tag means never publish, whatever npm says. This is what stops 0.1.0, tagged but never on npm, going out with today's code.
 * - No tag means a new version, or one that stopped partway, and only what is missing runs. A plain merge changes no version, so its tag exists and nothing runs.
 */
export function decide({ ferruleVersion, tags, releaseExists, onNpm }) {
  const version = ferruleVersion;
  const none = { action: 'none', publishFerrule: false, publishNative: false, createRelease: false };
  if (tags.includes(`v${version}`)) {
    if (releaseExists) return none;
    if (!onNpm.ferrule || !onNpm.native) throw new Error(`v${version} is tagged, with no GitHub release, and is not fully on npm. Tags are never published over, so fix this by hand.`);
    return { ...none, action: 'release', createRelease: true };
  }
  const newer = tags.map((tag) => tag.slice(1)).filter((other) => isGreater(other, version));
  if (newer.length > 0) throw new Error(`${version} is older than the tagged ${newer.join(', ')}.`);
  return { action: 'release', publishFerrule: !onNpm.ferrule, publishNative: !onNpm.native, createRelease: true };
}

/** The text of one version's CHANGELOG section, for the release notes. */
export function notesFor(changelog, version) {
  const lines = changelog.split('\n');
  const start = lines.indexOf(lines.find((line) => line.startsWith(`## ${version}`)));
  if (start < 0) throw new Error(`CHANGELOG.md has no section for ${version}`);
  const after = lines.slice(start + 1);
  const end = after.findIndex((line) => line.startsWith('## '));
  return (end < 0 ? after : after.slice(0, end)).join('\n').trim();
}

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const pkg = (name) => JSON.parse(read(`packages/${name}/package.json`));
const sh = (command, args) => execFileSync(command, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

// Only a 404 means "not published". Any other failure must stop the run, never read as a green light.
function onNpm(name, version) {
  try {
    return sh('npm', ['view', `${name}@${version}`, 'version']).trim() === version;
  } catch (error) {
    if (/E404/.test(String(error.stderr))) return false;
    throw error;
  }
}

function releaseExists(tag) {
  try {
    sh('gh', ['release', 'view', tag, '--json', 'tagName']);
    return true;
  } catch (error) {
    if (/release not found/i.test(String(error.stderr))) return false;
    throw error;
  }
}

function main(flag) {
  const ferrule = pkg('ferrule');
  const native = pkg('ferrule-native');
  const version = ferrule.version;
  if (flag === '--published') return console.log(`published=${onNpm('ferrule', version)}`);
  if (flag === '--notes') return console.log(notesFor(read('CHANGELOG.md'), version));
  const problems = consistency({ ferruleVersion: version, nativeVersion: native.version, peerRange: native.peerDependencies.ferrule, changelog: read('CHANGELOG.md') });
  if (problems.length > 0) throw new Error(problems.join('\n'));
  if (flag === '--check') return console.log(`${version}: versions, peer range and changelog agree`);
  const tags = sh('git', ['ls-remote', '--tags', '--refs', 'origin', 'v*']).split('\n').filter(Boolean).map((line) => line.split('refs/tags/')[1]);
  const plan = decide({ ferruleVersion: version, tags, releaseExists: tags.includes(`v${version}`) && releaseExists(`v${version}`), onNpm: { ferrule: onNpm('ferrule', version), native: onNpm('ferrule-native', version) } });
  console.log(`version=${version}\naction=${plan.action}\npublish_ferrule=${plan.publishFerrule}\npublish_native=${plan.publishNative}\ncreate_release=${plan.createRelease}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv[2]);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
