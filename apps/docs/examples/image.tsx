import { Image } from '../components/ui/image';
import { Stack } from '../components/ui/stack';

const photo = require('../assets/sample.png');

export default function Example() {
  return (
    <Stack direction="horizontal" gap={3} wrap>
      <Image source={photo} alt="A generated landscape" aspectRatio={1.6} style={{ width: 280 }} />
      <Image source={null} alt="No source, so this shows the fallback" aspectRatio={1.6} style={{ width: 280 }} />
    </Stack>
  );
}
