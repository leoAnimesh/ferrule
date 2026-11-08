# Theming

All customization goes through one system. From broadest to narrowest:

| Level | How | Reaches |
| --- | --- | --- |
| Palette | `createTheme({ palette: 'cobalt' })`, or `<FerruleProvider palette="cobalt">` at runtime. Either takes [your own](#your-own-palette) too | Every color, in light and dark |
| Tokens and colors | `createTheme({ tokens, colors })` | Every component |
| Component slots | `createTheme({ components: { button: { label: {...} } } })` | One component everywhere |
| Variants and props | `<Button variant="outline" size="lg" />` | One use |
| `style` props | `<Button style={...} labelStyle={...} />` | One use |
| The source | Edit `components/ui/button.tsx`. It is your code now. | Anything |

```tsx
import { createTheme, FerruleProvider } from 'ferrule';

const theme = createTheme({
  palette: 'plum',
  tokens: { radius: { md: 4 }, space: { 4: 18 } },
  components: { card: { container: { borderWidth: 2 } } },
});

<FerruleProvider theme={theme} colorMode="system">...</FerruleProvider>;
```

Unset values keep their defaults. Components render with the default light theme even with no provider, but Toast needs one to stay above overlays.

## Palettes

| Name | Character | Light primary | Dark primary |
| --- | --- | --- | --- |
| `verdigris` (default) | Patina green | `#0A6B5E` | `#4FD1B5` |
| `cobalt` | Deep blue | `#1F4FD1` | `#8DB0FF` |
| `madder` | Crimson | `#A3123F` | `#FF8FAE` |
| `vermilion` | Orange red | `#AB370A` | `#FF9A6B` |
| `saffron` | Ochre to gold | `#875800` | `#F2B632` |
| `plum` | Violet | `#6D28A8` | `#C9A2FF` |
| `graphite` | Near neutral | `#2B2F33` | `#E6E8EA` |

Every color derives from the ink, including surfaces and borders. Components read only semantic tokens, so a copied component needs no change. `ferrule check` fails on a raw color in your components directory.

`madder` and `vermilion` sit near `danger`, and `verdigris` near `success`. The state colors stay their own hue and every state carries a label, but check the pairing if your product leans on them.

### Your own palette

Give one brand color per mode, as `#RRGGBB`. Built-in palettes come from the same function, so yours gets the same derivation: every surface, border, tone and state. Pass the result to `createTheme`, or to `FerruleProvider` to swap it at runtime or for one section:

```tsx
import { auditPalette, createPalette, createTheme, FerruleProvider } from 'ferrule';

const palette = createPalette({ light: '#7A1F5C', dark: '#F2B5DC' });

// In ferrule.theme.ts: `ferrule init` writes a theme with a palette name, and this replaces the name.
export const theme = createTheme({ palette });

// Or at runtime. `palette` replaces the theme's colors, including any `colors` overrides.
<FerruleProvider palette={palette}>...</FerruleProvider>;

// In a test: every text and interactive state the components draw.
for (const mode of ['light', 'dark'] as const) {
  expect(auditPalette(palette[mode]).filter((c) => c.ratio < c.min)).toEqual([]);
}
```

It reaches every component on iOS, Android and web, and the `ferrule-native` views that use theme colors. To change a few colors, use `colors` on top of a palette. A hand-built `Palette` must set every color in both modes. Anything else throws a clear error: a color that isn't `#RRGGBB`, a missing mode, an unknown name, or an incomplete palette.

### What contrast is guaranteed

`auditPalette` checks the text and control pairs the components draw at their tokens, including pressed and hover fills: 4.5:1 for text, and 3:1 for control edges and focus. It does not check your own colors on images or gradients, or colors set with `style` or slots.

| You used | Contrast |
| --- | --- |
| A built-in palette | Passes `auditPalette` in light and dark, tested for each one |
| `createPalette` | Passes too, tested on 1,000 random colors. Any color that would miss is darkened or lightened until it passes, so read back `palette.light.primary` if the exact hex matters |
| `colors` overrides, or a hand-built `Palette` | Not guaranteed. Nothing moves your color, so run `auditPalette` on the result. It takes `#RRGGBB` only, and throws on anything else rather than passing it |

This is a check of color pairs, not an accessibility certification.

## Colors

Each can be overridden per mode, on top of the palette, in `colors.light` and `colors.dark`:
`background`, `surface`, `surfaceMuted`, `text`, `textMuted`, `border`, `controlBorder`, `primary`/`onPrimary`, `primarySoft`/`onPrimarySoft`, the same four for `danger`, `success` and `warning`, `overprint`, `focusRing`, `overlay`.

`overprint` is laid over solid fills when pressed or hovered, chosen so that the label's contrast rises.

## Tokens

| Token | Default |
| --- | --- |
| `space` | `0:0 1:4 2:8 3:12 4:16 5:20 6:24 8:32 10:40` |
| `radius` | `none:0 sm:3 md:6 lg:10 full:9999` |
| `fontSize` | `xs:12 sm:14 md:16 lg:18 xl:22 2xl:28 3xl:36 4xl:56` |
| `lineHeight` | `xs:16 sm:20 md:24 lg:24 xl:28 2xl:34 3xl:42 4xl:64` |
| `fontWeight` | `regular:400 medium:500 semibold:600 bold:700` |
| `fontFamily` | empty, meaning the system font |
| `controlHeight` | `sm:36 md:44 lg:52` |
| `minTouchTarget` | `44` |
| `maxFontScale` | `2` |
| `shadow` | `sm md lg`, as `boxShadow` strings |
| `motion` | `fast:120 normal:240` (ms). The curve is `EASE_OUT` |
| `breakpoint` | `md:768 lg:1100` (window width in dp) |

## Nested themes

A `FerruleProvider` inside another restyles only its subtree, which suits a section with its own brand. Its `theme` and `palette` are its own, while color mode, direction and safe-area insets carry over from the provider around it unless you set them. `colorMode="system"` still means the OS.

## Responsive values

`useBreakpoint()` returns `base`, `md` or `lg` from the window width and the `breakpoint` tokens (768 and 1100 by default). `useResponsive({ base: 1, md: 2, lg: 3 })` picks a value, and a missing band falls back to the next smaller one.

## Gradients

`<Gradient colors={[colors.primarySoft, colors.background]} angle={180}>` draws a linear gradient behind its children using React Native's own `backgroundImage`, and mirrors its angle in right-to-left. Text on a gradient must pass contrast against every color in it, so build one from theme tokens.

## Identical text on every platform

No font install is required: the default is each platform's system font, on every platform. A custom font is an optional brand step, and you are responsible for its license.

With the system font, sizes and heights match but text widths do not, since each platform has its own font. To match exactly, load one font in your app and name each weight:

```ts
tokens: { fontFamily: { regular: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold' } }
```

Each weight gets its own family because Android cannot synthesize weights for custom fonts. How to load the font is up to your app. The example app uses `expo-font`, and bare apps can link font files with `react-native-asset`.

### Other places to set a font

Only the theme's weights are mapped to families. Set a font for one case in any of these:

One text variant, in the theme:

```ts
components: { text: { h2: { fontFamily: 'Caveat_700Bold' } } }
```

One part of the app. A nested provider replaces the fonts for everything inside it:

```tsx
<FerruleProvider theme={monoTheme}>...</FerruleProvider>
```

One piece of text:

```tsx
<Text style={{ fontFamily: 'Caveat_700Bold' }}>...</Text>
```

**Italics need a one-off family.** There is no italic token, so `fontStyle: 'italic'` on a custom font is not mapped to its italic file. Name it directly: `<Text style={{ fontFamily: 'Lora_400Regular_Italic' }}>`.

Name every weight you render. In development, text at a weight with no family warns once and uses the system font.

On Android, `fontWeight` is dropped when the family is custom, because a bold weight on a font bundled as a native asset falls back to a system font. System families such as `serif` keep their weight.

### Native controls

Native variants use the theme's fonts where the OS allows, with no extra setup, and stay on the system font with no custom font in the theme. Dynamic Type and Android font scaling still apply, and a font that failed to load falls back to the system font. [The coverage table](../../ferrule-native/docs/coverage.md#fonts) lists which controls can't.

## Reading tokens in your own components

```tsx
const { colors, tokens, mode } = useTheme();
```

## Animation

Components animate with Reanimated, re-exported from `ferrule`: `Animated`, `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withRepeat`, `cancelAnimation`, `interpolate`, `Easing`, `EASE_OUT`, `useReducedMotion`, the entering and exiting builders `FadeIn`, `FadeInDown`, `FadeInUp`, `FadeOut`, `FadeOutDown`, `FadeOutUp`, `ZoomIn` and `ZoomOut`, plus `StateLayer`, `Band` and `useOverlayMotion`. `withTiming` follows the system reduced-motion setting by default, jumping to the end value. Effects cancel their animation on unmount.

Also available: `useInsets()`, `useDirection()`, `useReducedMotion()`, `useSlot(component, slot)`, `useControllableState(value, default, onChange)`, `useRovingFocus(values, current, select, { upDown, disabled })` for arrow keys on web in a one-of-many control of your own.

## Right-to-left

- **iOS and Android:** direction is process-wide. Call `I18nManager.forceRTL(true)` and restart the app.
- **Web:** pass `direction="rtl"` to `FerruleProvider`. It applies live.

Components use logical styles, so nothing else is needed.

## Safe area

React Native core has no safe-area API and Ferrule avoids a further native dependency, so `useInsets()` estimates from the screen size on iOS and from the status bar height on Android. Android's bottom inset estimates to 24 on API 35 and later, where apps draw edge to edge, and to 0 below it. Three-button navigation is taller, so wherever exact values matter, pass real ones. `react-native-safe-area-context` works, for example:

```tsx
<FerruleProvider insets={useSafeAreaInsets()}>...</FerruleProvider>
```
