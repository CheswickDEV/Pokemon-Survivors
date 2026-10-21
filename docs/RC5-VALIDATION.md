# RC5: Spielregeln und Prüfung

## Neue Regeln

Der Dash dauert 0,20 Sekunden und schützt zusätzlich 0,10 Sekunden beim Austritt.
Die vier diagonalen Sprite-Reihen aller sechs Trainer sind unverändert. Die
sichtbare Fläche und Höhe der geraden Ansichten wird einmal beim Laden anhand
der diagonalen Referenz gemessen; keine wechselnde Skalierung zwischen Schritten.

Kanto beginnt mit Pokémon-Levelgrenze 16. Die acht Orden erhöhen sie auf
22, 28, 34, 40, 46, 52, 58 und 70; der Championstatus hebt sie auf 100.
Je Orden: +3 % Team-Attackenschaden und 2 Prozentpunkte Schutz vor Trainer-Schaden.
Alte überhöhte Partnerlevel werden nicht gelöscht; im Kampf gilt die Levelgrenze.
Am Limit werden keine EP angespart. Wald und Bossansturm behalten Levelgrenze 100.

Levelangebote: Gewöhnlich +1 Rang (Gewicht 65), Selten +2 (25), Episch +3 (9),
Legendär +4 (1). Nur Seltenheiten, deren volle Ränge noch passen, werden gezogen.
Entwicklungen erhalten eine eigene epische Darstellung; einfache Rast bleibt gewöhnlich.
Die seltene Verbesserung nimmt weiterhin einen bestehenden Ausrüstungsplatz ein.

Die Stadt-/Routenübersicht verwendet die originale FR/LG-Kanto-Karte.
Innenräume und besondere Ziele mit identischen Originalpositionen erhalten kleine
versetzte Auswahlmarkierungen. Das ist eine Regionsübersicht; die lokale RPG-Minimap
zeichnet weiterhin die tatsächlichen Gebäude, Wege, Bäume, Gegner und Positionen.
Ortswahl ersetzt nur die Informationskarte, nicht das Kartenfenster. Mausradzoom
1–4× und linkes Ziehen erhalten die Position. Die ungenutzte originale
Regionwechsel-Fläche unten rechts trägt im Betrachter eine Kompassüberlagerung.

Der Helm-Bauarbeiter und die weißen Zaunteile stammen aus Feuerrot/Blattgrün.
Rubin/Saphirs Route-116-Tunnelarbeiter verwendet den anderen BLACK_BELT-NPC.
Herkunft und Hashes: `asset-sources/original-overworld.md` und Runtime-Assetliste.

## Kampfvergleich

Reproduzierbar mit `node --experimental-strip-types tests/rc5-balance-probe.ts`.
Trainerlevel 16, Bisasam/Glumanda/Schiggy jeweils Level 16, keine Ausrüstung,
volle Start-KP, reale automatische Attacken und reale Trefferprüfung in Rockos Arena.
Nur Anreise/Vorbereitung werden übersprungen. Keine Heilung/Unverwundbarkeit oder
Schadensgeschenke während dieser Balancekämpfe. Der Ausweich-Bot kennt Warnflächen
sofort und reagiert schneller als ein menschlicher Spieler.

| Stufe | Attackenrang | Stillstehen | Ausweich-Bot |
|---|---:|---|---|
| Standard | 4 | Sieg 27 s, 11 KP | Sieg 15 s, 100 KP |
| Standard | 8 | Sieg 18 s, 11 KP | Sieg 10 s, 100 KP |
| Veteran | 4 | Niederlage 15 s | Sieg 83 s, 100 KP |
| Veteran | 8 | Niederlage 15 s | Sieg 38 s, 100 KP |
| Meister | 4 | Niederlage 10 s | Niederlage 383 s |
| Meister | 8 | Niederlage 10 s | Sieg 226 s, 52 KP |

Meister-Rockos beide Gegner haben jeweils 11.484 KP, drei Phasen und angekündigte
Standort-Einschläge, später Folgeringe und eine zusätzliche Querbahn. Positionen
werden beim Ankündigen fixiert. Es gibt weiterhin erreichbare Fluchtpositionen.
Dieses günstige Gras-/Wasser-Team ist kein Nachweis für alle möglichen Teams.

