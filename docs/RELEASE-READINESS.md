# Acceptance for 1.0

**Current version: 1.0.0-rc.6.5. Published with developer and Windows player prerelease downloads;
not a fully accepted stable 1.0.**

The full developer download includes current media and available editing sources.
See the [developer guide](DEVELOPMENT.md) and
[handover validation](DEVELOPER-VALIDATION.md). Technical completeness and
unresolved media rights are tracked separately.

The scope supports a bounded first desktop release. Priorities were varied
challenges, dependable saving and easy startup, rather than a larger Pokédex.
This project does not claim to reproduce all Vampire Survivors features/rules.

## Content review

| Area | Release candidate status |
|---|---|
| Modes | Learning Run, Expedition, Endless, Kanto Story and 15-trial Boss Rush |
| Difficulty | Relaxed, Standard, Veteran and Master, independent of mode and saved with the run |
| Bosses | 15 profiles with distinct sequences, rotating forest/endless bosses, story patterns and visible warning/impact/recovery phases |
| Pokémon | 151 species, 72 evolution paths, one eight-rank signature move each, rare Shiny variants for all species |
| Items | 18 passives, six slots/five ranks each, randomized level offers with repetition protection, eight talents/three slots, legendary gameplay effects, training +1 to +3 ranks, equipment encyclopedia and shops |
| Forest quests | Three multi-stage quests plus rare clearings; one-time rewards and persistent achievements |
| Story | 27 stages, eight Gyms, Rocket, League and Mewtwo; three prepared Master combat campaigns completed with ordinary defeats/retries; manual full travel still outstanding |
| Maps | Endless forest; Kanto with 51 locations, 57 connections and 58 buildings; original FR/LG region map, terrain-faithful local minimap, zoom/pan and fixed Trial Arena. Complex buildings remain compressed rooms. |
| Long-term progress | Ten achievements, boss journal, evolution collection and wins by mode/difficulty |
| Saves | Separate forest/story/boss slots, alternating copies, full profile/slot backup, formats 1–5 migrate to 6 |
| Installation | Windows x64 prerelease ZIP with hash-verified runtime and graphical double-click launcher; developer archive with full sources/media |
| GitHub | Reviewed allowlists, GPL-3.0-only code, third-party notices, Windows/Linux CI, bug form, changelog and checksums |
| Languages | English by default; German selectable and saved locally; English public documentation |

The four difficulty settings are this project's design choice, not equivalents
of Vampire Survivors' Hyper/Inverse modifiers. Its official
[Adventures FAQ](https://poncle.games/adventures-faq) describes separate chapter
objectives and unlockable modes. This real-time Kanto campaign is a separate design.

## Outstanding stable player-release requirements

1. **Media rights:** permission to redistribute active original images/cries is
   not documented. Obtain rights or replace affected assets; examine character
   depictions/branding too. [Asset status](ASSET-STATUS.md). A fan-project notice
   does not resolve this.
2. **Independent gameplay acceptance:** a clean Windows installation without
   development tools, full Kanto journey on regular routes and longer manual
   balance tests remain outstanding. Automated combat skips some travel.
   RC6 Standard forest sampling won 18/18 runs; three prepared Master campaigns
   reached Mewtwo with two ordinary defeats/recoveries each. Stationary play
   lost all 81 individual tests. These are not substitutes for human playtests.
   See [RC6](RC6-VALIDATION.md), [forest balance](FOREST-BALANCE.md) and
   [earlier validation](VALIDATION.md).
3. **Publication approval was granted:** the owner explicitly requested public
   upload of the entire project, all media and a download release on
   October 21, 2026. The developer prerelease supports local development;
   this approval does not replace third-party licensing or the two limits above.

`release-config/status.json` records these separately. `release:public`
refuses a cleared player package while a gate remains open. Local testing and
developer/code exports remain available. The explicitly requested Windows
prerelease uses `release:windows`, retaining the unresolved status fields.

## Possible later work, not promises for 1.0

- Distinct survival biomes and quest chains.
- Multi-floor dungeons and handcrafted puzzles.
- Gamepad, touch, mobile layouts and Linux/macOS player packages.
- Additional relics, run modifiers, targeted upgrade banishing and team synergies.
- Languages beyond English/German.
- A broad balance matrix across all 151 starters, four difficulties and late
  endless cycles; no claim that every combination is equally strong.

## Manual acceptance checklist

- [ ] Fresh Windows x64 user profile, no Node on PATH: extract, start, play,
  save, close, restart and continue.
- [ ] Second launch uses the same server; an unrelated port service remains
  untouched; launch from a path containing spaces.
- [ ] Restore a full backup in another browser; compare Pokédex, settings and
  all three slots.
- [ ] Win Standard Learning Run/Expedition; assess Veteran/Master with different
  teams through human play, not only the dodge bot.
- [ ] Inspect all 15 boss patterns with full/reduced effects; no invisible hits
  or unavoidable areas at arena edges.
- [ ] Travel through Kanto to the League and Mewtwo using regular paths; check
  rest points, doors, barriers, shops, rewards and continuation.
- [ ] Play at least 60 minutes of Endless on weaker hardware; monitor memory,
  frame rate and enemy/pickup caps.

Security/export work: [SECURITY-AUDIT.md](SECURITY-AUDIT.md).
Setup: [INSTALLATION.md](INSTALLATION.md), [DEPENDENCIES.md](DEPENDENCIES.md).
