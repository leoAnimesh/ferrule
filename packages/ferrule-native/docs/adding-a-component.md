# Adding a component

Every view has the same shape, so a new one is mechanical. Fabric is reached through codegen, and SwiftUI or Compose through one shared host on each platform:

- `ios/FerruleHost.swift`: `FerruleHost` (the config and `send`) and `FerruleHostingView` (a `UIHostingController` that measures and reports size).
- `ios/FerruleViews.mm`: `FERRULE_HOST_VIEW(Name)` generates the Fabric component view.
- `android/.../FerruleHostView.kt`: `FerruleHost` and a `ComposeView` host that measures and reports size.
- `src/host.tsx`: `NativeHost` serialises config, applies the measured size, parses events and picks the fallback.

For a view called `Rating`:

1. **Spec**: copy any `src/specs/Ferrule*ViewNativeComponent.ts` to `FerruleRatingViewNativeComponent.ts` and change the name in the last line. Add it to `src/nativeSpecs.ts`.
2. **`package.json`**: add `"FerruleRatingView": "FerruleRatingViewComponentView"` to `codegenConfig.ios.componentProvider`.
3. **iOS**: add `FERRULE_HOST_VIEW(FerruleRatingView)` to `ios/FerruleViews.mm`, a `case` to `ios/FerruleViews.swift`, and `ios/views/FerruleRatingContent.swift`:
   ```swift
   @available(iOS 17.0, *)
   struct FerruleRatingContent: View {
     @ObservedObject var host: FerruleHost
     var body: some View { /* read host.double("value"); write through host.binding("value", default: 0.0) */ }
   }
   ```
4. **Android**: add the manager block to `FerruleManagers.kt`, register it in `FerruleNativePackage.kt`, and add `@Composable fun FerruleRatingContent(host: FerruleHost)` to `views/FerruleContents.kt`.
5. **JS**: add the wrapper to `src/components.tsx` with `host('FerruleRatingView', { ...base(rest), config: {...}, on: { change: ... } })`.
6. **Harness**: wrap the demo in `NativeSection` in `apps/example/src/demos/`, and export it as `NativeDemo`, or add a catalog entry for a native-only view. Then `pod install` and rebuild both platforms.

Rules: events carry one JSON value. A view with no native counterpart on one platform gets `excludedPlatforms` in its spec, and `platforms` in its wrapper. A control's value changes optimistically on the native side (`host.binding`, `host.change`) and is corrected by the next config. Anything that presents itself takes `headless: true`.

Views that hold React children cannot go through the SwiftUI host, because Fabric must mount the children. `FerruleGlassViewComponentView.mm` shows that form.

## Sizing

`NativeHost` waits for the native side to report the size it wants, then gives that to Yoga through `style`, and shows the view after that. The first frame is hidden, so nothing visibly jumps, but the size arrives one JS round trip late.

shortcut: sized by event rather than a C++ shadow node, so the height lags by one frame and is unknown in the first layout pass. Write a custom shadow node if a screen needs synchronous layout.
