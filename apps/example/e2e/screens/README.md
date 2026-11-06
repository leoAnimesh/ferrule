# Screen regression check

The check opens the catalog and every component's detail screen in `src/catalog.ts`, so a new component is covered as soon as it has a catalog entry.

```sh
pnpm screens                          # every platform
pnpm screens ios web                  # some of them
pnpm screens web --only=button,card   # some screens
pnpm screens android --update         # accept the current look as the new baseline
```

It opens each screen in light and dark, waits for the picture to settle, shrinks it to at most 440px wide, and compares it with `e2e/screens/baselines/<platform>/`. A screen fails when more than 0.5% of its pixels changed. The exit code is 0 on pass and 1 on a failure. Actual and diff images (changes in red) go to `e2e/screens/out/`, which is git-ignored.

**Before running:** the app must be installed on a booted simulator or a running emulator (`pnpm --filter ferrule-example ios`, `android`). Metro is started on port 8090 if it is not already running. Web needs Chrome, or `CHROME=<path>`. With several booted simulators, pick one with `FERRULE_IOS_UDID`.

**Baselines are tied to one device and OS.** `baselines/<platform>/meta.json` records which. Rendering differs between devices and OS versions, so on anything else the check fails and says so, rather than reporting false differences. Rebaseline with `--update`, and read the new images before keeping them.

The status bar area is not compared on iOS and Android, because it holds the clock.

Real taps are in the e2e suites: `e2e/ios/FerruleHarnessUITests.swift`, `e2e/android/flow.py` and `e2e/android/native.py`.

To open a screen by hand: `dev.ferrule.harness://?component=button&mode=dark` on a device, `http://localhost:8090/?component=button&mode=dark` on web. Add `native=0` to run with no native variants, the same as having no `ferrule-native`.
