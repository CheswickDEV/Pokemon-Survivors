# Auenwald 0.3: artwork, movement and sound

All runtime files are local. Gameplay makes no external image, font or audio
requests. This document records the historical art pipeline and later additions.

## Characters and world

- **151 Pokémon:** individual eight-direction Walk, Idle and Attack sequences
  from [pinned SpriteCollab](https://github.com/PMDCollab/SpriteCollab/tree/0d0eb9d415a3f648c0df49de72a24a6d46ce3fab):
  453 atlases, 151 portraits, 26,472 frames. All 1,208 walking directions have
  at least three distinct poses. Import aligns ground anchors and compares visible
  pixels byte-for-byte with sources. Action origins/timing are preserved.
  [Credits](docs/asset-sources/pokemon-motion-PROVENANCE.md),
  [importer](scripts/import-pokemon-motion.py).
- **Loading:** preload small portraits; load movement atlases for starting teams,
  encounters, enemies and evolutions on demand. This avoids decoding the entire
  roughly 141 MiB set immediately. PNG files total approximately 4.89 MB.
- **Animation:** walking follows actual distance/direction; attacks face targets.
  Idle/attack timing follows simulation. Menus pause combat. Persian and Arcanine
  have static idle poses; Beedrill and Dragonair use their own Walk as Idle.
  All species have animated Walk/Attack.
- **Trainers (0.5.0):** Red, Ethan, Kris, Brendan, May and Leaf each have a complete
  generated eight-direction atlas: idle plus eight phases. Whole left poses mirror
  right poses. Step cycle approximately 0.86 s, dash minimum 0.72 s.
  [Details](TRAINER-MOTION.md), [sources/prompts](docs/asset-sources/trainers-v5-SOURCES.md).
- **Forest:** FireRed tiles/palettes in a new layout with grass, paths, trees,
  cabin, signs and animated flowers. [Sources](docs/asset-sources/forest-PROVENANCE.md).
- **Font:** local Silkscreen Regular, SIL OFL 1.1.
  [Source](docs/asset-sources/fonts-SOURCE.md), [license](public/art/fonts/OFL.txt).

The old 18 Black/White animations in `public/art/pokemon/` are historical local
material excluded from the developer export. The active world uses eight-direction atlases.

## Combat effects and interface

Original six-phase pixel effects represent all 15 types: leaves, fire, water,
lightning, ice, fighting, poison, earth, wind, psychic, bug, rock, ghost, dragon
energy and Normal. Additional effects include areas, trails, damage numbers,
healing, ball throws, evolution and rotating XP crystals. These are code-drawn
effects, not extracted move videos.

At most 180 short-lived effects, bounded damage labels and offscreen culling.
Reduced particles retain boss warnings. Rendering consumes no simulation random
numbers and is not saved. Light dialogs, type colors, ranks and before/after
values remain readable. HUD health/team/XP/map scale from 70–150%; menus retain
their normal readable size. Since rc.6.5, labels follow English/German selection.

## Sound

- **151 classic cries:** local Ogg from [pinned PokeAPI/cries](https://github.com/PokeAPI/cries/tree/b3a9044bb839b5e3152aaa536c7b463a0fcf0140).
  IDs, containers and individual hashes checked; approximately 917 KB.
  [Provenance](docs/asset-sources/cries-PROVENANCE.md),
  [importer](scripts/import-gen1-cries.mjs).
- **New effects:** original layered pulse/triangle/noise synthesis, pitch curves
  and short melodies for 15 attack types, steps, dash, damage, capture, level,
  evolution, rewards, bosses and results. References:
  `public/audio/SYNTHESIS-REFERENCES.md`. These are not original game recordings.
- Volume/mute share a limited output bus. Simultaneous voices and attack sound
  frequency are bounded. Cries load/play after user interaction.

Pokémon characters and source artwork belong to their respective rights holders.
Provenance does not grant additional redistribution rights.

## Additions in 0.4

- `pokemon-size.ts`: measured visible alpha bounds, maximum common footprint
  of 36 world pixels for ordinary Pokémon; evolution adds no scale. Boss factor 1.9.
- `boss-art.ts`: animated thorns, charging Solar Beam with moving core/particles,
  pollen rings and spores; danger boundaries survive reduced effects.
- `weapon-art.ts`: chains, beams, slashes, cones, charges, orbiting leaves/flames/
  rocks, traps and fields. Bonemerang is a rotating bone, Pay Day a coin, Egg Bomb
  marked eggs.
- XP crystals scaled from at least 0.42 to 0.57; coins from 10×12 to 13×16 world pixels.
- Full 151-card searchable/filterable Pokédex, eight-rank paths, quest treasures,
  securing rings, map markers and reward sparks.
- New effects use project Canvas/Phaser geometry; no new external art/audio downloads.

## Additions in 0.6

- Twelve complete transparent Kanto building sprites matching the landscape.
  Generated images with cleaned palettes, integer sizes and ground/door anchors.
  [Provenance](docs/asset-sources/kanto-v6-SOURCES.md). Local evidence:
  `public/art/kanto-v6/contact-sheet.png`, `metadata.json`, `validation.json`.
- All twelve PNGs have true transparency, clear margins, nonempty content and
  dimensions matching metadata. Rendering and collisions share foundation data.
- All six trainer anchors use the actual lowest visible pixel row, consistently
  for standing/dashing, with ground shadows directly below.
- Potion/Ether bottles, Pokémon XP bars, unlock tiles and location notices.
  Bottles are original Phaser geometry, not imported item sprites.

Historical QA evidence named here is not necessarily included in the public
snapshot; runtime assets and available editing sources are explicitly listed
in the release manifests.
