import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Text } from '../components/ui/text';

export default function Example() {
  return (
    <Card variant="elevated" style={{ maxWidth: 360 }}>
      <CardHeader title="Weekly report" description="Sent every Monday" />
      <CardContent>
        <Text>Each variant is a surface from the same palette, so it reprints with everything else.</Text>
      </CardContent>
      <CardFooter>
        <Button variant="soft">Open</Button>
      </CardFooter>
    </Card>
  );
}
