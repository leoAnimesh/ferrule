import pages from './generated/pages.json';
import { COMPONENTS } from './components';

export interface NavItem { id: string; title: string; blurb: string; }
export interface NavGroup { title: string; items: NavItem[]; }

const page = (id: keyof typeof pages): NavItem => ({ id, title: pages[id].title, blurb: pages[id].blurb });

export const NAV: NavGroup[] = [
  { title: 'Start', items: [page('getting-started'), page('cli'), page('platforms')] },
  { title: 'Theming', items: [page('theming'), page('palettes'), page('fonts'), page('icons')] },
  { title: 'Components', items: COMPONENTS.map(({ slug, title, blurb }) => ({ id: slug, title, blurb })) },
  { title: 'Native', items: [page('native'), page('coverage')] },
  { title: 'Project', items: [page('contributing')] },
];
export const FLAT = NAV.flatMap((group) => group.items);
