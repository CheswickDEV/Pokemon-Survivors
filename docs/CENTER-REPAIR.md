# Pokémon Center correction — 1.0.0-rc.6.1

The RC6 preview still showed an incomplete reception desk. Its visual acceptance
was incorrect: changing Joy's position and draw order could not restore missing parts.

## Cause and correction

The previous healing-station import contained only the foreground layer and a
shortened crop. The screen, machine base, rear side sections and work-area floor
were missing.

The replacement uses the complete metatile region `(4, 0, 7, 4)` from
`PokemonCenter_1F_Layout`, including both image layers. The resulting 112×64
pixels exactly match that crop in the existing reference. The source remains
pokefirered `ce6406d8c2eaf46d543c8a2606de0c3cb1951982`; no original pixels were painted over.

Reception meets the north wall, without the incorrect blue residential wall
row underneath. Joy stands between the rear work area and separately drawn
front counter edge. The work area has continuous collision and the interaction
point is in front. All ten Centers use this template.

Older saves placing a character inside the newly solid area move it to a free
position in front when loaded. Trainer HP, Pokémon stamina and progress stay
unchanged. Full stamina bars hide in peaceful interiors; injured Pokémon and
active trials retain them.

## Validation

- **150 tests passed, zero failures**, including all 58 interior paths, reception
  collision, Joy's layering and old-position recovery in all ten Centers.
- Exact pixel comparison with the complete original crop passed.
- Browser inspection in Cerulean using the actual renderer: front and left counter.
- Nurse Joy interaction: Pokémon stamina **12 → 100**, trainer HP unchanged at **37**.

Local evidence: `qa/center-fix-full-tests.log`, `qa/center-repair-asset.json`,
`qa/center-repair-front.png`, `qa/center-repair-side.png`.
Images came from a separate test scene using the actual game renderer, not an
edited preview. The user's save was not used.

This replaces the incorrect RC6 visual acceptance of reception. Earlier combat
tests do not thereby become new rc.6.1 playthroughs.
