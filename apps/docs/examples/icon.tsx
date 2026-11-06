import { useTheme } from 'ferrule';
import { Icon } from '../components/ui/icon';
import { Stack } from '../components/ui/stack';

export default function Example() {
  const { colors } = useTheme();
  return (
    <Stack direction="horizontal" gap={3} align="center">
      <Icon name="map-pin" />
      <Icon name="map-pin" size={28} color={colors.primary} />
      <Icon name="star" size={28} color={colors.warning} label="Rated" />
    </Stack>
  );
}
