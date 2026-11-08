import { createPalette, createTheme, type ThemeOverrides } from '@leoanimesh/ferrule';

/** Every palette uses the system font by default. This is the optional brand font, used to take text width out of the metrics comparison. */
export const interTheme = createTheme({
  tokens: { fontFamily: { regular: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold' } },
});

/** A custom palette from one brand color per mode, plus token and per-component overrides. No component source changes. */
export const customOverrides: ThemeOverrides = {
  palette: createPalette({ light: '#7A1F5C', dark: '#F2B5DC' }),
  tokens: { radius: { md: 2, lg: 4 } },
  components: { button: { label: { letterSpacing: 0.5 } }, card: { container: { borderWidth: 2 } } },
};
export const customTheme = createTheme(customOverrides);
