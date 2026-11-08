import { forwardRef, type ComponentRef } from 'react';
import { FocusRing, Platform, Pressable, useSlot, useTheme, View, type StyleProp, type ViewStyle } from '@leoanimesh/ferrule';
import { Button } from './button';
import { Text } from './text';

export interface StepperProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Shown beside the value and read with it, like `min`. */
  unit?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A number changed in steps. Screen readers on iOS and Android adjust it as one control, by swiping up or down. On web the value is a spin button: arrows step, Home and End jump. */
export const Stepper = forwardRef<ComponentRef<typeof View>, StepperProps>(function Stepper({ label, value, onValueChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, unit, style, testID }, ref) {
  const { tokens } = useTheme();
  const slot = useSlot('stepper', 'container');
  const change = (delta: number) => onValueChange(Math.min(max, Math.max(min, value + delta)));
  const shown = unit ? `${value} ${unit}` : String(value);
  const bounded = max !== Number.MAX_SAFE_INTEGER;
  const range = { 'aria-valuenow': value, 'aria-valuemin': min, 'aria-valuemax': bounded ? max : undefined, 'aria-valuetext': shown };
  const valueText = <Text variant="label" testID={testID ? `${testID}-value` : undefined} style={{ minWidth: 56, textAlign: 'center' }}>{shown}</Text>;
  const onKeyDown = (event: { key: string; preventDefault: () => void }) => {
    const next = { ArrowUp: value + step, ArrowDown: value - step, Home: min, End: bounded ? max : value }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onValueChange(Math.min(max, Math.max(min, next)));
  };
  // A slider cannot hold the two buttons on web, so the group holds them and the value is the control.
  const container = Platform.OS === 'web'
    ? { role: 'group' as const, 'aria-label': label }
    : {
        accessible: true,
        accessibilityRole: 'adjustable' as const,
        'aria-label': label,
        ...range,
        accessibilityActions: [{ name: 'increment' }, { name: 'decrement' }],
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => change(event.nativeEvent.actionName === 'increment' ? step : -step),
      };
  return (
    <View
      ref={ref}
      testID={testID}
      {...container}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: tokens.space[2] }, slot, style]}
    >
      <Text variant="body" style={{ flexGrow: 1, flexShrink: 1, flexBasis: 120 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[2] }}>
        <Button testID={testID ? `${testID}-less` : undefined} variant="outline" size="sm" aria-label={`Less ${label}`} disabled={value <= min} onPress={() => change(-step)} style={{ minWidth: tokens.minTouchTarget }}>-</Button>
        {Platform.OS === 'web' ? (
          <View {...({ onKeyDown } as object)}>
            <Pressable role={'spinbutton' as 'button'} aria-label={label} {...range} style={{ cursor: 'default' } as unknown as ViewStyle}>
              {({ focused }) => (
                <>
                  {valueText}
                  <FocusRing visible={focused} radius={tokens.radius.sm} />
                </>
              )}
            </Pressable>
          </View>
        ) : valueText}
        <Button testID={testID ? `${testID}-more` : undefined} variant="outline" size="sm" aria-label={`More ${label}`} disabled={value >= max} onPress={() => change(step)} style={{ minWidth: tokens.minTouchTarget }}>+</Button>
      </View>
    </View>
  );
});
