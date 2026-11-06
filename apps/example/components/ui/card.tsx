import { forwardRef, type ComponentRef, type ReactNode } from 'react';
import { FocusRing, Pressable, StateLayer, StyleSheet, useSlot, useNativeVariant, useTheme, View, type StyleProp, type ViewProps, type ViewStyle } from 'ferrule';
import { Text } from './text';

export type CardVariant = 'outline' | 'elevated' | 'filled';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  /** Makes the whole card a button. Give it an `aria-label`, because children are not read as its name on every platform. */
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Liquid Glass on iOS 26+ when ferrule-native is available. Ignored with `onPress`, and elsewhere. */
  native?: boolean;
}

export const Card = forwardRef<ComponentRef<typeof View>, CardProps>(function Card(
  { variant = 'outline', onPress, disabled, style, children, native, ...rest },
  ref,
) {
  const NativeCard = useNativeVariant<Record<string, unknown>>('card', native);
  const { colors, tokens } = useTheme();
  const slot = useSlot('card', 'container');
  const surface: ViewStyle = {
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: variant === 'outline' ? colors.border : 'transparent',
    backgroundColor: variant === 'filled' ? colors.surfaceMuted : colors.surface,
    boxShadow: variant === 'elevated' ? tokens.shadow.md : undefined,
  };
  if (NativeCard && !onPress) return <NativeCard radius={tokens.radius.lg} style={style} testID={rest.testID}>{children}</NativeCard>;
  if (!onPress) {
    return (
      <View ref={ref} {...rest} style={[surface, slot, style]}>
        {children}
      </View>
    );
  }

  return (
    <Pressable ref={ref} role="button" onPress={onPress} disabled={disabled} {...rest} style={[surface, slot, style]}>
      {({ pressed, hovered, focused }) => (
        <>
          {/* After the children, so press feedback also shows over an image that fills the card. */}
          {children}
          <StateLayer pressed={pressed} hovered={hovered} color={colors.text} radius={tokens.radius.lg - 1} pressedOpacity={0.1} hoveredOpacity={0.05} />
          <FocusRing visible={focused} radius={tokens.radius.lg} />
        </>
      )}
    </Pressable>
  );
});

export function CardHeader({ title, description, end }: { title: string; description?: string; end?: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.header, { padding: tokens.space[4], gap: tokens.space[3] }]}>
      <View style={styles.headerText}>
        <Text variant="h3">{title}</Text>
        {description ? <Text variant="bodySmall" tone="muted">{description}</Text> : null}
      </View>
      {end}
    </View>
  );
}

export function CardContent({ style, ...rest }: ViewProps) {
  const { tokens } = useTheme();
  return <View {...rest} style={[{ paddingHorizontal: tokens.space[4], paddingBottom: tokens.space[4], gap: tokens.space[3] }, style]} />;
}

export function CardFooter({ style, ...rest }: ViewProps) {
  const { tokens, colors } = useTheme();
  return <View {...rest} style={[styles.footer, { padding: tokens.space[4], gap: tokens.space[2], borderTopColor: colors.border }, style]} />;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  headerText: { flex: 1, gap: 2 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', borderTopWidth: 1 },
});
