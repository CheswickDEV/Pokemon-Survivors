# Auenwald — forest artwork provenance

These are **not newly drawn original graphics by this project**. They are
mechanically decoded from published Pokémon FireRed graphics in
[pret/pokefirered](https://github.com/pret/pokefirered).
Original game graphics: Pokémon / Nintendo / GAME FREAK / Creatures.
Public repository availability is not independent permission to redistribute
its game artwork. This development project claims no ownership and provides
no redistribution clearance or legal assessment.

Pinned revision: **037335f4c725d7c9aecdac87066f2002b4bd7e14**, retrieved
October 19, 2026.

## Original files

- [General outdoor tileset](https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/data/tilesets/primary/general):
  `tiles.png`, `metatiles.bin`, `metatile_attributes.bin`, palettes `00.pal`–`15.pal`.
- [Flower animation](https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/data/tilesets/primary/general/anim/flower):
  frames `0.png`–`4.png`, palette 00.
- [Water animation](https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/data/tilesets/primary/general/anim/water_current_landwatersedge):
  frames `0.png`–`7.png`.
- [Animation mapping](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/tileset_anims.c):
  water replaces tiles 416–463, flowers 508–511; one frame per 16 video frames.
- [Boulder](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/graphics/object_events/pics/misc/strength_boulder.png)
  with [npc_white.pal](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/graphics/object_events/palettes/npc_white.pal).
  Mapping: `src/data/object_events/object_event_graphics_info.h`,
  `gObjectEventGraphicsInfo_StrengthBoulder`.

Only these bounded graphics/metadata inputs were downloaded. No upstream
program code was executed.

## Mechanical processing

`decode_source.py` reads original PNG palette indices and JASC palettes.
Each metatile has eight 8×8 tiles in two layers; tile index, horizontal/vertical
flip and palette come from the 16-bit value. Index 0 stays transparent.
Some original PNGs appear grayscale; original palettes supply their game colors.

| Output | Source / layout | Size |
|---|---|---|
| `grass.png` | Metatiles 1, 8, 9, 16, 17, 1 | 96×16, six frames |
| `path.png` | 208–210 / 216–218 / 224–226 | 48×48, nine frames |
| `tree.png` | 14,15 / 30,31 / 38,39 | 32×48 |
| `sapling.png` | 19 / 35 | 16×32 |
| `bush.png` | 5 | 16×16 |
| `sign.png` | 3 | 16×16 |
| `cabin.png` | 44,45,45,47 / 52,53,54,55 / 60,61,62,63 | 64×48 |
| `flowers.png` | Five original animation frames, palette 00 | 80×16 |
| `water.png` | Metatile 465 with eight original tile replacements and its palette 06 | 128×16 |
| `rock.png` | Strength Boulder object, NPC White palette | 16×16 |

For freely placed trees, bushes, signs and buildings, grass background colors
in palette 00 (indices 8 and 12–15) become transparent. No redrawing, AI
generation or recoloring. The cabin combines original parts into a compact
4×3 grid. Tree/rock retain their original dark base/shadow.

`metatiles.png` and `*-proof.png` are inspection images. Runtime needs only
the small set above. `src/forest-art.ts` describes URLs, frame dimensions,
nine path segments and two animation loops. Everything runs locally/offline.
