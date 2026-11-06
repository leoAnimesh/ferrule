import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';
import { ListItem } from '../../components/ui/list';
import { SwipeRow } from '../../components/ui/swipe-row';
import { Text } from '../../components/ui/text';
import { useToast } from '../../components/ui/toast';
import { Section } from '../ui';

export function Demo() {
  const [count, setCount] = useState(0);
  const toast = useToast();
  const remove = () => { setCount(count + 1); toast.show({ title: 'Deleted', action: { label: 'Undo', onPress: () => setCount(count) } }); };
  return (
    <>
      <Section title={`Actions run: ${count}`}>
        <Card>
          <SwipeRow testID="swipe-row" endAction={{ label: 'Delete', tone: 'danger', icon: (color: string) => <Icon name="trash-2" color={color} />, onAction: remove }}>
            <ListItem title="Drag me toward the start" description="Past the threshold runs the action" />
          </SwipeRow>
          <SwipeRow startAction={{ label: 'Done', tone: 'success', icon: (color: string) => <Icon name="check" color={color} />, onAction: () => setCount(count + 1) }} endAction={{ label: 'Delete', tone: 'danger', icon: (color: string) => <Icon name="trash-2" color={color} />, onAction: remove }}>
            <ListItem title="Both directions" />
          </SwipeRow>
        </Card>
      </Section>
      <Section title="A keyboard cannot swipe, so the same action needs a visible control">
        <Button variant="outline" onPress={remove}>Delete</Button>
        <Text tone="muted">Screen readers get these as accessibility actions on the row.</Text>
      </Section>
    </>
  );
}
