import { useState } from 'react';
import { NativeDatePicker } from '@leoanimesh/ferrule-native';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

export function Demo() {
  const [date, setDate] = useState(new Date(2026, 10, 6, 9, 30));
  return (
    <NativeSection id="native-date" title="Date and time pickers" view="FerruleDatePickerView">
      {(native) => (native ? (
        <>
          <NativeDatePicker label="Date" value={date} onValueChange={setDate} testID="n-date" fallback={<NoFerrule name="date picker" />} />
          <NativeDatePicker label="Time" mode="time" value={date} onValueChange={setDate} testID="n-time" fallback={<NoFerrule name="time picker" />} />
        </>
      ) : <NoFerrule name="date picker" />)}
    </NativeSection>
  );
}
export const NativeDemo = Demo;
