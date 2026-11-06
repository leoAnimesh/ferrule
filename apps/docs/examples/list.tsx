import { Badge } from '../components/ui/badge';
import { List, ListItem } from '../components/ui/list';

const ORDERS = [
  { id: '1', title: 'Copper Handi', detail: 'North Indian', state: 'On the way' },
  { id: '2', title: 'Slice Theory', detail: 'Wood-fired pizza', state: 'Delivered' },
  { id: '3', title: 'Noodle Foundry', detail: 'Hand-pulled noodles', state: 'Delivered' },
];

export default function Example() {
  return (
    <List
      data={ORDERS}
      dividers
      keyExtractor={(order) => order.id}
      renderItem={({ item }) => <ListItem title={item.title} description={item.detail} end={<Badge>{item.state}</Badge>} onPress={() => {}} />}
      style={{ maxWidth: 420 }}
    />
  );
}
