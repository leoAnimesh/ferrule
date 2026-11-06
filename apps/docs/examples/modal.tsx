import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/modal';
import { Stack } from '../components/ui/stack';
import { Text } from '../components/ui/text';

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onPress={() => setOpen(true)}>Delete account</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Delete your account?"
        description="This removes your orders and addresses."
        footer={
          <Stack direction="horizontal" gap={2} justify="flex-end">
            <Button variant="ghost" onPress={() => setOpen(false)}>Keep it</Button>
            <Button variant="danger" onPress={() => setOpen(false)}>Delete</Button>
          </Stack>
        }
      >
        <Text>Escape, the backdrop and the close button all dismiss this dialog.</Text>
      </Modal>
    </>
  );
}
