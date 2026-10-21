# How to play

English is the default. Select **English / Deutsch** in camp or Settings.
The choice is saved locally and included in full backups.

## Five run modes

| Mode | Objective |
|---|---|
| Learning Run | Survive 8 minutes, then defeat Venusaur within one minute; increased XP |
| Expedition | Survive 20 minutes, then defeat a rotating guardian within two minutes |
| Endless | An endless Auenwald landscape and recurring, stronger boss cycles |
| Kanto Story | 27 stages, eight badges, Team Rocket, Elite Four, Champion and Mewtwo |
| Boss Rush | 15 bosses in the Trial Arena; 2 minutes each on Standard, 4 on Veteran, 7 on Master; three active partners from the start and an upgrade after each victory |

Choose **Relaxed, Standard, Veteran or Master** independently of run mode.
Higher settings increase enemy strength, waves and boss pressure. Veteran and
Master award extra coins from quests, chests and special enemies. Changes apply
to new runs; continuing preserves the saved difficulty.

Venusaur, Beedrill, Onix, Blastoise, Arcanine, Gengar, Scyther, Snorlax, Gyarados,
Charizard, Articuno, Zapdos, Moltres, Dragonite and Mewtwo have distinct attack
patterns. Attacks accelerate at low HP. Exact danger areas remain visible with
reduced effects. The Progress Journal explains patterns and records ten achievements.

Boss phases change at 65% and 30% HP, adding staggered follow-up attacks and
reinforcements. Level-ups offer three suitable random upgrades from partner
training, evolutions and 18 equipment items. Recently offered cards appear less
often. Common/Rare/Epic upgrades grant 1/2/3 ranks, with before/after values.

Eight talents add gameplay effects: Afterimage, Gathering Wave, Attack Echo,
Type Resonance, Brave Step, Time Fold, Phoenix Feather and Triad. New legendary
offers always contain such an effect. There are three talent slots; higher
rarity offers may replace weaker talents. Cards and the team menu describe
triggers, power and cooldowns.

**Shinies:** new wild Pokémon and capture encounters have a 1 in 65,536 chance
of a special color variant. Defeating one leaves a capture opportunity. Captured
Shinies persist through evolution and saving and can be selected as starting
partners in the Pokédex. Their combat stats are unchanged.

Kanto's staffed construction barriers explain missing prerequisites. Homes are
accessible; Gyms and the League depend on progress. Existing enemies can follow
you into towns, but new wild enemies do not spawn there. Trials start at your position.

## Controls and team building

| Input | Action |
|---|---|
| WASD / arrows | Move |
| Space | Dodge with 0.30 s protection and a four-second cooldown |
| E | Use a door, NPC, capture offer, chest or quest |
| Tab | Team, switching, stats and evolutions |
| M | Original Kanto region map and travel journal; wheel to zoom, left-drag to pan |
| Esc | Pause, settings and saving |
| 1 / 2 / 3 | Select an upgrade |
| Click an enemy | Set the focused target |

The game continues when you switch windows; **press Esc to pause deliberately**.
Browsers and operating systems may throttle background tabs. Menus pause all
combat timers. Settings include HUD size (70–150%), volume and reduced effects.

All **151 Pokémon**, **72 evolution paths** and six trainers from Generations
I–III are included. Each partner has one signature move with eight ranks.
Three partners fight at once; up to six travel on the team. Normal runs unlock
extra active slots at trainer levels 4 and 8. Switching reserves has a 20-second
cooldown.

Active partners that are fit to fight earn combat XP toward their own evolution.
Trainer XP from crystals grants upgrades. Evolution preserves training and
sprite size. Stone evolutions need their stone, sufficient Pokémon level and
move rank 3; trade evolutions use a Link Token. The team menu shows requirements.
Kanto starts with a Pokémon level cap of 16. Badges raise it to
22/28/34/40/46/52/58/70; Champion status raises it to 100. Each badge also grants
+3% team move damage and two percentage points of trainer damage reduction.
Existing higher levels are preserved but combat uses the current cap.

A forest research target guarantees the first encounter after 24 seconds in
Learning Run or one minute in Expedition. All 151 species are available.
Defeat an encounter, approach and press E. One ball guarantees the catch.
Existing team species can be researched without a ball. Registered species
become available as starting partners.

18 passive items compete for six slots and have five ranks each. Poké Balls
and six evolution items are separate. The Progress Journal explains stats;
shops display their currently available items.

## Quests, world and healing

The forest has three multi-stage quests: recover guarded supply crates, protect
flowers through three waves, and destroy thorn nests plus a Beedrill guardian.
Rewards are one-time coins, XP, balls, a reward choice and a run blessing.
Rare clearings and elites provide chests. The three main quests do not repeat
in every landscape tile.

All 27 story trials have their own three-phase combat profiles, staggered
patterns and, on Master, telegraphed attacks ahead of your movement.
Dodging and direction changes matter. See [RC6 validation](RC6-VALIDATION.md).

Kanto has 51 locations, 57 connections and 58 buildings. Centers, Marts and
available quest buildings are enterable. E at a door opens the room; E near an
NPC restores Pokémon stamina, opens shopping or starts a trial. Gym battles
take place indoors. Story progress opens routes. This is a connected, compressed
real-time adaptation; complex dungeons do not recreate every original room or puzzle.

Healing is scarce. Ordinary enemies have a 0.2% potion chance, at least 60
seconds apart. Potions heal ten base HP. Healing moves share a cooldown.
Emergency Supplies cost 75 coins, heal ten base HP and are limited to two
purchases per run. Boss areas drain partner stamina only when the trainer is
actually hit; an area touching only an automatically following Pokémon does
not. Active partners regenerate after five seconds without a hit, at
2.5 stamina/second during a boss fight.

Centers restore all Pokémon stamina and end recovery pauses; they **do not
heal trainer HP**. Restarting after a defeat is a separate revival with a coin
loss. Boss Rush restores team stamina between trials, but not trainer HP.

## Saves and updates

Forest, story and boss rush have **separate slots**, each with two alternating
copies. Autosave runs every 15 seconds and after decisions. Continuing a saved
battle initially pauses it.

- **Back up everything** in camp or **Back up all saves & profile** in the pause
  menu exports the Pokédex, journal, settings and all three slots.
- **Import save** recognizes full backups and older single-run files. It shows
  the replacement scope first. Full restore uses one database transaction.
- Formats 1–5 migrate to format 6. Old runs use Standard difficulty; past wins
  are not assigned invented difficulty ratings.
- Back up before changing browsers/computers or updating. Storage belongs to
  the browser profile and exact host/port, such as `127.0.0.1:4173`.
  Other addresses, ports and browsers have separate storage. There is no cloud sync.
- Only one tab can write saves. A damaged newest copy falls back to the previous
  valid copy. Checksums detect corruption, not deliberate tampering.
