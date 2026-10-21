# Sichtprüfung der Innenräume – 1.0.0-rc.6.2

Alle 58 vorhandenen Innenräume wurden vor und nach der Korrektur im Browser angesehen. Die Prüfung umfasst jeden Markt, jede Arena, das Kampf-Dojo, die Liga, alle NPC-Häuser sowie die übrigen Story-Räume und die Center.

Die Prüfansicht verwendet zwei laufende Instanzen der tatsächlichen `Engine` und von `createView`/`ForestScene`. Die Räume werden über `enterBuilding` betreten; Trainer, Partner, NPCs und Einrichtung werden mit dem Spielrenderer dargestellt. Die Übersichtskamera zeigt jeweils zwei vollständige Räume. In der zweiten Runde steht der Trainer an der Ansprechposition des ersten NPCs. Markt und Arena wurden zusätzlich in normaler Spielgröße betrachtet.

Dies ist eine visuelle Innenraumprüfung mit separaten Testzuständen, kein erneuter Kampagnendurchlauf. Der Nutzer-Spielstand wurde nicht geladen oder verändert. Die Übersichtskamera ersetzt die normale Verfolgungskamera ausschließlich in der lokalen Prüfansicht.

## Gefunden und korrigiert

- Die Mitarbeiter aller zehn Märkte, die Hotelangestellte und der Fahrradhändler standen zu hoch hinter ihren Tresen. Ihre unteren Körperteile werden jetzt passend von der Tresenkante verdeckt.
- Ein bis zwei transparente Pixelreihen unter den NPC-Füßen erzeugten einen unnötigen Abstand zum Boden. Der Sprite-Anker berücksichtigt nun die sichtbare Fußposition.
- Die Läufer in den Märkten und im Fahrradladen endeten teilweise unter Möbeln. Sie beginnen jetzt mit Abstand vor dem Tresen. Die Fahrräder stehen vollständig neben dem Mittelgang.
- Die Oberflächenwahl hing fälschlich davon ab, ob ein Raum eine Story-Prüfung enthielt. Deshalb sah das Dojo wie ein Wohnhaus aus, während Turm, Villa und Rocket-Versteck Arenaböden erhielten. Die Oberflächen richten sich jetzt nach der Gebäudefunktion.
- Arenen, Dojo und Liga haben eine eingefasste Standfläche unter dem Leiter statt eines isolierten Farbbalkens hinter ihm.
- Höhlen verwendeten Haus- oder Arenatapeten. Sie erhalten geschlossene Felsränder aus der vorhandenen Felsgrafik. Ein in der Nachprüfung entdeckter Überstand der letzten Kachel wurde ebenfalls behoben; alle sechs Höhlen wurden danach erneut angesehen.

Die Bett-, Regal- und übrigen Möbelgrafiken wurden gegen die vorhandenen Originalreferenzen geprüft. Ihre sichtbaren Ausschnitte sind vollständig. Die Originalgrafiken und der originale Hausboden wurden beibehalten.

## Nachweise

- **152 Tests bestanden**, einschließlich der Laufwege aller Innenräume, erreichbarer Ansprechpositionen, Teppich-/Möbelüberschneidungen und der Raumzuordnung.
- Je 29 Vorher- und Nachher-Aufnahmen unter `qa/interior-tour/`, insgesamt 58 Übersichtsbilder. Jede Aufnahme enthält zwei benannte Räume; beide wurden angesehen.
- Nahansicht: `qa/interior-tour/market-arena-detail.png`.
- Raumprotokoll: `qa/interior-tour-audit.json`.
- Die Bilder sind lokale Prüfnachweise und gehören nicht zum medienfreien Quellcodepaket.

Die folgende Liste ordnet jedem Raum seine Nachher-Aufnahme zu. Die Dateipfade beziehen sich auf den lokalen Projektordner.

<!-- ROOM_TABLE -->

