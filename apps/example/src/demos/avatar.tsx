import { Avatar } from '../../components/ui/avatar';
import { Stack } from '../../components/ui/stack';
import { Section } from '../ui';
const sample = require('../../assets/sample.png');

export function Demo() {
  return (
    <>
      <Section title="Sizes with image">
        <Stack direction="horizontal" gap={3} align="center">
          <Avatar size="sm" src={sample} name="Sample" />
          <Avatar src={sample} name="Sample" />
          <Avatar size="lg" src={sample} name="Sample" />
        </Stack>
      </Section>
      <Section title="Initials, broken image, no name">
        <Stack direction="horizontal" gap={3} align="center">
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace" />
          <Avatar name="Broken Image" src="file:///does-not-exist.png" />
          <Avatar />
          <Avatar size="lg" />
        </Stack>
      </Section>
    </>
  );
}
