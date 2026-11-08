import { forwardRef, useEffect, type ComponentRef, type ReactNode } from 'react';
import { Animated, cancelAnimation, EASE_OUT, Easing, useAnimatedStyle, useDirection, useSharedValue, useSlot, useTheme, View, withTiming, rtlSign, type StyleProp, type ViewStyle } from 'ferrule';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function useProgress(value: number, duration: number | undefined) {
  const { tokens } = useTheme();
  const target = clamp(value);
  const progress = useSharedValue(target);
  useEffect(() => {
    progress.value = withTiming(target, duration === undefined ? { duration: tokens.motion.normal, easing: EASE_OUT } : { duration, easing: Easing.linear });
    return () => cancelAnimation(progress);
  }, [target, duration, progress, tokens.motion.normal]);
  return { progress, target };
}

export interface ProgressProps {
  /** 0 to 1. */
  value: number;
  /** What is progressing, for screen readers. */
  label: string;
  /** Milliseconds, linear, for values fed by a clock. Unset eases over the theme's normal duration. */
  duration?: number;
  /** Bar height, or ring stroke. */
  thickness?: number;
  color?: string;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A horizontal progress bar. */
export const Progress = forwardRef<ComponentRef<typeof View>, ProgressProps>(function Progress({ value, label, duration, thickness = 6, color, trackColor, style, testID }, ref) {
  const { colors, tokens } = useTheme();
  const slot = useSlot('progress', 'container');
  const { progress, target } = useProgress(value, duration);
  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View ref={ref} testID={testID} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(target * 100)} style={[{ height: thickness, borderRadius: tokens.radius.full, overflow: 'hidden', backgroundColor: trackColor ?? colors.surfaceMuted }, slot, style]}>
      <Animated.View style={[{ height: '100%', borderRadius: tokens.radius.full, backgroundColor: color ?? colors.primary }, fill]} />
    </View>
  );
});

export interface ProgressRingProps extends ProgressProps {
  size?: number;
  /** Centered in the ring, for a value or a label. */
  children?: ReactNode;
}

/**
 * A circular progress indicator from clipped half rings, so it needs no SVG dependency.
 * It runs clockwise from the top, and mirrors in right-to-left like the rest of the layout.
 */
export const ProgressRing = forwardRef<ComponentRef<typeof View>, ProgressRingProps>(function ProgressRing({ value, label, duration, thickness = 8, color, trackColor, size = 120, style, testID, children }, ref) {
  const { colors } = useTheme();
  const slot = useSlot('progress', 'container');
  const direction = useDirection();
  const sign = rtlSign(direction);
  const { progress, target } = useProgress(value, duration);
  const stroke = color ?? colors.primary;
  const half = size / 2;

  const firstHalf = useAnimatedStyle(() => ({ transform: [{ rotate: `${sign * Math.min(progress.value, 0.5) * 360}deg` }] }));
  const secondHalf = useAnimatedStyle(() => ({ transform: [{ rotate: `${sign * Math.max(progress.value - 0.5, 0) * 360}deg` }] }));
  const head = useAnimatedStyle(() => ({ opacity: progress.value > 0 ? 1 : 0, transform: [{ rotate: `${sign * progress.value * 360}deg` }] }));
  const tail = useAnimatedStyle(() => ({ opacity: progress.value > 0 ? 1 : 0 }));

  const ring = { width: size, height: size, borderRadius: half, borderWidth: thickness, borderColor: stroke };
  const cap = { position: 'absolute', top: 0, start: half - thickness / 2, width: thickness, height: thickness, borderRadius: thickness / 2, backgroundColor: stroke } as const;
  return (
    <View ref={ref} testID={testID} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(target * 100)} style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, slot, style]}>
      <View aria-hidden style={{ position: 'absolute', top: 0, start: 0, width: size, height: size, borderRadius: half, borderWidth: thickness, borderColor: trackColor ?? colors.surfaceMuted }} />
      {/* Each half window shows a half ring that starts hidden on the far side, and turns into view. */}
      <View aria-hidden style={{ position: 'absolute', top: 0, end: 0, width: half, height: size, overflow: 'hidden' }}>
        <Animated.View style={[{ position: 'absolute', top: 0, end: 0, width: size, height: size, transform: [{ rotate: '0deg' }] }, firstHalf]}>
          <View style={{ position: 'absolute', top: 0, start: 0, width: half, height: size, overflow: 'hidden' }}>
            <View style={ring} />
          </View>
        </Animated.View>
      </View>
      <View aria-hidden style={{ position: 'absolute', top: 0, start: 0, width: half, height: size, overflow: 'hidden' }}>
        <Animated.View style={[{ position: 'absolute', top: 0, start: 0, width: size, height: size, transform: [{ rotate: '0deg' }] }, secondHalf]}>
          <View style={{ position: 'absolute', top: 0, end: 0, width: half, height: size, overflow: 'hidden' }}>
            <View style={[ring, { position: 'absolute', end: 0 }]} />
          </View>
        </Animated.View>
      </View>
      {/* Round ends on the stroke. */}
      <Animated.View aria-hidden style={[cap, tail]} />
      <Animated.View aria-hidden style={[{ position: 'absolute', top: 0, start: 0, width: size, height: size }, head]}>
        <View style={cap} />
      </Animated.View>
      {children}
    </View>
  );
});
