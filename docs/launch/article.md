---
title: Ferrule, a React Native UI library you copy into your app
published: false
tags: reactnative, expo, ui, opensource
canonical_url: https://leoanimesh.github.io/ferrule/
---

<!-- dev.to reads the front matter above. On Hashnode, paste the body and set the canonical URL in the post settings. Keep `published: false` until you have read it through. -->

Most React Native UI libraries are a dependency you style around. Ferrule works the other way: a CLI copies each component's source into your project, the way shadcn/ui does on the web. After that, it is your code.

[why]

## Install

Ferrule needs React Native 0.86 or later on the New Architecture, and Reanimated 4.7.

```sh
# Expo
npx expo install react-native-reanimated react-native-worklets
npm install @leoanimesh/ferrule
npx ferrule init --fix
npx ferrule add button input
```

`init --fix` writes `ferrule.json` and a theme file, and adds the worklets Babel plugin. `add` copies `components/ui/button.tsx` and `input.tsx`, plus anything they depend on. The registry ships inside the package, so nothing else is downloaded.

Wrap the app once:

```tsx
import { FerruleProvider } from '@leoanimesh/ferrule';
import { theme } from './ferrule.theme';

export default function App() {
  return <FerruleProvider theme={theme}>{/* your screens */}</FerruleProvider>;
}
```

## What you get

- **23 components**, with one API on iOS, Android and web: Button, Input, Switch, Checkbox, Segmented, Chip, Modal, Sheet, Toast, TabBar, List, Carousel, SwipeRow, Stepper and more.
- **Theming by tokens.** Components read semantic colors such as `primary`, `surface` and `danger`, never raw values. Seven palettes are built in, each derived from one ink and AA in light and dark. `createTheme({ palette: 'cobalt' })` changes everything at once, and you can derive a palette from your own brand color.
- **A CI check.** `npx ferrule check` exits 1 when code imports primitives such as `View` straight from `react-native`, or a copied component holds a raw color, so the system stays consistent as the app grows.
- **Icons.** All 287 Feather icons, with no icon font and no SVG dependency.
- **Native views when you want them.** The optional `@leoanimesh/ferrule-native` package adds a `native` prop that swaps a component for the platform's own: SwiftUI and UIKit on iOS, including Liquid Glass on iOS 26+, and Jetpack Compose Material 3 on Android. Without it, the Ferrule component draws the same everywhere.

## What has been tested, and what has not

Ferrule is 0.2.0, so expect changes between minor versions. The project keeps [a page](https://leoanimesh.github.io/ferrule/docs/platforms) that says exactly what has run:

- iOS: an XCUITest suite on the iOS 26.5 simulator. Not on a physical iPhone.
- Android: a scripted flow with real taps and typing on an API 37 emulator, and on one physical Pixel 8a.
- Web: Chrome, and the WebKit and Firefox builds that Playwright ships.
- No live VoiceOver, TalkBack or browser screen reader run yet.

One known cost: on web, Reanimated is most of the bundle. A fresh Expo web app with one Button is 283 kB gzipped against 107 kB when empty.

## Try it

- Docs, with every component live: https://leoanimesh.github.io/ferrule/
- Source, MIT: https://github.com/leoAnimesh/ferrule

If you run it on a real iPhone, or with a screen reader, an issue saying what you saw would help more than anything else.
