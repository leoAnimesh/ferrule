import { Badge } from '../components/ui/badge';
import { Stack } from '../components/ui/stack';

export default function Example() {
  return (
    <Stack gap={2}>
      <Stack direction="horizontal" gap={2} wrap>
        <Badge>Neutral</Badge>
        <Badge tone="primary">Primary</Badge>
        <Badge tone="success">Delivered</Badge>
        <Badge tone="warning">Delayed</Badge>
        <Badge tone="danger">Failed</Badge>
      </Stack>
      <Stack direction="horizontal" gap={2} wrap>
        <Badge tone="primary" variant="solid">Solid</Badge>
        <Badge tone="primary" variant="outline">Outline</Badge>
      </Stack>
    </Stack>
  );
}
