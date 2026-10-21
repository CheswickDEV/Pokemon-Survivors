# RC5 rules and validation

## Rules

Dash lasts 0.20 s with another 0.10 s protection afterward. All six trainers'
diagonal rows remain unchanged. Cardinal visible area/height is measured once
against the diagonal reference at load time; no per-step rescaling.

Kanto Pokémon level caps: 16 initially, then 22/28/34/40/46/52/58/70 with badges,
100 after Champion. Each badge adds 3% team damage and two percentage points of
trainer damage reduction. Older higher levels remain saved but combat is capped.
XP is not banked at the cap. Forest/Boss Rush caps remain 100.

Historical RC5 offers: Common +1 rank (weight 65), Rare +2 (25), Epic +3 (9),
Legendary +4 (1); only fully fitting rank grants are eligible. Evolutions have
epic styling; ordinary rests stay common. Rare equipment still uses a slot.
RC6 later changes new legendary offers to talents.

The original FR/LG region map provides town/route navigation. Shared original
positions have slightly offset selection markers. The local RPG minimap still
shows actual terrain and entities. Place selection replaces only the information
card, preserving the map node, 1–4× wheel zoom and left-drag position.
A compass overlay covers the unused original region-switch area.

Helmeted workers and white fence parts come from FireRed/LeafGreen.
Ruby/Sapphire Route 116 uses a different BLACK_BELT NPC.
Sources/hashes: `asset-sources/original-overworld.md` and runtime manifest.

## Combat comparison

Reproduce: `node --experimental-strip-types tests/rc5-balance-probe.ts`.
Trainer level 16; Bulbasaur/Charmander/Squirtle level 16; no equipment; full
initial HP; real attacks and hit detection in Brock's Gym. Only travel and
preparation are skipped. No mid-fight HP grants/invulnerability/damage boosts.
The dodge bot sees warnings immediately and responds faster than humans.

| Difficulty | Move rank | Stationary | Dodge bot |
|---|---:|---|---|
| Standard | 4 | Win, 27 s, 11 HP | Win, 15 s, 100 HP |
| Standard | 8 | Win, 18 s, 11 HP | Win, 10 s, 100 HP |
| Veteran | 4 | Defeat, 15 s | Win, 83 s, 100 HP |
| Veteran | 8 | Defeat, 15 s | Win, 38 s, 100 HP |
| Master | 4 | Defeat, 10 s | Defeat, 383 s |
| Master | 8 | Defeat, 10 s | Win, 226 s, 52 HP |

Master Brock's two enemies each have 11,484 HP, three phases, telegraphed
position strikes, later rings and a crossing lane. Impact positions fix at
warning time; reachable safe spots remain. This favorable Grass/Water team does
not validate all teams.

18 Standard forest runs (three starters × two modes × seeds 123/456/789):
15 wins, three defeats. Every starter wins both modes in this sample using
normal resources. No seed/human difficulty guarantee. A full campaign without
Center HP healing still required separate acceptance.

## Browser performance and function

Separate test port/profile; no user save changes. `qa/rc5-browser.html` shows
real views, 48 trainer directions, rarity cards and measurements. Trainer HP
is stabilized only during performance tests, never the balance results above.

Simulation stays fixed at 60 Hz; rendering follows monitor refresh. Minimap
terrain is cached while markers update. Collision/scenes share chunk data;
unnecessary HUD/profile work between simulation steps is avoided.

Test-machine measurements at approximately 165 Hz, 30 s each:

| Scene | Average FPS | Frame p95 | Longest frame | Minimap p95 |
|---|---:|---:|---:|---:|
| Master forest, 188 enemies at end | 164.4 | 6.3 ms | 31.7 ms | 0.3 ms |
| Master arena, three partners | 165.1 | 6.2 ms | 9.7 ms | 0.3 ms |
| Pallet–Viridian transitions | 163.4 | 6.4 ms | 22.3 ms | 0.2 ms |

The forest exceeded the running 60 FPS target on this machine but had an isolated
spike. The transition test generated 24 chunks, distributed prefetch over frames
and deferred it on busy frames. Longest single generation: 20.3 ms.
This is not a hardware-independent frame-rate guarantee.

Type checking and **136 tests** passed, no failures/skips; **125 core tests**
also passed without media/npm dependencies. Map selection preserved node and
zoom; wheel/drag worked and dragging did not select a place. All 48 trainer
views and four rarity tiers were inspected. New map/barrier originals are
SHA-256 pinned in the package allowlist.
