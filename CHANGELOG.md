# Changelog

All notable changes to `@leoanimesh/ferrule` and `@leoanimesh/ferrule-native`, which are versioned together. Dates are release dates. Fuller reasoning for behaviour changes is in [docs/gaps.md](docs/gaps.md).

## 0.2.0 - 2026-11-08

### Added

- Toast options: `position`, `align`, `duration`, `animation` and `animationDuration`, on `ToastProvider` as defaults and on `toast.show`. Also `style` and `testID`.
- Refs on `Carousel`, `Icon`, `Progress`, `ProgressRing`, `Segmented`, `Spinner`, `Stepper`, `SwipeRow` and `TabBar`.
- A `container` theme slot on `Carousel`, `Icon`, `Progress`, `ProgressRing`, `Spinner`, `Stepper` and `SwipeRow`. `testID` on `Icon`.
- `useRovingFocus`, the arrow-key behaviour of `Segmented` and `TabBar`, for controls of your own.
- `ferrule --version`.
- An `exports` map on `@leoanimesh/ferrule`.
- Releases on npm, as `@leoanimesh/ferrule` and `@leoanimesh/ferrule-native`. Install with `npm install @leoanimesh/ferrule`.

### Changed

- **Breaking, renamed:** the packages are `@leoanimesh/ferrule` and `@leoanimesh/ferrule-native`. Not `ferrule`, which npm rejected as too similar to another package's name. From the `v0.1.0` tarballs, change every import of `ferrule`, `ferrule/lib/feather` and `ferrule-native` to the new names, in your code and in copied components. The CLI is still `npx ferrule`, and `ferrule.json` is unchanged.
- **Android:** `Modal` and `Sheet` rise above the keyboard, which used to cover their inputs and footers on an edge-to-edge window.
- All animation in the library now runs on Reanimated. `KeyboardAvoidingView` is still exported from `@leoanimesh/ferrule` for apps, and it animates with React Native's `LayoutAnimation`.
- **Web, breaking for deep imports:** only `@leoanimesh/ferrule`, `@leoanimesh/ferrule/lib/feather` and `@leoanimesh/ferrule/package.json` can be imported.
- **Web:** `Stepper` is a group holding its buttons and a `spinbutton`, instead of a `slider` around them.
- **Web:** `List` puts each row in a `listitem`, and has no `list` role with a header, footer, spinner or empty text. A selected pressable `ListItem` is `aria-current`, and is named by its own text.
- **Web:** `Segmented` and `TabBar` are one tab stop, with arrow keys.
- **Web:** toast text is announced from always-mounted live regions, so queries for it find two matches. Use `testID`.
- **Web:** an open `Modal` or `Sheet` stops the page behind it scrolling.
- A nested `FerruleProvider` shares the root's overlay stack, so toasts reach a `Modal` inside it.
- `createPalette`, `contrastRatio` and `resolvePalette` throw a clear error on invalid input, instead of producing colors like `#FENANNAN`.
- `Segmented`'s pill slides between segments, and segments have no hover state.

### Fixed

- **Web:** toasts rendered off screen on any page whose document scrolls.
- **iOS, `@leoanimesh/ferrule-native`:** solid and danger `Button` labels were system white on the light primary of every dark palette, at about 2:1. They now use `onPrimary` and `onDanger`.
- **Android, `@leoanimesh/ferrule-native`:** the FAB's shadow no longer clips to a square.
- **Web:** `Carousel` and a scrolling `List` can take keyboard focus.

## 0.1.0

First public release, as tarballs on GitHub. Never published to npm, and it never will be: the tag marks it as finished.
