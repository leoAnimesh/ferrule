import { useState } from 'react';
import { useTheme, View } from 'ferrule';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { ListItem } from '../../components/ui/list';
import { Divider } from '../../components/ui/stack';
import { Switch } from '../../components/ui/switch';
import { Text } from '../../components/ui/text';

/** One screen with the main components together, for judging a palette at a glance. */
export function Demo() {
  const { tokens } = useTheme();
  const [on, setOn] = useState(true);
  return (
    <View style={{ gap: tokens.space[5] }}>
      <View style={{ gap: tokens.space[1] }}>
        <Text variant="display" aria-level={2}>Spring harvest</Text>
        <Text tone="muted">Orders from 412 growers close on Friday at 17:00.</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[2] }}>
        <Button>Place order</Button>
        <Button variant="soft">Save draft</Button>
        <Button variant="outline">Preview</Button>
        <Button variant="ghost">Skip</Button>
        <Button variant="danger">Cancel order</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Sending</Button>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[2] }}>
        <Badge tone="primary">New</Badge>
        <Badge tone="success">Paid</Badge>
        <Badge tone="warning">Low stock</Badge>
        <Badge tone="danger">Overdue</Badge>
        <Badge>Draft</Badge>
        <Badge tone="primary" variant="solid">3</Badge>
      </View>
      <Text variant="h2" aria-level={3}>This week's order</Text>
      <Card>
        <CardHeader title="Delivery" description="Where the first crate should go." end={<Badge tone="success">Open</Badge>} />
        <CardContent>
          <Input label="Depot" defaultValue="North Quay, bay 4" helperText="Drivers see this on their route." />
          <Input label="Crates" defaultValue="0" error="Enter at least 1 crate." />
          <Switch label="Chilled transport" description="Adds 2.40 per crate." checked={on} onCheckedChange={setOn} />
          <Checkbox label="Text me on arrival" defaultChecked />
        </CardContent>
        <CardFooter>
          <Button variant="ghost">Back</Button>
          <Button>Continue</Button>
        </CardFooter>
      </Card>
      <Card variant="elevated">
        <ListItem title="Mara Lindqvist" description="Grower, 18 crates" start={<Avatar name="Mara Lindqvist" />} end={<Text variant="label">432.00</Text>} onPress={() => {}} />
        <Divider />
        <ListItem title="Tomas Oyelaran" description="Grower, 6 crates" start={<Avatar name="Tomas Oyelaran" />} end={<Text variant="label">96.50</Text>} selected onPress={() => {}} />
      </Card>
    </View>
  );
}
