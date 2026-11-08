import { forwardRef, useEffect, useRef, useState, type ComponentRef } from 'react';
import { Animated, cancelAnimation, FocusRing, Pressable, StateLayer, useAnimatedStyle, useControllableState, useNativeVariant, useRovingFocus, useSharedValue, useSlot, useTheme, View, withTiming, EASE_OUT, PRESSED_TINT, type StyleProp, type ViewStyle } from '@leoanimesh/ferrule';
import { Text } from './text';

export interface SegmentedOption {
  value: string;
  label: string;
  testID?: string;
}

export interface SegmentedProps {
  options: readonly SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Names the group for screen readers. */
  label: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Renders the real platform control when `@leoanimesh/ferrule-native` is available. */
  native?: boolean;
}

/** One choice out of a few, all visible. One pill slides to the chosen segment, measured from layout. Layout x is physical, so RTL needs no flip. */
export const Segmented = forwardRef<ComponentRef<typeof View>, SegmentedProps>(function Segmented({ options, value, defaultValue, onValueChange, label, disabled = false, style, testID, native }, ref) {
  const NativeSegmented = useNativeVariant<Record<string, unknown>>('segmented', native);
  const { colors, tokens } = useTheme();
  const container = useSlot('segmented', 'container');
  const selectedSlot = useSlot('segmented', 'selected');
  const [current, setCurrent] = useControllableState(value, defaultValue ?? options[0]?.value ?? '', onValueChange);
  const [slots, setSlots] = useState<Record<string, { x: number; width: number }>>({});
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const shown = useSharedValue(0);
  const placed = useRef(false);
  const slot = slots[current];
  const roving = useRovingFocus(options.map((option) => option.value), current, setCurrent, { upDown: true, disabled });

  useEffect(() => {
    if (!slot) return;
    if (placed.current) {
      const timing = { duration: tokens.motion.normal, easing: EASE_OUT };
      x.value = withTiming(slot.x, timing);
      width.value = withTiming(slot.width, timing);
    } else {
      // First measurement: place the pill without animating, then reveal it.
      placed.current = true;
      x.value = slot.x;
      width.value = slot.width;
      shown.value = 1;
    }
    return () => { cancelAnimation(x); cancelAnimation(width); };
  }, [slot?.x, slot?.width, x, width, shown, tokens.motion.normal]);

  const pill = useAnimatedStyle(() => ({ opacity: shown.value, width: width.value, transform: [{ translateX: x.value }] }));
  if (NativeSegmented) return <NativeSegmented options={options} value={current} onValueChange={setCurrent} label={label} disabled={disabled} style={style} testID={testID} />;
  const inner = tokens.radius.md;
  return (
    <View ref={ref} role="radiogroup" aria-label={label} testID={testID} {...roving.group} style={[{ flexDirection: 'row', padding: 2, gap: 2, borderRadius: inner + 2, backgroundColor: colors.surfaceMuted, opacity: disabled ? 0.45 : 1 }, container, style]}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 2, bottom: 2, left: 0, borderRadius: inner, backgroundColor: colors.surface, boxShadow: tokens.shadow.sm }, selectedSlot, pill]} />
      {options.map((option) => {
        const on = option.value === current;
        return (
          <Pressable
            key={option.value}
            {...roving.item(option.value)}
            testID={option.testID}
            role="radio"
            aria-checked={on}
            aria-label={option.label}
            disabled={disabled}
            onPress={() => setCurrent(option.value)}
            onLayout={(event) => {
              const { x: left, width: w } = event.nativeEvent.layout;
              setSlots((prev) => (prev[option.value]?.x === left && prev[option.value]?.width === w ? prev : { ...prev, [option.value]: { x: left, width: w } }));
            }}
            style={[
              { flex: 1, minHeight: tokens.minTouchTarget - 4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: tokens.space[2], borderRadius: inner },
            ]}
          >
            {({ pressed, focused }) => (
              <>
                <StateLayer pressed={pressed} color={colors.text} radius={inner} pressedOpacity={PRESSED_TINT} />
                <Text variant="label" tone={on ? 'default' : 'muted'} style={{ textAlign: 'center' }}>{option.label}</Text>
                <FocusRing visible={focused} radius={inner} />
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
});
