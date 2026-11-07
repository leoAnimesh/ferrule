import { useCallback, useEffect, useRef, type ComponentRef, type ReactNode } from 'react';
import { Keyboard, Modal as RNModal, Platform, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { TopLayerOutlet, useDirection, useOverlayLayer, useTheme } from './context';
import { Animated, EASE_OUT, useAnimatedStyle, useSharedValue, withTiming, type OverlayMotion } from './motion';
import { Pressable } from './primitives';

export interface OverlayProps {
  /** From `useOverlayMotion(open)`. The same progress drives the backdrop and your content. */
  motion: OverlayMotion;
  /** Whether it is logically open. */
  visible: boolean;
  /** Called on Android back, Escape, the VoiceOver escape gesture, and backdrop press. */
  onRequestClose: () => void;
  /** When false, none of those close it. Use only when an explicit choice is required. */
  dismissible?: boolean;
  /** Accessible name of the dialog. */
  label: string;
  /** Accessible name of the backdrop dismiss control. */
  dismissLabel?: string;
  placement: 'center' | 'bottom';
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

let scrollLocks = 0;
let unlockScroll = () => {};

/** Web only: what sits behind a dialog stays put. Counted, because overlays can stack. */
function useWebScrollLock(active: boolean) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !active) return;
    if (scrollLocks++ === 0) {
      const { style, clientWidth } = document.documentElement;
      const { overflow, paddingRight } = style;
      // Losing a classic scrollbar would otherwise shift the page sideways.
      style.paddingRight = `${window.innerWidth - clientWidth}px`;
      style.overflow = 'hidden';
      unlockScroll = () => Object.assign(style, { overflow, paddingRight });
    }
    return () => {
      if (--scrollLocks === 0) unlockScroll();
    };
  }, [active]);
}

/**
 * The shared base of Modal and Sheet, built on RN's Modal because that brings OS-level focus
 * trapping and restoration: native windows on iOS and Android, a focus trap on web.
 *
 * shortcut: two sibling overlays cannot be open together on iOS (one window at a time), render the
 * second inside the first's content until a queued overlay manager is needed.
 */
/**
 * Lifts content above the keyboard with Reanimated. Android too: an edge-to-edge window does not resize for the
 * keyboard. The overlap is measured, so a window that does resize gets no padding. Not useAnimatedKeyboard:
 * it is deprecated in Reanimated 4. React Native's keyboard events also reach a Modal on every platform.
 */
function useKeyboardPadding() {
  const { tokens } = useTheme();
  const padding = useSharedValue(0);
  const frameBottom = useRef(0);
  const keyboardTop = useRef(Number.POSITIVE_INFINITY);
  const update = (duration: number) => {
    padding.value = withTiming(Math.max(frameBottom.current - keyboardTop.current, 0), { duration, easing: EASE_OUT });
  };
  const latest = useRef(update);
  latest.current = update;
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const shown = Keyboard.addListener(ios ? 'keyboardWillChangeFrame' : 'keyboardDidShow', (event) => {
      keyboardTop.current = event.endCoordinates.screenY;
      latest.current(event.duration || tokens.motion.normal);
    });
    const hidden = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', (event) => {
      keyboardTop.current = Number.POSITIVE_INFINITY;
      latest.current(event.duration || tokens.motion.normal);
    });
    return () => {
      shown.remove();
      hidden.remove();
    };
  }, [tokens.motion.normal]);
  const style = useAnimatedStyle(() => ({ paddingBottom: padding.value }));
  const onLayout = (event: LayoutChangeEvent) => {
    frameBottom.current = event.nativeEvent.layout.y + event.nativeEvent.layout.height;
    update(0);
  };
  return { style, onLayout };
}

export function Overlay({ motion, visible, onRequestClose, dismissible = true, label, dismissLabel = 'Dismiss', placement, children, contentStyle, testID }: OverlayProps) {
  const { colors } = useTheme();
  const direction = useDirection();
  const layerId = useOverlayLayer(visible);
  const { progress, rendered } = motion;
  useWebScrollLock(rendered);
  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));
  const keyboard = useKeyboardPadding();
  const close = dismissible ? onRequestClose : () => {};

  // react-native-web's Modal already renders role="dialog" with aria-modal but offers no way to name it.
  const nameWebDialog = useCallback(
    (node: ComponentRef<typeof View> | null) => {
      if (Platform.OS === 'web') (node as unknown as HTMLElement | null)?.closest('[aria-modal="true"]')?.setAttribute('aria-label', label);
    },
    [label],
  );

  return (
    <RNModal
      visible={rendered}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <View style={StyleSheet.absoluteFill} {...(Platform.OS === 'web' ? ({ dir: direction } as object) : null)}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.passThrough, { backgroundColor: colors.overlay }, backdrop]} />
        {Platform.OS === 'web' ? (
          // A plain element on web: the focus trap focuses anything it can, and a button here would take first focus from the dialog.
          <View testID={testID ? `${testID}-backdrop` : undefined} style={StyleSheet.absoluteFill} {...({ onClick: close } as object)} />
        ) : (
          <Pressable testID={testID ? `${testID}-backdrop` : undefined} style={StyleSheet.absoluteFill} onPress={close} disabled={!dismissible} aria-label={dismissLabel} role="button" />
        )}
        <Animated.View onLayout={keyboard.onLayout} style={[styles.fill, styles.boxNone, keyboard.style]}>
          <View style={[styles.fill, styles.boxNone, placement === 'center' ? styles.center : styles.bottom]}>
            <View
              ref={nameWebDialog}
              testID={testID}
              {...(Platform.OS === 'web' ? null : { role: 'dialog' as const, 'aria-modal': true, 'aria-label': label })}
              accessibilityViewIsModal
              onAccessibilityEscape={close}
              style={contentStyle}
            >
              {children}
            </View>
          </View>
        </Animated.View>
        <TopLayerOutlet layerId={layerId} />
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  passThrough: { pointerEvents: 'none' },
  boxNone: { pointerEvents: 'box-none' },
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  bottom: { alignItems: 'center', justifyContent: 'flex-end' },
});
