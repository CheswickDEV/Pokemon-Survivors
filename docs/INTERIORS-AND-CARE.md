# Innenräume und Center — 1.0.0-rc.4

Geprüft am 20. Oktober 2026.

**rc.6.2:** Alle 58 Räume mit laufender Engine, Trainer und Pokémon erneut vor und
nach den Änderungen angesehen. Tresenpersonal, Teppichanschlüsse, NPC-Fußanker
und die Oberflächenzuordnung wurden korrigiert. Die aktuelle Sichtprüfung mit
Raumliste und Bildnachweisen steht in [Innenraumprüfung](INTERIOR-VISUAL-AUDIT.md).

**rc.6.1:** Die frühere visuelle Freigabe der Center-Rezeption war unzureichend.
Die vollständigen Originalkacheln ersetzen nun den unvollständigen Vordergrund.
Aktuelle Beschreibung und Nachweise: [Center-Korrektur](CENTER-REPAIR.md).

**RC6-Nachprüfung:** Alle 58 Räume erneut im tatsächlichen Raumrenderer angesehen.
Die Center-Rezeption hatte zusätzlich einen Tiefensortierfehler: Die Heilmaschine
zeichnet jetzt die hinteren 32 Quellpixelzeilen hinter Joy und die unteren 16
Zeilen vor ihr. Der Originalausschnitt bleibt unverändert. Joys Standpunkt und
Bills Bücherregal wurden angepasst. Alle 88 NPC-Zugänge sind erreichbar; zehn
Center erhalten Trainer-KP exakt. Ergebnisse: [RC6-Prüfung](RC6-VALIDATION.md).

## Center-Regel

Schwester Joy füllt ausschließlich die Ausdauer sämtlicher Team-Pokémon auf,
einschließlich Reserven und erschöpfter Partner. Eine laufende Erholungspause
endet. Die Trainer-KP bleiben exakt unverändert, auch mit Heilungsboni,
wiederholtem Besuch oder Speichern/Laden. Die bestehende Sperrzeit von
20 Sekunden, der Rastpunkt und einmalige Besuchsvorräte bleiben erhalten.

Der Neustart nach einer Niederlage ist weiterhin eine separate Wiederbelebung
mit Münzverlust. Tränke, begrenzte Notversorgung und Kampfheilung behalten ihre
bisherigen Regeln.

## Gefundene Darstellungsprobleme

Die bisherigen Möbelbilder enthielten unterschiedlich große transparente Ränder.
Beispielsweise belegte die Arenastatue nur die linke obere Hälfte ihres Bildes;
Regale enthielten acht leere Pixel unter ihrem sichtbaren Boden. Das Bildzentrum
und die Unterkante waren deshalb keine verlässlichen Anker. Zusätzliche,
unterschiedliche Vergrößerungen verzerrten die Pixelgrößen.

Der Renderer verwendet jetzt die tatsächlichen sichtbaren Ausschnitte der
unveränderten Quelldateien. Ein Quellpixel entspricht bei jedem Möbelstück zwei
Weltpixeln. Bild, Standfläche, Tiefensortierung und Minimap greifen auf dieselben
Maße zurück. In Centern wurden Tresen, Schwester Joy, Wartebereich und Teppich
neu aufeinander abgestimmt. Der Teppich beginnt vor dem Tresen.

## Inhaltsprüfung

Alle **58 Räume, 275 Möbel und 88 NPCs** sind inventarisiert. Alle zehn Center
verwenden denselben korrigierten Raumplan, einschließlich Azuria.

