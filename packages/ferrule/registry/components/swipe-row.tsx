import { forwardRef, useMemo, useRef, type ComponentRef, type ReactNode } from 'react';
import { Animated, EASE_OUT, PanResponder, rtlSign, StyleSheet, useAnimatedStyle, useDirection, useSharedValue, useSlot, useTheme, View, withTiming, type StyleProp, type ViewStyle } from '@leoanimesh/ferrule';
import { Text } from './text';

export interface SwipeAction {
  label: string;
  tone: 'primary' | 'success' | 'danger';
  /** Drawn before the label on the revealed side. */
  icon?: (color: string) => ReactNode;
  onAction: () => void;
}

export interface SwipeRowProps {
  children: ReactNode;
  /** Revealed by dragging toward the reading direction. */
  startAction?: SwipeAction;
  /** Revealed by dragging against the reading direction. */
  endAction?: SwipeAction;
  /** How far to drag before release runs the action. */
  threshold?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A row with swipe actions. Screen readers get the same actions from the rotor or actions menu.
 * Swiping is not reachable by keyboard, so also offer the actions in a visible control.
 */
export const SwipeRow = forwardRef<ComponentRef<typeof View>, SwipeRowProps>(function SwipeRow({ children, startAction, endAction, threshold = 96, style, testID }, ref) {
  const { colors, tokens } = useTheme();
  const slot = useSlot('swipeRow', 'container');
  const direction = useDirection();
  const x = useSharedValue(0);
  const latest = useRef({ startAction, endAction, threshold, sign: rtlSign(direction) });
  latest.current = { startAction, endAction, threshold, sign: rtlSign(direction) };

  const responder = useMemo(() => {
    const settle = () => { x.value = withTiming(0, { duration: 200, easing: EASE_OUT }); };
    return PanResponder.create({
      // Only a clearly sideways drag: the list around it keeps vertical scrolling.
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        const { startAction: s, endAction: e, sign } = latest.current;
        const logical = g.dx * sign;
        if ((logical > 0 && s) || (logical < 0 && e)) x.value = g.dx;
      },
      onPanResponderRelease: (_, g) => {
        const { startAction: s, endAction: e, threshold: t, sign } = latest.current;
        const logical = g.dx * sign;
        settle();
        if (logical >= t) s?.onAction();
        else if (logical <= -t) e?.onAction();
      },
      onPanResponderTerminate: settle,
    });
  }, [x]);

  const moved = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const bg = { primary: [colors.primary, colors.onPrimary], success: [colors.success, colors.onSuccess], danger: [colors.danger, colors.onDanger] } as const;
  const shows = (action: SwipeAction | undefined, side: 'start' | 'end') => {
    if (!action) return null;
    const [fill, fg] = bg[action.tone];
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: side === 'start' ? 'flex-start' : 'flex-end', gap: tokens.space[2], paddingHorizontal: tokens.space[5], backgroundColor: fill }}>
        {action.icon?.(fg)}
        <Text variant="label" style={{ color: fg }}>{action.label}</Text>
      </View>
    );
  };
  // Only the side being revealed may paint, so each half keeps its own color.
  const sign = rtlSign(direction);
  const startSide = useAnimatedStyle(() => ({ opacity: x.value * sign > 0 ? 1 : 0 }));
  const endSide = useAnimatedStyle(() => ({ opacity: x.value * sign < 0 ? 1 : 0 }));

  const actions = [startAction, endAction].filter((action): action is SwipeAction => Boolean(action));
  return (
    <View
      ref={ref}
      testID={testID}
      accessibilityActions={actions.map((action) => ({ name: action.label, label: action.label }))}
      onAccessibilityAction={(event) => actions.find((action) => action.label === event.nativeEvent.actionName)?.onAction()}
      style={[{ overflow: 'hidden' }, slot, style]}
    >
      <Animated.View aria-hidden style={[StyleSheet.absoluteFill, startSide]}>{shows(startAction, 'start')}</Animated.View>
      <Animated.View aria-hidden style={[StyleSheet.absoluteFill, endSide]}>{shows(endAction, 'end')}</Animated.View>
      <Animated.View {...responder.panHandlers} style={[{ backgroundColor: colors.background }, moved]}>
        {children}
      </Animated.View>
    </View>
  );
});
