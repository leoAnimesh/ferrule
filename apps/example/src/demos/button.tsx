import { useTheme } from 'ferrule';
import { useState } from 'react';
import { Button, IconButton } from '../../components/ui/button';
import { Stack } from '../../components/ui/stack';
import { Section } from '../ui';
import { Icon } from '../../components/ui/icon';
import { Text } from '../../components/ui/text';
import { useHarness } from '../harness/context';
import { NativeSection } from '../harness/NativeSection';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const run = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };
  return (
    <>
      <Section title={`Variants (pressed ${count} times)`}>
        <Stack direction="horizontal" gap={2} wrap>
          <Button onPress={() => setCount(count + 1)}>Solid</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline" onPress={() => setCount(count + 1)}>Outline</Button>
          <Button variant="ghost" onPress={() => setCount(count + 1)}>Ghost</Button>
          <Button variant="danger" onPress={() => setCount(count + 1)}>Danger</Button>
        </Stack>
      </Section>
      <Section title="Sizes">
        <Stack direction="horizontal" gap={2} align="center" wrap>
          <Button size="sm">Small</Button>
          <Button>Medium</Button>
          <Button size="lg">Large</Button>
        </Stack>
      </Section>
      <Section title="Disabled">
        <Stack direction="horizontal" gap={2} wrap>
          <Button disabled>Solid</Button>
          <Button disabled variant="outline">Outline</Button>
          <Button disabled variant="ghost">Ghost</Button>
        </Stack>
      </Section>
      <Section title="Loading">
        <Stack direction="horizontal" gap={2} wrap>
          <Button loading>Saving</Button>
          <Button loading={loading} onPress={run}>{loading ? 'Working' : 'Press to load'}</Button>
        </Stack>
      </Section>
      <Section title="Full width and long label">
        <Button fullWidth>Full width</Button>
        <Button fullWidth variant="outline">{LONG}</Button>
      </Section>
    </>
  );
}

export function NativeDemo() {
  const { setLog } = useHarness();
  const { colors } = useTheme();
  return (
    <>
      <NativeSection id="native-button" title="Native button" variant="button">
        {(native) => (
          <Stack gap={2}>
            <Button native={native} testID="n-button" onPress={() => setLog('button pressed')}>Solid</Button>
            <Button native={native} variant="soft">Soft</Button>
            <Button native={native} variant="outline">Outline</Button>
            <Button native={native} variant="ghost">Ghost</Button>
            <Button native={native} variant="danger">Danger</Button>
            <Button native={native} disabled>Disabled</Button>
            <Button native={native} fullWidth>Full width</Button>
          </Stack>
        )}
      </NativeSection>
      <NativeSection id="native-icon-button" title="IconButton: Liquid Glass on iOS 26+" variant="iconButton">
        {(native) => (
          <Stack direction="horizontal" gap={2} align="center" wrap>
            <IconButton native={native} nativeIcon={{ ios: 'heart' }} variant="ghost" aria-label="Ghost" onPress={() => {}}><Icon name="heart" /></IconButton>
            <IconButton native={native} nativeIcon={{ ios: 'heart' }} variant="solid" aria-label="Solid" onPress={() => {}}><Icon name="heart" color={colors.onPrimary} /></IconButton>
            <IconButton native={native} nativeIcon={{ ios: 'trash' }} variant="danger" aria-label="Danger" onPress={() => {}}><Icon name="trash-2" color={colors.onDanger} /></IconButton>
            <IconButton native={native} nativeIcon={{ ios: 'heart' }} variant="soft" size="sm" aria-label="Small" onPress={() => {}}><Icon name="heart" /></IconButton>
            <IconButton native={native} nativeIcon={{ ios: 'heart' }} variant="soft" size="lg" aria-label="Large" onPress={() => {}}><Icon name="heart" /></IconButton>
            <IconButton native={native} nativeIcon={{ ios: 'heart' }} variant="soft" disabled aria-label="Disabled"><Icon name="heart" /></IconButton>
          </Stack>
        )}
      </NativeSection>
      <NativeSection id="native-button-loading" title="Native button, loading" variant="button">
        {(native) => <Button native={native} loading>Loading</Button>}
      </NativeSection>
    </>
  );
}
