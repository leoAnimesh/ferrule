import { forwardRef, useEffect, type ComponentRef } from 'react';
import { Animated, cancelAnimation, FocusRing, Pressable, rtlSign, StyleSheet, useAnimatedStyle, useControllableState, useDirection, useSharedValue, useSlot, useNativeVariant, useTheme, View, withTiming, DISABLED_OPACITY, EASE_OUT, type PressableProps, type StyleProp, type ViewStyle } from 'ferrule';
import { Text } from './text';

export interface SwitchProps extends Omit<PressableProps, 'style' | 'children' | 'onPress'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Visible label. Without one, pass `aria-label`. */
  label?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
  /** Renders the real platform control when ferrule-native is available. */
  native?: boolean;
}

const TRACK_W = 50;
const TRACK_H = 30;
const THUMB_W = 14;
const THUMB_H = 22;
const INSET = 3;
const TRAVEL = TRACK_W - THUMB_W - INSET * 2 - 2;

/** Drawn in JS, because the RN Switch differs on every platform. The upright thumb is Ferrule's band. */
export const Switch = forwardRef<ComponentRef<typeof Pressable>, SwitchProps>(function Switch(
  { checked, defaultChecked = false, onCheckedChange, label, description, disabled, style, native, ...rest },
  ref,
) {
  const NativeControl = useNativeVariant<Record<string, unknown>>('switch', native);
  const { colors, tokens } = useTheme();
  const track = useSlot('switch', 'track');
  const thumb = useSlot('switch', 'thumb');
  const direction = useDirection();
  const [isOn, setOn] = useControllableState(checked, defaultChecked, onCheckedChange);
  const position = useSharedValue(isOn ? 1 : 0);

  useEffect(() => {
    position.value = withTiming(isOn ? 1 : 0, { duration: tokens.motion.normal, easing: EASE_OUT });
    return () => cancelAnimation(position);
  }, [isOn, position, tokens.motion.normal]);

  const sign = rtlSign(direction);
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: position.value * TRAVEL * sign }] }));

  if (NativeControl) {
    return <NativeControl label={label} description={description} checked={checked} defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} disabled={disabled === true} testID={rest.testID} a11yLabel={rest['aria-label']} style={style} />;
  }

  return (
    <Pressable
      ref={ref}
      role="switch"
      aria-checked={isOn}
      aria-label={rest['aria-label'] ?? label}
      {...rest}
      disabled={disabled}
      onPress={() => setOn(!isOn)}
      style={[styles.row, { minHeight: tokens.minTouchTarget, gap: tokens.space[3], opacity: disabled ? DISABLED_OPACITY : 1 }, style]}
    >
      {({ hovered, focused, pressed }) => (
        <>
          {label ? (
            <View style={styles.text}>
              <Text variant="body">{label}</Text>
              {description ? <Text variant="caption" tone="muted">{description}</Text> : null}
            </View>
          ) : null}
          <View
            style={[
              styles.track,
              { borderRadius: tokens.radius.md, backgroundColor: isOn ? colors.primary : colors.surfaceMuted, borderColor: isOn ? colors.primary : colors.controlBorder },
              track,
              hovered || pressed ? { borderColor: colors.focusRing } : null,
            ]}
          >
            <Animated.View
              style={[
                styles.thumb,
                { borderRadius: tokens.radius.sm, backgroundColor: isOn ? colors.onPrimary : colors.textMuted },
                thumb,
                slide,
              ]}
            />
            <FocusRing visible={focused} radius={tokens.radius.md} />
          </View>
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', justifyContent: 'space-between' },
  text: { flex: 1, gap: 2 },
  // Thumb position is absolute from the leading edge, so RTL starts it on the right and the transform sign flips.
  track: { width: TRACK_W, height: TRACK_H, borderWidth: 1, justifyContent: 'center', paddingHorizontal: INSET },
  thumb: { width: THUMB_W, height: THUMB_H },
});
