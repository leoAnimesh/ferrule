import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Sheet } from '../../components/ui/sheet';
import { Text } from '../../components/ui/text';
import { useToast } from '../../components/ui/toast';
import { Section } from '../ui';
import { useHarness } from '../harness/context';
import { NativeSection } from '../harness/NativeSection';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const [basic, setBasic] = useState(false);
  const [form, setForm] = useState(false);
  const [long, setLong] = useState(false);
  const [locked, setLocked] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [inner, setInner] = useState(false);
  const toast = useToast();
  return (
    <>
      <Section title="Dialogs">
        <Button onPress={() => setBasic(true)}>Basic</Button>
        <Button variant="outline" onPress={() => setForm(true)}>With input and keyboard</Button>
        <Button variant="outline" onPress={() => setLong(true)}>Long, scrolling content</Button>
        <Button variant="outline" onPress={() => setLocked(true)}>Non-dismissible</Button>
        <Button variant="outline" onPress={() => setStacked(true)}>Sheet and toast above a modal</Button>
      </Section>
      <Modal open={basic} onOpenChange={setBasic} title="Delete this item?" description="This cannot be undone." footer={<><Button variant="ghost" onPress={() => setBasic(false)}>Cancel</Button><Button variant="danger" onPress={() => setBasic(false)}>Delete</Button></>}>
        <Text>Close with the X, the backdrop, Escape, Android back or the VoiceOver escape gesture.</Text>
      </Modal>
      <Modal open={form} onOpenChange={setForm} title="Rename" footer={<Button onPress={() => setForm(false)}>Save</Button>}>
        <Input label="New name" />
      </Modal>
      <Modal open={long} onOpenChange={setLong} title={LONG} footer={<Button onPress={() => setLong(false)}>Done</Button>}>
        {Array.from({ length: 30 }, (_, i) => <Text key={i}>Paragraph {i + 1}. {LONG}</Text>)}
      </Modal>
      <Modal open={locked} onOpenChange={setLocked} dismissible={false} title="You have to choose" footer={<Button onPress={() => setLocked(false)}>I choose</Button>}>
        <Text>Backdrop, back and Escape do nothing here.</Text>
      </Modal>
      <Modal open={stacked} onOpenChange={setStacked} title="Stacking" footer={<Button onPress={() => setStacked(false)}>Close</Button>}>
        <Button variant="outline" onPress={() => setInner(true)}>Open sheet</Button>
        <Button variant="outline" onPress={() => toast.show({ title: 'Toast above the modal', tone: 'success' })}>Show toast</Button>
        <Sheet open={inner} onOpenChange={setInner} title="Sheet above the modal">
          <Button onPress={() => toast.show({ title: 'Toast above the sheet' })}>Show toast</Button>
        </Sheet>
      </Modal>
    </>
  );
}

export function NativeDemo() {
  const [open, setOpen] = useState(false);
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-alert" title="System alert, with nativeActions" variant="modal">
      {(native) => (
        <>
          <Button testID="open-modal" onPress={() => setOpen(true)}>Open alert</Button>
          <Modal native={native} open={open} onOpenChange={setOpen} title="Delete this file?" description="This cannot be undone." nativeActions={[{ label: 'Cancel', role: 'cancel' }, { label: 'Delete', role: 'destructive', onPress: () => setLog('alert delete') }]}>
            <Text>Ferrule modal body.</Text>
          </Modal>
        </>
      )}
    </NativeSection>
  );
}
