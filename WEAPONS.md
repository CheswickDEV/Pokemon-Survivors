# Signature weapons for all 151 Pokémon

Each Pokémon has exactly **one automatic weapon trainable to rank 8**.
There are no interchangeable move slots or default packages of ranged, area and
healing moves. Identity comes from movement, range, shape, speed, hit count,
piercing and secondary effects.

Data lives in `src/signature-weapons.ts`; `src/kanto-catalog.ts` supplies
canonical names, types and evolution lines. Move names draw on that reviewed
catalog and familiar Generation I moves. These are deliberate real-time
adaptations, not a simulation of Game Boy battle rules. The English catalog
translates displayed names while German source names remain available.

## Weapon families

| Example | Play style | Special upgrades |
|---|---|---|
| Bulbasaur line | Returning Razor Leaves | More leaves |
| Charmander line | Directional flame cone | Larger hit area |
| Squirtle line | Narrow piercing water beam | More piercing |
| Pikachu line | Lightning chaining between enemies | More jump targets |
| Sandshrew line | Mounds as contact traps | More traps |
| Rattata line | Short Quick Attack | Shorter cooldown |
| Onix | Tightly orbiting rocks | More rocks |
| Cubone line | Bone hitting outward and on return | More piercing |
| Gastly line | Draining mist hit | Faster attacks |
| Snorlax | Heavy circular impact | Larger impact |

All 16 patterns are represented: single shot, fan, staggered volley, beam,
chain lightning, orbit, radial wave, cone, melee slash, quick lunge, boomerang,
contact trap, persistent field, draining hit, charge and bouncing projectile.
Families may share patterns; their numbers, shapes and effects distinguish them.

Normal evolution lines retain their pattern and upgrade focus, sometimes with
a more suitable move name/type. Two intentional exceptions are **Magikarp's
small Splash circle becoming a Hydro Pump beam**, and **Eevee's branches gaining
a water field, needle fan or flame cone**. Weapon rank survives evolution.
Sprite size is independent of weapon stats.

## Ranks and balance contract

- Rank 1 is offensively usable for all 151 species. Healing is secondary.
- Each rank adds 16 percentage points of base damage relative to rank 1 and
  removes four percentage points of base cooldown.
- Ranks 3, 5 and 8 add the family's focus: an extra projectile/hit, piercing
  target or chain target; 12% more hit area; 20% more duration; or another
  7% cooldown reduction.
- Attacks per activation are capped at eight. The highest initial count is
  five, so all three milestones remain effective.
- Eight `rankNotes` derive directly from this contract, before team level,
  evolution, type advantage and equipment.

`power` means **damage per hit**, not DPS. Persistent fields use roughly
0.65 seconds between hits on the same enemy; orbiting weapons roughly
0.75 seconds. Small projectiles track targets to prevent hitting every frame.
Returning projectiles can hit again after turning. The engine caps secondary
healing at two HP per activation.

At rank 8, base damage is 2.12× and normal cooldown is 0.72× its initial value.
Extra projectiles mostly improve group coverage; melee volleys can be unusually
strong against large single targets. These deserve later balance attention.
These numbers do not imply a completed long-term playtest.

## Rendering and units

Distances and sizes are world pixels, times are seconds, angles are radians.
`bounces` counts additional targets. `size` is the radius for fields/traps,
half-width for beams, and contact radius for projectiles. Melee and cones use
`range` and `arc` for reach and opening angle.

Catalog limits: moving projectile radius ≤12 pixels; field/trap radius 45–80;
radial waves 65–110. Orbiting weapons stay 45–80 pixels from the trainer with
10–17 pixel contact radii. Limits preserve trainer and warning visibility.

## Deliberate Survivors adaptations

String Shot, Sleep Powder, Spore, Sing, Hypnosis and Barrier deal damage so
their Pokémon work as sole starters. Withdraw becomes an orbiting water shell.
Splash deals minor contact damage. Chansey's Egg Bomb combines attack and small
healing. Transform is an elastic bouncing projectile and **does not copy enemy
moves**. Metronome uses fixed star/light patterns, not random foreign weapons.
Early forms can use their line's signature move before original learn levels.
These are design choices, not claims of original behavior.

Catalog tests check all 151 species, 15 types and 16 patterns, offensive starting
values, eight rank notes, effective milestones, evolution consistency and
readable base sizes.
