import { useState } from 'react';
import { NativeChip } from 'ferrule-native';
import { Chip } from '../../components/ui/chip';
import { Stack } from '../../components/ui/stack';
import { Text } from '../../components/ui/text';
import { NativeSection } from '../harness/NativeSection';
import { Icon } from '../../components/ui/icon';
import { Section } from '../ui';

const LONG = 'A long chip label that has to wrap or truncate on a narrow screen';

export function Demo() {
  const [on, setOn] = useState(true);
  const [presses, setPresses] = useState(0);
  return (
    <>
      <Section title="Selected: a checkbox">
        <Stack direction="horizontal" gap={2} wrap>
          <Chip testID="chip-selected" label="Selected" selected={on} onPress={() => setOn(!on)} />
          <Chip label="Not selected" selected={false} />
          <Chip label="Disabled" disabled selected={false} />
          <Chip label="Disabled on" disabled selected />
        </Stack>
      </Section>
      <Section title={`No selected prop: a button (pressed ${presses} times)`}>
        <Stack direction="horizontal" gap={2} wrap>
          <Chip label="Action" onPress={() => setPresses(presses + 1)} />
          <Chip label="With icon" start={<Icon name="star" size={16} />} />
        </Stack>
      </Section>
      <Section title="Long text"><Chip label={LONG} /></Section>
    </>
  );
}

export function NativeDemo() {
  const [selected, setSelected] = useState(true);
  return (
    <NativeSection id="native-chip" title="Native chip" variant="chip">
      {(native) => (
        <Stack direction="horizontal" gap={2} wrap>
          <Chip native={native} testID="n-chip" label="Selected" selected={selected} onPress={() => setSelected(!selected)} />
          {native ? <NativeChip label="Star" icon={{ ios: 'star.fill', android: 'Star' }} fallback={<Text>Star</Text>} /> : <Chip label="Star" />}
        </Stack>
      )}
    </NativeSection>
  );
}
