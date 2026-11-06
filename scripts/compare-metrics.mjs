#!/usr/bin/env node
// Compares FERRULE_METRICS logs from the harness's metrics screen across platforms.
// Usage: compare-metrics.mjs [--tolerance dp] ios.log android.log web.log
// Each file is any log containing a FERRULE_METRICS line. The last line in a file wins.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
let tolerance = 1;
const toleranceAt = args.indexOf('--tolerance');
if (toleranceAt !== -1) tolerance = Number(args.splice(toleranceAt, 2)[1]);
if (args.length < 2 || !Number.isFinite(tolerance)) {
  console.error('Usage: compare-metrics.mjs [--tolerance dp] <log> <log> [log...]');
  process.exit(2);
}

const load = (file) => {
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter((line) => line.includes('FERRULE_METRICS '));
  const last = lines.at(-1);
  if (!last) throw new Error(`No FERRULE_METRICS line in ${file}`);
  // Metro can wrap and quote log lines, so take the outermost JSON object.
  const json = last.slice(last.indexOf('{', last.indexOf('FERRULE_METRICS')), last.lastIndexOf('}') + 1);
  return { name: path.basename(file, path.extname(file)), results: JSON.parse(json).results };
};

const runs = args.map(load);
const ids = [...new Set(runs.flatMap((run) => Object.keys(run.results)))].sort();
let failures = 0;
const fmt = (size) => (size ? `${size[0]}x${size[1]}` : '-');
console.log(['probe'.padEnd(22), ...runs.map((run) => run.name.padEnd(14)), 'dW', 'dH'].join(' '));
for (const id of ids) {
  const sizes = runs.map((run) => run.results[id]);
  const missing = sizes.some((size) => !size);
  const spread = (axis) => (missing ? Infinity : Math.max(...sizes.map((s) => s[axis])) - Math.min(...sizes.map((s) => s[axis])));
  const [dw, dh] = [spread(0), spread(1)];
  const bad = dw > tolerance || dh > tolerance;
  if (bad) failures++;
  console.log([id.padEnd(22), ...sizes.map((size) => fmt(size).padEnd(14)), dw.toFixed(1), dh.toFixed(1), bad ? 'DIFF' : ''].join(' '));
}
console.log(`\n${ids.length - failures}/${ids.length} probes within ${tolerance}dp across ${runs.map((run) => run.name).join(', ')}.`);
process.exit(failures ? 1 : 0);
