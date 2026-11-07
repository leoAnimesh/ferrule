# Components

Add with `npx ferrule add <name>`. Source lands in `components/ui/<name>.tsx`, and it is yours to edit. Most components accept `style` and read overrides from `theme.components.<name>`. Every view forwards its ref, to the Ferrule view rather than a `native` one. `modal`, `sheet` and `toast` do not: the first two render in their own window, and toasts are shown through `useToast()`.

Interactive components take the React Native `Pressable` props too (`onPressIn`, `testID`, `aria-*`, and so on). The site's page for each component lists every prop, generated from the source.

## text

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `hero` `display` `h1` `h2` `h3` `body` `bodySmall` `label` `caption` | `body` |
| `tone` | `default` `muted` `primary` `danger` `success` `warning` `onPrimary` `onPrimarySoft` `onDanger` `onSuccess` `onWarning` | `default` |

Headings get a heading role and level. Slots: one per variant.

## stack

`Stack`: `direction` (`vertical`, `horizontal`), `gap`, `padding` (space tokens), `align`, `justify`, `wrap`. `Spacer` fills free space. `Divider`: `orientation`, always 1dp.

`Container` centers content under a `maxWidth`, by default the theme's `lg` breakpoint. `Grid` lays out equal-width `columns`, and a short last row keeps its cells the same width. Pair it with `useResponsive`: `<Grid columns={useResponsive({ base: 1, md: 2, lg: 3 })} gap={4}>`.

## spinner

`size` (`sm`, `md`, `lg`), `color`, `label` (accessible name, default `Loading`; `null` hides it when a parent announces busy), `native`. Stops spinning under reduced motion. Slot: `container`.

## button

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `solid` `soft` `outline` `ghost` `danger` | `solid` |
| `size` | `sm` `md` `lg` (36, 44, 52dp) | `md` |
| `loading` | `boolean`: spinner, blocks presses, `aria-busy` | `false` |
| `disabled` | `boolean` | `false` |
| `fullWidth` | `boolean` | `false` |
| `start`, `end` | `ReactNode` | |
| `labelStyle` | text style | |

`sm` keeps a 44dp touch target through `hitSlop`. Non-string children need `aria-label`. Slots: `container`, `label`.

`IconButton` is a square `Button` holding only an icon, and requires `aria-label`. It takes `variant`, `size`, `disabled` and `loading`. Slot: `iconButton.container`.

With `native` and `nativeIcon={{ ios: 'chevron.backward' }}`, it draws a Liquid Glass button on iOS 26+ and the system button on iOS 17 to 25, using `aria-label`, `variant`, `size`, `disabled` and `onPress`. `ghost` gets glass too. Android, web and builds without `ferrule-native` draw `children`, so keep both. Use `chevron.backward`, which mirrors in right-to-left. The icon is a theme color, not the tint.

## input

| Prop | Type | Notes |
| --- | --- | --- |
| `value` / `defaultValue` / `onChangeText` | | Controlled or uncontrolled |
| `label` | `string` | Also its accessible name. Otherwise pass `aria-label` |
| `helperText` | `string` | Replaced by `error` |
| `error` | `string` | Error state, announced |
| `required`, `disabled` | `boolean` | |
| `size` | `sm` `md` `lg` | |
| `start`, `end` | `ReactNode` | Adornments |
| `style`, `fieldStyle`, `inputStyle` | | Wrapper, bordered field, text |
| `native` | `boolean` | The platform text field. See Native variants |

Takes all `TextInput` props. The ref goes to the `TextInput`. Slots: `field`, `text`.

## card

`Card`: `variant` (`outline`, `elevated`, `filled`), `onPress` (makes the card a button; give it `aria-label`), `disabled`, `native` (glass on iOS). Parts: `CardHeader` (`title`, `description`, `end`), `CardContent`, `CardFooter`. Slot: `container`.

## switch

`checked` / `defaultChecked` / `onCheckedChange`, `label`, `description`, `disabled`, `native`. Without `label`, pass `aria-label`. Space toggles on web. Slots: `track`, `thumb`.

## checkbox

As switch, also with `native`, plus `indeterminate` (announced as mixed; pressing reports `true`) and `error`. Slot: `box`.

