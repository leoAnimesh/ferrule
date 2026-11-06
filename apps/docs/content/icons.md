Ferrule's icons are [Feather](https://feathericons.com) 4.29.2, MIT licensed, by Cole Bemis.

```tsx
import { Icon } from './components/ui/icon';

<Icon name="map-pin" size={20} color={colors.primary} label="Location" />;
```

`name` is typed, so a wrong name fails typecheck. Pick one below: selecting an icon copies its usage.

## How they render

React Native core cannot show an SVG. Instead of adding `react-native-svg` or an icon font, each with native setup, `Icon` draws the stroke in JS from Feather's path data at the exact pixel size, and shows it as an image tinted from your theme. So it needs no install and no rebuild, and stays sharp as it grows with the OS text size. Each name and size is drawn once and cached.

An app using `Icon` carries all 287 paths and the drawing code, about 44 KB of JS. An app without it carries none.

Native variants use their platform's icons instead: SF Symbols and Material icons. See [which controls](/docs/coverage#icons).
