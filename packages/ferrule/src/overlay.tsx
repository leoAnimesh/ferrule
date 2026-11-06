import { useCallback, type ComponentRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal as RNModal, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { TopLayerOutlet, useDirection, useOverlayLayer, useTheme } from './context';
import { Animated, useAnimatedStyle, type OverlayMotion } from './motion';
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

/**
 * The shared base of Modal and Sheet, built on RN's Modal because that brings OS-level focus
 * trapping and restoration: native windows on iOS and Android, a focus trap on web.
 *
 * shortcut: two sibling overlays cannot be open together on iOS (one window at a time), render the
 * second inside the first's content until a queued overlay manager is needed.
 */
export function Overlay({ motion, visible, onRequestClose, dismissible = true, label, dismissLabel = 'Dismiss', placement, children, contentStyle, testID }: OverlayProps) {
  const { colors } = useTheme();
  const direction = useDirection();
  const layerId = useOverlayLayer(visible);
  const { progress, rendered } = motion;
  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.fill, styles.boxNone, placement === 'center' ? styles.center : styles.bottom]}
        >
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
        </KeyboardAvoidingView>
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
