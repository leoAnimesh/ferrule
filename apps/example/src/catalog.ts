import type { ComponentType } from 'react';
import * as avatar from './demos/avatar';
import * as badge from './demos/badge';
import * as button from './demos/button';
import * as card from './demos/card';
import * as carousel from './demos/carousel';
import * as checkbox from './demos/checkbox';
import * as chip from './demos/chip';
import * as composite from './demos/composite';
import * as flatlist from './demos/flatlist';
import * as fonts from './demos/fonts';
import * as icon from './demos/icon';
import * as image from './demos/image';
import * as input from './demos/input';
import * as list from './demos/list';
import * as metrics from './demos/metrics';
import * as modal from './demos/modal';
import * as nativeActionSheet from './demos/native-action-sheet';
import * as nativeDate from './demos/native-date';
import * as nativeFab from './demos/native-fab';
import * as nativeList from './demos/native-list';
import * as nativeMenu from './demos/native-menu';
import * as nativePicker from './demos/native-picker';
import * as nativeSearch from './demos/native-search';
import * as nativeSlider from './demos/native-slider';
import * as nativeTopBar from './demos/native-top-bar';
import * as progress from './demos/progress';
import * as segmented from './demos/segmented';
import * as sheet from './demos/sheet';
import * as spinner from './demos/spinner';
import * as stack from './demos/stack';
import * as stepper from './demos/stepper';
import * as swipeRow from './demos/swipe-row';
import * as switchDemo from './demos/switch';
import * as tabbar from './demos/tabbar';
import * as text from './demos/text';
import * as toast from './demos/toast';

/** A demo file exports `Demo`, plus `NativeDemo` if it has a native variant. */
interface DemoModule { Demo: ComponentType; NativeDemo?: ComponentType; }

export interface CatalogEntry extends DemoModule {
  /** The registry name for a component, so `?component=<id>` and `ferrule add <id>` use one name. */
  id: string;
  title: string;
  blurb: string;
  group: string;
  /** Has its own scroller, so it must not sit inside the page's. */
  bounded?: boolean;
}

const entry = (id: string, title: string, group: string, blurb: string, module: DemoModule, extra: Partial<CatalogEntry> = {}): CatalogEntry => ({ id, title, group, blurb, ...module, ...extra });

export const GROUPS = ['Foundations', 'Actions', 'Inputs', 'Content', 'Feedback', 'Overlays', 'Navigation', 'Native only', 'Whole screens'];

// Add a component: one line here and one file in src/demos. `pnpm --filter ferrule-example test` fails if a registry component has neither.
export const CATALOG: CatalogEntry[] = [
  entry('text', 'Text', 'Foundations', 'Variants, tones, truncation', text),
  entry('stack', 'Stack', 'Foundations', 'Stack, Spacer, Divider, Grid', stack),
  entry('icon', 'Icon', 'Foundations', 'Tint, size, flip, label', icon),
  entry('button', 'Button', 'Actions', 'Variants, sizes, loading, IconButton', button),
  entry('chip', 'Chip', 'Actions', 'Selected, action, disabled', chip),
  entry('segmented', 'Segmented', 'Actions', 'One choice out of a few', segmented),
  entry('input', 'Input', 'Inputs', 'Label, helper, error, adornments', input),
  entry('switch', 'Switch', 'Inputs', 'On and off, disabled, long labels', switchDemo),
  entry('checkbox', 'Checkbox', 'Inputs', 'Indeterminate, error, disabled', checkbox),
  entry('stepper', 'Stepper', 'Inputs', 'Limits, steps, units', stepper),
  entry('card', 'Card', 'Content', 'Variants, parts, pressable', card),
  entry('list', 'List', 'Content', 'Rows, empty, loading', list),
  entry('swipe-row', 'SwipeRow', 'Content', 'Swipe actions, with a visible way too', swipeRow),
  entry('carousel', 'Carousel', 'Content', 'Sideways, settles on item edges', carousel),
  entry('avatar', 'Avatar', 'Content', 'Image, initials, placeholder', avatar),
  entry('badge', 'Badge', 'Content', 'Tones and variants, long, empty', badge),
  entry('image', 'Image', 'Content', 'Remote, local, failure, fallback', image),
  entry('spinner', 'Spinner', 'Feedback', 'Sizes, colors, labels', spinner),
  entry('progress', 'Progress', 'Feedback', 'Bar and ring, limits', progress),
  entry('toast', 'Toast', 'Feedback', 'Tones, actions, persistence', toast),
  entry('modal', 'Modal', 'Overlays', 'Long, non-dismissible, stacked', modal),
  entry('sheet', 'Sheet', 'Overlays', 'Drag to close, keyboard, long', sheet),
  entry('tabbar', 'TabBar', 'Navigation', 'Bottom navigation', tabbar),
  entry('native-slider', 'Slider', 'Native only', 'NativeSlider', nativeSlider),
  entry('native-picker', 'Picker', 'Native only', 'NativePicker', nativePicker),
  entry('native-menu', 'Menu', 'Native only', 'NativeMenu', nativeMenu),
  entry('native-date', 'Date and time', 'Native only', 'NativeDatePicker', nativeDate),
  entry('native-action-sheet', 'Action sheet and alert', 'Native only', 'NativeActionSheet, NativeAlert', nativeActionSheet),
  entry('native-top-bar', 'Top bar', 'Native only', 'NativeTopBar', nativeTopBar),
  entry('native-search', 'Search bar', 'Native only', 'NativeSearchBar', nativeSearch),
  entry('native-fab', 'FAB', 'Native only', 'NativeFab', nativeFab),
  entry('native-list', 'System list', 'Native only', 'NativeList', nativeList),
  entry('composite', 'Composite', 'Whole screens', 'The main components together, for judging a palette', composite),
  entry('fonts', 'Fonts', 'Whole screens', 'Theme, variant, nested and one-off fonts', fonts),
  entry('metrics', 'Metrics', 'Whole screens', 'Measured sizes, for compare-metrics', metrics),
  entry('flatlist', 'FlatList', 'Whole screens', 'React Native FlatList, with its ref methods', flatlist, { bounded: true }),
];

export const findEntry = (id: string | null | undefined) => CATALOG.find((item) => item.id === id);
