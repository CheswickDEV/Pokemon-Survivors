# Auenwald und Kanto 0.8.0

## Auenwald ohne Rand

Alle Waldmodi erlauben Bewegung über die frühere 3072-Pixel-Grenze hinaus, auch in negative Koordinaten. 512-Pixel-Abschnitte entstehen aus dem Lauf-Seed. Nur die Umgebung wird dargestellt; beim Zurückkehren sieht ein Ort wieder gleich aus. Die drei bisherigen Waldaufträge stehen je einmal an ihren festen Orten. M zeigt Richtung und Entfernung.

Seltene Lichtungen erscheinen mit großen Abständen in 4096-Pixel-Sektoren. Ihr Wächter und ihre Belohnung werden je Lauf nur einmal ausgelöst. Der globale Gegnerplan hängt von der Zeit ab, nicht vom Wechsel zwischen Abschnitten. Zubat-Schwärme und Blütenringe ergänzen normale Wellen. Etwa alle 90 Sekunden erscheint eine Elite, solange ausreichend Platz für besondere Gegner vorhanden ist. Normale weit entfernte Gegner verschwinden ohne Kill- oder EP-Gutschrift.

Eliten lassen nach einem tatsächlichen Sieg eine Truhe zurück. Sie liefert Münzen, einen Ball und ein, drei oder fünf Trainings-/Entwicklungsfunde. Ein bereits vollständig ausgebautes Team erhält Ersatzmünzen. Entwicklung verlangt weiterhin die sichtbaren Voraussetzungen und vorhandene Mittel. Öffnen wird atomar gespeichert; Ort und Beute bleiben unabhängig von geladenen Landschaftsabschnitten erhalten. Bodenfunde werden bei hoher Anzahl wertgleich zusammengefasst.

Lernlauf und Expedition behalten ihr zeitliches Ziel. **Endloser Auenwald** hat kein Zeitlimit: Bisaflor erscheint alle 20 Minuten, nach dem Sieg beginnt eine stärkere Runde. Weitere Fangbegegnungen werden danach regelmäßig aus allen 151 Arten gezogen.

## Eine zusammenhängende Kanto-Reise

**Kanto-Story** startet in Alabastia. Der erste Weg führt über Route 1 nach Vertania zum Markt. M öffnet die zoombare Weltkarte, acht Orden und das Reisetagebuch. Das nächste Ziel steht außerdem im HUD. E am markierten Ort öffnet Auftrag und Belohnung; der Kampf beginnt erst nach Annahme. Alle Orte liegen in derselben Szene, ohne Kartenwechsel.

51 Orte und 57 Verbindungen bilden die zehn Städte, alle 25 Routen, größere Höhlen, Kraftwerk, Pokémon-Turm, Safari-Zone, Rocket-Versteck, Silph Co., Villa und Liga ab. Landschaften unterscheiden Wald, Städte, Berge, Höhlen und Wasser. Stadtgebiete schützen vor gewöhnlichen Gegnern; aktive Prüfungen bleiben echte Kämpfe. Die Kartenmaße sind für dieses Echtzeitspiel verdichtet. Innenräume werden als zusammenhängende Außenbereiche dargestellt; dies ist eine Survivors-Adaption, keine kachelgenaue Kopie der Game-Boy-Karten.

27 Etappen führen durch Eichs Paket, Mondberg, Bill und M.S. Anne, Felstunnel, Turm, Rocket-Versteck, Mr. Fuji, Safari-Zone, Silph Co., Villa, acht Arenen, Siegesstraße, Top Vier, Blau und Mewtu. Jede Arena verwendet das vollständige Rot/Blau-Team des Leiters in aufeinanderfolgenden Wellen. Die Liga verwendet alle fünf Mitglieder je Top-Vier-Team und Blaus sechsköpfiges Team. Storyorte vergeben Münzen, Bälle, Erfahrung und Fangmöglichkeiten; Arenen zusätzlich Orden und Entwicklungsmittel.

