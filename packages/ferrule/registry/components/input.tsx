import { forwardRef, useId, useState, type ComponentRef, type ReactNode } from 'react';
import { Band, I18nManager, Platform, StyleSheet, TextInput, useControllableState, useSlot, useNativeVariant, useTheme, View, type ControlSize, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'ferrule';
import { Text } from './text';

export interface InputProps extends Omit<TextInputProps, 'style' | 'editable'> {
  label?: string;
  /** Guidance below the field. Replaced by `error` when both are set. */
  helperText?: string;
  /** Puts the field in its error state and announces the message. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: ControlSize;
  start?: ReactNode;
  end?: ReactNode;
  /** The outer wrapper, including label and messages. */
  style?: StyleProp<ViewStyle>;
  /** The bordered field. */
  fieldStyle?: StyleProp<ViewStyle>;
  /** The text inside the field. */
  inputStyle?: StyleProp<TextStyle>;
  /** Renders the real platform text field when ferrule-native is available. Needs no `start` or `end`. */
  native?: boolean;
}

export const Input = forwardRef<ComponentRef<typeof TextInput>, InputProps>(function Input(
  { native, label, helperText, error, required, disabled = false, size = 'md', start, end, style, fieldStyle, inputStyle, value, defaultValue, onChangeText, onFocus, onBlur, multiline, ...rest },
  ref,
) {
  const NativeField = useNativeVariant<Record<string, unknown>>('input', native);
  const { colors, tokens } = useTheme();
  const fieldSlot = useSlot('input', 'field');
  const textSlot = useSlot('input', 'text');
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [focused, setFocused] = useState(false);
  const [text, setText] = useControllableState(value, defaultValue ?? '', onChangeText);

  const invalid = Boolean(error);
  const message = error || helperText;
  const borderColor = invalid ? colors.danger : focused ? colors.focusRing : colors.controlBorder;
  const minHeight = multiline ? tokens.controlHeight[size] * 2 : tokens.controlHeight[size];
  const fontToken = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md';
  // Native screen readers ignore aria-describedby, so the message joins the hint there.
  const hint = Platform.OS === 'web' ? rest.accessibilityHint : ([rest.accessibilityHint, message].filter(Boolean).join('. ') || undefined);

  if (NativeField && !start && !end) {
    return <NativeField label={label} helperText={helperText} error={error} disabled={disabled} value={value} defaultValue={defaultValue} onChangeText={onChangeText} placeholder={rest.placeholder} secureTextEntry={rest.secureTextEntry} keyboardType={rest.keyboardType} testID={rest.testID} a11yLabel={rest['aria-label']} style={style} />;
  }

  return (
    <View style={[styles.root, style]}>
      {label ? (
        <Text nativeID={`${id}-label`} variant="label">
          {label}
          {required ? <Text variant="label" tone="danger" aria-hidden>{' *'}</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            minHeight,
            borderColor,
            borderRadius: tokens.radius.md,
            paddingHorizontal: tokens.space[3],
            backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
            alignItems: multiline ? 'flex-start' : 'center',
            paddingVertical: multiline ? tokens.space[2] : 0,
          },
          fieldSlot,
          fieldStyle,
        ]}
      >
        {start}
        <TextInput
          ref={ref}
          nativeID={`${id}-input`}
          {...rest}
          multiline={multiline}
          value={text}
          onChangeText={setText}
          editable={!disabled}
          aria-label={rest['aria-label'] ?? label}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-disabled={disabled || undefined}
          aria-describedby={message ? `${id}-message` : undefined}
          accessibilityLabelledBy={label ? `${id}-label` : undefined}
          accessibilityHint={hint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.text,
            {
              color: disabled ? colors.textMuted : colors.text,
              fontSize: tokens.fontSize[fontToken],
              // A lineHeight pushes a single-line iOS field's text below center.
              lineHeight: multiline ? tokens.lineHeight[fontToken] : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
              // Native inputs align by their content, which leaves Latin values opposite their label in RTL. Web follows dir.
              ...(Platform.OS !== 'web' && I18nManager.isRTL ? { textAlign: 'right' as const } : null),
            },
            textSlot,
            inputStyle,
          ]}
        />
        {end}
        <Band visible={(focused || invalid) && !disabled} color={invalid ? colors.danger : colors.focusRing} thickness={3} style={{ borderBottomStartRadius: tokens.radius.md, borderBottomEndRadius: tokens.radius.md, start: -1, end: -1 }} />
      </View>
      {message ? (
        <Text
          nativeID={`${id}-message`}
          variant="caption"
          tone={invalid ? 'danger' : 'muted'}
          role={invalid ? 'alert' : undefined}
          accessibilityLiveRegion={invalid ? 'polite' : 'none'}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { gap: 6, alignSelf: 'stretch' },
  field: { flexDirection: 'row', gap: 8, borderWidth: 1 },
  text: { flex: 1, minWidth: 0 },
});
