import { useEffect, useRef, useState, type ComponentType, Component as ReactComponent, type ReactNode } from 'react';
import { COMPONENTS, type ComponentDoc } from './components';
import { Code, Header, InkPicker } from './chrome';
import { MEDIA } from './captures';
import { IconBrowser } from './IconBrowser';
import { MediaFigure } from './Media';
import { FLAT, NAV } from './nav';
import { Link, usePath } from './router';
import pages from './generated/pages.json';
import props from './generated/props.json';
import samples from './generated/samples.json';

type Sample = { code: string; html: string };
const SAMPLES = samples as Record<string, Sample>;
type Group = { name: string; extends: string[]; members: { name: string; optional: boolean; type: string; doc: string; default?: string }[] };
const PROPS = props as Record<string, Group[]>;

/** Inline `code` in a hand-written sentence. */
function Prose({ text }: { text: string }) {
  return <>{text.split(/(`[^`]+`)/).map((part, i) => (part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part))}</>;
}

class PreviewBoundary extends ReactComponent<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="failed">This preview failed to render. The code below is still correct, so please report the preview.</p> : this.props.children; }
}

function Specimen({ sample, title, Component }: { sample: string; title?: string; Component: ComponentType }) {
  const code = SAMPLES[sample]!;
  return (
    <figure className="specimen">
      {title ? <figcaption>{title}</figcaption> : null}
      <div className="stage"><PreviewBoundary><Component /></PreviewBoundary></div>
      <Code html={code.html} label={`Code for ${title ?? sample}`} />
    </figure>
  );
}

function PropsTables({ doc }: { doc: ComponentDoc }) {
  const groups = PROPS[doc.slug] ?? [];
  return (
    <>
      <h2 id="props">Props</h2>
      {groups.filter((group) => group.members.length).map((group) => (
        <section key={group.name}>
          {groups.length > 1 ? <h3>{group.name}</h3> : null}
          <div className="table" tabIndex={0} role="region" aria-label={`${group.name} props`}>
            <table>
              <thead><tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">Description</th></tr></thead>
              <tbody>
                {group.members.map((member) => (
                  <tr key={member.name}>
                    <td><code>{member.name}</code>{member.optional ? null : <span className="required"> required</span>}</td>
                    <td><code className="type">{member.type}</code></td>
                    <td>{member.default ? <code>{member.default}</code> : null}</td>
                    <td><Prose text={member.doc || doc.notes?.[member.name] || ''} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {group.extends.length ? <p className="inherits">Also takes the props of <code>{group.extends.join(', ')}</code>.</p> : null}
        </section>
      ))}
    </>
  );
}

function ComponentArticle({ doc }: { doc: ComponentDoc }) {
  const media = MEDIA.filter((item) => item.on.includes(doc.slug));
  return (
    <>
      <div className="specimens">{doc.examples.map((example) => <Specimen key={example.sample} {...example} />)}</div>
      {doc.callout ? <p className="note"><Prose text={doc.callout} /></p> : null}
      <h2 id="add">Add it</h2>
      <Code html={`<pre class="shiki"><code>npx ferrule add ${doc.slug}</code></pre>`} />
      <p>The source lands in <code>components/ui/{doc.slug}.tsx</code>, with what it depends on. It is yours to edit.</p>
      <PropsTables doc={doc} />
      {doc.slots ? <p>Theme slots: {doc.slots.map((slot, i) => <span key={slot}>{i ? ', ' : ''}<code>{slot}</code></span>)}. Set them in <code>theme.components.{doc.slug}</code>.</p> : null}
      <h2 id="accessibility">Accessibility</h2>
      <ul>{doc.a11y.map((line) => <li key={line}><Prose text={line} /></li>)}</ul>
      {doc.native || media.length ? (
        <>
          <h2 id="native">Native variant</h2>
          {doc.native ? <p><Prose text={doc.native} /></p> : null}
          <p>The web cannot draw these, so the preview above shows the Ferrule component. {media.length ? 'These are captures from a running app.' : 'See the native variants page for captures.'} <Link href="/docs/native">Native variants</Link>.</p>
          {media.length ? <div className="captures">{media.map((item) => <MediaFigure key={item.file} item={item} />)}</div> : null}
        </>
      ) : null}
    </>
  );
}

function Article({ id }: { id: string }) {
  const page = (pages as Record<string, { title: string; blurb: string; html: string }>)[id];
  const doc = COMPONENTS.find((c) => c.slug === id);
  const heading = useRef<HTMLHeadingElement>(null);
  const title = page?.title ?? doc?.title ?? 'Page not found';
  useEffect(() => {
    document.title = `${title} · Ferrule`;
    if (!window.location.hash) heading.current?.focus({ preventScroll: true });
  }, [title]);
  const index = FLAT.findIndex((item) => item.id === id);
  const previous = FLAT[index - 1];
  const next = FLAT[index + 1];
  const nativeGallery = id === 'native' ? MEDIA : [];
  return (
    <article className="article">
      <h1 ref={heading} tabIndex={-1}>{title}</h1>
      <p className="lede">{page?.blurb ?? doc?.blurb ?? 'There is no page at this address.'}</p>
      {page ? <div className="prose" dangerouslySetInnerHTML={{ __html: page.html }} /> : null}
      {id === 'icons' ? <IconBrowser /> : null}
      {nativeGallery.length ? (
        <section className="prose">
          <h2 id="captures">Captures</h2>
          <p>Every view, from the catalog app on a simulator and an emulator. The Android FAB is left out: its shadow is clipped at the view's edge.</p>
          <div className="captures dense">{nativeGallery.map((item) => <MediaFigure key={item.file} item={item} />)}</div>
        </section>
      ) : null}
      {doc ? <div className="prose"><ComponentArticle doc={doc} /></div> : null}
      {!page && !doc ? <p><Link href="/docs/getting-started">Go to Getting started</Link>, or search above.</p> : null}
      {index >= 0 ? (
        <nav className="pager" aria-label="Next and previous">
          {previous ? <Link href={`/docs/${previous.id}`}><span>Previous</span>{previous.title}</Link> : <i />}
          {next ? <Link href={`/docs/${next.id}`} className="next"><span>Next</span>{next.title}</Link> : <i />}
        </nav>
      ) : null}
    </article>
  );
}

export function DocsPage() {
  const path = usePath();
  const id = path.replace('/docs/', '').replace('/docs', 'getting-started');
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open]);
  return (
    <>
      <a className="skip" href="#content" onClick={(event) => { event.preventDefault(); document.querySelector<HTMLElement>('.article h1')?.focus(); }}>Skip to content</a>
      <Header onMenu={() => setOpen(!open)} menuOpen={open} />
      <div className="docs">
        <nav className={`side ${open ? 'open' : ''}`} aria-label="Documentation">
          <InkPicker className="side-inks" />
          {NAV.map((group) => (
            <section key={group.title}>
              <h2>{group.title}</h2>
              <ul>{group.items.map((item) => <li key={item.id}><Link href={`/docs/${item.id}`} aria-current={item.id === id ? 'page' : undefined}>{item.title}</Link></li>)}</ul>
            </section>
          ))}
        </nav>
        <main id="content"><Article key={id} id={id} /></main>
      </div>
    </>
  );
}