Pokédex, Orden, Zerschneider, Pokéflöte, Getränk für die Saffronia-Wachen, Surfer, Stärke und weitere Schlüssel öffnen feste Wege. Digdas westlicher Ausgang benötigt Zerschneider; Untergrundwege umgehen Saffronias verschlossene Tore. Voraussetzungen gelten auch nach Laden. Außerhalb der Prüfungszone wird eine aktive Prüfung abgebrochen und kann am selben Ort neu beginnen.

Betritt das Pokémon-Center mit E an der Tür. Erst das Gespräch mit Schwester Joy im Inneren heilt das Team und setzt einen Rastpunkt. Der erste Besuch liefert drei Bälle und 20 Münzen. Alabastia besitzt die beiden Wohnhäuser und Eichs Labor; Mama bietet keine kostenlose Heilung mehr. Der erste reguläre Rastpunkt liegt in Vertania. Märkte und Prismanias Kaufhaus verkaufen am NPC im Innenraum Bälle, Entwicklungsmittel und Ausrüstung. Nach einer Niederlage setzt du im zuletzt besuchten Center fort, sonst im Center von Vertania; zehn Prozent der Münzen gehen verloren. Nach dem Champion-Finale kannst du Kanto weiter erkunden und die Azuria-Höhle mit Mewtu besuchen.

## Speicherung und Quellen

Wald und Story besitzen getrennte doppelte Sicherungen. Team, Orden, Zugänge, aktive Kampfwellen, RNG, Truhen, seltene Ereignisse und negative Weltpositionen werden vollständig gespeichert. Alte Waldstände werden beim Laden nach Format 5 übernommen; vorhandene Pokémon behalten das frühere gemeinsame Level einmalig als persönliches Ausgangslevel. Export und Import bleiben verfügbar.

Originalbefunde zu Vampire Survivors (`../analysis/VS-WORLD-RULES.md`, nur im lokalen Arbeitsbestand) · quellengebundene JSON-Auszüge (`../analysis/VS-WORLD-EVIDENCE.json`, nur im lokalen Arbeitsbestand) · Kanto-Vorlagen und bewusste Anpassungen (`../analysis/KANTO-WORLD-REFERENCES.md`, nur im lokalen Arbeitsbestand).

Das Original verwendet bei Mad Forest Kachelung und globale Zeitwellen, nicht generell eine ständig neu gewürfelte Welt. Unser Seed-Wald und die durchgängige Kanto-Kampagne sind bewusste Erweiterungen. Die Originalinstallation wurde nur gelesen.

## Stadtgestaltung, Kollision und Hinweise in 0.6

Zwölf zusammenhängende Gebäudesprites ersetzen die geometrischen Platzhalter: zwei Wohnhäuser, Labor/Museum, Center, Markt, Arena/Dojo, Kaufhaus, Silph-Gebäude, Pokémon-Turm, Villa, Liga und Höhleneingang. Feste, an den sichtbaren Fundamenten ausgerichtete Kollisionsflächen halten Trainer, Pokémon und Gegner auf; Türen bleiben erreichbar. Figuren werden nach ihrer Bodenposition gezeichnet. Neue Gegner entstehen außerhalb von Fundamenten. Bereits in einem neuen Hindernis stehende alte Speicherstände erlauben das Herausgehen.

Jede Stadt hat eigene Anordnungen und charakteristische Gebäude. Schmale Wege, Grundstücke, Blumen, Baumreihen, Stadtpflaster, Hafendocks und Nugget-Brücke ersetzen die früheren einheitlichen Ortskreise. Alabastia hat keinen erfundenen Markt oder Center. Die Gebäude sind eigene, für das Projekt angepasste Pixelgrafiken; dies bleibt eine verdichtete Echtzeit-Adaption mit offenen Kampfplätzen, keine kachelgenaue Rekonstruktion aller Original-Innenräume.

