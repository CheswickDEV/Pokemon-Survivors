# Forest balance and RPG maps — 1.0.0-rc.2

Historical rc.2 results, checked October 20, 2026. Since rc.3, level offers are
random; the guaranteed rank card described below no longer applies.
See [WORLD-POLISH.md](WORLD-POLISH.md) for the next revision.

Goal: Standard Learning Run/Expedition should be beatable with Bulbasaur,
Charmander or Squirtle through movement, captures, upgrades and equipment.
Victory is not guaranteed; Veteran/Master remain harder.

## Changes

- Water Gun interval 1.6 → 1.4 s; beam half-width 10 → 17 world units.
  Hydro Pump half-width becomes 20. Damage, piercing and range unchanged.
  Squirtle still attacks in a line, not all around.
- High pickup counts merge the nearest same-kind pickups, preserving total value
  and an existing position. New XP no longer jumps to arbitrary distant old pickups.
- At this revision, each level offer included suitable training while an active
  partner could train; chests also preferred active partners, then reserves.
- Automatic elites/clearings share a cap: two Relaxed/Standard, three Veteran,
  four Master, counting active quest guardians. Voluntary quests remain possible.
  Removed the separate Weedle elite timer; deferred events do not accumulate a swarm.
- No blanket reductions to enemy HP, damage, ordinary wave rates or boss warnings.
  Special swarms now respect difficulty speed scaling.
- No increases to healing chance, spacing, purchase caps, trainer HP or existing heals.

## Completed simulations

The agent uses ordinary movement/dash, XP collection, captures, quests, shops and
evolution, without bonus HP, XP, ranks, coins or damage. It retains its original
starter line. Encounter rosters come unchanged from seeds; final forms may appear.

Standard seeds: **123, 456, 789, 2026, 98765**. The final two were additional
validation worlds after initial results. Veteran/Master use 123 and 456.
All three starters run every combination.

| Difficulty | Learning Run | Expedition |
|---|---:|---:|
| Standard | 15/15 wins | 13/15 wins |
| Veteran | 4/6 | 3/6 |
| Master | 2/6 | 1/6 |

| Standard starter | Learning Run | Expedition |
|---|---:|---:|
| Bulbasaur | 5/5 | 4/5 |
| Charmander | 5/5 | 4/5 |
| Squirtle | 5/5 | 5/5 |

Retained failures: Charmander seed 123 at 1,089 s; Bulbasaur seed 789 at 733 s.
All twelve added Standard runs on the two validation seeds won.

Controls: dodging without captures/quests/shopping won **0/6**, including one
boss timeout; stationary play also won **0/6**. Both could use normal level
offers. Movement and team building therefore remained relevant.

Total: **66 completed runs, 11.15 simulated hours**, none reaching the technical
simulation limit. These are not manual hours or predictions of human win rates.
Rules were not secretly changed by starter or during runs.

The old agent missed shops, chased unsuitable targets and mishandled the larger
player hitbox. Its earlier 1/3 and 0/3 results are not a clean balance comparison;
a pre-change control with improved navigation already won more often.

## Maps

Minimaps use smooth contours and clear symbols. Forest paths/clearings and
trees, bushes, rocks, camp and rare clearings come from actual same-seed
generation, not extra map decoration. Kanto shares terrain, roads, water,
foundations and barriers. Interiors show furniture, NPCs, rugs/arena and exit.
Enemies, captures, chests and quest markers use their actual positions.
North stays up; the trainer arrow follows facing.

The large forest map shares those coordinates. Far from camp it shows a bounded
view with directions to distant quests, not an unreadable map of an infinite world.

## Regression and reproduction

- 111 tests, including XP conservation, active training, elite caps, beam geometry
  and map fidelity at positive/negative coordinates.
- Kanto: 27/27 stages for all three starters; travel skipped.
- Boss Rush: Relaxed/Standard/Veteran each 3/3; Master 0/3, ending after 12/10/7 trials.
- Browser checks of forest, large map, Kanto and interiors. Imported map fixtures
  are synthetic visual checks, not balance victories.

`npm run test:forest-balance` runs the Standard seed-123 probe.
Environment options: `PROBE_SEEDS`, `PROBE_MODES` (`learn,normal`),
`PROBE_DIFFICULTIES` (`standard,veteran,master`),
`PROBE_POLICY` (`prepared,wander,idle`), `PROBE_OUTPUT`.
Local results: `qa/forest-*.json`, `qa/forest-balance-summary.json`.

Independent human acceptance, long Endless runs, weaker hardware and media
permissions remain separate requirements.
