import { forwardRef, useEffect, useState, type ComponentRef, type ReactNode } from 'react';
import { Animated, Image as BaseImage, StyleSheet, useAnimatedStyle, useReducedMotion, useSharedValue, useSlot, useTheme, View, withTiming, type ImageProps as BaseImageProps, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'ferrule';
import { Text } from './text';

export interface ImageProps extends Omit<BaseImageProps, 'source' | 'style' | 'alt'> {
  /** URL or a bundled `require()`. A missing source shows the fallback. */
  source?: ImageSourcePropType | string | null;
  /** What the image shows. Use `""` for purely decorative images, which screen readers then skip. */
  alt: string;
  aspectRatio?: number;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Shown when the source is missing or fails. Defaults to a muted box with the alt text, or a small image mark when the image is decorative. */
  fallback?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Image = forwardRef<ComponentRef<typeof BaseImage>, ImageProps>(function Image(
  { source, alt, aspectRatio, radius = 'md', fallback, style, onError, onLoad, resizeMode = 'cover', ...rest },
  ref,
) {
  const { colors, tokens } = useTheme();
  const slot = useSlot('image', 'container');
  const resolved: ImageSourcePropType | null = typeof source === 'string' ? (source ? { uri: source } : null) : (source ?? null);
  const sourceKey = JSON.stringify(resolved);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));
  useEffect(() => {
    setStatus('loading');
    opacity.value = 0;
  }, [sourceKey]);

  const failed = !resolved || status === 'failed';
  return (
    <View
      accessible={Boolean(alt)}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      style={[{ overflow: 'hidden', aspectRatio, borderRadius: tokens.radius[radius], backgroundColor: colors.surfaceMuted }, slot, style]}
    >
      {failed ? (
        <View style={styles.center}>
          {fallback ?? (alt ? <Text variant="caption" tone="muted" numberOfLines={2} style={styles.alt}>{alt}</Text> : <View testID="image-failed" style={[styles.mark, { borderColor: colors.textMuted, borderRadius: tokens.radius.sm }]} />)}
        </View>
      ) : (
        // The muted box behind is the placeholder, and it holds the layout while the photo loads.
        <Animated.View style={[StyleSheet.absoluteFill, fade]}>
          <BaseImage
            ref={ref}
            {...rest}
            source={resolved}
            resizeMode={resizeMode}
            aria-hidden
            onLoad={(e) => {
              setStatus('loaded');
              opacity.value = reducedMotion ? 1 : withTiming(1, { duration: tokens.motion.normal });
              onLoad?.(e);
            }}
            onError={(e) => {
              setStatus('failed');
              onError?.(e);
            }}
            // Explicit size: a bundled `require()` otherwise brings its file's width and height, which beat absolute edges.
            style={[StyleSheet.absoluteFill, styles.fill]}
          />
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  center: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, alignItems: 'center', justifyContent: 'center', padding: 8 },
  alt: { textAlign: 'center' },
  mark: { width: 24, height: 18, borderWidth: 1.5, opacity: 0.5 },
});
