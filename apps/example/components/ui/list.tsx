import { forwardRef, type ComponentRef, type ReactElement, type ReactNode, type Ref } from 'react';
import { DISABLED_OPACITY, FlatList, FocusRing, Platform, Pressable, StateLayer, StyleSheet, useSlot, useTheme, View, type FlatListProps, type StyleProp, type ViewStyle } from 'ferrule';
import { Divider } from './stack';
import { Spinner } from './spinner';
import { Text } from './text';

export interface ListProps<T> extends Omit<FlatListProps<T>, 'ListEmptyComponent'> {
  /** Shown instead of rows while the first page loads. */
  loading?: boolean;
  /** Shown when `data` is empty and not loading. */
  emptyText?: string;
  /** Replaces the default empty text. */
  empty?: ReactNode;
  /** Draw a divider between rows. */
  dividers?: boolean;
}

// A list may only hold list items, and a line between rows says nothing to a screen reader anyway.
const ListDivider = () => <View aria-hidden><Divider /></View>;

function ListInner<T>(
  { loading = false, emptyText = 'Nothing here yet', empty, dividers = true, data, renderItem, ...rest }: ListProps<T>,
  ref: Ref<ComponentRef<typeof FlatList<T>>>,
) {
  const { tokens } = useTheme();
  // On web a list role only allows list items, so it is left off when a spinner, empty text, header or footer sits inside.
  const webList = Platform.OS === 'web' && !loading && Boolean(data?.length) && !rest.ListHeaderComponent && !rest.ListFooterComponent;
  const web = Platform.OS === 'web'
    ? {
        role: webList ? ('list' as const) : undefined,
        renderItem: webList && renderItem ? (info: Parameters<typeof renderItem>[0]) => <View role="listitem">{renderItem(info)}</View> : renderItem,
        // Keyboard users can only scroll what can take focus.
        tabIndex: rest.scrollEnabled === false ? undefined : 0,
      }
    : { role: 'list' as const, renderItem };
  return (
    <FlatList<T>
      ref={ref}
      ItemSeparatorComponent={dividers ? ListDivider : undefined}
      {...rest}
      {...(web as object)}
      data={loading ? [] : data}
      ListEmptyComponent={
        <View style={[styles.empty, { padding: tokens.space[8] }]}>
          {loading ? <Spinner /> : empty ?? <Text tone="muted" style={styles.emptyText}>{emptyText}</Text>}
        </View>
      }
    />
  );
}

/** A virtualized list with built-in loading and empty states. */
export const List = forwardRef(ListInner) as <T>(
  props: ListProps<T> & { ref?: Ref<ComponentRef<typeof FlatList<T>>> },
) => ReactElement;

export interface ListItemProps {
  title: string;
  description?: string;
  /** Icon or avatar, on the leading side. */
  start?: ReactNode;
  /** Value or control, on the trailing side. */
  end?: ReactNode;
  /** Makes the row a button. */
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ListItem = forwardRef<ComponentRef<typeof View>, ListItemProps>(function ListItem(
  { title, description, start, end, onPress, disabled, selected, style, testID },
  ref,
) {
  const { colors, tokens } = useTheme();
  const slot = useSlot('listItem', 'container');
  const base: StyleProp<ViewStyle> = [
    styles.row,
    {
      minHeight: tokens.minTouchTarget + 12,
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[2],
      gap: tokens.space[3],
      opacity: disabled ? DISABLED_OPACITY : 1,
      backgroundColor: selected ? colors.primarySoft : undefined,
    },
    slot,
    style,
  ];
  const body = (
    <>
      {start}
      <View style={styles.text}>
        <Text variant="body" style={selected ? { color: colors.onPrimarySoft, fontWeight: tokens.fontWeight.semibold } : null}>{title}</Text>
        {description ? <Text variant="bodySmall" tone="muted" style={selected ? { color: colors.onPrimarySoft } : null}>{description}</Text> : null}
      </View>
      {end}
    </>
  );
  if (!onPress) {
    return (
      <View ref={ref} testID={testID} style={base}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      ref={ref}
      testID={testID}
      role="button"
      // On web the row's text names it, including whatever is in `end`, and a button cannot be aria-selected.
      {...(Platform.OS === 'web' ? { 'aria-current': selected || undefined } : { 'aria-label': description ? `${title}, ${description}` : title, 'aria-selected': selected || undefined })}
      onPress={onPress}
      disabled={disabled}
      style={base}
    >
      {({ pressed, hovered, focused }) => (
        <>
          <StateLayer pressed={pressed} hovered={hovered} color={colors.text} pressedOpacity={0.1} hoveredOpacity={0.05} />
          {body}
          <FocusRing visible={focused} radius={0} />
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1, gap: 2 },
});
