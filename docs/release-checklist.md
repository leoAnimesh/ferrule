# Release checklist

Ferrule ships on npm as `ferrule` and `ferrule-native`. `.github/workflows/release.yml` runs on every push to `main`, and `scripts/release-plan.mjs` decides what it does. Bumping the version is the only thing that releases. `0.2.0` below stands for the version being released. Everything marked **(person)** cannot be done by automation.

| On `main` | What happens |
|---|---|
| The version's `v` tag exists | Nothing. This covers every plain merge, and `0.1.0`, which is tagged but was never on npm. A tag is never published over |
| A new version, no tag | Full checks, publish `ferrule`, publish `ferrule-native`, then tag, GitHub release and site |
| No tag, but one package is on npm | A release that stopped partway. Only what is missing runs |
| Versions, peer range or changelog disagree | Fails, on the pull request too. Nothing publishes |
| npm or GitHub cannot be reached | Fails. It is never read as "not published" |

The docs site deploys only when the current version is on npm, so it cannot tell anyone to run `npm install ferrule` before that works. Until then the live site stays as it is.

## 1. Decide

- **(person)** The version. `1.0.0` should wait for the screen reader and device runs below.

## 2. Check the tree

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm --filter ferrule-example sync
pnpm test
pnpm typecheck
pnpm check
pnpm check:pack
pnpm --filter ferrule-docs test
pnpm --filter ferrule-docs typecheck
pnpm --filter ferrule-docs build
```

Then on a Mac, with Metro on 8090 (`npx expo start --port 8090` in `apps/example`), and the harness installed:

```sh
bash apps/example/e2e/ios/run.sh <simulator-udid> <screenshot-dir>   # fails if no tests ran
python3 apps/example/e2e/android/flow.py
python3 apps/example/e2e/android/native.py
pnpm screens
```

CI and the release workflow run none of these, so **a release proves nothing about iOS or Android**. Run them before merging a version bump. The `Native build` workflow, run by hand from the Actions tab, only proves the harness compiles. With a phone and an emulator both attached, set `ANDROID_SERIAL` for all three Android commands.

**(person)** Look at every image `pnpm screens` flags, in `apps/example/e2e/screens/out`. Update baselines with `pnpm screens <platform> --update` only after that.

## 3. Check what only a person can

- **(person)** VoiceOver on an iPhone, TalkBack on an Android phone, and NVDA or VoiceOver on web. Walk the catalog. Listen especially for toasts (including one over a modal), `Stepper`, `Segmented`, `TabBar` and `List`.
- **(person)** A physical iPhone, and an Android phone other than the one in [the readiness report](release-readiness.md): safe areas, keyboard, gestures, native views.
- **(person)** iOS 17 to 25, if you keep claiming them. Install a runtime and run the iOS suite on it.
- **(person)** Safari and Firefox as released, not the Playwright builds.

## 4. Prove the packages install

```sh
(cd packages/ferrule && npm pack)
(cd packages/ferrule-native && npm pack)
```

In a fresh Expo app and a fresh bare React Native app, install those tarballs and their peers, then run `npx ferrule init`, `npx ferrule add --all`, `npx ferrule check`, and `npx tsc --noEmit`. Build and run each on a device or simulator.

## 5. Bump, in one pull request

1. Set `version` in `packages/ferrule/package.json` and `packages/ferrule-native/package.json`, and the `ferrule` peer range in `ferrule-native` to `>=0.2.0`.
2. Rename `## Unreleased` in `CHANGELOG.md` to `## 0.2.0`, with the date. Its text becomes the release notes.
3. Update `README.md` and `apps/docs/content/platforms.md` with what was really run.
4. Open a pull request, and wait for CI. It runs `node scripts/release-plan.mjs --check`.

## 6. Merge

Merging releases. There is nothing else to run. Watch the `Release` workflow in the Actions tab.

If it stops partway, use "Re-run failed jobs", or run `Release` by hand on `main`. It asks npm and GitHub again and only does what is left. npm never lets a published version change, so if a published package is wrong, bump again.

## First publish, once

Trusted publishing can only be set up on a package that exists, so the first release uses a token.

1. **(person)** Settings > Environments on GitHub: create an environment named `npm`. Adding yourself as a required reviewer makes every publish wait for your approval.
2. **(person)** On npmjs.com, create a granular access token with read and write on all packages, which new package names need, and the shortest expiry on offer. Add it to the `npm` environment as a secret named `NPM_TOKEN`.
3. **(person)** Follow sections 1 to 6. The first merge must carry the version bump, because `README.md` says `npm install ferrule` as soon as it is on `main`.
4. **(person)** Once both packages are on npm, open each one's settings on npmjs.com and add a trusted publisher: GitHub Actions, repository `leoAnimesh/ferrule`, workflow `release.yml`, environment `npm`.
5. **(person)** Delete the `NPM_TOKEN` secret, and revoke the token on npmjs.com. Later releases need no stored secret.

## 7. Afterwards

- Install the published version in a fresh app, by following the site's own steps word for word.
- Check the `Release` workflow's `site` job deployed the docs.
