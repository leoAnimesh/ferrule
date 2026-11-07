import { createPalette, FerruleProvider } from 'ferrule';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Stack } from '../components/ui/stack';
import { Switch } from '../components/ui/switch';
import { Text } from '../components/ui/text';

const palette = createPalette({ light: '#7A1F5C', dark: '#F2B5DC' });

// A nested provider reprints only this section. Color mode carries over from the page.
export default function Example() {
  return (
    <FerruleProvider palette={palette}>
      <Stack gap={3} padding={4}>
        <Text variant="h3">Your own ink</Text>
        <Text tone="muted">Every surface and state here comes from the two colors above.</Text>
        <Stack direction="horizontal" gap={2} wrap align="center">
          <Button>Solid</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Badge tone="primary">Badge</Badge>
        </Stack>
        <Switch label="Reprinted" defaultChecked />
      </Stack>
    </FerruleProvider>
  );
}