Die inhaltliche Orientierung wurde mit den Kartenobjekten von [Alabastia](https://github.com/pret/pokered/blob/master/data/maps/objects/PalletTown.asm), [Marmoria](https://github.com/pret/pokered/blob/master/data/maps/objects/PewterCity.asm), [Prismania](https://github.com/pret/pokered/blob/master/data/maps/objects/CeladonCity.asm), [Orania](https://github.com/pret/pokered/blob/master/data/maps/objects/VermilionCity.asm) und [Saffronia](https://github.com/pret/pokered/blob/master/data/maps/objects/SaffronCity.asm) abgeglichen. Anordnung, Größen und Wege wurden für die vorhandene Survivors-Kampagne angepasst.

Waldstämme besitzen kleine Kreisflächen. Figuren gleiten daran entlang; Verfolger berechnen bei Bedarf Umwegpunkte um Stämme und Hauswände. Diese Punkte bleiben beim Speichern erhalten. Die Prüfung deckt acht Anlaufrichtungen bei Bäumen und vier bei Gebäuden ab; sie ist kein allgemeiner Nachweis für beliebig dicht zusammengesetzte Hindernisse.

Beim Betreten erscheint der Stadt-/Routenname kurz am oberen Bildschirmrand. Beim Anlaufen einer gesperrten Route erklärt dieselbe Anzeige den benötigten Schlüssel und dessen Herkunft. Wiederholungen sind zeitlich begrenzt. E ohne verfügbare Interaktion gibt einen hilfreichen Hinweis. Die früheren auf den Boden geschriebenen Ortsnamen und Schloss-Anforderungen sind entfernt.

Heilfunde sind violette Trankflaschen statt roter Pluszeichen. In der Nähe steht der konkrete KP-Wert; blaue Ätherflaschen bezeichnen Ausdauer. Persönliche EP-Balken stehen im HUD und Teamfenster. Nur aktive, einsatzfähige Pokémon erhalten die Kampf-EP eines Sieges; nachträgliches Einsammeln eines Trainer-Kristalls kann sie nicht auf einen Reservepartner übertragen.

## Begehbare Innenräume in 0.7

Jedes Gebäude der vorhandenen Kanto-Karte besitzt einen eigenen, begrenzten Raum. Häuser erhalten Bett, Tisch, Regal und Bewohner; Center eine Heiltheke und Schwester Joy; Märkte Verkaufstheke, Regale und Verkäufer. Labore, Museum, Silph Co., Rocket-Versteck, Turm, Höhlen und Liga haben eigene Möbel-/NPC-Zusammenstellungen. Alle acht Arenen verwenden ihren Leiter, eine nach Typ gefärbte Kampffläche, Statuen und einen Guide. Die Raumlayouts sind für Survivors-Bewegung entworfen; sie bilden nicht sämtliche Etagen oder Rätsel der Originalgebäude nach.

Mit E am Leiter beziehungsweise Story-NPC beginnt eine Prüfung. Außen können diese Gebäudekämpfe nicht mehr gestartet werden. Die Markierungen zeigen die Kampffläche; der ganze Innenraum ist gültig. E am Ausgang bricht einen noch laufenden Kampf ab. Besiegte Wellen, Rückkehrpunkt, Außenwelt-Gegner, Beute und Fangangebote bleiben im Speicherformat 5 erhalten. Beim Verlassen bleibt Raumbeute dort liegen. Zufällige Außenwelt-Begegnungen entstehen nicht in Innenräumen.

Die Innenraumgrafiken sind lokale, palettengetreue Ausschnitte aus dem gepinnten FireRed-Referenzbestand: 43 Assets und Herkunft (`public/art/interiors-v7/SOURCES.md`, nur im lokalen Arbeitsbestand). Die Außenfassaden bleiben die für dieses Projekt angepassten Pixelgrafiken.

Die Trainerkollision um Bäume ist breiter und zur Baumkrone versetzt. Verfolger nutzen weiterhin die kleineren runden Stämme und berechnete Umwege. Auch besondere Bäume haben Kollisionsflächen. Neue Waldkronen und seltene Lichtungen halten Abstand zu Wegen; Stadtwege ohne Anschluss enden auf freier Fläche. Kurze Dash-Tastendrücke überleben Renderbilder ohne Simulationsschritt und werden kurz vor Ablauf der Sperre für maximal 150 ms vorgemerkt.

Die M-Karte zeigt die tatsächlichen Orts-/Routenverbindungen auf einer illustrierten Kanto-Übersicht. Anklickbare Orte, Zoom, nächstes Storyziel, Zugangshinweise und acht unterschiedliche Ordenformen ersetzen die alte Punktübersicht. Die Waldkarte zeigt die festen Ziele und Trainerposition schematisch, ohne eine exakte Terrainkartierung vorzutäuschen.


## Welt und Orientierung in 0.8

Die Stadtflächen sind von 720 auf 960 Welteinheiten Breite gewachsen. Gewöhnliche Routen bieten 380 statt 190 Einheiten Bewegungsbreite, mit freien Wiesen neben dem eigentlichen Weg. Enge Tunnel behalten ihren eigenen Verlauf. Straßen werden als verbundenes Netz um die Gebäudefundamente geführt, bis zu den tatsächlichen Routenausgängen und Eingangspodesten. Eine gemeinsame Geländegeometrie steuert Begehbarkeit, Wald-/Felsränder, Sperren und Minimap. Die gesamte Karte umfasst weiterhin 51 Orte, 57 Verbindungen und 58 Gebäude.

Geschlossene Routen erhalten massive, durchgehende Kontrollschranken oder Felsriegel. Ihre Kollisionslinien decken die ganze Öffnung ab; Freischalten entfernt sowohl Grafik als auch Hindernis. Die Meldung erklärt weiterhin, welche Aufgabe oder Reisehilfe fehlt. Straßen-, Höhlen- und Hafenzugänge sind verbunden; der Hafen besitzt einen durchgehenden begehbaren Holzsteg samt Plattform.

Center und Märkte bleiben offen. Andere Gebäude öffnen, wenn dort eine noch unerledigte, jetzt verfügbare Storyetappe wartet. Abgeschlossene Räume bleiben für noch liegende Beute und unbeanspruchte Fangangebote zugänglich. Gebäude ohne aktuellen Inhalt sind geschlossen und nennen bei E den Grund. Bestehende Spielstände innerhalb inzwischen geschlossener Gebäude lassen sich normal fortsetzen und verlassen.

Raumböden werden exakt auf die Innenmaße zugeschnitten. Wandfüße und Sockel stimmen mit dem Kollisionsrand überein; der untere Rand erhält eine geschlossene Wand mit mittigem Ausgang. Märkte verwenden warme, dezente Steinfliesen und einen salbeifarbenen Läufer. Die Minimap zeigt Gelände, Straßen, Grundrisse, Center/Markt/Arena, NPCs, Durchgangssperren, Zielrichtung und Trainer-Blickrichtung.

Fokusverlust löst keine Pause mehr aus. Gedrückte Tasten werden freigegeben. Ein eigener Timer führt die Simulation bei verborgenem Browser-Tab weiter; geöffnete Menüs und Entscheidungen pausieren weiterhin. Browser-/Betriebssystemdrosselung bleibt möglich. Nach längerer vollständiger Aussetzung werden höchstens zwei Sekunden pro Timeraufruf nachgeholt, damit ein schlafender Rechner keinen minutenlangen Simulationssprung auslöst.

Hinweis zum Quellcodeexport: Verweise auf lokale Bild-/Testbelege sind als Text
markiert; die zugehörigen Dateien gehören nicht zum öffentlichen Snapshot.
