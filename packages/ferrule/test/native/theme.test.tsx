import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { FerruleProvider, useInsets } from '../../src';
import { auditPalette, contrastRatio, createPalette, createTheme, defaultTheme, palettes, PALETTE_NAMES, type ColorMode } from 'ferrule';
import fs from 'node:fs';
import path from 'node:path';

const MODES: ColorMode[] = ['light', 'dark'];

describe.each(PALETTE_NAMES)('palette %s', (name) => {
  test.each(MODES)('%s meets AA for text and interactive states', (mode) => {
    const failures = auditPalette(palettes[name][mode]).filter((check) => check.ratio < check.min);
    expect(failures).toEqual([]);
  });

  test.each(MODES)('%s has every token as a color, and a visible primary', (mode) => {
    const colors = palettes[name][mode];
    for (const [token, value] of Object.entries(colors)) {
      expect([token, value]).toEqual([token, expect.stringMatching(/^(#[0-9A-F]{6}|rgba\(.+\))$/)]);
    }
    expect(colors.primary).not.toBe(colors.background);
  });
});

test('every palette reprints the primary, and neutrals carry the ink', () => {
  const primaries = new Set(PALETTE_NAMES.map((name) => palettes[name].light.primary));
  expect(primaries.size).toBe(PALETTE_NAMES.length);
  expect(palettes.cobalt.light.background).not.toBe(palettes.madder.light.background);
});

test('a custom palette from any brand color stays AA, even from a color that fails', () => {
  for (const ink of ['#FFEB3B', '#00FF00', '#FF00FF', '#000000', '#FFFFFF', '#777777']) {
    const palette = createPalette({ light: ink, dark: ink });
    for (const mode of MODES) {
      expect(auditPalette(palette[mode]).filter((check) => check.ratio < check.min)).toEqual([]);
    }
  }
});

test('createTheme takes a palette name, a custom palette, and color overrides on top', () => {
  expect(createTheme({ palette: 'plum' }).colors).toEqual(palettes.plum);
  const custom = createPalette({ light: '#7A1F5C', dark: '#F2B5DC' });
  expect(createTheme({ palette: custom }).colors.light.primary).toBe(custom.light.primary);
  expect(createTheme({ palette: 'plum', colors: { light: { danger: '#111111' } } }).colors.light.danger).toBe('#111111');
  expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
});

test('the default is verdigris', () => {
  expect(defaultTheme.colors).toEqual(palettes.verdigris);
});

test('the CLI palette list matches the library', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(__dirname, '../../registry/registry.json'), 'utf8'));
  expect(registry.palettes).toEqual(PALETTE_NAMES);
});

test('createTheme overrides what is given and keeps the rest', () => {
  const theme = createTheme({
    colors: { dark: { primary: '#ff0000' } },
    tokens: { radius: { md: 2 }, fontFamily: { bold: 'X' } },
    components: { button: { container: { borderRadius: 0 } } },
  });
  expect(theme.colors.dark.primary).toBe('#ff0000');
  expect(theme.colors.light.primary).toBe(defaultTheme.colors.light.primary);
  expect(theme.tokens.radius.md).toBe(2);
  expect(theme.tokens.radius.lg).toBe(defaultTheme.tokens.radius.lg);
  expect(theme.tokens.fontFamily.bold).toBe('X');
  expect(theme.components.button?.container?.borderRadius).toBe(0);
  expect(defaultTheme.tokens.radius.md).toBe(6);
});

test('interactive sizes meet the touch-target token', () => {
  expect(defaultTheme.tokens.minTouchTarget).toBeGreaterThanOrEqual(44);
  expect(defaultTheme.tokens.controlHeight.md).toBeGreaterThanOrEqual(44);
});

test('estimated insets clear the iPad status bar', async () => {
  const spy = jest.spyOn(Platform as unknown as { isPad: boolean }, 'isPad', 'get').mockReturnValue(true);
  let top = 0;
  const Probe = () => { top = useInsets().top; return null; };
  await render(<FerruleProvider><Probe /></FerruleProvider>);
  expect(top).toBe(24);
  spy.mockRestore();
});
