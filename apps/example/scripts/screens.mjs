#!/usr/bin/env node
// Visual regression for the component catalog. See apps/example/e2e/screens/README.md.
// Usage: pnpm screens [ios|android|web ...] [--update] [--only=<id,id>]
import { execFile, execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compare, decode, encode, isBlank, shrink } from './png.mjs';

const EXAMPLE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINES = path.join(EXAMPLE, 'e2e/screens/baselines');
const OUT = path.join(EXAMPLE, 'e2e/screens/out');
const CATALOG = fs.readFileSync(path.join(EXAMPLE, 'src/catalog.ts'), 'utf8');
// The list itself, then every component's detail screen. `catalog` opens with no component.
const SHOTS = ['catalog', ...[...CATALOG.matchAll(/entry\('([\w-]+)'/g)].map((match) => match[1])];
const MODES = ['light', 'dark'];
const PORT = 8090;
const COMMAND_TIMEOUT = 90000;
const MAX_WIDTH = 440;
const MAX_CHANGED = 0.005;
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = process.argv.slice(2);
const update = args.includes('--update');
const only = args.find((arg) => arg.startsWith('--only='))?.slice(7).split(',');
const asked = args.filter((arg) => !arg.startsWith('--'));
const platforms = asked.length ? asked : ['ios', 'android', 'web'];
const run = (command, list, options = {}) => execFileSync(command, list, { timeout: COMMAND_TIMEOUT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28, ...options });
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const fail = (message) => { throw new Error(message); };

async function metroUp() {
  try {
    return (await (await fetch(`http://localhost:${PORT}/status`)).text()).includes('running');
  } catch {
    return false;
  }
}

/** Takes screenshots until two in a row match and show the app, so loading, a cold start's blank screen and entrance animations do not reach the comparison. */
async function settled(capture) {
  let last = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    const image = decode(await capture());
    if (last && !isBlank(image) && compare(last, image, { tolerance: 8 }).ratio < 0.0005) return image;
    last = image;
    await sleep(1500);
  }
  return last;
}

function iosDriver() {
  const devices = JSON.parse(run('xcrun', ['simctl', 'list', 'devices', 'booted', '-j'])).devices;
  const booted = Object.entries(devices).flatMap(([runtime, list]) => list.map((device) => ({ ...device, runtime })));
  const device = booted.find((d) => !process.env.FERRULE_IOS_UDID || d.udid === process.env.FERRULE_IOS_UDID);
  if (!device) fail('no booted iOS simulator. Boot one, or set FERRULE_IOS_UDID.');
  const app = 'dev.ferrule.harness';
  try {
    run('xcrun', ['simctl', 'get_app_container', device.udid, app]);
  } catch {
    fail(`${app} is not installed on ${device.name}. Run: pnpm --filter ferrule-example ios`);
  }
  const shot = path.join(os.tmpdir(), `ferrule-ios-${process.pid}.png`);
  return {
    ignoreTop: 0.065,
    device: `${device.name}, ${device.runtime.split('.').pop()}`,
    open(url) {
      try { run('xcrun', ['simctl', 'terminate', device.udid, app]); } catch { /* It was not running. */ }
      run('xcrun', ['simctl', 'openurl', device.udid, url]);
    },
    capture() {
      run('xcrun', ['simctl', 'io', device.udid, 'screenshot', '--type=png', shot]);
      return fs.readFileSync(shot);
    },
  };
}

function androidDriver() {
  // ANDROID_SERIAL picks one when a phone and an emulator are both attached.
  const serial = process.env.ANDROID_SERIAL ?? run('adb', ['devices']).split('\n').slice(1).find((line) => line.endsWith('device'))?.split('\t')[0];
  if (!serial) fail('no Android device or emulator. Start one first.');
  const adb = (...list) => run('adb', ['-s', serial, ...list]);
  const app = 'dev.ferrule.harness';
  if (!adb('shell', 'pm', 'list', 'packages', app).includes(app)) fail(`${app} is not installed. Run: pnpm --filter ferrule-example android`);
  adb('reverse', `tcp:${PORT}`, `tcp:${PORT}`);
  // Debug builds reach Metro over the local network, which API 36+ otherwise asks about on the first launch.
  try { adb('shell', 'pm', 'grant', app, 'android.permission.ACCESS_LOCAL_NETWORK'); } catch { /* An older OS, without that permission. */ }
  return {
    ignoreTop: 0.04,
    device: `${adb('shell', 'getprop', 'ro.product.model').trim()}, API ${adb('shell', 'getprop', 'ro.build.version.sdk').trim()}`,
    open(url) {
      adb('shell', 'am', 'force-stop', app);
      adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', `'${url}'`, app);
    },
    capture: () => execFileSync('adb', ['-s', serial, 'exec-out', 'screencap', '-p'], { timeout: COMMAND_TIMEOUT, maxBuffer: 1 << 28 }),
  };
}

