# Installation und erster Start

## Vollständiges Entwicklerprojekt

Das **developer.zip** enthält alles zum Bearbeiten des aktuellen Spiels:
Quellcode, Bilder, Rufe, lokale Daten, Tests und Medienquellen. Das vollständige
Repository hat denselben Inhalt. Ein separater kleiner **source.zip**-Export
enthält nur Code und Hinweise; ohne Spielmedien ist er nicht spielbar.

1. [Node.js](https://nodejs.org/en/download) in der **22.x-Linie**, mindestens
   **22.23.3**, installieren. npm wird mitgeliefert. Ein bestehendes Terminal
   danach neu öffnen. Node 24/andere Hauptversionen sind hier nicht abgenommen.
2. ZIP vollständig entpacken oder Repository mit Git klonen. Terminal im Ordner
   öffnen, der `package.json` enthält. Keine Administratorrechte erforderlich.
3. Abhängigkeiten installieren und Vollständigkeit prüfen:

```text
npm ci
npm run doctor -- --player
```

4. Entwicklungsserver starten:

```text
npm run dev
```

Die ausgegebene Adresse öffnen (normalerweise **http://127.0.0.1:5173/**).
Der Server ist nur lokal erreichbar. Codeänderungen werden automatisch
übernommen. Mit **Strg+C** im Terminal beenden.

`npm ci` installiert ausschließlich in diesem Projekt, verwendet feste Versionen
aus `package-lock.json` und benötigt einmalig Internet. `.npmrc` deaktiviert
Installationsskripte der Abhängigkeiten. Keine globale Paketinstallation nötig.
Nach der Installation braucht der normale Spiel-/Entwicklungsbetrieb kein
Internet. Git, Python und die Grafikwerkzeuge sind dafür optional.

Zum Prüfen und Bauen:

```text
npm run check
npm test
npm run build
npm start
```

Der fertige Build läuft auf **http://127.0.0.1:4173/**. Nicht `index.html` direkt
öffnen. Entwicklungs- und Buildadresse verwenden getrennte Browser-Spielstände.

Windows x64 mit aktuellem Edge/Chrome ist das lokal geprüfte Ziel. Eine
Windows-/Linux-CI ist vorbereitet; sie wurde noch nicht auf GitHub ausgeführt.
macOS/Linux-Spielbetrieb sowie ARM64 sind nicht separat abgenommen.
Tastatur und Maus sind erforderlich; keine gemessene Mindest-RAM-/GPU-Zusage.

## Windows-Spielerpaket

Wer nur spielen möchte, kann ein vorbereitetes lokales
`Windows-x64-LOCAL-ONLY.zip` vollständig entpacken und **Spiel starten.cmd**
doppelklicken. Die Node-Laufzeit liegt darin unter `runtime/`.
Kein npm, Git, Python, Steam oder anderes Spiel erforderlich.

Das Startfenster offen lassen. Der Browser öffnet **http://127.0.0.1:4173/**.
Zum Beenden speichern und Startfenster schließen. Das Paket richtet weder
Dienste noch Autostarts ein. Die Bezeichnung LOCAL-ONLY dokumentiert die
offenen Medienrechte und Release-Abnahme; siehe [Freigabestand](RELEASE-READINESS.md).

## Spielstände, Updates und Entfernen

- Vor Updates im Camp **Alles sichern** wählen. Die JSON-Datei enthält Profil,
  Einstellungen und die Laufstände.
- Neue Version separat entpacken; altes Startfenster vor dem neuen Start schließen.
  In einem Git-Checkout vor Updates eigene Änderungen committen oder sichern;
  nach Lockfile-Änderungen erneut `npm ci` ausführen.
- Browserprofil, Host und Port bestimmen den lokalen Spielspeicher. Bei einem
  Wechsel Sicherung exportieren und im neuen Browser/Port importieren.
- Zum Entfernen Spiel schließen und Projektordner löschen. Spielstände bleiben
  in den Browser-Websitedaten der jeweiligen lokalen Adresse, bis diese gelöscht
  werden. Vorher exportieren.

## Hilfe bei Problemen

| Problem | Lösung |
|---|---|
| `node` oder `npm` nicht gefunden | Node.js 22.x inklusive npm installieren und Terminal neu öffnen. Mit `node --version` prüfen. |
| PowerShell blockiert `npm.ps1` | Dieselben Befehle mit `npm.cmd` ausführen oder die Windows-Eingabeaufforderung nutzen. Keine systemweite Ausführungsrichtlinie ändern. |
| Falsche Node-Version | 22.23.3 oder neueren 22.x-Patch wählen; ein vorhandener Versionsmanager kann `.nvmrc` verwenden. |
| Medien fehlen | Vollständiges developer.zip verwenden. Der source.zip-Export lässt Pokémon-Medien aus. |
| Medien wurden verändert | Nach eigener beabsichtigter Änderung `npm run assets:refresh`, anschließend Tests und Build. Unbeabsichtigte Änderungen zuerst klären. |
| Build-Prüfung meldet veraltet | Nach Code-/Dokumentationsänderungen erneut `npm run build` ausführen. |
| Optionales Bildwerkzeug fehlt | Nur für Medienimport: separate Installation nach [Entwicklerhandbuch](DEVELOPMENT.md). |
| Port 4173 belegt / andere Version läuft | Eigenes altes Startfenster schließen. Keine fremden Prozesse beenden. |
| Leere Seite / Bilder fehlen | Vollständig entpacken und über den lokalen Server öffnen; Doktor ausführen. |
| Fortschritt scheint weg | Browserprofil und genaue Adresse prüfen; Sicherung importieren. |
| Windows warnt vor unbekannter Datei | Herkunft/Prüfsumme prüfen; Sicherheitsfunktionen nicht deaktivieren. Das Gesamtpaket ist nicht signiert. |

Prüfsumme in PowerShell: `Get-FileHash .\DATEINAME.zip -Algorithm SHA256`.
Entwicklerdownload mit `DEVELOPER-SHA256SUMS.txt`, andere Pakete mit
`SHA256SUMS.txt` vergleichen. Ein Hash ist keine unabhängige Signatur.

Alle Pakete enthalten getrennte [Lizenzhinweise](../THIRD-PARTY-NOTICES.md).
Ein vollständiger Entwicklerdownload bedeutet keine pauschale Freigabe fremder
Medien unter GPL.
