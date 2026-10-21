# Original overworld and Kanto atlas graphics

These are original **Pokémon FireRed / LeafGreen** graphics, reconstructed from
[pret/pokefirered](https://github.com/pret/pokefirered/tree/ce6406d8c2eaf46d543c8a2606de0c3cb1951982)
at commit `ce6406d8c2eaf46d543c8a2606de0c3cb1951982`. No replacement pixels were drawn.

| Asset | Original source | Conversion |
|---|---|---|
| `worker-frlg.png` | `graphics/object_events/pics/people/worker_m.png` | First 16×32 front-facing frame; original colors and alpha. |
| `worker-frlg-sheet.png` | Same | Full original 160×32 sheet. The original pic table uses frames 0–8, each 16×32. |
| `fence-frlg-horizontal.png` | `data/tilesets/primary/general/metatiles.bin`, metatile `0x0E7` | Original upper layer, original palette; 16×16. Same fence is used on Vermilion City's northern boundary. |
| `fence-frlg-vertical.png` | Same, `0x0F4` | Original vertical fence upper layer; 16×16. |
| `fence-frlg-corner-*.png` | Same, `0x0EE`, `0x0EF`, `0x0F6`, `0x0F7` | Matching original joining/end tiles; 16×16. |
| `kanto-region-map.png` | `graphics/region_map/region_map.png`, `region_map.pal`, `kanto.bin` | Original 30×20 GBA tilemap, 8×8 tiles, palettes and horizontal/vertical flip flags; 240×160. |
| `kanto-region-map-cropped.png` | Same | Exact crop `(24,16,192,144)` removes the black screen surround; 192×144. |

`metadata.json` records every downloaded source URL, pinned commit and SHA-256, plus
the SHA-256 and alpha bounds of every reconstructed PNG. `import-assets.mjs`
reproduces the outputs from the cached source files or the pinned upstream files.
The rendering references and catalogues are QA materials, not runtime assets.

## Integration

- Use nearest-neighbor filtering and integer world scales for the worker and fence.
  A scale of 2 gives a 32×64 worker and 32×32 fence tiles.
- Worker origin: `(0.5, 1)`. A static front-facing frame is available separately.
- Horizontal fence origin: `(0.5, 1)`, repeated every 16 source pixels.
  Its visible bounds are in the metadata.
- Vertical fence occupies only the left side of its source metatile. To center its
  visible posts over a collision line, use horizontal origin `5 / 16` (not `0.5`).
  Repeat vertically at 16 source pixels.
- Fence files contain **only the original object layer**, so they do not replace
  the project's existing grass with mismatched green squares.
- The regional atlas is an original schematic **Town Map**, not a terrain or
  collision map. Use its original markers for the regional atlas/travel journal;
  retain actual world geometry in the live local minimap.
- GBA background palette index 0 is exported as transparent. This includes the
  blank lower-right area originally occupied by the region-switch UI. Draw the
  image over the atlas panel backdrop; do not interpret that area as land.

## Exact atlas positions

`kanto-map-points.json` is parsed from
[`src/data/region_map/region_map_layout_kanto.h`](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/src/data/region_map/region_map_layout_kanto.h).
It includes all 49 map/dungeon section IDs, their exact raster cells, and a center
chosen from an actual occupied cell. The `center.cropX` and `center.cropY` values
refer directly to the 192×144 cropped PNG.

The original cursor transform is `pixelX = 36 + 8 * gridX`,
`pixelY = 36 + 8 * gridY`, verified in `src/region_map.c`.
For the cropped image it is `cropX = 12 + 8 * gridX`,
`cropY = 20 + 8 * gridY`.

Do not use the `(0,0)` positions of dungeon entries in
`region_map_sections.json`: those are placeholders. The original dungeon-layer
grid supplies their real positions.

Silph Co., the Rocket hideout and Bill's house do not have separate original
markers in the Kanto layout. Using their parent city/route marker is a project
adaptation and should not be described as an original map position.

## Edition identification

The user's Saphir recollection was tentative. Ruby/Sapphire's Route 116 tunnel
digger actually uses `OBJ_EVENT_GFX_BLACK_BELT`, rather than a yellow hardhat
worker. This is verified in [Route116/map.json](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route116/map.json)
and its tunnel-worker dialogue. The supplied hardhat worker is the original
FR/LG `WorkerM`; its graphics info names `OBJ_EVENT_PAL_TAG_NPC_WHITE`.
The original FR/LG fence is a white post fence, not a newly invented yellow/black
traffic barricade.

## Rights

Pokémon graphics remain third-party Nintendo / Game Freak / Creatures material.
The project's GPL-3.0 code license does not license these graphics. These assets
are for the existing local-only package; this source/provenance record does not
grant redistribution rights or authorize publication.
