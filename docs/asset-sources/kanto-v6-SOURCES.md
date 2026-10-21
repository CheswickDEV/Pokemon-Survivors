# Kanto building artwork v6

Created on 2026-10-20 with the built-in `image_gen` tool. All twelve buildings are newly generated whole-building raster artwork for this project. They evoke the architecture and silhouettes of the first-generation Kanto setting in a richer colour pixel style; they are not extracted original Nintendo building sprites or a claim of exact tile-for-tile reproduction.

The existing `game/qa/v5-endless-forest.png` screenshot served as a palette, pixel-density and camera-direction reference. Its game scene, UI, trainer and trees were not pasted into these assets. The first generated red house served as the second style reference for the other eleven buildings. The screenshot's existing tree art retains its separate provenance in `../forest/PROVENANCE.md`.

## Deliverables

- Twelve individually loadable transparent PNG sprites named in `metadata.json`.
- `buildings-atlas.png` and `buildings-atlas.json`: equivalent packed Phaser-compatible atlas.
- `contact-sheet.png`: all twelve imported sprites at their intended world size.
- `generated/`: unchanged full-resolution ImageGen outputs.
- `prompts.json`: complete common-plus-subject prompts, built-in mode and source-output paths.
- `import-buildings.mjs`: reproducible deterministic import, without artwork redraw.

Import processing trims the transparent exterior, resizes with nearest-neighbour sampling, adds a two-pixel transparent border and packs the atlas. The alpha channel is preserved. No wall, roof, entrance or other part is assembled from fragments of another building.

## Integration

Each individual PNG is ready to render at scale 1 with origin `(0.5, 1)`. Width and height include the transparent border. `door`, `interact` and `footprint` are world-pixel offsets relative to that bottom-centre anchor. The door is two pixels above the origin; the interaction point is 24 pixels in front of the building.

The recommended footprint covers the solid ground mass, not the entire sprite silhouette. The roof and upper floors should occlude a character walking behind the building through depth sorting. A physics integration can expand this rectangle by actor radius or use rounded corners. The artwork metadata itself does not implement collision or claim gameplay-path validation.

Suggested uses: `house-red` and `house-blue` for homes, `oak-lab` for Pallet Town's laboratory, `pokemon-center` for healing, `mart` for shops, `gym` for gyms, `department-store` for Celadon, `silph-office` for Saffron, `lavender-tower` for the memorial tower, `mansion` for Cinnabar, `league` for Indigo Plateau, `cave` for mountain entrances.

## Validation

The imported contact sheet was visually inspected for complete silhouettes, consistent palette, readable entrances, transparent margins and a clean common baseline. `validation.json` records all twelve assets' dimensions, transparent border checks and source/output hashes.
