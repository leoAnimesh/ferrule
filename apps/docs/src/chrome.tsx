import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PALETTE_NAMES, palettes, type PaletteName } from 'ferrule';
import { FEATHER, type FeatherName } from 'ferrule/lib/feather';
import { REPO } from './captures';
import { FLAT } from './nav';
import { usePrint } from './print';
import { Link, navigate } from './router';
import pages from './generated/pages.json';
import props from './generated/props.json';

export const Feather = ({ name }: { name: FeatherName }) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={FEATHER[name]} /></svg>;
const Sun = () => <Feather name="sun" />;
const Moon = () => <Feather name="moon" />;
const Magnifier = () => <Feather name="search" />;
export const Menu = () => <Feather name="menu" />;

/** The seven inks. Each swatch is the palette's real primary, in the current mode. */
export function InkPicker() {
  const { palette, mode, setPalette } = usePrint();
  return (
    <div role="radiogroup" aria-label="Palette" className="inks">
      {PALETTE_NAMES.map((name: PaletteName) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={palette === name}
          aria-label={name}
          title={name}
          className="swatch"
          style={{ background: palettes[name][mode].primary }}
          onClick={() => setPalette(name)}
          onKeyDown={(event) => {
            const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
            if (!step) return;
            event.preventDefault();
            const next = PALETTE_NAMES[(PALETTE_NAMES.indexOf(name) + step + PALETTE_NAMES.length) % PALETTE_NAMES.length]!;
            setPalette(next);
            (event.currentTarget.parentElement?.querySelector(`[aria-label="${next}"]`) as HTMLElement | null)?.focus();
          }}
          tabIndex={palette === name ? 0 : -1}
        />
      ))}
    </div>
  );
}

export function ModeToggle() {
  const { mode, setMode } = usePrint();
  const next = mode === 'dark' ? 'light' : 'dark';
  return <button type="button" className="icon-button" aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} onClick={() => setMode(next)}>{mode === 'dark' ? <Sun /> : <Moon />}</button>;
}

interface Hit { id: string; title: string; blurb: string; anchor?: string; }

const INDEX: (Hit & { words: string })[] = FLAT.flatMap((item) => {
  const page = (pages as Record<string, { headings: { id: string; text: string }[] }>)[item.id];
  const groups = (props as Record<string, { members: { name: string }[] }[]>)[item.id];
  const words = [item.title, item.blurb, ...(groups?.flatMap((g) => g.members.map((m) => m.name)) ?? [])].join(' ').toLowerCase();
  return [
    { ...item, words },
    ...(page?.headings ?? []).map((h) => ({ id: item.id, title: h.text, blurb: item.title, anchor: h.id, words: `${h.text} ${item.title}`.toLowerCase() })),
  ];
});

export function Search() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return INDEX.filter((hit) => terms.every((term) => hit.words.includes(term)))
      .sort((a, b) => Number(b.title.toLowerCase().startsWith(terms[0]!)) - Number(a.title.toLowerCase().startsWith(terms[0]!)))
      .slice(0, 8);
  }, [query]);
  const go = useCallback((hit: Hit) => {
    navigate(`/docs/${hit.id}${hit.anchor ? `#${hit.anchor}` : ''}`);
    setQuery('');
    setOpen(false);
    input.current?.blur();
  }, []);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key !== '/' || /input|textarea/i.test((event.target as Element).tagName)) return;
      event.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);
  const showing = open && query.trim().length > 0;
  return (
    <div className="search" role="search">
      <Magnifier />
      <input
        ref={input}
        type="search"
        placeholder="Search"
        aria-label="Search the docs. Press slash to focus."
        role="combobox"
        aria-expanded={showing}
        aria-controls="search-results"
        aria-activedescendant={showing && hits[active] ? `hit-${active}` : undefined}
        aria-autocomplete="list"
        value={query}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(event) => { setQuery(event.target.value); setActive(0); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') { event.preventDefault(); setActive(Math.min(active + 1, hits.length - 1)); }
          if (event.key === 'ArrowUp') { event.preventDefault(); setActive(Math.max(active - 1, 0)); }
          if (event.key === 'Enter' && hits[active]) go(hits[active]!);
          if (event.key === 'Escape') { setQuery(''); setOpen(false); }
        }}
      />
      {showing ? (
        <ul id="search-results" role="listbox" aria-label="Results" className="results">
          {hits.map((hit, index) => (
            <li key={`${hit.id}-${hit.anchor ?? ''}`} id={`hit-${index}`} role="option" aria-selected={index === active} className={index === active ? 'on' : ''} onMouseDown={() => go(hit)}>
              <strong>{hit.title}</strong><span>{hit.blurb}</span>
            </li>
          ))}
          {hits.length ? null : <li className="none" role="presentation">Nothing matches that. Try a component name or a prop.</li>}
        </ul>
      ) : null}
    </div>
  );
}

export function Header({ onMenu, menuOpen }: { onMenu?: () => void; menuOpen?: boolean }) {
  return (
    <header className="bar">
      {onMenu ? <button type="button" className="icon-button menu" aria-label="Navigation" aria-expanded={menuOpen} onClick={onMenu}><Menu /></button> : null}
      <Link href="/" className="wordmark">Ferrule</Link>
      <nav aria-label="Main" className="bar-links">
        <Link href="/docs/getting-started">Docs</Link>
        <Link href="/docs/button">Components</Link>
        <a href={REPO} rel="noopener">GitHub</a>
      </nav>
      <div className="bar-tools">
        <Search />
        <ModeToggle />
      </div>
    </header>
  );
}

export function Code({ html, code, label }: { html: string; code?: string; label?: string }) {
  return (
    <div className="code" {...(label ? { role: 'region', 'aria-label': label } : {})}>
      <button type="button" className="copy" data-copy>Copy</button>
      {/* Our own build step's output, from files in this repo. */}
      <div dangerouslySetInnerHTML={{ __html: html.replace('<pre ', '<pre tabindex="0" ') }} data-code={code} />
    </div>
  );
}

/** Every copy button on the site, including those in rendered markdown. */
export function useCopyButtons() {
  useEffect(() => {
    const click = async (event: MouseEvent) => {
      const button = (event.target as Element).closest?.('[data-copy]') as HTMLButtonElement | null;
      if (!button) return;
      const text = button.parentElement?.querySelector('pre')?.textContent ?? '';
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Press Ctrl+C';
        const range = document.createRange();
        range.selectNodeContents(button.parentElement!.querySelector('pre')!);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
      setTimeout(() => { button.textContent = 'Copy'; }, 1600);
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);
}
