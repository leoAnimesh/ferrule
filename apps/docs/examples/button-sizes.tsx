import { Button, IconButton } from '../components/ui/button';
import { Icon } from '../components/ui/icon';
import { Stack } from '../components/ui/stack';

export default function Example() {
  return (
    <Stack direction="horizontal" gap={2} wrap align="center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <IconButton aria-label="Delete" variant="outline"><Icon name="trash-2" /></IconButton>
    </Stack>
  );
}
