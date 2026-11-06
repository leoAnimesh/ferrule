import { useTheme, View } from 'ferrule';
import { Carousel } from '../components/ui/carousel';
import { Text } from '../components/ui/text';

const PROMOS = ['Half off your first order', 'Dinner in 20 minutes', 'Free delivery this week'];

export default function Example() {
  const { colors } = useTheme();
  return (
    <Carousel itemWidth={240} inset={0}>
      {PROMOS.map((promo) => (
        <View key={promo} style={{ padding: 20, minHeight: 120, borderRadius: 10, backgroundColor: colors.primarySoft }}>
          <Text variant="h3" tone="onPrimarySoft">{promo}</Text>
        </View>
      ))}
    </Carousel>
  );
}
