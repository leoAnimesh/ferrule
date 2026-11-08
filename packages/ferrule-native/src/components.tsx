import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState, useTheme } from '@leoanimesh/ferrule';
import { hasLiquidGlass, NativeHost, pickHost, type HostProps, type HostSpec } from './host';
import { specs } from './nativeSpecs';

export interface NativeBaseProps {
  /** Rendered where the native view cannot be: web, another platform, or a binary without this package. */
  fallback?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Screen reader name, for controls with no visible label. */
  a11yLabel?: string;
}
export interface NativeOption { value: string; label: string; /** Per-platform icon names: SF Symbols, Material icon names. */ icon?: NativeIcon }
export interface NativeIcon { ios?: string; android?: string }
const icon = (value?: NativeIcon) => (Platform.OS === 'ios' ? value?.ios : value?.android);
const withIcons = (options: readonly NativeOption[]) => options.map((option) => ({ ...option, icon: icon(option.icon) }));
const host = (name: keyof typeof specs, props: Omit<HostProps, 'spec' | 'name'>) => (
  <NativeHost spec={specs[name] as HostSpec | undefined} name={name} {...props} />
);
const base = ({ fallback, style, testID, a11yLabel }: NativeBaseProps) => ({ fallback, style, testID, a11yLabel });

export interface NativeButtonProps extends NativeBaseProps {
  label: string;
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: NativeIcon;
  onPress?: () => void;
}
export const NativeButton = ({ label, variant = 'solid', size = 'md', loading, disabled, fullWidth, icon: glyph, onPress, ...rest }: NativeButtonProps) =>
  host('FerruleButtonView', { ...base(rest), fill: fullWidth, config: { label, variant, size, loading, disabled, icon: icon(glyph) }, on: { press: () => onPress?.() } });

export interface NativeIconButtonProps extends NativeBaseProps {
  icon: NativeIcon;
  a11yLabel: string;
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'danger';
  /** The circle's diameter. */
  side?: number;
  disabled?: boolean;
  onPress?: () => void;
}
/** iOS only for now, because Android's Material `IconButton` is not built. A ghost icon alone would have no glass, so it gets the same glass as `soft`. */
export const NativeIconButton = ({ icon: glyph, variant = 'solid', side, disabled, onPress, ...rest }: NativeIconButtonProps) =>
  host('FerruleButtonView', { ...base(rest), platforms: ['ios'], config: { icon: icon(glyph), variant: variant === 'ghost' ? 'soft' : variant, side, disabled }, on: { press: () => onPress?.() } });

export interface NativeToggleProps extends NativeBaseProps {
  label?: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}
export function NativeToggle({ label, description, checked, defaultChecked = false, onCheckedChange, disabled, ...rest }: NativeToggleProps) {
  const [value, setValue] = useControllableState(checked, defaultChecked, onCheckedChange);
  return host('FerruleToggleView', { ...base(rest), fill: true, config: { label, description, value, disabled }, on: { change: setValue } });
}

/** Android only: iOS has no native checkbox, so the Ferrule one stays there. */
export function NativeCheckbox({ label, description, checked, defaultChecked = false, onCheckedChange, disabled, ...rest }: NativeToggleProps) {
  const [value, setValue] = useControllableState(checked, defaultChecked, onCheckedChange);
  return host('FerruleCheckboxView', { ...base(rest), fill: true, platforms: ['android'], config: { label, description, value, disabled }, on: { change: setValue } });
}

export interface NativeSliderProps extends NativeBaseProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
}
export function NativeSlider({ value, defaultValue = 0, min = 0, max = 1, step, disabled, onValueChange, onSlidingComplete, ...rest }: NativeSliderProps) {
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  return host('FerruleSliderView', { ...base(rest), fill: true, config: { value: current, min, max, step, disabled }, on: { change: setCurrent, end: (v: number) => onSlidingComplete?.(v) } });
}

