# RC6: Kanto-Meister, Talente und Innenräume

**Korrektur der visuellen Abnahme:** Der Nutzer wies zu Recht auf weiterhin fehlende
Empfangsteile hin. Die hier beschriebene RC6-Rezeptionskorrektur war unzureichend.
Die vollständige Originalrekonstruktion folgte in rc.6.1; siehe
[Center-Korrektur](CENTER-REPAIR.md). Die Kampf- und Talentmessungen unten bleiben
Ergebnisse der RC6-Fassung.

Geprüft am 20. Oktober 2026. Lokale Testfassung 1.0.0-rc.6, kein öffentlicher Upload.

## Was tatsächlich geprüft wurde

Alle 27 Story-Etappen einschließlich acht Arenen, aller Questprüfungen, Top Vier,
Champion und Mewtu wurden mit der realen Engine bekämpft. Angriffsschaden,
Trainer-Treffer, Ausdauer, Bossphasen, Menüs und Speichern/Laden liefen regulär.
Die Simulation liest Warnflächen nach 0,12 Sekunden und entscheidet zehnmal pro
Sekunde über Richtung und Dash. Das ist ein präziser Testspieler, keine menschliche
Schwierigkeitsbewertung. Anreise, Fangen und Training werden vorbereitet; keine
Behauptung eines manuellen Durchspielens ab frischem Spielstand auf allen Wegen.
Bestehende Welt-/Innenraumtests prüfen zusätzlich Fortschrittssperren, Türen,
begehbare Verbindungen und alle NPC-Ansprechpositionen.

Referenz: erste zwei Etappen ein Starter mit Pokémon-Level 3/6 und Angriffsrang 2/3.
Danach drei Starterfamilien, in wechselnder Reihenfolge, am aktuellen Ordenlimit;
vor Level 36 erste Entwicklung, danach Endentwicklung. Rocko Rang 6, danach Rang 8.
Ab Mondberg sechs Ausrüstungen (Kraft, Tempo, Rüstung, Krit, Tempo beim Laufen,
Sammeln), mit Etappenfortschritt Rang 2 bis 5. Diese Vorbereitung liegt offen und
ersetzt keine Prüfung aller 151 möglichen Teams. Keine erzwungenen Treffer,
KP-Auffüllung oder Unverwundbarkeit innerhalb der Balancekämpfe.

## Kampfregeln und Ergebnisse

Jede Etappe hat ein festes KP-Budget und ein eigenes Mechanikprofil. Die Werte
passen sich nicht heimlich an Spieler-Schaden oder aktuelle KP an. Drei Phasen,
Verstärkung, kurze Deckung während der Vorbereitung (50 % weniger direkten
Schaden), versetzte Einschläge und typgerechte Ring-/Bahn-/Flächenmuster erzeugen
Druck. Meister setzt jeden dritten Angriff einen sichtbaren Vorhalt vor die
aktuelle Laufrichtung: 1,1 Sekunden Warnzeit, danach bleibt der Einschlagort fest.
Richtungswechsel und Dash beantworten ihn; permanentes Kreislaufen ist unzuverlässig.

- Einzelmatrix: 27 Etappen × drei Starter-Konstellationen × Stillstand/Ausweichen =
  **162 Kämpfe**. Stillstand **0/81 Siege**, Ausweichsimulation **79/81 Siege**.
  Niederlagen: Rocko mit Schiggy zuerst, Misty mit Glumanda zuerst. Alle Etappen
  wurden in mindestens zwei Referenzkonstellationen gewonnen.
- Gleichmäßiges Kreislaufen mit Dash nach Abklingzeit: **2/27 Siege** (Safari und
  Siegesstraße, 17 bzw. 23 Rest-KP); **25 Niederlagen**. Vor der Vorhalt-Ergänzung
  waren noch 18/27 Siege möglich.
