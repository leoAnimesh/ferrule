import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Stack } from '../components/ui/stack';

export default function Example() {
  const [email, setEmail] = useState('');
  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Input label="Email" helperText="We send the receipt here" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Promo code" defaultValue="PEPPER" error="This code has expired" />
      <Input label="Account" defaultValue="Locked" disabled />
    </Stack>
  );
}
