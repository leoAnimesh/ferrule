import { useState } from 'react';
import { TabBar } from '../../components/ui/tabbar';
import { useHarness } from '../harness/context';
import { NativeSection } from '../harness/NativeSection';
import { Section } from '../ui';

const ITEMS = [
  { value: 'home', label: 'Home', icon: 'home' as const, nativeIcon: { ios: 'house.fill', android: 'Home' } },
  { value: 'search', label: 'Search', icon: 'search' as const, nativeIcon: { ios: 'magnifyingglass', android: 'Search' } },
  { value: 'me', label: 'Profile', icon: 'user' as const, nativeIcon: { ios: 'person.fill', android: 'Person' } },
];

export function Demo() {
  const [tab, setTab] = useState('home');
  return (
    <>
      <Section title={`Controlled: ${tab}`}><TabBar label="Sections" items={ITEMS} value={tab} onValueChange={setTab} /></Section>
      <Section title="Uncontrolled, long labels"><TabBar label="Long" items={[{ value: 'a', label: 'A long tab label', icon: 'home' as const }, { value: 'b', label: 'Another long label', icon: 'user' as const }]} defaultValue="a" /></Section>
    </>
  );
}

export function NativeDemo() {
  const [tab, setTab] = useState('home');
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-tabbar" title="Platform bar, with no style from Ferrule" variant="tabbar">
      {(native) => <TabBar native={native} testID="n-tabbar" label="Native sections" items={ITEMS} value={tab} onValueChange={(next) => { setTab(next); setLog(`tab ${next}`); }} />}
    </NativeSection>
  );
}
