import { useEffect } from 'react';
import { Animated, cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, useTheme, View, withRepeat, withTiming } from 'ferrule';
import { IconButton } from '../../components/ui/button';
import { Stack } from '../../components/ui/stack';
import { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';
import { Text } from '../../components/ui/text';
import { Section } from '../ui';
import { hasLiquidGlass } from 'ferrule-native';
import { NativeSection } from '../harness/NativeSection';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const [taps, setTaps] = useState(0);
  return (
    <>
      <Section title="Variants">
        <Card><CardHeader title="Outline" description="The default" /></Card>
        <Card variant="elevated"><CardHeader title="Elevated" description="Uses the shadow token" /></Card>
        <Card variant="filled"><CardHeader title="Filled" description="Muted surface" /></Card>
      </Section>
      <Section title="Header, content and footer">
        <Card>
          <CardHeader title={LONG} end={<Badge tone="success">New</Badge>} />
          <CardContent><Text>Card content goes here.</Text></CardContent>
          <CardFooter><Button variant="ghost" size="sm">Cancel</Button><Button size="sm">Save</Button></CardFooter>
        </Card>
      </Section>
      <Section title={`Pressable (pressed ${taps} times)`}>
        <Card aria-label="Press me" onPress={() => setTaps(taps + 1)}><CardHeader title="Press me" /></Card>
        <Card aria-label="Disabled" disabled onPress={() => setTaps(taps + 1)} style={{ opacity: 0.5 }}><CardHeader title="Disabled" /></Card>
      </Section>
    </>
  );
}

/** Moves under the glass, so the refraction shows. Ends at rest so the screen check can settle, and does not run under reduced motion. */
function useDrift(distance: number) {
  const x = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    x.value = withRepeat(withTiming(distance, { duration: 2600, easing: Easing.inOut(Easing.quad) }), 6, true);
    return () => cancelAnimation(x);
  }, [reduced, distance, x]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
}

export function NativeDemo() {
  const { colors } = useTheme();
  const drift = useDrift(170);
  const back = useDrift(-120);
  return (
    <NativeSection id="native-glass" title="Glass container, iOS 26+" variant="card">
      {(native) => (
        <View style={{ borderRadius: 16, padding: 16, gap: 16, overflow: 'hidden', backgroundColor: colors.primarySoft }}>
          <Animated.View style={[{ position: 'absolute', top: 44, left: 20, width: 90, height: 90, borderRadius: 45, backgroundColor: colors.warningSoft }, drift]} />
          <Animated.View style={[{ position: 'absolute', top: 70, right: 16, width: 130, height: 56, backgroundColor: colors.primary, opacity: 0.45 }, back]} />
          <Text testID="native-glass-state" variant="caption">{hasLiquidGlass() ? 'Liquid Glass API: available' : 'Liquid Glass API: not on this OS'}</Text>
          <Card native={native} testID="n-glass"><CardContent style={{ paddingTop: 16 }}><Text>Real React children inside the card.</Text><Text tone="muted">The shapes move behind it.</Text></CardContent></Card>
          <Stack direction="horizontal" gap={3} align="center">
            <IconButton native={native} nativeIcon={{ ios: 'heart' }} variant="ghost" aria-label="Like"><Icon name="heart" /></IconButton>
            <IconButton native={native} nativeIcon={{ ios: 'square.and.arrow.up' }} variant="soft" aria-label="Share"><Icon name="share" /></IconButton>
            <IconButton native={native} nativeIcon={{ ios: 'plus' }} variant="solid" aria-label="Add"><Icon name="plus" color={colors.onPrimary} /></IconButton>
          </Stack>
        </View>
      )}
    </NativeSection>
  );
}
