import { Button } from '../components/ui/button';
import { Stack } from '../components/ui/stack';
import { useToast } from '../components/ui/toast';

// The default is { enter: 'slide', exit: 'fade' }. Reduced motion skips the movement.
export default function Example() {
  const toast = useToast();
  return (
    <Stack direction="horizontal" gap={2} wrap>
      <Button variant="outline" onPress={() => toast.show({ title: 'Slides both ways', animation: 'slide' })}>Slide</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'Fades', animation: 'fade' })}>Fade</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'Scales', animation: 'scale' })}>Scale</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'Appears at once', animation: 'none' })}>None</Button>
      <Button variant="outline" onPress={() => toast.show({ title: 'Slow to open and close', animation: { enter: 'scale', exit: 'slide' }, animationDuration: 800 })}>Scale in, slide out, 800ms</Button>
    </Stack>
  );
}
