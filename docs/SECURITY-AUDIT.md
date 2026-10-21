# Sicherheitsaudit und GitHub-Vorbereitung

Datum: **21. Oktober 2026**. Ausgangsstand: **1.0.0-rc.6.2**.
Überarbeitete Fassung: **1.0.0-rc.6.3**.

Historischer Auditbericht. Die spätere vollständige Entwicklerübergabe in
rc.6.4 einschließlich Medien, bereinigter Bearbeitungsquellen und optionaler
Werkzeuge ist in [DEVELOPER-VALIDATION.md](DEVELOPER-VALIDATION.md) dokumentiert.
Die nachstehenden damaligen Medienausschlüsse gelten weiterhin für den kleinen
Codeexport, nicht für das vollständige Entwicklerpaket.

## Umfang und Vorgehen

Quellcodeprüfung des lokalen HTTP-Servers, Browser-Eingaben und
Spielstandimporte, Netzwerk-/Prozessaufrufe, npm-Abhängigkeiten, gepinnte
Node-Laufzeit, Build, Quellcode-/Spielerexport, Lizenzen/Medienstatus und
GitHub-Workflow. Dateinamen-/Inhaltsscan des vorgesehenen öffentlichen
Quellbestands. Synthetische Angriffsfälle und Prüfung entpackter Pakete.

Im Arbeitsordner gab es kein Git-Repository und damit keine lokale
Commit-Historie oder Remote-Konfiguration zu prüfen. Der saubere Export ist
ein neuer Snapshot. Der übergeordnete Projektordner, synchronisierte
Referenzen, alte QA-Pakete und Cachebestände sind kein Uploadziel.

## Nachgewiesene Befunde und Behebungen

| ID | Einordnung | Nachweis / Wirkung | Behebung |
|---|---|---|---|
| S-01 | Mittel, Datenoffenlegung bei Weitergabe des normalen Builds | Vite kopierte den gesamten `public/`-Baum nach `dist/`, darunter Promptdateien und Importwerkzeuge mit privaten Rechnerpfaden. Das bisherige Windows-Paket war bereits enger ausgewählt; der normale Build war es nicht. | `publicDir` abgeschaltet; Build und Entwicklungs-Medienroute verwenden ausschließlich die geprüfte Laufzeitliste. Der fertige Build wird auf unerwartete Dateien und sensible Inhalte geprüft. |
| S-02 | Mittel, unvollständige Export-/Git-Grenze | Rekursiver Quellcodeexport nahm `scripts/__pycache__/*.pyc` mit. Diese Binärdateien wurden vom alten Textscan ausgelassen. `.gitignore` erfasste unter anderem `original-overworld` nicht. | Explizite Quellcode-Dateiliste, alle Dateiinhalte geprüft, Cache-/Secret-/Pfadregeln und Prüfung aller Pfadkomponenten auf Links. `public/` wird für Git standardmäßig ausgeschlossen; nur Font und fest benannte Lizenzdateien sind freigegeben. |
| S-03 | Niedrig, importierter Spielstand kann spätere Spielfehler auslösen | Für Gegner wurde der String `constructor` als vorhandener Pokémon-Verweis akzeptiert; dieselbe Lücke betraf Begegnungen und gespeicherte Raumobjekte. | Nur ganzzahlige, eigene Pokémon-IDs zulässig. Negativtests für Prototypnamen, Strings, Brüche und IDs außerhalb des Katalogs, auch in Komplettsicherungen. |

Es wurde kein bestätigter Fall von entfernter Codeausführung oder
Zugangsdatenabfluss gefunden. Das ist eine Aussage über diesen Prüfungsumfang,
keine Garantie für das Fehlen weiterer Fehler.

## Zusätzliche Härtungen

- Server: exakter Loopback-Host samt tatsächlichem Port; fremde Origin- und
  Cross-Site-Anfragen abgewiesen; GET/HEAD, restriktive CSP, Frame-/Berechtigungs-
  Header und begrenzte Header-/Request-Zeiten. Traversal und Verzeichnislinks
  aus dem Webroot werden geprüft. Keine Schreib-API.
- Release: genau ein Modus, öffentliche Freigaben müssen echte boolesche
  `true`-Werte sein. Spielerpaket verweigert fehlende Medien und veralteten
  Build. Buildmetadaten binden die Version an den geprüften Quellbestand.
- ZIP: relative Pfade ohne Traversal, Backslashes, Laufwerksangaben oder
  Alternate-Data-Stream-Syntax. Bestehende private Arbeitsbestände werden nicht
  pauschal als öffentliche Dateien übernommen.
