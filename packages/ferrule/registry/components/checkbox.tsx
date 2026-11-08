import { forwardRef, type ComponentRef } from 'react';
import { DISABLED_OPACITY, FocusRing, Pressable, StyleSheet, useControllableState, useSlot, useNativeVariant, useTheme, View, type PressableProps, type StyleProp, type ViewStyle } from '@leoanimesh/ferrule';
import { Text } from './text';

export interface CheckboxProps extends Omit<PressableProps, 'style' | 'children' | 'onPress'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Shown as a dash and announced as mixed. Pressing it reports `true`. */
  indeterminate?: boolean;
  /** Visible label. Without one, pass `aria-label`. */
  label?: string;
  description?: string;
  /** Error message shown below and included in the announcement. */
  error?: string;
  style?: StyleProp<ViewStyle>;
  /** Renders the real platform control when `@leoanimesh/ferrule-native` is available. */
  native?: boolean;
}

const BOX = 22;

export const Checkbox = forwardRef<ComponentRef<typeof Pressable>, CheckboxProps>(function Checkbox(
  { checked, defaultChecked = false, onCheckedChange, indeterminate = false, label, description, error, disabled, style, native, ...rest },
  ref,
) {
  const NativeControl = useNativeVariant<Record<string, unknown>>('checkbox', native);
  const { colors, tokens } = useTheme();
  const box = useSlot('checkbox', 'box');
  const [isChecked, setChecked] = useControllableState(checked, defaultChecked, onCheckedChange);
  const on = isChecked || indeterminate;
  const edge = error ? colors.danger : on ? colors.primary : colors.controlBorder;

  if (NativeControl && !error && !indeterminate) {
    return <NativeControl label={label} description={description} checked={checked} defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} disabled={disabled === true} testID={rest.testID} a11yLabel={rest['aria-label']} style={style} />;
  }

  return (
    <View style={[styles.root, style]}>
      <Pressable
        ref={ref}
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : isChecked}
        aria-label={rest['aria-label'] ?? label}
        aria-invalid={error ? true : undefined}
        accessibilityHint={error}
        {...rest}
        disabled={disabled}
        onPress={() => setChecked(indeterminate ? true : !isChecked)}
        style={[styles.row, { minHeight: tokens.minTouchTarget, gap: tokens.space[3], opacity: disabled ? DISABLED_OPACITY : 1 }]}
      >
        {({ hovered, pressed, focused }) => (
          <>
            <View
              style={[
                styles.box,
                { borderRadius: tokens.radius.sm, borderColor: edge, backgroundColor: on ? colors.primary : colors.surface },
                box,
                hovered || pressed ? { borderColor: on ? colors.primary : colors.focusRing } : null,
              ]}
            >
              {/* Drawn with borders, not a glyph, so its shape does not depend on the platform font. */}
              {indeterminate ? <View style={[styles.dash, { backgroundColor: colors.onPrimary }]} /> : isChecked ? <><View style={[styles.bar, styles.tickShort, { backgroundColor: colors.onPrimary }]} /><View style={[styles.bar, styles.tickLong, { backgroundColor: colors.onPrimary }]} /></> : null}
              <FocusRing visible={focused} radius={tokens.radius.sm} />
            </View>
            {label ? (
              <View style={styles.text}>
                <Text variant="body">{label}</Text>
                {description ? <Text variant="caption" tone="muted">{description}</Text> : null}
              </View>
            ) : null}
          </>
        )}
      </Pressable>
      {error ? <Text variant="caption" tone="danger">{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center' },
  box: { width: BOX, height: BOX, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  // Two bars placed by transform, which never flips: a tick does not mirror in RTL, and borders swap differently per platform.
  bar: { position: 'absolute', height: 2.5, borderRadius: 1 },
  tickShort: { width: 6, transform: [{ translateX: -2.5 }, { translateY: 2 }, { rotate: '45deg' }] },
  tickLong: { width: 10.5, transform: [{ translateX: 1.75 }, { translateY: 0.75 }, { rotate: '-45deg' }] },
  dash: { width: 10, height: 2, borderRadius: 1 },
  text: { flex: 1, gap: 2 },
});
