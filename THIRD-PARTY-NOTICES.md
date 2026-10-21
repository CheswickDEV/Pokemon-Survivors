# Lizenz- und Quellenhinweise

Der eigene Spielcode steht auf Wunsch des Projektinhabers unter **GPL-3.0-only**.
Copyright © 2026 Pokémon Survivors contributors. Der vollständige Text steht in
`LICENSE`. Abweichend lizenzierte Daten und Bibliotheken behalten ihre Lizenzen.
Die GPL erteilt keine Rechte an Pokémon-Figuren, Marken, Musik oder Fremdgrafiken.
Aus Fremdquellen erzeugte Stammdaten, Animationsmetadaten und Quellenverweise
werden ebenfalls nicht als neu geschaffener eigener Code umlizenziert; ihre
Herkunft bleibt in den betreffenden Dateien und Provenienztexten genannt.

| Bestandteil | Herkunft / Lizenz | Geltungsbereich |
|---|---|---|
| Phaser 3.90.0 | Photon Storm Ltd., MIT | Engine-Code; Text in `docs/asset-sources/phaser-LICENSE.md` |
| eventemitter3 | primus, MIT | Abhängigkeit von Phaser; Text separat |
| Node.js 22.23.3 | OpenJS Foundation und Mitwirkende; MIT und mitgelieferte Drittanbietertexte | Nur Windows-Spielerpaket; vollständiger Text unter `runtime/LICENSE` |
| Silkscreen | The Silkscreen Project Authors, SIL OFL 1.1 | Font; OFL separat |
| Pokémon-Stammdaten | PokeAPI; BSD-3-Clause | Stammdatenauszug und Lizenz in `public/art/data/PokeAPI-LICENSE.txt` |
| Bewegte Pokémon | PMDCollab/SpriteCollab, verwendete Originalsprite-Credits CHUNSOFT | Repository-CC-BY-NC-4.0 ist keine pauschale Freigabe fremder Originalgrafiken |
| Shiny-Varianten aller 151 Arten | Gepinnte Shiny-Sheets aus demselben SpriteCollab-Stand; Originalfarben, acht Richtungen und Zeitdaten erhalten | 604 zusätzliche Laufzeit-PNGs. Lizenz, Provenienz, Namensregister und Einzelcredits unter `docs/asset-sources/pokemon-shiny-*`; dieselbe getrennte Medienfreigabe |
| Außenwelt, Innenräume und NPCs | Aus Pokémon FireRed, nachgewiesen über pret/pokefirered | Öffentliche Weiterverteilung ungeklärt |
| Originaltrainerbilder und Pokémon-Rufe | Pokémon / Nintendo / GAME FREAK / Creatures; Quellen über pret und PokeAPI | Öffentliche Weiterverteilung ungeklärt |
| Neue Gebäude / Trainerdiagonalen | Für dieses Projekt erzeugte Bilder | Keine pauschale Rechtefreigabe für abgebildete Figuren oder Marken |
| Synthetische Spieleffekte | Eigener Code in `src/audio.ts` | GPL-3.0-only für den Code; externe Originalrufe ausgenommen |

`docs/ASSET-STATUS.md` beschreibt den aktuellen Medien- und Lizenzstatus.
Das vollständige Entwicklerpaket enthält die Medien samt vorhandenen
Bearbeitungsquellen, Importwerkzeugen und Credits. Nur der zusätzliche kleine
`source.zip`-Export lässt Pokémon-Bild- und Audiodateien aus.
Das lokale Spielerpaket enthält korrespondierenden Code unter `source/` und
separate Lizenz-/Provenienztexte unter `notices/`. Die vollständige technische
Übergabe erteilt keine zusätzlichen Rechte an Fremdinhalten.

Optionale Bearbeitungswerkzeuge werden separat installiert: sharp 0.35.5
(Apache-2.0 samt gesonderten nativen Bibliotheken) über
`tools/assets/package-lock.json`, Pillow 13.0.0 (HPND) über
`requirements-assets.txt`. Deren Binärpakete werden nicht in den Entwickler-
Quellbestand kopiert. Lizenztexte bleiben in den installierten Paketen.

Dieses inoffizielle Fanprojekt ist nicht mit den genannten Rechteinhabern
verbunden oder von ihnen bestätigt.

## Originale FR/LG-Weltgrafiken (rc.5)

Bauarbeiter, Zaun-Metatiles und Kanto-Regionskarte: Nintendo / Game Freak / Creatures, rekonstruiert aus dem gepinnten pret/pokefirered-Quellstand. Herkunft: [Original-Weltgrafiken](docs/asset-sources/original-overworld.md). Diese Medien sind nicht durch die GPL-Lizenz des eigenen Codes freigegeben.
