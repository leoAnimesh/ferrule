import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, interpolate, Overlay, PanResponder, Platform, ScrollView, StyleSheet, useAnimatedStyle, useControllableState, useInsets, useOverlayMotion, useSharedValue, useSlot, useNativeVariant, useTheme, useWindowDimensions, View, withTiming, type StyleProp, type ViewStyle } from '@leoanimesh/ferrule';
import { CloseButton } from './modal';
import { Text } from './text';

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** When false, nothing but your own controls can close it. */
  dismissible?: boolean;
  closeLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /**
   * Renders the system sheet when `@leoanimesh/ferrule-native` is available. Only with `nativeActions`, because a
   * system sheet cannot hold React children; without them the Ferrule sheet is used.
   */
  native?: boolean;
  nativeActions?: { label: string; role?: 'cancel' | 'destructive'; onPress?: () => void }[];
}

const DISMISS_DISTANCE = 96;
const DISMISS_VELOCITY = 1;

export function Sheet({ native, nativeActions, open, defaultOpen = false, onOpenChange, title, description, children, footer, dismissible = true, closeLabel = 'Close', style, testID }: SheetProps) {
  const NativeOverlay = useNativeVariant<Record<string, unknown>>('sheet', nativeActions ? native : false);
  const { colors, tokens } = useTheme();
  const slot = useSlot('sheet', 'container');
  const insets = useInsets();
  const { height } = useWindowDimensions();
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const close = () => setOpen(false);

  const drag = useSharedValue(0);
  useEffect(() => {
    if (isOpen) drag.value = 0;
  }, [isOpen, drag]);

  const motion = useOverlayMotion(isOpen);
  const { progress } = motion;
  const slide = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [height, 0]) + drag.value }],
  }));

  // The latest close and dismissible are read at gesture time, since the responder is only built once.
  const latest = useRef({ close, dismissible });
  latest.current = { close, dismissible };
  const handle = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => latest.current.dismissible,
      onMoveShouldSetPanResponder: (_, g) => latest.current.dismissible && Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => {
        drag.value = Math.max(0, g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) latest.current.close();
        else drag.value = withTiming(0, { duration: 120 });
      },
      onPanResponderTerminate: () => {
        drag.value = 0;
      },
    }),
  ).current;

  if (NativeOverlay) return <NativeOverlay open={isOpen} onOpenChange={setOpen} title={title} message={description} actions={nativeActions} testID={testID} />;

  return (
    <Overlay motion={motion} visible={isOpen} onRequestClose={close} dismissible={dismissible} label={title} placement="bottom" testID={testID} contentStyle={styles.box}>
      <Animated.View
        style={[
          {
            maxHeight: height * 0.9,
            paddingBottom: insets.bottom,
            borderTopStartRadius: tokens.radius.lg,
            borderTopEndRadius: tokens.radius.lg,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderBottomWidth: 0,
            boxShadow: tokens.shadow.lg,
          },
          slide,
          slot,
          style,
        ]}
      >
          {/* Screen readers skip the drag handle. They close with the close button or the escape gesture. */}
          <View {...handle.panHandlers} aria-hidden style={[styles.handleArea, Platform.OS === 'web' ? ({ cursor: 'grab', touchAction: 'none' } as unknown as ViewStyle) : null]}>
            <View style={[styles.handle, { backgroundColor: colors.controlBorder }]} />
          </View>
          <View style={[styles.header, { paddingStart: tokens.space[5], paddingEnd: tokens.space[2] }]}>
            <View style={[styles.headerText, { paddingTop: tokens.space[2] }]}>
              <Text variant="h2">{title}</Text>
              {description ? <Text variant="bodySmall" tone="muted">{description}</Text> : null}
            </View>
            {dismissible ? <CloseButton label={closeLabel} onPress={close} /> : null}
          </View>
          <ScrollView style={styles.body} contentContainerStyle={{ padding: tokens.space[5], gap: tokens.space[3] }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={[styles.footer, { padding: tokens.space[4], gap: tokens.space[2], borderTopColor: colors.border }]}>{footer}</View> : null}
      </Animated.View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  // Centered with a max width so it does not stretch edge to edge on tablets, desktop and web.
  box: { width: '100%', maxWidth: 640, flexShrink: 1 },
  handleArea: { alignItems: 'center', paddingVertical: 10 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  headerText: { flex: 1, gap: 2 },
  body: { flexGrow: 0, flexShrink: 1 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', borderTopWidth: 1 },
});
