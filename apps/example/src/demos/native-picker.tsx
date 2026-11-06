import { useState } from 'react';
import { NativePicker } from 'ferrule-native';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

const SIZES = [{ value: 's', label: 'Small' }, { value: 'm', label: 'Medium' }, { value: 'l', label: 'Large' }];

export function Demo() {
  const [value, setValue] = useState('m');
  return (
    <NativeSection id="native-picker" title="Picker" view="FerrulePickerView">
      {(native) => (native ? <NativePicker label="Size" options={SIZES} value={value} onValueChange={setValue} testID="n-picker" fallback={<NoFerrule name="picker" />} /> : <NoFerrule name="picker" />)}
    </NativeSection>
  );
}
export const NativeDemo = Demo;
