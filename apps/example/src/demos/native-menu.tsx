import { NativeMenu } from '@leoanimesh/ferrule-native';
import { useHarness } from '../harness/context';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

const ITEMS = [
  { value: 'edit', label: 'Edit', icon: { ios: 'pencil', android: 'Edit' } },
  { value: 'share', label: 'Share', icon: { ios: 'square.and.arrow.up', android: 'Share' } },
  { value: 'delete', label: 'Delete', destructive: true, icon: { ios: 'trash', android: 'Delete' } },
];

export function Demo() {
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-menu" title="Menu" view="FerruleMenuView">
      {(native) => (native ? <NativeMenu label="Actions" testID="n-menu" onSelect={(v) => setLog(`menu ${v}`)} items={ITEMS} fallback={<NoFerrule name="menu" />} /> : <NoFerrule name="menu" />)}
    </NativeSection>
  );
}
export const NativeDemo = Demo;
