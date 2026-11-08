import { createContext, useContext } from 'react';
import type { Palette, PaletteName } from '@leoanimesh/ferrule';

export type PaletteChoice = PaletteName | 'custom';
export const TEXT_SCALES = [1, 1.5, 2] as const;

export interface Settings {
  mode: 'light' | 'dark';
  palette: PaletteChoice;
  rtl: boolean;
  native: boolean;
  textScale: number;
}

export interface Harness extends Settings {
  /** The current palette's colors, for a nested provider. */
  paletteColors: Palette;
  set: (next: Partial<Settings>) => void;
  /** The last event from a native control, shown on its screen so tests can read it. */
  log: string;
  setLog: (text: string) => void;
  /** From a deep link: show only this native section. */
  only: string | null;
}

export const HarnessContext = createContext<Harness | null>(null);
export const useHarness = () => useContext(HarnessContext)!;
