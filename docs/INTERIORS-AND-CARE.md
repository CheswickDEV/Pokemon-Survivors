# Interiors and Centers — 1.0.0-rc.4

Checked October 20, 2026. Historical report.

**rc.6.2:** all 58 rooms were inspected again before/after changes using the
running engine, trainer and Pokémon. Counter staff, rugs, NPC foot anchors and
surface selection were corrected. See [visual audit](INTERIOR-VISUAL-AUDIT.md).

**rc.6.1:** the earlier visual acceptance of Center reception was insufficient.
Complete original tiles replaced the incomplete foreground. See
[Center repair](CENTER-REPAIR.md).

**RC6 follow-up:** inspected all rooms with the actual renderer. Splitting
reception's rear 32 source rows and front 16 rows corrected depth ordering,
with changes to Joy and Bill's bookcase. All 88 NPC approaches were reachable
and ten Centers preserved trainer HP. This layering fix alone did not restore
the missing reception parts, subsequently repaired in rc.6.1.

## Center rule

Nurse Joy restores only the stamina of all team Pokémon, including reserves
and exhausted partners, and ends recovery pauses. Trainer HP remains exactly
unchanged, including with healing bonuses, repeated visits and save/load.
The 20-second cooldown, rest point and one-time visit supplies remain.

Restarting after defeat is a separate revival with coin loss. Potions, limited
Emergency Supplies and combat healing retain their rules.

## Visual problems and corrections

Furniture images had different transparent margins. The Gym statue occupied
only the upper-left half; shelves had eight blank pixels beneath the visible
base. Image centers/bottom edges were therefore unreliable anchors, and
different magnifications distorted pixel size.

Rendering now uses actual visible crops of unchanged sources. Every source
pixel becomes two world pixels. Image, footprint, depth order and minimap share
dimensions. Center counters, Joy, waiting areas and rugs are aligned; rugs start
in front of the counter.

## Content

Inventoried **58 rooms, 275 props and 88 NPCs**. All ten Centers, including
Cerulean, share the corrected layout.

| Building | Interior and resident |
|---|---|
| Your home | Mom, bed, table, shelf; explains separate trainer HP/Pokémon stamina |
| Rival's house | Rival's sister, home furniture, switching advice |
| Trainers' School | Teacher, bookshelves, teaching table; Pokémon's own XP |
| Nidoran House | Nidoran fan with evolution advice |
| Bike Shop | Owner, counter, four bicycles; no simulated bike purchase |
| Burgled House | Resident, shelves/table, Team Rocket dialogue |
| Mr. Fuji's House | Caretaker and shared seating |
| Name Rater | Study and dialogue, no unimplemented renaming feature |
| Pokémon Fan Club | Chairman and several tables |
| Fishing Guru's House | Fisherman, home setting, coast/Surf advice |
| Celadon Hotel | Reception and two beds |
| Safari Warden's House | Warden, study, Safari advice |
| Copycat's House | Distinct resident and home |
| Bill's Sea Cottage | Bill, laboratory floor/equipment, existing story trial |
| Marts/Department Store | Clerk behind counter, shelves; Viridian delivery worker separately reachable |
| Museum/labs | Exhibits/equipment and guide/scientist |
| Gyms/League | Leader, guide, corrected statues, clear combat area |
| Caves/Tower/Mansion/Rocket Hideout | Suitable edge props; no residential rug in caves; existing trials and paths |

No additional original dungeon floors or unimplemented house functions are claimed.

## Evidence

- **128 tests**, type check and production build passed.
- All 58 interiors rendered and inspected in a complete gallery; fresh run
  without captured console warnings/errors.
- Flood-fill checks from each entrance reach every NPC approach and exit.
  Props stay inside rooms without overlap; visible dimensions/anchors checked.
- Twelve file-backed prop variants checked against PNG alpha bounds; bicycles
  are drawn locally.
- Ten Centers tested at trainer HP 1/37/99/100, with six partners, reserves,
  recovery, healing bonus, cooldown, repeat visits and backups.
- Cerulean browser interaction: trainer **37/100 → 37/100 HP**, Squirtle from
  recovery/12 stamina to full. Saving/continuing preserved those values.

Local evidence: `qa/interior-audit.json`, `qa/interior-art-check.json`,
`qa/interior-58-after.png`, `qa/interior-center-live-after.png`,
`qa/interior-center-room-after.png`, `qa/interior-tests.txt`.
These QA files are excluded from the public export.

## Campaign balance impact

Earlier rc.3 successes relied on the removed trainer healing and are not current
completion evidence. The unchanged Standard combat agent then achieved:

| Starter | Stages completed | Defeat |
|---|---:|---|
| Bulbasaur | 22/27 | Bruno |
| Charmander | 18/27 | Blaine |
| Squirtle | 18/27 | Blaine |

Travel is skipped; movement, upgrades and reward captures use normal rules.
The agent does not buy Emergency Supplies or optimize the team like an expert.
The removed healing was not compensated elsewhere. A complete human campaign
and long-term acceptance under this rule remained outstanding.
