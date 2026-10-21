# Changelog

## 1.0.0-rc.6.5 — Windows player addition

- Ready-to-play Windows x64 ZIP added to the existing prerelease, with the runtime included.
- Graphical double-click launcher opens the browser and offers Open game / Stop game without a terminal.
- Launcher stops only its own server; duplicate launches and occupied ports preserve other processes.
- Exact launcher/game source, build scripts, checksums and instructions accompany the Windows package.
- Original rc.6.5 tag and developer download remain unchanged.

## 1.0.0-rc.6.5

- English by default, with a persistent English/German selector in camp and Settings.
- English Pokémon/move names, story dialogue, menus, combat labels and accessible text; bilingual Pokédex search.
- Existing saves retain their game IDs and progress. Full backups include language preferences.
- English README, installation/developer guides, historical reports, launch messages and GitHub text.
- English `Start game.cmd` launcher; legacy launcher names remain compatible.
- Regression tests for language defaults, legacy profiles, backups, dynamic messages and search.

## 1.0.0-rc.6.4

- Full developer download with current game media, available editing sources, tests and import tools.
- Portable graphic imports and sanitized private prompt paths; optional sharp tools with a separate lockfile.
- Developer guide, complete installation/local editing workflow and safe media-list updates.
- Developer-export tests; full-checkout CI runs every test.
- Original GPL code and third-party media rights clearly distinguished.

## 1.0.0-rc.6.3

- Security audit, explicit export allowlist and protection against private paths, caches and credential patterns.
- Ordinary builds include only verified runtime media, excluding prompts/import sources from the webroot.
- Invalid imported Pokémon IDs rejected; server, runtime download and GitHub CI hardened.
- README, installation help, dependency overview, security reporting and doctor script.
- Media permission and independent Windows/gameplay acceptance remain outstanding.

## 1.0.0-rc.6.2

- All 58 interiors inspected before/after using the running renderer:
  [visual audit](docs/INTERIOR-VISUAL-AUDIT.md).
- Shop, bike and hotel staff correctly occluded by counters; NPC foot anchors account for transparent margins.
- Rugs stop before furniture; bicycles leave the aisle clear. Room surfaces follow building function.
- Bordered Gym leader platforms; correctly clipped rock walls in caves.
- 152 tests passed, including all interior paths.

## 1.0.0-rc.6.1

- Complete original Center reception tiles with both layers, rear wall, screen, floor and machine base; RC6 foreground was still incomplete.
- Correct Center wall, Joy behind the counter, solid work area. Legacy positions relocate safely without changing HP/stamina.
- Healthy Pokémon hide floating stamina bars in peaceful interiors.
- 150 tests, pixel comparison and browser checks: [Center repair](docs/CENTER-REPAIR.md).

## 1.0.0-rc.6

- Distinct HP budgets/mechanics for all 27 Kanto stages; visible Master predictive attacks counter constant circling.
- Eight triggered/cooldown talents, three slots, higher-rarity replacement; new legendary offers are Time Fold, Phoenix Feather or Triad.
- Boss areas drain partner stamina only on accepted trainer hits; hit-free regeneration and shared dash/invulnerability protection.
- Reception layering/Joy adjustments and 58-room/88-NPC access checks; missing artwork later corrected in rc.6.1.
- Shared rest-point recovery for UI/campaign tests; coin loss and used rescue talents persist.
- 149 tests, three automated Master combat chains with ordinary retries, stationary/circle/talent controls:
  [RC6 validation](docs/RC6-VALIDATION.md).

## 1.0.0-rc.5

- Original FR/LG workers/fences and Kanto map with selection, wheel zoom and panning without rebuilding.
- Full-dash protection plus exit grace; diagonal trainer animations preserved, cardinal views normalized.
- Smaller circular trunk collisions; shared trees across world/collision/minimap; cached terrain with live markers.
- Badge level caps, +3% team damage and two percentage points of protection per badge; higher saved levels retained but combat-capped.
- Common/Rare/Epic/Legendary offers grant 1/2/3/4 ranks with previews (new legendary rules changed in RC6).
- Orbiting/attached attacks follow their partner; moving volleys originate there; visible travel to fields/traps.
- Multi-phase guardians, longer arena/Master battles, fixed-position impacts and staggered patterns; longer harder-mode boss timers.
- [RC5 validation](docs/RC5-VALIDATION.md).

## 1.0.0-rc.4

- Centers restore Pokémon stamina/end recovery only; trainer HP unchanged.
- Correct furniture bounds, consistent pixel scales and footprints in 58 interiors; aligned Center counters/NPCs/rugs.
- Fourteen named homes with appropriate residents/furniture, including Bike Shop, Hotel, School and Bill's Lab.
- 128 tests, full gallery and browser healing check. Campaign balance required revalidation after removing trainer healing:
  [Interiors](docs/INTERIORS-AND-CARE.md).

## 1.0.0-rc.3

- Continuous worker/fence route barriers; ordinary homes open, Gym prerequisites retained; extra door platforms removed.
- Bright grass, irregular blades, smooth actual-road contours and matching minimap.
- Existing enemies follow into towns; no new ambient town spawns. Trials keep current position; empty E is silent.
- Random offers with repetition protection, six added items, no guaranteed rank card; one signature move per partner.
- All 151 species have 1:65,536 Shiny variants with animations, capture, evolution, saves and starter unlocks.
- Clear focus brackets; improved wind/rock/beam/chain/cone/field/trail rendering and native attack timing.
- Larger tougher three-phase bosses, staggered attacks/reinforcements, eight late story leaders including Mewtwo.
- 125 tests: [World/combat validation](docs/WORLD-POLISH.md).

## 1.0.0-rc.2

- Wider/faster Squirtle beam, still straight and piercing.
- Pickup merging preserves local positions and total XP.
- Guaranteed training/chests preferred trainable active partners at this revision.
- Shared automatic elite/clearing cap; separate Weedle timer removed; harder-mode scaling retained.
- Special swarms respect speed settings; healing stays rare.
- RPG minimap shows actual paths/scenery/buildings/barriers/enemies/quests; interiors show props/NPCs.
- Large forest map uses real coordinates.
- 66 completed forest simulations plus campaign/boss/map regressions:
  [Forest balance](docs/FOREST-BALANCE.md).

## 1.0.0-rc.1

Local release candidate; media clearance outstanding.

- Four difficulties independent of mode; 15 distinct boss profiles and final phases.
- Dedicated 15-trial Boss Rush with prepared partners, between-fight upgrades and separate saves.
- Rotating Expedition/Endless guardians and appropriate story boss attacks.
- Progress Journal with ten achievements, boss patterns and equipment encyclopedia.
- Full profile/three-slot backup and validated atomic restore; saves through format 5 remain readable.
- Shops show every available equipment type.
- Windows x64 test ZIP with bundled Node; loopback server handles second launches without touching other processes.
- GPL-3.0-only original code, GitHub CI, traceable export and explicit publication gates.

## 0.8.0

Reworked minimap, open routes, connected paths and clear barriers; suitable
interior floors, conditional building access and continued play on focus loss.
