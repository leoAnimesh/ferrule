# Ferrule

## Purpose
A React Native UI library. It installs into any existing bare or Expo app, and `init`/`add` copy component source into the app, where the developer owns it.

## Users and their job
- App developers who need accessible, consistent controls across iOS, Android and web without building them, and who will edit the copied source.
- The people using those apps, who only ever meet the components, usually at arm's length on a phone, sometimes with a keyboard on web.

## Mechanism
Copied source plus one semantic theme: one palette name or one config value changes every component, with no component edits.

## Durable constraints
- No required font install and no Expo dependency. `react-native-reanimated` is the only required native dependency.
- WCAG AA in every palette, light and dark. Roles, labels, keyboard, focus, large text, RTL, reduced motion.
- Components use semantic tokens only.
- The default must be distinctive enough to ship as is, yet get out of the way of a developer's own product.

## Platform
adaptive: one design language on iOS, Android and web, drawn in JS so that it matches.
