# Trainer diagonal artwork — 2026-10-20

These are newly generated fan-game sprites of Red, Leaf, Ethan, Kris, Brendan and May. They are not official Pokémon sprites and are not reconstructed from front/side body strips.

## Generation

- Tool: the built-in `image_gen` tool, with transparent background enabled.
- Inputs: the six unchanged original cardinal-direction sheets in `../trainers/`. Original provenance is documented in `../trainers/SOURCES.md`.
- Exact prompts and generated file origins: `prompts.json`.
- Unmodified generated sheets: `generated/<trainer>.png`.
- Each diagonal pose is one complete drawing with its own head, torso, limbs and perspective. Northeast and southeast were generated independently within each trainer sheet.
- Northwest and southwest are horizontal mirrors of the complete corresponding east-facing drawings, a normal directional sprite convention. No parts of different drawings are combined.

## Reproducible packing

Run `python scripts/import-trainer-diagonals.py` from the game folder with Pillow available. Packing only finds complete poses by their alpha gaps, crops, applies one shared nearest-neighbor scale per trainer, aligns their head center and grounded foot baseline, mirrors full images, and places complete poses into cells. It does not paint new details or synthesize body parts.

Each final `<trainer>-diagonals.png` is **576 × 512**, a **9 × 8** grid of **64 × 64** cells. Direction row order matches `TRAINER_DIRECTIONS`: down, southeast, right, northeast, up, northwest, left, southwest. Only the four diagonal rows contain pixels; original cardinal directions remain untouched. Column 0 holds a compact-foot resting pose and columns 1–8 hold the walking cycle.

Five trainers have eight distinct walk poses for each generated view. Ethan's northeast view contains six distinct poses, distributed over eight timing phases; every other east-facing cycle has eight distinct poses. Left-facing cycles mirror those same complete poses. Individual normalization, source crop boxes, selected poses, bounds, and final SHA-256 values are in `metadata.json`.

## Verification

- All six generated sheets were visually inspected before integration.
- All **216** nonempty diagonal atlas cells are checked for a consistent foot baseline and valid bounds by the importer.
- Every walking direction has at least six distinct whole-character poses.
- Original cardinal sprite sheets and portrait files are unchanged.
- Static comparison: `qa/trainer-diagonals-v5.png` (original front view followed by southeast walk cycle).
- Animation comparison: `qa/trainer-diagonals-v5.gif` (six trainers, all four diagonals, approximately 0.864 seconds per cycle).

These files address the diagonal art itself. Final game rendering, cadence, directional selection and production browser verification are handled by the main implementation.

## Complete eight-direction replacement atlases

The initial diagonal-only overlays exposed a different detail level from the older cardinal art, especially the original Crystal sprites. A second ImageGen pass therefore created matching **front, back and right-profile** walk cycles for all six trainers, using each newly generated diagonal sheet as the visual reference. The complete new right-profile poses are mirrored as whole images for the left-facing direction.

- Preferred runtime files: `<trainer>-complete.png`, each **576 × 512**, same **9 × 8** layout.
- Every direction now comes from new complete character drawings; old cardinal art is used solely as the size and foot-baseline reference.
- Supplemental source drawings: `generated/<trainer>-cardinal.png`.
- Exact supplemental prompt and source output paths: `cardinal-prompts.json`.
- Complete atlas metadata and SHA-256: `complete-metadata.json`.
- Exported runtime paths: `TRAINER_COMPLETE_SHEETS` in `src/trainer-art-v5.ts`.
- Cardinal cycles have six unique source poses distributed over eight timing phases. Diagonal cycles retain their six to eight unique poses.
- A few complete front/back drawings of Kris and May were horizontally mirrored during packing to keep asymmetric hats in the same orientation throughout the cycle. These are full-image mirrors, not edits of body parts.
- The same importer produces both the original diagonal overlays and the complete atlases when all supplemental sheets are present.
- **432 complete atlas cells** and **48 direction cycles** pass the importer checks. All cells share the appropriate trainer's grounded baseline.
- Complete visual proof: `qa/trainer-complete-v5.png` and the animated `qa/trainer-complete-v5.gif`.

The complete atlases supersede the diagonal-only overlays for runtime rendering. Original cardinal source files and portraits remain unchanged on disk for provenance and compatibility.
