import { useState } from 'react';
import { Button } from '../components/ui/button';
import { ListItem } from '../components/ui/list';
import { Sheet } from '../components/ui/sheet';

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onPress={() => setOpen(true)}>Change address</Button>
      <Sheet open={open} onOpenChange={setOpen} title="Deliver to">
        <ListItem title="Home" description="12th Main, near the metro" onPress={() => setOpen(false)} />
        <ListItem title="Work" description="4th Cross, second floor" onPress={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
