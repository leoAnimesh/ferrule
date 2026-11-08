# What the example screens found

See also the [release readiness report](release-readiness.md), for what stands between this and a v1.

Three demo screens, since removed from the repo, were built using only `ferrule` and copied components, to see where the library was too rigid: a food delivery home (**food**), a todo app (**todo**) and a Pomodoro timer (**timer**). A gap was fixed in the library when the fix was general, and logged here rather than worked around in a screen.

## Fixed in the library

| Gap | Found by | Fix |
| --- | --- | --- |
| A nested `FerruleProvider` reset color mode to the OS, direction to LTR, and insets to its own estimate, so one section could not have its own theme | all | Mode, direction and insets carry over from the provider around it, unless set. **Behaviour change**, see below |
| No icons, and no way to tint artwork | all | `Icon`: a tinted single-color PNG, no font or SVG dependency. Mirrors with `flip`, grows with the OS text size up to 1.5x |
| `Button` always wants text, so icon-only controls needed a custom pressable | all | `IconButton`, with a required `aria-label` |
| Bundled `require()` images drew at the file's size in the top corner instead of filling `Image` | food | Bug. `Image` now sizes its inner image explicitly |
| `Card` press feedback was painted under its children, so it was invisible over an image | food | Bug. The state layer now sits above the children |
| The Android safe area ignored the gesture bar on Android 15+, where apps draw edge to edge, so tab bars and bottom fields sat under it | food, todo | The estimate leaves 24dp on API 35+. See deferred |
| Keyboards followed the OS, so a light screen on a dark phone got a dark keyboard | todo | `TextInput` sets `keyboardAppearance` from the theme |
| Header icon buttons could not be Liquid Glass, because the native button needs a text label | food, todo, timer | `IconButton` takes `native` and `nativeIcon`: glass on iOS 26+, the system button on iOS 17 to 25, the Ferrule one elsewhere |
| Nothing told a screen how tall the tab bar was, so content could not run to the bottom edge | food | `TabBarScreen` lays the bar over the content and `useTabBarHeight` gives the padding. The bar keeps its own look |
| `UITabBar` hosted on its own paints no material on iOS 26, so its items sit directly on whatever scrolls behind them, and a photo makes them hard to read | food | Left as the OS draws it, by decision. A material would need a real `UITabBarController` or `TabView`, which a hosted view is not |
| Remote `Image` showed a spinner for each photo, popped in, and left an empty box when a decorative image failed | food | A muted placeholder that holds the layout, a fade-in that respects reduced motion, and a small image mark when a decorative image fails |
| On Android, a bold weight on a custom family bundled as a native asset fell back to Roboto when the family came from a variant or `style`. Fonts loaded by `expo-font` were not affected | fonts | `Text` and `TextInput` drop `fontWeight` for custom families on Android. System families keep it |
| A partial `tokens.fontFamily` silently rendered missing weights in the system font | fonts | Warns once per weight in development |
| Native controls ignored the theme's font | fonts | Passed to SwiftUI and Compose. See `coverage.md` |
| Bouncing the food screen past the top showed its cream page color as a band against a tinted status bar area and header | food | the food screen's tint and header gradient are gone, so the whole screen is one page color. Each screen keeps scrolled content below the status bar with plain padding |
| No filter chips outside `ferrule-native` | food, todo | `Chip`, with a `native` variant |
| No segmented control outside `ferrule-native` | todo, timer | `Segmented`, with a `native` variant |
| No tab bar outside `ferrule-native`, and the native one had no fallback | food | `TabBar`, with a `native` variant: Liquid Glass on iOS 26+ |
| No progress display | todo, timer | `Progress` and `ProgressRing`, driven by Reanimated, with no SVG dependency. `duration` for clock-fed values |
| No swipe actions | todo | `SwipeRow`, with the same actions offered to screen readers |
| No number input for settings | timer | `Stepper`, adjustable as one control by screen readers |
| No sideways snapping row, and iOS opens a snapping right-to-left scroller on its last item | food | `Carousel`, which handles that case |
| No gradients | food | `Gradient`, on React Native's own `backgroundImage`. Mirrors in right-to-left |
| Layouts could not change with window width without reading dimensions by hand | food, timer | `useBreakpoint`, `useResponsive`, and `breakpoint` tokens |
| Every screen repeated the same centered max-width wrapper, and card grids had no primitive | all | `Container` and `Grid` in `stack` |
| Nothing above `display` for a big number | timer | `4xl` size token and `hero` text variant |
| Text tones stopped at `onPrimary`, so text on a success or warning fill needed raw colors | food | `onPrimarySoft`, `onDanger`, `onSuccess`, `onWarning` |
| `AppState` was not exported, so returning from the background needed a `react-native` import | timer | Exported, and added to what `ferrule check` flags |

## Deferred

