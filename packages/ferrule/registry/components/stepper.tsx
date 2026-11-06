import { useTheme, View, type StyleProp, type ViewStyle } from 'ferrule';
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

/** A number changed in steps. Screen readers adjust it as one control, by swiping up or down. */
export function Stepper({ label, value, onValueChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, unit, style, testID }: StepperProps) {
  const { tokens } = useTheme();
  const change = (delta: number) => onValueChange(Math.min(max, Math.max(min, value + delta)));
  const shown = unit ? `${value} ${unit}` : String(value);
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="adjustable"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max === Number.MAX_SAFE_INTEGER ? undefined : max}
      aria-valuetext={shown}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => change(event.nativeEvent.actionName === 'increment' ? step : -step)}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: tokens.space[2] }, style]}
    >
      <Text variant="body" style={{ flexGrow: 1, flexShrink: 1, flexBasis: 120 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[2] }}>
        <Button testID={testID ? `${testID}-less` : undefined} variant="outline" size="sm" aria-label={`Less ${label}`} disabled={value <= min} onPress={() => change(-step)} style={{ minWidth: tokens.minTouchTarget }}>-</Button>
        <Text variant="label" testID={testID ? `${testID}-value` : undefined} style={{ minWidth: 56, textAlign: 'center' }}>{shown}</Text>
        <Button testID={testID ? `${testID}-more` : undefined} variant="outline" size="sm" aria-label={`More ${label}`} disabled={value >= max} onPress={() => change(step)} style={{ minWidth: tokens.minTouchTarget }}>+</Button>
      </View>
    </View>
  );
}
