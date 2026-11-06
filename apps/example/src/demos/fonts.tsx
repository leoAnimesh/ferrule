import type { ReactNode } from 'react';
import { createTheme, FerruleProvider, useTheme, View } from 'ferrule';
import { NativeDatePicker, NativeFab, NativeList, NativeMenu, NativePicker, NativeTopBar } from 'ferrule-native';
import { Button } from '../../components/ui/button';
import { Chip } from '../../components/ui/chip';
import { Input } from '../../components/ui/input';
import { Segmented } from '../../components/ui/segmented';
import { Switch } from '../../components/ui/switch';
import { Text } from '../../components/ui/text';
import { useHarness } from '../harness/context';

/** Each font's name is its registered name in `App.tsx`. The files come from `@expo-google-fonts`, none are in this repo. */
const appTheme = createTheme({
  tokens: { fontFamily: { regular: 'Lora_400Regular', medium: 'Lora_500Medium', semibold: 'Lora_600SemiBold', bold: 'Lora_700Bold' } },
  components: { text: { h3: { fontFamily: 'Caveat_700Bold', fontSize: 28 } } },
});
const nestedTheme = createTheme({ tokens: { fontFamily: { regular: 'SpaceMono_400Regular', medium: 'SpaceMono_400Regular', semibold: 'SpaceMono_700Bold', bold: 'SpaceMono_700Bold' } } });

const missingTheme = createTheme({ tokens: { fontFamily: { regular: 'NoSuchFont', medium: 'NoSuchFont', semibold: 'NoSuchFont', bold: 'NoSuchFont' } } });

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="caption" tone="muted">{title}</Text>
      {children}
    </View>
  );
}

function Controls({ native }: { native?: boolean }) {
  return (
    <View style={{ gap: 12 }}>
      <Button native={native} testID="font-button">Button label</Button>
      <Input native={native} testID="font-input" aria-label="Text field" label="Field label" placeholder="Placeholder" helperText="Helper text" />
      <Switch native={native} label="Switch label" />
      <Chip native={native} label="Chip label" />
      <Segmented native={native} label="Segmented" options={[{ value: 'a', label: 'One' }, { value: 'b', label: 'Two' }]} defaultValue="a" />
    </View>
  );
}

function Page() {
  const { native } = useHarness();
  const { tokens } = useTheme();
  return (
    <View testID="fonts-page" style={{ gap: tokens.space[5] }}>
        <Row title="Whole app: every weight from the theme">
          <Text variant="h1">Lora, bold heading</Text>
          <Text>Lora at regular, with <Text style={{ fontWeight: tokens.fontWeight.semibold }}>nested semibold</Text> inside.</Text>
        </Row>
        <Row title="One variant: h3 is Caveat">
          <Text variant="h3" testID="font-variant">A variant with its own font</Text>
        </Row>
        <Row title="One-off style">
          <Text style={{ fontFamily: 'Caveat_700Bold', fontSize: 24 }}>Caveat, no weight given</Text>
          <Text testID="font-oneoff-weight" style={{ fontFamily: 'Caveat_700Bold', fontSize: 24, fontWeight: '700' }}>Caveat, with a weight too</Text>
        </Row>
        <Row title="A generic family keeps its weight">
          <Text style={{ fontFamily: 'serif', fontWeight: '400' }}>Serif at 400</Text>
          <Text style={{ fontFamily: 'serif', fontWeight: '700' }}>Serif at 700</Text>
        </Row>
        <Row title="Italics need a one-off family">
          <Text style={{ fontFamily: 'Lora_400Regular_Italic' }}>Lora Italic, from its own file</Text>
        </Row>
        <Row title="Nested provider: Space Mono">
          <FerruleProvider theme={nestedTheme}>
            <Text testID="font-nested">Everything in here is monospaced.</Text>
            <Button native={native}>Nested button</Button>
          </FerruleProvider>
        </Row>
        <Row title="Native controls take the theme's font">
          <Controls native={native} />
          {native ? <NativeTopBar title="Top bar title" /> : null}
          {native ? <NativeList height={150} rows={[{ id: 'a', title: 'List row', subtitle: 'Row subtitle' }]} /> : null}
          {native ? <NativePicker label="Picker label" options={[{ value: 'a', label: 'First option' }, { value: 'b', label: 'Second option' }]} defaultValue="a" /> : null}
          {native ? <NativeMenu testID="font-menu" label="Menu label" items={[{ value: 'a', label: 'Menu item' }]} /> : null}
          {native ? <NativeDatePicker label="Date label" defaultValue={new Date(2026, 0, 15)} /> : null}
          {native ? <NativeFab icon={{ ios: 'plus', android: 'Add' }} label="Action button" /> : null}
        </Row>
        <Row title="A font that failed to load falls back to the system font">
          <FerruleProvider theme={missingTheme}>
            <Text>Plain text</Text>
            <Button native={native} testID="font-missing">Button label</Button>
          </FerruleProvider>
        </Row>
    </View>
  );
}

export function Demo() {
  return (
    <FerruleProvider theme={appTheme}>
      <Page />
    </FerruleProvider>
  );
}
