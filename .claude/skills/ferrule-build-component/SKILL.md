---
name: ferrule-build-component
description: The process for adding or changing a component in the Ferrule library, from registry entry to tests, docs, harness demo and optional native view. Use whenever someone asks to add a component, build a new UI control, wrap a SwiftUI or Compose view, add a native variant, or change what a registry component does in this repository. For screens in an app, use ferrule-ui. For running what you built, use ferrule-test-example.
---

# Building a Ferrule component

Work through these in order, with commands run from the repo root. The registry, harness and docs steps have checks that fail when they are skipped. Nothing fails if you skip the tests in step 3 or the props docs, so those are on you.

## 1. Registry

Add `packages/ferrule/registry/components/<name>.tsx`, and its entry in `packages/ferrule/registry/registry.json`:

```json
"<name>": { "file": "<name>.tsx", "dependencies": ["text"], "description": "One sentence." }
```

`dependencies` lists the sibling registry files it imports. A test checks they match. Import only from `ferrule`, `react` and sibling registry files, because the file gets copied into apps that have nothing else.

## 2. Implementation rules

- **Tokens only.** Colors from `useTheme()`, never hex or named colors. `ferrule check` and a test fail on them.
- **Slots.** Merge `useSlot('<name>', '<slot>')` before the `style` prop, so a theme can restyle it.
- **States.** Handle disabled, loading, error, long text and empty, whichever apply. Disabled goes in `aria-disabled` as well as the look. Empty renders nothing, or says so.
- **Accessibility.** Set a role, a name and states. A `View` with a role also needs `accessible` to exist for native screen readers. Touch targets reach `tokens.minTouchTarget`.
- **RTL.** `start`/`end` styles. Transforms do not flip, so multiply by `rtlSign(useDirection())`.
- **Motion.** Reanimated from `ferrule`, with `tokens.motion` and `EASE_OUT`. `withTiming` follows reduced motion. A `withRepeat` needs `useReducedMotion` handled by hand, and effects cancel on unmount.
- **Types and refs.** `forwardRef`, an exported `<Name>Props` with JSDoc on non-obvious props, and no `any`. The docs site builds its props table from this interface.
- **Sizes.** `minHeight`, never `height`, on anything holding text.
- **No new native dependency** without a strong case. Native code belongs in `ferrule-native`.

## 3. Tests

Add cases to `packages/ferrule/test/native/components.test.tsx`, and to `packages/ferrule/test/web/` for anything keyboard or DOM related. Cover the role and name, disabled, and the states above.

```sh
pnpm --filter ferrule test
```

## 4. Harness demo

Add `apps/example/src/demos/<name>.tsx`, exporting `Demo` with every variant, size and state. Then add one import and one `entry(...)` line to `apps/example/src/catalog.ts`, and the id to the list in `testAllComponentsRender` in `apps/example/e2e/ios/FerruleHarnessUITests.swift`. If it has a stable size, add a probe to `apps/example/src/demos/metrics.tsx`.

```sh
pnpm --filter ferrule-example sync   # copies the registry into the harness
pnpm --filter ferrule-example test   # fails if a registry component has no demo, or the iOS suite skips it
pnpm typecheck
pnpm check
```

## 5. Docs

- Props and notes in `packages/ferrule/docs/components.md`.
- A docs page: an entry in `apps/docs/src/components.ts` and a file in `apps/docs/examples/`. `pnpm --filter ferrule-docs test` checks the site's content, and `pnpm --filter ferrule-docs typecheck` compiles the samples.
- The platform status in `README.md`, if it changes anything.

## 6. CLI

Prove a fresh project gets the file and its dependencies. `init` warns about missing Reanimated here, which is expected:

```sh
node packages/ferrule/bin/ferrule.js list
T="$(mktemp -d)" && echo '{"name":"t","dependencies":{"react-native":"0.88.1"}}' > "$T/package.json"
node packages/ferrule/bin/ferrule.js init --cwd "$T"
node packages/ferrule/bin/ferrule.js add <name> --cwd "$T"
ls "$T/components/ui"
```

## 7. Optional native view

Only when a real platform control exists and is worth having. The full recipe is `packages/ferrule-native/docs/adding-a-component.md`. In short:

1. Spec in `packages/ferrule-native/src/specs`, listed in `src/nativeSpecs.ts` and in `codegenConfig` in that package's `package.json`.
2. iOS: `FERRULE_HOST_VIEW` in `ios/FerruleViews.mm`, a `case` in `ios/FerruleViews.swift`, and SwiftUI content in `ios/views/`. Mark it `@available` and give iOS below 17 the fallback. New iOS APIs need an availability branch for older versions.
3. Android: a manager in `FerruleManagers.kt`, registered in `FerruleNativePackage.kt`, and a composable in `views/FerruleContents.kt`.
4. JS: a wrapper in `src/components.tsx` that takes a `fallback`. For a `native` prop on a Ferrule component, `registerNativeVariants` in `src/index.ts`, and `useNativeVariant` in the registry file.
5. Harness: wrap the demo in `NativeSection` from `src/harness/NativeSection.tsx`, exporting it as `NativeDemo`. Its badge shows whether the real view or the fallback is drawing, so read it on each platform.
6. Rebuild both apps, since JS reload cannot add a native view. Add a row to `packages/ferrule-native/docs/coverage.md`, saying only what you saw run.

## 8. Run it

Follow ferrule-test-example, on every platform you will claim.
