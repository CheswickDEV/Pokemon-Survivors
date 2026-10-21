# Pokémon Survivors — 1.0.0-rc.6.4

Ein lokales Browser-Abenteuer: Bewege einen Trainer, stelle ein automatisch
kämpfendes Pokémon-Team zusammen und erkunde Kanto im Survivors-Spielstil.
Fünf Laufarten, vier Schwierigkeitsstufen, 151 Pokémon und getrennte Spielstände.

**Das vollständige Entwicklerprojekt enthält den Spielcode, alle benötigten
Spielmedien, Tests und Werkzeuge zur lokalen Weiterentwicklung.** Es braucht
keine Konten, API-Schlüssel, kostenpflichtigen Programme oder installierten
Pokémon-Spiele.

**Lizenz:** Eigener Code steht unter **GPL-3.0-only**. Die Pokémon-Grafiken,
Rufe und andere Fremdinhalte behalten ihre eigenen Rechte. Das gesamte Spiel
ist daher derzeit **nicht vollständig frei lizenziert**. Eine öffentliche
Weiterverteilungsfreigabe für diese Medien ist noch nicht dokumentiert.
[Medien und Lizenzen](docs/ASSET-STATUS.md) · [Drittanbieterhinweise](THIRD-PARTY-NOTICES.md)

[Vollständiger Download (Vorabversion)](https://github.com/CheswickDEV/Pokemon-Survivors/releases/tag/v1.0.0-rc.6.4) · [Repository](https://github.com/CheswickDEV/Pokemon-Survivors)

## In wenigen Schritten selbst starten

Voraussetzung: [Node.js 22.x](https://nodejs.org/en/download), mindestens
**22.23.3**, mit npm; aktueller Edge oder Chrome. Git ist zum Beitragen hilfreich,
für einen ZIP-Download aber nicht nötig.

1. Das vollständige **developer.zip** entpacken, oder das vollständige Repository
   klonen. Ein Terminal im Ordner mit `package.json` öffnen.
2. Einmalig installieren und prüfen:

```text
npm ci
npm run doctor -- --player
```

3. Zum Entwickeln starten:

```text
npm run dev
```

Die im Terminal angezeigte lokale Adresse im Browser öffnen. Änderungen unter
`src/` werden während der Entwicklung automatisch übernommen. Terminal zum
Beenden mit **Strg+C** schließen. Nach der ersten Installation kann lokal ohne
Internet entwickelt und gespielt werden.

Für einen gebauten Spielstand ohne Entwicklungsserver:

```text
npm run build
npm start
```

Dann **http://127.0.0.1:4173/** öffnen. Spielstände werden im Browser je Adresse
und Port getrennt gespeichert; vor einem Wechsel im Camp **Alles sichern**.

## Weiterentwickeln und mitmachen

- [Entwicklerhandbuch: Codeaufbau, Grafiken ändern, Tests](docs/DEVELOPMENT.md)
- [Installation und Problemlösung](docs/INSTALLATION.md)
- [Alle Abhängigkeiten und Netzwerkzugriffe](docs/DEPENDENCIES.md)
- [Spielanleitung und Steuerung](docs/GAMEPLAY.md)
- [Beiträge und Pull Requests](CONTRIBUTING.md)
- [Sicherheitsaudit](docs/SECURITY-AUDIT.md) · [Entwicklerpaket-Prüfung](docs/DEVELOPER-VALIDATION.md)
- [Änderungen](CHANGELOG.md) · [Sicherheitsmeldungen](SECURITY.md)

Vor einem Beitrag:

```text
npm run check
npm test
npm run check:release
npm run check:developer
npm run build
```

## Welche Pakete gibt es?

| Paket | Inhalt |
|---|---|
| **developer.zip** | Vollständiges bearbeitbares Projekt mit allen aktuellen Medien, Quellenhinweisen und optionalen Importwerkzeugen; Node.js separat erforderlich |
| **source.zip** | Kleiner Codeexport ohne Pokémon-Bilder und Rufe; für Codeprüfung geeignet, alleine nicht spielbar |
| **Windows-x64-LOCAL-ONLY.zip** | Lokales Spielerpaket mit Laufzeit; entpacken und **Spiel starten.cmd** doppelklicken |

Der GitHub-Release bietet das vollständige Entwicklerarchiv als Vorabversion
zur lokalen Weiterentwicklung. Die separate Freigabe der Fremdmedien und eine
unabhängige vollständige Spielabnahme sind damit nicht bestätigt.
Das Windows-Paket bleibt ein lokales Testpaket. Eigene Pakete erzeugen:

```text
npm run release:developer
npm run release:source
npm run release:local
```

Dateilisten und SHA-256-Prüfsummen liegen unter `release/`.
[GitHub-Vorbereitung und Veröffentlichung](docs/GITHUB-RELEASE.md).

Inoffizielles Fanprojekt; nicht mit Nintendo, GAME FREAK, Creatures oder
The Pokémon Company verbunden.
