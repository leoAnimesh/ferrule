import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REGISTRY_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'registry');
const CONFIG_FILE = 'ferrule.json';
const themeTemplate = (palette) => `import { createTheme } from 'ferrule';

// Change one word to reprint every component: ${readPaletteNames().join(', ')}.
// Unset tokens keep their defaults. See the theming guide for every token.
export const theme = createTheme({
  palette: '${palette}',
  colors: {
    light: {},
    dark: {},
  },
  tokens: {},
  components: {},
});
`;

export class CliError extends Error {}

// shortcut: the registry ships inside this package and is read locally, fetch it remotely once components should update independently of releases.
export function readRegistry() {
  return JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'registry.json'), 'utf8')).components;
}

/** Keeps a configured directory inside the project, so a hostile or mistaken config cannot write elsewhere. */
function resolveInside(cwd, relative) {
  const root = path.resolve(cwd);
  const target = path.resolve(root, relative);
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new CliError(`"${relative}" is outside the project.`);
  }
  // Symlinks can also point outside the project, so check the nearest directory that really exists.
  let existing = target;
  while (!fs.existsSync(existing)) existing = path.dirname(existing);
  const real = fs.realpathSync(existing);
  const realRoot = fs.realpathSync(root);
  if (real !== realRoot && !real.startsWith(realRoot + path.sep)) {
    throw new CliError(`"${relative}" resolves outside the project.`);
  }
  return target;
}

function readPackageJson(cwd) {
  const file = path.join(cwd, 'package.json');
  if (!fs.existsSync(file)) throw new CliError(`No package.json in ${cwd}. Run this in your React Native project.`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    throw new CliError(`${file} is not valid JSON.`);
  }
}

function readConfig(cwd) {
  const file = path.join(cwd, CONFIG_FILE);
  if (!fs.existsSync(file)) throw new CliError(`No ${CONFIG_FILE} found. Run "ferrule init" first.`);
  let config;
  try {
    config = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    throw new CliError(`${CONFIG_FILE} is not valid JSON.`);
  }
  if (typeof config.componentsDir !== 'string' || !config.componentsDir) {
    throw new CliError(`${CONFIG_FILE} needs a "componentsDir" string.`);
  }
  return config;
}

function readPaletteNames() {
  return JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'registry.json'), 'utf8')).palettes;
}

const NAMED_COLORS = 'white|black|red|green|blue|gray|grey|yellow|orange|purple|pink|brown';
const RAW_COLOR = new RegExp(`#[0-9a-fA-F]{3,8}\\b|\\b(?:rgb|hsl)a?\\(|['"\`](?:${NAMED_COLORS})['"\`]`);

/** Lines with a raw color value. Components use semantic tokens only, so a palette can reprint them. `transparent` is allowed. */
export function findRawColors(source) {
  const results = [];
  source.split('\n').forEach((line, index) => {
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    if (RAW_COLOR.test(code)) results.push({ line: index + 1, text: line.trim() });
  });
  return results;
}

const WORKLETS_PLUGIN = 'react-native-worklets/plugin';
const BABEL_FILES = ['babel.config.js', 'babel.config.cjs', 'babel.config.mjs', 'babel.config.ts', '.babelrc', '.babelrc.js', '.babelrc.json'];

/** `[major, minor, patch]` from a version or a simple range like `^4.7.0` or `~58.0.1`. */
export function parseVersion(text) {
  const match = String(text ?? '').match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  return match ? [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)] : null;
}

function atLeast(version, minimum) {
  for (let i = 0; i < 3; i++) {
    if (version[i] !== minimum[i]) return version[i] > minimum[i];
  }
  return true;
}

