import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

/** Pure token definitions. No React Native runtime imports, so it is testable and tree-shakeable. */
export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  /** Decorative separators and card edges. */
  border: string;
  /** Interactive control edges. Must reach 3:1 against surface (WCAG 1.4.11). */
  controlBorder: string;
  /** The palette's ink: solid fills, and text or marks on any surface. */
  primary: string;
  onPrimary: string;
  /** A tint of the ink, for soft buttons and selected rows. */
  primarySoft: string;
  onPrimarySoft: string;
  danger: string;
  onDanger: string;
  dangerSoft: string;
  onDangerSoft: string;
  success: string;
  onSuccess: string;
  successSoft: string;
  onSuccessSoft: string;
  warning: string;
  onWarning: string;
  warningSoft: string;
  onWarningSoft: string;
  /** Laid over a solid fill when pressed or hovered. It always raises the label's contrast. */
  overprint: string;
  focusRing: string;
  overlay: string;
}

export type FontWeightToken = 'regular' | 'medium' | 'semibold' | 'bold';
export type FontSizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type ControlSize = 'sm' | 'md' | 'lg';
export type RadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type SpaceToken = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
export type ShadowToken = 'sm' | 'md' | 'lg';

export interface ThemeTokens {
  space: Record<SpaceToken, number>;
  radius: Record<RadiusToken, number>;
  fontSize: Record<FontSizeToken, number>;
  lineHeight: Record<FontSizeToken, number>;
  fontWeight: Record<FontWeightToken, TextStyle['fontWeight']>;
  /** Per-weight families. Android cannot synthesize weights for custom fonts, so each weight names its own family. */
  fontFamily: Partial<Record<FontWeightToken, string>>;
  controlHeight: Record<ControlSize, number>;
  /** Minimum interactive area in dp. Smaller visuals extend to this with hitSlop. */
  minTouchTarget: number;
  /** Upper bound for OS font scaling. Layouts use minHeight so they grow instead of clipping. */
  maxFontScale: number;
  shadow: Record<ShadowToken, string>;
  motion: { fast: number; normal: number };
  /** Window widths in dp where layouts may change. See `useResponsive`. */
  breakpoint: { md: number; lg: number };
}

/** A style for one named part of a component, e.g. `button.label`. */
export type SlotStyle = ViewStyle & TextStyle & ImageStyle;
/** Theme-wide overrides, keyed by component then slot: `{ button: { container: { borderRadius: 0 } } }`. */
export type ComponentOverrides = Record<string, Record<string, SlotStyle> | undefined>;

export interface ThemeConfig {
  colors: Record<ColorMode, ThemeColors>;
  tokens: ThemeTokens;
  components: ComponentOverrides;
}

export interface ResolvedTheme {
  mode: ColorMode;
  colors: ThemeColors;
  tokens: ThemeTokens;
  components: ComponentOverrides;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export interface ThemeOverrides {
  /** A built-in palette name, the result of `createPalette`, or a complete hand-built `Palette`. `colors` is applied on top. */
  palette?: PaletteName | Palette;
  colors?: Partial<Record<ColorMode, Partial<ThemeColors>>>;
  tokens?: DeepPartial<ThemeTokens>;
  components?: ComponentOverrides;
}

/** State strengths, shared by the components and by `auditPalette`, so the audit tests what is drawn. */
export const HOVER_OVERPRINT = 0.1;
export const PRESSED_OVERPRINT = 0.2;
export const HOVER_TINT = 0.08;
export const PRESSED_TINT = 0.16;
export const DISABLED_OPACITY = 0.45;

const DEFAULT_PALETTE: PaletteName = 'verdigris';

const defaultTokens: ThemeTokens = {
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 },
  radius: { none: 0, sm: 3, md: 6, lg: 10, full: 9999 },
  fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, '2xl': 28, '3xl': 36, '4xl': 56 },
  lineHeight: { xs: 16, sm: 20, md: 24, lg: 24, xl: 28, '2xl': 34, '3xl': 42, '4xl': 64 },
  fontWeight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  fontFamily: {},
  controlHeight: { sm: 36, md: 44, lg: 52 },
  minTouchTarget: 44,
  maxFontScale: 2,
  shadow: {
    sm: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0px 4px 14px rgba(0, 0, 0, 0.12)',
    lg: '0px 14px 36px rgba(0, 0, 0, 0.22)',
  },
  motion: { fast: 120, normal: 240 },
  breakpoint: { md: 768, lg: 1100 },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override === undefined ? base : override) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) out[key] = deepMerge(out[key], value);
  return out as T;
}

/** Builds a theme from the defaults plus your overrides. Unset tokens keep their default. */
export function createTheme(overrides: ThemeOverrides = {}): ThemeConfig {
  const base = resolvePalette(overrides.palette ?? DEFAULT_PALETTE);
  return {
    colors: {
      light: { ...base.light, ...overrides.colors?.light },
      dark: { ...base.dark, ...overrides.colors?.dark },
    },
    tokens: deepMerge(defaultTokens, overrides.tokens),
    components: overrides.components ?? {},
  };
}

