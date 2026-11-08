# Release readiness

Rechecked 2026-11-07 against the uncommitted working tree, not a tagged release. Each finding reads **Fixed**, **Not fixed** or **Needs a person**.

## Verdict

**Ready for a first public release as a 0.x, once you have merged it and done the steps below. Not yet honest to call 1.0.**

Every code finding that could be fixed here is fixed, and seen running on an iOS simulator, an Android emulator and three browser engines. What still stands between this tree and a release:

1. **Needs a person, before calling it 1.0:** VoiceOver, TalkBack and a browser screen reader. Automated accessibility checks now pass, but nobody has heard any of this announced, including the new toast live regions and Stepper's new spin button.
2. **Needs a person, before calling it 1.0:** a physical iPhone, other Android phones, iOS 17 to 25, and Safari and Firefox as released. One Android phone has run: see "Physical Android phone".
3. **Decided:** npm under the `@leoanimesh` scope, version 0.2.0, the showcase images stay deleted. Whether any missing component must come first has not been answered, and this release goes without them.
4. **Your review:** the screenshot baselines listed under "Baselines to review", which were not regenerated.
5. **Your action:** merge the rename pull request, which releases 0.2.0. The first release attempt failed: npm rejected the name `ferrule` as too similar to `rrule`, so nothing was published or tagged, and the packages are now scoped.

## Blockers

| # | Finding | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Stepper ignored arrow keys on web, and nested buttons in a slider | **Fixed.** On web it is a group holding the buttons and a `spinbutton`. iOS and Android keep the adjustable control | Real keys in Chromium, WebKit and Firefox: up 25 to 30, down back to 25, Home to 5, Tab reaches it. axe on `stepper`: no violations. iOS and Android suites still pass. Web unit test |
| 2 | List had invalid ARIA on web: `aria-selected` on a button, a list with no list items, list items outside a list | **Fixed** in `List` and `ListItem`, so SwipeRow and the landing page are fixed with them | axe on `list`, `swipe-row` and all other changed screens: no violations. Landing page and 8 docs pages: no violations. Web unit tests |
| 3 | No screen reader run, no physical device | **Partly fixed.** One Android phone has run. Screen readers and a physical iPhone need a person | See "Physical Android phone" and "What could not be verified" |
| 4 | No release path | **Fixed.** `CHANGELOG.md`, [the release checklist](release-checklist.md), a release workflow that runs on a version bump, and an `exports` map on `@leoanimesh/ferrule`. `sideEffects: false`. `check:pack` now fails if an export target would not ship. Version bumped to 0.2.0 in the release pull request, unmerged | Packed tarballs in a fresh Expo app and a fresh bare app: `ferrule --version`, `init`, `add --all`, `check`, `tsc` and `@leoanimesh/ferrule/lib/feather` all work. A deep import fails, as intended, in `tsc` and in Node (`ERR_PACKAGE_PATH_NOT_EXPORTED`). Bundled for iOS, Android and web. The Expo web bundle ran with a real click |

`@leoanimesh/ferrule-native` has no `exports` map on purpose: autolinking and codegen read its files by path. Its source is shipped as TypeScript, as before.

## Should fix

