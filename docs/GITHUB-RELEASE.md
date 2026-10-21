# Vollständiges Projekt für GitHub vorbereiten

Das gewünschte Repository enthält **Code, Tests, aktive Spielmedien und
vorhandene Bearbeitungsquellen**. Als Basis den vollständigen Entwicklerexport
verwenden, nicht den kleinen Codeexport. Medien und eigene Software behalten
die getrennten Lizenzen aus [ASSET-STATUS.md](ASSET-STATUS.md).

## Repository erstellen

1. Im vollständigen Arbeitsprojekt prüfen:

```text
npm ci
npm audit --audit-level=low
npm run check
npm test
npm run check:release
npm run check:developer
npm run build
npm run release:developer
```

2. Das erzeugte `Pokemon-Survivors-…-developer.zip` in einen eigenen Ordner
   entpacken. Es enthält den vollständigen geprüften Bestand. Der übergeordnete
   private Arbeitsordner mit `sources/`, `analysis/`, Caches und QA-Archiven
   ist kein Uploadziel.
3. Im vorbereiteten Repository Dateiliste und Änderungen prüfen. Falls noch
   kein Git-Repository besteht, `git init -b main` ausführen. Mit der eigenen
   Git-Identität committen; anschließend ein GitHub-Repository erstellen,
   dessen tatsächliche URL als Remote eintragen und den Branch übertragen.
   Es ist keine alte private Git-Historie im Export enthalten.
4. Beschreibung: **Vollständig bearbeitbares Pokémon-Fanprojekt; eigener Code
   GPL-3.0-only, Medien mit separaten Rechten.** Das Gesamtpaket nicht als
   uneingeschränkt frei lizenziert darstellen. Der offene Medienstatus muss
   auch bei einem vollständigen Upload sichtbar bleiben.
5. Auf GitHub den ersten CI-Lauf prüfen. Private Sicherheitsmeldungen sowie
   Secret Scanning/Push Protection aktivieren, soweit verfügbar.
   Die lokale Vorbereitung aktiviert keine GitHub-Einstellungen.
6. Pull Requests können anschließend mit den Schritten aus
   [CONTRIBUTING.md](../CONTRIBUTING.md) lokal bearbeitet werden.

Zielrepository: [CheswickDEV/Pokemon-Survivors](https://github.com/CheswickDEV/Pokemon-Survivors).
Die Veröffentlichung des vollständigen Entwicklerprojekts einschließlich aller
aktuellen Medien wurde am 21. Oktober 2026 ausdrücklich beauftragt. rc.6.4 ist
eine Vorabversion für lokale Weiterentwicklung. Der tatsächliche Uploadstand
und die angebotenen Dateien sind auf der GitHub-Releaseseite sichtbar.

## Download anbieten

Der Entwicklerdownload ist `release/*-developer.zip`; dessen Prüfsumme steht
in `release/DEVELOPER-SHA256SUMS.txt` und `developer-manifest.json`.
GitHubs **Code → Download ZIP** enthält beim vollständigen Repository ebenfalls
die Medien, benötigt aber Node.js zur Entwicklung. Git LFS ist nicht nötig.

Ein fertiges lokales Windows-Spielerpaket entsteht mit
`npm run release:local`. Es enthält Build, Laufzeit, Starter und
korrespondierenden Code. Der vollständige Entwicklerdownload wird separat
angeboten, damit auch sämtliche Medienquellen und Werkzeuge zugänglich sind.

Für einen als öffentlich freigegeben gekennzeichneten Spielerrelease sind die
offenen Punkte in [RELEASE-READINESS.md](RELEASE-READINESS.md) zu klären.
`release:public` prüft diese Statusfelder. Der Entwicklerexport ist bereits
lokal vollständig möglich und setzt diese Felder nicht stillschweigend um.

Die CI prüft auf Windows und Linux, wählt im vollständigen Entwicklercheckout
alle Tests und erzeugt lediglich ein zusätzliches medienloses Codeartefakt.
Sie erstellt keine öffentlichen Releases und lädt keine Medien nach.
Dependabot schlägt Updates vor, führt sie aber nicht selbst zusammen.

## Vor einer neuen Version

Version in `package.json`, `package-lock.json`, `release-config/status.json`
und dem Standardwert in `server.mjs` gemeinsam aktualisieren. Changelog und
Prüfbericht anpassen, aktuelle Abhängigkeiten prüfen, erneut bauen und
exportieren. Hashes des ZIPs und Dateiinventar kontrollieren. Alte Pakete
werden nicht automatisch Teil des neuen Releases.

Das Windows-Paket bezieht die exakt gepinnte offizielle Node-Laufzeit beim
Paketbau und prüft ihren SHA-256. Der Spielstart lädt nichts nach.
