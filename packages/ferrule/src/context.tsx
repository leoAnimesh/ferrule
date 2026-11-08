import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Dimensions, I18nManager, Platform, StatusBar, StyleSheet, useColorScheme, View, type ViewStyle } from 'react-native';
import { defaultTheme, resolvePalette, type ColorMode, type Palette, type PaletteName, type ResolvedTheme, type SlotStyle, type ThemeConfig } from './theme';

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type Direction = 'ltr' | 'rtl';

interface EnvValue {
  theme: ResolvedTheme;
  insets: Insets;
  native: boolean;
  direction: Direction;
  /** True inside a FerruleProvider, so a nested one can inherit from it. */
  provided: boolean;
}

// shortcut: estimates insets from screen size because RN core has no safe-area API and we ship no native deps,
// pass `insets` to FerruleProvider (e.g. from react-native-safe-area-context) when exact values matter.
function estimateInsets(): Insets {
  if (Platform.OS === 'android') {
    // shortcut: Android 15+ draws edge to edge, and 24dp is the gesture bar. Three-button navigation is taller, pass `insets` when it matters.
    const bottom = typeof Platform.Version === 'number' && Platform.Version >= 35 ? 24 : 0;
    return { top: StatusBar.currentHeight ?? 0, bottom, left: 0, right: 0 };
  }
  if (Platform.OS !== 'ios' || Platform.isTV) return { top: 0, bottom: 0, left: 0, right: 0 };
  // Current iPads: a 24pt status bar and a home indicator.
  if (Platform.isPad) return { top: 24, bottom: 20, left: 0, right: 0 };
  const { width, height } = Dimensions.get('window');
  const notched = Math.max(width, height) >= 812;
  if (!notched) return { top: 20, bottom: 0, left: 0, right: 0 };
  return height > width ? { top: 59, bottom: 34, left: 0, right: 0 } : { top: 0, bottom: 21, left: 59, right: 59 };
}

const resolve = (config: ThemeConfig, mode: ColorMode): ResolvedTheme => ({
  mode,
  colors: config.colors[mode],
  tokens: config.tokens,
  components: config.components,
});

// Components work with no provider at all: light default theme, estimated insets.
const EnvContext = createContext<EnvValue>({
  theme: resolve(defaultTheme, 'light'),
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  native: false,
  direction: I18nManager.isRTL ? 'rtl' : 'ltr',
  provided: false,
});

interface TopLayerValue {
  /** Registers a new overlay layer. Returns its id and a release function. */
  push: () => { id: number; release: () => void };
  topId: number;
  setContent: (content: ReactNode) => void;
  content: ReactNode;
}

const TopLayerContext = createContext<TopLayerValue | null>(null);

export interface FerruleProviderProps {
  children: ReactNode;
  theme?: ThemeConfig;
  /** Defaults to following the OS setting, or the surrounding provider when nested. */
  colorMode?: ColorMode | 'system';
  /**
   * Layout direction. On web this sets `dir`, live. On iOS and Android direction is process-wide:
   * use `I18nManager.forceRTL` plus an app restart. The prop then only needs to agree with it.
   */
  direction?: Direction;
  /** Swap every color at runtime without touching `theme`: a palette name or a `createPalette` result. Replaces the theme's colors. */
  palette?: PaletteName | Palette;
  /** Default for each component's `native` prop. Needs `@leoanimesh/ferrule-native`; see its docs. */
  native?: boolean;
  /** Exact safe-area insets. Without this, Ferrule estimates them (see `useInsets`). */
  insets?: Insets;
}