| # | Finding | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Page scrolls behind Modal and Sheet on web | **Fixed.** `overflow: hidden` on `<html>` while one is open, counted for stacked overlays, and it reserves the scrollbar's width | Real wheel events in all three engines: `scrollY` held at 60 under both, width unchanged, scrolling back after closing. Web unit test |
| 2 | Toast's live region arrived with its text | **Fixed in the DOM, not heard.** Two always-mounted regions, polite and assertive, hold the text on web. Native unchanged | All three engines: regions present and empty before the first toast, text arrives after. Unit test. **Needs a person** to confirm it is announced. Browse mode may also read the text twice |
| 3 | Segmented and TabBar had no arrow keys | **Fixed**, through a shared `useRovingFocus`, at one tab stop. Right-to-left swaps left and right | Real keys in all three engines: selection and focus move. Unit tests, including RTL and disabled |
| 4 | `scrollable-region-focusable` on Carousel | **Fixed**, and on a scrolling List, the harness scroller and the site's code blocks | axe: none left on the screens run. Arrow keys scroll Carousel in Chromium and Firefox. **Not confirmed in WebKit**: the Playwright build did not scroll on the arrow key, and Safari itself was not run |
| 5 | CI has no native coverage | **Partly fixed.** New `Native build` workflow, run by hand, compiles the harness for both platforms. E2E stays a manual step in the checklist, because it needs a Mac with this Xcode and simulators | **The workflow has never run**: that takes a push. Its YAML was not validated by any tool here |
| 6 | `e2e/ios/run.sh` could pass having run nothing | **Fixed.** It fails unless `Executed N tests` shows N above 0 | Ran it for real, with the suite. The zero-test path itself was not reproduced, because that was an intermittent Xcode result |
| 7 | Android FAB's shadow clipped to grey squares | **Fixed** at the host view: it no longer clips children, which applies to every hosted view | Emulator screenshots, before and after, cropped and compared. The corners are round. `native-fab` baselines move |
| 8 | `testScrollGestures` did not assert the band | **Fixed.** It samples the screen during the gesture: no bright full-width band on a dark page, and the same check must see the bright light page, proving it can detect one | iOS 26.5 simulator, in the full suite: it passed in both modes, on `text` and `button`. No deliberate band was injected, so the proof that it can fail is the light-page half |
| 9 | Refs and slots were inconsistent | **Fixed.** Refs on Carousel, Icon, Progress, ProgressRing, Segmented, Spinner, Stepper, SwipeRow and TabBar. `container` slots on Carousel, Icon, Progress, ProgressRing, Spinner, Stepper and SwipeRow. `style` and `testID` on toasts, `testID` on Icon. Modal, Sheet and Toast take no ref, by design: their content renders in its own window, or is shown through a hook | Unit test covering each one |
| 10 | Missing components | **Not fixed: your decision.** Select, Radio group, top Tabs, Tooltip, Accordion, Skeleton, JS Slider, Menu, JS date picker and Banner are still absent. Native variants of some exist | Out of scope for this round |
| 11 | Toast did not enter a Modal under a nested provider | **Fixed.** Nested providers share the root's overlay stack, and a toast keeps its `ToastProvider`'s theme. Limit: with two `ToastProvider`s under one root, the last mounted wins | Unit test, which fails without the change |
| 12 | Native gaps: M3 Expressive, toolbar, bottom app bar, iOS bottom bar glass | **Not fixed.** The first three are new views, so out of scope. Glass reverses your call against custom bottom bar styling. All stay documented in the coverage table | Coverage table |
| 12a | iOS 17 to 25 never run | **Needs a person.** No runtime is installed here | `simctl list runtimes` shows 26.4, 26.5 and 27.0 |
| 13 | Site SEO | **Fixed.** Canonical and Open Graph tags per route, a real favicon, proper component names in static titles such as `SwipeRow · Ferrule` | Read the built HTML. Lighthouse was not run |
| 14 | `docs/contributing` overflowed at 390 | **Fixed.** Long inline code wraps | Playwright at 390: page width is 390, with nothing past the edge |
| 15 | First component adds about 183 kB gzipped on web | **Analysed. No cheap fix in the library, one documented option for apps.** By source map, of 1,207 kB raw for one Button: Reanimated 651 kB (54%), react-dom 204 kB, react-native-web 197 kB, `@leoanimesh/ferrule` 27 kB (2%). Reanimated is a required peer, and replacing it on web would be a rewrite. Expo's unstable tree shaking took the same app from 283 kB to 215 kB gzipped, and it still ran. Documented in the Platforms page | Fresh Expo export, measured, with and without the flags |

