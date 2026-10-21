# World, combat and Shinies — 1.0.0-rc.3

Historical check, October 20, 2026. **rc.4 removed Center trainer healing**,
so successful campaigns below are superseded as current evidence.
See [Interiors and Centers](INTERIORS-AND-CARE.md).

This revision replaced rc.2 guaranteed rank offers and boss values.
Old saves remain readable; missing Shiny/history fields become empty.

## Behavior

- Full-width route barriers follow the same collision line as the map.
  Wooden warning fences, workers and signs replace provisional rock/rope barriers.
  Contact explains progress requirements; E in empty space stays silent.
- Ordinary homes/interiors open freely. Gyms/League require progress; completed
  Gyms remain open. Extra door platforms are removed.
- Existing enemies follow into towns. Towns stop new ambient spawns, not active
  trial enemies. Starting a trial does not teleport trainer/partners.
- Bright grass between trees, irregular blades instead of dark squares and
  interpolated road contours. Minimap and world share actual roads/scenery.
- All three level cards are random with recent-offer protection; invalid/maxed
  items are excluded. Power Band, Duration Stone, Wind Feather, Sprint Band,
  Research Journal and Stamina Belt join twelve items. Six slots/five ranks;
  one signature move per partner.

## Shinies and readability

151 individual Shiny portraits and eight-direction Walk/Idle/Attack sets:
453 atlases, 26,472 frames, **604 runtime PNGs**. Every imported RGBA frame was
compared against pinned source data; no generic color filter.

Chance **1:65,536** per new wild Pokémon/capture opponent. Encounter identity
fixes the result, so save/load cannot reroll and combat RNG stays unchanged.
Defeated wild Shinies leave capture offers. Catching a Shiny of an existing
team species replaces its color variant while retaining training, level and
slot. Evolution, profile, backups and starter selection preserve it.
Combat stats are identical.

Focus uses corner brackets, a ground ring and label, including ordinary enemies;
defeated focus targets clear. Shared weapon rendering was reviewed: curved wind
trails, rotating faceted rocks, stepped beams, calmer chains, correct motion
trails, distinct cones and organic fields. Native attacks use their own timing.
Visual effects do not enlarge hits/range/dodge areas; partner evolution does
not enlarge sprites.

## Boss pressure

Scales: ordinary 1, elite 1.25, story leader 1.7, boss 2.15.
Forest boss base HP: 3,500 Learning Run, 7,600 Expedition.
Boss Rush: 780 + 205 per round index. Three phases: above 65%, down to 30%,
final 30%. Later phases accelerate patterns, add fixed telegraphed staggered
strikes and summon two suitable helpers once. All 15 profiles retain distinct
patterns; concurrent bosses have independent animation.

Story leaders scale with progress. Final waves in Mt. Moon, Rock Tunnel,
Rocket Hideout, tower rescue, Silph Co., Mansion, Victory Road and Mewtwo
include a real leader.

## Validation

**125/125 tests** passed, covering 27 start positions, access, town pursuit,
silent interaction, random offers/save replay, equipment effects, Shiny
capture/evolution/profile, focus, scales and one-time reinforcements after load.
All normal/Shiny animations were structurally checked; shared attack patterns
used finite bounded drawing coordinates with full/reduced effects.

Safe reachable spots were found for 15 profiles × three phases in tested
setups, not every possible overlap or arena-edge arrangement.

| Completed simulation | Result |
|---|---|
| Standard Learning, three starters × seeds 123/456/789 | 9/9 wins; 7–100 HP left |
| Standard Expedition, same combinations | 9/9; 25–100 HP |
| Veteran, seed 123, three starters × both modes | 5/6; Squirtle loses Learning at 476 s |
| Master, same six | 0/6; defeats at 131–262 s |
| Stationary Standard, same six | 0/6; defeats at 25–29 s |
| Wandering without captures/quests, same six | 0/6; four deaths, two boss timeouts |
| Boss Rush, three starters per difficulty | Relaxed 3/3, Standard 3/3, Veteran 2/3, Master 0/3 |
| Kanto, three starters × 27 stages | 81/81 stages |

Veteran Squirtle loses Boss Rush after ten trials; Master ends after 9/5/9.
Standard story Mewtwo: 68/58/80 s and 36/41/13 HP for Bulbasaur/Charmander/Squirtle.

Forest runs use ordinary movement, hitboxes, captures, active slots, upgrades,
quests, shops and evolutions, retaining the starter line. No bonus resources,
invulnerability or favorable roster injection. Story travel is skipped.
These agents do not establish human win rates or independent full acceptance.

Separate-port browser checks covered barriers/workers, home access, Onix focus,
Pidgey/Onix/water effects, Shiny Pikachu capture, ball use, team, persistence and
Shiny starter unlock. Synthetic fixtures do not measure Shiny rarity/balance.
No captured console warnings/errors. Local raw evidence: `qa/rc3-*`.

## Package checks

Fresh code export: locked dependencies installed, 114 media-independent tests
and production build passed. No Pokémon binaries in that smaller export.
An initial offline installation failed because the npm cache lacked packages;
first setup requires the normal registry dependencies. Player ZIPs do not.

Extracted Windows package launched using bundled runtime with PATH restricted
to Windows system folders. **1,443 runtime media** returned HTTP 200 and matching
hashes. Both ZIPs passed CRC; all **1,475 player inventory files** matched hashes.
The production server on 4173 served that revision at check time.

Independent long-term playtests, weaker hardware and media permissions remained open.
