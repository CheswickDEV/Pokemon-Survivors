# Shiny Pokémon motion assets

These are the published shiny variants of the first 151 Pokémon in
[PMDCollab/SpriteCollab](https://github.com/PMDCollab/SpriteCollab/tree/0d0eb9d415a3f648c0df49de72a24a6d46ce3fab),
pinned to `0d0eb9d415a3f648c0df49de72a24a6d46ce3fab`, the same revision as the normal animation set.
Each species uses the upstream base-form shiny folder `sprite/NNNN/0000/0001`.
The import retains all eight supplied directions for walking, idle and attacks.

No hue filter or invented recolor is applied. The project-local importer crops
transparent margins and repacks source frames using their supplied shadow/ground
anchors. It verifies the exact RGBA bytes of every retained source frame. Timing,
direction order and hit frames come directly from the corresponding upstream XML.
The portrait is the visible crop of the first supplied idle frame.

`manifest.json` records exact source URLs and SHA-256 hashes for animation sheets,
shadow markers, XML, credits and output assets. `validation.json` records coverage,
pixel-preservation checks, animation directions and comparison to normal sheets.
The shiny metadata is independent so any upstream geometry difference remains
represented rather than being forced into the normal sprite dimensions.
Diglett (#050) and Dugtrio (#051) have identical normal and shiny walking sheets:
these upstream burrowing animations show moving earth. Their idle and attack
animations and portraits retain their distinct supplied shiny coloration.

The import script is `scripts/import-shiny-motion.py`. It downloads data only,
never upstream executable code. Original inputs are cached under `.asset-cache`.

## Credits and usage

Per-species `credits.txt`, `credit_names.txt`, `LICENSE.md` and `UPSTREAM-README.md`
are retained verbatim. These third-party Pokémon assets are excluded from the
project code's GPL-3.0-only license. Their inclusion in the local test build does
not change the existing public-release asset clearance requirement.
