# Interior visual audit — 1.0.0-rc.6.2

All 58 interiors were inspected in the browser before and after correction:
every Mart, Gym, Fighting Dojo, League, NPC home, other story room and Center.

The review uses two running instances of the actual `Engine` and
`createView`/`ForestScene`. Rooms are entered through `enterBuilding`;
trainer, partners, NPCs and furniture use the game renderer. The overview camera
shows two whole rooms. On the second pass, the trainer stands at the first
NPC's approach point. Mart/Gym were also inspected at normal gameplay scale.

This is an interior visual check using separate states, not another campaign.
The user's save was not loaded or changed. Only the local review scene replaces
the normal follow camera with an overview.

## Findings and fixes

- Staff in all ten Marts, the hotel and Bike Shop stood too high behind counters.
  Counter edges now appropriately occlude their lower bodies.
- One or two transparent rows below NPC feet caused a visible gap. Anchors now
  use the actual visible foot position.
- Mart/Bike Shop rugs extended beneath furniture. They now stop before the
  counter; bicycles stay entirely beside the central aisle.
- Surface choice incorrectly depended on story-trial presence: Dojo looked
  residential while Tower/Mansion/Rocket Hideout received arena floors.
  Surfaces now follow building function.
- Gyms, Dojo and League have bordered leader platforms instead of isolated bars.
- Caves used home/arena wallpaper. Existing rock graphics now form closed edges.
  A final-tile overhang found during review was fixed, then all six caves rechecked.

Beds, shelves and other furniture were compared with available original
references; visible crops were complete. Original graphics and house floors remain.

## Evidence

**152 tests passed**, including interior paths, NPC approaches, rug/prop overlap
and room classification. There are 29 before and 29 after images in
`qa/interior-tour/`, each showing two named rooms; both were inspected.
Detail: `qa/interior-tour/market-arena-detail.png`.
Room log: `qa/interior-tour-audit.json`.
Images are local evidence excluded from the code-only package.

The following table preserves each room's local after-image reference.

<!-- ROOM_TABLE -->

