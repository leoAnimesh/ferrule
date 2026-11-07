import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';
import { Section } from '../ui';

const LONG = 'This label is deliberately long so that wrapping, truncation and large font scaling can be checked on a narrow screen without anything clipping.';

export function Demo() {
  const toast = useToast();
  return (
    <>
      <Section title="Tones">
        <Button onPress={() => toast.show({ title: 'Neutral toast' })}>Neutral</Button>
        <Button variant="outline" onPress={() => toast.show({ title: 'Saved', description: 'Your changes are live.', tone: 'success' })}>Success</Button>
        <Button variant="outline" onPress={() => toast.show({ title: 'Careful', tone: 'warning' })}>Warning</Button>
        <Button variant="danger" onPress={() => toast.show({ title: 'Failed', description: LONG, tone: 'danger' })}>Danger, long text</Button>
      </Section>
      <Section title="Behaviour">
        <Button variant="outline" onPress={() => toast.show({ title: 'Stays until dismissed', duration: null })}>Persistent</Button>
        <Button variant="outline" onPress={() => toast.show({ title: 'Deleted', duration: null, action: { label: 'Undo', onPress: () => toast.show({ title: 'Restored' }) } })}>With action</Button>
      </Section>
      <Section title="Position">
        <Button variant="outline" onPress={() => toast.show({ title: 'Top toast', position: 'top', duration: null })}>Top</Button>
        <Button variant="outline" onPress={() => toast.show({ title: 'Bottom toast', position: 'bottom', duration: null })}>Bottom</Button>
        <Button variant="outline" onPress={() => toast.show({ title: 'Top end toast', position: 'top', align: 'end', duration: null })}>Top end</Button>
      </Section>
      <Section title="Auto dismiss">
        <Button variant="outline" onPress={() => toast.show({ title: 'Four seconds', duration: 4000 })}>4 seconds</Button>
      </Section>
      <Section title="Animation">
        <Button variant="outline" onPress={() => toast.show({ title: 'Slide toast', animation: 'slide', position: 'top', animationDuration: 800, duration: 2000 })}>Slide, top, slow</Button>
        <Button variant="outline" onPress={() => toast.show({ title: 'Fade toast', animation: 'fade', animationDuration: 800, duration: 2000 })}>Fade, slow</Button>
        <Button variant="outline" onPress={() => toast.show({ title: 'Scale toast', animation: 'scale', animationDuration: 800, duration: 2000 })}>Scale, slow</Button>
        <Button variant="outline" onPress={() => toast.show({ title: 'Instant toast', animation: 'none', duration: 2000 })}>None</Button>
      </Section>
    </>
  );
}
