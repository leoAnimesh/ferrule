import { FocusRing, Pressable, StateLayer, useControllableState, useNativeVariant, useSlot, useTheme, View, HOVER_TINT, PRESSED_TINT, type StyleProp, type ViewStyle } from 'ferrule';
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
  /** Renders the real platform control when ferrule-native is available. */
  native?: boolean;
}

/** One choice out of a few, all visible. Equal-width segments, so it needs no RTL case. */
export function Segmented({ options, value, defaultValue, onValueChange, label, disabled = false, style, testID, native }: SegmentedProps) {
  const NativeSegmented = useNativeVariant<Record<string, unknown>>('segmented', native);
  const { colors, tokens } = useTheme();
  const container = useSlot('segmented', 'container');
  const selectedSlot = useSlot('segmented', 'selected');
  const [current, setCurrent] = useControllableState(value, defaultValue ?? options[0]?.value ?? '', onValueChange);
  if (NativeSegmented) return <NativeSegmented options={options} value={current} onValueChange={setCurrent} label={label} disabled={disabled} style={style} testID={testID} />;
  const inner = tokens.radius.md;
  return (
    <View role="radiogroup" aria-label={label} testID={testID} style={[{ flexDirection: 'row', padding: 2, gap: 2, borderRadius: inner + 2, backgroundColor: colors.surfaceMuted, opacity: disabled ? 0.45 : 1 }, container, style]}>
      {options.map((option) => {
        const on = option.value === current;
        return (
          <Pressable
            key={option.value}
            testID={option.testID}
            role="radio"
            aria-checked={on}
            aria-label={option.label}
            disabled={disabled}
            onPress={() => setCurrent(option.value)}
            style={[
              { flex: 1, minHeight: tokens.minTouchTarget - 4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: tokens.space[2], borderRadius: inner },
              on ? { backgroundColor: colors.surface, boxShadow: tokens.shadow.sm } : null,
              on ? selectedSlot : null,
            ]}
          >
            {({ pressed, hovered, focused }) => (
              <>
                <StateLayer pressed={pressed} hovered={hovered} color={colors.text} radius={inner} pressedOpacity={PRESSED_TINT} hoveredOpacity={HOVER_TINT} />
                <Text variant="label" tone={on ? 'default' : 'muted'} style={{ textAlign: 'center' }}>{option.label}</Text>
                <FocusRing visible={focused} radius={inner} />
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
