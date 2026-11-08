import { NativeFab } from '@leoanimesh/ferrule-native';
import { Stack } from '../../components/ui/stack';
import { useHarness } from '../harness/context';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

export function Demo() {
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-fab" title="FAB" view="FerruleFabView">
      {(native) => (native ? (
        <Stack direction="horizontal" gap={3}>
          <NativeFab icon={{ ios: 'plus', android: 'Add' }} a11yLabel="Add" onPress={() => setLog('fab')} testID="n-fab" fallback={<NoFerrule name="FAB" />} />
          <NativeFab icon={{ ios: 'square.and.pencil', android: 'Edit' }} label="Compose" fallback={<NoFerrule name="FAB" />} />
        </Stack>
      ) : <NoFerrule name="FAB" />)}
    </NativeSection>
  );
}
export const NativeDemo = Demo;
