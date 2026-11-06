import { Stack } from '../components/ui/stack';
import { Text } from '../components/ui/text';

export default function Example() {
  return (
    <Stack gap={2}>
      <Text variant="h1">Heading one</Text>
      <Text variant="h3">Heading three</Text>
      <Text>Body text, at the size people read most.</Text>
      <Text variant="bodySmall" tone="muted">Muted, for what can wait.</Text>
      <Text variant="label" tone="primary">A label in the palette's ink</Text>
      <Text variant="caption" tone="danger">A caption in the danger tone</Text>
    </Stack>
  );
}
