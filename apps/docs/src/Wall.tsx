import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useWindowDimensions } from '@leoanimesh/ferrule';
import { InkPicker } from './chrome';
import { COMPONENTS } from './components';
import { PreviewBoundary } from './DocsPage';
import { columnCount, distribute } from './masonry';
import { usePrint } from './print';
import { Link } from './router';
import { Showcase } from './Showcase';

/** `stretch`: this brick can grow to close its column, which a capture cannot without cropping. */
export interface Brick { key: string; node: ReactNode; stretch?: boolean; }

/** Matches the CSS gap between bricks, so a column of many small pins counts its gaps too. */
const GAP = 28;

/** Shortest-column masonry, measured before paint so nothing shifts, and not reflowed when a live component changes height. */
export function Masonry({ bricks }: { bricks: Brick[] }) {
  const { width } = useWindowDimensions();
  const columns = columnCount(width);
  const root = useRef<HTMLDivElement>(null);
  // shortcut: heights are kept per column count, so resizing within a count can leave columns less even until the next count.
  const [heights, setHeights] = useState<Record<string, number>>({});
  const id = (key: string) => `${columns}:${key}`;
  const settled = bricks.every((brick) => heights[id(brick.key)]);
  useLayoutEffect(() => {
    if (settled) return;
    const measured = { ...heights };
    root.current?.querySelectorAll<HTMLElement>('[data-brick]').forEach((cell) => { measured[id(cell.dataset.brick!)] = cell.offsetHeight + GAP; });
    setHeights(measured);
  });
  const placed = distribute(bricks.map((brick) => heights[id(brick.key)] ?? 1), columns).map((column) => {
    const last = column.findLastIndex((at) => bricks[at]!.stretch);
    return last < 1 ? column : [...column.slice(0, last), ...column.slice(last + 1), column[last]!];
  });
  return (
    <div ref={root} className={settled ? 'masonry settled' : 'masonry'}>
      {placed.map((column, index) => (
        <div className="column" key={index}>
          {column.map((at) => <div className="brick" data-brick={bricks[at]!.key} key={bricks[at]!.key}>{bricks[at]!.node}</div>)}
        </div>
      ))}
    </div>
  );
}

function Pin({ title, meta, href, children }: { title: string; meta: string; href: string; children: ReactNode }) {
  return (
    <figure className="pin live">
      <div className="pin-body">{children}</div>
      <figcaption><Link href={href}>{title}</Link><span>{meta}</span></figcaption>
    </figure>
  );
}

const LIVE = 'Live on this page';

function LivePin({ slug }: { slug: string }) {
  const doc = COMPONENTS.find((item) => item.slug === slug)!;
  const Example = doc.examples[0]!.Component;
  return <Pin title={doc.title} meta={LIVE} href={`/docs/${slug}`}><PreviewBoundary><Example /></PreviewBoundary></Pin>;
}

function PalettePin() {
  const { palette } = usePrint();
  return (
    <Pin title="Palettes" meta={LIVE} href="/docs/palettes">
      <div className="palette-pin">
        <p>Seven palettes, each AA in light and dark. Pick one and this page reprints.</p>
        <InkPicker />
        <code>createTheme({'{'} palette: '{palette}' {'}'})</code>
      </div>
    </Pin>
  );
}

/** Scaled so the screen lays out at the 440pt width of the harness's demo screen, wrapping where it wraps. */
function ScreenLive() {
  const frame = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  // Written straight to the DOM, because the masonry measures in this same layout pass.
  useLayoutEffect(() => {
    const fit = () => { screen.current!.style.zoom = String(frame.current!.clientWidth / 440); };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame.current!);
    return () => observer.disconnect();
  }, []);
  return <div ref={frame}><div ref={screen} className="screen-live"><Showcase /></div></div>;
}

const live = (slug: string) => ({ key: slug, stretch: true, node: <LivePin slug={slug} /> });

const SCREEN = <Pin title="Sample screen" meta={LIVE} href="/docs/platforms"><ScreenLive /></Pin>;

const PINS = [
  { key: 'screen', stretch: false, node: SCREEN },
  { key: 'palette', stretch: false, node: <PalettePin /> },
  live('input'),
  live('segmented'),
  live('stepper'),
  live('button'),
  live('switch'),
  live('modal'),
  live('progress'),
  live('chip'),
  live('list'),
  live('sheet'),
  live('badge'),
  live('swipe-row'),
  live('toast'),
  live('tabbar'),
  live('checkbox'),
  live('carousel'),
  live('avatar'),
  live('card'),
];

export const Wall = () => (
  <section id="wall" className="wall" aria-label="Components">
    <Masonry bricks={PINS} />
  </section>
);
