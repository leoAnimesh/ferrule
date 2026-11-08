import { Children, forwardRef, type ComponentRef } from 'react';
import { useTheme, View, type SpaceToken, type ViewProps, type ViewStyle } from '@leoanimesh/ferrule';

export interface StackProps extends ViewProps {
  direction?: 'vertical' | 'horizontal';
  gap?: SpaceToken;
  padding?: SpaceToken;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
}

/** Flex layout on the spacing scale. Horizontal stacks flip automatically in right-to-left. */
export const Stack = forwardRef<ComponentRef<typeof View>, StackProps>(function Stack(
  { direction = 'vertical', gap = 0, padding = 0, align, justify, wrap = false, style, ...rest },
  ref,
) {
  const { tokens } = useTheme();
  return (
    <View
      ref={ref}
      {...rest}
      style={[
        {
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          gap: tokens.space[gap],
          padding: tokens.space[padding],
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
    />
  );
});

/** Keeps content at a readable width and centered on wide screens. Defaults to the theme's `lg` breakpoint. */
export function Container({ maxWidth, style, ...rest }: ViewProps & { maxWidth?: number }) {
  const { tokens } = useTheme();
  return <View {...rest} style={[{ width: '100%', maxWidth: maxWidth ?? tokens.breakpoint.lg, alignSelf: 'center' }, style]} />;
}

export interface GridProps extends ViewProps {
  /** Pair with `useResponsive` to change it by window width. */
  columns: number;
  gap?: SpaceToken;
}

/** Equal-width columns, filled row by row. A short last row keeps its cells the same width. */
export function Grid({ columns, gap = 0, style, children, ...rest }: GridProps) {
  const { tokens } = useTheme();
  const cells = Children.toArray(children);
  const rows = Array.from({ length: Math.ceil(cells.length / columns) }, (_, n) => n);
  const space = { gap: tokens.space[gap] };
  return (
    <View {...rest} style={[space, style]}>
      {rows.map((row) => (
        <View key={row} style={[{ flexDirection: 'row' }, space]}>
          {Array.from({ length: columns }, (_, column) => (
            <View key={column} style={{ flex: 1, minWidth: 0 }}>{cells[row * columns + column]}</View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Fills free space along the parent stack. */
export function Spacer() {
  return <View style={{ flexGrow: 1 }} />;
}

export interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({ orientation = 'horizontal', style, ...rest }: DividerProps) {
  const { colors } = useTheme();
  // 1dp, not hairlineWidth: hairline resolves to a different size per screen density.
  return (
    <View
      role="separator"
      aria-orientation={orientation}
      {...rest}
      style={[
        { backgroundColor: colors.border },
        orientation === 'horizontal' ? { height: 1, alignSelf: 'stretch' } : { width: 1, alignSelf: 'stretch' },
        style,
      ]}
    />
  );
}
