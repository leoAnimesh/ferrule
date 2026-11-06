import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Stack } from '../components/ui/stack';

export default function Example() {
  const [saving, setSaving] = useState(false);
  return (
    <Stack direction="horizontal" gap={2} wrap align="center">
      <Button>Solid</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button disabled>Disabled</Button>
      <Button loading={saving} onPress={() => { setSaving(true); setTimeout(() => setSaving(false), 1500); }}>Save</Button>
    </Stack>
  );
}
