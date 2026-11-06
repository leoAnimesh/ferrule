import type { ComponentType } from 'react';
import { registerNativeVariants, type NativeVariant } from 'ferrule';
import { NativeAlert, NativeActionSheet, NativeButton, NativeCheckbox, NativeChip, NativeGlass, NativeIconButton, NativeProgress, NativeSegmented, NativeTabBar, NativeTextField, NativeToggle } from './components';
import { hasLiquidGlass, pickHost } from './host';
import { specs } from './nativeSpecs';

export * from './components';
export { hasLiquidGlass, isLinked } from './host';

const variant = (Component: unknown, isAvailable: () => boolean): NativeVariant => ({ Component: Component as ComponentType<never>, isAvailable });
const linked = (name: keyof typeof specs, platforms?: readonly string[]) => () => pickHost(specs[name], name, platforms);

registerNativeVariants({
  button: variant(NativeButton, linked('FerruleButtonView')),
  iconButton: variant(NativeIconButton, linked('FerruleButtonView', ['ios'])),
  switch: variant(NativeToggle, linked('FerruleToggleView')),
  checkbox: variant(NativeCheckbox, linked('FerruleCheckboxView', ['android'])),
  input: variant(NativeTextField, linked('FerruleTextFieldView')),
  spinner: variant(NativeProgress, linked('FerruleProgressView')),
  card: variant(NativeGlass, () => hasLiquidGlass() && linked('FerruleGlassView')()),
  modal: variant(NativeAlert, linked('FerruleAlertView')),
  sheet: variant(NativeActionSheet, linked('FerruleActionSheetView')),
  chip: variant(NativeChip, linked('FerruleChipView')),
  segmented: variant(NativeSegmented, linked('FerruleSegmentedView')),
  tabbar: variant(NativeTabBar, linked('FerruleTabBarView')),
});
