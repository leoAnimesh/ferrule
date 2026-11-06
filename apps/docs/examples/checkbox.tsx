import { useState } from 'react';
import { Checkbox } from '../components/ui/checkbox';
import { Stack } from '../components/ui/stack';

export default function Example() {
  const [agreed, setAgreed] = useState(false);
  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Checkbox label="Leave at the door" checked={agreed} onCheckedChange={setAgreed} />
      <Checkbox label="Some items selected" indeterminate />
      <Checkbox label="Accept the terms" description="Needed to place the order" error="Tick this to place the order" />
    </Stack>
  );
}
