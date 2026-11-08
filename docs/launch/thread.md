# X and Bluesky thread

Each post is under 280 characters, which also fits Bluesky's 300. Attach `social-preview.jpg` to the first post, or a short screen recording of the palette switch on the landing page.

**1/**
> I made Ferrule: a React Native UI library for iOS, Android and web where a CLI copies each component's source into your app, shadcn/ui style. You own the code.
>
> https://leoanimesh.github.io/ferrule/

**2/**
> 23 components, one API on all three platforms. One word changes the theme: seven palettes, each AA in light and dark, or one you derive from your brand color.

**3/**
> `ferrule check` fails in CI when code imports primitives straight from react-native, or a copied component holds a raw color.

**4/**
> Optional: `@leoanimesh/ferrule-native` adds a `native` prop that swaps in SwiftUI/UIKit views on iOS, Liquid Glass on iOS 26+, and Compose Material 3 on Android.

**5/**
> Honest status: 0.2.0. Run on an iOS simulator, an Android emulator, one Pixel 8a and browsers. Not yet on a physical iPhone or with VoiceOver or TalkBack. Reports welcome.

**6/**
> npm install @leoanimesh/ferrule
> npx ferrule init --fix
> npx ferrule add button input
>
> MIT: https://github.com/leoAnimesh/ferrule
