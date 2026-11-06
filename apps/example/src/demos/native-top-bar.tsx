import { NativeTopBar } from 'ferrule-native';
import { useHarness } from '../harness/context';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

const ACTIONS = [{ value: 'search', label: 'Search', icon: { ios: 'magnifyingglass', android: 'Search' } }, { value: 'more', label: 'More', icon: { ios: 'ellipsis', android: 'MoreVert' } }];

export function Demo() {
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-top-bar" title="Top app bar" view="FerruleTopBarView">
      {(native) => (native ? <NativeTopBar title="Inbox" onBack={() => setLog('back')} actions={ACTIONS} onAction={(v) => setLog(`bar ${v}`)} testID="n-topbar" fallback={<NoFerrule name="top bar" />} /> : <NoFerrule name="top bar" />)}
    </NativeSection>
  );
}
export const NativeDemo = Demo;
