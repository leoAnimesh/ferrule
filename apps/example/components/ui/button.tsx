import { forwardRef, type ComponentRef, type ReactNode } from 'react';
import { DISABLED_OPACITY, FocusRing, HOVER_OVERPRINT, HOVER_TINT, PRESSED_OVERPRINT, PRESSED_TINT, Pressable, StateLayer, StyleSheet, useSlot, useNativeVariant, useTheme, type ControlSize, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'ferrule';
import { Spinner } from './spinner';
import { Text } from './text';

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ControlSize;
  /** Shows a spinner, blocks presses, and announces busy. The label stays, so the width does not jump. */
  loading?: boolean;
  fullWidth?: boolean;
  start?: ReactNode;
  end?: ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  /** Renders the real platform button when ferrule-native is available. Needs a text label and no `start` or `end`. */
  native?: boolean;
}

const PADDING = { sm: 3, md: 4, lg: 5 } as const;
const TEXT = { sm: 'sm', md: 'md', lg: 'lg' } as const;

export const Button = forwardRef<ComponentRef<typeof Pressable>, ButtonProps>(function Button(
  { children, variant = 'solid', size = 'md', loading = false, fullWidth = false, disabled, start, end, style, labelStyle, native, ...rest },
  ref,
) {
  const NativeButton = useNativeVariant<Record<string, unknown>>('button', native);
  const { colors, tokens } = useTheme();
  const container = useSlot('button', 'container');
  const label = useSlot('button', 'label');
  const blocked = disabled === true || loading;

  const palette = {
    solid: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary, layer: colors.overprint, hover: HOVER_OVERPRINT, press: PRESSED_OVERPRINT },
    danger: { bg: colors.danger, fg: colors.onDanger, border: colors.danger, layer: colors.overprint, hover: HOVER_OVERPRINT, press: PRESSED_OVERPRINT },
    soft: { bg: colors.primarySoft, fg: colors.onPrimarySoft, border: colors.primarySoft, layer: colors.onPrimarySoft, hover: HOVER_TINT, press: PRESSED_TINT },
    outline: { bg: 'transparent', fg: colors.text, border: colors.controlBorder, layer: colors.text, hover: HOVER_TINT, press: PRESSED_TINT },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent', layer: colors.primary, hover: HOVER_TINT, press: PRESSED_TINT },
  }[variant];

  const height = tokens.controlHeight[size];
  const radius = tokens.radius.md;
  // Small visuals keep a full-size touch target.
  const slop = Math.max(0, (tokens.minTouchTarget - height) / 2);
  const accessibilityLabel = rest['aria-label'] ?? (typeof children === 'string' ? children : undefined);

  if (NativeButton && typeof children === 'string' && !start && !end) {
    return <NativeButton label={children} variant={variant} size={size} loading={loading} disabled={disabled === true} fullWidth={fullWidth} onPress={rest.onPress} testID={rest.testID} a11yLabel={rest['aria-label']} style={style} />;
  }

  return (
    <Pressable
      ref={ref}
      role="button"
      hitSlop={slop ? { top: slop, bottom: slop } : undefined}
      {...rest}
      disabled={blocked}
      aria-label={accessibilityLabel}
      aria-busy={loading || undefined}
      // Android otherwise fades the label and fill separately, so the edge shows through.
      needsOffscreenAlphaCompositing={disabled === true}
      style={[
        styles.base,
        {
          minHeight: height,
          paddingHorizontal: tokens.space[PADDING[size]],
          borderRadius: radius,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled === true ? DISABLED_OPACITY : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        container,
        style,
      ]}
    >
      {({ pressed, hovered, focused }) => (
        <>
          <StateLayer pressed={pressed && !blocked} hovered={hovered && !blocked} color={palette.layer} radius={radius - 1} pressedOpacity={palette.press} hoveredOpacity={palette.hover} />
          {start}
          {loading ? <Spinner size="sm" color={palette.fg} label={null} /> : null}
          {typeof children === 'string' ? (
            <Text
              variant="label"
              style={[
                { color: palette.fg, fontSize: tokens.fontSize[TEXT[size]], lineHeight: tokens.lineHeight[TEXT[size]], textAlign: 'center', flexShrink: 1 },
                label,
                labelStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {end}
          <FocusRing visible={focused} radius={radius} />
        </>
      )}
    </Pressable>
  );
});

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'start' | 'end' | 'fullWidth' | 'labelStyle' | 'aria-label'> {
  /** The icon, like `<Icon source={...} />`. */
  children: ReactNode;
  /** Required, because there is no visible text to name it. */
  'aria-label': string;
  /** Icon names for the platform button, an SF Symbol on iOS. With `native`, iOS 26+ draws a Liquid Glass button and iOS 17 to 25 the system one. Elsewhere `children` draws. */
  nativeIcon?: { ios?: string; android?: string };
}

/** A square button holding only an icon. Round when the theme's `md` radius is. */
export const IconButton = forwardRef<ComponentRef<typeof Pressable>, IconButtonProps>(function IconButton({ size = 'md', style, native, nativeIcon, ...rest }, ref) {
  const NativeIconButton = useNativeVariant<Record<string, unknown>>('iconButton', native);
  const { tokens } = useTheme();
  const slot = useSlot('iconButton', 'container');
  const side = tokens.controlHeight[size];
  // Its own slop, because a narrow button also needs its touch target widened.
  const slop = Math.max(0, (tokens.minTouchTarget - side) / 2);
  if (NativeIconButton && nativeIcon) {
    return <NativeIconButton icon={nativeIcon} variant={rest.variant} side={side} disabled={rest.disabled === true || rest.loading === true} onPress={rest.onPress} testID={rest.testID} a11yLabel={rest['aria-label']} style={[{ alignSelf: 'center' }, style]} />;
  }
  return <Button ref={ref} native={false} size={size} hitSlop={slop} {...rest} style={[{ width: side, height: side, paddingHorizontal: 0, paddingVertical: 0 }, slot, style]} />;
});

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, paddingVertical: 6, maxWidth: '100%' },
});
