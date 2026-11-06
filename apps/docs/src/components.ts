import type { ComponentType } from 'react';
import avatar from '../examples/avatar';
import badge from '../examples/badge';
import button from '../examples/button';
import buttonSizes from '../examples/button-sizes';
import card from '../examples/card';
import carousel from '../examples/carousel';
import checkbox from '../examples/checkbox';
import chip from '../examples/chip';
import icon from '../examples/icon';
import image from '../examples/image';
import input from '../examples/input';
import list from '../examples/list';
import modal from '../examples/modal';
import progress from '../examples/progress';
import segmented from '../examples/segmented';
import sheet from '../examples/sheet';
import spinner from '../examples/spinner';
import stack from '../examples/stack';
import stepper from '../examples/stepper';
import swipeRow from '../examples/swipe-row';
import switchExample from '../examples/switch';
import tabbar from '../examples/tabbar';
import text from '../examples/text';
import toast from '../examples/toast';

export interface ComponentDoc {
  slug: string;
  title: string;
  blurb: string;
  examples: { sample: string; title?: string; Component: ComponentType }[];
  /** What the source's own doc comments leave out. Prop tables come from the source; these fill in the description column. */
  notes?: Record<string, string>;
  a11y: string[];
  /** `theme.components.<slug>` slots. */
  slots?: string[];
  native?: string;
  /** Sits inline in the page, for the one thing a reader must not miss. */
  callout?: string;
}

