# Kanto catalog: 151 playable Pokémon

> Historical catalog from version 0.3. Since 0.4, its 604 move slots have been
> replaced in gameplay by one signature weapon per species. See [WEAPONS.md](WEAPONS.md)
> for current weapon rules and Ditto's adaptation. Species, types and evolution
> edges remain active.

`src/kanto-catalog.ts` covers National Pokédex numbers 001–151, 604 historical
move slots and all 72 evolution edges with both endpoints among those species.
Gameplay loads no external data. Six locomotion types are represented:
walking, hopping, flying, floating, slithering and swimming.

## Source and reproducibility

Source: the primary CSV repository of
[PokeAPI/pokeapi, revision 6fd69dfe90465ba96534f6816fc817737d1f97f6](https://github.com/PokeAPI/pokeapi/tree/6fd69dfe90465ba96534f6816fc817737d1f97f6/data/v2/csv).
PokeAPI is independent, not a Nintendo publication. Its full BSD-3-Clause text
is included at `public/art/data/PokeAPI-LICENSE.txt`.

`scripts/build-kanto-catalog.py` reads German Pokémon/move names, types including
historical changes, Red/Blue/Yellow learnsets, evolution requirements and the
type chart. It caches inputs in `.cache/kanto-data/` without executing them.
The local `qa/kanto-catalog-audit.json` records the revision, URLs, SHA-256 hashes,
selected move IDs and rejected suggestions. Rebuilding uses that cached snapshot.
English display names are supplied separately by `src/locales/en.json`.

## Generation I rules

- Exactly 15 types; no Steel, Dark or Fairy.
- Magnemite/Magneton are Electric only. Clefairy, Clefable, Jigglypuff and
  Wigglytuff are Normal; Mr. Mime is Psychic.
- Bite, Gust, Karate Chop and Sand Attack retain their historical Normal type.
- No later-generation evolutions, babies, regional forms or non-Kanto Eevee branches.
- Eevee evolves into Vaporeon, Jolteon or Flareon with the appropriate stone.
- Alakazam, Machamp, Golem and Gengar use a Link Token instead of external trading.
- Historical type-chart differences: Poison → Bug and Bug → Poison are 2×,
  Ghost → Psychic is 0×, Ice → Fire is 1×. The game can then apply its existing
  reduced Survivors multipliers.

## Deliberate prototype adaptations

German move names and original availability come from Red/Blue/Yellow learnsets.
Evolved forms may retain earlier moves. Four thematic moves were selected per
family; many final forms had their own combinations. Ranged shots, fans, area
attacks, leaps, healing and orbiting effects represented the prototype's six
mechanics.

Damage, range, cooldown and evolution levels were retuned for short runs.
Absorb, Leech Life and Dream Eater heal the trainer. Thunder Wave, Sleep Powder,
Sing, Swords Dance and Barrier became thematic attack/area effects; this was
not a complete reproduction of turn-based effects. Instant KOs, self-KOs and
Metronome's random move selection were not activated.

Caterpie, Metapod, Weedle, Kakuna, Magikarp and Ditto originally had too few
suitable moves for four slots, so additional slots were explicitly named
variants such as “String Shot · Ring” or “Splash · Wave”. Magikarp's Splash
dealt damage. Ditto's four Transform variants were independent copy attacks,
not permanent species changes or copies of complete enemy logic. Every species
had a damaging slot-0 move so newly caught supporters could fight immediately.

Original project evolution thresholds were retained: starters 8/16,
Caterpie/Weedle 4/8, Rattata 10, Pikachu 8 plus Thunder Stone. Other levels derive
from original requirements and are clamped to 4–18. Stone evolutions require
level 8 and their stone; trade final forms require level 14 and a Link Token.
No extra evolutions were invented for shorter families.

`role`, `traitKind` and `locomotion` are project gameplay metadata, not claims
about historical Pokémon abilities.
