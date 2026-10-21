# RC6: Master Kanto, talents and interiors

**Visual acceptance correction:** reception was still missing parts. The RC6
layering correction described below was insufficient. The complete original
reconstruction followed in rc.6.1; see [Center repair](CENTER-REPAIR.md).
Combat/talent measurements remain results of RC6.

Checked October 20, 2026, local version 1.0.0-rc.6; no public upload at that time.

## Scope

All 27 story stages, eight Gyms, quests, Elite Four, Champion and Mewtwo were
fought with the real engine: damage, hits, stamina, phases, menus and saving.
The agent reads warnings after 0.12 s and chooses direction/dash ten times per
second. It is a precise test agent, not a human difficulty assessment.
Travel, captures and training are prepared. No claim of a fresh manual journey.
World/interior tests separately check gates, doors, connections and NPC approaches.

Reference setup: first two stages use one starter at Pokémon level 3/6 and move
rank 2/3. Later stages use three starter families in rotating order at the badge
cap, first evolution before level 36 and final forms afterward. Brock uses rank
6; subsequent stages rank 8. From Mt. Moon, six equipment items (power, attack
speed, armor, critical chance, movement, pickup) scale from rank 2 to 5.
This does not validate all 151 teams. No forced hits, HP refills or invulnerability
during balance fights.

## Rules and results

Each stage has a fixed HP budget and distinct mechanics, not adaptive to player
damage/HP. Three phases, reinforcements, brief preparation cover (50% less direct
damage), staggered impacts and type-specific areas create pressure.
Every third Master attack visibly leads current movement: 1.1 s warning, then
a fixed impact position. Direction changes/dash counter it; constant circling is unreliable.

- 27 stages × three starter arrangements × stationary/dodging = **162 fights**.
  Stationary **0/81 wins**, dodging **79/81**. Losses: Brock with Squirtle first,
  Misty with Charmander first. Every stage won with at least two arrangements.
- Constant circling with dash on cooldown: **2/27 wins** (Safari/Victory Road,
  17/23 HP), **25 losses**; before predictive attacks it won 18/27.
- Attack Echo + Type Resonance + Triad: dodging **27/27**, stationary **0/27**.
- Level-16 comparison: three base starters, rank 8, no equipment.
  Master Brock: stationary loses at **7 s**; dodging wins at **90 s / 24 HP**.
  Veteran dodge win 32 s; Standard 13 s. Maxed training is strong preparation.

| Stage | Dodge wins | Winning fight duration | Remaining HP |
|---|---:|---:|---:|
| oak-parcel | 3/3 | 48–62 s | 100–100 |
| oak-return | 3/3 | 36–88 s | 73–100 |
| brock | 2/3 | 117–119 s | 2–40 |
| mt-moon | 3/3 | 69–72 s | 92–100 |
| misty | 2/3 | 87–97 s | 68–82 |
| bill | 3/3 | 85–92 s | 69–100 |
| ss-anne | 3/3 | 128–136 s | 71–100 |
| surge | 3/3 | 123–124 s | 40–95 |
| rock-tunnel | 3/3 | 50–55 s | 100–100 |
| tower-mystery | 3/3 | 54–57 s | 84–92 |
| rocket-hideout | 3/3 | 95–100 s | 100–100 |
| erika | 3/3 | 152–155 s | 100–100 |
| tower-rescue | 3/3 | 71–75 s | 100–100 |
| koga | 3/3 | 156–165 s | 94–100 |
| safari | 3/3 | 71–74 s | 100–100 |
| silph-co | 3/3 | 75–78 s | 76–100 |
| sabrina | 3/3 | 138–140 s | 94–100 |
| mansion | 3/3 | 69–70 s | 99–100 |
| blaine | 3/3 | 135–139 s | 76–94 |
| giovanni | 3/3 | 112–114 s | 100–100 |
| victory-road | 3/3 | 67–68 s | 100–100 |
| lorelei | 3/3 | 142–144 s | 91–100 |
| bruno | 3/3 | 147–150 s | 100–100 |
| agatha | 3/3 | 190–192 s | 92–100 |
| lance | 3/3 | 219–220 s | 97–100 |
| champion | 3/3 | 225–227 s | 84–100 |
| mewtwo | 3/3 | 123–134 s | 100–100 |

## Persistent combat campaigns

One state retains time, RNG, trainer HP, earned progress, talents, Phoenix
Feather use and saves across stages. Centers restore stamina only; trainer HP
is checked unchanged on every visit. Defeats use the same rest-point function as
the result screen: reset trial, lose 10% coins, revive. Wins do not refill HP,
including before Mewtwo. Travel/captures/reference training remain prepared.
Save/load occurs after twelve combat seconds and between stages.

| First starter | Stages | Badges | Defeats/recoveries | Simulated combat/rest | Final HP |
|---|---:|---:|---:|---:|---:|
| #001 | 27/27 | 8/8 | 2 | 46.4 min | 100 |
| #004 | 27/27 | 8/8 | 2 | 54.1 min | 100 |
| #007 | 27/27 | 8/8 | 2 | 53.5 min | 90 |

