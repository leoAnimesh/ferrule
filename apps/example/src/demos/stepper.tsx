import { useState } from 'react';
import { Stepper } from '../../components/ui/stepper';
import { Section } from '../ui';

export function Demo() {
  const [minutes, setMinutes] = useState(25);
  const [count, setCount] = useState(1);
  return (
    <>
      <Section title="Steps of 5, with a unit"><Stepper testID="stepper" label="Focus length" value={minutes} onValueChange={setMinutes} min={5} max={60} step={5} unit="min" /></Section>
      <Section title="Stops at its limits: try below 0 and above 3"><Stepper label="Crates" value={count} onValueChange={setCount} min={0} max={3} /></Section>
      <Section title="A long label"><Stepper label="A deliberately long label that has to share a row with its buttons" value={count} onValueChange={setCount} /></Section>
    </>
  );
}
