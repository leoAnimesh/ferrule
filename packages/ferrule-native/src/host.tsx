import { useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { I18nManager, Platform, UIManager, type NativeSyntheticEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, warnOnce } from 'ferrule';

/** Every hosted view has this shape: a JSON config in, named events and a measured size out. */
export type HostSpec = ComponentType<{
  config: string;
  onFerruleEvent?: (event: NativeSyntheticEvent<{ name: string; value: string }>) => void;
  onFerruleSize?: (event: NativeSyntheticEvent<{ width: number; height: number }>) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

const iosMajor = () => (Platform.OS === 'ios' ? Number.parseInt(String(Platform.Version), 10) : 0);
/** Liquid Glass exists from iOS 26. Below that, hosted views use the same system control without glass. */
export const hasLiquidGlass = () => iosMajor() >= 26;

const linked = new Map<string, boolean>();
/** False on web and in a binary built without this package, such as Expo Go. */
export function isLinked(name: string): boolean {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;
  let value = linked.get(name);
  if (value === undefined) {
    value = UIManager.hasViewManagerConfig(name);
    linked.set(name, value);
    if (!value) warnOnce(`unlinked-${name}`, `${name} is not in this binary. Rebuild the app; Expo Go cannot load ferrule-native.`);
  }
  return value;
}

/** Decides what a host renders. Exported on its own so it can be tested without a device. */
export const pickHost = (spec: unknown, name: string, platforms?: readonly string[]) =>
  Boolean(spec) && (!platforms || platforms.includes(Platform.OS)) && (Platform.OS !== 'ios' || iosMajor() >= 17) && isLinked(name);

export interface HostProps {
  spec: HostSpec | undefined;
  name: string;
  config: Record<string, unknown>;
  on?: Record<string, (value: never) => void>;
  /** Stretch across the parent, and measure the height for that width. Otherwise hug the content. */
  fill?: boolean;
  /** Takes no space: alerts and sheets, which present themselves. */
  headless?: boolean;
  /** A fixed height, for views that scroll themselves. */
  height?: number;
  /** Rendered where the native view cannot be: web, another platform, or a binary without this package. */
  fallback?: ReactNode;
  platforms?: readonly string[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  a11yLabel?: string;
}

export function NativeHost({ spec: Spec, name, config, on, fill, headless, height, fallback = null, platforms, style, testID, a11yLabel }: HostProps) {
  const { colors, mode, tokens } = useTheme();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const handlers = useRef(on);
  handlers.current = on;
  const json = useMemo(
    () => JSON.stringify({ ...config, a11yLabel, testID, fill: fill === true, height, theme: colors, fonts: tokens.fontFamily, dark: mode === 'dark', rtl: I18nManager.isRTL }),
    [config, a11yLabel, testID, fill, height, colors, mode, tokens.fontFamily],
  );
  if (!Spec || !pickHost(Spec, name, platforms)) return <>{fallback}</>;
  const box: ViewStyle = headless
    ? { position: 'absolute', width: 1, height: 1 }
    : fill
      ? { alignSelf: 'stretch', height: height ?? size?.height ?? 1, opacity: height || size ? 1 : 0 }
      : { alignSelf: 'flex-start', width: size?.width ?? 1, height: size?.height ?? 1, opacity: size ? 1 : 0 };
  return (
    <Spec
      config={json}
      testID={testID}
      style={[box, style]}
      onFerruleSize={(event) => setSize({ width: event.nativeEvent.width, height: event.nativeEvent.height })}
      onFerruleEvent={(event) => {
        const { name: key, value } = event.nativeEvent;
        handlers.current?.[key]?.((value === '' ? undefined : JSON.parse(value)) as never);
      }}
    />
  );
}
