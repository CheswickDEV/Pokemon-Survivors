# Licenses and source notices

Original game code is **GPL-3.0-only**, at the project owner's request.
Copyright © 2026 Pokémon Survivors contributors. The complete text is in
`LICENSE`. Separately licensed data and libraries retain their own licenses.
The GPL grants no rights to Pokémon characters, trademarks, music or
third-party graphics. Derived catalog data, animation metadata and source
references are not relicensed as newly authored code; their origins remain
documented in the relevant files and provenance notices.

| Component | Source / license | Scope |
|---|---|---|
| Phaser 3.90.0 | Photon Storm Ltd., MIT | Engine code; `docs/asset-sources/phaser-LICENSE.md` |
| eventemitter3 | primus, MIT | Phaser dependency; separate license text |
| Node.js 22.23.3 | OpenJS Foundation and contributors; MIT and bundled third-party notices | Windows player package only; complete text in `runtime/LICENSE` |
| Silkscreen | The Silkscreen Project Authors, SIL OFL 1.1 | Font; separate OFL text |
| Pokémon catalog data | PokeAPI, BSD-3-Clause | Data extract; `public/art/data/PokeAPI-LICENSE.txt` |
| Animated Pokémon | PMDCollab/SpriteCollab; used original sprites credit CHUNSOFT | Repository CC-BY-NC-4.0 is not blanket permission for third-party original graphics |
| Shiny variants of all 151 species | Pinned Shiny sheets from the same SpriteCollab revision; original colors, eight directions and timing retained | 604 additional runtime PNGs; license, provenance, author registry and individual credits under `docs/asset-sources/pokemon-shiny-*`; same separate media permissions |
| Overworld, interiors and NPCs | Pokémon FireRed, traced through pret/pokefirered | Public redistribution permission unresolved |
| Original trainer images and Pokémon cries | Pokémon / Nintendo / GAME FREAK / Creatures; sources through pret and PokeAPI | Public redistribution permission unresolved |
| New buildings / diagonal trainers | Images generated for this project | No blanket clearance of depicted characters or trademarks |
| Synthesized game effects | Original code in `src/audio.ts` | GPL-3.0-only for the code; external original cries excluded |

[Asset status](docs/ASSET-STATUS.md) documents the current media and license
position. The complete developer package includes media, available editing
sources, import tools and credits. Only the smaller additional `source.zip`
omits Pokémon image and audio files.

The local player package includes corresponding code under `source/` and
separate license/provenance texts under `notices/`. A complete technical
handover grants no additional rights to third-party content.

Optional tools are installed separately: sharp 0.35.5 (Apache-2.0 and separate
native-library licenses) through `tools/assets/package-lock.json`, and Pillow
13.0.0 (HPND) through `requirements-assets.txt`. Their binaries are not copied
into the developer source distribution. Licenses remain in installed packages.

This unofficial fan project is not affiliated with or endorsed by the named
rights holders.

## Original FR/LG overworld graphics (rc.5)

Workers, fence metatiles and the Kanto region map: Nintendo / Game Freak /
Creatures, reconstructed from the pinned pret/pokefirered revision.
[Overworld provenance](docs/asset-sources/original-overworld.md).
These media are not covered by the original code's GPL license.