| Gebäude | Einrichtung und Ansprechpartner |
|---|---|
| Dein Zuhause | Mama, Bett, Tisch und Regal; Hinweis auf getrennte Trainer-KP und Pokémon-Ausdauer |
| Haus des Rivalen | Schwester des Rivalen, Wohneinrichtung und Teamwechsel-Hinweis |
| Trainerschule | Lehrerin, Bücherregale und Unterrichtstisch; eigene Pokémon-Erfahrung |
| Nidoran-Haus | Nidoran-Freundin mit Entwicklungshinweis |
| Fahrradladen | Fahrradhändler, Verkaufstresen und vier Fahrräder statt Schlafzimmer; kein vorgetäuschter Fahrradkauf |
| Überfallenes Haus | Bewohnerin, Regale und Tisch; Hinweis auf Team Rocket |
| Mr. Fujis Haus | Betreuerin und gemeinschaftliche Sitztische |
| Namensbewerter | Namensbewerter und Arbeitszimmer; Dialog, keine vorgetäuschte Umbenennungsfunktion |
| Pokémon-Fanclub | Vorsitzender und mehrere Sitztische |
| Haus des Anglers | Angler und Wohnraum; Hinweis auf Küsten und Surf |
| Prismania-Hotel | Rezeption und zwei Betten |
| Safari-Wärter | Wärter und Arbeitszimmer; Safari-Hinweis |
| Nachahmerin | Eigene Bewohnerin und Wohnraum |
| Bills Küstenhaus | Bill, Laborboden und Laborgeräte; bestehende Storyprüfung |
| Märkte und Kaufhaus | Händler hinter dem Tresen, Warenregale; Vertanias Lieferant bleibt separat erreichbar |
| Museum und Labore | Exponate beziehungsweise Arbeitsgeräte; Museumsführer oder Wissenschaftler |
| Arenen und Liga | Leiter und Guide, korrigierte Statuen; freie Kampffläche |
| Höhlen, Turm, Villa und Rocket-Versteck | Passende Randobjekte; Höhlen ohne Hausteppich, bestehende Prüfungen und freie Laufwege |

Diese Prüfung ergänzt keine mehrstöckigen Originaldungeons oder bislang nicht
implementierten Hausfunktionen.

## Nachweise

- **128 Tests bestanden**, Typprüfung und Produktionsbuild bestanden.
- Jede der 58 Einrichtungen wurde durch den tatsächlichen Spielrenderer
  gezeichnet und in einer vollständigen Galerie gesichtet. Frischer
  Galeriedurchlauf ohne erfasste Konsolenwarnungen oder Fehler.
- Kollisionsprüfung flutet jeden Raum vom Eingang aus: alle NPC-Ansprechpunkte
  und Ausgänge erreichbar. Möbel liegen innerhalb der Räume und überdecken
  sich nicht. Sichtbare Bildmaße und Bodenanker sind geprüft.
- Alle zwölf dateibasierten Möbelvarianten wurden gegen die tatsächlichen
  Alpha-Grenzen ihrer PNGs geprüft; das Fahrrad entsteht lokal im Renderer.
- Alle zehn Center mit 1, 37, 99 und 100 Trainer-KP, sechs Partnern, Reserven,
  Erholungspausen, Heilungsbonus, Sperrzeit, erneutem Besuch und Sicherungen
  getestet.
- Im Browser in Azuria: Trainer vor und nach Joy **37/100 KP**, Schiggy von
  Erholung mit 12 Ausdauer auf volle Ausdauer. Speichern und Fortsetzen
  bewahren diese Werte.

Lokale Belege: `qa/interior-audit.json`, `qa/interior-art-check.json`,
`qa/interior-58-after.png`, `qa/interior-center-live-after.png`,
`qa/interior-center-room-after.png`, `qa/interior-tests.txt`.
Diese QA-Dateien gehören nicht zum öffentlichen Quellcodeexport.

## Auswirkung auf die Kanto-Balance

Die bisherigen erfolgreichen rc.3-Storysimulationen nutzten die jetzt entfernte
Trainer-Heilung im Center und sind kein aktueller Durchspielnachweis.
Die unveränderte Kampfsteuerung schafft auf Standard nun:

| Starter | Geschaffte Etappen | Niederlage |
|---|---:|---|
| Bisasam | 22 von 27 | Bruno |
| Glumanda | 18 von 27 | Pyro |
| Schiggy | 18 von 27 | Pyro |

Der Test überspringt Reisewege, kämpft mit gewöhnlicher Bewegung, wählt
Verbesserungen und fängt Belohnungspartner. Er kauft keine Notversorgung und
optimiert die Teamzusammenstellung nicht wie ein erfahrener Spieler.
Die Heilregel wurde nicht durch zusätzliche Trainer-Heilung an anderer Stelle
ausgeglichen. Ein vollständiger manueller Kanto-Durchlauf und die Abnahme der
Langzeitbalance unter dieser Regel stehen weiterhin aus.
