import { forwardRef, type ComponentRef, type ReactNode } from 'react';
import { useSlot, useTheme, View, type StyleProp, type ViewProps, type ViewStyle } from '@leoanimesh/ferrule';
import { Text } from './text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
export type BadgeVariant = 'solid' | 'soft' | 'outline';

export interface BadgeProps extends ViewProps {
  children?: ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

/** A status label. Renders nothing when empty. Long text truncates to one line. */
export const Badge = forwardRef<ComponentRef<typeof View>, BadgeProps>(function Badge(
  { children, tone = 'neutral', variant = 'soft', style, ...rest },
  ref,
) {
  const { colors, tokens } = useTheme();
  const slot = useSlot('badge', 'container');
  if (children === null || children === undefined || children === '') return null;

  const { accent, onAccent, soft, onSoft } = {
    neutral: { accent: colors.text, onAccent: colors.background, soft: colors.surfaceMuted, onSoft: colors.text },
    primary: { accent: colors.primary, onAccent: colors.onPrimary, soft: colors.primarySoft, onSoft: colors.onPrimarySoft },
    success: { accent: colors.success, onAccent: colors.onSuccess, soft: colors.successSoft, onSoft: colors.onSuccessSoft },
    warning: { accent: colors.warning, onAccent: colors.onWarning, soft: colors.warningSoft, onSoft: colors.onWarningSoft },
    danger: { accent: colors.danger, onAccent: colors.onDanger, soft: colors.dangerSoft, onSoft: colors.onDangerSoft },
  }[tone];
  const bg = variant === 'solid' ? accent : variant === 'soft' ? soft : 'transparent';
  const fg = variant === 'solid' ? onAccent : variant === 'soft' ? onSoft : accent;
  return (
    <View
      ref={ref}
      {...rest}
      style={[
        {
          alignSelf: 'flex-start',
          maxWidth: '100%',
          flexShrink: 1,
          paddingHorizontal: tokens.space[2],
          paddingVertical: 2,
          borderRadius: tokens.radius.sm,
          borderWidth: 1,
          borderColor: variant === 'solid' ? accent : variant === 'outline' ? accent : 'transparent',
          backgroundColor: bg,
        },
        slot,
        style,
      ]}
    >
      <Text variant="caption" numberOfLines={1} style={{ color: fg, fontWeight: tokens.fontWeight.semibold }}>
        {children}
      </Text>
    </View>
  );
});
