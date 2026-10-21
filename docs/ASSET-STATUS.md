# Medien, Lizenzen und vollständige Weitergabe

Stand: **21. Oktober 2026, 1.0.0-rc.6.4**.

Das vollständige Entwicklerprojekt enthält die aktuellen Spielmedien und deren
vorhandene Bearbeitungsquellen. Es lässt sich lokal installieren, spielen,
ändern, testen und neu bauen. Die frühere Beschränkung auf einen medienlosen
Codeexport gilt für diesen Entwicklerdownload nicht mehr.

**Eigener Code ist GPL-3.0-only. Der gesamte mitgelieferte Medienbestand ist
dadurch nicht frei lizenziert.** Für aktive Pokémon-Originalgrafiken und Rufe
liegt im Projekt keine dokumentierte öffentliche Weiterverteilungserlaubnis
der ursprünglichen Rechteinhaber vor. Die vollständige technische Übergabe
ändert diese Tatsache nicht. Ein ausschließlich nichtkommerziell nutzbarer
Bestand erfüllt zudem nicht die [Open-Source-Definition](https://opensource.org/osd).

## Was ist enthalten?

| Bestandteil | Herkunft / vorhandener Hinweis |
|---|---|
| Spielcode, lokale Effektsynthese, Build-/Testwerkzeuge | Eigener Code unter GPL-3.0-only; abgeleitete Fremddaten ausgenommen |
| Normal- und Shiny-Bewegungen, Porträts, XML und Credits | Gepinnter PMDCollab/SpriteCollab-Stand; CC BY-NC 4.0 und gesonderte Originalsprite-Credits, unter anderem CHUNSOFT |
| Wald, Innenräume, NPCs, Zäune und Weltkarte | Aus FireRed-Daten des gepinnten pret/pokefirered-Stands; Quellen, Paletten und Raumdaten mitgeliefert |
| Originaltrainerbilder | Gepinnte pret-Quellen; ursprüngliche Pokémon-Rechte bleiben bestehen |
| 151 Pokémon-Rufe | PokeAPI/cries; dessen Lizenztext ordnet die Audioinhalte ausdrücklich The Pokémon Company zu |
| Neue Trainer- und Gebäudegrafiken | Generierte Fanart mit lokalen Quellbildern und bereinigten Prompts; keine pauschale Klärung der Charakter-/Markenrechte |
| Silkscreen-Font | SIL OFL 1.1, vollständiger Lizenztext beigefügt |
| Pokémon-Stammdaten | PokeAPI, BSD-3-Clause; Datenlizenz ist keine Medienlizenz |
| Phaser und eventemitter3 | MIT; vollständige Laufzeithinweise unter `docs/asset-sources/` |

Die mitgelieferten Provenienztexte, Lizenzdateien, Autorenregister und
Einzelcredits beibehalten. `THIRD-PARTY-NOTICES.md` ist die gemeinsame Übersicht.
Für ein vollständig frei lizenziertes Gesamtspiel wären entsprechende Rechte
einzuholen oder die betroffenen Inhalte samt Charakterdarstellungen zu ersetzen.

## Entwicklerpaket und Spielerbuild

- `release-config/source-files.json` erfasst Code, Tests und Dokumentation.
- `release-config/developer-files.json` ergänzt die vollständigen aktuellen
  Medien samt vorhandenen Bearbeitungsquellen und Importprogrammen.
- `release-config/runtime-assets.json` erfasst **1.447** tatsächlich benötigte
  Bild-, Ton- und Fontdateien mit SHA-256. Nur diese gelangen in den Webbuild.

Unbenötigte historische Sprites unter `public/art/pokemon/`, private
Arbeitsordner, Caches, Logs und alte QA-/Releaseausgaben sind ausgeschlossen.
Das entfernt keine aktuelle Spielfunktion. Die bearbeitbaren Quellen sind
im Entwicklerpaket enthalten, werden aber nicht als Webdateien ausgeliefert.
Private Rechnerpfade in Prompt-/Importdateien wurden durch lokale relative
Pfade und die dokumentierte optionale Werkzeuginstallation ersetzt.

Der zusätzliche kleine `source.zip`-Export enthält weiterhin keine Pokémon-
Bilder oder Rufe. Er ist für reine Codeprüfung verfügbar und ersetzt das
vollständige Entwicklerprojekt nicht.

## Nachweise

- [SpriteCollab-Lizenz (lokale Kopie)](asset-sources/pokemon-motion-LICENSE.md)
  und [Provenienz](asset-sources/pokemon-motion-PROVENANCE.md).
- [Shiny-Credits und Herkunft](asset-sources/pokemon-shiny-PROVENANCE.md).
- [FireRed-Innenräume](asset-sources/interiors-v7-SOURCES.md),
  [Weltgrafiken](asset-sources/original-overworld.md).
- [PokeAPI/cries-Lizenz](https://raw.githubusercontent.com/PokeAPI/cries/b3a9044bb839b5e3152aaa536c7b463a0fcf0140/LICENSE)
  und [lokale Kopie](asset-sources/cries-LICENSE).
- [Font-Lizenz](asset-sources/fonts-OFL.txt) und
  [Datenlizenz](asset-sources/PokeAPI-data-LICENSE.txt).

Dies ist die dokumentierte Herkunfts-/Lizenzlage des Projekts, keine
Rechtsfreigabe oder Aussage über sämtliche Rechte einzelner Mitwirkender.
