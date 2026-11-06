import { useState } from 'react';
import { useTheme, View } from 'ferrule';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Chip } from '../components/ui/chip';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Segmented } from '../components/ui/segmented';
import { Stepper } from '../components/ui/stepper';
import { Switch } from '../components/ui/switch';
import { Text } from '../components/ui/text';
import { Code, Feather, Header, InkPicker } from './chrome';
import { LANDING, MEDIA, REPO } from './captures';
import { MediaFigure } from './Media';
import { usePrint } from './print';
import { Showcase } from './Showcase';
import { asset, Link } from './router';

/** Real Ferrule components, reprinted by the same ink as the page around them. */
function PressSheet() {
  const { tokens } = useTheme();
  const [plan, setPlan] = useState('team');
  const [seats, setSeats] = useState(4);
  return (
    <Card style={{ width: '100%' }}>
      <CardHeader title="Workspace" description="A settings form, drawn by the library" end={<Badge tone="primary">Live</Badge>} />
      <CardContent>
        <View style={{ gap: tokens.space[4] }}>
          <Input label="Name" defaultValue="North Press" />
          <Segmented label="Plan" options={[{ value: 'solo', label: 'Solo' }, { value: 'team', label: 'Team' }, { value: 'org', label: 'Org' }]} value={plan} onValueChange={setPlan} />
          <Stepper label="Seats" value={seats} onValueChange={setSeats} min={1} max={12} />
          <Progress value={seats / 12} label="Seats used" />
          <Switch label="Weekly digest" defaultChecked />
          <Checkbox label="Require two-step sign-in" />
          <Button fullWidth>Save changes</Button>
        </View>
      </CardContent>
    </Card>
  );
}

const COMPONENT_COUNT = 23;

const WALL: { id: string; name: string; note: string }[] = [
  { id: 'button', name: 'Button', note: 'Five variants, three sizes, a loading state that blocks presses.' },
  { id: 'input', name: 'Input', note: 'Label, helper, error, adornments.' },
  { id: 'modal', name: 'Modal', note: 'Traps focus and restores it, on keyboard and screen reader.' },
  { id: 'sheet', name: 'Sheet', note: 'Drag the handle to close. Stays above the keyboard.' },
  { id: 'toast', name: 'Toast', note: 'Sits above modals, pauses on hover, gets announced.' },
  { id: 'swipe-row', name: 'SwipeRow', note: 'Swipe actions that screen readers can reach too.' },
  { id: 'tabbar', name: 'TabBar', note: 'Bottom navigation, or the platform bar with one prop.' },
  { id: 'carousel', name: 'Carousel', note: 'Settles on item edges. No dots, no autoplay.' },
  { id: 'progress', name: 'Progress', note: 'A bar and a ring, with no SVG dependency.' },
  { id: 'list', name: 'List', note: 'FlatList with empty and loading states.' },
  { id: 'chip', name: 'Chip', note: 'A checkbox when selected, a button when not.' },
  { id: 'stepper', name: 'Stepper', note: 'One adjustable control for screen readers.' },
];

const PLATFORMS: [string, string, string][] = [
  ['iOS', 'Verified', 'Components and native views, on the iOS 26.5 simulator with scripted taps. iOS 17 to 25 is compiled and not run.'],
  ['Android', 'Verified', 'Components and native views, on an API 37 emulator with scripted taps.'],
  ['Web', 'Verified', 'Components, in Chrome. This page is running them. Native views fall back to the Ferrule component.'],
];

const QUICK_START = `npm install react-native-reanimated react-native-worklets
npm install https://github.com/leoAnimesh/ferrule/<wbr>releases/download/v0.1.0/ferrule-0.1.0.tgz
npx ferrule init --fix
npx ferrule add button input`;

const CAPTURE_ALT = 'The same screen of buttons, badges, a card and form fields';

/** A real capture of the harness's composite screen, in the palette and mode the visitor has chosen. */
function CapturePanel({ os, title, detail }: { os: 'ios' | 'android'; title: string; detail: string }) {
  const { palette, mode } = usePrint();
  return (
    <figure className="panel">
      <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
      <div className="panel-body"><img src={asset(`/media/showcase/${os}-${palette}-${mode}.jpg`)} alt={`${CAPTURE_ALT}, on ${title}.`} width={380} height={700} /></div>
    </figure>
  );
}

