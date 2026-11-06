import { useState } from 'react';
import { Segmented } from '../components/ui/segmented';

const OPTIONS = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }];

export default function Example() {
  const [range, setRange] = useState('week');
  return <Segmented label="Range" options={OPTIONS} value={range} onValueChange={setRange} style={{ maxWidth: 360 }} />;
}
