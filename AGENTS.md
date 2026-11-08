# AGENTS.md

Guidance for coding agents working in Ferrule: React Native UI components copied into apps, plus an optional native package (TypeScript, Swift, Kotlin; MIT). `CLAUDE.md` only imports this file, so edit this one.

## Layout

- `packages/ferrule`: provider, theme, primitives (`src`), Feather icons (`src/feather*`), components (`registry`), CLI (`cli`, `bin`). JS only.
- `packages/ferrule-native`: the only native code in the project.
- `apps/example`: the test harness, a catalog of every component (`src/catalog.ts`, `src/demos`), with `e2e/` and screenshot baselines. Never shipped.
- `apps/docs`: docs site and landing page. Content is generated from the repo at build time.
- `docs/gaps.md`: where the library fell short, and what was done about it.
- `CHANGELOG.md`, `docs/release-checklist.md`, `docs/release-readiness.md`: what changed, how to release, and what stands in the way.

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
pnpm screens          # visual regression; needs the app installed. See apps/example/e2e/screens/README.md. With a phone attached too, set ANDROID_SERIAL
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
- Animations use Reanimated through `ferrule`. Library code imports no `Animated`, `Easing` or `LayoutAnimation` from `react-native`, and does not use `KeyboardAvoidingView`, which animates with `LayoutAnimation`. `scripts/reanimated-only.test.mjs` fails otherwise.
- Regenerate baselines only after looking at the new images.
- Ferrule ships on npm through `.github/workflows/release.yml`, which only releases on a version bump. Do not run `npm publish` by hand except for the first publish in `docs/release-checklist.md`, and do not bump the version without being asked.

## Docs stay in sync

Any change to a prop, component, CLI command or flag, theme API or behaviour updates its docs in the same change. No follow-ups. Where each one lives:

| Change | Update |
| --- | --- |
| Prop or component | `packages/ferrule/docs/components.md`, and `apps/docs/src/components.ts` plus `apps/docs/examples/` for the site. The site's props table comes from the TypeScript, so give new props a doc comment |
| CLI command or flag | `apps/docs/content/cli.md`, and the CLI table in `README.md` |
| Theme API | `packages/ferrule/docs/theming.md`, which is also the site's Theming, Palettes and Fonts pages |
| Native view | `packages/ferrule-native/docs/coverage.md`, with what was really run |
| A behaviour change for existing users | The "Behaviour changes" list in `docs/gaps.md`, and `CHANGELOG.md` |
| What was run, or a claim on the landing page | `README.md`, `apps/docs/content/platforms.md`, `apps/docs/src/Landing.tsx` |

`pnpm --filter ferrule-docs test` fails if a component has no section, a public prop or CLI flag is not mentioned, or a native view is missing from the coverage table. It cannot tell whether what the docs say is true, so read them too.

## Skills

`.claude/skills`: `ferrule-ui` for building with the library, `ferrule-build-component` for adding a component, `ferrule-test-example` for testing through the catalog.

## Reporting

Say what you ran and on what. Never claim a platform works without having seen it run. Simulators and emulators are not real devices, and neither is a live screen reader run. `ferrule-test-example` lists what to report as verified or not.
