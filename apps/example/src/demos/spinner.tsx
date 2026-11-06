import { useTheme } from 'ferrule';
import { Spinner } from '../../components/ui/spinner';
import { Stack } from '../../components/ui/stack';
import { Section } from '../ui';
import { NativeProgress } from 'ferrule-native';
import { NativeSection, NoFerrule } from '../harness/NativeSection';

export function Demo() {
  const { colors } = useTheme();
  return (
    <>
      <Section title="Sizes">
        <Stack direction="horizontal" gap={4} align="center"><Spinner size="sm" /><Spinner /><Spinner size="lg" /><Spinner color={colors.danger} /></Stack>
      </Section>
    </>
  );
}

export function NativeDemo() {
  return (
    <NativeSection id="native-progress" title="Native progress" variant="spinner">
      {(native) => (
        <>
          <Spinner native={native} />
          {native ? <NativeProgress value={0.4} testID="n-progress" a11yLabel="Upload progress" /> : <NoFerrule name="linear progress here: see Progress" />}
          {native ? <NativeProgress a11yLabel="Loading" /> : null}
        </>
      )}
    </NativeSection>
  );
}
