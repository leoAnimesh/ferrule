import { useResponsive, View, useTheme } from '@leoanimesh/ferrule';
import { Container, Divider, Grid, Spacer, Stack } from '../components/ui/stack';
import { Text } from '../components/ui/text';

function Cell({ children }: { children: string }) {
  const { colors } = useTheme();
  return <View style={{ padding: 12, backgroundColor: colors.primarySoft }}><Text tone="onPrimarySoft">{children}</Text></View>;
}

export default function Example() {
  const columns = useResponsive({ base: 2, md: 3 });
  return (
    <Container maxWidth={560}>
      <Stack gap={3}>
        <Stack direction="horizontal" gap={2}>
          <Cell>Start</Cell>
          <Spacer />
          <Cell>End</Cell>
        </Stack>
        <Divider />
        <Grid columns={columns} gap={2}>
          <Cell>One</Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
          <Cell>Four</Cell>
        </Grid>
      </Stack>
    </Container>
  );
}
