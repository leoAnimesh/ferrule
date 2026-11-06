# Native coverage

Current native UI components in Apple's SDK (iOS 26.5 runtime, Xcode 27.2 SDK) and Google's Material 3 for Compose (material3 1.4.0, the version Compose BOM 2026.09.00 resolves to), and what `ferrule-native` does with each. Full coverage is a goal, not the current state.

- **Built and run**: rendered on the iOS 26.5 simulator or API 37 emulator, with interaction checked by the scripted flows where the table says so.
- **Rendered**: built and seen on screen, interaction not scripted.
- **Built, not run**: compiled, never seen.
- **Not built**: no view exists yet.
- **None**: the platform has no such control.

Web, a binary without this package, and iOS below 17 use the Ferrule component or `fallback`. iOS 17 to 25 is a compiled branch with the system style without glass, and has not been run: no simulator runtime below 26 is installed here.

## Built

| Component | Export (Ferrule `native` prop) | iOS implementation | iOS status | Android implementation | Android status |
| --- | --- | --- | --- | --- | --- |
| Button | `NativeButton` (`Button`) | SwiftUI `Button`, `.glass`, `.glassProminent` | Built and run: press event | M3 `Button`, `FilledTonalButton`, `OutlinedButton`, `TextButton` | Built and run: press event |
| Icon button | `NativeIconButton` (`IconButton`) | SwiftUI `Button`, `.glass`, `.glassProminent`, `.buttonBorderShape(.circle)`; `.bordered` on iOS 17 to 25 (not run, no runtime here) | Built and run: press event | Not built, see below | Not built |
| Glass container | `NativeGlass` (`Card`) | UIKit `UIVisualEffectView` with `UIGlassEffect`, holds React children | Built and run: glass seen over shapes | None. Themed surface | Fallback run |
| Toggle | `NativeToggle` (`Switch`) | SwiftUI `Toggle` | Built and run: change event | M3 `Switch` in a toggleable row | Built and run: change event |
| Checkbox | `NativeCheckbox` (`Checkbox`) | None. Ferrule's stays | Fallback run | M3 `Checkbox` in a toggleable row | Rendered |
| Slider | `NativeSlider` | SwiftUI `Slider` | Built and run: change event | M3 `Slider` | Built and run: change event |
| Segmented | `NativeSegmented` | SwiftUI `Picker` `.segmented` | Built and run: change event | M3 `SingleChoiceSegmentedButtonRow` | Built and run: change event |
| Picker | `NativePicker` | SwiftUI `Picker` `.menu` | Rendered | M3 `ExposedDropdownMenuBox` | Built and run: opens |
| Menu | `NativeMenu` | SwiftUI `Menu` | Built and run: select event | M3 `DropdownMenu` | Built and run: select event |
| Date picker | `NativeDatePicker` | SwiftUI `DatePicker` `.compact` | Rendered | M3 `DatePickerDialog` | Rendered: dialog opened, a day picked and confirmed once by a script, not in the e2e suite |
| Time picker | `NativeDatePicker mode="time"` | SwiftUI `DatePicker` `.compact` | Rendered | M3 `TimePicker` in `AlertDialog` | Rendered: dialog opened by hand, selection not scripted |
| Progress | `NativeProgress` (`Spinner`) | SwiftUI `ProgressView` | Rendered | M3 `LinearProgressIndicator`, `CircularProgressIndicator` | Rendered |
| Text field | `NativeTextField` (`Input`) | SwiftUI `TextField`, `SecureField` | Built and run: typing | M3 `OutlinedTextField` | Built and run: typing |
| Alert | `NativeAlert` (`Modal` with `nativeActions`) | UIKit `UIAlertController` | Built and run: action | M3 `AlertDialog` | Built and run: action |
| Sheet | `NativeActionSheet` (`Sheet` with `nativeActions`) | SwiftUI `.sheet` with detents. Actions only, no React children | Built and run: action | M3 `ModalBottomSheet`. Actions only, no React children | Built and run: action |
| Tab bar | `NativeTabBar` | UIKit `UITabBar` | Built and run: change event | M3 `NavigationBar` | Built and run: change event |
| Top bar | `NativeTopBar` | UIKit `UINavigationBar` | Built and run: action event | M3 `TopAppBar` | Built and run: action event |
| Search bar | `NativeSearchBar` | UIKit `UISearchBar` | Rendered | M3 `SearchBar`, collapsed only | Rendered |
| List | `NativeList` | SwiftUI `List` `.insetGrouped` | Built and run: row press | M3 `ListItem` in `LazyColumn` | Built and run: row press |
| Chip | `NativeChip` | None in iOS. Small capsule glass button | Rendered | M3 `FilterChip` | Rendered |
| FAB | `NativeFab` | None in iOS. Large circular glass button | Built and run: press | M3 `FloatingActionButton`, `ExtendedFloatingActionButton` | Built and run: press |
| Navigation bar | `NativeTabBar` on Android, `NativeTopBar` on iOS | See above | See above | See above | See above |

