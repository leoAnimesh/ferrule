import { useState } from 'react';
import { NativeSlider } from 'ferrule-native';
import { useHarness } from '../harness/context';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

export function Demo() {
  const [value, setValue] = useState(0.4);
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-slider" title="Slider" view="FerruleSliderView">
      {(native) => (native ? <NativeSlider value={value} onValueChange={setValue} onSlidingComplete={(v) => setLog(`slider ${v.toFixed(2)}`)} a11yLabel="Volume" testID="n-slider" fallback={<NoFerrule name="slider" />} /> : <NoFerrule name="slider" />)}
    </NativeSection>
  );
}
export const NativeDemo = Demo;
