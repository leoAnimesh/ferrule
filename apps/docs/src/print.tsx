import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { FerruleProvider, useTheme, type PaletteName } from '@leoanimesh/ferrule';
import { ToastProvider } from '../components/ui/toast';

type Mode = 'light' | 'dark';
interface Print { palette: PaletteName; mode: Mode; setPalette: (next: PaletteName) => void; setMode: (next: Mode) => void; }
const PrintContext = createContext<Print | null>(null);
export const usePrint = () => useContext(PrintContext)!;

function stored<T extends string>(key: string, fallback: T): T {
  try { return (window.localStorage.getItem(key) as T | null) ?? fallback; } catch { return fallback; }
}
function store(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* A private window loses the choice on reload, nothing more. */ }
}

/** The press run: the new print wipes over the old. A plain swap under reduced motion. */
function reprint(change: () => void) {
  const doc = document as Document & { startViewTransition?: (update: () => void) => unknown };
  if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return change();
  doc.startViewTransition(() => flushSync(change));
}

/** Prints the theme onto the page's own chrome, so everything outside the previews uses the same ink. */
function Ink() {
  const { colors } = useTheme();
  const { mode } = usePrint();
  useLayoutEffect(() => {
    const root = document.documentElement.style;
    const set = { paper: colors.background, surface: colors.surface, muted: colors.surfaceMuted, text: colors.text, 'text-muted': colors.textMuted, line: colors.border, edge: colors.controlBorder, ink: colors.primary, 'on-ink': colors.onPrimary, soft: colors.primarySoft, 'on-soft': colors.onPrimarySoft, focus: colors.focusRing, warn: colors.warning, 'warn-soft': colors.warningSoft, 'on-warn-soft': colors.onWarningSoft };
    for (const [name, value] of Object.entries(set)) root.setProperty(`--${name}`, value);
    root.colorScheme = mode;
  }, [colors, mode]);
  return null;
}

export function Press({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteName>(() => stored('ferrule-palette', 'verdigris'));
  const [mode, setModeState] = useState<Mode>(() => stored<Mode>('ferrule-mode', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const value = useMemo<Print>(() => ({
    palette,
    mode,
    setPalette: (next) => { store('ferrule-palette', next); reprint(() => setPaletteState(next)); },
    setMode: (next) => { store('ferrule-mode', next); reprint(() => setModeState(next)); },
  }), [palette, mode]);
  useEffect(() => { document.documentElement.dataset.ready = 'true'; }, []);
  return (
    <PrintContext.Provider value={value}>
      <FerruleProvider palette={palette} colorMode={mode}>
        <ToastProvider>
          <Ink />
          {children}
        </ToastProvider>
      </FerruleProvider>
    </PrintContext.Provider>
  );
}