/** Walks up, so hoisted monorepo installs are found. */
function installedPackage(cwd, name) {
  let dir = path.resolve(cwd);
  for (;;) {
    const file = path.join(dir, 'node_modules', name, 'package.json');
    if (fs.existsSync(file)) return { dir: path.dirname(file), version: JSON.parse(fs.readFileSync(file, 'utf8')).version };
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function installCommand(cwd, pkg, packages) {
  if (pkg.dependencies?.expo) return `npx expo install ${packages.join(' ')}`;
  const exists = (file) => fs.existsSync(path.join(cwd, file));
  const tool = exists('pnpm-lock.yaml') ? 'pnpm add' : exists('yarn.lock') ? 'yarn add' : 'npm install';
  return `${tool} ${packages.join(' ')}\n    Then rebuild the native app (on iOS, run pod install first).`;
}

/** Inserts the worklets plugin last in a Babel config's text. Returns null if the shape is not recognized, so nothing is written blindly. */
export function addWorkletsPlugin(source) {
  const closeOf = (open) => {
    let depth = 0;
    let quote = null;
    for (let i = open; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (ch === '\\') i++;
        else if (ch === quote) quote = null;
      } else if (ch === "'" || ch === '"' || ch === '`') quote = ch;
      else if (ch === '[') depth++;
      else if (ch === ']' && --depth === 0) return i;
    }
    return -1;
  };
  const arrayAfter = (key) => {
    const found = source.match(new RegExp(`\\b${key}\\s*:\\s*\\[`));
    if (!found) return null;
    const open = found.index + found[0].length - 1;
    const close = closeOf(open);
    return close === -1 ? null : { open, close };
  };

  const plugins = arrayAfter('plugins');
  if (plugins) {
    const body = source.slice(plugins.open + 1, plugins.close);
    const trimmed = body.trimEnd();
    const separator = trimmed.trim() === '' || trimmed.endsWith(',') ? '' : ',';
    const lead = trimmed.includes('\n') ? '\n    ' : trimmed.trim() === '' ? '' : ' ';
    return `${source.slice(0, plugins.open + 1)}${trimmed}${separator}${lead}'${WORKLETS_PLUGIN}'${body.includes('\n') ? ',\n  ' : ''}${source.slice(plugins.close)}`;
  }
  const presets = arrayAfter('presets');
  if (!presets) return null;
  const rest = source.slice(presets.close + 1);
  const comma = rest.trimStart().startsWith(',');
  const tail = comma ? rest.trimStart().slice(1) : rest;
  return `${source.slice(0, presets.close + 1)},\n  plugins: ['${WORKLETS_PLUGIN}'],${tail.startsWith('\n') ? '' : '\n'}${tail}`;
}

/** Finds problems with the required peers. Each has `message`, and `fix` to tell the user what to do. */
export function checkSetup(cwd) {
  const pkg = readPackageJson(cwd);
  const declared = { ...pkg.devDependencies, ...pkg.dependencies };
  const peers = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, '..', 'package.json'), 'utf8')).peerDependencies;
  const required = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'registry.json'), 'utf8')).requires;
  const problems = [];

  const missing = [];
  for (const name of required) {
    const installed = installedPackage(cwd, name);
    const version = parseVersion(installed?.version ?? declared[name]);
    const minimum = parseVersion(peers[name]);
    if (!version) missing.push(name);
    else if (!atLeast(version, minimum)) {
      problems.push({ message: `${name} ${installed?.version ?? declared[name]} is older than the required ${peers[name]}.`, fix: installCommand(cwd, pkg, [`${name}@latest`]) });
    }
  }
  if (missing.length) {
    problems.push({ message: `Missing required ${missing.length > 1 ? 'dependencies' : 'dependency'}: ${missing.join(', ')}.`, fix: installCommand(cwd, pkg, missing) });
  }

  const rnVersion = parseVersion(installedPackage(cwd, 'react-native')?.version ?? declared['react-native']);
  if (rnVersion && !atLeast(rnVersion, parseVersion(peers['react-native']))) {
    problems.push({ message: `react-native ${rnVersion.join('.')} is older than the required ${peers['react-native']}, which is what Reanimated 4.7 needs.`, fix: 'Upgrade React Native.' });
  }

  // Reanimated publishes which worklets versions pair with each release, so use its own table.
  const reanimated = installedPackage(cwd, 'react-native-reanimated');
  const worklets = installedPackage(cwd, 'react-native-worklets');
  const table = reanimated && path.join(reanimated.dir, 'compatibility.json');
  if (worklets && table && fs.existsSync(table)) {
    const [major, minor] = parseVersion(reanimated.version);
    const allowed = JSON.parse(fs.readFileSync(table, 'utf8')).fabric?.[`${major}.${minor}.x`]?.['react-native-worklets'] ?? [];
    const [wMajor, wMinor] = parseVersion(worklets.version);
    if (allowed.length && !allowed.includes(`${wMajor}.${wMinor}.x`) && !allowed.includes('nightly')) {
      problems.push({
        message: `react-native-worklets ${worklets.version} does not pair with react-native-reanimated ${reanimated.version}, which needs ${allowed.join(' or ')}.`,
        fix: installCommand(cwd, pkg, [`react-native-worklets@${allowed[allowed.length - 1].replace('.x', '')}`]),
      });
    }
  }

  const babelFile = BABEL_FILES.find((file) => fs.existsSync(path.join(cwd, file)));
  const babel = babelFile ? fs.readFileSync(path.join(cwd, babelFile), 'utf8') : '';
  const expo = Boolean(declared.expo);
  if (babel.includes('react-native-reanimated/plugin')) {
    problems.push({ message: `${babelFile} uses the old Reanimated Babel plugin.`, fix: `Replace 'react-native-reanimated/plugin' with '${WORKLETS_PLUGIN}'.`, babel: 'rename' });
  } else if (!expo && !babel.includes(WORKLETS_PLUGIN)) {
    // Expo's preset adds the plugin itself, so only other apps need it configured.
    problems.push({
      message: babelFile ? `${babelFile} does not include the worklets Babel plugin.` : 'No Babel config found, and Reanimated needs its plugin.',
      fix: `Add '${WORKLETS_PLUGIN}' as the LAST entry of "plugins" in your Babel config, then restart Metro with --reset-cache. "ferrule init --fix" can do this.`,
      babel: babelFile ? 'add' : 'create',
    });
  }
  return problems;
}

