# Prüfung des vollständigen Entwicklerprojekts

Stand: **1.0.0-rc.6.4**, 21. Oktober 2026.

Diese Ergänzung behandelt die vollständige Entwicklerübergabe. Das vorherige
[Sicherheitsaudit von rc.6.3](SECURITY-AUDIT.md) bleibt als historischer Bericht
erhalten. Seine Aussagen über einen medienlosen Standardexport sind durch das
neue vollständige Entwicklerpaket ergänzt; der kleine Codeexport existiert
weiterhin separat.

## Änderungen

- Vollständiger Entwicklerexport aus expliziten Code- und Medienlisten,
  einschließlich bearbeitbarer Quellbilder, Animations-XML, Credits, Paletten,
  Raumdaten und Importprogramme.
- Drei rechnerabhängige Grafikimporter auf eine lokale optionale
  sharp-Installation umgestellt; exakte Version und eigenes Lockfile.
- Private absolute Pfade in drei Promptdateien durch mitgelieferte relative
  Quellbildpfade ersetzt. Keine Laufzeitgrafik oder Audiodatei verändert.
- Neues Entwicklerhandbuch, vollständiger Installationsweg und Beitragsablauf.
  Medienlisten können nach bewussten Änderungen sicher aktualisiert werden.
- Entwicklerexport prüft alle Inhalte auf die vorhandenen Secret-/Pfadmuster,
  verbietet Link-/Traversalpfade und verifiziert sämtliche Laufzeitdateien.
  CI verwendet im vollständigen Entwicklercheckout alle Tests.
- Der Lizenzstatus wird ausdrücklich getrennt gespeichert:
  `codeLicense: GPL-3.0-only`, `allContentsOpenSource: false`.
  Vollständigkeit bedeutet keine Umlizenzierung fremder Inhalte.

Die Veröffentlichung des vollständigen Entwicklerprojekts einschließlich
aller aktuellen Medien wurde am 21. Oktober 2026 ausdrücklich beauftragt.
Die Paketmetadaten unterscheiden deshalb die erteilte Publikationsfreigabe
von unverändert offenen Fremdrechten.

## Validierung

| Prüfung | Ergebnis |
|---|---|
| Vollständiger bereinigter Bestand | 2.524 Projektdateien; ZIP zusätzlich mit Paketinfo und Dateiinventar |
| Laufzeitmedien | Alle 1.447 Dateien vorhanden und hashgleich zur geprüften Ausgangsfassung; keine Spielmedien entfernt oder verändert |
| Tests im Arbeitsprojekt | 164 bestanden, keine Fehler oder übersprungenen Tests |
| Frisch entpackter Entwicklerdownload, Pfad mit Leerzeichen | `npm ci`, Doktor mit vollständiger Medienprüfung, 164 Tests und Build erfolgreich |
| Paketdateien | Alle 2.525 Inventareinträge vor dem Start gegen Bytezahl und SHA-256 geprüft; Inventardatei selbst nicht selbstreferenziell erfasst |
| Lokaler Spielserver aus frischem Entwicklerprojekt | 1.451 Webdateien über HTTP abgerufen und bytegleich bestätigt; fremde Origin und Zugriff auf Rohquellen abgewiesen |
| npm-Abhängigkeiten einschließlich Entwicklung | 0 bekannte Schwachstellen am Prüftag |
| Separate optionale sharp-Abhängigkeiten | 0 bekannte Schwachstellen; frische Installation und PNG-Konvertierung erfolgreich |
| Portable Node-Grafikimporte | Gebäude-, Innenraum- und Originalweltimport anschließend in der isolierten Testkopie erfolgreich ausgeführt; Arbeitsprojekt und ausgelieferte Spielgrafiken dabei unverändert |
| Export-/Datenschutzprüfung | Alle 2.524 freigegebenen Dateien gescannt; keine Treffer der geprüften privaten Pfad-/Credential-Muster; Link-/Traversalprüfungen bestanden |
| Dokumentationslinks | Relative Links der eigenen Dokumentation im vollständigen Export aufgelöst |

Die Prüfungen gelten für Windows x64 auf dem Entwicklungsrechner. Ein
GitHub-CI-Lauf, eine unabhängige frische Betriebssysteminstallation und ein
neuer vollständiger manueller Spieldurchlauf werden damit nicht behauptet.
Die bestehenden Paketstart-/Server-Sicherheitsprüfungen des vorangegangenen
Audits bleiben zusätzlich dokumentiert. Zwei große JavaScript-Bundle-/Font-
Hinweise von Vite sind keine fehlgeschlagenen Prüfungen; kein fehlerfreier
Browser-Spieldurchlauf wird allein aus dem Build abgeleitet.

Die optionale Python-Importpipeline wird nicht automatisch installiert oder
vollständig neu ausgeführt. Vorhandene Quellbilder und fertige Medien sind
ohne diesen Neuimport verwendbar. Ein Muster-Secret-Scan kann unbekannte
Tokenformate und sensible Freitexte übersehen.
