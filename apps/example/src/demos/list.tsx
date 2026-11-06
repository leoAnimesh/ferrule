import { useState } from 'react';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { List, ListItem } from '../../components/ui/list';
import { Divider } from '../../components/ui/stack';
import { Text } from '../../components/ui/text';
import { Section } from '../ui';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const [selected, setSelected] = useState('b');
  const data = [{ id: 'a', title: 'Alpha', description: 'First row' }, { id: 'b', title: 'Beta', description: LONG }, { id: 'c', title: 'Gamma' }];
  return (
    <>
      <Section title="Rows: pressable, selected, disabled, with start and end">
        <Card>
          <List
            scrollEnabled={false}
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListItem title={item.title} description={item.description} selected={selected === item.id} onPress={() => setSelected(item.id)} start={<Avatar size="sm" name={item.title} />} end={selected === item.id ? <Badge tone="primary">Active</Badge> : undefined} />
            )}
          />
          <Divider />
          <ListItem title="Disabled" disabled onPress={() => {}} />
          <Divider />
          <ListItem title="Static row" end={<Text tone="muted">Value</Text>} />
        </Card>
      </Section>
      <Section title="Empty">
        <Card><List scrollEnabled={false} data={[]} renderItem={() => null} emptyText="No results found" /></Card>
      </Section>
      <Section title="Loading">
        <Card><List scrollEnabled={false} loading data={data} renderItem={() => null} /></Card>
      </Section>
    </>
  );
}
