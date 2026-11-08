import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutUp, Platform, StyleSheet, useInsets, useSlot, useTheme, useTopLayer, View, ZoomIn, ZoomOut, type StyleProp, type ViewStyle } from '@leoanimesh/ferrule';
import { CloseButton } from './modal';
import { Button } from './button';
import { Text } from './text';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';

export type ToastPosition = 'top' | 'bottom';
export type ToastAlign = 'start' | 'center' | 'end';
/** `slide` is a short slide with a fade, moving from the toast's edge. */
export type ToastAnimationPreset = 'slide' | 'fade' | 'scale' | 'none';
/** One preset for both, or separate ones for opening and closing. */
export type ToastAnimation = ToastAnimationPreset | { enter?: ToastAnimationPreset; exit?: ToastAnimationPreset };

export interface ToastConfig {
  position?: ToastPosition;
  /** Only shows above 512dp wide. Narrower windows are filled, within the margins. */
  align?: ToastAlign;
  /** Milliseconds before auto-dismiss. `null` keeps it until dismissed. Default 5000, also with an `action`. */
  duration?: number | null;
  /** Default: `{ enter: 'slide', exit: 'fade' }`. Reduced motion skips the movement. */
  animation?: ToastAnimation;
  /** Milliseconds, for both opening and closing. Default: the theme's `motion.normal` to open and `motion.fast` to close. */
  animationDuration?: number;
}

