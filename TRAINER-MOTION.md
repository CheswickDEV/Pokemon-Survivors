# Trainer movement 0.5.0

All six characters (Red, Leaf, Ethan, Kris, Brendan and May) use complete,
newly generated pixel-art figures in eight directions. Frames are not assembled
from front/side strips. Cardinal views were also recreated for consistent
detail while turning. Entire left-facing poses mirror entire right-facing poses.

Each `public/art/trainers-v5/*-complete.png` atlas has 9 × 8 cells of 64 pixels:
one idle pose and eight temporal phases. Each direction has six to eight
distinct walking poses. All 432 cells were checked for transparency, ground
height and distinct poses. Character height stays stable through turns;
existing display scales remain.

Cadence follows distance: two steps per roughly 0.857 seconds at normal speed,
at least 0.72 seconds during a dash. Turns retain phase. The last frame persists
between simulation steps; 120/144 Hz screens do not insert extra idle frames.
Pause freezes the pose; stopping briefly settles. Footsteps sound only on foot
contact while moving.

These figures are generated fan art, not additional official original sprites.
Prompts, unchanged outputs and import metadata are in
[SOURCES.md](docs/asset-sources/trainers-v5-SOURCES.md).
The reproducible importer is `scripts/import-trainer-diagonals.py`.
Earlier original graphics remain as menu icons and the ranger sprite.

`tests/trainer-motion.test.ts` checks cadence, eight directions, time gaps and
foot contacts. Local-only evidence includes `qa/trainer-complete-v5.png`
(eight directions per trainer) and `qa/trainer-complete-v5.gif` (all cycles).
The browser loads the complete atlases directly; the old projection generator
is no longer used. These local QA images are not part of the public snapshot.
