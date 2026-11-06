import { useEffect } from 'react';
import { Animated, cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, useNativeVariant, useTheme, withRepeat, withTiming, type StyleProp, type ViewStyle } from 'ferrule';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  /** Accessible name. Pass `null` when a parent already announces the busy state. */
  label?: string | null;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Renders the platform's own activity indicator when ferrule-native is available. */
  native?: boolean;
}

const DIAMETER = { sm: 16, md: 24, lg: 36 };

/** A drawn ring rather than ActivityIndicator, whose look and size vary by platform. Still under reduced motion. */
export function Spinner({ size = 'md', color, label = 'Loading', style, testID, native }: SpinnerProps) {
  const NativeSpinner = useNativeVariant<Record<string, unknown>>('spinner', native);
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const degrees = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    degrees.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(degrees);
  }, [reducedMotion, degrees]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${degrees.value}deg` }] }));
  const diameter = DIAMETER[size];
  const stroke = color ?? colors.primary;
  if (NativeSpinner) return <NativeSpinner kind="circular" size={size} a11yLabel={label ?? undefined} testID={testID} style={style} />;

  return (
    <Animated.View
      testID={testID}
      accessible={label !== null}
      role={label === null ? undefined : 'progressbar'}
      aria-label={label ?? undefined}
      aria-busy
      aria-hidden={label === null || undefined}
      style={[
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          borderWidth: Math.max(2, Math.round(diameter / 10)),
          borderColor: stroke,
          borderTopColor: 'transparent',
        },
        spin,
        style,
      ]}
    />
  );
}
