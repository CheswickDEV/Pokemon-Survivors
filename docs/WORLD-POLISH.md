# Welt, Kämpfe und Shinys — 1.0.0-rc.3

Historischer Prüfstand: rc.4 entfernt die Trainer-Heilung im Center.
Die hier dokumentierten erfolgreichen Storyläufe sind dadurch überholt.
Aktuelle Ergebnisse: [Innenräume und Center](INTERIORS-AND-CARE.md).

Geprüft am 20. Oktober 2026. Dieser Stand ersetzt für aktuelle Läufe die
garantierte Rangkarte und Bosswerte aus rc.2. Alte Spielstände bleiben lesbar;
Shiny-Sammlung und Angebotsverlauf werden bei fehlenden Feldern leer ergänzt.

## Spielverhalten

- Route-Sperren folgen über ihre volle Breite derselben Kollisionslinie wie
  die Karte. Hölzerne Warnzäune, Bauarbeiter und Schilder ersetzen die
  provisorischen Fels-/Seilsperren. Beim Gegenlaufen erscheint die konkrete
  Fortschrittsvoraussetzung. E in leerer Umgebung bleibt still.
- Wohnhäuser und andere gewöhnliche Innenräume sind frei zugänglich.
  Echte Arenen und die Liga benötigen ihre Voraussetzungen; erledigte Arenen
  bleiben offen. Türvorplätze und die zusätzlichen Eingangsflächen entfallen.
- Bereits gespawnte Gegner werden beim Stadtwechsel nicht gelöscht.
  Die Stadt verhindert nur neue Umgebungswellen. Eine aktiv gestartete
  Arenaprüfung erzeugt selbstverständlich ihre eigenen Gegner.
- Ein Prüfungsstart verändert weder Trainer- noch Partnerpositionen.
- Zwischen Bäumen liegt wieder heller Grasboden. Dunkle quadratische Flecken
  wurden durch unregelmäßige Grashalme ersetzt. Wege verwenden interpolierte
  Konturen der wirklichen Straßen statt grober Kachelmasken. Minimap und Welt
  greifen auf dasselbe Straßennetz und dieselben Landschaftsobjekte zurück.
- Alle drei Levelkarten sind zufällig. Bereits kürzlich angebotene Optionen
  werden seltener gezogen; unpassende/maximierte Ausrüstung erscheint nicht.
  Kraftband, Dauerstein, Windfeder, Sprintband, Forscherheft und Ausdauergurt
  ergänzen die bisherigen zwölf Ausrüstungen. Sechs Slots und fünf Ränge
  bleiben das Limit. Ein Partner behält seine eine charakteristische Attacke.

## Shinys und Kampflesbarkeit

Alle 151 Arten besitzen eigene Shiny-Porträts und Lauf-, Leerlauf- und
Angriffsatlanten in acht Richtungen: 453 Atlanten, 26.472 Animationsframes,
604 Laufzeit-PNGs. Der Import hat jeden übernommenen RGBA-Frame gegen die
gepinnten Originaldaten geprüft. Keine pauschale Farbfilterung.

Die Chance beträgt **1:65.536 je neuem wilden Pokémon beziehungsweise
Fanggegner**. Die Identität der Begegnung legt das Ergebnis fest, damit
Speichern/Laden kein neues Los erzeugt und das Kampf-Zufallssystem unverändert
bleibt. Besiegte wilde Shinys hinterlassen ein Fangangebot. Bei bereits
vorhandener normaler Art ersetzt der Shiny-Fang deren Farbvariante unter
Erhalt von Training, Level und Teamplatz. Entwicklung, Profil, Sicherungen
und Startpartnerauswahl bewahren den Shiny-Status. Kampfwerte sind identisch.

Fokusziele erhalten helle Eckklammern, einen Bodenring und eine FOKUS-Aufschrift.
Auch gewöhnliche Wildgegner können gezielt markiert werden. Ein besiegtes
Fokusziel wird entfernt.

Die gemeinsamen Renderpfade der 151 Signaturattacken wurden überprüft:
Windklingen mit gekrümmten Spuren, facettierte rotierende Felsbrocken, gestufte
Wasser-/Energiestrahlen, ruhigere Kettenblitze, korrekte seitliche
Bewegungsspuren, unterschiedliche Kegel und organische Wirkflächen.
Native Angriffssprites verwenden ihre eigenen Ablaufzeiten. Treffer,
Reichweiten und Ausweichflächen werden durch rein visuelle Effekte nicht
vergrößert. Eigene Partner wachsen bei Entwicklungen weiterhin nicht.

## Bossdruck

- Wildgegner: Maßstab 1; Elite: 1,25; Storyanführer: 1,7; große Bosse: 2,15.
- Wald-Endboss: 3.500 KP im Lernlauf, 7.600 KP in der Expedition vor
  Schwierigkeitsfaktoren. Bossansturm: 780 + 205 je Rundenindex.
- Drei KP-Phasen: oberhalb 65 %, bis 30 %, letzte 30 %.
  Spätere Phasen beschleunigen die Muster, ergänzen versetzte, fest
  angekündigte Zielschläge und rufen einmal zwei passende Helfer.
- Die 15 Bossprofile behalten ihre eigenen Muster. Jeder Gegner spielt
  seine eigene Angriffsanimation; parallele Bosse teilen keine globale
  Animationsquelle.