## badge

`tone` (`neutral`, `primary`, `success`, `warning`, `danger`), `variant` (`soft`, `solid`, `outline`). Renders nothing when empty. Truncates to one line. Slot: `container`.

## avatar

`src` (URL or `require()`), `name`, `size` (32, 44, 64dp). Falls back from image, to initials, to a placeholder when the image is missing or fails. `name` is the accessible name. Slot: `container`. Initials do not scale with OS font size, because they sit in a fixed circle.

## image

| Prop | Type | Notes |
| --- | --- | --- |
| `source` | URL, `require()` or `null` | Missing shows the fallback |
| `alt` | `string`, required | `""` marks it decorative, hidden from screen readers |
| `aspectRatio` | `number` | Or set width and height in `style` |
| `radius` | radius token | `md` |
| `fallback` | `ReactNode` | Default: muted box with the alt text |
| `resizeMode` | | `cover` |

Shows a muted placeholder while loading, then fades in. The ref goes to the underlying `Image`. Slot: `container`.

## list

`List`: all `FlatList` props, plus `loading`, `emptyText`, `empty`, `dividers`. Ref goes to the `FlatList`.

`ListItem`: `title`, `description`, `start`, `end`, `onPress` (makes it a button), `disabled`, `selected`. Slot: `container`.

On web, `List` wraps each row in a list item, and a pressable row is named by its own text. A selected row is `aria-current`. With a header, a footer, or nothing to show, it has no list role, because that role only allows list items. A scrolling `List` takes keyboard focus.

## modal

| Prop | Type | Notes |
| --- | --- | --- |
| `open` / `defaultOpen` / `onOpenChange` | | Controlled or uncontrolled |
| `title`, `description` | `string` | `title` names the dialog |
| `footer` | `ReactNode` | Stays visible while long content scrolls |
| `dismissible` | `boolean`, default `true` | When false, backdrop, back and Escape do nothing |
| `closeLabel` | `string` | Close button name, for translation |
| `native`, `nativeActions` | | With both, the platform alert. See Native variants |

Closes with the X, backdrop, Android back, Escape and the VoiceOver escape gesture. Focus is trapped while open and restored on close. Slot: `container`.

To stack a sheet on a modal, render it inside the modal's children. iOS cannot present two sibling modal windows.

Also exports `CloseButton`, the X it draws: `label`, `color`, `onPress`.

## sheet

As modal, anchored to the bottom, plus drag down on the handle to dismiss. Max width 640 on large screens. Slot: `container`.

## toast

Wrap the app once: `<FerruleProvider><ToastProvider>...</ToastProvider></FerruleProvider>`. Then:

```tsx
const toast = useToast();
const id = toast.show({ title: 'Saved', description, tone: 'success', duration: 5000, action: { label: 'Undo', onPress } });
toast.dismiss(id);
```

`tone`: `neutral`, `success`, `warning`, `danger`. At most three show at once, oldest dropped first. Toasts render above modals and sheets, also under a nested `FerruleProvider`, and are announced (`danger` assertively): on web through live regions that are always mounted. Also takes `style` and `testID`. Slot: `container`.

`position`, `align`, `duration`, `animation` and `animationDuration` work on both `ToastProvider`, as defaults, and `show`, where they win:

```tsx
<ToastProvider position="top" duration={4000} animation="fade">...</ToastProvider>
toast.show({ title: 'Saved', position: 'bottom', animation: { enter: 'scale', exit: 'slide' }, animationDuration: 300 });
```

| Option | Values | Default |
| --- | --- | --- |
| `position` | `top`, `bottom`. Clears the safe area. It does not move for the keyboard, so a bottom toast can sit behind it | `bottom` |
| `align` | `start`, `center`, `end`. Follows the reading direction. A toast is at most 480 wide, so windows up to about 512 are filled within the margins and it has no visible effect | `center` |
| `duration` | Milliseconds, or `null` to stay until dismissed. The timer pauses on hover and focus on web. Touch screens have no pause | `5000`, also with an `action`. Give one with an action longer, or `null`, so it can be used |
| `animation` | `slide`, `fade`, `scale`, `none`, or `{ enter, exit }` with one of those for each. `slide` is a short slide with a fade, from the toast's own edge. Reduced motion skips the movement | `{ enter: 'slide', exit: 'fade' }` |
| `animationDuration` | Milliseconds, for both directions | The theme's `motion.normal` to open, `motion.fast` to close |