function assertHex(color: unknown, where: string): void {
  if (typeof color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(color)) throw new Error(`Ferrule: ${where} must be a #RRGGBB color, got ${JSON.stringify(color)}.`);
}

function channel(hex: string, start: number): number {
  const value = parseInt(hex.slice(start, start + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

/** WCAG contrast ratio between two `#RRGGBB` colors. Exported so custom palettes can be asserted in tests. */
export function contrastRatio(a: string, b: string): number {
  assertHex(a, 'contrastRatio');
  assertHex(b, 'contrastRatio');
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

function toRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

/** `amount` of `b` printed over `a`, both `#RRGGBB`. */
function mix(a: string, b: string, amount: number): string {
  const [from, to] = [toRgb(a), toRgb(b)];
  const out = from.map((value, i) => Math.round(value + ((to[i] as number) - value) * amount));
  return `#${out.map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/** Walks a color away from its backgrounds until it reaches `ratio` on all of them. Backgrounds may be derived from the candidate, as a tint of the color itself is. */
function ensureContrast(color: string, backgrounds: string[] | ((candidate: string) => string[]), ratio: number): string {
  const on = typeof backgrounds === 'function' ? backgrounds : () => backgrounds;
  const towards = luminance(on(color)[0] as string) > 0.18 ? '#000000' : '#FFFFFF';
  let out = color;
  for (let step = 1; step <= 50 && on(out).some((bg) => contrastRatio(out, bg) < ratio); step++) {
    out = mix(color, towards, step / 50);
  }
  return out;
}

const TONES = {
  light: { danger: '#B3261E', success: '#2A7A1C', warning: '#8A5A00' },
  dark: { danger: '#FF8A80', success: '#8BD97A', warning: '#E8B84A' },
};

/** Prints one mode from one ink: every neutral is the ink at a low strength over paper. */
function printMode(mode: ColorMode, ink: string): ThemeColors {
  const light = mode === 'light';
  const background = light ? mix('#FFFFFF', ink, 0.06) : mix('#0D0D0D', ink, 0.06);
  const surface = light ? '#FFFFFF' : mix('#181818', ink, 0.06);
  const surfaceMuted = light ? mix('#FFFFFF', ink, 0.11) : mix('#252525', ink, 0.09);
  const border = light ? mix('#FFFFFF', ink, 0.24) : mix('#333333', ink, 0.14);
  const text = light ? mix('#101010', ink, 0.12) : mix('#F6F6F6', ink, 0.05);
  const grounds = [background, surface, surfaceMuted];
  const dark = mix('#0D0D0D', ink, 0.2);
  const soft = (color: string) => (light ? mix('#FFFFFF', color, 0.14) : mix(surface, color, 0.24));
  const tone = (color: string) => {
    const fill = soft(color);
    return {
      main: ensureContrast(color, [...grounds, fill], 4.5),
      on: light ? '#FFFFFF' : mix('#0D0D0D', color, 0.15),
      soft: fill,
      onSoft: ensureContrast(color, [fill], 4.5),
    };
  };
  const danger = tone(TONES[mode].danger);
  const success = tone(TONES[mode].success);
  const warning = tone(TONES[mode].warning);
  const primarySoft = soft(ink);
  // Ghost buttons print the ink over itself when pressed, so it has to hold on that tint too.
  const primary = ensureContrast(ink, (candidate) => [...grounds, primarySoft, mix(background, candidate, HOVER_TINT), mix(background, candidate, PRESSED_TINT)], 4.5);
  return {
    background,
    surface,
    surfaceMuted,
    text,
    textMuted: ensureContrast(mix(text, background, 0.3), grounds, 4.5),
    border,
    controlBorder: ensureContrast(mix(text, background, 0.5), grounds, 3),
    primary,
    onPrimary: contrastRatio('#FFFFFF', primary) >= contrastRatio(dark, primary) ? '#FFFFFF' : dark,
    primarySoft,
    onPrimarySoft: ensureContrast(ink, (candidate) => [primarySoft, mix(primarySoft, candidate, PRESSED_TINT)], 4.5),
    danger: danger.main,
    onDanger: danger.on,
    dangerSoft: danger.soft,
    onDangerSoft: danger.onSoft,
    success: success.main,
    onSuccess: success.on,
    successSoft: success.soft,
    onSuccessSoft: success.onSoft,
    warning: warning.main,
    onWarning: warning.on,
    warningSoft: warning.soft,
    onWarningSoft: warning.onSoft,
    overprint: light ? '#000000' : '#FFFFFF',
    focusRing: ensureContrast(ink, [background, surface], 3),
    overlay: light ? 'rgba(10, 12, 12, 0.5)' : 'rgba(0, 0, 0, 0.65)',
  };
}

export type Palette = Record<ColorMode, ThemeColors>;

/**
 * Builds a full palette from your brand color, one per mode (`#RRGGBB`). The rest is derived, and
 * anything that would miss AA is moved until it passes, so your exact hex may darken or lighten.
 */
export function createPalette(ink: Record<ColorMode, string>): Palette {
  assertHex(ink?.light, 'createPalette light');
  assertHex(ink?.dark, 'createPalette dark');
  return { light: printMode('light', ink.light), dark: printMode('dark', ink.dark) };
}

export const palettes = {
  verdigris: createPalette({ light: '#0A6B5E', dark: '#4FD1B5' }),
  cobalt: createPalette({ light: '#1F4FD1', dark: '#8DB0FF' }),
  madder: createPalette({ light: '#A3123F', dark: '#FF8FAE' }),
  vermilion: createPalette({ light: '#AB370A', dark: '#FF9A6B' }),
  saffron: createPalette({ light: '#875800', dark: '#F2B632' }),
  plum: createPalette({ light: '#6D28A8', dark: '#C9A2FF' }),
  graphite: createPalette({ light: '#2B2F33', dark: '#E6E8EA' }),
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof palettes;
export const PALETTE_NAMES = Object.keys(palettes) as PaletteName[];

export function resolvePalette(palette: PaletteName | Palette): Palette {
  if (typeof palette === 'string') {
    if (!palettes[palette]) throw new Error(`Ferrule: unknown palette "${palette}". Use one of ${PALETTE_NAMES.join(', ')}, or createPalette.`);
    return palettes[palette];
  }
  for (const mode of ['light', 'dark'] as const) {
    const missing = Object.keys(palettes.verdigris[mode]).filter((name) => !palette?.[mode]?.[name as keyof ThemeColors]);
    if (missing.length) throw new Error(`Ferrule: the palette's ${mode} colors are missing ${missing.join(', ')}. Build one with createPalette, or change a few with createTheme({ colors }).`);
  }
  return palette;
}

export const defaultTheme: ThemeConfig = createTheme();

export interface ContrastCheck {
  name: string;
  fg: string;
  bg: string;
  ratio: number;
  /** 4.5 for text, 3 for controls and focus (WCAG 1.4.3 and 1.4.11). Disabled content is exempt from WCAG, so it has a legibility floor instead. */
  min: number;
}

/**
 * Every foreground and background pair the components draw, including pressed and hover fills.
 * Use it to test your own palette: `auditPalette(colors).filter((c) => c.ratio < c.min)` should be empty.
 */
export function auditPalette(colors: ThemeColors): ContrastCheck[] {
  const checks: ContrastCheck[] = [];
  const check = (name: string, fg: string, bg: string, min: number) =>
    checks.push({ name, fg, bg, ratio: contrastRatio(fg, bg), min });
  const grounds = { background: colors.background, surface: colors.surface, surfaceMuted: colors.surfaceMuted };

  for (const [groundName, ground] of Object.entries(grounds)) {
    for (const name of ['text', 'textMuted', 'primary', 'danger', 'success', 'warning'] as const) {
      check(`${name} on ${groundName}`, colors[name], ground, 4.5);
    }
    check(`controlBorder on ${groundName}`, colors.controlBorder, ground, 3);
    check(`primary mark on ${groundName}`, colors.primary, ground, 3);
  }
  check('focusRing on background', colors.focusRing, colors.background, 3);
  check('focusRing on surface', colors.focusRing, colors.surface, 3);
  check('placeholder on surface', colors.textMuted, colors.surface, 4.5);

  for (const [name, fill, on] of [
    ['primary', colors.primary, colors.onPrimary],
    ['danger', colors.danger, colors.onDanger],
  ] as const) {
    check(`${name} label at rest`, on, fill, 4.5);
    check(`${name} label hovered`, on, mix(fill, colors.overprint, HOVER_OVERPRINT), 4.5);
    check(`${name} label pressed`, on, mix(fill, colors.overprint, PRESSED_OVERPRINT), 4.5);
    check(`${name} disabled label`, mix(colors.background, on, DISABLED_OPACITY), mix(colors.background, fill, DISABLED_OPACITY), 1.5);
  }
  for (const name of ['success', 'warning'] as const) {
    check(`${name} solid label`, colors[name === 'success' ? 'onSuccess' : 'onWarning'], colors[name], 4.5);
  }
  for (const [name, fill, on] of [
    ['primarySoft', colors.primarySoft, colors.onPrimarySoft],
    ['dangerSoft', colors.dangerSoft, colors.onDangerSoft],
    ['successSoft', colors.successSoft, colors.onSuccessSoft],
    ['warningSoft', colors.warningSoft, colors.onWarningSoft],
  ] as const) {
    check(`${name} label`, on, fill, 4.5);
  }
  check('soft button pressed label', colors.onPrimarySoft, mix(colors.primarySoft, colors.onPrimarySoft, PRESSED_TINT), 4.5);
  check('ghost button hovered label', colors.primary, mix(colors.background, colors.primary, HOVER_TINT), 4.5);
  check('ghost button pressed label', colors.primary, mix(colors.background, colors.primary, PRESSED_TINT), 4.5);
  check('outline button pressed label', colors.text, mix(colors.background, colors.text, PRESSED_TINT), 4.5);
  check('switch off thumb', colors.textMuted, colors.surfaceMuted, 3);
  check('switch on thumb', colors.onPrimary, colors.primary, 3);
  check('disabled text', mix(colors.background, colors.text, DISABLED_OPACITY), colors.background, 1.5);
  return checks;
}