export const COMPONENTS: ComponentDoc[] = [
  {
    slug: 'text', title: 'Text', blurb: 'Typography with variants and tones.',
    examples: [{ sample: 'text', Component: text }],
    notes: { variant: 'hero, display, h1, h2, h3, body, bodySmall, label or caption.', tone: 'A semantic color, so it follows the palette.' },
    a11y: ['Heading variants get a heading role and a level.', 'Text scales with the OS font size, up to `maxFontScale`, which is 2 by default.'],
    slots: ['one per variant'],
  },
  {
    slug: 'stack', title: 'Stack', blurb: 'Stack, Spacer, Divider, Container and Grid: the layout primitives.',
    examples: [{ sample: 'stack', Component: stack }],
    notes: { direction: 'vertical or horizontal.', gap: 'A space token.', padding: 'A space token.', orientation: 'Divider is always 1dp thick.' },
    a11y: ['These add no roles of their own. Give a group a role where it has a meaning.', 'Rows follow the reading direction, so they mirror in right-to-left.'],
  },
  {
    slug: 'spinner', title: 'Spinner', blurb: 'A drawn loading ring, identical on every platform.',
    examples: [{ sample: 'spinner', Component: spinner }],
    notes: { label: 'Accessible name, default `Loading`. `null` hides it when a parent already announces busy.', size: 'sm, md or lg.' },
    a11y: ['Exposed as a progress bar named by `label`.', 'Stops spinning under reduced motion.'],
    native: 'With `native`, the system progress indicator on iOS and Android.',
  },
  {
    slug: 'button', title: 'Button', blurb: 'Five variants, three sizes, a loading state, and IconButton.',
    examples: [{ sample: 'button', title: 'Variants and states', Component: button }, { sample: 'button-sizes', title: 'Sizes and IconButton', Component: buttonSizes }],
    notes: { variant: 'solid, soft, outline, ghost or danger.', size: 'sm, md or lg: 36, 44 and 52dp.', loading: 'Shows a spinner, blocks presses, sets `aria-busy`. The label stays, so the width does not jump.', start: 'Content before the label.', end: 'Content after the label.', labelStyle: 'Text style for the label.' },
    a11y: ['Non-string children need `aria-label`. `IconButton` requires it.', '`sm` keeps a 44dp touch target through `hitSlop`.', 'The focus ring shows for keyboard focus only.'],
    slots: ['container', 'label', 'iconButton.container'],
    native: '`Button` with `native` is the system button. `IconButton` with `native` and `nativeIcon={{ ios: \'chevron.backward\' }}` is a Liquid Glass button on iOS 26+ and draws its `children` everywhere else, so keep both.',
  },
  {
    slug: 'input', title: 'Input', blurb: 'A labelled text field with helper and error messages.',
    examples: [{ sample: 'input', Component: input }],
    notes: { label: 'Also its accessible name. Without it, pass `aria-label`.', helperText: 'Replaced by `error`.', error: 'Sets the error state, and is announced.', size: 'sm, md or lg.', start: 'Adornment before the text.', end: 'Adornment after the text.', fieldStyle: 'Style for the bordered field.', inputStyle: 'Style for the text.' },
    a11y: ['`error` is announced to screen readers.', 'A focused or invalid field grows a band along its lower edge, so the state is not carried by color alone.', 'The ref goes to the underlying `TextInput`.'],
    slots: ['field', 'text'],
    native: 'With `native`, a SwiftUI `TextField` or Material `OutlinedTextField`. `start` and `end` fall back to the Ferrule input.',
  },
  {
    slug: 'card', title: 'Card', blurb: 'A surface with a header, content and footer. Optionally pressable.',
    examples: [{ sample: 'card', Component: card }],
    notes: { variant: 'outline, elevated or filled.', onPress: 'Makes the whole card a button. Give it `aria-label`.' },
    a11y: ['A pressable card has the button role, and needs `aria-label` so its whole contents are not read as the name.'],
    slots: ['container'],
    native: 'With `native`, Liquid Glass on iOS 26+, holding React children. Android gets a themed surface, because Material has no glass.',
  },
  {
    slug: 'switch', title: 'Switch', blurb: 'A drawn on and off control.',
    examples: [{ sample: 'switch', Component: switchExample }],
    notes: { label: 'Without one, pass `aria-label`.' },
    a11y: ['Has the switch role and reports its checked state.', 'Space toggles it on web.', 'The whole labelled row is the touch target.'],
    slots: ['track', 'thumb'],
    native: 'With `native`, a SwiftUI `Toggle` or Material `Switch`.',
  },
  {
    slug: 'checkbox', title: 'Checkbox', blurb: 'A checkbox with indeterminate and error states.',
    examples: [{ sample: 'checkbox', Component: checkbox }],
    notes: { indeterminate: 'Announced as mixed. Pressing it reports `true`.' },
    a11y: ['`indeterminate` is announced as mixed.', 'Space toggles it on web.'],
    slots: ['box'],
    native: 'With `native`, the Material checkbox on Android. iOS has no native checkbox, so Ferrule\'s stays.',
  },
  {
    slug: 'badge', title: 'Badge', blurb: 'A short status label.',
    examples: [{ sample: 'badge', Component: badge }],
    notes: { tone: 'neutral, primary, success, warning or danger.', variant: 'soft, solid or outline.' },
    a11y: ['State colors always come with a label, so meaning is never carried by color alone.', 'Renders nothing when empty, and truncates to one line.'],
    slots: ['container'],
  },
  {
    slug: 'avatar', title: 'Avatar', blurb: 'A user image with initials and placeholder fallbacks.',
    examples: [{ sample: 'avatar', Component: avatar }],
    notes: { name: 'The accessible name, and the source of the initials.', size: '32, 44 or 64dp, as sm, md and lg.' },
    a11y: ['Exposed as an image named by `name`.', 'Initials do not scale with OS font size, because they sit in a fixed circle.'],
    slots: ['container'],
  },
  {
    slug: 'image', title: 'Image', blurb: 'An image with a loading state, alt text and a failure fallback.',
    examples: [{ sample: 'image', Component: image }],
    notes: { alt: 'Required. `""` marks it decorative and hides it from screen readers.', aspectRatio: 'Or set width and height in `style`.', radius: 'A radius token.', fallback: 'Replaces the default fallback.' },
    a11y: ['`alt` is required by the types, so a missing description is a decision rather than an oversight.', 'The fade in follows the system reduced motion setting.', 'The placeholder holds the image\'s space, so nothing shifts as it loads.'],
    slots: ['container'],
  },
  {
    slug: 'list', title: 'List', blurb: 'A virtualized list with empty and loading states, plus ListItem.',
    examples: [{ sample: 'list', Component: list }],
    notes: { onPress: 'Makes the row a button.' },
    a11y: ['`List` has the list role and rows the list item role.', 'A pressable `ListItem` is a button named from its title and description.'],
    slots: ['container'],
  },
  {
    slug: 'modal', title: 'Modal', blurb: 'A centered dialog with scrolling content and a footer.',
    examples: [{ sample: 'modal', Component: modal }],
    notes: { title: 'Names the dialog.', footer: 'Stays visible while long content scrolls.', dismissible: 'When false, backdrop, back and Escape do nothing.', closeLabel: 'The close button\'s name, for translation.' },
    a11y: ['Focus is trapped while open, and restored on close.', 'Closes with the close button, the backdrop, Android back, Escape and the VoiceOver escape gesture.'],
    slots: ['container'],
    native: 'With `native` and `nativeActions`, a `UIAlertController` or Material `AlertDialog`. They hold actions only: the children show only where the system alert cannot render.',
    callout: 'iOS cannot present two sibling modals at once. To stack a sheet on a modal, render it inside the modal\'s children.',
  },
  {
    slug: 'sheet', title: 'Sheet', blurb: 'A bottom sheet with drag to dismiss.',
    examples: [{ sample: 'sheet', Component: sheet }],
    a11y: ['Behaves as Modal does: focus trapped and restored, and the same ways to close.', 'Dragging the handle is never the only way to close it.'],
    slots: ['container'],
    native: 'With `native` and `nativeActions`, a SwiftUI sheet with detents or a Material `ModalBottomSheet`. Actions only, no React children.',
  },
  {
    slug: 'toast', title: 'Toast', blurb: 'Transient notifications that stack above overlays.',
    examples: [{ sample: 'toast', Component: toast }],
    notes: { tone: 'neutral, success, warning or danger.', duration: 'Milliseconds. `null` keeps it until dismissed.' },
    a11y: ['Announced to screen readers, and `danger` assertively.', 'Pauses on hover and focus on web.', 'At most three show at once, oldest dropped first.'],
    slots: ['container'],
    callout: 'Wrap the app once: `<FerruleProvider><ToastProvider>...</ToastProvider></FerruleProvider>`.',
  },
  {
    slug: 'icon', title: 'Icon', blurb: 'A tinted Feather icon, or your own single-color artwork.',
    examples: [{ sample: 'icon', Component: icon }],
    notes: { label: 'Without one, the icon is hidden from screen readers.', name: 'A Feather name. A wrong name fails typecheck. See the icon browser below.', flip: 'Mirrors it in right-to-left. On by default for arrows, chevrons, corners, log-in and log-out.' },
    a11y: ['Hidden from screen readers unless given a `label`.', 'Grows with the OS text size, up to 1.5x.'],
  },
  {
    slug: 'chip', title: 'Chip', blurb: 'A compact filter or action, on a full-size touch target.',
    examples: [{ sample: 'chip', Component: chip }],
    notes: { selected: 'With it, the chip is a checkbox. Without it, a button.' },
    a11y: ['With `selected` it has the checkbox role and reports its state. Without it, the button role.'],
    slots: ['container', 'label'],
    native: 'With `native`, a Material `FilterChip` on Android and a small capsule glass button on iOS, which has no chip of its own.',
  },
  {
    slug: 'segmented', title: 'Segmented', blurb: 'One choice out of a few.',
    examples: [{ sample: 'segmented', Component: segmented }],
    a11y: ['A radio group named by `label`, with each option a radio that reports its state.'],
    slots: ['container', 'selected'],
    native: 'With `native`, a SwiftUI segmented `Picker` or Material segmented button row.',
  },
  {
    slug: 'tabbar', title: 'TabBar', blurb: 'Bottom navigation, with an optional native variant.',
    examples: [{ sample: 'tabbar', Component: tabbar }],
    a11y: ['A tab list named by `label`, with each item a tab that reports its selection.', 'Adds the bottom safe-area inset itself.'],
    slots: ['container'],
    native: 'With `native`, the platform\'s bar with no style from Ferrule: a hosted `UITabBar` on iOS and a Material `NavigationBar` on Android. A hosted `UITabBar` does not paint Liquid Glass: that needs a real `UITabBarController`, which this is not.',
    callout: 'To let content reach the bottom edge, wrap the screen in `<TabBarScreen bar={<TabBar ... />}>` and add `useTabBarHeight()` to the bottom padding of scrolling content.',
  },
  {
    slug: 'progress', title: 'Progress', blurb: 'Linear and circular progress, driven by Reanimated.',
    examples: [{ sample: 'progress', Component: progress }],
    notes: { label: 'The accessible name.', duration: 'For a value fed by a clock, set this to the tick length, and it runs linearly.' },
    a11y: ['Has the progress bar role, and reports its value.', 'The ring mirrors in right-to-left.', 'Changes jump to the end value under reduced motion.'],
  },
  {
    slug: 'carousel', title: 'Carousel', blurb: 'A sideways row of same-width items that settles on item edges.',
    examples: [{ sample: 'carousel', Component: carousel }],
    a11y: ['No autoplay, so nothing moves on its own.', 'It needs no dots, because the next item peeks in.'],
  },
  {
    slug: 'stepper', title: 'Stepper', blurb: 'A number changed in steps.',
    examples: [{ sample: 'stepper', Component: stepper }],
    a11y: ['Screen readers treat it as one adjustable control, with increment and decrement actions.', 'The two buttons are named from `label`.'],
  },
  {
    slug: 'swipe-row', title: 'SwipeRow', blurb: 'A row with swipe actions, also offered to screen readers.',
    examples: [{ sample: 'swipe-row', Component: swipeRow }],
    notes: { threshold: 'How far the row must be dragged for the action to run.' },
    a11y: ['Screen readers get the same actions as accessibility actions.', 'A keyboard cannot swipe, so also offer them in a visible control, as this example does.', 'Make destructive actions undoable.'],
  },
];
COMPONENTS.sort((a, b) => a.title.localeCompare(b.title));
