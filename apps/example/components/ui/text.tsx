import { forwardRef, type ComponentRef } from 'react';
import { Text as BaseText, useSlot, useTheme, type FontSizeToken, type FontWeightToken, type TextProps as BaseTextProps } from '@leoanimesh/ferrule';

const VARIANTS = {
  hero: { size: '4xl', weight: 'regular', tracking: -1 },
  display: { size: '3xl', weight: 'bold', level: 1, tracking: -0.8 },
  h1: { size: '2xl', weight: 'bold', level: 1, tracking: -0.5 },
  h2: { size: 'xl', weight: 'bold', level: 2, tracking: -0.25 },
  h3: { size: 'lg', weight: 'semibold', level: 3, tracking: -0.1 },
  body: { size: 'md', weight: 'regular', tracking: 0 },
  bodySmall: { size: 'sm', weight: 'regular', tracking: 0 },
  label: { size: 'sm', weight: 'semibold', tracking: 0 },
  caption: { size: 'xs', weight: 'regular', tracking: 0.1 },
} as const satisfies Record<string, { size: FontSizeToken; weight: FontWeightToken; level?: number; tracking: number }>;

export type TextVariant = keyof typeof VARIANTS;
export type TextTone = 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning' | 'onPrimary' | 'onPrimarySoft' | 'onDanger' | 'onSuccess' | 'onWarning';

export interface TextProps extends BaseTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export const Text = forwardRef<ComponentRef<typeof BaseText>, TextProps>(function Text(
  { variant = 'body', tone = 'default', style, ...rest },
  ref,
) {
  const { colors, tokens } = useTheme();
  const slot = useSlot('text', variant);
  const spec = VARIANTS[variant];
  const color = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    onPrimary: colors.onPrimary,
    onPrimarySoft: colors.onPrimarySoft,
    onDanger: colors.onDanger,
    onSuccess: colors.onSuccess,
    onWarning: colors.onWarning,
  }[tone];
  const level = 'level' in spec ? spec.level : undefined;
  return (
    <BaseText
      ref={ref}
      role={level ? 'heading' : undefined}
      aria-level={level}
      {...rest}
      style={[
        {
          color,
          fontSize: tokens.fontSize[spec.size],
          lineHeight: tokens.lineHeight[spec.size],
          fontWeight: tokens.fontWeight[spec.weight],
          letterSpacing: spec.tracking,
          // Figures line up in rows and do not shift as values change.
          fontVariant: ['tabular-nums'],
        },
        slot,
        style,
      ]}
    />
  );
});
