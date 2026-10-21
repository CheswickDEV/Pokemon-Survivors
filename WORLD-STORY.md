# Auenwald and Kanto 0.8.0

Historical design notes for versions 0.6–0.8. Later release candidates change
boss rotation, healing, access rules, save format and maps; consult
[Gameplay](docs/GAMEPLAY.md) for current behavior.

## An endless Auenwald

All forest modes extend beyond the former 3,072-pixel boundary, including
negative coordinates. Seeded 512-pixel chunks generate as needed. Only nearby
areas render; returning recreates the same scenery. The three forest quests
each appear once at fixed locations. M shows direction/distance.

Rare clearings are widely spaced in 4,096-pixel sectors. Their guardians and
rewards trigger once per run. Global enemy scheduling follows time, not chunk
changes. Zubat swarms and flower rings supplement waves. An elite appears
roughly every 90 seconds when special-enemy capacity permits. Distant ordinary
enemies despawn without kill/XP credit.

Defeated elites leave chests containing coins, a ball and one/three/five
training/evolution finds. Fully trained teams receive replacement coins.
Evolution still requires visible prerequisites and items. Opening saves
atomically; positions/loot persist independently of loaded chunks.
High pickup counts merge without losing value.

Learning Run/Expedition keep their time objectives. The historical Endless
design spawned Venusaur every 20 minutes, then increased the round after victory;
later releases rotate guardian species. Subsequent encounters draw from all 151 species.

## A connected Kanto journey

Story starts in Pallet Town, then Route 1 to Viridian's Mart. M opens the map,
eight badges and travel journal; HUD also shows the next objective.
E opens a task/reward prompt, and combat starts only after acceptance.
Locations share one world scene.

51 locations and 57 connections represent ten towns, all 25 routes, major caves,
Power Plant, Tower, Safari Zone, Rocket Hideout, Silph Co., Mansion and League.
Terrain distinguishes forest, town, mountain, cave and water. Towns prevent
ordinary ambient spawns, while trials remain combat. Scale is compressed for
real-time play, not a tile-exact Game Boy reconstruction. The early outdoor-only
representation of interiors was replaced by enterable rooms in 0.7.

27 stages cover Oak's Parcel, Mt. Moon, Bill, S.S. Anne, Rock Tunnel, Tower,
Rocket Hideout, Mr. Fuji, Safari, Silph Co., Mansion, eight Gyms, Victory Road,
Elite Four, Blue and Mewtwo. Gyms use complete Red/Blue leader teams in waves;
Elite Four use five each and Blue six. Rewards include coins, balls, experience
and captures; Gyms additionally grant badges/evolution items.

Pokédex, badges, Cut, Poké Flute, the Saffron guards' drink, Surf, Strength and
other keys open fixed routes. Diglett's western exit needs Cut; underground
paths bypass Saffron gates. Prerequisites persist after loading. Leaving a trial
zone cancels it so it can restart at the same place.

Enter Centers with E, then speak to Nurse Joy to restore Pokémon stamina and
set a rest point. Current rules do not restore trainer HP there. First visits
grant three balls and 20 coins. Pallet has two homes/Oak's Lab, no invented
Center/Mart or free healing from Mom. The first normal rest point is Viridian.
Marts/Celadon's Department Store sell balls, evolution items and equipment through
their indoor clerks. After defeat, continue at the last visited Center, otherwise
Viridian, losing 10% of coins. Champion completion allows further exploration
and Cerulean Cave/Mewtwo.

## Saving and sources

The historical forest/story slots each had alternating backups. Team, badges,
access, active waves, RNG, chests, rare events and negative positions are saved.
Old forest saves migrated to format 5, assigning the former shared Pokémon level
as each partner's initial personal level. Current releases use format 6 and a
third Boss Rush slot. Export/import remain available.

Local references: `../analysis/VS-WORLD-RULES.md`,
`../analysis/VS-WORLD-EVIDENCE.json`, `../analysis/KANTO-WORLD-REFERENCES.md`.
These are not public export files. Mad Forest uses tiling/global timed waves,
not a universally rerolled world. Our seeded forest and connected campaign are
deliberate extensions. The original installation was only read.

## Towns, collision and notices in 0.6

