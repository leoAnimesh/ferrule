import { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Text } from '../../components/ui/text';
import { Section } from '../ui';
import { useHarness } from '../harness/context';
import { NativeSection } from '../harness/NativeSection';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const [email, setEmail] = useState('');
  const invalid = email.length > 0 && !email.includes('@');
  return (
    <>
      <Section title="Uncontrolled">
        <Input label="Name" placeholder="Ada Lovelace" defaultValue="" />
      </Section>
      <Section title="Controlled with live validation">
        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" required helperText="We never share this." error={invalid ? 'Enter a valid email address.' : undefined} />
      </Section>
      <Section title="States">
        <Input label="Disabled" disabled defaultValue="Cannot edit" />
        <Input label="Error, long message" error={LONG} defaultValue="Wrong" />
        <Input placeholder="No label, named by aria-label" aria-label="Search" />
        <Input label="Long value" defaultValue={LONG} />
      </Section>
      <Section title="Sizes">
        <Input size="sm" placeholder="Small" aria-label="Small" />
        <Input placeholder="Medium" aria-label="Medium" />
        <Input size="lg" placeholder="Large" aria-label="Large" />
      </Section>
      <Section title="Adornments and multiline">
        <Input label="Price" start={<Text tone="muted">$</Text>} end={<Text tone="muted">USD</Text>} keyboardType="decimal-pad" />
        <Input label="Notes" multiline defaultValue={'Line one\nLine two'} />
      </Section>
    </>
  );
}

export function NativeDemo() {
  const { setLog } = useHarness();
  return (
    <NativeSection id="native-input" title="Native text field" variant="input">
      {(native) => (
        <>
          <Input native={native} testID="n-input" label="Email" placeholder="you@example.com" helperText="Helper text" keyboardType="email-address" onChangeText={(text: string) => setLog(`typed ${text}`)} />
          <Input native={native} label="Name" error="This field is required" defaultValue="" />
        </>
      )}
    </NativeSection>
  );
}