## Icons

Ferrule's own components draw Feather icons through `Icon`. A native control cannot show those, because it draws its own icon from a system set, so these stay on SF Symbols on iOS and Material icons on Android, named per platform with `nativeIcon` or `icon`:

| Control | iOS | Android |
| --- | --- | --- |
| `IconButton`, `NativeIconButton` | SF Symbol | Stays the Ferrule button, so Feather |
| `TabBar` with `native`, `NativeTabBar` | SF Symbol | Material icon |
| `NativeTopBar` actions | SF Symbol | Material icon |
| `NativeFab` | SF Symbol | Material icon |
| `NativeMenu` items, `NativeChip` | SF Symbol | Material icon |
| `NativeSearchBar` | System magnifier | Material icon |
| `NativeList` chevrons, date and picker affordances | Drawn by the OS | Drawn by the OS |

So a screen mixing a native variant with Ferrule components mixes two icon styles.

## Fonts

The theme's `tokens.fontFamily` reaches native controls by default. With no custom font in the theme they are unchanged.

| Control | iOS | Android |
| --- | --- | --- |
| Button, chip, FAB, text field and its label, toggle label, list rows | Theme font | Theme font |
| Top bar | Title, through `UINavigationBar` | Theme font |
| Action sheet | Message and actions. The title stays on the system font | Theme font |
| Picker | Label only. The value and options are drawn by the OS | Theme font, options not looked at |
| Menu | Label only. Items are drawn by the OS | Label, items not looked at |
| Date picker | Label only. The value and calendar are drawn by the OS | Label and value, dialog not looked at |
| Segmented control | System font: SwiftUI's segmented `Picker` ignores `.font`, and the only other way is a global `UIAppearance` | Theme font |
| Alert | System font: `UIAlertController` has no font API | Theme font: Material's dialog is drawn by Compose |
| Tab bar | System font, left at the OS default by decision | Theme font, from Material's type scale |

## Not built

| Component | iOS | Android |
| --- | --- | --- |
| Toolbar, bottom app bar | SwiftUI `.toolbar`, `UIToolbar` | M3 `BottomAppBar` |
| Navigation rail, drawer | `NavigationSplitView` | M3 `NavigationRail`, `ModalNavigationDrawer` |
| Tab view with content, navigation stack | `TabView`, `NavigationStack` | None as one control |
| Sheet or dialog holding React children | `.sheet`, `UIPopoverPresentationController` | `ModalBottomSheet`, `Dialog` |
| Stepper | `Stepper` | None |
| Color picker | `ColorPicker` | None |
| Gauge | `Gauge` | None |
| Disclosure, accordion | `DisclosureGroup` | None |
| Share sheet | `ShareLink` | System intent, not a Material component |
| Snackbar | None | M3 `Snackbar` |
| Badge | None | M3 `Badge` |
| Tooltip | `.help`, `TipKit` | M3 `TooltipBox` |
| Range slider | None | M3 `RangeSlider` |
| Radio button | None | M3 `RadioButton` |
| Split button | None | Not in stable 1.4 |
| Android icon button | `IconButton` with `native` stays the Ferrule one on Android | M3 `IconButton` |
| Pull to refresh | Available through React Native's `RefreshControl` | Available through React Native's `RefreshControl` |
| Inline and wheel date picker styles | `DatePicker` `.graphical`, `.wheel` | M3 `DatePicker` inline |
| Material 3 Expressive: `LoadingIndicator`, button groups, FAB menu, floating toolbar | None | Not in stable Material 3 1.4.0. Reassess when a stable BOM includes them |
| `Label`, `GroupBox`, `Form`, `Section`, `Grid`, `Canvas`, `Map`, `VideoPlayer` | Exist. Not controls Ferrule wraps today | None |
| `Card`, `HorizontalDivider`, `Scaffold` | None | Exist. Ferrule's `Card` and `Divider` cover them |