## icon

`<Icon name="map-pin" size={20} color={colors.primary} />`. Draws [Feather](https://feathericons.com) icons, all 287, and a wrong name fails typecheck. It needs no icon font, SVG library or native setup: the stroke is drawn in JS from Feather's path data at the exact pixel size and shown as a tinted image, once per name and size. It grows with the OS text size, up to 1.5x. `source={require('./logo.png')}` takes your own single-color artwork instead. Arrows, chevrons, corners, `log-in` and `log-out` mirror in right-to-left; pass `flip` to change that. `label` names it for screen readers; without one it is hidden. Takes `testID`. Slot: `container`.

## chip

A compact filter or action, on a full-size touch target. With `selected` it is a checkbox, without it a button. Props: `label`, `selected`, `start`, `end`, `native`. Slots: `container`, `label`.

## segmented

One choice out of a few, as a radio group: `options`, `value` or `defaultValue`, `onValueChange`, `label`, `disabled`, `native`. One pill slides to the chosen segment, over the theme's normal duration, and jumps under reduced motion. Segments have a press state but no hover state. On web it is one tab stop: arrows move and select, Home and End jump. Slots: `container`, and `selected`, which styles the pill.

## tabbar

To let content reach the bottom edge, wrap the screen in `<TabBarScreen bar={<TabBar ... />}>` and add `useTabBarHeight()` to the bottom padding of scrolling content. The bar keeps its own look: the Ferrule bar uses `surface`, and with `native` the platform decides.

Bottom navigation: `items` (`value`, `label`, `icon`, `nativeIcon`), `value` or `defaultValue`, `onValueChange`, `label`, `native`. Adds the bottom safe-area inset itself. On web it is one tab stop: left and right arrows move and select, Home and End jump. With `native`, it is the platform bar with no Ferrule styling: a `UITabBar` on iOS, which paints no glass material of its own when hosted, and Material 3 on Android. Slot: `container`.

## progress

`Progress` is a bar and `ProgressRing` a circle with `children` in its center. Both take `value` (0 to 1), `label`, `thickness`, `color`, `trackColor`, and `ProgressRing` a `size`. By default a change eases over the theme's normal duration. For a value fed by a clock, set `duration` to the tick length, and it runs linearly. The ring draws from clipped half rings, so it needs no SVG, and it mirrors in right-to-left. Slot: `container`.

## carousel

`<Carousel itemWidth={300}>` is a row of same-width items that scrolls sideways and settles on item edges. Props: `itemWidth`, `gap`, `inset`. It has no autoplay, and needs no dots, because the next item peeks in. It takes keyboard focus on web, so arrows scroll it. Slot: `container`.

## stepper

A number changed in steps: `label`, `value`, `onValueChange`, `min`, `max`, `step`, `unit`. On iOS and Android, screen readers treat it as one adjustable control. On web it is a group of the two buttons and a spin button: up and down arrows step, Home and End jump. Slot: `container`.

## swipe-row

`<SwipeRow startAction={...} endAction={...}>` reveals an action on a sideways drag and runs it past `threshold` (96). Each action has `label`, `tone`, `icon`, `onAction`. Screen readers get the same actions. A keyboard cannot swipe, so also offer them in a visible control, and make destructive ones undoable. Slot: `container`.

## Native variants

`Button`, `IconButton`, `Switch`, `Checkbox`, `Input`, `Spinner`, `Card`, `Chip`, `Segmented`, `TabBar`, `Modal` and `Sheet` take `native`, which renders the real platform control when [`ferrule-native`](../../ferrule-native/README.md) is imported. `Modal` and `Sheet` also need `nativeActions`. Nothing changes without it, and each one falls back to the Ferrule component where the native one cannot render.

## FlatList

`FlatList` from `ferrule` is React Native's `FlatList`.
