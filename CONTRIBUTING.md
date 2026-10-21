# Mitmachen

Das vollständige Entwicklerprojekt wie in [Installation](docs/INSTALLATION.md)
einrichten. Im [Entwicklerhandbuch](docs/DEVELOPMENT.md) stehen Codeaufbau,
Medienbearbeitung und Prüfabläufe. Für normale Beiträge sind Node.js und npm
ausreichend; es ist kein KI-Dienst, Python oder Grafikimport erforderlich.

1. Repository forken und lokal klonen, einen eigenen Branch erstellen.
2. Eine nachvollziehbare Änderung umsetzen. Bei Fehlerbehebungen einen passenden
   Regressionstest ergänzen; neue Spielfunktionen außerdem im Browser prüfen.
3. `npm run check`, `npm test`, `npm run check:release`,
   `npm run check:developer` und `npm run build` ausführen.
4. Commit und Pull Request mit Problem, Änderung, durchgeführten Prüfungen und
   verbleibenden Grenzen erstellen. Screenshots helfen bei sichtbaren Änderungen.

Keine Zugangsdaten, persönlichen Spielstände, Rechnerpfade, Caches,
`node_modules` oder Build-/Releaseausgaben committen. Die bereinigten aktiven
Medien und deren bearbeitbare Quellen sind Teil des vollständigen Projekts.
Neue Medien benötigen nachvollziehbare Herkunft und Lizenz; keine pauschale
Umlizenzierung von Fremdinhalten unter die Projekt-GPL.

Neue Code-/Dokumentationsdateien bewusst in `release-config/source-files.json`
aufnehmen; neue Medien und Medienquellen in `developer-files.json`.
Neue Laufzeitdateien zusätzlich in `runtime-assets.json` erfassen.
Nach einer beabsichtigten Bild-/Audioänderung `npm run assets:refresh` ausführen
und die Hashänderungen prüfen. Einzelheiten im Entwicklerhandbuch.

Abhängigkeiten nur mit geprüftem Lockfile ändern. GitHub-Aktionen bleiben an
vollständige Commit-SHAs gebunden. Medienimporter laufen nur bei ausdrücklichem
manuellem Aufruf, nie bei Installation, Spielstart oder CI. Sicherheitsmeldungen
nach [SECURITY.md](SECURITY.md) behandeln.

Eigener beigetragener Code wird unter GPL-3.0-only übernommen. Quellen- und
Drittanbieterhinweise bei Änderungen erhalten.