export function FerruleProvider({ children, theme = defaultTheme, palette, colorMode, direction, insets, native }: FerruleProviderProps) {
  // A nested provider restyles a subtree. Mode, direction and insets describe the app around it, so they carry over.
  const parent = useContext(EnvContext);
  const inheritedNative = parent.native;
  const system = useColorScheme();
  const mode: ColorMode = colorMode === 'light' || colorMode === 'dark' ? colorMode : !colorMode && parent.provided ? parent.theme.mode : system === 'dark' ? 'dark' : 'light';
  const dir: Direction = Platform.OS === 'web' ? (direction ?? (parent.provided ? parent.direction : 'ltr')) : I18nManager.isRTL ? 'rtl' : 'ltr';
  const inheritedInsets = parent.provided ? parent.insets : undefined;

  const [estimated, setEstimated] = useState(estimateInsets);
  useEffect(() => {
    if (insets) return;
    const sub = Dimensions.addEventListener?.('change', () => setEstimated(estimateInsets()));
    return () => sub?.remove();
  }, [insets]);

  const env = useMemo<EnvValue>(
    () => ({ theme: resolve(palette ? { ...theme, colors: resolvePalette(palette) } : theme, mode), insets: insets ?? inheritedInsets ?? estimated, direction: dir, native: native ?? inheritedNative, provided: true }),
    [theme, palette, mode, insets, inheritedInsets, estimated, dir, native, inheritedNative],
  );

  // One stack per app: an overlay under a nested provider still has to receive the root's toasts.
  const parentLayer = useContext(TopLayerContext);
  const [layers, setLayers] = useState<number[]>([]);
  const [content, setContent] = useState<ReactNode>(null);
  const nextId = useRef(1);
  const push = useCallback(() => {
    const id = nextId.current++;
    setLayers((all) => [...all, id]);
    return { id, release: () => setLayers((all) => all.filter((layer) => layer !== id)) };
  }, []);
  const topId = layers[layers.length - 1] ?? 0;
  const topLayer = useMemo<TopLayerValue>(() => ({ push, topId, setContent, content }), [push, topId, content]);

  return (
    <EnvContext.Provider value={env}>
      <TopLayerContext.Provider value={parentLayer ?? topLayer}>
        {/* `dir` is a react-native-web prop, so it is only passed there. */}
        {/* Painting the background keeps dark-mode text readable in an app that sets none of its own. */}
        <View style={{ flex: 1, backgroundColor: env.theme.colors.background }} {...(Platform.OS === 'web' ? ({ dir } as object) : null)}>
          {children}
          {!parentLayer && topId === 0 && content ? (
            // On web this view can be longer than the window when the document scrolls, so anchor to the window itself.
            Platform.OS === 'web' ? <View style={webTopLayer}>{content}</View> : content
          ) : null}
        </View>
      </TopLayerContext.Provider>
    </EnvContext.Provider>
  );
}

// Through StyleSheet, because react-native-web only understands box-none from a compiled style.
const webTopLayer = StyleSheet.create({ layer: { position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999, pointerEvents: 'box-none' } as unknown as ViewStyle }).layer;

export const useTheme = (): ResolvedTheme => useContext(EnvContext).theme;
export const useNativeDefault = (): boolean => useContext(EnvContext).native;
export const useDirection = (): Direction => useContext(EnvContext).direction;

/** Safe-area insets: the `insets` prop if given, else an estimate. */
export const useInsets = (): Insets => useContext(EnvContext).insets;

/** Theme-level style override for one slot of a component. */
export function useSlot(component: string, slot: string): SlotStyle | undefined {
  return useTheme().components[component]?.[slot];
}

/** Internal: claims a layer in the overlay stack so top-layer content renders above it. */
export function useOverlayLayer(active: boolean): number {
  const layer = useContext(TopLayerContext);
  const push = layer?.push;
  const [id, setId] = useState(0);
  useEffect(() => {
    if (!active || !push) return;
    const claimed = push();
    setId(claimed.id);
    return () => {
      claimed.release();
      setId(0);
    };
  }, [active, push]);
  return id;
}

/** Internal: renders the app's top-layer content (toasts) inside the overlay that owns the top layer. */
export function TopLayerOutlet({ layerId }: { layerId: number }) {
  const layer = useContext(TopLayerContext);
  if (!layer || layerId === 0 || layer.topId !== layerId) return null;
  return <>{layer.content}</>;
}

/**
 * Places content above every overlay, including native modal windows, which would otherwise
 * cover anything rendered at the app root. Used by Toast. Requires FerruleProvider.
 */
export function useTopLayer(content: ReactNode): void {
  const setContent = useContext(TopLayerContext)?.setContent;
  // It renders elsewhere in the tree, so it brings its own theme with it.
  const env = useContext(EnvContext);
  useEffect(() => {
    setContent?.(<EnvContext.Provider value={env}>{content}</EnvContext.Provider>);
  }, [content, env, setContent]);
  useEffect(() => () => setContent?.(null), [setContent]);
}
