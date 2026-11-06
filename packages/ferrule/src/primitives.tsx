import { forwardRef, useCallback, useEffect, useRef, useState, type ComponentRef, type ForwardRefExoticComponent, type ReactNode, type RefAttributes } from 'react';
import {
  I18nManager,
  Platform,
  Pressable as RNPressable,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  View,
  type GestureResponderEvent,
  type PressableProps as RNPressableProps,
  type StyleProp,
  type TextInputProps as RNTextInputProps,
  type TextProps as RNTextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useDirection, useTheme } from './context';
import { warnOnce } from './native';
import type { FontWeightToken } from './theme';

const IS_WEB = Platform.OS === 'web';

/** Maps a numeric weight to its token name so custom per-weight font families can be applied. */
function weightToken(weight: TextStyle['fontWeight']): FontWeightToken {
  const n = weight === 'bold' ? 700 : weight === 'normal' || weight === undefined ? 400 : Number(weight);
  if (n >= 700) return 'bold';
  if (n >= 600) return 'semibold';
  if (n >= 500) return 'medium';
  return 'regular';
}

// These pick their weight from fontWeight, so they keep it.
const ANDROID_SYSTEM_FAMILY = /^(sans-serif(-[a-z]+)*|serif(-monospace)?|monospace|cursive|casual|notoserif|normal|roboto|system-ui)$/i;

/** Resolves theme font families and strips platform text metrics that would make sizes differ. */
function useTextBase(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const { colors, tokens } = useTheme();
  const flat = StyleSheet.flatten(style) ?? {};
  const token = weightToken(flat.fontWeight);
  const family = tokens.fontFamily[token];
  if (__DEV__ && !family && !flat.fontFamily && Object.keys(tokens.fontFamily).length > 0) {
    warnOnce(`font-${token}`, `tokens.fontFamily has no \`${token}\` family, so this text uses the system font. Add one, or set fontFamily on the text.`);
  }
  // A custom family already encodes its weight. On Android, a bold weight on a font bundled as a native asset falls back to a system font.
  const strip = Platform.OS === 'android' && flat.fontFamily && !ANDROID_SYSTEM_FAMILY.test(flat.fontFamily);
  return [
    { color: colors.text, includeFontPadding: false },
    style,
    family && !flat.fontFamily ? { fontFamily: family, fontWeight: undefined } : strip ? { fontWeight: undefined } : null,
  ];
}

export type TextProps = RNTextProps;

/**
 * react-native-web defaults text to dir="auto", which aligns a Latin string left even in a right-to-left
 * layout. Native aligns to the layout direction, so web takes it from there too.
 */
function useWebDir(): object | null {
  const direction = useDirection();
  return IS_WEB ? { dir: direction } : null;
}

/** Text with theme color and font, no Android font padding, and bounded font scaling. */
export const Text: ForwardRefExoticComponent<TextProps & RefAttributes<ComponentRef<typeof RNText>>> = forwardRef<ComponentRef<typeof RNText>, TextProps>(function Text({ style, ...rest }, ref) {
  const { tokens } = useTheme();
  const webDir = useWebDir();
  return <RNText ref={ref} maxFontSizeMultiplier={tokens.maxFontScale} {...webDir} {...rest} style={useTextBase(style)} />;
});

export type TextInputProps = RNTextInputProps;

/** TextInput with the same metrics as Text, and no browser outline (focus is drawn by the theme). */
export const TextInput: ForwardRefExoticComponent<TextInputProps & RefAttributes<ComponentRef<typeof RNTextInput>>> = forwardRef<ComponentRef<typeof RNTextInput>, TextInputProps>(function TextInput(
  { style, ...rest },
  ref,
) {
  const { colors, mode, tokens } = useTheme();
  const base = useTextBase(style);
  const webDir = useWebDir();
  return (
    <RNTextInput
      ref={ref}
      keyboardAppearance={mode}
      {...webDir}
      maxFontSizeMultiplier={tokens.maxFontScale}
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.primary}
      underlineColorAndroid="transparent"
      {...rest}
      style={[styles.input, IS_WEB ? styles.webInput : null, base]}
    />
  );
});

export interface PressableState {
  pressed: boolean;
  hovered: boolean;
  /** True for keyboard or remote focus. On web, pointer focus does not count, matching :focus-visible. */
  focused: boolean;
  disabled: boolean;
}

