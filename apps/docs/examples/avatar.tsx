import { Avatar } from '../components/ui/avatar';
import { Stack } from '../components/ui/stack';

export default function Example() {
  return (
    <Stack direction="horizontal" gap={3} align="center">
      <Avatar name="Asha Rao" size="sm" />
      <Avatar name="Tomas Lindqvist" />
      <Avatar name="Mei" size="lg" />
      <Avatar aria-label="Unknown person" />
    </Stack>
  );
}
