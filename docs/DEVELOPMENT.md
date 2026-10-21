# Local development

The complete developer download is a standalone working project. It includes
code, tests, game media, credits, animation XML, available source images,
palettes, room data and import tools. Personal caches, old QA output and the
unused historical `public/art/pokemon/` folder are excluded. Normal cloning
or extraction does not require Git LFS.

## Everyday workflow

```text
npm ci
npm run doctor -- --player
npm run dev
```

Validate with `npm run check`, `npm test`, `npm run check:release`,
`npm run check:developer` and `npm run build`. Use `npm start` to inspect the
production build on port 4173. To track a newly extracted archive with Git,
run `git init -b main` and inspect the file list before adding files.
Do not reinitialize an already cloned repository.

## Code map

| Area | Starting points |
|---|---|
| Startup, views and interface | `src/main.ts`, `src/view.ts`, `src/ui-v2.ts`, CSS in `src/` |
| English/German localization | `src/i18n.ts`, `src/locales/en.json`, `src/settings.ts` |
| Simulation and combat | `src/engine.ts`, `src/combat.ts`, `src/weapon-system.ts` |
| World and interiors | `src/world.ts`, `src/kanto-*.ts`, `src/interior-*.ts` |
| Pokémon, trainers and animation | `src/pokemon-motion.ts`, `src/pokemon-shiny.ts`, `src/trainer-*.ts` |
| Progress and saves | `src/save.ts`, `src/progress.ts`, `src/quests.ts` |
| Sounds and cries | `src/audio.ts`, `src/cry-audio.ts`, `public/audio/` |
| Images, sources and credits | `public/art/`, `docs/asset-sources/` |
| Tests | `tests/*.test.ts`; additional probes and fixtures in the same folder |
| Server, build and packaging | `server.mjs`, `vite.config.mjs`, `scripts/`, `release-config/` |

Edit the TypeScript sources, not bundled JavaScript in `dist/`. Use any suitable
image editor. Preserve transparency, atlas dimensions and animation metadata
when retaining the existing rendering layout.

## Languages

English is the default. German remains selectable in camp and Settings, and
`profile.settings.language` persists through normal saves and full backups.
Old profiles default to English. Language changes do not change simulation
IDs, stored quests, Pokémon IDs or save format.

Legacy German game text remains the canonical source for generated data and
existing save messages. `src/locales/en.json` maps that text to English.
`translateText` performs a longest-first, single-pass translation with word
boundaries; it never translates its own replacements. Prefer complete messages
over ambiguous short fragments. For dynamic messages, include all literal
parts and check the resulting English sentence with real values.

DOM localization runs at render boundaries and keeps original text in a
WeakMap for reversible switching. It changes text and accessible labels only,
never IDs, input values, data attributes, URLs or HTML structure. Phaser labels
and canvas map text use the same translator. World labels are rebuilt when the
language changes. Number formatting follows the selected locale. Pokédex search
indexes both names.

When adding visible text, add its English entry, check both languages and
extend the relevant tests. Do not send text to an online translation service
at runtime. Preserve upstream credits, legal notices and source identifiers.

## Editing runtime media

1. Edit a file under `public/`. Document the source and license of new content.
   PNGs and editing sources are ordinary repository files.
2. Register new runtime files explicitly, for example
   `npm run assets:refresh -- art/my-image.png` (without `public/`).
   This records the path, hash and byte count in both media lists. Add editing-only
   sources such as XML and palettes to `release-config/developer-files.json`.
3. Run `npm run assets:refresh` to refresh sizes and SHA-256 hashes of listed
   runtime files. It does not recursively include arbitrary files.
4. Update loading paths or atlas metadata in `src/` if needed. Run the doctor,
   tests and build, and inspect the result in the browser.
5. Commit images, metadata, credits and manifests together.

Allowlists prevent personal raw files from entering the player build.
The developer archive deliberately includes editing sources and tools, while
the web server serves only runtime files. Add new code/documentation files to
`release-config/source-files.json`. Lists use relative paths with `/`.

## Optional image tools

Included graphics can be edited directly. These tools are only needed for
deliberately reimporting or repacking them.

**Node tools:** open a terminal in `tools/assets/` and run:

```text
npm ci
npm audit
```

Return to the project root afterward. sharp and its native libraries stay in
`tools/assets/node_modules/`. These portable importers use that installation:

```text
node public/art/kanto-v6/import-buildings.mjs
node public/art/interiors-v7/import-assets.mjs
node public/art/original-overworld/import-assets.mjs
```

The building importer uses included `generated/*.png` sources. Interior and
overworld importers use pinned source revisions and may download missing raw
data from GitHub. They overwrite their generated media and metadata: back up
your work first, inspect the changes, then run `npm run assets:refresh`.

**Python tools:** provide Python 3.12 or a compatible newer version with Pillow
support. On Windows, use a local environment:

```text
py -3.12 -m venv .venv
.venv\Scripts\python -m pip install -r requirements-assets.txt
.venv\Scripts\python scripts/import-trainer-diagonals.py
```

On macOS/Linux use `python3 -m venv .venv` and `.venv/bin/python`.
Activation is unnecessary. Pillow is pinned in `requirements-assets.txt`.
Other importers under `scripts/` and the media folders describe their inputs
in their file headers. The Kanto data importer uses the standard library only.

Included generated source images are directly editable; no AI account is
required. Historical prompts document provenance, not a promise of identical
regeneration. Animations include credits and XML; upstream reimport may need
internet access. The entire Python pipeline has not been rerun for this release.

## Packages and contributions

`npm run release:developer` creates the full developer archive;
`npm run check:developer` checks the same files without creating a ZIP.
Both reject missing/changed runtime media, private paths, known secret
patterns and invalid file paths.

`npm run release:source` creates the smaller export without Pokémon images or
cries. It supports `npm run test:core` and a code build.
`npm run test:available` runs all tests when the full media set is present;
an incomplete developer package fails instead of silently falling back.

`DEVELOPER-FILES.json` records checksums at export time. After your edits it is
a historical inventory; the next export regenerates it.
`DEVELOPER-PACKAGE.json` identifies the full contents and separate license status.

GitHub CI checks Windows and Linux and produces a smaller code-only artifact.
It does not download original media or publish releases. See
[Contributing](../CONTRIBUTING.md) for pull requests.
