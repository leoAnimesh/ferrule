import type { ReactNode } from 'react';
import { ScrollView, useTheme, View } from '@leoanimesh/ferrule';
import { Text } from '../components/ui/text';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: tokens.space[3] }}>
      <Text variant="label" tone="muted">{title}</Text>
      <View style={{ gap: tokens.space[3] }}>{children}</View>
    </View>
  );
}

export function Code({ children }: { children: string }) {
  const { colors, tokens } = useTheme();
  return (
    <ScrollView horizontal style={{ backgroundColor: colors.surfaceMuted, borderRadius: tokens.radius.sm }} contentContainerStyle={{ padding: tokens.space[3] }}>
      <Text variant="caption" selectable style={{ fontFamily: 'Courier' }}>{children}</Text>
    </ScrollView>
  );
}
