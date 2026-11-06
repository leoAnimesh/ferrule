---
name: ferrule-test-example
description: Test a Ferrule component through the example app on iOS simulator, Android emulator and web, and report what was verified. Use whenever a component, theme or native view changed, when someone asks to run or check the harness, take screenshots, open a component by deep link, run pnpm screens, update baselines, or claim something works on a platform.
---

# Testing through the example app

`apps/example` is a catalog of every component: a searchable list, and a detail screen per component with all its variants and states.

## Start it

```sh
pnpm build                                  # the harness imports packages/ferrule/lib
pnpm --filter ferrule-example sync          # copies registry changes into the harness
cd apps/example && npx expo start --port 8090
```

Install the app once, and again after any native change:

```sh
pnpm --filter ferrule-example ios
pnpm --filter ferrule-example android
```

Web is at `http://localhost:8090`. Newer Xcode shows simulators in Device Hub rather than Simulator.app; `xcrun simctl` works either way. On Android, point the device at Metro with `adb reverse tcp:8090 tcp:8090`. Android 16 and later also needs `adb shell pm grant dev.ferrule.harness android.permission.ACCESS_LOCAL_NETWORK`, or the app sits on a permission prompt.

## Open any component directly

The same parameters work everywhere:

| Parameter | Values |
| --- | --- |
| `component` | A catalog id: `button`, `swipe-row`, `native-slider`. Omit it for the list |
| `palette` | A palette name, or `custom` |
| `mode` | `light`, `dark` |
| `native` | `1`, `0`. `0` matches an app without `ferrule-native` |
| `dir` | `rtl`, `ltr`. Restarts the app on iOS and Android |
| `text` | `1`, `1.5`, `2`. Scales the type tokens |
| `only` | One native section, by the id passed to `NativeSection` |

```sh
open "http://localhost:8090/?component=button&mode=dark"
xcrun simctl openurl booted "dev.ferrule.harness://?component=button&mode=dark"
adb shell am start -a android.intent.action.VIEW -d "'dev.ferrule.harness://?component=button&mode=dark'" dev.ferrule.harness
```

An unknown `component` shows the list. If a component you just added does not open, the running app has an older bundle: force-stop and relaunch it.

Each is also a control under Test controls in the app. The `text` control scales tokens only, so also try the OS text size setting to test real Dynamic Type or font scale. Native sections carry a badge saying "Native view", "Fallback on <platform>" or "Ferrule, native off". Read it, because a fallback looks plausible.

## Automated checks

From the repo root:

```sh
pnpm test                # CLI, component, catalog and pack tests
pnpm typecheck
pnpm check               # primitives, raw colors, Reanimated setup
pnpm check:pack          # what each package would ship
```

On a device, with Metro running, from `apps/example`:

```sh
bash e2e/ios/run.sh <simulator-udid> <screenshot-dir>
bash e2e/ios/run.sh <simulator-udid> <screenshot-dir> -only-testing:FerruleHarnessUITests/FerruleHarnessUITests/testButton
python3 e2e/android/flow.py <screenshot-dir>      # after a fresh launch
python3 e2e/android/native.py <screenshot-dir>
```

`uiautomator` cannot dump a screen that animates forever, such as one with a spinner, so Android flows only photograph those screens.

## Screenshots

```sh
pnpm screens                      # every platform, catalog and each component, light and dark
pnpm screens web --only=button    # one component
```

A new screen fails with `no baseline` until you add one. Baselines are tied to one device and OS, recorded in `e2e/screens/baselines/<platform>/meta.json`. When a shot fails, look at the actual and diff images in `e2e/screens/out/`. Only then, if the change is intended, run `pnpm screens <platform> --update`, and look at the new images before keeping them. Updating without looking turns a bug into the expected result.

## Cross-platform sizes

Open `?component=metrics` on each platform, save each log with its `FERRULE_METRICS` line, then run `node scripts/compare-metrics.mjs ios.log android.log web.log`.

## What to report

Say, per platform, what you saw run, and how: scripted, or opened and looked at. Name the OS version. A passing typecheck says nothing about a platform.

- Simulators and emulators are not real devices. Say that real devices were not tested.
- Automated runs do not exercise live VoiceOver or TalkBack. The accessibility tree is a check of the tree, not of the experience.
- A native view you only saw fall back has not been verified.
- Ferrule targets iOS, Android and web. Other platforms are out of scope.
