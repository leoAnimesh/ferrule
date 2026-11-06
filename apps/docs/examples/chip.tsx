import { useState } from 'react';
import { Chip } from '../components/ui/chip';
import { Stack } from '../components/ui/stack';

export default function Example() {
  const [fast, setFast] = useState(true);
  const [offers, setOffers] = useState(false);
  return (
    <Stack direction="horizontal" gap={2} wrap>
      <Chip label="Under 25 min" selected={fast} onPress={() => setFast(!fast)} />
      <Chip label="Offers" selected={offers} onPress={() => setOffers(!offers)} />
      <Chip label="Clear filters" onPress={() => { setFast(false); setOffers(false); }} />
    </Stack>
  );
}
