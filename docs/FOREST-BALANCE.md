# Wald-Balance und RPG-Karten — 1.0.0-rc.2

Historischer Prüfstand rc.2. Seit rc.3 werden Levelangebote zufällig gezogen;
die unten dokumentierte garantierte Rangkarte gilt deshalb nicht mehr.
Aktuelle Bosswerte und erneute Laufprüfungen stehen in [WORLD-POLISH.md](WORLD-POLISH.md).

Geprüft am 20. Oktober 2026. Ziel: Lernlauf und Expedition auf Standard mit
Bisasam, Glumanda und Schiggy bewältigen können, wenn Bewegung, Fänge,
Verbesserungen und Ausrüstung sinnvoll eingesetzt werden. Ein Sieg ist nicht
garantiert. Veteran und Meister bleiben anspruchsvoller.

## Änderungen am Spiel

- **Aquaknarre:** Intervall 1,6 → 1,4 Sekunden, Strahlhalbbreite 10 → 17
  Welteinheiten. Hydropumpe wächst auf 20. Schaden, Durchdringungszahl und
  Reichweite bleiben erhalten. Gegner neben der Linie werden weiterhin nicht
  getroffen; Schiggy bekommt keinen Rundumangriff.
- **EP am richtigen Ort:** Bei vielen Bodenfunden werden die räumlich nächsten
  Funde derselben Art zusammengefasst. Der gesamte Wert bleibt erhalten. Neue
  EP werden nicht mehr mit beliebigen alten Funden an deren weit entfernten
  Ort versetzt. Bei einer Zusammenfassung bleibt eine bestehende Fundposition
  erhalten.
- **Verlässlicher Ausbau:** Solange ein aktiver Partner noch trainierbar ist,
  enthält jedes Levelangebot eine passende Rangverbesserung. Truhen bevorzugen
  ebenfalls aktive Partner. Danach bleiben Reserven trainierbar. Mehr Pokémon
  zu fangen verwässert so nicht mehr die garantierte Verbesserung.
- **Elite-Druck:** Automatische Eliten und seltene Lichtungen teilen sich eine
  Grenze: zwei auf Entspannt/Standard, drei auf Veteran, vier auf Meister.
  Laufende Questwächter werden dabei mitgezählt. Zusätzliche freiwillig
  begonnene Quests bleiben möglich. Der unabhängige Hornliu-Elitetimer entfällt.
  Aufgeschobene Ereignisse erzeugen keinen Nachholschwarm.
- **Schwierigkeit:** Gegner-KP, Schaden, reguläre Wellenraten und
  Boss-Warnzeiten wurden nicht pauschal abgesenkt. Spezialschwärme verwenden
  nun ebenfalls den Geschwindigkeitsfaktor der gewählten Stufe.
- **Heilung:** Dropchance, Mindestabstand zwischen Heilfunden, Kaufgrenzen,
  Trainer-KP und bestehende Heilfähigkeiten wurden nicht erhöht.

## Abgeschlossene Waldsimulationen

Der Testspieler bewegt sich mit normalen Eingaben, weicht aus, sammelt EP,
fängt Partner, erfüllt Quests, kauft verfügbare Ausrüstung und entwickelt sein
Team. Er erhält keine zusätzlichen KP, EP, Ränge, Münzen oder Schadensboni.
Er behält den ursprünglichen Starter im Team. Die Begegnungslisten werden
unverändert aus dem Seed erzeugt; Endentwicklungen können regulär vorkommen.

Standard verwendet fünf Seeds: **123, 456, 789, 2026, 98765**. Die letzten
beiden wurden erst nach den ersten Ergebnissen als zusätzliche Prüfwelten
verwendet. Veteran und Meister verwenden jeweils 123 und 456. Alle drei
Starter laufen in jeder Kombination.

| Schwierigkeit | Lernlauf | Expedition |
|---|---:|---:|
| Standard | 15/15 Siege | 13/15 Siege |
| Veteran | 4/6 Siege | 3/6 Siege |
| Meister | 2/6 Siege | 1/6 Siege |

| Starter auf Standard | Lernlauf | Expedition |
|---|---:|---:|
| Bisasam | 5/5 | 4/5 |
| Glumanda | 5/5 | 4/5 |
| Schiggy | 5/5 | 5/5 |

