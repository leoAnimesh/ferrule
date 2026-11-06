import { useWindowDimensions } from 'react-native';
import { useTheme } from './context';

export type Breakpoint = 'base' | 'md' | 'lg';
export type ResponsiveValue<T> = { base: T; md?: T; lg?: T };

/** Which band the window width falls in, from the theme's `breakpoint` tokens. Follows rotation and resizing. */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  const { breakpoint } = useTheme().tokens;
  return width >= breakpoint.lg ? 'lg' : width >= breakpoint.md ? 'md' : 'base';
}

/** Picks a value by window width. A missing band falls back to the next smaller one. */
export function useResponsive<T>(values: ResponsiveValue<T>): T {
  const band = useBreakpoint();
  if (band === 'lg') return values.lg ?? values.md ?? values.base;
  if (band === 'md') return values.md ?? values.base;
  return values.base;
}
