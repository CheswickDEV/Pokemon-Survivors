# Validation 0.8.0 — Kanto world, minimap and interiors

Historical report; later versions supersede these version-specific results.

## Automated checks

**96 tests passed**, no failures; TypeScript/production build passed. The known
large Phaser bundle warning remained. Local logs: `qa/v8-tests-final.txt`,
`qa/v8-build.txt`.

- All **58 doors** connect to the road network. Centerlines avoid foundations
  and stay walkable; drawn transitions are checked too.
- All **57 connections** have continuous unlocked centerlines and broad shoulders.
  Coastal paths remain land or wooden deck.
- Every generated barrier covers its opening without a collision gap, blocks
  walking/dashing and opens with its required travel item.
- Access checks cover **27 story stages**, completed content, unused houses and
  unclaimed loot.
- Room furniture, NPC approaches, exits and save round-trips checked. Old saves
  inside now-closed buildings can still leave.
- Background time advances without held input, pauses for decisions and bounds
  catch-up after suspension.
- Existing species/evolution/campaign/save/capture/collision/dash/healing regressions pass.

## Visual and gameplay checks

Separate port **4175**, normal menus/movement/import; user saves on **4173**
were not replaced.

All **51 locations** were compared in shared terrain/minimap views:
`qa/v8-atlas-1.png` (towns), `-2.png` (Routes 2–13), `-3.png` (Routes 14–25),
`-4.png` (dungeons/final destinations). The local review page
`qa/v8-world-review.html` is not in production.

Pallet paths/foundations and minimap direction/objective were checked
(`qa/v8-alabastia.png`). A house without an active task showed its then-current
closure reason (`qa/v8-closed-house.png`). Viridian's northern barrier visibly
spanned both wooded edges (`qa/v8-gate.png`). Entered a Mart with E, walked to
the clerk and opened shopping; checked warm tiles and minimap
(`qa/v8-market.png`). Room edges/baseboards/exits: `qa/v8-market-room.png`,
`qa/v8-center-room.png`, `qa/v8-arena-room.png`.

Focus switch: **00:56 → 01:35** over approximately 39 real seconds, without
a pause dialog (`qa/v8-focus.json`). Esc still pauses.

No warnings/errors in the game browser log. The separate review page initially
produced a framebuffer error when hiding its 3D canvas; it was changed to pause
and move the canvas without resizing. All 51 views were regenerated without
new browser errors (`qa/v8-world-review-fixed.json`, `qa/v8-browser-log.json`).

## Package and limits

The production build was loaded separately and resumed a saved Mart interior.
Its browser log had no warnings/errors (`qa/v8-production-browser-log.json`).
At that check, port 4173 served 0.8.0: **59** HTML/JS/CSS/interior files returned
HTTP 200 with identical bytes (`qa/v8-http.json`).

This covers defined geometry and location overviews, not another manual
27-stage campaign. Kanto remains a compressed adaptation. Browsers/OSes can
throttle or suspend background execution; the game itself does not pause on
focus loss. Catch-up is at most two seconds per background tick.

Earlier `qa/v7-*` evidence remains local. Named QA images/logs are not included
in the public snapshot.