Three complete Master combat chains, not flawless runs. Prepared teams/equipment
and a fast agent favor success; manual acceptance remains outstanding.

## Eight talents

| Rarity | Talent | Effect |
|---|---|---|
| Rare | Afterimage | Dash leaves a 2 s decoy; 8 s cooldown |
| Rare | Gathering Wave | XP pickup pulls XP/coins within 360; every 12 s |
| Epic | Attack Echo | Every fifth normal attack repeats from current partner position at 45% power |
| Epic | Type Resonance | Three different types on one enemy within 4 s add 120% of the last attack's value |
| Epic | Brave Step | Dodge a boss area to gain 10 shield and 12 team stamina; every 12 s |
| Legendary | Time Fold | Dash delays announced impacts by 0.65 s and slows enemies for 2 s; every 14 s |
| Legendary | Phoenix Feather | Once per run, replace lethal damage with 30 HP, 2 s protection and 40 team stamina; use is saved |
| Legendary | Triad | Every eighth normal attack triggers the other active partners' moves at 60% power |

At most one talent offer per level selection; three slots. A higher-rarity talent
can replace the weakest at capacity, explicitly named on the card.
New legendary offers are talents only; old saved +4-rank offers remain readable.
Common/Rare/Epic training grants +1/+2/+3 ranks only when fully fitting.

From trainer level 10, before ownership/slot checks: 25% rare, 9% epic and 1.5%
legendary talent offer; otherwise none. Rare unlocks at level 3, epic at 6,
legendary at 10. No duplicate owned talents or recursive extra-attack chains.
Cards/team show triggers/limits; HUD shows ownership and used Phoenix Feather.

## Pokémon stamina

An area touching only an automatically following Pokémon no longer drains
stamina. Accepted trainer hits from bosses/areas cost the active team at most
26 stamina, otherwise 60% of damage after protection, reduced further by stamina
training. Overlaps during the same trainer invulnerability do not charge twice.
A clean dash costs no stamina. After five hit-free seconds, active partners
regenerate 2.5/s in boss fights, otherwise 1/s. Exhausted partners return after
12 s with 50 stamina. Centers never heal trainer HP.

## Interiors and reception

58 rooms, including 14 NPC houses and ten Centers, inspected through 29 two-room
gallery views in the real renderer. All 88 NPC approaches were reachable.
RC6 split the unchanged reception image after 32 source rows, with the lower
16 drawn in front of Joy, and adjusted Joy/Bill's bookcase. Ten Centers retained
trainer HP **37 → 37** while restoring stamina. Cerulean front/rear views were
also checked. **This did not fix the missing artwork; rc.6.1 supersedes that
visual acceptance.**

Local images: `qa/rc6-interior-p01.png` through `p29.png`,
`qa/rc6-interior-center-live.png`, `qa/rc6-interior-depth-live.png`,
`qa/rc6-legendary-live.png`, `qa/rc6-champion-live.png`.
These are local evidence, not public export files.

## Regression and performance

**149 tests passed**, including eight talents, replacement, migration, one-time
use, dash/overlap protection, stamina, rest-point loss and reachable safe spots
in all three phases of 27 profiles. All **18 Standard forest runs** won
(three starters × two modes × seeds 123/456/789), using a prepared resource
strategy. No forest HP values changed; no guarantee for arbitrary players/seeds.

30-second real Champion fight, three offensive talents/minimap, 1280×720:
**164.7 FPS**, frame p95 **6.4 ms**, p99 **7.8 ms**, maximum **12.1 ms**.
Minimap p95 **0.3 ms**, maximum **0.7 ms**.
Trainer HP was stabilized only for this performance test. This is not a balance
result or a frame-rate guarantee on other hardware/background tabs.

All checks used separate local contexts; user saves were not loaded,
overwritten or restarted.

## Reproduction

Create `qa/` as an output folder in the full project.

```powershell
npm run check
npm test
npm run test:core
$env:STARTERS='1,4,7'
$env:STATIONARY='1'
$env:PROBE_OUTPUT='qa/rc6-master-final.json'
node --experimental-strip-types tests/rc6-story-probe.ts
node --experimental-strip-types tests/rc6-campaign-probe.ts
```

Other story variants: `LOADOUT=circle` or `LOADOUT=talents`;
`STARTERS=1`, empty `STATIONARY` for moving runs only. Use a separate
`PROBE_OUTPUT` per variant. Local results:
`qa/rc6-master-final.json`, `rc6-master-circle.json`, `rc6-master-talents.json`,
`rc6-persistent-campaign.json`, `rc6-brock-level16.json`,
`rc6-forest-regression.json`, `rc6-interior-audit.json`,
`rc6-browser-performance.json`.

The local Windows export included runtime, build, verified media, checksums
and corresponding source. Media rights and independent manual acceptance
remained separate in [Release readiness](RELEASE-READINESS.md).
The historical RC6 work itself did not publish a release.
