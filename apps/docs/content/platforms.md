| Platform | Status | How it was checked |
| --- | --- | --- |
| iOS | Verified | Ran on an iOS 26.5 simulator (iPhone 17 Pro Max): XCUITest suite, screenshots, large text, RTL, reduced motion. Both the example app and a fresh bare app. |
| Android | Verified | Ran on an API 37 emulator: scripted flow with real taps and hardware back, screenshots, font scale 2, RTL, reduced motion. A fresh bare app was only bundled for Android, not run. |
| Web | Verified | `react-native-web` in Chrome: keyboard, focus trap, Escape, RTL, reduced motion, plus a fresh Expo web export. |

Physical devices have not been tested. An iPad mini simulator was checked for layout and safe area only. Status reflects versions read on 2026-11-06.

Ferrule targets iOS, Android and web. Other platforms are out of scope.

`ferrule-native` has its own, narrower status: iOS 26.5 simulator and API 37 emulator only, no physical device, and iOS below 26 not run. See its [coverage table](/docs/coverage).

## Consistency

The harness (`apps/example`) has a `metrics` screen that renders each component in a fixed 320dp column and logs its measured size. `scripts/compare-metrics.mjs` compares the logs and fails on any difference over 1dp.

Last run with the same font on iOS, Android and web: 27 of 30 probes within 1dp, all within 1.4dp. The three over 1dp are widths of text that hugs its content (`button.lg`, `text.caption.hug`, `text.h1.hug`), where each platform's text engine rounds tracking differently. No layout changes because of them, and the script still reports them, on purpose.

`compare-metrics.mjs` still exits 1 at its default 1dp tolerance because of those three probes. They are not hidden behind a wider tolerance.

Native variants (`native` prop, `ferrule-native`) are deliberately outside this comparison: they look like the platform, not like each other. The metrics screen forces `native={false}`.

Differences that are deliberate:

- **The default font is each platform's system font**, so no install is needed. Text widths match only when you load one font on all platforms. See [theming](/docs/fonts). Glyph rendering still differs slightly by OS.
- **Hover** appears only where a pointer exists. **Focus rings** appear for keyboard focus, not touch or mouse clicks.
- **Screen readers** behave as each platform does: VoiceOver, TalkBack and browser ones phrase things differently.
- **Right-to-left** is live on web, and needs a restart on iOS and Android, because React Native fixes it per process.

## Known limits

- **React Native 0.86 is the floor**, set by Reanimated 4.7. Older apps cannot use Ferrule.
- **Safe area** is estimated without a native dependency. On edge-to-edge Android, pass real `insets` to `FerruleProvider`.
- **Overlays use React Native's `Modal`.** That brings OS focus handling, but iOS cannot show two sibling modals at once, so render a sheet inside the modal that opens it.
- **Toasts sit at the bottom**, above everything, so one can cover a bottom sheet's controls until it times out or is dismissed.
- **`check` scans with patterns**, not a full parser, so unusual import forms can slip past it.

