import { Button } from '../components/ui/button';
import { Stack } from '../components/ui/stack';
import { useToast } from '../components/ui/toast';

// The app is wrapped once in <ToastProvider>.
export default function Example() {
  const toast = useToast();
  return (
    <Stack direction="horizontal" gap={2} wrap>
      <Button variant="outline" onPress={() => toast.show({ title: 'Saved', tone: 'success' })}>Success</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'Order cancelled', description: 'Your refund is on its way', action: { label: 'Undo', onPress: () => {} } })}>With an action</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'Payment failed', tone: 'danger', duration: null })}>Stays until dismissed</Button>
    </Stack>
  );
}
