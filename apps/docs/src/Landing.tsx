import { useState } from 'react';
import { Segmented } from '../components/ui/segmented';
import { Text } from '../components/ui/text';
import { Code, Feather, Header } from './chrome';
import { COMPONENTS } from './components';
import { LANDING, MEDIA, REPO } from './captures';
import { MediaFigure } from './Media';
import { Link } from './router';
import { Masonry, Wall } from './Wall';
import { version } from '../../../packages/ferrule/package.json';


const INSTALL: Record<string, string> = {
  expo: `# 1. Peers, then Ferrule
npx expo install react-native-reanimated react-native-worklets
npm install ferrule

# 2. Write ferrule.json and the theme file
npx ferrule init --fix

# 3. Copy in the components you want
npx ferrule add button input`,
  bare: `# 1. Peers, then Ferrule
npm install react-native-reanimated react-native-worklets
npm install ferrule
cd ios && pod install && cd ..

# 2. Write ferrule.json and the theme file
npx ferrule init --fix

# 3. Copy in the components you want
npx ferrule add button input`,
};

const FACTS: { href: string; link: string; rest: string }[] = [
  { href: '/docs/cli', link: 'add keeps your edits', rest: ' unless you pass --overwrite.' },
  { href: '/docs/cli', link: 'ferrule check', rest: ' exits 1 on raw colors or primitives imported from react-native, so it fits in CI.' },
  { href: '/docs/palettes', link: 'Seven palettes', rest: ' derived from one ink each, and AA in light and dark.' },
  { href: '/docs/icons', link: '287 Feather icons', rest: ' with no icon font and no SVG dependency.' },
  { href: '/docs/getting-started', link: 'One required native library', rest: ': Reanimated, with its worklets peer. No font install, no Expo dependency.' },
  { href: '/docs/platforms', link: 'Sizes match across platforms', rest: ': with one font, 27 of 30 scripted probes within 1dp, all within 1.4dp.' },
  { href: '/docs/native', link: 'Real platform views on request', rest: ': add native, and it falls back to the Ferrule component where the view cannot draw.' },
  { href: '/docs/platforms', link: 'RTL and reduced motion', rest: ' run on all three, large text on iOS and Android, keyboard and focus on web.' },
];

const PLATFORMS: [string, string, string][] = [
  ['iOS', 'Verified', 'Components and native views, on the iOS 26.5 simulator with scripted taps. iOS 17 to 25 is compiled and not run.'],
  ['Android', 'Verified', 'Components and native views, on an API 37 emulator and a Pixel 8a phone, with scripted input.'],
  ['Web', 'Verified', 'Components, in Chrome. This page is running them. Native views fall back to the Ferrule component.'],
];

function Install() {
  const [kind, setKind] = useState('expo');
  return (
    <section id="install" className="install">
      <div className="install-copy">
        <h2>Install from npm, then copy in what you need</h2>
        <p>One package holds the CLI and every component.</p>
        <p>Most React Native libraries are a dependency you style around. Here, <code>add</code> copies the source into your project, along with what it depends on. It is your code from then on.</p>
        <p className="install-out">After <code>add button input</code>, your project has:</p>
        <ul className="files">
          <li><code>components/ui/button.tsx</code></li>
          <li><code>components/ui/input.tsx</code></li>
          <li><code>components/ui/spinner.tsx</code></li>
          <li><code>components/ui/text.tsx</code></li>
        </ul>
      </div>
      <div className="install-steps">
        <Segmented label="Project type" options={[{ value: 'expo', label: 'Expo' }, { value: 'bare', label: 'Bare React Native' }]} value={kind} onValueChange={setKind} />
        <Code html={`<pre class="shiki"><code>${INSTALL[kind]}</code></pre>`} label={`Install commands for ${kind === 'expo' ? 'Expo' : 'bare React Native'}`} />
        <p className="install-out">Needs React Native 0.86 or later on the New Architecture, and React 19. <Link href="/docs/getting-started">Full steps</Link>.</p>
      </div>
      <ul className="facts">
        {FACTS.map((fact) => <li key={fact.link}><Link href={fact.href}>{fact.link}</Link>{fact.rest}</li>)}
      </ul>
    </section>
  );
}

export function Landing() {
  const native = LANDING.map((file) => MEDIA.find((item) => item.file === file)!);
  return (
    <>
      <a className="skip" href="#wall">Skip to the components</a>
      <Header />
      <div className="hero">
        <h1>React Native UI library for iOS, Android and web</h1>
        <p className="hero-lede">{COMPONENTS.length} components you copy into your app and own, with one API and one theme on all three.</p>
        <div className="hero-row">
          <div className="hero-actions">
            <Link className="cta" href="/docs/getting-started">Get started</Link>
            <a className="cta quiet" href={REPO} rel="noopener"><Feather name="github" />GitHub</a>
          </div>
          <p className="hero-note"><a href="#install"><code>npm install ferrule</code></a>, then copy in what you need.</p>
        </div>
      </div>
      <main>
        <Wall />
        <nav className="index" aria-label={`All ${COMPONENTS.length} components`}>
          <h2>All {COMPONENTS.length} components</h2>
          <ul>{COMPONENTS.map((item) => <li key={item.slug}><Link href={`/docs/${item.slug}`}>{item.title}</Link></li>)}</ul>
        </nav>
        <Install />
        <section className="native">
          <div className="section-head">
            <h2>Real native views, when you want them</h2>
            <p>A browser cannot draw Liquid Glass or Material 3, so these are recordings and screenshots of the running app. The optional <code>ferrule-native</code> package has 20 views. <Link href="/docs/coverage">The coverage table</Link> says what was run on each platform, and what was not built.</p>
          </div>
          <Masonry bricks={native.map((item) => ({ key: item.file, node: <MediaFigure item={item} /> }))} />
        </section>
        <section className="status">
          <div className="section-head">
            <h2>What has actually been run</h2>
            <p>Simulators, emulators and one Android phone, a Pixel 8a. No physical iPhone yet, and nothing under live VoiceOver or TalkBack.</p>
          </div>
          <div className="table" tabIndex={0} role="region" aria-label="Platform status">
            <table>
              <thead><tr><th scope="col">Platform</th><th scope="col">Status</th><th scope="col">Detail</th></tr></thead>
              <tbody>{PLATFORMS.map(([name, status, detail]) => <tr key={name}><th scope="row">{name}</th><td><Text variant="bodySmall" tone="success">{status}</Text></td><td>{detail}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      </main>
      <footer className="close">
        <div className="close-call">
          <h2>Start with two components</h2>
          <div className="hero-actions">
            <Link className="cta" href="/docs/getting-started">Get started</Link>
            <a className="cta quiet" href="#install">Install from npm</a>
          </div>
        </div>
        <div className="foot">
          <span className="wordmark">Ferrule</span>
          <span>MIT licensed. Version {version}.</span>
          <nav aria-label="Footer">
            <Link href="/docs/getting-started">Docs</Link>
            <Link href="/docs/contributing">Contributing</Link>
            <a href={REPO} rel="noopener">GitHub</a>
            <a href={`${REPO}/blob/main/LICENSE`} rel="noopener">License</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
