import { useState } from 'react';
import { Stepper } from '../components/ui/stepper';

export default function Example() {
  const [minutes, setMinutes] = useState(25);
  return <Stepper label="Focus length" value={minutes} onValueChange={setMinutes} min={5} max={60} step={5} unit="min" />;
}
