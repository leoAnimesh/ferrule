import { useState } from 'react';
import { View } from 'ferrule';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ListItem } from '../../components/ui/list';
import { Sheet } from '../../components/ui/sheet';
import { Text } from '../../components/ui/text';
import { Section } from '../ui';
import { useHarness } from '../harness/context';
import { NativeSection } from '../harness/NativeSection';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const [basic, setBasic] = useState(false);
  const [form, setForm] = useState(false);
  const [long, setLong] = useState(false);
  return (
    <>
      <Section title="Sheets">
        <Button onPress={() => setBasic(true)}>Basic</Button>
        <Button variant="outline" onPress={() => setForm(true)}>With input and keyboard</Button>
        <Button variant="outline" onPress={() => setLong(true)}>Long, scrolling content</Button>
      </Section>
      <Sheet open={basic} onOpenChange={setBasic} title="Options" description="Drag the handle down, or use the X.">
        <View style={{ marginHorizontal: -16 }}>
          <ListItem title="Share" onPress={() => setBasic(false)} />
          <ListItem title="Rename" onPress={() => setBasic(false)} />
        </View>
      </Sheet>
      <Sheet open={form} onOpenChange={setForm} title="Rename" footer={<Button onPress={() => setForm(false)}>Save</Button>}>
        <Input label="New name" autoFocus />
      </Sheet>
      <Sheet open={long} onOpenChange={setLong} title="Long">
        {Array.from({ length: 30 }, (_, i) => <Text key={i}>Paragraph {i + 1}. {LONG}</Text>)}
      </Sheet>
    </>
  );
}

export function NativeDemo() {
  const [open, setOpen] = useState(false);
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-sheet" title="System sheet, with nativeActions" variant="sheet">
      {(native) => (
        <>
          <Button testID="open-sheet" onPress={() => setOpen(true)}>Open system sheet</Button>
          <Sheet native={native} open={open} onOpenChange={setOpen} title="Share" description="Choose a target" nativeActions={[{ label: 'Copy link', onPress: () => setLog('sheet copy') }, { label: 'Remove', role: 'destructive' }]}>
            <Text>Ferrule sheet body.</Text>
          </Sheet>
        </>
      )}
    </NativeSection>
  );
}