export function Landing() {
  const { palette } = usePrint();
  const featured = LANDING.map((file) => MEDIA.find((item) => item.file === file)!);
  return (
    <>
      <a className="skip" href="#why">Skip to content</a>
      <Header />
      <div className="hero">
        <div className="hero-top">
          <div className="hero-copy">
            <ul className="marks" aria-label="Platforms">
              <li><Feather name="smartphone" />iOS</li>
              <li><Feather name="smartphone" />Android</li>
              <li><Feather name="globe" />Web</li>
            </ul>
            <h1>React Native UI components for iOS, Android and web</h1>
            <p>{COMPONENT_COUNT} components you copy into your app and own. One API and one theme on all three, with real SwiftUI and Compose views when you ask for them.</p>
          </div>
          <div className="hero-start">
            <div className="hero-actions">
              <Link className="cta" href="/docs/getting-started">Get started</Link>
              <a className="cta quiet" href={REPO} rel="noopener"><Feather name="github" />GitHub</a>
            </div>
            <p className="hero-note"><strong>Not on npm yet.</strong> Install from the GitHub release. <Link href="/docs/getting-started">Expo and bare steps</Link>.</p>
            <Code html={`<pre class="shiki"><code>${QUICK_START}</code></pre>`} label="Quick start commands" />
          </div>
        </div>
        <div className="panels">
          <CapturePanel os="ios" title="iOS" detail="iOS 26.5 simulator" />
          <CapturePanel os="android" title="Android" detail="API 37 emulator" />
          <section className="panel" aria-label="Web, running live">
            <div className="figcaption"><strong>Web</strong><span>Live on this page</span></div>
            <div className="panel-body live" tabIndex={0} role="region" aria-label="Live preview, scrollable"><Showcase /></div>
          </section>
        </div>
        <nav className="strip" aria-label="Components">
          <span>{COMPONENT_COUNT} components</span>
          {WALL.slice(0, 8).map((item) => <Link key={item.id} href={`/docs/${item.id}`}>{item.name}</Link>)}
          <Link href="/docs/text">All of them</Link>
        </nav>
      </div>
      <main>
        <section id="why" className="why">
          <h2>Why it exists</h2>
          <div className="why-text">
            <p>Most React Native libraries are a dependency you style around. Change its look and you are fighting its internals, and each platform drifts its own way.</p>
            <p>Ferrule copies the source into your project, so it is yours to edit. The small package underneath holds the theme and the primitives that keep platforms alike: a button is the same height on iOS, Android and web, checked by script, to within a point.</p>
            <p>When you want the platform's own control, say so. <code>native</code> swaps in a real SwiftUI or Compose view, and falls back to the Ferrule one anywhere that view cannot draw.</p>
          </div>
        </section>
        <section className="reprint">
          <div className="reprint-copy">
            <h2>Change one word. The whole product reprints.</h2>
            <p>Every color comes from one ink, and every ink passes AA in light and dark. Try one: the form and the screens above follow it.</p>
            <div className="hero-control">
              <code>createTheme({'{'} palette: <span className="palette-word">'{palette}'</span> {'}'})</code>
              <InkPicker className="big" />
            </div>
          </div>
          <div className="press"><PressSheet /></div>
        </section>
        <section className="wall">
          <h2>{COMPONENT_COUNT} components</h2>
          <ul className="wall-list">
            {WALL.map((item) => <li key={item.id}><Link href={`/docs/${item.id}`}><strong>{item.name}</strong><span>{item.note}</span></Link></li>)}
          </ul>
          <p><Link href="/docs/text">Browse them all</Link>, each with a live preview, its props and its accessibility notes.</p>
        </section>
        <section className="native">
          <h2>Real native views, when you want them</h2>
          <p>A browser cannot draw Liquid Glass or Material 3, so these are recordings and screenshots of the running app. The optional <code>ferrule-native</code> package has 19 views. <Link href="/docs/coverage">The coverage table</Link> says what was run on each platform, and what was not built.</p>
          {featured.length ? <div className="captures">{featured.map((item) => <MediaFigure key={item.file} item={item} />)}</div> : null}
        </section>
        <section className="status">
          <h2>What has actually been run</h2>
          <div className="table" tabIndex={0} role="region" aria-label="Platform status">
            <table>
              <thead><tr><th scope="col">Platform</th><th scope="col">Status</th><th scope="col">Detail</th></tr></thead>
              <tbody>{PLATFORMS.map(([name, status, detail]) => <tr key={name}><th scope="row">{name}</th><td><Text variant="bodySmall" tone={status === 'Verified' ? 'success' : 'muted'}>{status}</Text></td><td>{detail}</td></tr>)}</tbody>
            </table>
          </div>
          <p>Simulators and emulators only so far. Nothing has run on a physical device, or under live VoiceOver or TalkBack.</p>
        </section>
      </main>
      <footer className="foot">
        <span className="wordmark">Ferrule</span>
        <span>MIT licensed. Version 0.1.0.</span>
        <nav aria-label="Footer">
          <Link href="/docs/getting-started">Docs</Link>
          <Link href="/docs/contributing">Contributing</Link>
          <a href={REPO} rel="noopener">GitHub</a>
          <a href={`${REPO}/blob/main/LICENSE`} rel="noopener">License</a>
        </nav>
      </footer>
    </>
  );
}
