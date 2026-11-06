import { useState } from 'react';
import { FEATHER, FEATHER_NAMES } from 'ferrule/lib/feather';

/** Plain SVG rather than `Icon`, because 287 tinted images on one page is needlessly heavy. Both draw the same paths. */
export function IconBrowser() {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState('');
  const found = FEATHER_NAMES.filter((name) => name.includes(query.trim().toLowerCase()));
  const copy = (name: string) => {
    void navigator.clipboard?.writeText(`<Icon name="${name}" />`);
    setCopied(name);
  };
  return (
    <section aria-label="Icon browser">
      <input className="icons-search" type="search" aria-label="Filter icons" placeholder="Filter icons" value={query} onChange={(event) => setQuery(event.target.value)} />
      <p role="status">{copied ? `Copied ${copied}. ` : ''}{found.length} of {FEATHER_NAMES.length} icons.</p>
      <ul className="icon-grid">
        {found.map((name) => (
          <li key={name}>
            <button type="button" aria-label={`Copy ${name}`} onClick={() => copy(name)}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={FEATHER[name]} /></svg>
              {name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
