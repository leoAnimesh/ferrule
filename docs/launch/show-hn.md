# Show HN

Rules, from news.ycombinator.com/showhn.html, read when this was written: Show HN is "for something you've made that other people can play with", the project must be "something you've worked on personally and which you're around to discuss", and "Please don't ask friends to upvote or comment." The title must begin with "Show HN".

Submit the site as the URL, and post the text below as your first comment, right after submitting.

**Title** (under 80 characters):

> Show HN: Ferrule – copy-in React Native UI components for iOS, Android and web

**URL:** https://leoanimesh.github.io/ferrule/

**First comment:**

> Ferrule is a React Native UI library for iOS, Android and web. Instead of importing components from a package, a CLI copies their source into your app, the way shadcn/ui does on the web. You own the files and can edit them; `add` will not overwrite your edits unless you pass `--overwrite`.
>
> [why]
>
> What is in it:
>
> - 23 components (Button, Input, Sheet, Modal, Toast, Segmented, TabBar, Carousel, SwipeRow and so on), one API on all three platforms.
> - Themes are tokens plus seven palettes, each derived from one ink and AA in light and dark. `createTheme({ palette: 'cobalt' })` reprints everything. You can also make a palette from one brand color.
> - `ferrule check` exits 1 when code imports primitives straight from react-native or a copied component holds a raw color, so it can run in CI.
> - 287 Feather icons, with no icon font and no SVG dependency.
> - An optional package, @leoanimesh/ferrule-native, swaps in real platform views with a `native` prop: SwiftUI and UIKit on iOS (Liquid Glass on iOS 26+), Jetpack Compose Material 3 on Android.
>
> The one required native library is Reanimated 4.7, so it needs React Native 0.86+ on the New Architecture.
>
> What has and has not been tested, plainly: an iOS 26.5 simulator, an API 37 emulator, one physical Android phone (a Pixel 8a), Chrome, and Playwright's WebKit and Firefox builds. No physical iPhone yet, and no live VoiceOver or TalkBack run. It is 0.2.0, so expect changes. The platform page lists all of this: https://leoanimesh.github.io/ferrule/docs/platforms
>
> One known cost: on web, Reanimated is most of the bundle. A fresh Expo web app with one Button is 283 kB gzipped against 107 kB empty.
>
> Install: `npm install @leoanimesh/ferrule`, then `npx ferrule init --fix` and `npx ferrule add button input`. Source (MIT): https://github.com/leoAnimesh/ferrule
>
> I would especially like to hear from anyone who tries it on a real iPhone, or with a screen reader.
