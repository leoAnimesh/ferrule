import { type ReactNode } from 'react';
import { Animated, FocusRing, interpolate, Overlay, Pressable, ScrollView, StateLayer, StyleSheet, useAnimatedStyle, useControllableState, useInsets, useOverlayMotion, useSlot, useNativeVariant, useTheme, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'ferrule';
import { Text } from './text';

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Action buttons. */
  footer?: ReactNode;
  /** When false, backdrop, back button and Escape do not close it, and no close button is shown. Require a choice in the footer. */
  dismissible?: boolean;
  closeLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /**
   * Renders the system alert when ferrule-native is available. Only with `nativeActions`, because a
   * system alert cannot hold React children; without them the Ferrule modal is used.
   */
  native?: boolean;
  nativeActions?: { label: string; role?: 'cancel' | 'destructive'; onPress?: () => void }[];
}

/** Shared by Modal and Sheet. Lines drawn in Views, so it does not depend on a glyph. */
export function CloseButton({ label, color, onPress }: { label: string; color?: string; onPress: () => void }) {
  const { colors, tokens } = useTheme();
  const ink = color ?? colors.text;
  return (
    <Pressable role="button" aria-label={label} onPress={onPress} style={[styles.close, { minWidth: tokens.minTouchTarget, minHeight: tokens.minTouchTarget }]}>
      {({ hovered, pressed, focused }) => (
        <>
          <StateLayer pressed={pressed} hovered={hovered} color={ink} radius={tokens.radius.md} pressedOpacity={0.14} hoveredOpacity={0.07} />
          <View style={[styles.crossLine, { backgroundColor: ink, transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.crossLine, { backgroundColor: ink, transform: [{ rotate: '-45deg' }] }]} />
          <FocusRing visible={focused} radius={tokens.radius.md} />
        </>
      )}
    </Pressable>
  );
}

export function Modal({ native, nativeActions, open, defaultOpen = false, onOpenChange, title, description, children, footer, dismissible = true, closeLabel = 'Close', style, testID }: ModalProps) {
  const NativeOverlay = useNativeVariant<Record<string, unknown>>('modal', nativeActions ? native : false);
  const { colors, tokens } = useTheme();
  const slot = useSlot('modal', 'container');
  const insets = useInsets();
  const { height } = useWindowDimensions();
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const close = () => setOpen(false);
  const maxHeight = height - insets.top - insets.bottom - tokens.space[8];
  const motion = useOverlayMotion(isOpen);
  const { progress } = motion;
  const enter = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.97, 1]) }],
  }));

  if (NativeOverlay) return <NativeOverlay open={isOpen} onOpenChange={setOpen} title={title} message={description} actions={nativeActions} testID={testID} />;

  return (
    <Overlay motion={motion} visible={isOpen} onRequestClose={close} dismissible={dismissible} label={title} placement="center" testID={testID} contentStyle={styles.dialogBox}>
      <Animated.View
        style={[
          {
            maxHeight,
            borderRadius: tokens.radius.lg,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            boxShadow: tokens.shadow.lg,
          },
          enter,
          slot,
          style,
        ]}
      >
          <View style={[styles.header, { paddingStart: tokens.space[5], paddingEnd: tokens.space[2], paddingTop: tokens.space[2] }]}>
            <View style={[styles.headerText, { paddingTop: tokens.space[2] }]}>
              <Text variant="h2">{title}</Text>
              {description ? <Text variant="bodySmall" tone="muted">{description}</Text> : null}
            </View>
            {dismissible ? <CloseButton label={closeLabel} onPress={close} /> : null}
          </View>
          {/* flexShrink lets long content scroll within maxHeight rather than pushing the footer off-screen. */}
          <ScrollView style={styles.body} contentContainerStyle={{ padding: tokens.space[5], gap: tokens.space[3] }}>
            {children}
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, { padding: tokens.space[4], gap: tokens.space[2], borderTopColor: colors.border }]}>{footer}</View>
          ) : null}
      </Animated.View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  dialogBox: { width: '100%', maxWidth: 560, flexShrink: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  headerText: { flex: 1, gap: 2 },
  body: { flexGrow: 0, flexShrink: 1 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', borderTopWidth: 1 },
  close: { alignItems: 'center', justifyContent: 'center' },
  crossLine: { position: 'absolute', width: 16, height: 2, borderRadius: 1, pointerEvents: 'none' },
});
