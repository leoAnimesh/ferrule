import { FocusRing, Pressable, PALETTE_NAMES, palettes, useTheme, View } from '@leoanimesh/ferrule';
import { Segmented } from '../../components/ui/segmented';
import { Switch } from '../../components/ui/switch';
import { Text } from '../../components/ui/text';
import { customOverrides } from '../../ferrule.theme';
import { TEXT_SCALES, useHarness, type PaletteChoice } from './context';

const CHOICES: PaletteChoice[] = [...PALETTE_NAMES, 'custom'];
export const colorsOf = (choice: PaletteChoice) => (choice === 'custom' ? (customOverrides.palette as typeof palettes.verdigris) : palettes[choice]);

function Swatch({ name }: { name: PaletteChoice }) {
  const { colors, tokens } = useTheme();
  const { palette, mode, set } = useHarness();
  const selected = palette === name;
  return (
    <Pressable testID={`palette-${name}`} role="radio" aria-checked={selected} aria-label={`${name} palette`} onPress={() => set({ palette: name })} style={{ width: tokens.minTouchTarget, height: tokens.minTouchTarget, alignItems: 'center', justifyContent: 'center' }}>
      {({ focused }) => (
        <>
          <View style={{ width: 32, height: 32, padding: 3, borderRadius: tokens.radius.md + 3, borderWidth: 2, borderColor: selected ? colors.text : 'transparent' }}>
            <View style={{ flex: 1, borderRadius: tokens.radius.sm, backgroundColor: colorsOf(name)[mode].primary }} />
          </View>
          <FocusRing visible={focused} radius={tokens.radius.md} />
        </>
      )}
    </Pressable>
  );
}

/** Every global test control. Each is also a deep link parameter, so a test never has to tap these. */
export function Controls() {
  const { tokens } = useTheme();
  const { mode, rtl, native, textScale, set } = useHarness();
  return (
    <View style={{ gap: tokens.space[3] }}>
      <View style={{ gap: tokens.space[1] }}>
        <Text variant="caption" tone="muted">Palette</Text>
        <View role="radiogroup" aria-label="Palette" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {CHOICES.map((name) => <Swatch key={name} name={name} />)}
        </View>
      </View>
      <Segmented testID="control-mode" label="Color mode" options={[{ value: 'light', label: 'Light', testID: 'mode-light' }, { value: 'dark', label: 'Dark', testID: 'mode-dark' }]} value={mode} onValueChange={(value) => set({ mode: value as 'light' | 'dark' })} />
      <View style={{ gap: tokens.space[1] }}>
        <Text variant="caption" tone="muted">Text size. Scales the type tokens. Use the OS setting for real Dynamic Type or font scale</Text>
        <Segmented testID="control-text" label="Text size" options={TEXT_SCALES.map((scale) => ({ value: String(scale), label: `${scale}x` }))} value={String(textScale)} onValueChange={(value) => set({ textScale: Number(value) })} />
      </View>
      <Switch testID="control-native" label="Native variants" description="Off is the same as an app without @leoanimesh/ferrule-native" checked={native} onCheckedChange={(next) => set({ native: next })} />
      <Switch testID="control-rtl" label="Right-to-left" description="Live on web. Restarts the app on iOS and Android" checked={rtl} onCheckedChange={(next) => set({ rtl: next })} />
    </View>
  );
}
