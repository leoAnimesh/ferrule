import { Button } from '../components/ui/button';
import { Stack } from '../components/ui/stack';
import { useToast } from '../components/ui/toast';

// The default is 5000, also for a toast with an action. Give one with an action longer, or null.
export default function Example() {
  const toast = useToast();
  return (
    <Stack direction="horizontal" gap={2} wrap>
      <Button variant="outline" onPress={() => toast.show({ title: 'Gone in 2 seconds', duration: 2000 })}>2 seconds</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'Message archived', duration: 10000, action: { label: 'Undo', onPress: () => {} } })}>10 seconds, with an action</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'No connection', duration: null })}>Until dismissed</Button>
    </Stack>
  );
}
