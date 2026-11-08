import { Button } from '../components/ui/button';
import { Stack } from '../components/ui/stack';
import { useToast } from '../components/ui/toast';

// <ToastProvider position="top" align="end"> sets these for every toast. A toast's own options win.
export default function Example() {
  const toast = useToast();
  return (
    <Stack direction="horizontal" gap={2} wrap>
      <Button variant="outline" onPress={() => toast.show({ title: 'At the top', position: 'top' })}>Top</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'At the bottom', position: 'bottom' })}>Bottom</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'Top, at the start', position: 'top', align: 'start' })}>Top start</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'Bottom, at the end', position: 'bottom', align: 'end' })}>Bottom end</Button>
    </Stack>
  );
}