- Offensivtalente Attacken-Echo + Typenresonanz + Dreiklang: Ausweichen **27/27**,
  Stillstand **0/27**. Die Talente wirken deutlich, heben die Gefahren aber nicht auf.
- Konkreter Vergleich zum gemeldeten Level-16-Fall: drei Basisstarter, Level 16,
  Angriffsrang 8, keine Ausrüstung. Meister-Rocko: Stillstand verliert nach **7 s**;
  Ausweichen gewinnt nach **90 s mit 24 KP**. Veteran: 32 s, Standard: 13 s mit
  Ausweichen. Das maximierte Training ist bereits eine starke Vorbereitung.

| Etappe | Siege mit Ausweichen | Kampfdauer der Siege | Rest-KP der Siege |
|---|---:|---:|---:|
| oak-parcel | 3/3 | 48–62 s | 100–100 |
| oak-return | 3/3 | 36–88 s | 73–100 |
| brock | 2/3 | 117–119 s | 2–40 |
| mt-moon | 3/3 | 69–72 s | 92–100 |
| misty | 2/3 | 87–97 s | 68–82 |
| bill | 3/3 | 85–92 s | 69–100 |
| ss-anne | 3/3 | 128–136 s | 71–100 |
| surge | 3/3 | 123–124 s | 40–95 |
| rock-tunnel | 3/3 | 50–55 s | 100–100 |
| tower-mystery | 3/3 | 54–57 s | 84–92 |
| rocket-hideout | 3/3 | 95–100 s | 100–100 |
| erika | 3/3 | 152–155 s | 100–100 |
| tower-rescue | 3/3 | 71–75 s | 100–100 |
| koga | 3/3 | 156–165 s | 94–100 |
| safari | 3/3 | 71–74 s | 100–100 |
| silph-co | 3/3 | 75–78 s | 76–100 |
| sabrina | 3/3 | 138–140 s | 94–100 |
| mansion | 3/3 | 69–70 s | 99–100 |
| blaine | 3/3 | 135–139 s | 76–94 |
| giovanni | 3/3 | 112–114 s | 100–100 |
| victory-road | 3/3 | 67–68 s | 100–100 |
| lorelei | 3/3 | 142–144 s | 91–100 |
| bruno | 3/3 | 147–150 s | 100–100 |
| agatha | 3/3 | 190–192 s | 92–100 |
| lance | 3/3 | 219–220 s | 97–100 |
| champion | 3/3 | 225–227 s | 84–100 |
| mewtwo | 3/3 | 123–134 s | 100–100 |

## Zusammenhängende Kampfkette

Ein Spielzustand behält Uhrzeit, Zufallsgenerator, Trainer-KP, erkämpften Fortschritt,
Talente, Verbrauch der Phönixfeder und Spielstände zwischen den Etappen. Center
füllen nur Team-Ausdauer auf; Trainer-KP werden bei jedem Besuch unverändert geprüft.
Nach einer Niederlage wird exakt dieselbe Rastpunktfunktion wie im Ergebnisbildschirm
verwendet: Prüfung zurücksetzen, 10 % Münzverlust, Wiederbelebung. Erfolgreiche
Zwischenetappen füllen keine Trainer-KP auf. Auch vor Mewtu wurden die KP erhalten.
Fänge, Wege und Referenztraining zwischen Kämpfen werden weiterhin vorbereitet.
Speichern/Laden nach zwölf Kampfsekunden und zwischen Etappen ist Teil des Laufs.

| Starter zuerst | Etappen | Orden | Niederlagen / Wiederaufnahmen | Simulierte Kampf- und Rastzeit | Schluss-KP |
|---|---:|---:|---:|---:|---:|
| #001 | 27/27 | 8/8 | 2 | 46.4 min | 100 |
| #004 | 27/27 | 8/8 | 2 | 54.1 min | 100 |
| #007 | 27/27 | 8/8 | 2 | 53.5 min | 90 |

