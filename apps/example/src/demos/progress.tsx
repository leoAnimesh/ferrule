import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Progress, ProgressRing } from '../../components/ui/progress';
import { Stack } from '../../components/ui/stack';
import { Text } from '../../components/ui/text';
import { Section } from '../ui';

export function Demo() {
  const [value, setValue] = useState(0.4);
  return (
    <>
      <Section title={`Bar: ${Math.round(value * 100)}%`}>
        <Progress testID="progress-bar" value={value} label="Upload" />
        <Stack direction="horizontal" gap={2}>
          <Button variant="outline" size="sm" onPress={() => setValue(Math.max(0, value - 0.2))}>Less</Button>
          <Button variant="outline" size="sm" onPress={() => setValue(Math.min(1, value + 0.2))}>More</Button>
        </Stack>
      </Section>
      <Section title="Limits and thickness">
        <Progress value={0} label="Empty" />
        <Progress value={1} label="Full" />
        <Progress value={0.6} label="Thick" thickness={12} />
      </Section>
      <Section title="Ring, with children">
        <Stack direction="horizontal" gap={4} align="center">
          <ProgressRing value={value} label="Ring" size={72}><Text variant="label">{Math.round(value * 100)}</Text></ProgressRing>
          <ProgressRing value={0.25} label="Thin ring" size={48} thickness={4} />
        </Stack>
      </Section>
    </>
  );
}