/** Applies the Babel part of `checkSetup` where the config's shape is understood. Returns a message for each file touched or refused. */
export function fixBabel(cwd, problems) {
  const notes = [];
  for (const problem of problems) {
    if (!problem.babel) continue;
    const file = BABEL_FILES.find((name) => fs.existsSync(path.join(cwd, name)));
    if (problem.babel === 'create') {
      fs.writeFileSync(path.join(cwd, 'babel.config.js'), `module.exports = {\n  presets: ['module:@react-native/babel-preset'],\n  plugins: ['${WORKLETS_PLUGIN}'],\n};\n`);
      notes.push('created babel.config.js');
      problem.fixed = true;
      continue;
    }
    const target = path.join(cwd, file);
    const source = fs.readFileSync(target, 'utf8');
    const next = problem.babel === 'rename' ? source.replaceAll('react-native-reanimated/plugin', WORKLETS_PLUGIN) : addWorkletsPlugin(source);
    if (next === null) {
      notes.push(`could not edit ${file} safely, so left it unchanged`);
      continue;
    }
    fs.writeFileSync(target, next);
    notes.push(`updated ${file}`);
    problem.fixed = true;
  }
  return notes;
}

function reportSetup(problems, log) {
  for (const { message, fix, fixed } of problems) {
    if (fixed) continue;
    log(`  ! ${message}\n    Fix: ${fix}`);
  }
}

/** Configures an existing React Native project. Never overwrites a file you already have. */
export function init(cwd, { componentsDir = 'components/ui', palette = 'verdigris', fix = false, log = console.log } = {}) {
  if (!readPaletteNames().includes(palette)) throw new CliError(`Unknown palette "${palette}". Choose one of: ${readPaletteNames().join(', ')}.`);
  const pkg = readPackageJson(cwd);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
  if (!deps['react-native']) throw new CliError('This project does not depend on react-native.');
  resolveInside(cwd, componentsDir);

  const usesTs = fs.existsSync(path.join(cwd, 'tsconfig.json'));
  const themeFile = usesTs ? 'ferrule.theme.ts' : 'ferrule.theme.js';
  const created = [];
  for (const [file, content] of [
    [CONFIG_FILE, JSON.stringify({ componentsDir }, null, 2) + '\n'],
    [themeFile, themeTemplate(palette)],
  ]) {
    const target = path.join(cwd, file);
    if (fs.existsSync(target)) log(`  kept    ${file} (already exists)`);
    else {
      fs.writeFileSync(target, content);
      created.push(file);
      log(`  created ${file}`);
    }
  }

  const problems = checkSetup(cwd);
  if (fix) for (const note of fixBabel(cwd, problems)) log(`  ${note}`);
  if (problems.some((problem) => !problem.fixed)) log('\nReanimated setup needs attention:');
  reportSetup(problems, log);

  log(`
Next:
  1. Wrap your app root:
       import { FerruleProvider } from 'ferrule';
       import { theme } from './ferrule.theme';
       <FerruleProvider theme={theme}>...</FerruleProvider>
  2. Add components:
       npx ferrule add button input
  3. On web only, also install react-native-web.`);
  return { created, themeFile, problems };
}