Twelve coherent building sprites replaced geometric placeholders: two homes,
lab/museum, Center, Mart, Gym/Dojo, Department Store, Silph, Tower, Mansion,
League and cave entrance. Solid visible-foundation-aligned footprints block
trainer/partners/enemies while doors remain reachable. Depth follows ground
position. Enemies spawn outside foundations. Old saves inside a new obstacle
can move out.

Towns have individual layouts, narrow paths, plots, flowers, tree rows, paving,
docks and Nugget Bridge instead of uniform circles. The project-specific
building artwork is a compressed adaptation with open combat space.
Content was compared with map objects for
[Pallet](https://github.com/pret/pokered/blob/master/data/maps/objects/PalletTown.asm),
[Pewter](https://github.com/pret/pokered/blob/master/data/maps/objects/PewterCity.asm),
[Celadon](https://github.com/pret/pokered/blob/master/data/maps/objects/CeladonCity.asm),
[Vermilion](https://github.com/pret/pokered/blob/master/data/maps/objects/VermilionCity.asm)
and [Saffron](https://github.com/pret/pokered/blob/master/data/maps/objects/SaffronCity.asm).
Layout, scale and roads were adapted for this campaign.

Small circular tree trunks allow sliding. Pursuers calculate detours around
trunks/buildings and save those points. Tests cover eight approaches to trees
and four to buildings, not arbitrarily dense obstacle combinations.

Entering shows a short town/route notice. Blocked-route contact explains its
key/source with limited repetition. Earlier ground-written names/requirements
were removed. Historical empty-E hints later became silent interactions.

Purple potions replace red plus signs and show concrete HP values nearby.
Blue Ether means stamina. Individual Pokémon XP bars appear in HUD/team.
Only active fit partners receive combat XP; collecting trainer crystals later
cannot redirect it to reserves.

## Enterable interiors in 0.7

Every building has a bounded room with suitable props/NPCs: homes, Centers,
Marts, labs, museum, Silph, Rocket, Tower, caves and League.
All eight Gyms have their leader, type-colored arena, statues and guide.
Layouts support Survivors movement, not every original floor/puzzle.

E at a leader/story NPC starts indoor trials; these no longer start outside.
The full room is valid combat space. E at the exit abandons a running fight.
Defeated waves, return point, outside enemies, loot and captures persist.
Room loot remains when leaving; random outdoor encounters do not spawn inside.

43 interior assets were palette-faithful crops from pinned FireRed sources:
`public/art/interiors-v7/SOURCES.md`. Exterior facades remain project-adapted art.

At this revision, trainer collision around trees was wider/toward crowns;
pursuers used smaller trunks/detours. Special trees also collide.
New crowns/clearings avoid paths. Dead-end town roads terminate in clear space.
Short dash presses survive render frames without simulation and buffer up to
150 ms before cooldown completion.

The historical M map showed connected locations/routes, selectable places,
zoom, objectives, access hints and distinct badges. Later versions replace
that illustrated region overview with original FR/LG artwork and make forest
maps terrain-faithful.

## World and navigation in 0.8

Town width grew 720 → 960 world units; ordinary routes 190 → 380, with clear
shoulders. Narrow tunnels keep their own shape. Roads form connected networks
around foundations to actual exits/door platforms. Shared geometry drives
walkability, forest/rock edges, barriers and minimap. Counts remain 51/57/58.

Closed routes use continuous checkpoints/rock barriers spanning their openings.
Unlocking removes graphics and collision. Messages explain missing requirements.
Road/cave/harbor access is connected; the harbor has a continuous deck/platform.

At 0.8, Centers/Marts stayed open while other buildings opened for available
unfinished tasks or remaining loot/captures. Contentless buildings explained
closure. Later rc.3 opened ordinary homes. Old indoor saves remain resumable/exitable.

Floors fit exact room dimensions. Walls/baseboards match collision; the bottom
wall has a central exit. Marts use warm subtle stone tiles and a sage runner.
Minimap shows actual terrain, streets, footprints, services, NPCs, barriers,
objectives and facing.

Losing focus releases held keys but does not pause. A background timer advances
hidden tabs; menus/decisions still pause. Browser/OS suspension remains possible.
Catch-up is capped at two seconds per tick after long suspension.

Named local QA/reference files are not part of the public snapshot.