## Nice to have

| # | Finding | Status |
| --- | --- | --- |
| 1 | `ferrule --version` printed usage | **Fixed**, with a test and docs |
| 2 | 28 unused showcase images | **Fixed.** Removed, 1.9 MB. No code used them |
| 3 | Landing wall pins 18 of 23 | **Not fixed.** A design call, and the wall is yours |
| 4 | Docs pages have no palette control | **Not fixed.** A design call |
| 5 | `compare-metrics` exits 1, 27 of 30 within 1dp | **Not worth fixing.** Text widths differ by platform, up to 1.4dp. Documented, and the strict tolerance stays |
| 6 | Platform table said "Verified" | **Fixed.** It now reads "Simulator only", "Emulator only" and "Browser builds" |

## Baselines to review

`pnpm screens`: 216 of 222 pass. The 6 failures are one screen. Actual and diff images are git-ignored, so they are on the machine that ran this, under `apps/example/e2e/screens/out/`:

| Screen | Changed | Why | Files |
| --- | --- | --- | --- |
| `toast` on iOS | 1.00% | The new Position, Auto dismiss and Animation demo sections | `ios/toast-light.*`, `ios/toast-dark.*` |
| `toast` on Android | 1.04%, 1.07% | The same | `android/toast-light.*`, `android/toast-dark.*` |
| `toast` on web | 1.35%, 1.38% | The same | `web/toast-light.*`, `web/toast-dark.*` |

Each diff was looked at. The change is the added sections and nothing else. `native-fab` on Android passes at 0.05%, below the threshold, but its saved baseline still shows the old clipped corners, so regenerate it with the others.

`modal` on every platform also changes, because its demo gained a "With input and keyboard" button. On web that is 4.91% light and 5.07% dark. Not regenerated, and iOS and Android were not re-compared.

## Toast configuration


```ts
type ToastConfig = {
  position?: 'top' | 'bottom';            // default 'bottom'
  align?: 'start' | 'center' | 'end';     // default 'center'. Full width on phones
  duration?: number | null;               // default 5000 ms. null stays until dismissed
  animation?: Preset | { enter?: Preset; exit?: Preset }; // default slide in, fade out
  animationDuration?: number;             // default theme motion.normal in, motion.fast out
};
type Preset = 'slide' | 'fade' | 'scale' | 'none';
```

Pass any of them to `<ToastProvider>` as defaults, or to `toast.show()` for one toast. The toast's value wins. A toast with an action keeps the 5000 ms default; the docs recommend longer, or `null`. Slide follows position, and reduced motion skips movement on all three platforms.

## What ran

| Check | On | Result |
| --- | --- | --- |
| `pnpm test`, `typecheck`, `check`, `check:pack`, docs tests and docs typecheck | Node | All exit 0. 193 component tests, 39 docs tests, 29 CLI tests |
| XCUITest, `run.sh` | iPhone 17 Pro Max simulator, iOS 26.5 | Executed 20 tests, 0 failures |
| `flow.py`, `native.py`, with real input | Pixel 8a phone and emulator, both API 37 | All pass on both: 23 and 25 checks, including typing into a `Modal` and a `Sheet` with the keyboard open |
| Gestures by `adb shell input`, screenshots read by eye | Pixel 8a | SwipeRow, Sheet drag, Carousel, Segmented pill in mid-slide on a screen recording, FAB corners |
| `pnpm screens`, baselines not regenerated | iOS, Android, web | Exit 1: 216 of 222 pass, see above |
| Keyboard, real keys | Chromium, WebKit and Firefox builds | Stepper, Segmented and TabBar pass in all three. Carousel arrows pass in two |
| Modal and Sheet scroll lock, real wheel | All three | Pass |
| Toast shown, hit-tested, dismissed | All three, 390 and 1440, light and dark | 12 of 12 pass, no page errors |
| axe (WCAG A and AA) | Harness screens `list`, `swipe-row`, `stepper`, `carousel`, `card`, `segmented`, `tabbar`, `toast`, `composite`, `image`, `text`, `progress`, `spinner`, `icon`, `button` at 390; landing at 390 and 1440; 8 docs pages at 1440 | No violations. `card` needed the harness's own demo label corrected, and `image` and `text` the harness scroller |
| Fresh Expo and bare apps from tarballs | `ferrule --version`, `init`, `add --all`, `check`, `tsc`, `@leoanimesh/ferrule/lib/feather`, bundles for iOS, Android and web | Pass. `react-native config` still autolinks `@leoanimesh/ferrule-native`. Expo web ran with a real click |
| Link crawl | All routes | No broken links |

