import { useRef } from 'react';
import type { FlatList as RNFlatList } from 'react-native';
import { FlatList, useTheme, View } from 'ferrule';
import { Button } from '../../components/ui/button';
import { Stack } from '../../components/ui/stack';
import { Text } from '../../components/ui/text';

const ROW = 56;
const rows = Array.from({ length: 300 }, (_, n) => n);

/** `FlatList` from `ferrule`, with buttons for the ref methods. */
export function Demo() {
  const { colors } = useTheme();
  const ref = useRef<RNFlatList<number>>(null);
  return (
    <View style={{ flex: 1, gap: 8 }}>
      <Stack direction="horizontal" gap={1} wrap>
        <Button testID="to-index" size="sm" variant="outline" onPress={() => ref.current?.scrollToIndex({ index: 150 })}>Index 150</Button>
        <Button testID="to-top" size="sm" variant="outline" onPress={() => ref.current?.scrollToOffset({ offset: 0 })}>Top</Button>
        <Button testID="to-end" size="sm" variant="outline" onPress={() => ref.current?.scrollToEnd()}>End</Button>
      </Stack>
      <FlatList
        testID="flatlist"
        ref={ref}
        style={{ flex: 1, backgroundColor: colors.surface }}
        data={rows}
        keyExtractor={String}
        getItemLayout={(_, index) => ({ length: ROW, offset: ROW * index, index })}
        renderItem={({ item }) => (
          <View testID={`row-${item}`} style={{ height: ROW, padding: 8, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text>{`Item ${item}`}</Text>
          </View>
        )}
        ListFooterComponent={<Text testID="list-footer" style={{ padding: 8 }}>{`Footer, ${rows.length} items`}</Text>}
      />
    </View>
  );
}
