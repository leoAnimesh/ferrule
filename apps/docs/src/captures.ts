export const REPO = 'https://github.com/leoAnimesh/ferrule';

export interface Media {
  /** Under public/media, without the extension. A video has .mp4 and .jpg; a still has .jpg. */
  file: string;
  kind: 'video' | 'still';
  platform: string;
  caption: string;
  /** Component pages that show it. */
  on: string[];
}

export const IOS = 'iOS 26.5 simulator, iPhone 17 Pro Max';
export const ANDROID = 'Android API 37 emulator';

export const MEDIA: Media[] = [
  { file: 'ios-glass', kind: 'video', platform: IOS, caption: 'Liquid Glass over shapes moving behind it, with real React children inside. Light theme.', on: ['card'] },
  { file: 'ios-glass-dark', kind: 'video', platform: IOS, caption: 'The same glass container in the dark theme.', on: ['card'] },
  { file: 'ios-reprint', kind: 'video', platform: IOS, caption: 'Glass icon buttons as the palette changes. The solid and danger fills follow the theme.', on: ['button'] },
  { file: 'android-sheet', kind: 'video', platform: ANDROID, caption: 'Material ModalBottomSheet from Sheet with nativeActions, opened and answered with real taps.', on: ['sheet'] },
  { file: 'android-tabbar', kind: 'video', platform: ANDROID, caption: 'Material NavigationBar: tabs tapped, then a palette change.', on: ['tabbar'] },
  { file: 'android-switch-video', kind: 'video', platform: ANDROID, caption: 'Material Switch, tapped on and off.', on: ['switch'] },
  { file: 'android-slider-video', kind: 'video', platform: ANDROID, caption: 'NativeSlider: Material Slider, dragged both ways.', on: [] },
  { file: 'android-menu-video', kind: 'video', platform: ANDROID, caption: 'NativeMenu: Material DropdownMenu, opened and an item picked.', on: [] },
  { file: 'android-date-video', kind: 'video', platform: ANDROID, caption: 'NativeDatePicker: Material date dialog, a day picked and confirmed.', on: [] },
  { file: 'android-button-video', kind: 'video', platform: ANDROID, caption: 'Native Button, Material 3, pressed.', on: ['button'] },
  { file: 'android-segmented-video', kind: 'video', platform: ANDROID, caption: 'Material segmented buttons, tapped.', on: ['segmented'] },
  { file: 'ios-button', kind: 'still', platform: IOS, caption: 'Native Button.', on: ['button'] },
  { file: 'android-button', kind: 'still', platform: ANDROID, caption: 'Native Button, Material 3.', on: ['button'] },
  { file: 'ios-icon-button', kind: 'still', platform: IOS, caption: 'Native IconButton in Liquid Glass. Android has no native IconButton yet, so it stays the Ferrule one.', on: ['button'] },
  { file: 'ios-input', kind: 'still', platform: IOS, caption: 'Native text field, typed into.', on: ['input'] },
  { file: 'android-input', kind: 'still', platform: ANDROID, caption: 'OutlinedTextField.', on: ['input'] },
  { file: 'ios-switch', kind: 'still', platform: IOS, caption: 'SwiftUI Toggle.', on: ['switch'] },
  { file: 'android-switch', kind: 'still', platform: ANDROID, caption: 'Material Switch in a toggleable row.', on: ['switch'] },
  { file: 'android-checkbox', kind: 'still', platform: ANDROID, caption: "Material Checkbox. iOS has no such control, so Ferrule's stays.", on: ['checkbox'] },
  { file: 'ios-chip', kind: 'still', platform: IOS, caption: 'iOS has no chip control: a small capsule glass button.', on: ['chip'] },
  { file: 'android-chip', kind: 'still', platform: ANDROID, caption: 'Material FilterChip.', on: ['chip'] },
  { file: 'ios-segmented', kind: 'still', platform: IOS, caption: 'SwiftUI segmented Picker.', on: ['segmented'] },
  { file: 'android-segmented', kind: 'still', platform: ANDROID, caption: 'Material segmented buttons.', on: ['segmented'] },
  { file: 'ios-tabbar', kind: 'still', platform: IOS, caption: 'A real UITabBar with no Ferrule styling. It paints no glass material here.', on: ['tabbar'] },
  { file: 'ios-progress', kind: 'still', platform: IOS, caption: "SwiftUI ProgressView, from Spinner's native variant.", on: ['spinner'] },
  { file: 'android-progress', kind: 'still', platform: ANDROID, caption: 'Material progress indicators.', on: ['spinner'] },
  { file: 'ios-alert', kind: 'still', platform: IOS, caption: 'UIAlertController, from Modal with nativeActions.', on: ['modal'] },
  { file: 'android-alert', kind: 'still', platform: ANDROID, caption: 'Material AlertDialog, from Modal with nativeActions.', on: ['modal'] },
  { file: 'ios-sheet', kind: 'still', platform: IOS, caption: 'SwiftUI sheet with detents, from Sheet with nativeActions.', on: ['sheet'] },
  { file: 'ios-slider', kind: 'still', platform: IOS, caption: 'NativeSlider: SwiftUI Slider.', on: [] },
  { file: 'android-slider', kind: 'still', platform: ANDROID, caption: 'NativeSlider: Material Slider.', on: [] },
  { file: 'ios-picker', kind: 'still', platform: IOS, caption: 'NativePicker: SwiftUI menu Picker, closed.', on: [] },
  { file: 'android-picker', kind: 'still', platform: ANDROID, caption: 'NativePicker: Material dropdown, open.', on: [] },
  { file: 'ios-menu', kind: 'still', platform: IOS, caption: 'NativeMenu, open.', on: [] },
  { file: 'android-menu', kind: 'still', platform: ANDROID, caption: 'NativeMenu: Material DropdownMenu, open.', on: [] },
  { file: 'ios-date', kind: 'still', platform: IOS, caption: 'NativeDatePicker: compact DatePicker.', on: [] },
  { file: 'android-date', kind: 'still', platform: ANDROID, caption: 'NativeDatePicker: closed field.', on: [] },
  { file: 'ios-actionsheet', kind: 'still', platform: IOS, caption: 'NativeActionSheet.', on: [] },
  { file: 'android-actionsheet', kind: 'still', platform: ANDROID, caption: 'NativeActionSheet: Material ModalBottomSheet.', on: [] },
  { file: 'ios-topbar', kind: 'still', platform: IOS, caption: 'NativeTopBar: UINavigationBar.', on: [] },
  { file: 'android-topbar', kind: 'still', platform: ANDROID, caption: 'NativeTopBar: Material TopAppBar.', on: [] },
  { file: 'ios-search', kind: 'still', platform: IOS, caption: 'NativeSearchBar: UISearchBar.', on: [] },
  { file: 'android-search', kind: 'still', platform: ANDROID, caption: 'NativeSearchBar: Material SearchBar, collapsed.', on: [] },
  { file: 'ios-list', kind: 'still', platform: IOS, caption: 'NativeList: SwiftUI inset grouped List.', on: [] },
  { file: 'android-list', kind: 'still', platform: ANDROID, caption: 'NativeList: Material ListItem rows.', on: [] },
  { file: 'ios-fab', kind: 'still', platform: IOS, caption: 'NativeFab: iOS has no FAB, so a large glass button.', on: [] },
];

/** The landing page's picks, in reading order. iOS and Android alternate, so each column of the masonry holds both. */
export const LANDING = ['ios-glass', 'android-date-video', 'ios-menu', 'android-switch-video', 'ios-reprint', 'android-sheet', 'ios-list', 'android-slider-video', 'ios-sheet', 'android-menu-video', 'android-tabbar'];
