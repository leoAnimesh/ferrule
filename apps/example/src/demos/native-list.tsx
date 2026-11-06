import { NativeList } from 'ferrule-native';
import { useHarness } from '../harness/context';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

const ROWS = [{ id: 'a', title: 'First row', subtitle: 'With a subtitle' }, { id: 'b', title: 'Second row' }, { id: 'c', title: 'Third row' }];

export function Demo() {
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-list" title="List, system rows" view="FerruleListView">
      {(native) => (native ? <NativeList height={200} rows={ROWS} onRowPress={(id) => setLog(`row ${id}`)} testID="n-list" fallback={<NoFerrule name="system list" />} /> : <NoFerrule name="system list" />)}
    </NativeSection>
  );
}
export const NativeDemo = Demo;
