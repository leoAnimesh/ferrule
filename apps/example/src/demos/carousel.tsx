import { useTheme, View } from 'ferrule';
import { Carousel } from '../../components/ui/carousel';
import { Text } from '../../components/ui/text';
import { Section } from '../ui';

const ITEMS = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];

function Tile({ children }: { children: string }) {
  const { colors, tokens } = useTheme();
  return <View style={{ minHeight: 120, padding: tokens.space[4], borderRadius: tokens.radius.lg, backgroundColor: colors.primarySoft }}><Text variant="h3" tone="onPrimarySoft">{children}</Text></View>;
}

export function Demo() {
  return (
    <>
      <Section title="Settles on item edges. Check right-to-left opens on the first item">
        <Carousel testID="carousel" itemWidth={240} inset={0}>{ITEMS.map((item) => <Tile key={item}>{item}</Tile>)}</Carousel>
      </Section>
      <Section title="Narrow items, wider gap">
        <Carousel itemWidth={120} gap={5} inset={0}>{ITEMS.map((item) => <Tile key={item}>{item}</Tile>)}</Carousel>
      </Section>
      <Section title="One item"><Carousel itemWidth={240} inset={0}><Tile>Only</Tile></Carousel></Section>
    </>
  );
}
