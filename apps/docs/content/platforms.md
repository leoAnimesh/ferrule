| Platform | Status | How it was checked |
| --- | --- | --- |
| iOS | Simulator only | Ran on an iOS 26.5 simulator (iPhone 17 Pro Max): XCUITest suite, screenshots, large text, RTL, reduced motion. Both the example app and a fresh bare app. |
| Android | Emulator and one phone | Scripted flow with real taps, typing and hardware back on a Pixel 8a (Android 17) and an API 37 emulator. Screenshots, font scale 2, RTL and reduced motion on the emulator only. A fresh bare app also built and ran on the emulator, with real taps. |
| Web | Browser builds | `react-native-web` in Chrome: keyboard, focus trap, Escape, RTL, reduced motion, plus a fresh Expo web export. Toast, Modal, Sheet and keyboard checks also ran in the WebKit and Firefox builds that Playwright ships, which are not Safari or Firefox as released. |

A physical Pixel 8a on Android 17 (API 37) also ran the scripted flows with real input: safe areas, keyboard, gestures, toasts and the native views in that flow. The Android status above covers one phone, not a range of them. iOS has not run on a physical device. An iPad mini simulator was checked for layout and safe area only. Status reflects versions read on 2026-11-07.

Ferrule targets iOS, Android and web. Other platforms are out of scope.

`@leoanimesh/ferrule-native` has its own, narrower status: iOS 26.5 simulator, API 37 emulator and one Pixel 8a on Android 17. No physical iPhone, and iOS below 26 not run. See its [coverage table](/docs/coverage).

## Consistency

The harness (`apps/example`) has a `metrics` screen that renders each component in a fixed 320dp column and logs its measured size. `scripts/compare-metrics.mjs` compares the logs and fails on any difference over 1dp.

Last run with the same font on iOS, Android and web: 27 of 30 probes within 1dp, all within 1.4dp. The three over 1dp are widths of text that hugs its content (`button.lg`, `text.caption.hug`, `text.h1.hug`), where each platform's text engine rounds tracking differently. No layout changes because of them, and the script still reports them, on purpose.

`compare-metrics.mjs` still exits 1 at its default 1dp tolerance because of those three probes. They are not hidden behind a wider tolerance.

Native variants (`native` prop, `@leoanimesh/ferrule-native`) are deliberately outside this comparison: they look like the platform, not like each other. The metrics screen forces `native={false}`.

Differences that are deliberate:

- **The default font is each platform's system font**, so no install is needed. Text widths match only when you load one font on all platforms. See [theming](/docs/fonts). Glyph rendering still differs slightly by OS.
- **Hover** appears only where a pointer exists. **Focus rings** appear for keyboard focus, not touch or mouse clicks.
- **Screen readers** behave as each platform does: VoiceOver, TalkBack and browser ones phrase things differently.
- **Right-to-left** is live on web, and needs a restart on iOS and Android, because React Native fixes it per process.

## Known limits

- **React Native 0.86 is the floor**, set by Reanimated 4.7. Older apps cannot use Ferrule.
- **Safe area** is estimated without a native dependency. On edge-to-edge Android, pass real `insets` to `FerruleProvider`.
- **Overlays use React Native's `Modal`.** That brings OS focus handling, but iOS cannot show two sibling modals at once, so render a sheet inside the modal that opens it.
- **Toasts sit above everything**, at the bottom by default, so one can cover a bottom sheet's controls until it times out or is dismissed. Set `position="top"` to avoid that. They do not move for the keyboard.
- **The web bundle carries Reanimated.** A fresh Expo web app with one `Button` is 283 kB gzipped against 107 kB when empty. Of the code added, nearly all is Reanimated; `@leoanimesh/ferrule` itself is 27 kB before gzip. Later components add little. Expo's unstable tree shaking (`EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1 EXPO_UNSTABLE_TREE_SHAKING=1`) brought the same app to 215 kB, and it still ran.
- **`check` scans with patterns**, not a full parser, so unusual import forms can slip past it.

