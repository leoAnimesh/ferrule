The CLI comes with the package and runs as `npx ferrule`. The component registry ships inside the package and is read locally, so `add` works offline and matches your installed version.

Every command takes `--cwd <path>`, to run it on a project other than the current folder.

`npx ferrule --version` prints the installed version.

## init

```sh
npx ferrule init --fix
```

Writes `ferrule.json` and a theme file into an existing project, and checks the Reanimated setup. It never overwrites a file.

| Option | What it does |
| --- | --- |
| `--dir components/ui` | Where components are copied |
| `--palette cobalt` | The built-in palette the theme file starts with. For your own, edit the theme file: see [Palettes](/docs/palettes) |
| `--fix` | Adds the Babel plugin, where it can parse your config safely |

`init` and `add` check the setup and print the exact fix for a missing or mismatched peer.

## add

```sh
npx ferrule add button input   # those two, and what they depend on
npx ferrule add --all          # every component
```

Copies components and their dependencies. It keeps your edits unless you pass `--overwrite`.

A new ferrule version changes `lib`, not your copies, so run `add --overwrite` for a component to take its fixes, and redo any edits you made.

## list

```sh
npx ferrule list
```

Lists the components in the registry.

## check

```sh
npx ferrule check
```

Exits 1 in any of these cases, so it fits in CI:

- primitives such as `View` and `Text` come directly from `react-native`, because then they miss theming and consistency fixes
- a copied component holds a raw color
- Reanimated is misconfigured

APIs Ferrule does not cover, such as `Linking`, stay allowed. `check` scans with patterns rather than a full parser, so unusual import forms can slip past it.