function withDependencies(names, registry) {
  const seen = new Set();
  const visit = (name) => {
    if (seen.has(name)) return;
    // Names come from the command line and are only ever looked up here, never used to build a path.
    if (!Object.hasOwn(registry, name)) {
      throw new CliError(`Unknown component "${name}". Run "ferrule list" to see what is available.`);
    }
    seen.add(name);
    registry[name].dependencies.forEach(visit);
  };
  names.forEach(visit);
  return [...seen];
}

/** Copies component source into the project so you own it. Refuses to replace your edits without `overwrite`. */
export function add(cwd, names, { all = false, overwrite = false, log = console.log } = {}) {
  const config = readConfig(cwd);
  const registry = readRegistry();
  if (!all && names.length === 0) throw new CliError('Name at least one component, or pass --all.');
  const resolved = withDependencies(all ? Object.keys(registry) : names, registry);
  const dir = resolveInside(cwd, config.componentsDir);

  const copied = [];
  const skipped = [];
  fs.mkdirSync(dir, { recursive: true });
  for (const name of resolved) {
    const { file } = registry[name];
    const target = path.join(dir, file);
    const source = fs.readFileSync(path.join(REGISTRY_DIR, 'components', file));
    if (fs.existsSync(target) && !overwrite) {
      if (fs.readFileSync(target).equals(source)) log(`  same    ${file}`);
      else log(`  kept    ${file} (differs from the registry, pass --overwrite to replace it)`);
      skipped.push(name);
      continue;
    }
    fs.writeFileSync(target, source);
    copied.push(name);
    log(`  added   ${path.join(config.componentsDir, file)}`);
  }
  // Every component imports from 'ferrule', which needs Reanimated, so each add checks it.
  const problems = checkSetup(cwd);
  if (problems.length) log('\nThese components need Reanimated, and its setup needs attention:');
  reportSetup(problems, log);
  return { copied, skipped, problems };
}

// Names `ferrule` re-exports. Importing these from react-native is what the check rejects.
// Anything else in react-native (Linking, Alert, ...) is not covered by this library and stays allowed.
export const COVERED_PRIMITIVES = new Set([
  'AccessibilityInfo', 'Animated', 'AppState', 'Easing', 'FlatList', 'I18nManager', 'Image', 'KeyboardAvoidingView', 'Modal', 'PanResponder',
  'Platform', 'Pressable', 'ScrollView', 'SectionList', 'StatusBar', 'StyleSheet', 'Switch', 'Text', 'TextInput', 'TouchableOpacity',
  'TouchableHighlight', 'TouchableWithoutFeedback', 'useWindowDimensions', 'View', 'ActivityIndicator', 'Button', 'SafeAreaView',
]);

const SKIP_DIRS = new Set(['node_modules', 'ios', 'android', 'dist', 'build', 'lib', 'web-build', 'macos', 'windows', 'coverage']);

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

