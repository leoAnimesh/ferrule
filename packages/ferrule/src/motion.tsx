import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from './context';

// Re-exported so copied components and app code have one import source.
export {
  default as Animated,
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
export type { SharedValue } from 'react-native-reanimated';

/** Fast out, long settle: the one curve for state changes across all components. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export interface OverlayMotion {
  /** 0 when hidden, 1 when fully shown. */
  progress: SharedValue<number>;
  /** Stays true through the exit animation, so content is not removed mid-animation. */
  rendered: boolean;
}

/**
 * Drives an overlay's enter and exit. withTiming follows the OS reduced-motion setting by default,
 * jumping to the end value, so overlays still open and close there.
 */
export function useOverlayMotion(visible: boolean): OverlayMotion {
  const { tokens } = useTheme();
  const [rendered, setRendered] = useState(visible);
  const progress = useSharedValue(0);

  // An exit callback can arrive after a quick reopen, so it re-checks the latest state on the JS side.
  const latestVisible = useRef(visible);
  latestVisible.current = visible;
  const finishExit = useCallback(() => {
    if (!latestVisible.current) setRendered(false);
  }, []);

  useEffect(() => {
    if (visible) setRendered(true);
    else if (progress.value === 0) {
      setRendered(false); // Nothing has been shown yet, so there is nothing to animate out.
      return;
    }
    progress.value = withTiming(visible ? 1 : 0, { duration: tokens.motion.normal, easing: EASE_OUT }, (finished) => {
      if (finished && !visible) runOnJS(finishExit)();
    });
    return () => cancelAnimation(progress);
  }, [visible, progress, finishExit, tokens.motion.normal]);

  return { progress, rendered };
}

export interface StateLayerProps {
  pressed: boolean;
  hovered?: boolean;
  /** Usually the foreground color of the control. */
  color: string;
  radius?: number;
  pressedOpacity?: number;
  hoveredOpacity?: number;
}

/** The shared press and hover feedback: a tinted layer that fades in, so all controls respond alike. */
export function StateLayer({ pressed, hovered = false, color, radius = 0, pressedOpacity = 0.18, hoveredOpacity = 0.08 }: StateLayerProps) {
  const { tokens } = useTheme();
  const opacity = useSharedValue(0);
  const target = pressed ? pressedOpacity : hovered ? hoveredOpacity : 0;

  useEffect(() => {
    opacity.value = withTiming(target, { duration: tokens.motion.fast, easing: EASE_OUT });
    return () => cancelAnimation(opacity);
  }, [target, opacity, tokens.motion.fast]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View aria-hidden style={[StyleSheet.absoluteFill, styles.layer, { backgroundColor: color, borderRadius: radius }, animated]} />;
}

export interface BandProps {
  visible: boolean;
  color: string;
  thickness?: number;
  style?: ViewStyle;
}

/** Ferrule's signature mark: a solid strip of ink along a control's edge that says it is active. It grows from the center, so it needs no RTL case. */
export function Band({ visible, color, thickness = 2, style }: BandProps) {
  const { tokens } = useTheme();
  const width = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    width.value = withTiming(visible ? 1 : 0, { duration: tokens.motion.normal, easing: EASE_OUT });
    return () => cancelAnimation(width);
  }, [visible, width, tokens.motion.normal]);

  const animated = useAnimatedStyle(() => ({ opacity: width.value > 0 ? 1 : 0, transform: [{ scaleX: width.value }] }));
  return <Animated.View aria-hidden style={[styles.band, { height: thickness, backgroundColor: color }, style, animated]} />;
}

const styles = StyleSheet.create({
  band: { position: 'absolute', start: 0, end: 0, bottom: -1, pointerEvents: 'none' },
  layer: { pointerEvents: 'none' },
});
