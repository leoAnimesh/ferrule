import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FerruleProvider, Platform, useTheme, View, type LayoutChangeEvent } from 'ferrule';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { ListItem } from '../../components/ui/list';
import { Spinner } from '../../components/ui/spinner';
import { Divider } from '../../components/ui/stack';
import { Switch } from '../../components/ui/switch';
import { Text } from '../../components/ui/text';
import { interTheme } from '../../ferrule.theme';
import { useHarness } from '../harness/context';

type Size = [width: number, height: number];

/**
 * The visual consistency fixture. Renders components in a fixed 320dp column, so screen size has no
 * effect, then logs every measured size as FERRULE_METRICS. scripts/compare-metrics.mjs diffs the logs.
 */
function Metrics() {
  const { tokens, colors } = useTheme();
  const results = useRef<Record<string, Size>>({});
  const [count, setCount] = useState(0);

  const Probe = ({ id, children }: { id: string; children: ReactNode }) => (
    <View
      style={{ alignSelf: 'flex-start', maxWidth: 320 }}
      onLayout={(e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        results.current[id] = [Math.round(width * 10) / 10, Math.round(height * 10) / 10];
        setCount(Object.keys(results.current).length);
      }}
    >
      {children}
    </View>
  );
  const Fill = ({ id, children }: { id: string; children: ReactNode }) => (
    <Probe id={id}><View style={{ width: 320 }}>{children}</View></Probe>
  );

  useEffect(() => {
    if (!count) return;
    const timer = setTimeout(() => console.log('FERRULE_METRICS ' + JSON.stringify({ platform: Platform.OS, results: results.current })), 800);
    return () => clearTimeout(timer);
  }, [count]);

  const sentence = 'The quick brown fox jumps over the lazy dog, and then wraps onto another line.';
  return (
    <View style={{ gap: tokens.space[3] }}>
      <Text variant="caption" tone="muted">{`${count} probes measured. Sizes are logged as FERRULE_METRICS.`}</Text>
      <Fill id="text.display"><Text variant="display">Display</Text></Fill>
      <Fill id="text.body.wrap"><Text>{sentence}</Text></Fill>
      <Probe id="text.h1.hug"><Text variant="h1">Heading</Text></Probe>
      <Probe id="text.body.hug"><Text>Measured width</Text></Probe>
      <Probe id="text.caption.hug"><Text variant="caption">Caption width</Text></Probe>
      <Probe id="button.sm"><Button size="sm">Small</Button></Probe>
      <Probe id="button.md"><Button>Medium</Button></Probe>
      <Probe id="button.lg"><Button size="lg">Large</Button></Probe>
      <Probe id="button.outline"><Button variant="outline">Outline</Button></Probe>
      <Probe id="button.loading"><Button loading>Saving</Button></Probe>
      <Fill id="button.wrap"><Button fullWidth>{sentence}</Button></Fill>
      <Fill id="input.plain"><Input aria-label="Plain" defaultValue="Value" /></Fill>
      <Fill id="input.label"><Input label="Label" defaultValue="Value" /></Fill>
      <Fill id="input.error"><Input label="Label" error="Something is wrong." /></Fill>
      <Fill id="input.sm"><Input size="sm" aria-label="Small" /></Fill>
      <Fill id="input.lg"><Input size="lg" aria-label="Large" /></Fill>
      <Fill id="checkbox"><Checkbox label="Checkbox" defaultChecked /></Fill>
      <Fill id="checkbox.error"><Checkbox label="Checkbox" error="Required." /></Fill>
      <Fill id="switch"><Switch label="Switch" defaultChecked /></Fill>
      <Fill id="switch.description"><Switch label="Switch" description="Description" /></Fill>
      <Probe id="badge.soft"><Badge>Badge</Badge></Probe>
      <Probe id="badge.solid"><Badge variant="solid" tone="primary">Primary</Badge></Probe>
      <Probe id="avatar.sm"><Avatar size="sm" name="Ada Lovelace" /></Probe>
      <Probe id="avatar.md"><Avatar name="Ada Lovelace" /></Probe>
      <Probe id="avatar.lg"><Avatar size="lg" /></Probe>
      <Probe id="spinner.sm"><Spinner size="sm" /></Probe>
      <Probe id="spinner.lg"><Spinner size="lg" /></Probe>
      <Fill id="divider"><Divider /></Fill>
      <Fill id="listItem"><ListItem title="Title" description="Description" onPress={() => {}} /></Fill>
      <Fill id="card">
        <Card>
          <CardHeader title="Card title" description="Card description" />
          <CardContent><Text>Content</Text></CardContent>
          <CardFooter><Button size="sm">Action</Button></CardFooter>
        </Card>
      </Fill>
      <View style={{ height: 1, backgroundColor: colors.border }} />
    </View>
  );
}

/** Inter removes the font as a variable: the metrics compare layout, and each platform's system font has its own widths. */
export function Demo() {
  const { mode, paletteColors } = useHarness();
  return (
    <FerruleProvider native={false} theme={interTheme} palette={paletteColors} colorMode={mode}>
      <Metrics />
    </FerruleProvider>
  );
}
