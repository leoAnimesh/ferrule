import { useState } from 'react';
import { NativeActionSheet, NativeAlert } from '@leoanimesh/ferrule-native';
import { Button } from '../../components/ui/button';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

export function Demo() {
  const [sheet, setSheet] = useState(false);
  const [alert, setAlert] = useState(false);
  return (
    <NativeSection id="native-action-sheet" title="Action sheet and standalone alert" view="FerruleActionSheetView">
      {(native) => (native ? (
        <>
          <Button testID="open-action" onPress={() => setSheet(true)}>Open action sheet</Button>
          <NativeActionSheet open={sheet} onOpenChange={setSheet} title="Photo" actions={[{ label: 'Take photo' }, { label: 'Delete', role: 'destructive' }]} fallback={<NoFerrule name="action sheet" />} />
          <Button onPress={() => setAlert(true)}>Open standalone alert</Button>
          <NativeAlert open={alert} onOpenChange={setAlert} title="Standalone alert" message="NativeAlert without Modal" actions={[{ label: 'OK' }]} fallback={<NoFerrule name="alert" />} />
        </>
      ) : <NoFerrule name="action sheet" />)}
    </NativeSection>
  );
}
export const NativeDemo = Demo;
