import { useState } from 'react';
import { Button } from '../components/ui/button';
import { ListItem } from '../components/ui/list';
import { Stack } from '../components/ui/stack';
import { SwipeRow } from '../components/ui/swipe-row';
import { Text } from '../components/ui/text';

// A keyboard cannot swipe, so the same action is offered as a visible button too.
export default function Example() {
  const [done, setDone] = useState(false);
  const toggle = () => setDone(!done);
  return (
    <Stack gap={2} style={{ maxWidth: 420 }}>
      <SwipeRow endAction={{ label: done ? 'Undo' : 'Complete', tone: 'success', onAction: toggle }}>
        <ListItem title="Call the kitchen" description="Drag this row sideways" />
      </SwipeRow>
      <Stack direction="horizontal" gap={3} align="center">
        <Button variant="outline" size="sm" onPress={toggle}>{done ? 'Undo' : 'Complete'}</Button>
        <Text tone="muted">{done ? 'Done' : 'Not done yet'}</Text>
      </Stack>
    </Stack>
  );
}
