# Trainerbewegung 0.5.0

Alle sechs Figuren (Rot, Blatt, Klarin, Kris, Brix, Maike) verwenden vollständige, neu erzeugte Pixelart-Figuren in acht Richtungen. Kein Bild wird aus Front- und Seitenstreifen zusammengesetzt. Auch die Kardinalansichten wurden passend neu erstellt, damit Detailgrad und Stil beim Drehen zusammenpassen. Ganze linke Ansichten sind Spiegelungen ganzer rechter Posen.

Jeder Atlas unter `public/art/trainers-v5/*-complete.png` enthält 9 × 8 Zellen à 64 Pixel: Ruhepose plus acht Zeitphasen. Pro Richtung existieren sechs bis acht unterschiedliche Laufposen. Alle 432 Zellen wurden auf Transparenz, Standhöhe und unterschiedliche Posen geprüft. Die Figurenhöhe bleibt beim Richtungswechsel stabil; die bisherigen Größenfaktoren gelten weiter.

Der Rhythmus bleibt streckenabhängig: zwei Schritte pro etwa 0,857 Sekunden bei normalem Tempo, mindestens 0,72 Sekunden beim Ausweichen. Richtungswechsel behalten die Phase. Zwischen den Simulationsschritten bleibt das letzte Bild stehen; 120/144-Hz-Bildschirme erzeugen keine zusätzlichen Ruhebilder. Pause hält die Pose an, Stillstand läuft kurz aus. Schritte erklingen nur beim Fußkontakt während Bewegung.

Die neuen Figuren sind mit ImageGen erzeugte Fan-Art, keine zusätzlichen offiziellen Originalsprites. Genaue Prompts, unveränderte Ausgaben und Importmetadaten stehen in [SOURCES.md](docs/asset-sources/trainers-v5-SOURCES.md). Der reproduzierbare Importer liegt unter `scripts/import-trainer-diagonals.py`. Frühere Originalgrafiken bleiben erhalten und dienen noch als Menüpiktogramme bzw. Rangerfigur.

Prüfung: `tests/trainer-motion.test.ts` prüft Kadenz, acht Richtungen, Zeitlücken und Fußkontakte. Acht Richtungen je Trainer (`qa/trainer-complete-v5.png`, nur im lokalen Arbeitsbestand) und alle Laufzyklen (`qa/trainer-complete-v5.gif`, nur im lokalen Arbeitsbestand) zeigen die neuen vollständigen Atlanten. Der Browser lädt diese unmittelbar; der alte Projektionsgenerator wird nicht mehr verwendet.

Hinweis zum Quellcodeexport: Verweise auf lokale Bild-/Testbelege sind als Text
markiert; die zugehörigen Dateien gehören nicht zum öffentlichen Snapshot.