| Nr. | Ort | Raum | Nachher-Aufnahme |
| --- | --- | --- | --- |
| 1 | Alabastia | Dein Zuhause | Bild (`../qa/interior-tour/after-01.png`, nur im lokalen Arbeitsbestand) |
| 2 | Alabastia | Haus deines Rivalen | Bild (`../qa/interior-tour/after-01.png`, nur im lokalen Arbeitsbestand) |
| 3 | Alabastia | Professor Eichs Labor | Bild (`../qa/interior-tour/after-02.png`, nur im lokalen Arbeitsbestand) |
| 4 | Vertania City | Pokémon-Center | Bild (`../qa/interior-tour/after-02.png`, nur im lokalen Arbeitsbestand) |
| 5 | Vertania City | Pokémon-Markt | Bild (`../qa/interior-tour/after-03.png`, nur im lokalen Arbeitsbestand) |
| 6 | Vertania City | Arena · Giovanni | Bild (`../qa/interior-tour/after-03.png`, nur im lokalen Arbeitsbestand) |
| 7 | Vertania City | Trainerschule | Bild (`../qa/interior-tour/after-04.png`, nur im lokalen Arbeitsbestand) |
| 8 | Marmoria City | Wissenschaftsmuseum | Bild (`../qa/interior-tour/after-04.png`, nur im lokalen Arbeitsbestand) |
| 9 | Marmoria City | Arena · Rocko | Bild (`../qa/interior-tour/after-05.png`, nur im lokalen Arbeitsbestand) |
| 10 | Marmoria City | Pokémon-Markt | Bild (`../qa/interior-tour/after-05.png`, nur im lokalen Arbeitsbestand) |
| 11 | Marmoria City | Pokémon-Center | Bild (`../qa/interior-tour/after-06.png`, nur im lokalen Arbeitsbestand) |
| 12 | Marmoria City | Nidoran-Haus | Bild (`../qa/interior-tour/after-06.png`, nur im lokalen Arbeitsbestand) |
| 13 | Azuria City | Pokémon-Center | Bild (`../qa/interior-tour/after-07.png`, nur im lokalen Arbeitsbestand) |
| 14 | Azuria City | Arena · Misty | Bild (`../qa/interior-tour/after-07.png`, nur im lokalen Arbeitsbestand) |
| 15 | Azuria City | Fahrradladen | Bild (`../qa/interior-tour/after-08.png`, nur im lokalen Arbeitsbestand) |
| 16 | Azuria City | Pokémon-Markt | Bild (`../qa/interior-tour/after-08.png`, nur im lokalen Arbeitsbestand) |
| 17 | Azuria City | Überfallenes Haus | Bild (`../qa/interior-tour/after-09.png`, nur im lokalen Arbeitsbestand) |
| 18 | Lavandia | Pokémon-Center | Bild (`../qa/interior-tour/after-09.png`, nur im lokalen Arbeitsbestand) |
| 19 | Lavandia | Mr. Fujis Haus | Bild (`../qa/interior-tour/after-10.png`, nur im lokalen Arbeitsbestand) |
| 20 | Lavandia | Pokémon-Markt | Bild (`../qa/interior-tour/after-10.png`, nur im lokalen Arbeitsbestand) |
| 21 | Lavandia | Namensbewerter | Bild (`../qa/interior-tour/after-11.png`, nur im lokalen Arbeitsbestand) |
| 22 | Orania City | Pokémon-Center | Bild (`../qa/interior-tour/after-11.png`, nur im lokalen Arbeitsbestand) |
| 23 | Orania City | Pokémon-Fanclub | Bild (`../qa/interior-tour/after-12.png`, nur im lokalen Arbeitsbestand) |
| 24 | Orania City | Arena · Major Bob | Bild (`../qa/interior-tour/after-12.png`, nur im lokalen Arbeitsbestand) |
| 25 | Orania City | Pokémon-Markt | Bild (`../qa/interior-tour/after-13.png`, nur im lokalen Arbeitsbestand) |
| 26 | Orania City | Haus des Anglers | Bild (`../qa/interior-tour/after-13.png`, nur im lokalen Arbeitsbestand) |
| 27 | Prismania City | Kaufhaus | Bild (`../qa/interior-tour/after-14.png`, nur im lokalen Arbeitsbestand) |
| 28 | Prismania City | Pokémon-Center | Bild (`../qa/interior-tour/after-14.png`, nur im lokalen Arbeitsbestand) |
| 29 | Prismania City | Arena · Erika | Bild (`../qa/interior-tour/after-15.png`, nur im lokalen Arbeitsbestand) |
| 30 | Prismania City | Prismania-Hotel | Bild (`../qa/interior-tour/after-15.png`, nur im lokalen Arbeitsbestand) |
| 31 | Fuchsania City | Pokémon-Markt | Bild (`../qa/interior-tour/after-16.png`, nur im lokalen Arbeitsbestand) |
| 32 | Fuchsania City | Arena · Koga | Bild (`../qa/interior-tour/after-16.png`, nur im lokalen Arbeitsbestand) |
| 33 | Fuchsania City | Pokémon-Center | Bild (`../qa/interior-tour/after-17.png`, nur im lokalen Arbeitsbestand) |
| 34 | Fuchsania City | Haus des Safari-Wärters | Bild (`../qa/interior-tour/after-17.png`, nur im lokalen Arbeitsbestand) |
| 35 | Zinnoberinsel | Pokémon-Center | Bild (`../qa/interior-tour/after-18.png`, nur im lokalen Arbeitsbestand) |
| 36 | Zinnoberinsel | Pokémon-Markt | Bild (`../qa/interior-tour/after-18.png`, nur im lokalen Arbeitsbestand) |
| 37 | Zinnoberinsel | Arena · Pyro | Bild (`../qa/interior-tour/after-19.png`, nur im lokalen Arbeitsbestand) |
| 38 | Zinnoberinsel | Pokémon-Labor | Bild (`../qa/interior-tour/after-19.png`, nur im lokalen Arbeitsbestand) |
| 39 | Saffronia City | Pokémon-Center | Bild (`../qa/interior-tour/after-20.png`, nur im lokalen Arbeitsbestand) |
| 40 | Saffronia City | Pokémon-Markt | Bild (`../qa/interior-tour/after-20.png`, nur im lokalen Arbeitsbestand) |
| 41 | Saffronia City | Arena · Sabrina | Bild (`../qa/interior-tour/after-21.png`, nur im lokalen Arbeitsbestand) |
| 42 | Saffronia City | Kampf-Dojo | Bild (`../qa/interior-tour/after-21.png`, nur im lokalen Arbeitsbestand) |
| 43 | Saffronia City | Haus der Nachahmerin | Bild (`../qa/interior-tour/after-22.png`, nur im lokalen Arbeitsbestand) |
| 44 | Indigo-Plateau | Pokémon-Liga | Bild (`../qa/interior-tour/after-22.png`, nur im lokalen Arbeitsbestand) |
| 45 | Indigo-Plateau | Pokémon-Center | Bild (`../qa/interior-tour/after-23.png`, nur im lokalen Arbeitsbestand) |
| 46 | Indigo-Plateau | Pokémon-Markt | Bild (`../qa/interior-tour/after-23.png`, nur im lokalen Arbeitsbestand) |
| 47 | Mondberg | Mondberg | Bild (`../qa/interior-tour/after-24.png`, nur im lokalen Arbeitsbestand) |
| 48 | Digdas Höhle | Digdas Höhle | Bild (`../qa/interior-tour/after-24.png`, nur im lokalen Arbeitsbestand) |
| 49 | Felstunnel | Felstunnel | Bild (`../qa/interior-tour/after-25.png`, nur im lokalen Arbeitsbestand) |
| 50 | Pokémon-Turm | Pokémon-Turm | Bild (`../qa/interior-tour/after-25.png`, nur im lokalen Arbeitsbestand) |
| 51 | Rocket-Versteck | Spielhalle · Rocket-Versteck | Bild (`../qa/interior-tour/after-26.png`, nur im lokalen Arbeitsbestand) |
| 52 | Silph Co. | Silph Co. | Bild (`../qa/interior-tour/after-26.png`, nur im lokalen Arbeitsbestand) |
| 53 | Seeschauminseln | Seeschauminseln | Bild (`../qa/interior-tour/after-27.png`, nur im lokalen Arbeitsbestand) |
| 54 | Pokémon-Villa | Pokémon-Villa | Bild (`../qa/interior-tour/after-27.png`, nur im lokalen Arbeitsbestand) |
| 55 | Kraftwerk | Kraftwerk | Bild (`../qa/interior-tour/after-28.png`, nur im lokalen Arbeitsbestand) |
| 56 | Siegesstraße | Siegesstraße | Bild (`../qa/interior-tour/after-28.png`, nur im lokalen Arbeitsbestand) |
| 57 | Azuria-Höhle | Azuria-Höhle | Bild (`../qa/interior-tour/after-29.png`, nur im lokalen Arbeitsbestand) |
| 58 | Bills Küstenhaus | Bills Küstenhaus | Bild (`../qa/interior-tour/after-29.png`, nur im lokalen Arbeitsbestand) |

Hinweis zum Quellcodeexport: Verweise auf lokale Bild-/Testbelege sind als Text
markiert; die zugehörigen Dateien gehören nicht zum öffentlichen Snapshot.