export interface NativeSelectProps extends NativeBaseProps {
  options: readonly NativeOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
}
export function NativeSegmented({ options, value, defaultValue, onValueChange, label, disabled, ...rest }: NativeSelectProps) {
  const [current, setCurrent] = useControllableState(value, defaultValue ?? options[0]?.value ?? '', onValueChange);
  return host('FerruleSegmentedView', { ...base(rest), fill: true, config: { options: withIcons(options), value: current, label, disabled }, on: { change: setCurrent } });
}
export function NativePicker({ options, value, defaultValue, onValueChange, label, disabled, ...rest }: NativeSelectProps) {
  const [current, setCurrent] = useControllableState(value, defaultValue ?? options[0]?.value ?? '', onValueChange);
  return host('FerrulePickerView', { ...base(rest), fill: true, config: { options: withIcons(options), value: current, label, disabled }, on: { change: setCurrent } });
}

export interface NativeMenuProps extends NativeBaseProps {
  label: string;
  items: readonly (NativeOption & { destructive?: boolean; disabled?: boolean })[];
  onSelect?: (value: string) => void;
}
export const NativeMenu = ({ label, items, onSelect, ...rest }: NativeMenuProps) =>
  host('FerruleMenuView', { ...base(rest), config: { label, items: items.map((item) => ({ ...item, icon: icon(item.icon) })) }, on: { select: (v: string) => onSelect?.(v) } });

export interface NativeDatePickerProps extends NativeBaseProps {
  label?: string;
  value?: Date;
  defaultValue?: Date;
  mode?: 'date' | 'time';
  onValueChange?: (value: Date) => void;
  disabled?: boolean;
}
export function NativeDatePicker({ label, value, defaultValue, mode = 'date', onValueChange, disabled, ...rest }: NativeDatePickerProps) {
  const [current, setCurrent] = useControllableState(value, defaultValue ?? new Date(), onValueChange);
  return host('FerruleDatePickerView', { ...base(rest), fill: true, config: { label, millis: current.getTime(), mode, disabled }, on: { change: (millis: number) => setCurrent(new Date(millis)) } });
}

export interface NativeProgressProps extends NativeBaseProps {
  kind?: 'linear' | 'circular';
  /** 0 to 1. Leave it out for an indeterminate indicator. */
  value?: number;
  size?: 'sm' | 'md' | 'lg';
}
export const NativeProgress = ({ kind = 'linear', value, size = 'md', ...rest }: NativeProgressProps) =>
  host('FerruleProgressView', { ...base(rest), fill: kind === 'linear', config: { kind, value, size } });

export interface NativeTextFieldProps extends NativeBaseProps {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: string;
}
export function NativeTextField({ label, helperText, error, placeholder, value, defaultValue = '', onChangeText, disabled, secureTextEntry, keyboardType, ...rest }: NativeTextFieldProps) {
  const [text, setText] = useControllableState(value, defaultValue, onChangeText);
  return host('FerruleTextFieldView', { ...base(rest), fill: true, config: { label, helperText, error, placeholder, value: text, disabled, secure: secureTextEntry, keyboard: keyboardType }, on: { change: setText } });
}

export interface NativeAction { label: string; role?: 'cancel' | 'destructive'; onPress?: () => void }
export interface NativeOverlayProps extends NativeBaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  message?: string;
  actions?: readonly NativeAction[];
}
const overlay = (name: 'FerruleAlertView' | 'FerruleActionSheetView', { open, onOpenChange, title, message, actions = [], ...rest }: NativeOverlayProps) =>
  host(name, {
    ...base(rest),
    headless: true,
    config: { open: open === true, title, message, actions: actions.map(({ label, role }) => ({ label, role })) },
    on: {
      action: (index: number) => {
        actions[index]?.onPress?.();
        onOpenChange?.(false);
      },
      dismiss: () => onOpenChange?.(false),
    },
  });
export const NativeAlert = (props: NativeOverlayProps) => overlay('FerruleAlertView', props);
export const NativeActionSheet = (props: NativeOverlayProps) => overlay('FerruleActionSheetView', props);

