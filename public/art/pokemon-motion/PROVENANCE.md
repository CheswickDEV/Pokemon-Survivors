# Pokémon movement artwork

This directory contains the normal-form sprites for National Pokédex numbers 001
through 151 from [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab),
pinned to commit **0d0eb9d415a3f648c0df49de72a24a6d46ce3fab**.

Each species has its own original `Walk`, `Idle`, and `Attack` animation. No species
uses another Pokémon's artwork. Where upstream uses `CopyOf`, the importer follows
that species' own named action; the resolved name is recorded as `sourceAction`.
The original idle poses for Persian (#053) and Arcanine (#059) have one frame per
direction; their walking and attacking sequences are fully animated. Beedrill
(#015) and Dragonair (#148) use their own Walk animation as Idle, as specified by
the source XML. These are source-defined behaviors, not missing-asset substitutes.
All source sheets, XML data, credits and output hashes are listed in
[manifest.json](manifest.json). [validation.json](validation.json) records the
completed frame, direction and image-dimension checks.

## Attribution

Original Pokémon Mystery Dungeon art is attributed in the upstream credit files
to **CHUNSOFT**; additional contributors are recorded verbatim in each species'
`credits.txt`. The upstream contributor registry is included as
[credit_names.txt](credit_names.txt). Pokémon characters and original game artwork
belong to their respective rights holders, including Nintendo, Creatures,
GAME FREAK and the credited game developers. This is not original Auenwald artwork.

The repository supplies [LICENSE.md](LICENSE.md), CC BY-NC 4.0, and distinguishes
official sprites from contributed work in [UPSTREAM-README.md](UPSTREAM-README.md).
These records are retained without treating the repository license as a new grant
of ownership over the underlying Pokémon characters.

## Mechanical processing

Run `python scripts/import-pokemon-motion.py` from the game directory with Pillow
installed. The importer downloads only PNG, XML and text data from the pinned
revision. It does not download or execute upstream programs.

1. Parse each species' own `AnimData.xml`, including action aliases and durations.
2. Read that action's `*-Anim.png` and `*-Shadow.png`.
3. Translate each unmodified RGBA frame so its white shadow-center marker becomes
   the consistent ground anchor; pack the frames into a transparent atlas.
4. Preserve all visible source pixels exactly. Every output frame is compared
   byte-for-byte with its source region during import.
5. Extract `portrait.png` from the south-facing idle pose with transparent margins
   cropped. No color changes, painting, smoothing, interpolation or AI generation.

Source PNG data is cached outside the shipped directory under `.asset-cache`.
The game uses only local files and needs no asset-network access after startup.

## Playback

Frames progress across columns. Direction rows are **down, down-right, right,
up-right, up, up-left, left, down-left**. `directions` in the TypeScript catalog maps
each named direction to its row number. The atlas frame index is
`row * columns + temporalFrame`.

Source duration units are 1/60 second, as specified in the upstream
[sprite format guide](https://docs.google.com/document/d/1EceEEjyeoFwoKXdNj4vpXdoYRWp8CID64e-ZqY954_Q).
The catalog converts these into milliseconds. Attack `hitFrame` identifies the
source impact pose. `originX` and `originY` must be applied per action when changing
texture; the normalized frame dimensions vary between actions.

The default world scale is 1.5 source pixels per world unit. Small species remain
smaller than the trainer while larger species retain their source size differences.
Use nearest-neighbor sampling for pixel edges. Movement animation should advance
only while moving, and its direction should follow actual displacement.
