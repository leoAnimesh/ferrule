import { useState } from 'react';
import { Switch } from '../../components/ui/switch';
import { Section } from '../ui';
import { useHarness } from '../harness/context';
import { NativeSection } from '../harness/NativeSection';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const [on, setOn] = useState(true);
  return (
    <>
      <Section title="Controlled and uncontrolled">
        <Switch label={`Controlled: ${on ? 'on' : 'off'}`} checked={on} onCheckedChange={setOn} />
        <Switch label="Uncontrolled" defaultChecked />
      </Section>
      <Section title="States">
        <Switch label="Disabled off" disabled />
        <Switch label="Disabled on" disabled defaultChecked />
        <Switch label="With description" description="Extra detail below the label." />
        <Switch label={LONG} />
        <Switch aria-label="No visible label" />
      </Section>
    </>
  );
}

export function NativeDemo() {
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-switch" title="Native toggle" variant="switch">
      {(native) => <Switch native={native} testID="n-switch" label="Wi-Fi" description="Join networks automatically" defaultChecked onCheckedChange={(on) => setLog(`switch ${on}`)} />}
    </NativeSection>
  );
}
