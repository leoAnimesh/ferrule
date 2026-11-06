import { useState } from 'react';
import { Stack } from '../components/ui/stack';
import { Switch } from '../components/ui/switch';

export default function Example() {
  const [on, setOn] = useState(true);
  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Switch label="Order updates" description="Tell me when the rider leaves" checked={on} onCheckedChange={setOn} />
      <Switch label="Marketing email" defaultChecked={false} />
      <Switch label="Managed by your admin" checked disabled />
    </Stack>
  );
}
