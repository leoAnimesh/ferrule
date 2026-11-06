import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, FadeInDown, FadeOut, Platform, StyleSheet, useInsets, useSlot, useTheme, useTopLayer, View } from 'ferrule';
import { CloseButton } from './modal';
import { Button } from './button';
import { Text } from './text';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. `null` keeps it until dismissed. Default 5000. */
  duration?: number | null;
  action?: { label: string; onPress: () => void };
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

/** Wrap your app once, inside FerruleProvider. Toasts render above modals and sheets. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((toast) => toast.id !== id)), []);
  const show = useCallback((options: ToastOptions) => {
    const id = nextId.current++;
    setToasts((all) => [...all, { ...options, id }].slice(-MAX_VISIBLE));
    return id;
  }, []);
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  const viewport = useMemo(() => (toasts.length ? <ToastViewport toasts={toasts} dismiss={dismiss} /> : null), [toasts, dismiss]);
  useTopLayer(viewport);

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>.');
  return api;
}

function ToastViewport({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: number) => void }) {
  const { tokens } = useTheme();
  const insets = useInsets();
  return (
    <View style={[styles.viewport, { paddingBottom: insets.bottom + tokens.space[4], paddingHorizontal: tokens.space[4], gap: tokens.space[2] }]}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </View>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const { colors, tokens } = useTheme();
  const slot = useSlot('toast', 'container');
  const [paused, setPaused] = useState(false);

  // iOS ignores live regions, so it has to be announced explicitly.
  const announcement = toast.description ? `${toast.title}. ${toast.description}` : toast.title;
  useEffect(() => {
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility?.(announcement);
  }, [announcement]);

  // Pausing on hover and focus meets WCAG 2.2.1 where a pointer or keyboard exists.
  const duration = toast.duration === undefined ? 5000 : toast.duration;
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
      entering={FadeInDown.duration(tokens.motion.normal)}
      exiting={FadeOut.duration(tokens.motion.fast)}
      role={toast.tone === 'danger' ? 'alert' : 'status'}
      aria-live={toast.tone === 'danger' ? 'assertive' : 'polite'}
      accessibilityLiveRegion={toast.tone === 'danger' ? 'assertive' : 'polite'}
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
  viewport: { position: 'absolute', start: 0, end: 0, bottom: 0, alignItems: 'center', pointerEvents: 'box-none' },
  toast: { width: '100%', maxWidth: 480, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  text: { flex: 1, gap: 2 },
  action: { alignSelf: 'center' },
});
