import { featherSource, isDirectional, type FeatherName } from 'ferrule/lib/feather';
import { Image as BaseImage, rtlSign, useDirection, useTheme, useWindowDimensions, type ImageSourcePropType, type StyleProp, type ImageStyle } from 'ferrule';

export interface IconProps {
  /** A Feather icon, such as `search`. A wrong name fails typecheck. Browse them in the docs. */
  name?: FeatherName;
  /** Your own artwork instead: a single-color PNG with alpha. Only its shape is used. */
  source?: ImageSourcePropType;
  size?: number;
  /** Defaults to the theme's text color. */
  color?: string;
  /** What the icon means, when nothing else says it. Without one, screen readers skip it. */
  label?: string;
  /** Mirrors in right-to-left. On by default for Feather's arrows, chevrons, corners and log-in and log-out. */
  flip?: boolean;
  style?: StyleProp<ImageStyle>;
}

const MAX_SCALE = 1.5;

/** A tinted Feather icon, or your own artwork. It needs no icon font or SVG dependency. It grows with the OS text size, up to 1.5x so it still fits its layout. */
export function Icon({ name, source, size = 20, color, label, flip = name ? isDirectional(name) : false, style }: IconProps) {
  const { colors } = useTheme();
  const direction = useDirection();
  const scaled = size * Math.min(MAX_SCALE, Math.max(1, useWindowDimensions().fontScale));
  return (
    <BaseImage
      source={name ? featherSource(name, scaled) : source}
      fadeDuration={0}
      accessible={Boolean(label)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      resizeMode="contain"
      style={[{ width: scaled, height: scaled, tintColor: color ?? colors.text }, flip ? { transform: [{ scaleX: rtlSign(direction) }] } : null, style]}
    />
  );
}
