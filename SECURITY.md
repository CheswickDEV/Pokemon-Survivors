# Sicherheit

Die aktuelle Fassung ist **1.0.0-rc.6.4**. Ergebnisse, konkrete
Behebungen und Prüfgrenzen: [Sicherheitsaudit rc.6.3](docs/SECURITY-AUDIT.md)
und [Prüfung des vollständigen Entwicklerprojekts](docs/DEVELOPER-VALIDATION.md).
Ältere lokale Testpakete werden nicht als aktuell geprüfte Downloads angeboten.

Das Spiel läuft im Browser. Sein Dateiserver bindet ausschließlich
`127.0.0.1`, akzeptiert GET/HEAD und schreibt keine Spielstände auf den Server.
Spielstände und Einstellungen liegen lokal im Browserprofil. Keine Anmeldung,
Telemetrie, Cloud-Synchronisierung, Installation eines Dienstes oder
Administratorrechte sind für den Spielstart vorgesehen.

## Eine Schwachstelle melden

Falls im späteren GitHub-Repository unter **Security → Advisories → Report a
vulnerability** eine private Meldung angeboten wird, diese verwenden.
Andernfalls zunächst ein Issue mit der Bitte um einen privaten Meldeweg
eröffnen, ohne Angriffscode, Zugangsdaten oder persönliche Spielstände
anzuhängen. Ein privater Kontaktkanal wird hier erst genannt, sobald er
tatsächlich eingerichtet ist.

Bitte Version, betroffene Komponente, Voraussetzungen, beobachtete Auswirkung
und möglichst eine kleine synthetische Reproduktion nennen. Ein normaler
Spielfehler gehört in die Bugvorlage. Keine Garantie für eine feste
Reaktionszeit; dieses Projekt besitzt noch keinen professionellen Support.

## Grenzen

- Eine fehlerfreie Abhängigkeitsprüfung ist keine Garantie für Fehlerfreiheit.
- Importierte JSON-Dateien werden geprüft; ihre Prüfsumme erkennt Beschädigung,
  stellt aber keine Signatur oder Vertrauensbestätigung dar.
- Lokale Programme mit Zugriff auf denselben Benutzer, bösartige
  Browsererweiterungen und manipulierte Betriebssysteme sind keine durch dieses
  Spiel isolierten Angreifer. Der lokale Server ist kein Internetdienst.
- Die Node-Laufzeit wird gegen einen festen SHA-256 und offizielle
  HTTPS-Prüfsummen geprüft. Das gesamte ZIP erhält dadurch keine Codesignatur.
- Veröffentlichung und Medienrechte bleiben getrennte Voraussetzungen.
