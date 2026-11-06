import { Text } from '../../components/ui/text';
import { Section } from '../ui';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  return (
    <>
      <Section title="Variants">
        <Text variant="display">Display</Text>
        <Text variant="h1">Heading 1</Text>
        <Text variant="h2">Heading 2</Text>
        <Text variant="h3">Heading 3</Text>
        <Text>Body text</Text>
        <Text variant="bodySmall">Body small</Text>
        <Text variant="label">Label</Text>
        <Text variant="caption">Caption</Text>
      </Section>
      <Section title="Tones">
        <Text tone="muted">Muted</Text>
        <Text tone="primary">Primary</Text>
        <Text tone="success">Success</Text>
        <Text tone="warning">Warning</Text>
        <Text tone="danger">Danger</Text>
      </Section>
      <Section title="Long text and truncation">
        <Text>{LONG}</Text>
        <Text numberOfLines={1}>{LONG}</Text>
        <Text>{''}</Text>
      </Section>
    </>
  );
}
