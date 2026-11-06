# ferrule-native

Optional native controls for [Ferrule](https://github.com/leoAnimesh/ferrule). SwiftUI and UIKit on iOS, Jetpack Compose and Material 3 on Android, exposed as Fabric components. This package holds the only native code in the project: core `ferrule` stays JS-only, and works the same when this package is absent.

## Install

Not on npm yet. Install `ferrule` first, then this package from the same [GitHub release](https://github.com/leoAnimesh/ferrule/releases/latest):

```sh
npm install https://github.com/leoAnimesh/ferrule/releases/download/v0.1.0/ferrule-native-0.1.0.tgz
npx pod-install   # iOS
```

Rebuild the app, then import the package once, near your app's root:

```ts
import 'ferrule-native';
```

Importing it lets `native` props on Ferrule components resolve.

| Requirement | Value |
| --- | --- |
| React Native | 0.86 or newer, New Architecture |
| iOS | Deployment target unchanged. Hosted controls render from iOS 17, Liquid Glass from iOS 26. Below that, you get the Ferrule component |
| Xcode | With the iOS 26 SDK or newer, to compile Liquid Glass |
| Android | minSdk 24, compileSdk 36 or newer. Kotlin 2.x. Adds the Compose runtime and Material 3 1.4 (from Compose BOM 2026.09.00) to your app, plus the Compose Compiler Gradle plugin |
| Expo | Supported in a development build (`npx expo prebuild` or EAS). **Expo Go cannot load it**: the Ferrule components render instead, with a dev warning |

## Use it on an existing component

```tsx
<Button native variant="soft" onPress={save}>Save</Button>
<Switch native label="Wi-Fi" checked={on} onCheckedChange={setOn} />
<Input native label="Email" value={email} onChangeText={setEmail} />
<Card native>...</Card>                                   {/* Liquid Glass on iOS 26+, holding React children */}
<Modal native open={open} onOpenChange={setOpen} title="Delete?" nativeActions={[{ label: 'Cancel', role: 'cancel' }, { label: 'Delete', role: 'destructive', onPress: remove }]}>
  ...                                                     {/* used only where the system alert cannot render */}
</Modal>
```

`<FerruleProvider native>` sets the default for everything inside it, and `native={false}` turns one component back. Without either, nothing changes.

When a native view cannot render, the existing Ferrule component does: on web, in a binary without this package, below the OS versions above, and for props a system control cannot show (`Button` with `start`, `end` or non-text children; `Input` with `start` or `end`; `Checkbox` with `error` or `indeterminate`; `Checkbox` on iOS, which has no native one; `Card` with `onPress`; `Modal` and `Sheet` without `nativeActions`).

## Native-only components

`NativeButton`, `NativeToggle`, `NativeCheckbox`, `NativeSlider`, `NativeSegmented`, `NativePicker`, `NativeMenu`, `NativeDatePicker`, `NativeProgress`, `NativeTextField`, `NativeAlert`, `NativeActionSheet`, `NativeTabBar`, `NativeTopBar`, `NativeSearchBar`, `NativeList`, `NativeChip`, `NativeFab`, `NativeGlass`.

Props are the same on both platforms. The one platform split is icons: `icon={{ ios: 'house.fill', android: 'Home' }}`, an SF Symbol name and a Material icon name. Every one takes `fallback`, rendered where the native view cannot be. Ferrule has no slider or picker of its own, so without a `fallback` these render nothing on web.

[Coverage table](docs/coverage.md) · [Adding a component](docs/adding-a-component.md)

## Theming, and where the system wins

Palette tokens reach the native side as: the SwiftUI tint and light or dark interface style on iOS, and a Material `ColorScheme` built from Ferrule's tokens on Android.

Known differences, on purpose:

- **iOS**: only the tint is brandable. Glass, fonts, shape, spacing, and the alert and sheet surfaces are the system's. Disabled and loading states use system colours. The theme's fonts apply where the OS allows, and [the coverage table](docs/coverage.md#fonts) lists which controls cannot take them.
- **Android**: colours follow the palette, but Material 3 sets shape, type and motion. Dynamic colour is not used, because the brand palette takes its place. Tertiary roles stay Material's default, seen in the time picker's AM/PM chip.
- **Liquid Glass** tints with what is behind it, so the same token looks different over different content.
- **Material 3 Expressive** is not used. Its APIs are not in stable Material 3 (1.4.0 is what BOM 2026.09.00 resolves to), so these are stable Material 3 components.

Native variants are deliberately not pixel-consistent across platforms. They are excluded from `scripts/compare-metrics.mjs`: the metrics screen sets `native={false}`.

## Native dependencies

No third-party native UI wrapper. iOS: SwiftUI, UIKit, React Native. Android: `androidx.compose` (`ui`, `material3`, `material-icons-core`, through the BOM), `androidx.activity:activity-compose`, `react-android`.