/** Returns problems in one source file. Type-only imports are fine: they have no runtime effect. */
export function findViolations(source) {
  const code = stripComments(source);
  const problems = [];
  // No quotes in the clause: a side-effect import above, like `import 'ferrule-native'`, must not join it.
  const named = /(^|\n)\s*(?:import|export)\s+(type\s+)?([^'"]*?)\s+from\s+['"]react-native['"]/g;
  for (const match of code.matchAll(named)) {
    if (match[2]) continue;
    const clause = match[3];
    const braces = clause.match(/\{([\s\S]*)\}/);
    if (!braces || clause.replace(braces[0], '').replace(',', '').trim()) {
      problems.push('default or namespace import of react-native');
    }
    for (const part of (braces?.[1] ?? '').split(',')) {
      const item = part.trim();
      if (!item || item.startsWith('type ')) continue;
      const name = item.split(/\s+as\s+/)[0].trim();
      if (COVERED_PRIMITIVES.has(name)) problems.push(`"${name}" from react-native`);
    }
  }
  if (/(^|\n)\s*import\s+['"]react-native['"]/.test(code)) problems.push('bare import of react-native');
  for (const match of code.matchAll(/\brequire\(\s*['"]react-native['"]\s*\)|\bimport\(\s*['"]react-native['"]\s*\)/g)) {
    problems.push(`${match[0].startsWith('require') ? 'require' : 'dynamic import'} of react-native`);
  }
  return problems;
}

/** Scans project source. Returns `{ file, problem }` for every primitive imported directly from react-native. */
export function check(cwd) {
  const results = [];
  const configFile = path.join(cwd, CONFIG_FILE);
  const componentsRoot = path.resolve(cwd, fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')).componentsDir : 'components/ui');
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || (entry.isDirectory() && SKIP_DIRS.has(entry.name))) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.[jt]sx?$/.test(entry.name) && !/\.config\.[jt]s$/.test(entry.name)) {
        const source = fs.readFileSync(full, 'utf8');
        for (const problem of findViolations(source)) results.push({ file: path.relative(cwd, full), problem });
        if (full.startsWith(componentsRoot + path.sep)) {
          for (const { line, text } of findRawColors(source)) {
            results.push({ file: `${path.relative(cwd, full)}:${line}`, problem: `raw color, use a semantic token from useTheme(): ${text}` });
          }
        }
      }
    }
  };
  walk(cwd);
  return results;
}

const USAGE = `ferrule - consistent React Native UI components, copied into your project

  ferrule init [--dir <componentsDir>]      Configure this project (ferrule.json and a theme file)
               [--palette <name>]           Start from a color palette
               [--fix]                      Also add the Reanimated plugin to your Babel config
  ferrule add <name...> [--overwrite]       Copy components and what they depend on
  ferrule add --all [--overwrite]           Copy every component
  ferrule list                              List available components
  ferrule check                             Fail if primitives are imported from react-native, or Reanimated is misconfigured

Every command accepts --cwd <path>.`;

function takeFlag(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1) return false;
  args.splice(index, 1);
  return true;
}

function takeOption(args, option) {
  const index = args.indexOf(option);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new CliError(`${option} needs a value.`);
  args.splice(index, 2);
  return value;
}

export async function run(argv) {
  const [command, ...args] = argv;
  if (command === '--version' || command === '-v') {
    console.log(JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version);
    return 0;
  }
  try {
    const cwd = path.resolve(takeOption(args, '--cwd') ?? process.cwd());
    switch (command) {
      case 'init':
        init(cwd, { componentsDir: takeOption(args, '--dir'), palette: takeOption(args, '--palette'), fix: takeFlag(args, '--fix') });
        return 0;
      case 'add': {
        const all = takeFlag(args, '--all');
        const overwrite = takeFlag(args, '--overwrite');
        const unknown = args.find((arg) => arg.startsWith('-'));
        if (unknown) throw new CliError(`Unknown option ${unknown}.`);
        add(cwd, args, { all, overwrite });
        return 0;
      }
      case 'list':
        for (const [name, entry] of Object.entries(readRegistry())) console.log(`  ${name.padEnd(10)} ${entry.description}`);
        return 0;
      case 'check': {
        const results = check(cwd);
        for (const { file, problem } of results) console.error(`  ${file}: ${problem}`);
        if (results.length) console.error(`\n${results.length} problem(s). Import primitives from 'ferrule', and use semantic tokens for color.`);
        const problems = checkSetup(cwd);
        reportSetup(problems, console.error);
        if (results.length || problems.length) return 1;
        console.log('No direct react-native primitive imports or raw colors. Reanimated setup looks right.');
        return 0;
      }
      default:
        console.log(USAGE);
        return command === undefined || command === 'help' || command === '--help' ? 0 : 1;
    }
  } catch (error) {
    if (error instanceof CliError) {
      console.error(`ferrule: ${error.message}`);
      return 1;
    }
    throw error;
  }
}
