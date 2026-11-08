import { useTheme, View } from '@leoanimesh/ferrule';
import { Divider, Spacer, Stack, Grid } from '../../components/ui/stack';
import { Text } from '../../components/ui/text';
import { Badge } from '../../components/ui/badge';
import { Section } from '../ui';

export function Demo() {
  const { colors } = useTheme();
  const Box = () => <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: colors.primary }} />;
  return (
    <>
      <Section title="Horizontal with gap, and Spacer (flips in RTL)">
        <Stack direction="horizontal" gap={2}><Box /><Box /><Spacer /><Box /></Stack>
      </Section>
      <Section title="Wrap">
        <Stack direction="horizontal" gap={2} wrap>{Array.from({ length: 12 }, (_, i) => <Box key={i} />)}</Stack>
      </Section>
      <Section title="Dividers">
        <Divider />
        <Stack direction="horizontal" gap={3} style={{ height: 32 }}><Text>A</Text><Divider orientation="vertical" /><Text>B</Text></Stack>
      </Section>
      <Section title="Grid, with a short last row">
        <Grid columns={2} gap={2}>
          {['One', 'Two', 'Three'].map((label) => <Badge key={label}>{label}</Badge>)}
        </Grid>
      </Section>
    </>
  );
}