18 Standard-Waldläufe (3 Starter × Lernlauf/Expedition × Seeds 123,456,789):
15 Siege, 3 Niederlagen. Alle Starter schaffen beide Modi in dieser Stichprobe.
Die Simulation verwendet reguläre Fänge, Ausrüstung, Bewegung und Questbelohnungen.
Sie garantiert weder den Erfolg eines einzelnen Seeds noch eine bestimmte menschliche Schwierigkeit.
Die spätere vollständige Kanto-Kampagne unter der Regel ohne Center-KP-Heilung bleibt
separat abzunehmen; diese Prüfung konzentriert sich auf die angefragten Systeme.

## Browser und Leistung

Browserprüfungen laufen getrennt vom Nutzerspielstand auf einem eigenen lokalen Port.
`qa/rc5-browser.html` zeigt reale Spielansichten, alle 48 Trainerrichtungen,
Seltenheitskarten und Messwerte. Beim reinen Leistungstest werden Trainer-KP
aufgefüllt, damit der simulierte Kampf über das gesamte Messfenster läuft;
diese Werte werden nicht für die obige Balance verwendet.

Die Simulation läuft mit festen 60 Schritten pro Sekunde. Die Darstellung folgt
der Monitorfrequenz. Der Geländehintergrund der Minimap wird zwischengespeichert,
bewegte Marker bleiben aktuell. Kollisionen und Szenenobjekte verwenden gemeinsame
Chunkdaten; unnötige HUD-/Profilupdates zwischen Simulationstakten entfallen.

Konkrete Browsermessungen und Paketnachweise werden zusammen mit den QA-Ergebnissen
abgelegt. Einzelne Lade-/Gebietswechselspitzen sind getrennt vom laufenden Bildtakt
zu bewerten; eine hardwareunabhängige Garantie für lückenlose 60 FPS gibt es nicht.


## Gemessene Browserwerte

Auf dem Testrechner mit ca. 165-Hz-Darstellung, jeweils 30 s:

| Szene | Bilder/s im Mittel | Bildabstand p95 | längster Bildabstand | Minimap p95 |
|---|---:|---:|---:|---:|
| Meister-Wald, am Ende 188 Gegner | 164,4 | 6,3 ms | 31,7 ms | 0,3 ms |
| Meister-Arena mit Dreierteam | 165,1 | 6,2 ms | 9,7 ms | 0,3 ms |
| Alabastia–Vertania mit Gebietswechseln | 163,4 | 6,4 ms | 22,3 ms | 0,2 ms |

Die feste Simulation bleibt bei 60 Hz. Der Wald-Stresstest erreicht das 60-FPS-Ziel
im laufenden Betrieb mit Reserve; sein längster Einzelabstand zeigt trotzdem einen
kurzen Ausreißer. Ergebnisse gelten für diesen Rechner und diese Szenen.

Die Gebietsprüfung erstellte 24 neue Geländeabschnitte. Vorgezogene Erzeugung wird
über mehrere Bilder verteilt; bei bereits beanspruchten Bildern wird sie
zurückgestellt. Die längste einzelne Erzeugung betrug 20,3 ms. Damit sind kurze
Spitzen reduziert, aber nicht vollständig ausgeschlossen.

## Funktionsnachweise

- TypeScript-Prüfung erfolgreich.
- 136 automatisierte Tests bestanden, keine Fehler oder übersprungenen Tests.
- Davon bestehen 125 Kernprüfungen auch ohne Grafikdateien und npm-Abhängigkeiten.
- Auswahl eines Kartenorts erhält denselben Kartenknoten und die Zoomposition.
  Mausradzoom und linkes Ziehen wurden im Browser ausgeführt; Ziehen löst keine
  Ortsauswahl aus.
- Alle 48 Traineransichten und vier Seltenheitsstufen in der realen Darstellung
  geprüft. Originalgrafiken der neuen Regionskarte und Baustellen sind über
  SHA-256 in der Paket-Positivliste festgelegt.
