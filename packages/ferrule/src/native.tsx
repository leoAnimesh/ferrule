// Core stays JS-only. `@leoanimesh/ferrule-native` registers its components here when the app imports it,
// so copied components never import it and nothing breaks when it is not installed.
import type { ComponentType } from 'react';
import { Platform } from 'react-native';
import { useNativeDefault } from './context';

export interface NativeVariant {
  // biome-ignore lint: each variant declares its own props at the call site.
  Component: ComponentType<never>;
  /** False when this OS, platform or binary cannot render it. The Ferrule component is used instead. */
  isAvailable: () => boolean;
}

const variants = new Map<string, NativeVariant>();
const warned = new Set<string>();

export function warnOnce(key: string, message: string) {
  if (__DEV__ && !warned.has(key)) {
    warned.add(key);
    console.warn(`[ferrule] ${message}`);
  }
}

export const registerNativeVariants = (map: Record<string, NativeVariant>) => {
  for (const [name, variant] of Object.entries(map)) variants.set(name, variant);
};

/** For tests. */
export const resetNativeVariants = () => {
  variants.clear();
  warned.clear();
};

/** Picks the variant only when it was asked for and can render. `null` means use the Ferrule component. */
export function resolveNativeVariant<P>(name: string, wanted: boolean | undefined): ComponentType<P> | null {
  if (!wanted) return null;
  const variant = variants.get(name);
  if (!variant) {
    if (Platform.OS !== 'web') warnOnce(`missing-${name}`, `\`native\` was set on ${name}, but @leoanimesh/ferrule-native is not imported. Using the Ferrule component.`);
    return null;
  }
  return variant.isAvailable() ? (variant.Component as unknown as ComponentType<P>) : null;
}

/** `native` on the component wins, then `native` on FerruleProvider. */
export function useNativeVariant<P>(name: string, native?: boolean): ComponentType<P> | null {
  const fallback = useNativeDefault();
  return resolveNativeVariant<P>(name, native ?? fallback);
}