| No. | Location | Room | After image |
|---|---|---|---|
| 1 | Pallet Town | Your home | Image (`../qa/interior-tour/after-01.png`, local evidence only) |
| 2 | Pallet Town | Your rival's house | Image (`../qa/interior-tour/after-01.png`, local evidence only) |
| 3 | Pallet Town | Professor Oak's Lab | Image (`../qa/interior-tour/after-02.png`, local evidence only) |
| 4 | Viridian City | Pokémon Center | Image (`../qa/interior-tour/after-02.png`, local evidence only) |
| 5 | Viridian City | Poké Mart | Image (`../qa/interior-tour/after-03.png`, local evidence only) |
| 6 | Viridian City | Gym · Giovanni | Image (`../qa/interior-tour/after-03.png`, local evidence only) |
| 7 | Viridian City | Trainers' School | Image (`../qa/interior-tour/after-04.png`, local evidence only) |
| 8 | Pewter City | Museum of Science | Image (`../qa/interior-tour/after-04.png`, local evidence only) |
| 9 | Pewter City | Gym · Brock | Image (`../qa/interior-tour/after-05.png`, local evidence only) |
| 10 | Pewter City | Poké Mart | Image (`../qa/interior-tour/after-05.png`, local evidence only) |
| 11 | Pewter City | Pokémon Center | Image (`../qa/interior-tour/after-06.png`, local evidence only) |
| 12 | Pewter City | Nidoran House | Image (`../qa/interior-tour/after-06.png`, local evidence only) |
| 13 | Cerulean City | Pokémon Center | Image (`../qa/interior-tour/after-07.png`, local evidence only) |
| 14 | Cerulean City | Gym · Misty | Image (`../qa/interior-tour/after-07.png`, local evidence only) |
| 15 | Cerulean City | Bike Shop | Image (`../qa/interior-tour/after-08.png`, local evidence only) |
| 16 | Cerulean City | Poké Mart | Image (`../qa/interior-tour/after-08.png`, local evidence only) |
| 17 | Cerulean City | Burgled House | Image (`../qa/interior-tour/after-09.png`, local evidence only) |
| 18 | Lavender Town | Pokémon Center | Image (`../qa/interior-tour/after-09.png`, local evidence only) |
| 19 | Lavender Town | Mr. Fuji's House | Image (`../qa/interior-tour/after-10.png`, local evidence only) |
| 20 | Lavender Town | Poké Mart | Image (`../qa/interior-tour/after-10.png`, local evidence only) |
| 21 | Lavender Town | Name Rater | Image (`../qa/interior-tour/after-11.png`, local evidence only) |
| 22 | Vermilion City | Pokémon Center | Image (`../qa/interior-tour/after-11.png`, local evidence only) |
| 23 | Vermilion City | Pokémon Fan Club | Image (`../qa/interior-tour/after-12.png`, local evidence only) |
| 24 | Vermilion City | Gym · Lt. Surge | Image (`../qa/interior-tour/after-12.png`, local evidence only) |
| 25 | Vermilion City | Poké Mart | Image (`../qa/interior-tour/after-13.png`, local evidence only) |
| 26 | Vermilion City | Fishing Guru's House | Image (`../qa/interior-tour/after-13.png`, local evidence only) |
| 27 | Celadon City | Department Store | Image (`../qa/interior-tour/after-14.png`, local evidence only) |
| 28 | Celadon City | Pokémon Center | Image (`../qa/interior-tour/after-14.png`, local evidence only) |
| 29 | Celadon City | Gym · Erika | Image (`../qa/interior-tour/after-15.png`, local evidence only) |
| 30 | Celadon City | Celadon Hotel | Image (`../qa/interior-tour/after-15.png`, local evidence only) |
| 31 | Fuchsia City | Poké Mart | Image (`../qa/interior-tour/after-16.png`, local evidence only) |
| 32 | Fuchsia City | Gym · Koga | Image (`../qa/interior-tour/after-16.png`, local evidence only) |
| 33 | Fuchsia City | Pokémon Center | Image (`../qa/interior-tour/after-17.png`, local evidence only) |
| 34 | Fuchsia City | Safari Warden's House | Image (`../qa/interior-tour/after-17.png`, local evidence only) |
| 35 | Cinnabar Island | Pokémon Center | Image (`../qa/interior-tour/after-18.png`, local evidence only) |
| 36 | Cinnabar Island | Poké Mart | Image (`../qa/interior-tour/after-18.png`, local evidence only) |
| 37 | Cinnabar Island | Gym · Blaine | Image (`../qa/interior-tour/after-19.png`, local evidence only) |
| 38 | Cinnabar Island | Pokémon Lab | Image (`../qa/interior-tour/after-19.png`, local evidence only) |
| 39 | Saffron City | Pokémon Center | Image (`../qa/interior-tour/after-20.png`, local evidence only) |
| 40 | Saffron City | Poké Mart | Image (`../qa/interior-tour/after-20.png`, local evidence only) |
| 41 | Saffron City | Gym · Sabrina | Image (`../qa/interior-tour/after-21.png`, local evidence only) |
| 42 | Saffron City | Fighting Dojo | Image (`../qa/interior-tour/after-21.png`, local evidence only) |
| 43 | Saffron City | Copycat's House | Image (`../qa/interior-tour/after-22.png`, local evidence only) |
| 44 | Indigo Plateau | Pokémon League | Image (`../qa/interior-tour/after-22.png`, local evidence only) |
| 45 | Indigo Plateau | Pokémon Center | Image (`../qa/interior-tour/after-23.png`, local evidence only) |
| 46 | Indigo Plateau | Poké Mart | Image (`../qa/interior-tour/after-23.png`, local evidence only) |
| 47 | Mt. Moon | Mt. Moon | Image (`../qa/interior-tour/after-24.png`, local evidence only) |
| 48 | Diglett's Cave | Diglett's Cave | Image (`../qa/interior-tour/after-24.png`, local evidence only) |
| 49 | Rock Tunnel | Rock Tunnel | Image (`../qa/interior-tour/after-25.png`, local evidence only) |
| 50 | Pokémon Tower | Pokémon Tower | Image (`../qa/interior-tour/after-25.png`, local evidence only) |
| 51 | Rocket Hideout | Game Corner · Rocket Hideout | Image (`../qa/interior-tour/after-26.png`, local evidence only) |
| 52 | Silph Co. | Silph Co. | Image (`../qa/interior-tour/after-26.png`, local evidence only) |
| 53 | Seafoam Islands | Seafoam Islands | Image (`../qa/interior-tour/after-27.png`, local evidence only) |
| 54 | Pokémon Mansion | Pokémon Mansion | Image (`../qa/interior-tour/after-27.png`, local evidence only) |
| 55 | Power Plant | Power Plant | Image (`../qa/interior-tour/after-28.png`, local evidence only) |
| 56 | Victory Road | Victory Road | Image (`../qa/interior-tour/after-28.png`, local evidence only) |
| 57 | Cerulean Cave | Cerulean Cave | Image (`../qa/interior-tour/after-29.png`, local evidence only) |
| 58 | Bill's Sea Cottage | Bill's Sea Cottage | Image (`../qa/interior-tour/after-29.png`, local evidence only) |

Local QA references are text references; those evidence files are not part of
the public snapshot.