export interface PressableProps extends Omit<RNPressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle> | ((state: PressableState) => StyleProp<ViewStyle>);
  children?: ReactNode | ((state: PressableState) => ReactNode);
}

const SPACE_ACTIVATED_ROLES = new Set(['checkbox', 'switch', 'radio', 'menuitemcheckbox']);

/**
 * Pressable with hover and focus state on every platform, and web keyboard behaviour that
 * react-native-web omits: Space activates checkbox and switch roles, not only buttons.
 */
export const Pressable: ForwardRefExoticComponent<PressableProps & RefAttributes<ComponentRef<typeof View>>> = forwardRef<ComponentRef<typeof View>, PressableProps>(function Pressable(
  { style, children, disabled, onHoverIn, onHoverOut, onFocus, onBlur, onPressIn, onPressOut, onPress, focusable, role, ...rest },
  ref,
) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled === true;

  // A control that becomes disabled mid-interaction must not stay visually pressed or focused.
  useEffect(() => {
    if (isDisabled) {
      setPressed(false);
      setHovered(false);
    }
  }, [isDisabled]);

  const inner = useRef<ComponentRef<typeof View> | null>(null);
  const setRefs = useCallback(
    (node: ComponentRef<typeof View> | null) => {
      inner.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const pressRef = useRef(onPress);
  pressRef.current = onPress;
  useEffect(() => {
    if (!IS_WEB || !role || !SPACE_ACTIVATED_ROLES.has(role)) return;
    const node = inner.current as unknown as HTMLElement | null;
    if (!node?.addEventListener) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' || event.target !== node || node.getAttribute('aria-disabled') === 'true') return;
      event.preventDefault(); // Otherwise Space scrolls the page.
      pressRef.current?.(event as unknown as GestureResponderEvent);
    };
    node.addEventListener('keydown', onKeyDown);
    return () => node.removeEventListener('keydown', onKeyDown);
  }, [role]);

  const state: PressableState = { pressed, hovered, focused, disabled: isDisabled };
  return (
    <RNPressable
      ref={setRefs}
      {...rest}
      role={role}
      disabled={isDisabled}
      focusable={focusable ?? !isDisabled}
      aria-disabled={isDisabled || undefined}
      onPress={onPress}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      onHoverIn={(e) => {
        setHovered(true);
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setHovered(false);
        onHoverOut?.(e);
      }}
      onFocus={(e) => {
        setFocused(isKeyboardFocus(e.target));
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[IS_WEB ? styles.webPressable : null, IS_WEB && isDisabled ? styles.webDisabled : null, typeof style === 'function' ? style(state) : style]}
    >
      {typeof children === 'function' ? children(state) : children}
    </RNPressable>
  );
});

function isKeyboardFocus(target: unknown): boolean {
  if (!IS_WEB) return true;
  try {
    return (target as Element).matches(':focus-visible');
  } catch {
    return true; // A browser without :focus-visible should still show the ring.
  }
}

/** Draws the theme's focus ring around the nearest positioned parent. Works without new-architecture `outline`. */
export function FocusRing({ visible, radius }: { visible: boolean; radius?: number }) {
  const { colors, tokens } = useTheme();
  if (!visible) return null;
  return (
    <View
      aria-hidden
      style={[styles.ring, { borderColor: colors.focusRing, borderRadius: (radius ?? tokens.radius.md) + 3 }]}
    />
  );
}

/** Multiplier for transforms, which unlike layout do not flip in right-to-left. */
export const rtlSign = (direction: 'ltr' | 'rtl'): number => (direction === 'rtl' ? -1 : 1);

export { I18nManager };

const styles = StyleSheet.create({
  // Android adds vertical padding to TextInput by default, iOS and web do not.
  input: { paddingVertical: 0, paddingHorizontal: 0, margin: 0, textAlignVertical: 'center' },
  webInput: { outlineStyle: 'none' } as unknown as TextStyle,
  webPressable: { cursor: 'pointer', outlineStyle: 'none', userSelect: 'none' } as unknown as ViewStyle,
  webDisabled: { cursor: 'not-allowed' } as unknown as ViewStyle,
  ring: { pointerEvents: 'none', position: 'absolute', top: -4, bottom: -4, start: -4, end: -4, borderWidth: 2 },
});
