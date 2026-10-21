# Trainer sprites — source and frame map

Prepared 2026-10-19 for the local Auenwald prototype. These are source-game Pokémon graphics, **not original Auenwald art**. Pokémon and the original character artwork belong to their respective rights holders (Nintendo / Game Freak / Creatures). The public pret repositories provide the reference files; this provenance record does not grant a separate artwork license. GitHub's repository metadata reported no SPDX license for the three repositories on this date. No repository programs or ROMs were downloaded or executed, and no game installation was modified.

Only local PNGs are requested by the game at runtime. `sources/` retains the downloaded source images and reference data; `sha256.json` records input and output hashes. `normalize.py` is a mechanical, offline build step, not a runtime dependency.

## Exact sources

| Selection | First character generation | Source sprite | Pinned source |
|---|---|---|---|
| Rot / Red | I, Kanto | FireRed/LeafGreen Red | [red_normal.png](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/graphics/object_events/pics/people/red_normal.png) |
| Blatt / Leaf | III, Kanto | FireRed/LeafGreen female protagonist (`green`) | [green_normal.png](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/graphics/object_events/pics/people/green_normal.png) |
| Klarin / Gold / Ethan | II, Johto | Crystal male protagonist (`chris`) | [chris.png](https://github.com/pret/pokecrystal/blob/97187cd21b15e9a266a786318c851848f2fac24b/gfx/sprites/chris.png) |
| Kris | II, Johto | Crystal female protagonist | [kris.png](https://github.com/pret/pokecrystal/blob/97187cd21b15e9a266a786318c851848f2fac24b/gfx/sprites/kris.png) |
| Brix / Brendan | III, Hoenn | Emerald male protagonist | [walking.png](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/graphics/object_events/pics/people/brendan/walking.png) |
| Maike / May | III, Hoenn | Emerald female protagonist | [walking.png](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/graphics/object_events/pics/people/may/walking.png) |

Red's metadata refers to his Generation I identity; his selected sprite is from the Generation III remake. Leaf is explicitly Generation III. Klarin names the male Johto protagonist in the German UI; the Crystal repository calls him Chris, and this is his original Crystal graphic, not a later remake graphic.

## Normalized output

Each `<id>.png` is **384 × 32 pixels**, one horizontal row of **12 frames of 32 × 32 pixels**. No spacing or margins. Each `<id>-portrait.png` is the first, down-facing, idle frame at 32 × 32. Transparent pixels have alpha zero. Use nearest-neighbor rendering.

| Direction | Output idle | Output step A | Output step B | Walk cycle (8 frames/second) |
|---|---:|---:|---:|---|
| down | 0 | 1 | 2 | 0, 1, 0, 2 |
| up | 3 | 4 | 5 | 3, 4, 3, 5 |
| left | 6 | 7 | 8 | 6, 7, 6, 8 |
| right | 9 | 10 | 11 | 9, 10, 9, 11 |

The renderer should stop on the first frame for the facing direction while stationary. Frame rectangle is `(index × 32, 0, 32, 32)`.

### FireRed / Emerald source layout

The original sources are 144 × 32, containing nine 16 × 32 frames. Source rectangle is `(index × 16, 0, 16, 32)`. They are centered horizontally in a transparent 32 × 32 cell, without resampling. Palette index 0 is the transparent object-event color. All other source palette colors are unchanged.

| Direction | Source indices for idle, step A, step B |
|---|---|
| down | 0, 3, 4 |
| up | 1, 5, 6 |
| left | 2, 7, 8 |
| right | horizontally mirror 2, 7, 8 |

Animation mapping follows [FireRed object event animation data](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/data/object_events/object_event_anims.h), `sAnim_FaceSouth` and `sAnim_GoSouth` through east equivalents. Mirroring right-facing frames matches the original engine behavior.

### Crystal source layout and palette

The original sources are 16 × 96, containing six vertical 16 × 16 frames. Source rectangle is `(0, index × 16, 16, 16)`. Frames are enlarged exactly 2× with nearest-neighbor sampling to 32 × 32; no new pixels are drawn. This preserves the coarser Generation II sprite style.

| Direction | Source frames |
|---|---|
| down | idle 0; step 3; horizontally mirrored step 3 |
| up | idle 1; step 4; horizontally mirrored step 4 |
| left | idle 2; step 5; step 5 |
| right | horizontally mirror idle 2; step 5; step 5 |

Crystal's side animation intentionally has two unique poses; the repeated side steps match [the original facing table](https://github.com/pret/pokecrystal/blob/97187cd21b15e9a266a786318c851848f2fac24b/data/sprites/facings.asm).

The grayscale source stores four 2bpp palette indices. The grayscale value 255 becomes transparent; 170 receives color 1, 85 color 2, and 0 color 3 from the **day** overworld palette. Five-bit RGB channels convert to eight-bit using `round(channel × 255 / 31)`. The original [sprite table](https://github.com/pret/pokecrystal/blob/97187cd21b15e9a266a786318c851848f2fac24b/data/sprites/sprites.asm) selects `PAL_OW_RED` for Chris and `PAL_OW_BLUE` for Kris. Values come from [npc_sprites.pal](https://github.com/pret/pokecrystal/blob/97187cd21b15e9a266a786318c851848f2fac24b/gfx/overworld/npc_sprites.pal):

- Chris: skin `(31,19,10)`, red `(31,7,1)`, black `(0,0,0)` in RGB5.
- Kris: skin `(31,19,10)`, blue `(10,9,31)`, black `(0,0,0)` in RGB5.

## Verification

All six downloaded images and the resulting contact sheet were visually inspected. Output frames preserve alpha transparency, remain within 32 × 32 bounds, and include all four directions. Right-facing frames are pixel-exact mirrors of the left-facing frames. File dimensions, portraits, and frame mappings are checked by the generation/validation step. The single-row contact sheet is a QA artifact, not used by the game.