// 500 wide, because headless Chrome has that as its minimum window width.
function webDriver() {
  if (!fs.existsSync(CHROME)) fail(`Chrome not found at ${CHROME}. Set CHROME to its path.`);
  const version = run(CHROME, ['--version']).trim();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ferrule-web-'));
  const shot = path.join(dir, 'shot.png');
  let target = '';
  return {
    ignoreTop: 0,
    device: `${version}, 500x915`,
    open(url) {
      target = `http://localhost:${PORT}/${url.slice(url.indexOf('?'))}`;
    },
    async capture() {
      await new Promise((done, failed) => execFile(CHROME, ['--headless=new', '--force-prefers-reduced-motion', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${dir}/profile`, '--window-size=500,915', '--virtual-time-budget=15000', `--screenshot=${shot}`, target], { timeout: COMMAND_TIMEOUT }, (error) => (error ? failed(new Error(`Chrome did not finish capturing ${target} within ${COMMAND_TIMEOUT / 1000}s`)) : done())));
      return fs.readFileSync(shot);
    },
  };
}

const DRIVERS = { ios: iosDriver, android: androidDriver, web: webDriver };

async function checkPlatform(platform) {
  const driver = DRIVERS[platform]?.() ?? fail(`unknown platform "${platform}". Use ios, android or web.`);
  const dir = path.join(BASELINES, platform);
  const metaFile = path.join(dir, 'meta.json');
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : null;
  if (!update && !meta) fail(`no baselines for ${platform}. Create them with: pnpm screens ${platform} --update`);
  if (!update && meta.device !== driver.device) fail(`baselines were saved on "${meta.device}", but this is "${driver.device}". Pixels differ between devices, so use that one, or rebaseline with --update.`);
  const results = [];
  fs.mkdirSync(update ? dir : path.join(OUT, platform), { recursive: true });
  for (const screen of SHOTS.filter((id) => !only || only.includes(id))) for (const mode of MODES) {
    const name = `${screen}-${mode}`;
    driver.open(`dev.ferrule.harness://?mode=${mode}${screen === 'catalog' ? '' : `&component=${screen}`}`);
    await sleep(platform === 'web' ? 0 : 4000);
    const image = shrink(await settled(driver.capture), MAX_WIDTH);
    if (update) {
      fs.writeFileSync(path.join(dir, `${name}.png`), encode(image));
      results.push({ name, ok: true, note: 'saved' });
      continue;
    }
    const file = path.join(dir, `${name}.png`);
    fs.writeFileSync(path.join(OUT, platform, `${name}.actual.png`), encode(image));
    if (!fs.existsSync(file)) { results.push({ name, ok: false, note: 'no baseline' }); continue; }
    const { ratio, sizeChanged, diff } = compare(decode(fs.readFileSync(file)), image, { ignoreTop: driver.ignoreTop });
    if (diff) fs.writeFileSync(path.join(OUT, platform, `${name}.diff.png`), encode(diff));
    results.push({ name, ok: ratio <= MAX_CHANGED, note: sizeChanged ? 'size changed' : `${(ratio * 100).toFixed(2)}% changed` });
  }
  if (update) fs.writeFileSync(metaFile, `${JSON.stringify({ device: driver.device, savedAt: new Date().toISOString().slice(0, 10) }, null, 2)}\n`);
  return results;
}

let metro = null;
if (!(await metroUp())) {
  console.log(`Starting Metro on ${PORT}...`);
  metro = spawn('npx', ['expo', 'start', '--port', String(PORT)], { cwd: EXAMPLE, env: { ...process.env, CI: '1' }, stdio: 'ignore', detached: true });
  for (let n = 0; n < 60 && !(await metroUp()); n++) await sleep(1000);
}

let failed = false;
try {
  for (const platform of platforms) {
    console.log(`\n${platform}`);
    try {
      for (const { name, ok, note } of await checkPlatform(platform)) {
        console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(28)} ${note}`);
        failed ||= !ok;
      }
    } catch (error) {
      console.log(`  FAIL  ${error.message}`);
      failed = true;
    }
  }
} finally {
  if (metro) process.kill(-metro.pid);
}
if (failed) console.log(`\nFAILED. Actual and diff images are in ${path.relative(process.cwd(), OUT)}. If the change was intended, rerun with --update and review the new baselines.`);
if (!failed && !update) console.log('\nPASSED');
process.exit(failed ? 1 : 0);
