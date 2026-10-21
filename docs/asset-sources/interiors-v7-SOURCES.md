# Kanto interior assets — version 7

These local development assets are converted from the `pret/pokefirered`
decompilation repository, pinned to commit
`ce6406d8c2eaf46d543c8a2606de0c3cb1951982`.

Source repository:
https://github.com/pret/pokefirered/tree/ce6406d8c2eaf46d543c8a2606de0c3cb1951982

The repository identifies itself as a decompilation of English Pokémon FireRed
and LeafGreen. These graphics originate in those commercial games. Public
availability in the decompilation repository is not a grant of a permissive
artwork licence. This import does not claim that the graphics are original,
public domain or cleared for redistribution. No external publication was made.

## Exact provenance

`metadata.json` records the pinned source URL and SHA-256 of each downloaded
source. The raw downloaded data is retained in `source/`.

- `npc-*.png`: the first 16×32 south-facing frame from
  `graphics/object_events/pics/people/*.png`; alpha and original pixel colours
  are preserved. NPCs have static standing frames, not invented idle frames.
- `prop-*.png`: foreground metatile layers reconstructed from the original
  Building primary tileset and the relevant secondary tileset, using the source
  tile palette indices, flips and palettes. Each prop records the source room
  and rectangle in 16-pixel map cells.
- `tile-*.png`: original composite 16×16 floor/wall metatiles, reconstructed with
  their original palettes. These are opaque room surfaces.
- `room-reference-*.png`: six complete source room layouts, retained as visual
  references. They are not automatically integrated as the playable rooms.
- `catalogue-*.png`: numbered reconstructed metatile reference sheets.
- `contact-sheet.png`: visual QA sheet of the 44 imported NPC, prop and tile assets.

`import-assets.mjs` performs deterministic asset conversion and extraction.
It uses the already installed `sharp` library only during import. There is no
game-runtime dependency, ROM execution or generated substitute artwork.

## Integration

NPC files are 16×32 with bottom-centre ground anchor `(8, 32)`.
Render with nearest-neighbour filtering around 2–2.2×. Props use bottom-centre
anchors and normally 2×. Exact dimensions and suggested scales are recorded in
`metadata.json`. Tile files are 16×16, normally repeated at 2×.

Each furniture prop additionally records a `footprint` rectangle and
`solidBaseHeight`, in source pixels relative to the bottom-centre anchor. These
are authored collision suggestions for this project, not the original game's
movement flags. Multiply all footprint coordinates and sizes by the rendering
scale. They deliberately cover furniture bases rather than tall visual tops.

Healing station, shelves and furniture retain the complete original foreground
metatile cell rectangle; some cells contain transparent margins. The healing
station includes the full red Center counter and machine.

## Complete Center reception correction (rc.6.1)

The runtime now uses `prop-center-reception.png`: the full two-layer composite
of original PokemonCenter_1F map cells `[4, 0, 7, 4]` (112 x 64 pixels), including
rear wall, screen, work floor, machine bases and counter. It exactly matches the
corresponding source-room rectangle. The earlier foreground-only healing station
is retained as an import reference but is no longer shipped as the runtime counter.
The renderer places the final 16-pixel counter row in front of the nurse.
No source pixels were repainted or generated.
