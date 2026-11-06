import { useTheme } from 'ferrule';
import type { FeatherName } from 'ferrule/lib/feather';
import { Icon } from '../../components/ui/icon';
import { Stack } from '../../components/ui/stack';
import { Text } from '../../components/ui/text';
import { Section } from '../ui';

// @ts-expect-error A wrong name must fail typecheck.
export const WRONG_NAME_CHECK: FeatherName = 'not-a-feather-icon';

export function Demo() {
  const { colors } = useTheme();
  return (
    <>
      <Section title="Sizes">
        <Stack direction="horizontal" gap={3} align="center"><Icon name="map-pin" size={16} /><Icon name="map-pin" /><Icon name="map-pin" size={32} /></Stack>
      </Section>
      <Section title="Tinted from the palette">
        <Stack direction="horizontal" gap={3} align="center">
          <Icon name="star" color={colors.primary} />
          <Icon name="star" color={colors.success} />
          <Icon name="star" color={colors.warning} />
          <Icon name="star" color={colors.danger} />
        </Stack>
      </Section>
      <Section title="Arrows and chevrons mirror in right-to-left. Media controls do not">
        <Stack testID="icon-directional" direction="horizontal" gap={3} align="center"><Icon name="chevron-left" /><Icon name="arrow-right" /><Icon name="corner-down-left" /><Icon name="log-out" /><Icon name="skip-forward" /><Icon name="chevron-left" flip={false} /><Text tone="muted">Last: flip off</Text></Stack>
      </Section>
      <Section title="Fine detail and large sizes">
        <Stack direction="horizontal" gap={3} align="center"><Icon name="settings" size={14} /><Icon name="settings" size={24} /><Icon name="github" size={48} /><Icon name="feather" size={96} /></Stack>
      </Section>
      <Section title="With a label, so a screen reader meets it">
        <Icon name="flag" label="Flagged" />
      </Section>
    </>
  );
}
