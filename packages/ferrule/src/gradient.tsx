import { View, type ViewProps } from 'react-native';
import { useDirection } from './context';

export interface GradientProps extends ViewProps {
  /** Two or more colors, spread evenly. */
  colors: readonly string[];
  /** CSS degrees: 180 runs top to bottom, 90 from the leading edge. Mirrors in right-to-left. */
  angle?: number;
}

/** A linear gradient background, with children on top. Uses React Native's own `backgroundImage`, so it adds no dependency. */
export function Gradient({ colors, angle = 180, style, ...rest }: GradientProps) {
  const direction = useDirection();
  const degrees = direction === 'rtl' ? 360 - angle : angle;
  return <View {...rest} style={[{ backgroundColor: colors[0], backgroundImage: `linear-gradient(${degrees}deg, ${colors.join(', ')})` }, style]} />;
}