## Physical Android phone

A Pixel 8a on Android 17 (API 37), by USB, running the debug harness against Metro. `flow.py` and `native.py` with `ANDROID_SERIAL`, real gestures by `adb shell input`, and screenshots read by eye. Results are in "What ran".

- **Found and fixed:** `Modal` and `Sheet` sat behind the keyboard, so `Save` could not be tapped and the tap typed a letter instead. An edge-to-edge window does not resize for the keyboard. No Android check had typed into one. `flow.py` now does, for both.
- **Looked right:** status and navigation bar insets, top and bottom toasts, the Segmented pill moving, SwipeRow, Carousel, dragging a Sheet closed, native views, and FAB corners and shadow, which are not clipped.
- **Harness timing:** the flow's toast step tapped a toast with a default timeout, and the phone's slower UI dumps outran it. It uses a persistent toast now. That was the script, not the toast.
- **Keyboard measured:** `Save` moved from y=1414 to 986 and back in `Modal`, and from 2237 to 1380 and back in `Sheet`, ending where it started.
- **Not on this phone:** TalkBack, font scale 2, RTL, reduced motion, and `pnpm screens`. Baselines are from the emulator and would not match.

## What could not be verified

- VoiceOver, TalkBack and browser screen readers: nothing here has been heard.
- A physical iPhone, or any Android phone but one.
- iOS 17 to 25. The code compiles for them; no runtime is installed.
- Safari and Firefox as released, or any browser on Windows or Linux. WebKit and Firefox are Playwright builds.
- The `Native build` workflow, which has never run.
- The fresh apps on iOS and Android after the `exports` change. They were bundled for those platforms and typechecked, and only web ran. `exports` affects only module resolution. An earlier round ran both on the emulator and simulator from a tarball.
- A drawn software keyboard on iOS. The simulator here runs headless with a hardware keyboard attached, so the XCUITest keyboard checks pass with no keyboard on screen, before and after this change. iOS keyboard lifting was only seen by sending React Native's own keyboard events by hand in a temporary build: `Modal` and `Sheet` rose, moved through a mid-flight frame, and returned. Try this on an iPhone or with Simulator.app.
- Lighthouse scores.
- An npm publish. `npm publish --dry-run` passes for both scoped tarballs. A dry run cannot catch a name rejection, which is what stopped the first release under the name `ferrule`. Scoped names are not checked for similarity in the same way, but only a real publish proves it.
- `.github/workflows/release.yml`. actionlint passes and the decision logic is tested, but a workflow is only proven when it runs on GitHub. That includes provenance on a tarball, trusted publishing with no token, and the Pages gate.

## Skipped, and risks

- The Android host view change removes clipping from every `@leoanimesh/ferrule-native` view, not only the FAB. Native flows pass and no other baseline moved beyond those listed, and the Pixel 8a run showed nothing clipped or overflowing.
- Stepper on web has a different role now, so tests written against `role="slider"` will break. All behaviour changes are in `docs/gaps.md` and `CHANGELOG.md`.
- The `exports` map breaks deep imports. Nothing in the repo used one, but a copied file edited by hand might.