| Gap | Found by | Why |
| --- | --- | --- |
| Android `useInsets` cannot tell gesture from three-button navigation, and three-button is taller | food, todo | Core has no native dependency to ask. Pass `insets` from `react-native-safe-area-context`, as the theming docs say |
| The Android native icon set is a fixed list in `FerruleContents.kt`, and an unknown name draws nothing, with no warning | food | Needs the full Material icons artifact, which is large. The screen uses a listed name. Worth a dev warning |
| Native Android `Segmented` wraps its label mid-word at 2x text on a 320dp screen | timer | Compose's own layout, in an extreme case. The Ferrule `Segmented` handles it |
| `ListItem` takes `title` and `description` as strings, so a row with a struck-through title and icons is composed by hand | todo | Only one screen needed it, and the composition is short. Widen it if a second one does |
| `Button`, `Input` and `Segmented` share `radius.md`, so a pill button means a pill field | timer | No screen had both. A component slot already separates them |
| Android has no native `IconButton`, so `native` stays the Ferrule button there | food, todo, timer | Only iOS was asked for, and Android's header buttons look right as they are. Material's `IconButton` is the next step |
| Header glass has nothing to refract: each header sits on a flat or gradient background, and none has content scrolling beneath it | food, todo, timer | Pinning a header over scrolling content is a screen change, not a library one. the food screen would gain most |
| The todo screen's back button sits 12pt outside the text margin on iOS, because the negative margin that lines up the invisible ghost button also moves the visible glass | todo | Removing it would move the Android and web button |
| A failed remote `Image` does not retry when the network returns, until it remounts or its source changes | food | Needs a network listener, which core does not have. An app can change the source |
| iOS can't take a theme font on alerts, menu items, picker values and options, date picker values, the action sheet title or the segmented control | fonts | Left on the system font. See `coverage.md` |
| Theme colors are a closed set, so a brand accent has to borrow `warning` | food | Worked well enough for offers. Open it only with a real second accent |
| Changing palette snaps instead of cross-fading | timer | Animating every token is a large change for a small effect |
| The Sheet's bottom inset stays while the keyboard is open, leaving a small gap | todo | Cosmetic |

## What was not a gap

Theme tokens carried each screen's identity with no component edits: the food screen's soft corners and heavy type, the todo screen's serif headings through text slots, and the timer's pill shapes and palette swap per mode. Horizontal scrolling, sticky headers and keyboard avoidance worked with what is exported.

## Behaviour changes

- `Modal` and `Sheet` now rise above the keyboard on Android as well, where it covered their inputs and footers on an edge-to-edge window. All platforms animate this with Reanimated, not `KeyboardAvoidingView`. `Overlay` content gains one wrapping view.
- On web, `Stepper` is no longer a `role="slider"`. It is a group holding the buttons and a `role="spinbutton"` value. iOS and Android are unchanged.
- On web, `List` wraps each row in a `listitem`, and has no `list` role with a header, footer, spinner or empty text. `ListItem` no longer claims `listitem` by itself. A selected pressable row is `aria-current`, not `aria-selected`, and is named by its own text instead of an `aria-label`.
- On web, `Segmented` and `TabBar` are one tab stop, with arrow keys, instead of one per option.
- On web, an open `Modal` or `Sheet` stops the page scrolling, by setting `overflow: hidden` on `<html>` until the last one closes.
- On web, a toast itself no longer has `role="status"` or `alert`. Hidden, always-mounted live regions hold the text, so a query for the toast's text finds two matches: use `testID`, now accepted by `toast.show`.
- A nested `FerruleProvider` now shares the root's overlay stack, so toasts reach a `Modal` inside it. A toast keeps the theme of its `ToastProvider`, wherever it renders. If two `ToastProvider`s sit under one root, the last one mounted wins the layer.
- On Android, hosted `ferrule-native` views no longer clip what they draw outside their bounds, which includes the FAB's shadow.
- `ferrule` has an `exports` map. Only `ferrule`, `ferrule/lib/feather` and `ferrule/package.json` can be imported; a deep import such as `ferrule/lib/theme` now fails.
- With `native` on iOS, solid and danger `Button` labels use `onPrimary` and `onDanger` instead of system white, which failed contrast on dark palettes.
- With `native`, `TabBar` no longer wraps the platform bar in a `surface` background.
- `Image` shows no loading spinner, and fades in on load.
- A nested `FerruleProvider` with no `colorMode` now inherits instead of following the OS. Pass `colorMode="system"` for the old result. A top-level provider is unchanged. Likewise `direction` on web and `insets`.
- `useInsets().bottom` is 24 rather than 0 on Android 15+.
- `Card` with `onPress` paints its press layer over its children, not under them.
- `TextInput` sets `keyboardAppearance` from the theme. Pass your own to override.
- `Segmented` slides one pill between segments, and has no hover state. The `selected` slot now styles that pill rather than the chosen segment.
- On web, toasts anchor to the window rather than the provider's view, so they show when the document itself scrolls.
- `createPalette`, `contrastRatio`, `auditPalette`, `createTheme` and the `palette` prop throw on an invalid color, an unknown palette name or an incomplete palette, rather than rendering `NaN` or missing colors.

The new `FontSizeToken` member and `breakpoint` token are additions, and a theme built with `createTheme` gets them by default.
