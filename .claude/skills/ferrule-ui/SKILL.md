---
name: ferrule-ui
description: Build or change app screens with Ferrule correctly. Use whenever code imports from `@leoanimesh/ferrule` or `components/ui`, or someone asks to make a screen, form or layout in a Ferrule app, pick a palette, set fonts, add dark mode, or use native views or Liquid Glass, even if they do not name Ferrule. Not for adding a component to the library itself; that is ferrule-build-component.
---

# Building UI with Ferrule

Ferrule has two parts: the `@leoanimesh/ferrule` package (provider, theme, primitives, Reanimated re-exports) and component source copied into the app with the CLI, usually to `components/ui/`. The copied files belong to the app, so edit them freely.

## Imports

- `View`, `Pressable`, `ScrollView`, `FlatList`, `Platform`, `StatusBar` and the other primitives come from `@leoanimesh/ferrule`, not `react-native`. `ferrule check` fails on a covered primitive imported from `react-native`, because the Ferrule versions carry the fixes that keep platforms alike.
- Components come from their copied file: `import { Button } from './components/ui/button'`.
- Get a component with `npx ferrule add <name>`, and list them with `npx ferrule list`. Check `packages/ferrule/docs/components.md` before writing something by hand.

## Color and tokens

Read everything from the theme: `const { colors, tokens, mode } = useTheme();`.

- Use semantic colors (`background`, `surface`, `text`, `textMuted`, `border`, `primary`/`onPrimary`, `danger`, `success`, `warning` and their `Soft` and `on` pairs). A hex, `rgb()` or named color makes `ferrule check` fail and stops the screen following a palette.
- Spacing is `tokens.space`, radii `tokens.radius`, and type goes through `<Text variant tone>`.
- Text on a color uses its pair, such as `tone="onPrimary"`, so contrast holds in every palette.

## Theming

Pick the broadest level that does the job, in this order: palette, tokens and colors, component slots, props, `style`, then editing the copied source. `docs/theming.md` in the `@leoanimesh/ferrule` package has every option.

```tsx
const theme = createTheme({ palette: 'cobalt' });
<FerruleProvider theme={theme} colorMode="system">...</FerruleProvider>
```

Palettes are `verdigris` (default), `cobalt`, `madder`, `vermilion`, `saffron`, `plum` and `graphite`. A brand color goes through `createPalette({ light, dark })`, into `createTheme({ palette })` or `<FerruleProvider palette={...}>`. `auditPalette` tests a palette against AA, which matters for `colors` overrides and hand-built palettes, where nothing moves your color for you.

Fonts are optional. Name every weight in `tokens.fontFamily`, because Android cannot synthesize weights for a custom font. The app loads the font files and is responsible for their license.

## Native variants

The optional `@leoanimesh/ferrule-native` package draws real platform views. Import it once at the app's entry (`import '@leoanimesh/ferrule-native'`), rebuild the binary, and set `native` on a component or on `FerruleProvider`. It does not run in Expo Go.

- Anything unavailable falls back to the Ferrule component, so keep passing the normal props and children. `IconButton` needs `children` as well as `nativeIcon`, because Android and web draw `children`.
- Liquid Glass is iOS 26+ only: `IconButton`, `Button`, `Card`. `TabBar` with `native` is the platform bar with no Ferrule styling. Do not describe it as glass.
- `packages/ferrule-native/docs/coverage.md` says which views exist and what was run on each platform.

## Accessibility

- Icons are Feather, by name: `<Icon name="map-pin" />`. A wrong name fails typecheck. Native controls take system icons through `nativeIcon` instead: an SF Symbol and a Material name.
- A `Pressable` or `IconButton` with no text needs `aria-label`. `IconButton` requires it.
- `Image` needs `alt`. Use `alt=""` for decoration.
- Use `minHeight` rather than `height` on anything holding text, so it grows with the OS text size.
- Use `start`/`end` styles rather than `left`/`right`, so right-to-left works.
- Run animation through Reanimated from `@leoanimesh/ferrule`. `withTiming` follows reduced motion.

## Before finishing

Run `npx ferrule check`. It reports direct primitive imports, raw colors and Reanimated misconfiguration. It does not judge layout or accessibility, so look at the screen on each platform you claim.
