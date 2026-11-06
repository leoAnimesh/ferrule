import { forwardRef, useEffect, useState, type ComponentRef } from 'react';
import { Image, useSlot, useTheme, View, type ImageSourcePropType, type StyleProp, type ViewProps, type ViewStyle } from 'ferrule';
import { Text } from './text';

export interface AvatarProps extends ViewProps {
  /** URL or bundled `require()`. Falls back to initials when missing or when it fails to load. */
  src?: string | ImageSourcePropType | null;
  /** Used for the initials and the accessible name. */
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

const DIAMETER = { sm: 32, md: 44, lg: 64 };
const TEXT = { sm: 'caption', md: 'label', lg: 'h2' } as const;

/** First letters of the first and last word. Array.from keeps surrogate pairs (emoji, CJK extensions) whole. */
export function initials(name: string | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = Array.from(words[0] ?? '')[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1] ?? '')[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export const Avatar = forwardRef<ComponentRef<typeof View>, AvatarProps>(function Avatar(
  { src, name, size = 'md', style, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const slot = useSlot('avatar', 'container');
  const [failed, setFailed] = useState(false);
  const sourceKey = JSON.stringify(src);
  useEffect(() => setFailed(false), [sourceKey]);

  const diameter = DIAMETER[size];
  const showImage = Boolean(src) && !failed;
  const text = initials(name);
  return (
    <View
      ref={ref}
      accessible
      role="img"
      aria-label={rest['aria-label'] ?? name ?? 'Avatar'}
      {...rest}
      style={[
        { width: diameter, height: diameter, borderRadius: diameter / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
        slot,
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={typeof src === 'string' ? { uri: src } : (src ?? undefined)}
          onError={() => setFailed(true)}
          aria-hidden
          style={{ width: diameter, height: diameter }}
        />
      ) : text ? (
        // Scaling is off: initials inside a fixed circle are decorative, and the name is announced via aria-label.
        <Text variant={TEXT[size]} aria-hidden allowFontScaling={false} numberOfLines={1} style={{ color: colors.onPrimarySoft }}>{text}</Text>
      ) : (
        <View aria-hidden style={{ alignItems: 'center', gap: diameter * 0.05 }}>
          <View style={{ width: diameter * 0.32, height: diameter * 0.32, borderRadius: diameter, backgroundColor: colors.onPrimarySoft }} />
          <View style={{ width: diameter * 0.56, height: diameter * 0.24, borderTopStartRadius: diameter, borderTopEndRadius: diameter, backgroundColor: colors.onPrimarySoft }} />
        </View>
      )}
    </View>
  );
});
