You install Ferrule from npm. The package holds only the library and CLI, not the example app or these docs. The component registry ships inside it, and `add` reads it locally.

## Requirements

| Needs | Version |
| --- | --- |
| React Native | 0.86 or later, on the New Architecture |
| React | 19 |
| `react-native-reanimated` | 4.7, with `react-native-worklets` 0.13 |
| Node | 20 or later, for the CLI |

Reanimated sets the React Native floor. With its worklets peer, it is the one required native library, and no font install is needed.

## Expo

```sh
npx expo install react-native-reanimated react-native-worklets
npm install ferrule
npx ferrule init --fix
npx ferrule add button input
```

Expo's preset adds the worklets Babel plugin itself. For web, also run `npx expo install react-native-web react-dom`.

## Bare React Native

```sh
npm install react-native-reanimated react-native-worklets
npm install ferrule
cd ios && pod install && cd ..
npx ferrule init --fix
npx ferrule add button input
```

`react-native-worklets/plugin` must be the last Babel plugin. `init --fix` adds it where it can parse your config safely, and otherwise changes nothing and tells you what to add. Restart Metro with `--reset-cache` after a Babel change.

## Wrap your app once

`init` writes `ferrule.json` and `ferrule.theme.ts`. Pass the theme to the provider:

```tsx
import { FerruleProvider } from 'ferrule';
import { theme } from './ferrule.theme';
import { Screen } from './Screen';

export default function App() {
  return (
    <FerruleProvider theme={theme}>
      <Screen />
    </FerruleProvider>
  );
}
```

If you use toasts, wrap the app's contents in `ToastProvider` from `./components/ui/toast` as well.

## Use a component

`add` copied the source into `components/ui/`. It is your code now.

```tsx
import { useState } from 'react';
import { View } from 'ferrule';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

export function Screen() {
  const [email, setEmail] = useState('');
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Input label="Email" value={email} onChangeText={setEmail} />
      <Button onPress={() => console.log(email)}>Save</Button>
    </View>
  );
}
```

## Change the palette

One word in `ferrule.theme.ts`, and every component reprints:

```ts
import { createTheme } from 'ferrule';

export const theme = createTheme({ palette: 'cobalt' });
```

Or [print your own](/docs/palettes) from one brand color per mode.

Next: [the CLI](/docs/cli), [theming](/docs/theming), or any component in the sidebar.

## Build the package yourself

To use a commit that has no release, build the same tarball from a clone:

```sh
git clone https://github.com/leoAnimesh/ferrule.git
cd ferrule
pnpm install
pnpm build
cd packages/ferrule
npm pack
```

Then install the resulting `ferrule-0.2.0.tgz` by path. A git dependency is not supported: the package lives in a subdirectory, and it would fetch the whole monorepo.
