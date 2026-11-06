import type { ReactNode } from 'react';
import { Platform, resolveNativeVariant, useTheme, View } from 'ferrule';
import { isLinked } from 'ferrule-native';
import { Badge } from '../../components/ui/badge';
import { Text } from '../../components/ui/text';
import { useHarness } from './context';

interface Props {
  /** For `?component=button&only=<id>`, which shows this section alone. */
  id: string;
  title: string;
  /** The name `ferrule-native` registers, for a Ferrule component with a `native` prop. */
  variant?: string;
  /** The view's manager name, for a native-only component. */
  view?: string;
  children: (native: boolean) => ReactNode;
}

/** A native variant, labelled with what is really drawing it. */
export function NativeSection({ id, title, variant, view, children }: Props) {
  const { tokens } = useTheme();
  const { native, only } = useHarness();
  if (only && only !== id) return null;
  const real = native && (variant ? Boolean(resolveNativeVariant(variant, true)) : Boolean(view && isLinked(view)));
  return (
    <View style={{ gap: tokens.space[3] }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: tokens.space[2] }}>
        <Text variant="label" tone="muted">{title}</Text>
        <Badge testID={`status-${id}`} tone={real ? 'primary' : 'neutral'} variant={real ? 'solid' : 'outline'}>{real ? 'Native view' : native ? `Fallback on ${Platform.OS}` : 'Ferrule, native off'}</Badge>
      </View>
      <View testID={`demo-${id}`} style={{ gap: tokens.space[3] }}>{children(native)}</View>
    </View>
  );
}

/** A native-only control has no Ferrule version, so its fallback slot shows this. */
export const NoFerrule = ({ name }: { name: string }) => <Text tone="muted">No Ferrule {name}: this is the fallback slot.</Text>;
