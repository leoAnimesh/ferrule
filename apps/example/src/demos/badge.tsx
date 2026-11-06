import { Badge } from '../../components/ui/badge';
import { Stack } from '../../components/ui/stack';
import { Section } from '../ui';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const tones = ['neutral', 'primary', 'success', 'warning', 'danger'] as const;
  return (
    <>
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <Section key={variant} title={variant}>
          <Stack direction="horizontal" gap={2} wrap>
            {tones.map((tone) => <Badge key={tone} tone={tone} variant={variant}>{tone}</Badge>)}
          </Stack>
        </Section>
      ))}
      <Section title="Long text truncates, empty renders nothing">
        <Badge>{LONG}</Badge>
        <Badge>{''}</Badge>
      </Section>
    </>
  );
}
