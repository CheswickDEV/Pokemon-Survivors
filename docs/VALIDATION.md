# Historical release-candidate validation

Recorded version **1.0.0-rc.4**: type check, production build and **128 tests**
passed. All 58 rooms, NPC paths and the new Center rule were checked in
[INTERIORS-AND-CARE.md](INTERIORS-AND-CARE.md). Removing Center trainer healing
invalidated earlier campaign-success claims as evidence for the new rules.

Previous **rc.3** simulations, Shiny checks and browser evidence:
[WORLD-POLISH.md](WORLD-POLISH.md). Fresh code export passed 114 media-independent
tests and build. Windows package used its runtime; 1,443 media files passed
HTTP/hash checks, as did all manifest entries.

## rc.2 package and balance record

Date: October 20, 2026. Raw evidence remains local under `qa/`.

| Check | Result / limit |
|---|---|
| Type check/build | Passed; large Phaser/game bundle warning is not a build failure |
| Full suite | 111 tests passed, including media, world paths, interiors, evolution, saves, bosses and server |
| Fresh code export | Separate dependency installation, type check, 101 media-independent tests and build passed |
| Integrity | ZIP CRC and manifest SHA-256 checked |
| Windows launcher | Path with spaces; bundled runtime with PATH restricted to Windows system folders; no global Node |
| Second launch | Recognized running server and exited successfully; no extra server or unrelated process terminated |
| Runtime | Official Node 22.23.3 x64 ZIP matched pinned/official SHA-256; unchanged executable had valid OpenJS Authenticode signature |
| Offline media | All 839 expected image/audio/font files returned HTTP 200 with matching hashes |
| Browser | rc.2 forest/Kanto/interior maps and import; rc.1 mode selection, boss rush, journal and backup; no captured warnings/errors |
| Backup | Actual browser export included profile and all three slots; restored boss slot retained Veteran difficulty |
| Boss rendering | 15 profiles in a separate gallery using actual rendering; phases/reduced effects without console errors |
| Dodgeability | Reachable safe spots found for 15 profiles × three Master phases in tested setups; not proof for all edges/overlaps |
| Kanto simulation | All 27 stages with three starters; travel skipped, ordinary fight rules and then-current Center use |
| Boss Rush | Relaxed/Standard/Veteran 3/3 each; Master 0/3, ending after 12/10/7 trials |
| Standard forest | Learning 15/15, Expedition 13/15; all starters won both. 66 total runs including harder levels and 12 controls; see [forest balance](FOREST-BALANCE.md) |
| RPG map | Actual generated paths, objects and buildings; geometry and visual checks |
| Dependencies | No known npm advisories at check time; not a general security guarantee |
| Public package gate | Refused uncleared full releases; local/code exports remained available |

The rc.2 forest agent was improved to use actual hitboxes, targeted captures,
quest steps, shops and active training without extra resources. Earlier poor
win rates therefore are not a clean before/after balance comparison.
Remaining failures are documented, not excluded.

## Outstanding acceptance

Portable tests used the existing Windows machine with restricted PATH, not a
fresh VM. Another computer, longer human expeditions, a continuous Kanto journey
and weaker hardware remain outstanding. All 151 species were structurally
checked, not every team/item/difficulty combination fully played.

No additional project installer was signed; the official runtime's valid
signature does not sign the ZIP. Media permissions remain separate.
