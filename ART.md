# Auenwald 0.3: Grafik, Bewegung und Klang

Alle Laufzeitdateien liegen lokal im Build. Es gibt keine externen Bild-, Schrift- oder Audioanfragen während des Spiels.

## Figuren und Welt

- **151 Pokémon:** Eigene Lauf-, Ruhe- und Angriffsfolgen in acht Richtungen aus dem gepinnten [PMDCollab/SpriteCollab-Archiv](https://github.com/PMDCollab/SpriteCollab/tree/0d0eb9d415a3f648c0df49de72a24a6d46ce3fab). 453 Atlanten, 151 Porträts und 26.472 Frames. Alle 1.208 Laufrichtungen enthalten mindestens drei unterschiedliche Bewegungsbilder. Der Import richtet Frames am Bodenkontakt aus; sichtbare Pixel wurden bytegleich gegen die Quellen geprüft. Aktionsursprünge und Framezeiten bleiben erhalten. [Quellen und Künstler-Credits](docs/asset-sources/pokemon-motion-PROVENANCE.md), [Import](scripts/import-pokemon-motion.py).
- **Laden:** Kleine Porträts werden vorgeladen; Bewegungsatlanten für Startteam, Begegnungsliste, Gegner und neue Entwicklungen bei Bedarf nachgeladen. So muss nicht sofort der gesamte dekodierte Bestand von rund 141 MiB im Grafikspeicher liegen. PNG-Dateien insgesamt rund 4,89 MB.
- **Animation:** Laufphase aus tatsächlicher Wegstrecke, Richtung aus Bewegungsvektor; Angriffsrichtung zum Ziel. Ruhe- und Angriffszeiten folgen der Simulation. Menüs pausieren den Kampf. Snobilikat und Arkani haben statische Ruheposen; Bibor und Dragonir verweisen für Ruhe auf ihre eigene Laufsequenz. Lauf und Angriff sind bei allen 151 Arten animiert.
- **Trainer (0.5.0):** Rot, Klarin, Kris, Brix, Maike und Blatt verwenden je einen vollständig neu gezeichneten Acht-Richtungs-Atlas mit Ruhepose plus acht Zeitphasen. Keine zusammengesetzten Ansichten; ganze linke Posen werden gespiegelt. Der gleichmäßige Schrittzyklus bleibt bei 0,86 Sekunden, Sprint mindestens 0,72 Sekunden. [Darstellung und Prüfung](TRAINER-MOTION.md), [ImageGen-Herkunft und Prompts](docs/asset-sources/trainers-v5-SOURCES.md).
- **Wald:** Feuerrot-Kacheln und Paletten, neu angeordnete Karte mit Wiese, Wegen, Bäumen, Hütte, Schildern und animierten Blumen. [Quellen](docs/asset-sources/forest-PROVENANCE.md).
- **Schrift:** Silkscreen Regular, lokal, SIL OFL 1.1. [Quelle](docs/asset-sources/fonts-SOURCE.md), [Lizenz](public/art/fonts/OFL.txt).

Die älteren 18 Schwarz/Weiß-Animationen unter public/art/pokemon/ bleiben als historischer Bestand erhalten. Die aktive Welt verwendet die Bewegungsatlanten mit acht Richtungen.

## Kampfeffekte und Oberfläche

Eigene sechsphasige Pixelgeschosse für alle 15 Typen: Blätter, Feuer, Wasser, Blitze, Eis, Kampfstöße, Gift, Erde, Wind, Psycho, Käfer, Fels, Geist, Drachenenergie und Normal. Dazu kommen passende Flächenmuster, Schweife, Trefferzahlen, Heilung, Pokéballwurf, Entwicklung und rotierende EP-Kristalle. Das sind eigene Effekte im Code, keine extrahierten Attackenfilme.

Maximal 180 kurzlebige Effekte, begrenzte Schadenszahlen und Aussparung unsichtbarer Figuren. Zusätzliche Partikel können reduziert werden; Bosswarnungen bleiben sichtbar. Grafik verbraucht keine Simulationszufallszahlen und wird nicht gespeichert.

Helle Dialoge, Typfarben, Angriffsränge und Vorher-/Nachher-Werte bleiben erhalten. Das HUD einschließlich Lebenspunkten, Team, EP und Karte ist zwischen 70 und 150 Prozent skalierbar; Menüs behalten ihre lesbare Größe.

## Klang

- **151 klassische Pokémon-Rufe:** Lokal als Ogg aus dem Legacy-Bestand von [PokeAPI/cries](https://github.com/PokeAPI/cries/tree/b3a9044bb839b5e3152aaa536c7b463a0fcf0140). Alle IDs, Container und individuellen Hashes geprüft; rund 917 KB. [Provenienz](docs/asset-sources/cries-PROVENANCE.md), [Import](scripts/import-gen1-cries.mjs).
- **Neue Spielklänge:** Eigene mehrstimmige Puls-/Dreieck-/Rausch-Synthese mit Tonhöhenverläufen und kurzen Melodien. Verschiedene Klänge für 15 Angriffstypen, Schritte, Ausweichen, Schaden, Fang, Level, Entwicklung, Belohnung, Boss und Ergebnis. Synthese-Referenzen (`public/audio/SYNTHESIS-REFERENCES.md`, nur im lokalen Arbeitsbestand). Diese neu komponierten Effekte sind keine Originalaufnahmen aus den Spielen.
- Lautstärke und Stummschaltung wirken über einen gemeinsamen Ausgang mit Dynamikbegrenzung. Gleichzeitige Stimmen und Attackenfrequenz sind begrenzt. Rufe werden nach Benutzerinteraktion geladen und abgespielt.

Pokémon-Charaktere und Quellgrafiken gehören ihren jeweiligen Rechteinhabern. Herkunftsnachweise sind keine zusätzliche Lizenz zur Weiterveröffentlichung. Diese Fassung wurde lokal erstellt.

## Ergänzungen in 0.4

- `pokemon-size.ts`: sichtbare Alpha-Grenzen aller Lauf-/Ruheframes ausgemessen; ein gemeinsamer maximaler Fußabdruck von 36 Weltpixeln für alle normalen Pokémon. Entwicklung bewirkt keinen zusätzlichen Größenfaktor. Der eigenständige Bossfaktor beträgt 1,9.
- `boss-art.ts`: animierte Dornenranken, aufladender Solarstrahl mit bewegtem Kern und Lichtpartikeln, Pollenring und Giftsporen. Gameplay-Gefahrenränder bleiben auch bei reduzierten Effekten erhalten.
- `weapon-art.ts`: Sprungblitze, Strahlen, gerichtete Hiebe, Kegel, Anstürme, kreisende Blätter/Flammen/Steine, Fallen und anhaltende Felder. Knochmerang erscheint als rotierender Knochen, Zahltag als Münze; Eierbomben als markierte Eier.
- EP-Kristalle von mindestens 0,42 auf 0,57 skaliert; Münzen von 10 × 12 auf 13 × 16 Weltpixel vergrößert.
- Großer Pokédex mit allen 151 Karten, Suche und Registriert-Filter; achtstufige Angriffspfade. Questschätze, Bergungsringe, Kartenmarkierungen und Belohnungsfunken ergänzen die Waldaufträge.
- Alle neuen Effekte sind im Projekt gezeichnete Canvas-/Phaser-Geometrie. Keine neuen externen Grafik- oder Audiodownloads für 0.4.

## Ergänzungen in 0.6

- Zwölf neue vollständige, transparente Kanto-Gebäude im Stil der vorhandenen Landschaft. Eigene ImageGen-Bilder, bereinigte Palette, ganzzahlige Größen und dokumentierte Boden-/Türanker. Kontaktbogen (`public/art/kanto-v6/contact-sheet.png`, nur im lokalen Arbeitsbestand), [Herkunft](docs/asset-sources/kanto-v6-SOURCES.md), Metadaten (`public/art/kanto-v6/metadata.json`, nur im lokalen Arbeitsbestand), Validierung (`public/art/kanto-v6/validation.json`, nur im lokalen Arbeitsbestand).
- Alle zwölf PNGs haben echte Transparenz, freien Rand, nichtleeren Bildinhalt und zu den Metadaten passende Maße. Die Laufzeit richtet Sprite und Kollision aus denselben Fundamentdaten aus.
- Fußanker aller sechs Trainer auf die tatsächliche unterste sichtbare Pixelzeile gesetzt; Stand- und Dashbilder verwenden denselben Anker. Bodenschatten direkt darunter.
- Trank- und Ätherflaschen sowie eigene Pokémon-EP-Balken, Freischaltkacheln und Ortshinweise ergänzen die Darstellung. Die Flaschen sind eigene Phaser-Geometrie, keine importierten Originalgegenstände.

Hinweis zum Quellcodeexport: Verweise auf lokale Bild-/Testbelege sind als Text
markiert; die zugehörigen Dateien gehören nicht zum öffentlichen Snapshot.
