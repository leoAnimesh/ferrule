import { useState } from 'react';
import { Segmented } from '../../components/ui/segmented';
import { useHarness } from '../harness/context';
import { NativeSection } from '../harness/NativeSection';
import { Section } from '../ui';

const SIZES = [{ value: 's', label: 'Small' }, { value: 'm', label: 'Medium' }, { value: 'l', label: 'Large' }];
const LONG = [{ value: 'a', label: 'A deliberately long first option' }, { value: 'b', label: 'A second long option' }];

export function Demo() {
  const [value, setValue] = useState('m');
  return (
    <>
      <Section title={`Controlled: ${value}`}><Segmented label="Size" options={SIZES} value={value} onValueChange={setValue} /></Section>
      <Section title="Uncontrolled"><Segmented label="Other size" options={SIZES} defaultValue="s" /></Section>
      <Section title="Disabled"><Segmented label="Disabled" options={SIZES} defaultValue="s" disabled /></Section>
      <Section title="Long labels"><Segmented label="Long" options={LONG} defaultValue="a" /></Section>
    </>
  );
}

export function NativeDemo() {
  const [value, setValue] = useState('m');
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-segmented" title="Native segmented control" variant="segmented">
      {(native) => <Segmented native={native} testID="n-segmented" label="Native size" options={SIZES} value={value} onValueChange={(next) => { setValue(next); setLog(`segment ${next}`); }} />}
    </NativeSection>
  );
}
