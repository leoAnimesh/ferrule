import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Progress, ProgressRing } from '../components/ui/progress';
import { Stack } from '../components/ui/stack';
import { Text } from '../components/ui/text';

export default function Example() {
  const [value, setValue] = useState(0.4);
  return (
    <Stack gap={4} style={{ maxWidth: 360 }}>
      <Progress value={value} label="Upload" />
      <Stack direction="horizontal" gap={4} align="center">
        <ProgressRing value={value} label="Upload" size={72}>
          <Text variant="label">{Math.round(value * 100)}%</Text>
        </ProgressRing>
        <Button variant="outline" onPress={() => setValue(value >= 1 ? 0.1 : Math.min(1, value + 0.3))}>Advance</Button>
      </Stack>
    </Stack>
  );
}
