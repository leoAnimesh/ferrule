# Reddit

**Read each subreddit's rules before posting.** Reddit blocked automated reading, so the rules could not be checked for this draft. Look in the sidebar or the "About" tab for:

- whether self-promotion is allowed, and how often;
- a required flair, such as "Show and tell" or "Library", or a weekly showcase thread to use instead;
- whether links must be to source rather than to a site.

If a subreddit has a weekly showcase thread, post the short version there instead of making a new post.

Reddit's general guidance is that most of your activity should not be about your own project. Post from an account that also takes part in other threads.

## r/reactnative

**Title:**

> I made Ferrule, React Native UI components that a CLI copies into your app (iOS, Android, web)

**Body:**

> Hi all. Ferrule is a UI library where the components are not imported from a package: `npx ferrule add button input` copies their source into `components/ui/`, the way shadcn/ui works on the web. They are yours to edit.
>
> [why]
>
> - 23 components with one API on iOS, Android and web (react-native-web).
> - Theming by tokens, with seven palettes that are AA in light and dark, or your own palette from one brand color.
> - `ferrule check` for CI: it fails on primitives imported straight from react-native, and on raw colors in copied components.
> - Optional `@leoanimesh/ferrule-native`: a `native` prop switches a component to SwiftUI/UIKit on iOS (Liquid Glass on 26+) or Compose Material 3 on Android.
>
> Needs RN 0.86+ on the New Architecture and Reanimated 4.7.
>
> To be upfront: it is 0.2.0. It has run on an iOS simulator, an Android emulator, one Pixel 8a, and browsers. It has not run on a physical iPhone or under VoiceOver or TalkBack yet. Reports from either would help a lot.
>
> Docs and live components: https://leoanimesh.github.io/ferrule/
> Source (MIT): https://github.com/leoAnimesh/ferrule
>
> Happy to answer questions, and to hear where it falls short.

## r/expo

Post only if its rules allow it, and a few days after r/reactnative.

**Title:**

> Ferrule: copy-in UI components for Expo apps on iOS, Android and web

**Body:**

> Ferrule is a React Native UI library that works in Expo and bare apps. The CLI copies component source into your project, so there is nothing to style around.
>
> In an Expo app:
>
> ```sh
> npx expo install react-native-reanimated react-native-worklets
> npm install @leoanimesh/ferrule
> npx ferrule init --fix
> npx ferrule add button input
> ```
>
> `init --fix` writes the theme file and the Babel plugin. For web, also `npx expo install react-native-web react-dom`. The optional native views in `@leoanimesh/ferrule-native` need a development build, not Expo Go.
>
> It is 0.2.0. A fresh Expo app installed from the package ran `init`, `add --all`, `check` and `tsc`, and a web export where clicking a Button worked. The project has run on an iOS simulator, an Android emulator and one Pixel 8a, not a physical iPhone.
>
> https://leoanimesh.github.io/ferrule/ · https://github.com/leoAnimesh/ferrule