- Storyanführer skalieren mit dem Fortschritt stärker. Die letzten Wellen
  von Mondberg, Felstunnel, Rocket-Versteck, Turmrettung, Silph Co.,
  Pokémon-Villa, Siegesstraße und Mewtu enthalten einen echten Anführer.

## Prüfungen

**125/125 automatisierte Tests** bestanden, einschließlich:
aller 27 Startpositionen, Häuser-/Arena-Zugang, Stadtverfolgung,
stiller Interaktion, Zufallsauswahl und Sicherungswiederholung,
realer Wirkung neuer Ausrüstung, Shiny-Fang/Entwicklung/Profil,
Fokusauswahl, Bossgrößen und einmaliger Phasenverstärkung nach Laden.
Alle 151 normalen und Shiny-Animationssätze wurden strukturell geprüft.
Alle gemeinsamen Angriffsmuster wurden bei vollen/reduzierten Effekten
auf endliche, begrenzte Zeichenkoordinaten getestet.

Für jedes der 15 Bossprofile wurden in drei KP-Phasen erreichbare sichere
Positionen gefunden. Das belegt die untersuchten Aufstellungen, nicht jede
denkbare Überlagerung mit anderen Gegnern oder jede Randposition.

| Vollständige Simulation | Resultat |
|---|---|
| Standard-Lernlauf, drei Starter × Seeds 123/456/789 | 9/9 Siege; Rest-KP 7–100 |
| Standard-Expedition, dieselben Kombinationen | 9/9 Siege; Rest-KP 25–100 |
| Veteran, Seed 123, drei Starter × beide Waldmodi | 5/6 Siege; Schiggy verliert Lernlauf bei 476 s |
| Meister, dieselben sechs Kombinationen | 0/6 Siege; Niederlagen zwischen 131 und 262 s |
| Stillstehen, Standard, drei Starter × beide Modi | 0/6 Siege; Niederlagen zwischen 25 und 29 s |
| Nur Umherlaufen ohne Fänge/Quests, gleiche sechs Kombinationen | 0/6 Siege; vier Niederlagen und zwei Boss-Zeitlimits |
| Bossansturm, drei Starter je Stufe | Entspannt 3/3, Standard 3/3, Veteran 2/3, Meister 0/3 |
| Kanto, drei Starter, alle 27 Etappen | 81/81 Etappen bestanden |

Im Bossansturm verliert Veteran-Schiggy nach zehn Prüfungen; Meister endet
nach neun, fünf und neun Prüfungen. Mewtu benötigt im Standard-Storytest
68/58/80 Sekunden; Bisasam/Glumanda/Schiggy behalten 36/41/13 KP.

Die Waldsimulation nutzt normale Bewegung, tatsächliche Kollisionskörper,
gezielte Fänge, aktive Teamplätze, verfügbare Verbesserungen, Questschritte,
Einkäufe und erlaubte Entwicklungen. Es werden keine Kampfressourcen,
Unverwundbarkeit oder günstigen Begegnungslisten zugeschaltet. Sie behält
den gewählten Starter und seine Entwicklungslinie im Team.
Beim Storytest werden Reisewege übersprungen; die Kämpfe selbst verwenden
normale Regeln. Diese automatisierten Strategien sind keine menschlichen
Gewinnquoten und ersetzen keine unabhängige durchgehende Spielabnahme.

Browser-Sichtprüfungen auf einem separaten lokalen Testport:
Bauzaun/Bauarbeiter und Kollisionshinweis, Wohnhaustür ohne aktive Quest,
Fokus auf Onix, Taubsi-/Onix-/Wasser-Effekte, Shiny-Pikachu-Fang,
Ballverbrauch, Teamansicht, Speicherung und freigeschaltete Shiny-Auswahl.
Die gezielt erzeugten visuellen Teststände haben keinen Beweiswert für
Shiny-Häufigkeit oder Balance. Keine erfassten Konsolenwarnungen/-fehler.

Die lokalen Rohbelege stehen unter `qa/rc3-*`; sie werden nicht mit
Spielerständen verwechselt oder im Quellcodepaket ausgeliefert. Das
Spielerpaket bleibt eine lokale Testfassung. Unabhängige Langzeittests,
schwächere Hardware und die öffentliche Medienfreigabe bleiben offen.

## Paketprüfung

Frisch entpackter Quellcode: Abhängigkeiten aus der festgeschriebenen Liste
installiert, 114 medienunabhängige Tests und Produktionsbuild bestanden.
Das Quellcodepaket enthält erwartungsgemäß keine Pokémon-Bild-/Audiodateien.
Die erste Offline-Installation scheiterte an fehlendem lokalen npm-Cache;
der Quellcode benötigt für die erstmalige Einrichtung die üblichen
Entwicklungsabhängigkeiten aus dem Registry. Das fertige Spielerpaket
benötigt diesen Schritt nicht.

Das entpackte Windows-Paket startete mit der enthaltenen Runtime bei auf
Windows-Systemordner beschränktem PATH. Sämtliche 1.443 Laufzeitmedien
lieferten HTTP 200 und die erwarteten SHA-256-Hashes. Beide ZIPs bestanden
die CRC-Prüfung; alle 1.475 Dateien des Spieler-Manifests stimmten mit ihren
Hashes überein. Der bestehende Spielserver auf Port 4173 liefert den
aktuellen Produktionsbuild. Ein Neuladen übernimmt die neue Fassung.