export const NativeTabBar = ({ options, value, defaultValue, onValueChange, ...rest }: NativeSelectProps) => {
  const [current, setCurrent] = useControllableState(value, defaultValue ?? options[0]?.value ?? '', onValueChange);
  return host('FerruleTabBarView', { ...base(rest), fill: true, config: { options: withIcons(options), value: current }, on: { change: setCurrent } });
};

export interface NativeTopBarProps extends NativeBaseProps {
  title: string;
  /** A leading back button when set. */
  onBack?: () => void;
  backLabel?: string;
  actions?: readonly NativeOption[];
  onAction?: (value: string) => void;
}
export const NativeTopBar = ({ title, onBack, backLabel = 'Back', actions = [], onAction, ...rest }: NativeTopBarProps) =>
  host('FerruleTopBarView', { ...base(rest), fill: true, config: { title, back: onBack ? backLabel : undefined, actions: withIcons(actions) }, on: { back: () => onBack?.(), action: (v: string) => onAction?.(v) } });

export interface NativeSearchBarProps extends NativeBaseProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
}
export function NativeSearchBar({ value, defaultValue = '', placeholder, onChangeText, onSubmit, ...rest }: NativeSearchBarProps) {
  const [text, setText] = useControllableState(value, defaultValue, onChangeText);
  return host('FerruleSearchBarView', { ...base(rest), fill: true, config: { value: text, placeholder }, on: { change: setText, submit: (v: string) => onSubmit?.(v) } });
}

export interface NativeListProps extends NativeBaseProps {
  /** For short, static rows of text. Use FlatList for data. */
  rows: readonly { id: string; title: string; subtitle?: string }[];
  /** The system list scrolls itself, so it needs a height. */
  height: number;
  onRowPress?: (id: string) => void;
}
export const NativeList = ({ rows, height, onRowPress, ...rest }: NativeListProps) =>
  host('FerruleListView', { ...base(rest), fill: true, height, config: { rows }, on: { press: (id: string) => onRowPress?.(id) } });

export interface NativeChipProps extends NativeBaseProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: NativeIcon;
  onPress?: () => void;
}
export const NativeChip = ({ label, selected, disabled, icon: glyph, onPress, ...rest }: NativeChipProps) =>
  host('FerruleChipView', { ...base(rest), config: { label, selected, disabled, icon: icon(glyph) }, on: { press: () => onPress?.() } });

export interface NativeFabProps extends NativeBaseProps {
  icon: NativeIcon;
  /** Extended FAB text. Also the screen reader name when set. */
  label?: string;
  onPress?: () => void;
}
export const NativeFab = ({ icon: glyph, label, onPress, ...rest }: NativeFabProps) =>
  host('FerruleFabView', { ...base(rest), config: { icon: icon(glyph), label }, on: { press: () => onPress?.() } });

export interface NativeGlassProps extends NativeBaseProps {
  children?: ReactNode;
  radius?: number;
  /** Responds to touch, as glass controls do. */
  interactive?: boolean;
  tint?: string;
}
/** Real UIGlassEffect, holding React children. On other platforms and below iOS 26: a plain themed surface. */
export function NativeGlass({ children, radius, interactive, tint, style, testID }: NativeGlassProps) {
  const { colors, tokens, mode } = useTheme();
  const corner = radius ?? tokens.radius.lg;
  const Spec = specs.FerruleGlassView as unknown as HostSpec | undefined;
  if (Spec && hasLiquidGlass() && pickHost(Spec, 'FerruleGlassView')) {
    const Glass = Spec as unknown as (props: { config: string; children?: ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) => ReactNode;
    return <Glass config={JSON.stringify({ radius: corner, interactive, tint, dark: mode === 'dark' })} style={style} testID={testID}>{children}</Glass>;
  }
  return <View style={[{ borderRadius: corner, backgroundColor: colors.surfaceMuted }, style]} testID={testID}>{children}</View>;
}
