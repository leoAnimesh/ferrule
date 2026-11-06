import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes } from 'react';

const BASE = (process.env.EXPO_BASE_URL ?? '').replace(/\/$/, '');
export const asset = (path: string) => `${BASE}${path}`;

const current = () => {
  const path = window.location.pathname.slice(BASE.length).replace(/\/$/, '');
  return path || '/';
};

const Path = createContext('/');
export const usePath = () => useContext(Path);

export function navigate(to: string) {
  window.history.pushState(null, '', to.startsWith(BASE) ? to : `${BASE}${to}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function Router({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(current);
  useEffect(() => {
    const update = () => {
      setPath(current());
      const hash = window.location.hash.slice(1);
      requestAnimationFrame(() => {
        const target = hash ? document.getElementById(hash) : null;
        if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);
      });
    };
    // Markdown pages are plain HTML, so all in-site links are handled here rather than one by one.
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest?.('a');
      const href = link?.getAttribute('href');
      if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href) || link?.target) return;
      event.preventDefault();
      navigate(href);
    };
    window.addEventListener('popstate', update);
    document.addEventListener('click', click);
    if (window.location.hash) update();
    return () => { window.removeEventListener('popstate', update); document.removeEventListener('click', click); };
  }, []);
  return <Path.Provider value={path}>{children}</Path.Provider>;
}

export function Link({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={/^https?:|^#/.test(href) ? href : asset(href)} {...rest} />;
}