export interface ToastOptions extends ToastConfig {
  title: string;
  description?: string;
  tone?: ToastTone;
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface ToastProviderProps extends ToastConfig {
  children: ReactNode;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastApi {
  show: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const MAX_VISIBLE = 3;
const POSITIONS: ToastPosition[] = ['top', 'bottom'];
const ALIGNS: ToastAlign[] = ['start', 'center', 'end'];
const ALIGN_ITEMS = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

const announcementOf = (toast: ToastOptions) => (toast.description ? `${toast.title}. ${toast.description}` : toast.title);

const presets = (animation: ToastAnimation | undefined) => (typeof animation === 'string' ? { enter: animation, exit: animation } : animation);

/** The Reanimated builders for a toast. A toast's own `animation` beats the provider's, per direction. */
export function toastMotion(position: ToastPosition, motion: { normal: number; fast: number }, own?: Pick<ToastConfig, 'animation' | 'animationDuration'>, defaults?: Pick<ToastConfig, 'animation' | 'animationDuration'>) {
  const enter = presets(own?.animation)?.enter ?? presets(defaults?.animation)?.enter ?? 'slide';
  const exit = presets(own?.animation)?.exit ?? presets(defaults?.animation)?.exit ?? 'fade';
  const duration = own?.animationDuration ?? defaults?.animationDuration;
  const top = position === 'top';
  const entering = enter === 'none' ? undefined : { slide: top ? FadeInUp : FadeInDown, fade: FadeIn, scale: ZoomIn }[enter];
  const exiting = exit === 'none' ? undefined : { slide: top ? FadeOutUp : FadeOutDown, fade: FadeOut, scale: ZoomOut }[exit];
  return { entering: entering?.duration(duration ?? motion.normal), exiting: exiting?.duration(duration ?? motion.fast) };
}

/** Wrap your app once, inside FerruleProvider. Toasts render above modals and sheets. The config props are defaults, and a toast's own options win. */
export function ToastProvider({ children, ...defaults }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((toast) => toast.id !== id)), []);
  const show = useCallback((options: ToastOptions) => {
    const id = nextId.current++;
    setToasts((all) => [...all, { ...options, id }].slice(-MAX_VISIBLE));
    return id;
  }, []);
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  const { position, align, duration, animation, animationDuration } = defaults;
  const viewport = useMemo(
    () => <ToastViewport toasts={toasts} dismiss={dismiss} defaults={{ position, align, duration, animation, animationDuration }} />,
    [toasts, dismiss, position, align, duration, animation, animationDuration],
  );
  useTopLayer(viewport);

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>.');
  return api;
}

// Every stack stays mounted and fills the window, so the last toast out of one plays its exit animation from where it was.
function ToastViewport({ toasts, dismiss, defaults }: { toasts: ToastItem[]; dismiss: (id: number) => void; defaults: ToastConfig }) {
  const { tokens } = useTheme();
  const insets = useInsets();
  return (
    <>
      {/* Browsers only announce text added to a live region that already exists, and these do. Native announces from the toast itself. */}
      {Platform.OS === 'web'
        ? ([['status', 'polite'], ['alert', 'assertive']] as const).map(([role, live]) => (
            <View key={role} role={role} aria-live={live} style={styles.announcer}>
              {toasts.filter((toast) => (toast.tone === 'danger') === (role === 'alert')).map((toast) => <Text key={toast.id}>{announcementOf(toast)}</Text>)}
            </View>
          ))
        : null}
      {POSITIONS.flatMap((position) =>
        ALIGNS.map((align) => {
          const stack = toasts.filter((toast) => (toast.position ?? defaults.position ?? 'bottom') === position && (toast.align ?? defaults.align ?? 'center') === align);
          // The newest toast sits nearest its edge.
          if (position === 'top') stack.reverse();
          return (
            <View
              key={`${position}-${align}`}
              style={[
                styles.stack,
                position === 'top' ? { justifyContent: 'flex-start', paddingTop: insets.top + tokens.space[4] } : { justifyContent: 'flex-end', paddingBottom: insets.bottom + tokens.space[4] },
                { alignItems: ALIGN_ITEMS[align], paddingHorizontal: tokens.space[4], gap: tokens.space[2] },
              ]}
            >
              {stack.map((toast) => (
                <Toast key={toast.id} toast={toast} position={position} defaults={defaults} onDismiss={() => dismiss(toast.id)} />
              ))}
            </View>
          );
        }),
      )}
    </>
  );
}

function Toast({ toast, position, defaults, onDismiss }: { toast: ToastItem; position: ToastPosition; defaults: ToastConfig; onDismiss: () => void }) {
  const { colors, tokens } = useTheme();
  const slot = useSlot('toast', 'container');
  const [paused, setPaused] = useState(false);

  // iOS ignores live regions, so it has to be announced explicitly.
  const announcement = announcementOf(toast);
  useEffect(() => {
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility?.(announcement);
  }, [announcement]);

  // Pausing on hover and focus meets WCAG 2.2.1 where a pointer or keyboard exists.
  const duration = toast.duration !== undefined ? toast.duration : defaults.duration !== undefined ? defaults.duration : 5000;
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  useEffect(() => {
    if (duration === null || paused) return;
    const timer = setTimeout(() => dismissRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration, paused]);

  const { fill, edge, ink } = {
    neutral: { fill: colors.surface, edge: colors.border, ink: colors.text },
    success: { fill: colors.successSoft, edge: colors.success, ink: colors.onSuccessSoft },
    warning: { fill: colors.warningSoft, edge: colors.warning, ink: colors.onWarningSoft },
    danger: { fill: colors.dangerSoft, edge: colors.danger, ink: colors.onDangerSoft },
  }[toast.tone ?? 'neutral'];
  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <Animated.View
      {...toastMotion(position, tokens.motion, toast, defaults)}
      testID={toast.testID}
      {...(Platform.OS === 'web' ? null : { role: toast.tone === 'danger' ? 'alert' as const : 'status' as const, 'aria-live': toast.tone === 'danger' ? 'assertive' as const : 'polite' as const, accessibilityLiveRegion: toast.tone === 'danger' ? 'assertive' as const : 'polite' as const })}
      {...(Platform.OS === 'web' ? ({ onMouseEnter: pause, onMouseLeave: resume, onFocus: pause, onBlur: resume } as object) : null)}
      style={[
        styles.toast,
        {
          padding: tokens.space[3],
          paddingStart: tokens.space[4],
          gap: tokens.space[2],
          borderRadius: tokens.radius.md,
          backgroundColor: fill,
          borderColor: edge,
          boxShadow: tokens.shadow.md,
        },
        slot,
        toast.style,
      ]}
    >
      <View style={styles.text}>
        <Text variant="label" style={{ color: ink }}>{toast.title}</Text>
        {toast.description ? <Text variant="caption" style={{ color: ink }}>{toast.description}</Text> : null}
      </View>
      {toast.action ? (
        <Button
          variant="ghost"
          size="sm"
          style={styles.action}
          onPress={() => {
            toast.action?.onPress();
            onDismiss();
          }}
        >
          {toast.action.label}
        </Button>
      ) : null}
      <CloseButton label="Dismiss notification" color={ink} onPress={onDismiss} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stack: { ...StyleSheet.absoluteFill, pointerEvents: 'box-none' },
  toast: { width: '100%', maxWidth: 480, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  text: { flex: 1, gap: 2 },
  action: { alignSelf: 'center' },
  // Out of sight, not out of the accessibility tree.
  announcer: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' },
});