Die beiden Standard-Niederlagen bleiben dokumentiert: Glumanda bei Seed 123
nach 1.089 Sekunden, Bisasam bei Seed 789 nach 733 Sekunden. Das sind echte
Niederlagen, keine ausgeblendeten Ausreißer. Alle zwölf zusätzlich angesetzten
Standard-Läufe auf den beiden Prüfwelten wurden gewonnen.

**Kontrollen:** Ein ausweichender Spieler ohne Fänge, Quests und Einkäufe
gewinnt 0/6 Läufe; darunter ein Boss-Zeitlimit statt Tod. Ein stationärer
Spieler gewinnt ebenfalls 0/6. Beide dürfen normale Levelangebote nutzen.
Teamaufbau und Bewegung bleiben somit relevant.

Insgesamt: **66 beendete Läufe, 11,15 Stunden simulierte Spielzeit**.
Kein Lauf erreichte das technische Simulationslimit. Das sind keine elf
Stunden manueller Spieltests und keine Vorhersage menschlicher Siegquoten.
Die Regeln wurden nicht pro Starter oder während eines Laufs verdeckt
angepasst.

Der alte Testspieler übersah Händler, verfolgte unpassende Ziele und
berücksichtigte die größere Spieler-Hitbox nicht korrekt. Seine früheren
1/3- beziehungsweise 0/3-Ergebnisse sind deshalb kein sauberer Vergleich für
eine behauptete reine Balanceverbesserung. Auch eine Kontrollmessung vor den
Spieländerungen zeigte mit besserer Steuerung bereits deutlich mehr Siege.

## Karten

Die Minimap zeichnet geglättete Konturen und klare Symbole. Waldwege stammen
aus denselben Kurven und Lichtungen wie das Gelände. Bäume, Büsche, Felsen,
Rangerlager und seltene Lichtungen stammen aus der tatsächlichen Erzeugung
mit demselben Seed. Keine zusätzliche Zufallsdekoration nur für die Karte.

Kanto verwendet die gemeinsamen Geländegrenzen, Straßen, Wasserflächen,
Gebäudegrundlagen und Routensperren. Der Innenraumplan zeigt Einrichtung,
NPCs, Teppich beziehungsweise Arenafläche und Ausgang. Gegner, Fangziele,
Truhen und aktive Questziele liegen auf ihren wirklichen Koordinaten.
Norden bleibt oben; der Trainerpfeil dreht sich mit der Blickrichtung.

Auch die große Waldkarte verwendet dieselben Wege und Landschaftspositionen.
Weit außerhalb des Startgebiets bleibt ihr Ausschnitt begrenzt und zeigt
Richtungen zu entfernten Aufträgen. Sie erzeugt keine riesige, unlesbare
Gesamtkarte eines unendlichen Waldes.

## Regressionen und Reproduktion

- 111 automatisierte Tests, darunter lokale EP-Erhaltung, aktive Rangangebote,
  Elite-Grenzen, Wasserstrahl-Geometrie und Kartentreue bei negativen und
  positiven Weltkoordinaten.
- Kanto: erneut 27/27 Etappen mit allen drei Startern. Reisewege werden in
  dieser Kampfsimulation übersprungen.
- Bossansturm: Entspannt, Standard und Veteran jeweils 3/3 Siege; Meister
  0/3, Niederlagen nach 12, 10 und 7 Prüfungen.
- Browserprüfung von Wald, großer Waldkarte, Kanto und Innenräumen.
  Die importierten Karten-Prüfstände sind synthetische Sichtprüfungen und
  zählen nicht als bestandene Balance-Läufe.

`npm run test:forest-balance` startet die Standardprobe mit Seed 123.
Der Treiber unterstützt `PROBE_SEEDS`, `PROBE_MODES` (`learn,normal`),
`PROBE_DIFFICULTIES` (`standard,veteran,master`), `PROBE_POLICY`
(`prepared,wander,idle`) und `PROBE_OUTPUT` als Umgebungsvariablen.
Rohdaten der durchgeführten Läufe liegen lokal in `qa/forest-*.json`,
die Zusammenfassung in `qa/forest-balance-summary.json`.

Unabhängige menschliche Spielabnahme, längere Endlosläufe und Tests auf
schwächerer Hardware bleiben Teil der endgültigen 1.0-Abnahme. Die offenen
Medienrechte und Veröffentlichungsgates werden durch diese Tests nicht
aufgehoben.
