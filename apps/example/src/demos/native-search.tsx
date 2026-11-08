import { useState } from 'react';
import { NativeSearchBar } from '@leoanimesh/ferrule-native';
import { useHarness } from '../harness/context';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

export function Demo() {
  const [query, setQuery] = useState('');
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-search" title="Search bar" view="FerruleSearchBarView">
      {(native) => (native ? <NativeSearchBar value={query} onChangeText={setQuery} placeholder="Search files" onSubmit={(v) => setLog(`search ${v}`)} testID="n-search" fallback={<NoFerrule name="search bar" />} /> : <NoFerrule name="search bar" />)}
    </NativeSection>
  );
}
export const NativeDemo = Demo;
