import { Image as RNImage } from '@leoanimesh/ferrule';
import { Badge } from '../../components/ui/badge';
import { Image } from '../../components/ui/image';
import { Stack } from '../../components/ui/stack';
import { Section } from '../ui';
const sample = require('../../assets/sample.png');

export function Demo() {
  // Metro serves the sample over HTTP, so this is a real remote load with no third-party host. The web bundler already gives a URL.
  const remote: string | undefined = typeof sample === 'string' ? sample : RNImage.resolveAssetSource?.(sample)?.uri ?? sample?.uri;
  return (
    <>
      <Section title="Remote, loaded over HTTP from the dev server. Placeholder, then a fade">
        <Image testID="image-remote" source={remote} alt="The same landscape, from a URL" aspectRatio={16 / 10} />
      </Section>
      <Section title="Loaded, with alt text">
        <Image source={sample} alt="A generated landscape" aspectRatio={16 / 10} />
      </Section>
      <Section title="Radius and contain">
        <Stack direction="horizontal" gap={3}>
          <Image source={sample} alt="Round" radius="full" style={{ width: 96, height: 96 }} />
          <Image source={sample} alt="Contain" resizeMode="contain" style={{ width: 96, height: 96 }} />
          <Image source={sample} alt="" radius="none" style={{ width: 96, height: 96 }} />
        </Stack>
      </Section>
      <Section title="Broken URL, missing source, custom fallback">
        <Stack direction="horizontal" gap={3}>
          <Image source="https://invalid.invalid/none.png" alt="Failed to load" style={{ width: 96, height: 96 }} />
          <Image source={null} alt="No source" style={{ width: 96, height: 96 }} />
          <Image source={null} alt="Custom" fallback={<Badge tone="warning">None</Badge>} style={{ width: 96, height: 96 }} />
        </Stack>
      </Section>
    </>
  );
}