Damit sind drei vollständige Meister-Kampfketten belegt, nicht drei fehlerfreie
Durchläufe. Die ausgewählte Team-/Ausrüstungsstrategie und ein schneller Ausweichbot
begünstigen den Erfolg; die offenen manuellen Release-Abnahmen bleiben bestehen.

## Acht Talente statt bloßer Zahlenvarianten

| Seltenheit | Talent | Neuer Effekt |
|---|---|---|
| Selten | Nachbild | Dash lässt 2 s einen Gegnerköder zurück, 8 s Abklingzeit |
| Selten | Sammelwelle | EP-Fund zieht EP und Münzen im Radius 360 an, alle 12 s |
| Episch | Attacken-Echo | Jeder fünfte normale Angriff wird vom aktuellen Pokémon-Ort mit 45 % Stärke wiederholt |
| Episch | Typenresonanz | Drei verschiedene Typen in 4 s am selben Gegner erzeugen einen zusätzlichen Treffer mit 120 % des letzten Angriffswerts |
| Episch | Mutiger Schritt | Eine im Dash abgefangene Bossfläche gibt 10 Schild und 12 Team-Ausdauer, alle 12 s |
| Legendär | Zeitfalte | Dash verschiebt angekündigte Einschläge um 0,65 s und verlangsamt Gegner 2 s, alle 14 s |
| Legendär | Phönixfeder | Einmal pro Lauf statt tödlichem Treffer: 30 KP, 2 s Schutz, 40 Team-Ausdauer; Verbrauch bleibt gespeichert |
| Legendär | Dreiklang | Jeder achte normale Angriff ruft eigene Zusatzattacken der übrigen aktiven Partner mit 60 % Stärke |

Höchstens ein Talentangebot pro Levelauswahl; drei Talentplätze pro Lauf. Ein
höherwertiges Talent kann bei voller Belegung das schwächste ersetzen; die Karte
nennt den Ersatz ausdrücklich. Neue legendäre Angebote sind ausschließlich Talente.
Alte gespeicherte legendäre +4-Rang-Angebote bleiben lesbar. Gewöhnliches/seltenes/
episches Training bleibt +1/+2/+3 Ränge, soweit sie vollständig passen.

Ab Trainerlevel 10: vor Prüfung von Besitz/Plätzen 25 % seltenes, 9 % episches,
1,5 % legendäres Talentangebot; übrige Auswahlen enthalten kein Talent. Seltene
Talente öffnen ab Level 3, epische ab 6, legendäre ab 10. Bereits besessene Talente
werden nicht doppelt gezogen. Zusatzattacken erzeugen keine rekursiven Ketten.
Auslöser, genaue Wirkung und Grenzen stehen auf Angebotskarten und im Teammenü;
HUD zeigt Besitz und eine verbrauchte Phönixfeder.

## Pokémon-Ausdauer

Eine Bossfläche allein auf einem automatisch folgenden Pokémon kostet keine
Ausdauer mehr. Nur angenommene Trainer-Treffer durch Bosskontakt/Flächen belasten
das aktive Team: maximal 26 Ausdauer pro Treffer, sonst 60 % des nach Schutz
verbleibenden Schadens, zusätzlich reduzierbar durch Ausdauertraining. Mehrere
überlappende Flächen während derselben Trainer-Unverwundbarkeit belasten das Team
nicht mehrfach. Sauberer Dash kostet keine Ausdauer. Nach fünf Sekunden ohne
Trainer-Treffer regenerieren aktive Partner im Bosskampf 2,5/s, sonst 1/s.
Erschöpfte Partner kehren nach 12 Sekunden mit 50 Ausdauer zurück.
Center heilen weiterhin niemals Trainer-KP.

## Alle Innenräume und Rezeption

