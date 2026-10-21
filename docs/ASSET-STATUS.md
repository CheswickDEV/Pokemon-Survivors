# Assets, licenses and complete distribution

Status: **October 21, 2026 — 1.0.0-rc.6.5**.

The complete developer project includes current game media and available editing
sources. It can be installed, played, edited, tested and rebuilt locally.
The earlier restriction to a code-only export does not apply to this download.

**Original code is GPL-3.0-only. That does not freely license all included
media.** The project has no documented public redistribution permission from
the original rights holders for active Pokémon graphics and cries. Complete
technical distribution does not change this. A noncommercial-only license also
does not satisfy the [Open Source Definition](https://opensource.org/osd).

## Included content

| Component | Source / included notice |
|---|---|
| Game code, local sound synthesis, build/test tools | Original code under GPL-3.0-only; derived third-party data excluded |
| Normal and Shiny animations, portraits, XML and credits | Pinned PMDCollab/SpriteCollab revision; CC BY-NC 4.0 plus original-sprite credits including CHUNSOFT |
| Forest, interiors, NPCs, fences and world map | FireRed data from pinned pret/pokefirered; source data, palettes and room data included |
| Original trainer images | Pinned pret sources; original Pokémon rights remain |
| 151 Pokémon cries | PokeAPI/cries; its license explicitly attributes audio content to The Pokémon Company |
| New trainer and building graphics | Generated fan art with local source images and sanitized prompts; no blanket character/trademark clearance |
| Silkscreen font | SIL OFL 1.1; full license included |
| Pokémon catalog data | PokeAPI, BSD-3-Clause; a data license is not a media license |
| Phaser and eventemitter3 | MIT; complete runtime notices under `docs/asset-sources/` |

Preserve provenance, license files, author registries and individual credits.
`THIRD-PARTY-NOTICES.md` provides the overview. A fully freely licensed game
would require the appropriate rights or replacement of affected content,
including character depictions.

## Developer package and player build

- `release-config/source-files.json` lists code, tests and documentation.
- `release-config/developer-files.json` adds current media, available editing
  sources and import tools.
- `release-config/runtime-assets.json` lists **1,447** required image, audio
  and font files with SHA-256 hashes. Only these media enter the web build.

Unused historical sprites in `public/art/pokemon/`, private working folders,
caches, logs and old QA/release output are excluded. No current gameplay feature
is removed. Editing sources are included in the developer archive but are not
served as web files. Private machine paths in prompts/importers were replaced
with project-relative paths and the documented optional tool installation.

The smaller additional `source.zip` still excludes Pokémon pictures and cries.
It is useful for code-only review and does not replace the complete project.
Original upstream legal texts and attribution records retain their original
wording; the surrounding project documentation is English.

## Evidence

- [SpriteCollab license](asset-sources/pokemon-motion-LICENSE.md) and
  [provenance](asset-sources/pokemon-motion-PROVENANCE.md).
- [Shiny credits and provenance](asset-sources/pokemon-shiny-PROVENANCE.md).
- [FireRed interiors](asset-sources/interiors-v7-SOURCES.md) and
  [overworld graphics](asset-sources/original-overworld.md).
- [PokeAPI/cries license](https://raw.githubusercontent.com/PokeAPI/cries/b3a9044bb839b5e3152aaa536c7b463a0fcf0140/LICENSE)
  and [local copy](asset-sources/cries-LICENSE).
- [Font license](asset-sources/fonts-OFL.txt) and
  [data license](asset-sources/PokeAPI-data-LICENSE.txt).

This records the project's known provenance and license status; it is not
legal clearance or a statement about every contributor's individual rights.
