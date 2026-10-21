# Prüfung 0.8.0 — Kanto-Welt, Minimap und Innenräume

## Automatisierte Prüfungen

`npm test`: **96 bestanden**, keine Fehler. `npm run build` einschließlich TypeScript-Prüfung erfolgreich. Die bekannte Größenwarnung des Phaser-Bündels bleibt. Tests (`qa/v8-tests-final.txt`, nur im lokalen Arbeitsbestand) · Build (`qa/v8-build.txt`, nur im lokalen Arbeitsbestand).

- Alle **58 Gebäudetüren** gehören zu einem verbundenen Straßennetz. Straßenmittellinien bleiben außerhalb von Fundamenten und innerhalb begehbarer Flächen; auch die gezeichneten Übergänge werden geprüft.
- Alle **57 Verbindungen**: durchgehend begehbare Mittellinien und breite Seitenstreifen nach Freischaltung. Fußwege an Küsten bleiben durchgängig Land oder Holzdeck.
- Jede erzeugte Gebietssperre: gesamte Breite ohne Kollisionslücke, Bewegung/Dash gestoppt, nach Erhalt der Reisehilfe offen.
- Gebäudezugang für jede der **27 Storyetappen**, einschließlich abgeschlossenem Inhalt, unbenutzten Häusern und noch abzuholender Beute.
- Alle bestehenden Raumlayouts: Möbel, NPC-Erreichbarkeit, Ausgang und Speicher-Rundlauf. Alte Spielstände in heute geschlossenen Häusern bleiben verlassbar.
- Hintergrundtakt: Zeitfortschritt ohne gehaltene Eingaben, Halt bei Entscheidungen, begrenztes Nachholen nach vollständiger Aussetzung.
- Bisherige Regressionen für 151 Arten, Entwicklung, Kampagne, Speicherstände, Fang, Baumkollision, Dash und Heilversorgung bestehen weiter.

## Sichtprüfung und Spieltest

Getrennte Testadresse **4175**; reguläre Menüs, Bewegung und Spielstandimport. Spielstände auf **4173** wurden nicht ersetzt.

- Alle **51 Orte** in der gemeinsamen Gelände-/Minimap-Darstellung visuell verglichen: Städte (`qa/v8-atlas-1.png`, nur im lokalen Arbeitsbestand), Routen 2–13 (`qa/v8-atlas-2.png`, nur im lokalen Arbeitsbestand), Routen 14–25 (`qa/v8-atlas-3.png`, nur im lokalen Arbeitsbestand), Dungeons und letzte Ziele (`qa/v8-atlas-4.png`, nur im lokalen Arbeitsbestand). Prüfseite: `qa/v8-world-review.html` am Entwicklungsserver; nicht Bestandteil des Produktionsbuilds.
- Alabastia: verbundene Hauspodeste, Straßen um Fundamente, neue Minimap mit Blickrichtung und Zielmarkierung. Spielansicht (`qa/v8-alabastia.png`, nur im lokalen Arbeitsbestand).
- Haus ohne Auftrag: E belässt den Trainer draußen und zeigt den konkreten Schließhinweis. Beleg (`qa/v8-closed-house.png`, nur im lokalen Arbeitsbestand).
- Vertanias nördliche Sperre reicht sichtbar von einem bewaldeten Rand zum anderen. Ansicht (`qa/v8-gate.png`, nur im lokalen Arbeitsbestand).
- Markt über E betreten, zur Theke gelaufen, Verkäufer angesprochen und Handelsmenü geöffnet. Neue warme Fliesen und Innenraum-Minimap sichtbar. Spielansicht (`qa/v8-market.png`, nur im lokalen Arbeitsbestand).
- Raumkanten, Sockel und Ausgang geprüft: Markt (`qa/v8-market-room.png`, nur im lokalen Arbeitsbestand), Center (`qa/v8-center-room.png`, nur im lokalen Arbeitsbestand), Arena (`qa/v8-arena-room.png`, nur im lokalen Arbeitsbestand).
- Fokuswechsel: **00:56 → 01:35** bei rund 39 Sekunden Echtzeit; davor und danach kein Pausendialog. Messung (`qa/v8-focus.json`, nur im lokalen Arbeitsbestand). Esc pausiert weiterhin regulär.
- Im Spiel-Browserprotokoll keine Warnungen/Fehler. Die separate Prüfseite erzeugte zunächst beim Verstecken ihres 3D-Zeichenbereichs einen Framebuffer-Fehler; der Prüfseitenwechsel wurde auf Pause und Verlagerung bei unveränderter Zeichenflächengröße korrigiert. Nach der Korrektur wurden alle 51 Ansichten ohne neue Browserfehler erzeugt (Nachprüfung (`qa/v8-world-review-fixed.json`, nur im lokalen Arbeitsbestand)). Diese Prüfseite wird nicht ausgeliefert. Protokoll (`qa/v8-browser-log.json`, nur im lokalen Arbeitsbestand).

## Auslieferung und Grenzen

Der fertige Produktionsbuild wurde zusätzlich auf der getrennten Testadresse geladen; der gespeicherte Markt-Innenraum ließ sich regulär fortsetzen. Produktions-Browserprotokoll ohne Warnungen/Fehler (`qa/v8-production-browser-log.json`, nur im lokalen Arbeitsbestand).

**http://127.0.0.1:4173/** liefert **0.8.0**. HTML, aktuelle JS-/CSS-Bündel und Innenraumgrafiken: **59 Dateien mit HTTP 200 und identischem lokalem Inhalt**. HTTP-Nachweis (`qa/v8-http.json`, nur im lokalen Arbeitsbestand).

Die Kontrolle umfasst die gesamte definierte Karten-Geometrie und alle Ortsübersichten, nicht eine erneute manuell durchgespielte 27-Etappen-Kampagne. Die Kanto-Welt bleibt eine verdichtete Survivors-Adaption. Browser und Betriebssystem können Hintergrundausführung drosseln oder vollständig aussetzen; das Spiel selbst öffnet beim Fokusverlust keine Pause. Nach vollständiger Aussetzung werden pro Hintergrundtakt höchstens zwei Sekunden nachgeholt.

Belege der vorherigen Fassung bleiben als `qa/v7-*` erhalten.

Hinweis zum Quellcodeexport: Verweise auf lokale Bild-/Testbelege sind als Text
markiert; die zugehörigen Dateien gehören nicht zum öffentlichen Snapshot.