58 Räume, darunter 14 NPC-Häuser und zehn Center, im echten Raumrenderer in 29
zweiseitigen Galerieansichten visuell geprüft. Alle 88 NPC-Ansprechpositionen sind
über begehbare Wege erreichbar. Der Rezeptionsfehler war die gemeinsame Tiefenebene
von Rückwand, Schwester und vorderem Tresen: Das unveränderte Originalbild wird
jetzt nach 32 Quellpixelzeilen getrennt. Die unteren 16 Zeilen liegen vor Joy,
die Apparatur hinter ihr. Joys Standpunkt und Bills Bücherregal wurden angepasst.
Alle zehn Center: Team-Ausdauer aufgefüllt, Trainer-KP 37 → 37. Zusätzlich Azurias
Rezeption im tatsächlichen Spieler-Renderer von vorne und hinten betrachtet.

Lokale Bildbelege: `qa/rc6-interior-p01.png` bis `p29.png`,
`qa/rc6-interior-center-live.png`, `qa/rc6-interior-depth-live.png`.
Talentkarten und Champion-Phase: `qa/rc6-legendary-live.png`,
`qa/rc6-champion-live.png`. QA-Bilder sind lokale Nachweise, kein öffentlicher Export.

## Regression und Browser

149 automatisierte Tests bestanden; darunter alle acht Talente, Ersatzregeln,
Save-Migration, Einmalverbrauch, Dash-/Mehrfachtreffer-Schutz, Ausdauer,
Rastpunktverlust und sichere Rückzugspositionen in allen drei Phasen der 27 Profile.
18 Standard-Waldläufe (drei Starter × Lernlauf/Expedition × Seeds 123/456/789)
enden alle mit Sieg. Das ist eine vorbereitete Ressourcenstrategie, keine Zusage,
dass ein beliebiger Spieler oder Seed sicher gewinnt. Keine Forest-HP-Werte verändert.

30-s-Browsermessung, echter Champion-Kampf mit drei Offensivtalenten und Minimap,
1280×720 auf diesem Rechner: **164.7 Bilder/s**, Frame-p95 **6.4 ms**,
p99 **7.8 ms**, Maximum **12.1 ms**. Minimap-p95
**0.3 ms**, Maximum **0.7 ms**. Während ausschließlich dieser
Leistungsmessung werden Trainer-KP stabilisiert. Das ist kein Balanceergebnis und
keine 60-FPS-Garantie für andere Hardware oder gedrosselte Hintergrundtabs.

Prüfseite und alle Simulationen verwenden einen eigenen lokalen Testkontext;
der laufende Nutzerspielstand wurde weder geladen, überschrieben noch neu gestartet.

## Reproduzieren

Im vollständigen lokalen Entwicklungsbestand `qa/` als Ausgabeordner anlegen.

```powershell
npm run check
npm test
npm run test:core
$env:STARTERS='1,4,7'
$env:STATIONARY='1'
$env:PROBE_OUTPUT='qa/rc6-master-final.json'
node --experimental-strip-types tests/rc6-story-probe.ts
node --experimental-strip-types tests/rc6-campaign-probe.ts
```

Weitere Varianten des Story-Probes: `LOADOUT=circle` bzw. `LOADOUT=talents`;
`STARTERS=1`, `STATIONARY` leer für nur bewegte Versuche. Jede Variante in eine
eigene `PROBE_OUTPUT`-Datei schreiben. Rohdaten des aktuellen Durchlaufs:
`qa/rc6-master-final.json`, `qa/rc6-master-circle.json`, `qa/rc6-master-talents.json`,
`qa/rc6-persistent-campaign.json`, `qa/rc6-brock-level16.json`,
`qa/rc6-forest-regression.json`, `qa/rc6-interior-audit.json` und
`qa/rc6-browser-performance.json`.

Der lokale Windows-Export enthält Laufzeit, gebaute Anwendung, alle geprüften
Laufzeitdateien, Prüfsummen und den zugehörigen Quellcode. Medienrechte,
unabhängige manuelle Vollreise und öffentliche Freigabe bleiben separate offene
Punkte in `RELEASE-READINESS.md`; es wird nichts veröffentlicht.
