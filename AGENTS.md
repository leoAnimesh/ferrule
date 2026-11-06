# AGENTS.md

Guidance for coding agents working in Ferrule: React Native UI components copied into apps, plus an optional native package (TypeScript, Swift, Kotlin; MIT). `CLAUDE.md` only imports this file, so edit this one.

## Layout

- `packages/ferrule`: provider, theme, primitives (`src`), Feather icons (`src/feather*`), components (`registry`), CLI (`cli`, `bin`). JS only.
- `packages/ferrule-native`: the only native code in the project.
- `apps/example`: the test harness, a catalog of every component (`src/catalog.ts`, `src/demos`), with `e2e/` and screenshot baselines. Never shipped.
- `apps/docs`: docs site and landing page. Content is generated from the repo at build time.
- `docs/gaps.md`: where the library fell short, and what was done about it.

## Commands

Run from the repo root.

```sh
pnpm install
pnpm build            # packages/ferrule to lib/, which the harness and docs import. Rerun after changing src
pnpm --filter ferrule-example sync   # copy registry changes into the harness
pnpm test             # CLI, component, catalog and pack tests
pnpm typecheck
pnpm check            # ferrule check on the harness: no raw primitives or colors
pnpm check:pack       # what each package would ship
pnpm screens          # visual regression; needs the app installed. See apps/example/e2e/screens/README.md
pnpm --filter ferrule-docs test
pnpm --filter ferrule-docs start     # docs site on port 8092
```

Run the catalog from `apps/example`, with Metro on 8090:

```sh
npx expo start --port 8090           # Metro. Press w for web, or open http://localhost:8090
npx expo run:ios --port 8090
npx expo run:android --port 8090
```

Open a screen directly: `dev.ferrule.harness://?component=button&mode=dark` on a device, `?component=button&mode=dark` on web.

## Rules

- App code, the harness included, imports primitives from `ferrule`, never `react-native`.
- Components read semantic tokens only, no raw colors, and import only from `ferrule`, `ferrule/lib/feather`, `react` and sibling registry files.
- `ferrule` stays JS only. Native code lives only in `ferrule-native`, and that package wraps no third-party native UI library.
- `apps/`, e2e scripts, baselines, media and skills stay out of the published packages. `pnpm check:pack` fails if they get in.
- Regenerate baselines only after looking at the new images.
- Ferrule is not on npm. Do not publish it, and do not write install steps that assume it is.

## Skills

`.claude/skills`: `ferrule-ui` for building with the library, `ferrule-build-component` for adding a component, `ferrule-test-example` for testing through the catalog.

## Reporting

Say what you ran and on what. Never claim a platform works without having seen it run. Simulators and emulators are not real devices, and neither is a live screen reader run. `ferrule-test-example` lists what to report as verified or not.
