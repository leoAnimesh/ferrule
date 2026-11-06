import { useState } from 'react';
import { TabBar } from '../components/ui/tabbar';

const ITEMS = [
  { value: 'home', label: 'Home', icon: 'home' as const },
  { value: 'orders', label: 'Orders', icon: 'shopping-bag' as const },
  { value: 'account', label: 'Account', icon: 'user' as const },
];

export default function Example() {
  const [tab, setTab] = useState('home');
  return <TabBar items={ITEMS} value={tab} onValueChange={setTab} />;
}
