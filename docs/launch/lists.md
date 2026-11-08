# Directories, lists and newsletters

Checked on 2026-11-08, by reading each repository through the GitHub API. Nothing was submitted.

## 1. React Native Directory: do this first

reactnative.directory, from [react-native-community/directory](https://github.com/react-native-community/directory). Active: pushed to on 2026-11-07. Ferrule is not listed yet.

Its README says:

> - Add it **at the end** of `react-native-libraries.json` file (we use the order in that file for "Recently added" sort option).
> - Use the template as a guide.
> - Submit a PR.

> Please follow format, fields order and indentation as seen below, skip any of the `false` values and do not fill optional fields, unless it's necessary.

> If your package is within a monorepo on GitHub [...] then the name, description, homepage, and topics (keywords) will be extracted from `package.json` in the package subdirectory.

Its README also mentions a CLI: `bunx rn-directory submit`, run from the package's folder.

**Entries to add at the end of `react-native-libraries.json`**, one PR:

```json
{
  "githubUrl": "https://github.com/leoAnimesh/ferrule/tree/main/packages/ferrule",
  "npmPkg": "@leoanimesh/ferrule",
  "examples": ["https://leoanimesh.github.io/ferrule/"],
  "images": ["https://leoanimesh.github.io/ferrule/media/preview.jpg"],
  "ios": true,
  "android": true,
  "web": true
},
{
  "githubUrl": "https://github.com/leoAnimesh/ferrule/tree/main/packages/ferrule-native",
  "npmPkg": "@leoanimesh/ferrule-native",
  "ios": true,
  "android": true
}
```

Decide before submitting:

- The directory defines `ios` as "works on iOS device". Ferrule has only run on the iOS simulator. Say that in the PR description, or run it on an iPhone first.
- `expoGo` is left out. The core package is JavaScript plus Reanimated, but nobody has tried it in Expo Go. `ferrule-native` cannot run there at all.
- `newArchitecture` is left out, as the template asks, unless the directory's automatic check gets it wrong. Ferrule needs the New Architecture.
- The README improvements in this branch only reach npm with the next release. The directory reads `package.json` from GitHub, so they apply there as soon as they merge.

**PR title:** `Add @leoanimesh/ferrule and @leoanimesh/ferrule-native`

## 2. Awesome lists: wait for adoption

**[jondot/awesome-react-native](https://github.com/jondot/awesome-react-native)**: active, last pushed 2026-08-26. Its CONTRIBUTING.md says:

> Libraries should have real adoption or be exceptionally novel. If you are submitting your own project, that's welcome — but it must clear the same bar as everything else.

> Use the following format: `[NAME](LINK) - Description.` — short, descriptive, ends with a period.

> Make an individual pull request for each suggestion.

The repo has no stars or outside users yet, so this would most likely be declined today. Submit once there is real use. The entry, for the "Components > UI" section, which already lists react-native-paper, Tamagui and gluestack-ui:

```md
- [Ferrule](https://github.com/leoAnimesh/ferrule) - Copy-in components for iOS, Android and web, with token theming, AA palettes and optional SwiftUI and Compose views.
```

**[enaqx/awesome-react](https://github.com/enaqx/awesome-react)**: its "React Native Awesome Components" section holds two entries. It is very selective, and it has no contribution guide to quote. Not worth a PR now.

**[brillout/awesome-react-components](https://github.com/brillout/awesome-react-components)**: about React for the web, so it does not fit. Its rules also say "TO ADD A LISTING, YOU MUST REMOVE ONE (or more) UN-AWESOME COMPONENT IN ANY PR."

**[madhavanmalolan/awesome-reactnative-ui](https://github.com/madhavanmalolan/awesome-reactnative-ui)**: last pushed 2023-08-28, and it has no contribution guide. A PR is unlikely to be merged.

## 3. Where else

| Where | How | Checked |
| --- | --- | --- |
| npm | Done: the package pages for `@leoanimesh/ferrule` and `@leoanimesh/ferrule-native` | Yes |
| GitHub topics and description | Done in this branch's pull request | Yes |
| Google Search Console | Submit the sitemap, see [README.md](README.md) | Steps only |
| This Week In React (newsletter) | Its site lists a Discord and a sponsor page, and no submission form | Homepage only |
| Reactiflux and Expo Discords | Only in their showcase channels, if they have one. Read the rules first | No |
| dev.to and Hashnode | [article.md](article.md) | No |
| Lobsters | Invite only, and it discourages self-promotion. Skip unless you are already a member | No |
| Product Hunt | Fits apps better than libraries. Low priority | No |
