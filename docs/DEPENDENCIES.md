# Abhängigkeiten und Netzwerkzugriffe

## Zum Spielen

| Bestandteil | Version / Voraussetzung | Im Windows-Paket? |
|---|---|---|
| Node.js | 22.23.3, Windows x64, offizielles Archiv mit festem SHA-256 | Ja, `runtime/node.exe` und vollständige Lizenz |
| Browser | Aktueller Edge oder Chrome, JavaScript und lokaler Browserspeicher | Nein; auf dem Rechner erforderlich |
| Phaser | 3.90.0, MIT | Im gebauten JavaScript enthalten |
| eventemitter3 | 5.0.4, MIT; indirekte Phaser-Abhängigkeit | Im gebauten JavaScript enthalten |
| Silkscreen | Lokaler Font, SIL OFL 1.1 | Ja |
| Bilder und Rufe | 1.447 geprüfte Laufzeitdateien einschließlich Font; Hashes in `release-config/runtime-assets.json` | Im vollständigen Entwickler-/Spielerpaket; Fremdrechte separat |

Keine Konten, API-Schlüssel, externen Dienste oder separat installierten
Spiele erforderlich. Spielstart und Spielbetrieb verwenden nur den lokalen
Server. Im Browsercode gibt es keine beabsichtigten externen Netzwerkaufrufe.

## Zum Entwickeln und Bauen

| Werkzeug | Unterstützt / gebunden | Zweck |
|---|---|---|
| Node.js | 22.23.3 oder neuerer 22.x-Patch; `.nvmrc` pinnt 22.23.3 | Tests, Build, Server und Releasewerkzeuge |
| npm | Mit Node.js gelieferte Version; Lockfile-Format 3 | `npm ci`, Skripte, Advisory-Prüfung |
| TypeScript | 5.9.3, Apache-2.0 | Typprüfung |
| Vite | 8.3.4, MIT | Entwicklungsserver und Build |
| Git | Optional | Klonen, Commits und Pull Requests |

Die exakten indirekten npm-Pakete, Plattformvarianten, Bezugsadressen und
Integritätshashes stehen vollständig in `package-lock.json`. `npm ls --all`
zeigt den installierten Baum; `npm audit` fragt bekannte npm-Sicherheitsmeldungen
ab. Das Ergebnis ist zeitabhängig. `.npmrc` setzt `ignore-scripts=true`; die
geprüfte Installation und der Build benötigen keine Lifecycle-Skripte.

## Optionale Medienwerkzeuge

Für Installation, Tests, Build und Spielstart sind diese Werkzeuge nicht nötig.
Das vollständige Entwicklerpaket enthält bereits die Bilder sowie vorhandene
Bearbeitungsquellen. Für bewussten Neuimport oder erneutes Packen:

| Werkzeug | Bindung | Installation / Verwendung |
|---|---|---|
| sharp | 0.35.5, Apache-2.0; transitive native Bibliotheken mit eigenen Lizenzen | Im Ordner `tools/assets/` mit `npm ci`; eigenes vollständiges Lockfile. Gebäude-, Innenraum- und Weltimporter verwenden diese lokale Installation. |
| Python | 3.12 im ursprünglichen Workflow; kompatible neuere Version möglich | Optional separat bereitstellen, virtuelle Umgebung im Projekt verwenden. |
| Pillow | 13.0.0, HPND; in `requirements-assets.txt` gebunden | Optional in der virtuellen Python-Umgebung; Sprite-/Trainer-/Waldimporte. |

`build-kanto-catalog.py` verwendet nur die Python-Standardbibliothek. Der
Trainerimport verwendet die mitgelieferten Quellbilder unter
`public/art/trainers-v5/generated/`. Die vollständige Anleitung steht im
[Entwicklerhandbuch](DEVELOPMENT.md). sharp wurde separat installiert, per npm
auditiert und mit einem enthaltenen Quellbild auf Windows x64 geprüft. Die
gesamte Python-Importpipeline wurde nicht erneut abgenommen.

Diese Werkzeuge laden teilweise Daten/Bilder/XML von gepinnten
`raw.githubusercontent.com`-Quellständen. Nicht bei Installation oder in CI
ausführen. Ein Download liefert keine Weiterverteilungserlaubnis; siehe
[Medienstatus](ASSET-STATUS.md). Die optionale Python-Umgebung ist nicht Teil
des npm-Audits und wird beim normalen Build nicht installiert.

## Wann wird das Internet verwendet?

| Vorgang | Ziel / übertragene Informationen |
|---|---|
| `npm ci` | npm-Registry; Paketnamen und Versionsanforderungen |
| `npm audit` | npm-Advisory-Dienst; Abhängigkeitsnamen und Versionen, kein Spielstand |
| Erster vollständiger Paketbau | `nodejs.org`, falls das hashgeprüfte Laufzeitarchiv noch nicht im Cache liegt |
| Optionaler Medienimport | Die in den Importskripten fest angegebenen öffentlichen Quellen |
| GitHub CI / Dependabot nach Veröffentlichung | GitHub und npm; Quellcodeprüfung und Updatevorschläge |
| Starten und Spielen | Nur `127.0.0.1`; keine Spieltelemetrie oder Mediennachdownloads vorgesehen |

[Drittanbieterhinweise](../THIRD-PARTY-NOTICES.md) und beigefügte Lizenztexte
beibehalten. Die GPL des eigenen Codes ersetzt keine Fremdlizenzen.
