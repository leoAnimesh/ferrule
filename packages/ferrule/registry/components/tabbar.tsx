import { createContext, forwardRef, useContext, useState, type ComponentRef, type ReactNode } from 'react';
import { Band, FocusRing, Pressable, StateLayer, StyleSheet, useControllableState, useInsets, useNativeVariant, useRovingFocus, useSlot, useTheme, View, HOVER_TINT, PRESSED_TINT, type ImageSourcePropType, type StyleProp, type ViewStyle } from '@leoanimesh/ferrule';
import type { FeatherName } from '@leoanimesh/ferrule/lib/feather';
import { Icon } from './icon';
import { Text } from './text';

export interface TabBarItem {
  value: string;
  label: string;
  /** A Feather icon name, or your own single-color artwork. */
  icon: FeatherName | ImageSourcePropType;
  /** Icon names for the platform tab bar: SF Symbols, Material icons. */
  nativeIcon?: { ios?: string; android?: string };
  testID?: string;
}

export interface TabBarProps {
  items: readonly TabBarItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Names the bar for screen readers. */
  label?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Renders the real platform tab bar, Liquid Glass on iOS 26+, when `@leoanimesh/ferrule-native` is available. */
  native?: boolean;
}

const BarHeight = createContext(0);

/** The bar's height, once measured. Add it to the bottom padding of scrolling content, so the last item clears the bar. */
export const useTabBarHeight = () => useContext(BarHeight);

export interface TabBarScreenProps {
  /** The `TabBar`. */
  bar: ReactNode;
  children: ReactNode;
}

/** Lays the bar over the screen, so content scrolls to the bottom edge. Whether it shows through is up to the bar. */
export function TabBarScreen({ bar, children }: TabBarScreenProps) {
  const [height, setHeight] = useState(0);
  return (
    <View style={{ flex: 1 }}>
      <BarHeight.Provider value={height}>{children}</BarHeight.Provider>
      <View onLayout={(event) => setHeight(event.nativeEvent.layout.height)} style={{ position: 'absolute', start: 0, end: 0, bottom: 0 }}>
        {bar}
      </View>
    </View>
  );
}

/** Bottom navigation. Keeps its labels clear of the home indicator through the safe-area inset. */
export const TabBar = forwardRef<ComponentRef<typeof View>, TabBarProps>(function TabBar({ items, value, defaultValue, onValueChange, label = 'Main', style, testID, native }, ref) {
  const NativeTabBar = useNativeVariant<Record<string, unknown>>('tabbar', native);
  const { colors, tokens } = useTheme();
  const insets = useInsets();
  const container = useSlot('tabbar', 'container');
  const [current, setCurrent] = useControllableState(value, defaultValue ?? items[0]?.value ?? '', onValueChange);
  const roving = useRovingFocus(items.map((item) => item.value), current, setCurrent);
  if (NativeTabBar) {
    const options = items.map(({ value: v, label: l, nativeIcon }) => ({ value: v, label: l, icon: nativeIcon }));
    // The platform's own bar, with its own look and its own room for the home indicator.
    return <NativeTabBar options={options} value={current} onValueChange={setCurrent} label={label} testID={testID} style={[{ minHeight: 56 }, style]} />;
  }
  return (
    <View ref={ref} role="tablist" aria-label={label} testID={testID} {...roving.group} style={[{ flexDirection: 'row', paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, container, style]}>
      {items.map((item) => {
        const on = item.value === current;
        const fg = on ? colors.primary : colors.textMuted;
        return (
          <Pressable key={item.value} {...roving.item(item.value)} testID={item.testID} role="tab" aria-selected={on} aria-label={item.label} onPress={() => setCurrent(item.value)} style={{ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            {({ pressed, hovered, focused }) => (
              <>
                <StateLayer pressed={pressed} hovered={hovered} color={colors.text} pressedOpacity={PRESSED_TINT} hoveredOpacity={HOVER_TINT} />
                <Band visible={on} color={colors.primary} style={{ top: -1, bottom: undefined }} />
                <Icon {...(typeof item.icon === 'string' ? { name: item.icon as FeatherName } : { source: item.icon })} size={24} color={fg} />
                <Text variant="caption" numberOfLines={1} style={{ color: fg, fontWeight: tokens.fontWeight[on ? 'semibold' : 'medium'] }}>{item.label}</Text>
                <FocusRing visible={focused} radius={tokens.radius.sm} />
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
});
