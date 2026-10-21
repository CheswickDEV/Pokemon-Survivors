# Prüfung des Release Candidate

Aktueller Stand: **1.0.0-rc.4**. TypeScript/Produktionsbuild und **128 Tests**
bestanden. Alle 58 Räume, NPC-Laufwege und die neue Center-Regel geprüft:
[INTERIORS-AND-CARE.md](INTERIORS-AND-CARE.md). Die bisherige erfolgreiche
Kanto-Kampfsimulation gilt nach Entfall der Trainer-Heilung nicht mehr als
aktueller Durchspielnachweis; die neuen Ergebnisse stehen im verlinkten Bericht.

Vorheriger Stand **rc.3**: vollständige Wald-, Story- und Bossansturm-Simulationen,
Shiny-Abdeckung und Browsernachweise: [WORLD-POLISH.md](WORLD-POLISH.md).
Frisch entpackter Quellcode: 114 medienunabhängige Tests und Build bestanden.
rc.3-Windows-Paket: Start mit enthaltener Runtime, 1.443 Medien über HTTP
und sämtliche manifestierten Datei-Hashes geprüft.

## Vorheriger Paket- und Balanceprüfstand rc.2

Stand: 1.0.0-rc.2, 20. Oktober 2026. Die Nachweise liegen im lokalen `qa/`
und werden nicht als persönliche Testdaten ins GitHub-Quellcodepaket übernommen.

| Prüfung | Ergebnis / Aussagegrenze |
|---|---|
| TypeScript und Produktionsbuild | Bestanden. Vite meldet weiterhin ein großes Phaser-/Spiel-Bundle; kein Buildfehler |
| Gesamte Testsuite | 111 Tests bestanden, einschließlich Medien, Kanto-Verbindungen, Innenräumen, Entwicklungen, Speichern, Bossen und Server |
| Frisch entpackter Quellcode | Abhängigkeiten separat installiert; Typprüfung, 101 medienunabhängige Tests und Build bestanden |
| Paketintegrität | ZIP-CRC und SHA-256 der manifestierten Dateien geprüft |
| Windows-Starter | Aus Ordner mit Leerzeichen mitgelieferte Laufzeit gestartet; PATH auf Windows-Systemordner begrenzt; kein globales Node.js verwendet |
| Doppelstart | Erkennt laufenden lokalen Spielserver und endet erfolgreich; kein zweiter Server und kein fremder Prozess beendet |
| Runtime | Offizielles Node.js 22.23.3-x64-ZIP gegen gepinnten und offiziellen SHA-256 geprüft; unveränderte node.exe mit gültiger OpenJS-Authenticode-Signatur |
| Offline-Assets | Alle 839 vorgesehenen Bild-/Audio-/Fontdateien über den entpackten lokalen Server HTTP 200; Hashes stimmen überein |
| Browser | rc.2: Wald-, Kanto- und Innenraumkarten sowie Import geprüft. Moduswahl, Bossansturm, Fortschrittsbuch und Komplettbackup bereits in rc.1 geprüft; keine erfassten Warnungen/Fehler |
| Sicherung | Tatsächlich im Browser exportierte Sicherung enthält Profil, Wald, Story und Bossansturm. Wiederhergestellt; Bossstand behält Veteran-Schwierigkeit |
| Bossdarstellung | 15 Profile in einer separaten Galerie mit denselben Renderfunktionen geprüft; mehrere Phasen und reduzierte Effekte ohne Konsolenfehler |
| Ausweichbarkeit | Für alle 15 Profile und drei Phasen auf Meister im Testaufbau erreichbare sichere Positionen gefunden. Kein Beweis für jede mögliche Randposition oder Gegnerkombination |
| Kanto-Kampfsimulation | Alle 27 Etappen mit Bisasam, Glumanda und Schiggy geschafft. Reisewege übersprungen; normale Bewegung, Attacken, Fänge, Verbesserungen und Center-Nutzung innerhalb der Kämpfe |
| Bossansturm-Simulation | Drei Starterkonfigurationen je Stufe. Entspannt, Standard und Veteran jeweils 3/3 Siege; Meister 0/3, Niederlagen nach 12, 10 und 7 geschafften Prüfungen |
| Wald-Simulation auf Standard | 15/15 Lernläufe und 13/15 Expeditionen; jeder Starter gewinnt beide Modi. Insgesamt 66 Waldläufe einschließlich Veteran, Meister und zwölf negativen Kontrollen. Details und Grenzen: [FOREST-BALANCE.md](FOREST-BALANCE.md) |
| RPG-Karte | Tatsächliche generierte Wege, Landschaftsobjekte und Gebäude; geometrische Tests und Sichtprüfung in Wald, Kanto und Innenräumen |
| Abhängigkeiten | `npm audit` meldete zum Prüfzeitpunkt keine bekannten Advisories; keine allgemeine Sicherheitsgarantie |
| Öffentlicher Releasebau | Verweigert den Vollrelease bei offenen Freigaben; lokaler Test- und Quellcodeexport bleiben möglich |

Der Wald-Testtreiber wurde für rc.2 überarbeitet: tatsächliche Spieler-Hitbox,
gezielte Fänge, Questschritte, Einkäufe und aktive Teamverbesserungen.
Er gibt keine zusätzlichen Spielressourcen. Die früheren schlechten Quoten
sind deshalb kein sauberer Vorher/Nachher-Vergleich. Die beiden verbliebenen
Standard-Niederlagen und alle höheren Schwierigkeiten sind vollständig
in [FOREST-BALANCE.md](FOREST-BALANCE.md) dokumentiert.

## Verbleibende Abnahme

Die portable Probe lief auf dem vorhandenen Windows-Rechner mit reduziertem
PATH, nicht in einer frisch installierten VM. Ein fremder Rechner, längere
manuelle Expeditionen, die durchgehende Kanto-Reise und schwächere Hardware
stehen noch aus. Alle 151 Partner wurden strukturell geprüft, aber nicht jede
Team-/Item-/Schwierigkeitskombination vollständig durchgespielt.

Ein zusätzlicher Projekt-Installer wurde nicht signiert; die gültige Signatur
der gebündelten offiziellen Runtime ist keine Signatur des gesamten ZIPs.
Die dokumentierte Medienfreigabe bleibt ein separater Blocker.
