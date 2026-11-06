import { Spinner } from '../components/ui/spinner';
import { Stack } from '../components/ui/stack';

export default function Example() {
  return (
    <Stack direction="horizontal" gap={4} align="center">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" label="Loading orders" />
    </Stack>
  );
}
