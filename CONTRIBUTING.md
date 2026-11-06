# Contributing to Ferrule

```sh
pnpm install
pnpm build        # compile packages/ferrule to lib/, which the harness imports
pnpm test         # CLI, component, catalog and pack tests
pnpm typecheck
pnpm check        # the harness imports no primitives from react-native
pnpm check:pack   # what each package would ship
pnpm example      # run the harness (apps/example) in Metro
```

The `.claude/skills` folder has agent skills for this work, which also read fine as checklists: `ferrule-ui` for building with the library, `ferrule-build-component` for adding a component, and `ferrule-test-example` for running it through the harness.

## Adding or changing a component

1. Add `packages/ferrule/registry/components/<name>.tsx`. Import only from `ferrule`, `react` and sibling registry files. A test enforces this.
2. List it in `packages/ferrule/registry/registry.json`, with sibling imports in `dependencies`. A test checks that they match.
3. Add tests in `packages/ferrule/test/native` and, for anything keyboard or DOM related, `packages/ferrule/test/web`.
4. Document props in `packages/ferrule/docs/components.md`.
5. Add `apps/example/src/demos/<name>.tsx` with every state, one line in `apps/example/src/catalog.ts`, the id in `testAllComponentsRender`, and a probe in `apps/example/src/demos/metrics.tsx`. Copy the source over with `pnpm --filter ferrule-example sync`. A test fails if a registry component has no demo.
6. Add a docs page: an entry in `apps/docs/src/components.ts` and a file in `apps/docs/examples/`. A test fails if it is missing.

Every component must:

- **Use semantic tokens**, never raw colors, so a palette can reprint it. `ferrule check` and a test fail on hex, `rgb()` or named colors. Merge `useSlot('<name>', '<slot>')` before the `style` prop, so themes can override it.
- **Stay JS-only apart from Reanimated.** No other native dependency without a strong case. Draw controls in Views rather than using a platform widget whose look varies, and do all animation with Reanimated through `ferrule`'s exports.
- **Grow with text.** Use `minHeight`, never `height`, on anything holding text. Interactive areas reach `tokens.minTouchTarget`.
- **Be accessible.** Set a role, a name and states. A View with a role also needs `accessible` to exist for native screen readers.
- **Work in RTL.** Use `start`/`end` styles. Transforms do not flip, so multiply by `rtlSign(useDirection())`.
- **Forward its ref**, and have no `any` in public props.

## Checking consistency

Open the harness at `?component=metrics` on each platform and save the logs. Each has a `FERRULE_METRICS` line. Then:

```sh
node scripts/compare-metrics.mjs ios.log android.log web.log
```

It fails if any component differs by more than 1dp.

## Adding a palette

Add it to `palettes` in `packages/ferrule/src/theme.ts` and to `palettes` in `registry/registry.json`. A test keeps those two lists matched and audits every palette against AA.

## Native views

Native code lives only in `packages/ferrule-native`, one view per component on a shared SwiftUI and Compose host. See [adding a component](packages/ferrule-native/docs/adding-a-component.md). No third-party native UI wrappers: write the Swift and Kotlin here. Core `ferrule` and copied components must never import `ferrule-native`.

## Pull requests

Keep them small, and say which platforms you ran. Commit messages use [Conventional Commits](https://www.conventionalcommits.org) (`feat(button): ...`, `fix(sheet): ...`). Do not claim a platform you did not run.
Ferrule follows a [code of conduct](CODE_OF_CONDUCT.md), and security issues go through [SECURITY.md](SECURITY.md). By contributing you agree your work is licensed under the MIT license.
