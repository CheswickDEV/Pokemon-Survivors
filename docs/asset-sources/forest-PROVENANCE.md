# Auenwald – Herkunft der Waldgrafiken

Diese Grafiken sind **keine neu gezeichneten Originalgrafiken dieses Projekts**. Sie sind aus den veröffentlichten Pokémon FireRed-Grafikdaten im Decompilation-Projekt [pret/pokefirered](https://github.com/pret/pokefirered) mechanisch dekodiert. Herkunft der Spielgrafiken: Pokémon / Nintendo / GAME FREAK / Creatures. Die öffentliche Verfügbarkeit des Repositories ist keine eigenständige Freigabe der darin enthaltenen Spielgrafiken zur Weiterveröffentlichung. Diese lokale Entwicklungsfassung beansprucht keine Rechte an ihnen; eine Weiterverteilung ist damit nicht freigegeben oder rechtlich bewertet.

Festgehaltener Quellstand: **037335f4c725d7c9aecdac87066f2002b4bd7e14**, abgerufen am 19. Oktober 2026.

## Originaldateien

- [Allgemeiner Außentilesatz](https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/data/tilesets/primary/general): `tiles.png`, `metatiles.bin`, `metatile_attributes.bin`, Paletten `00.pal` bis `15.pal`.
- [Blumenanimation](https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/data/tilesets/primary/general/anim/flower): Frames `0.png` bis `4.png`, Palette 00.
- [Wasseranimation](https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/data/tilesets/primary/general/anim/water_current_landwatersedge): Frames `0.png` bis `7.png`.
- [Animierungszuordnung](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/tileset_anims.c): Wasser ersetzt Tiles 416–463, Blumen ersetzen 508–511; jeweils ein Bild pro 16 Videoframes.
- [Felsen](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/graphics/object_events/pics/misc/strength_boulder.png) mit [Palette npc_white.pal](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/graphics/object_events/palettes/npc_white.pal). Die Zuordnung ist in `src/data/object_events/object_event_graphics_info.h`, `gObjectEventGraphicsInfo_StrengthBoulder`, belegt.

Nur diese begrenzten Grafik- und Metadatendateien wurden heruntergeladen. Es wurde kein Code des Quellprojekts ausgeführt.

## Mechanische Verarbeitung

`decode_source.py` liest die originalen PNG-Palettenindizes und JASC-Paletten. Jedes Metatile besteht aus acht 8×8-Tiles in zwei Ebenen; Tileindex, horizontale/vertikale Spiegelung und Palette werden aus dem jeweiligen 16-Bit-Wert übernommen. Index 0 bleibt transparent. Die PNG-Originaldatei ist teilweise in Graustufen dargestellt; die Originalpaletten liefern die tatsächlichen Spielfarben.

| Ergebnis | Quelle / Anordnung | Größe |
|---|---|---|
| `grass.png` | Metatiles 1, 8, 9, 16, 17, 1 | 96×16, sechs Frames |
| `path.png` | 208–210 / 216–218 / 224–226 | 48×48, neun Frames |
| `tree.png` | 14,15 / 30,31 / 38,39 | 32×48 |
| `sapling.png` | 19 / 35 | 16×32 |
| `bush.png` | 5 | 16×16 |
| `sign.png` | 3 | 16×16 |
| `cabin.png` | 44,45,45,47 / 52,53,54,55 / 60,61,62,63 | 64×48 |
| `flowers.png` | Fünf Originalanimationsbilder, Palette 00 | 80×16 |
| `water.png` | Metatile 465, mit den acht originalen Tile-Ersetzungen und der im Metatile angegebenen Palette 06 | 128×16 |
| `rock.png` | Strength-Boulder-Objekt, NPC-White-Palette | 16×16 |

Für frei platzierbare Baum-/Busch-/Schild-/Hausbilder werden die Gras-Hintergrundfarben der Palette 00 (Indizes 8 und 12–15) transparent gesetzt. Es gibt keine Neuzeichnung, KI-Erzeugung oder Farbneugestaltung. Die Hütte setzt originale Gebäudeteile in einem kompakten 4×3-Raster zusammen. Baum und Felsen enthalten ihren ursprünglichen dunklen Fuß-/Schattenbereich.

`metatiles.png` und die `*-proof.png` sind Kontrollansichten. Zur Laufzeit genügt der kleine oben aufgeführte Bildsatz. `src/forest-art.ts` beschreibt die URLs, Framegrößen, neun Wegsegmente und die beiden Schleifenanimationen; sie sind lokal und funktionieren offline.
