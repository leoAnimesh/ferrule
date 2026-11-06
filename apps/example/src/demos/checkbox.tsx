import { useState } from 'react';
import { Checkbox } from '../../components/ui/checkbox';
import { Section } from '../ui';
import { NativeSection } from '../harness/NativeSection';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const [items, setItems] = useState([true, false]);
  const all = items.every(Boolean);
  const some = items.some(Boolean);
  return (
    <>
      <Section title="Indeterminate parent">
        <Checkbox label="All items" checked={all} indeterminate={some && !all} onCheckedChange={(v) => setItems(items.map(() => v))} />
        {items.map((checked, i) => (
          <Checkbox key={i} label={`Item ${i + 1}`} checked={checked} onCheckedChange={(v) => setItems(items.map((old, j) => (j === i ? v : old)))} style={{ paddingStart: 24 }} />
        ))}
      </Section>
      <Section title="States">
        <Checkbox label="Uncontrolled" defaultChecked />
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Disabled checked" disabled defaultChecked />
        <Checkbox label="With error" error="You must accept the terms." />
        <Checkbox label="With description" description="Extra detail below the label." />
        <Checkbox label={LONG} />
      </Section>
    </>
  );
}

export function NativeDemo() {
  return (
    <NativeSection id="native-checkbox" title="Native checkbox" variant="checkbox">
      {(native) => <Checkbox native={native} label="Android has a native one; iOS keeps Ferrule's" defaultChecked />}
    </NativeSection>
  );
}
