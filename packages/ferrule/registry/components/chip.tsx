import { forwardRef, type ComponentRef, type ReactNode } from 'react';
import { FocusRing, HOVER_TINT, PRESSED_TINT, Pressable, StateLayer, useNativeVariant, useSlot, useTheme, type PressableProps, type StyleProp, type ViewStyle } from 'ferrule';
import { Text } from './text';

export interface ChipProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  /** Makes it a toggle, announced as checked or not. Leave unset for a plain action chip. */
  selected?: boolean;
  start?: ReactNode;
  end?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Renders the real platform chip when ferrule-native is available. Needs no `start` or `end`. */
  native?: boolean;
}

/** A compact filter or action. Keeps a full-size touch target around its small visual. */
export const Chip = forwardRef<ComponentRef<typeof Pressable>, ChipProps>(function Chip(
  { label, selected, start, end, disabled, onPress, style, native, testID, ...rest },
  ref,
) {
  const NativeChip = useNativeVariant<Record<string, unknown>>('chip', native);
  const { colors, tokens } = useTheme();
  const container = useSlot('chip', 'container');
  const slotLabel = useSlot('chip', 'label');
  if (NativeChip && !start && !end) {
    return <NativeChip label={label} selected={selected} disabled={disabled === true} onPress={onPress} style={style} testID={testID} a11yLabel={rest['aria-label']} />;
  }
  const on = selected === true;
  const fg = on ? colors.onPrimarySoft : colors.text;
  const height = tokens.controlHeight.sm;
  const slop = Math.max(0, (tokens.minTouchTarget - height) / 2);
  return (
    <Pressable
      ref={ref}
      testID={testID}
      role={selected === undefined ? 'button' : 'checkbox'}
      aria-checked={selected}
      aria-label={label}
      hitSlop={slop ? { top: slop, bottom: slop } : undefined}
      disabled={disabled}
      onPress={onPress}
      {...rest}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.space[1],
          minHeight: height,
          paddingHorizontal: tokens.space[3],
          borderRadius: tokens.radius.full,
          borderWidth: 1,
          borderColor: on ? colors.primarySoft : colors.controlBorder,
          backgroundColor: on ? colors.primarySoft : 'transparent',
          opacity: disabled === true ? 0.45 : 1,
        },
        container,
        style,
      ]}
    >
      {({ pressed, hovered, focused }) => (
        <>
          <StateLayer pressed={pressed} hovered={hovered} color={fg} radius={tokens.radius.full} pressedOpacity={PRESSED_TINT} hoveredOpacity={HOVER_TINT} />
          {start}
          <Text variant="label" style={[{ color: fg }, slotLabel]}>{label}</Text>
          {end}
          <FocusRing visible={focused} radius={tokens.radius.full} />
        </>
      )}
    </Pressable>
  );
});