- Laufzeit: ausschließlich exakt erwartete `nodejs.org`-HTTPS-Adressen,
  keine Weiterleitungen, Zeit-/Größenlimit und SHA-256-Prüfung. Keine
  nachträglichen Downloads beim Spielen.
- Abhängigkeiten: feste direkte Versionen, vollständiges Lockfile,
  Registry-/Integritätsprüfung und deaktivierte Installationsskripte.
- CI: ausschließlich Leserechte, keine gespeicherten Checkout-Zugangsdaten,
  Aktionen an vollständige Commit-SHAs gebunden, Windows-/Linux-Prüfmatrix,
  Abhängigkeitsaudit und Exportprüfung. Keine Veröffentlichung durch CI.

## Prüfprotokoll

Die Ausgangsprüfung bestand aus 141 erfolgreichen Kernprüfungen. Das npm-Audit
meldete am Prüftag **0 bekannte Schwachstellen** in den gesperrten
Abhängigkeiten (Produktion und Entwicklung). Die aktuelle Node-22-Linie wurde
gegen den offiziellen Index geprüft: **22.23.3**; der Archiv-Pin stimmt mit
den offiziellen Prüfsummen überein.

Abschließend bestanden 160 vollständige lokale Tests, 149 Kernprüfungen im
frisch entpackten Quellcode und 9 gezielte Sicherheits-/Servertests. Der
Windows-Starter funktionierte aus einem Ordner mit Leerzeichen bei leerer
PATH-Variable mit gebündelter Laufzeit. 1.482 Paketdateien wurden gegen ihre
Hashes geprüft, davon 1.451 Webdateien zusätzlich über HTTP abgerufen und
bytegleich bestätigt. Der zweite Start erkannte den laufenden Server.

Aktuelle abschließende Ergebnisse stehen in
[`SECURITY-VALIDATION.json`](SECURITY-VALIDATION.json). Dazu gehören die
Sicherheitstests, vollständigen lokalen Tests, Typprüfung, kontrollierter
Build, Quellcodeinstallation aus einem frischen Export und der portable
Paketstart. Ein grüner lokaler Lauf ist keine Behauptung, dass die neu
vorbereitete GitHub-Matrix bereits auf GitHub ausgeführt wurde.

## Verbleibende Grenzen und Release-Hindernisse

1. Originale Pokémon-Medien besitzen in diesem Projekt weiterhin keine
   dokumentierte öffentliche Weiterverteilungsfreigabe. Das öffentliche
   Quellcodepaket enthält keine solchen Binärmedien und ist kein spielbarer
   Download. Charaktere/Marken und generierte Darstellungen benötigen eine
   eigene Betrachtung; dieses Audit erteilt keine Rechtsfreigabe.
2. Eine unabhängige saubere Windows-Installation ohne Entwicklungstools,
   ein vollständiger manueller Spieldurchlauf und längerfristige Spielabnahme
   sind weiterhin offen. Der lokale Pakettest ersetzt sie nicht.
3. Keine öffentliche Repository-/Release-Erstellung oder Upload ausgeführt.
   Alte Testpakete werden durch dieses Audit nicht nachträglich freigegeben.
4. Kein umfassender Fuzzer, formaler Beweis, externer Penetrationstest,
   vollständiges Audit der optionalen Python-Medienpipeline oder Prüfung aller
   transitiven Bibliotheksquelltexte. Secret-Erkennung ist musterorientiert;
   unbekannte Tokenformate und sensible Freitexte können übersehen werden.
5. Lokale Schadsoftware oder manipulierte Browsererweiterungen werden nicht
   isoliert. Hashes erkennen Veränderungen, sind keine Paketsignatur.

## Primärquellen

- [Node.js 22.23.3](https://nodejs.org/en/blog/release/v22.23.3),
  [offizielle Prüfsummen](https://nodejs.org/dist/v22.23.3/SHASUMS256.txt)
  und [Versionsindex](https://nodejs.org/dist/index.json).
- [Vite: unterstützte Release-Linien](https://vite.dev/releases).
- [GitHub: sichere Verwendung von Actions](https://docs.github.com/en/actions/reference/security/secure-use).
- npm-Advisory-Ergebnis über `npm audit --json` am Prüftag; aktuelle Ergebnisse
  können sich ändern. Medienquellen stehen separat in [ASSET-STATUS.md](ASSET-STATUS.md).
