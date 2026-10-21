# Änderungen

## 1.0.0-rc.6.4

- Vollständiger Entwicklerdownload mit sämtlichen aktuellen Spielmedien, vorhandenen Bearbeitungsquellen, Tests und Importwerkzeugen.
- Rechnerabhängige Grafikimporte und private Promptpfade bereinigt; optionale sharp-Werkzeuge mit eigenem Lockfile.
- Entwicklerhandbuch, Anleitung für lokale Änderungen und vollständige Installation, sichere Aktualisierung der Medienlisten.
- Zusätzliche Tests für den Entwicklerexport; CI prüft im vollständigen Checkout alle Tests.
- Eigener GPL-Code und Fremdinhalte klar getrennt ausgewiesen; bestehende Medienrechte bleiben erhalten.

## 1.0.0-rc.6.3

- Sicherheitsprüfung, explizite Exportdateiliste und Schutz vor privaten Pfaden, Cachedateien und Credential-Mustern.
- Normaler Build enthält ausschließlich geprüfte Laufzeitmedien; keine Prompts oder Importquellen im Webroot.
- Ungültige Pokémon-IDs beim Import werden abgewiesen; Server, Laufzeitdownload und GitHub-CI gehärtet.
- Kurze README, Installationshilfe, vollständige Abhängigkeitsübersicht, Sicherheitsmeldungen und Diagnoseskript.
- Öffentliche Medienfreigabe und unabhängige Windows-/Spielabnahme bleiben offen.

## 1.0.0-rc.6.2

- Alle 58 Innenräume vor und nach der Änderung mit laufendem Spielrenderer visuell geprüft; Raumliste und Bildnachweise: [Innenraumprüfung](docs/INTERIOR-VISUAL-AUDIT.md).
- Verkäufer, Fahrradhändler und Hotelpersonal stehen korrekt hinter der Tresenkante. NPC-Füße berücksichtigen die transparenten Ränder ihrer Originalgrafiken.
- Teppiche enden vor den Möbeln; Fahrräder stehen neben dem Mittelgang. Dojo, Villa, Turm, Rocket-Versteck und Höhlen verwenden passende Raumvorlagen unabhängig von Storyprüfungen.
- Arenaleiter erhalten eingefasste Standflächen. Felswände ersetzen Haustapeten in Höhlen und werden an Raumgrenzen sauber abgeschnitten.
- 152 Tests einschließlich aller Innenraum-Laufwege bestanden.

## 1.0.0-rc.6.1

- Center-Rezeption tatsächlich korrigiert: vollständige Originalkacheln mit beiden Ebenen, Rückwand, Bildschirm, Arbeitsboden und Maschinenbasis. Die RC6-Vordergrundgrafik war weiterhin unvollständig.
- Passende Center-Wand ohne zusätzliche blaue Wohnhaus-Kachel. Joy steht hinter dem Tresen; Arbeitsbereich und Maschinen sind solide. Alte Positionen darin werden beim Laden vor den Tresen gesetzt, ohne KP oder Ausdauer zu verändern.
- Gesunde Pokémon zeigen in friedlichen Innenräumen keinen frei schwebenden Ausdauerbalken mehr.
- 150 Tests bestanden; Originalpixelvergleich und neue Browseransichten: [Center-Korrektur](docs/CENTER-REPAIR.md).

## 1.0.0-rc.6

- Alle 27 Kanto-Etappen mit eigenen Boss-KP-Budgets und Prüfungsmechaniken, einschließlich acht Arenen, Top Vier, Champion und Mewtu. Meister ergänzt sichtbare Vorhalte-Angriffe gegen gleichmäßiges Kreislaufen.
- Acht echte Talente mit Auslösern und Abklingzeiten; drei Plätze und Aufwertung durch höherwertigen Ersatz. Neue legendäre Angebote enthalten Zeitfalte, Phönixfeder oder Dreiklang statt Rangpaketen.
- Bossflächen kosten Pokémon nur bei angenommenem Trainer-Treffer Ausdauer. Trefferfreie Zeit regeneriert aktive Partner; Dash und Trainer-Unverwundbarkeit schützen auch vor zusätzlichem Teamverlust.
- Center-Rezeption aus unveränderten Originalbildzeilen in Rückwand und Vorderkante getrennt; Joy steht korrekt dazwischen. Alle 58 Innenräume und 88 NPC-Zugänge geprüft.
- Gemeinsame Rastpunkt-Wiederaufnahme für Oberfläche und Kampagnentest; Münzverlust und verbrauchte Rettungstalente bleiben erhalten.
- 149 Tests, drei vollständige automatisierte Meister-Kampfketten mit regulären Wiederholungen und ergänzende Stillstands-/Kreis-/Talenttests. Grenzen und Ergebnisse: [RC6-Prüfung](docs/RC6-VALIDATION.md).

## 1.0.0-rc.5

- Originale FR/LG-Bauarbeiter und Zäune; originale Kanto-Regionskarte mit Ortsauswahl, Mausrad-Zoom und Ziehen ohne Neuaufbau.
- Dash-Schutz für die ganze Bewegung plus kurze Austrittsfrist. Alle sechs Trainer behalten ihre diagonalen Animationen; größere gerade Ansichten werden angeglichen.
- Kleinere, runde Stammkollisionen, gemeinsam erzeugte Bäume für Welt, Kollision und Minimap. Die Minimap aktualisiert bewegte Marker mit der Darstellung und puffert das Gelände.
- Orden erhöhen Pokémon-Levelgrenzen und geben jeweils +3 % Team-Schaden sowie 2 Prozentpunkte Schadensschutz. Bestehende höhere Pokémon-Level bleiben gespeichert, ihre Kampfwirkung wird begrenzt.
- Gewöhnliche, seltene, epische und legendäre Levelangebote vergeben 1/2/3/4 Ränge; Werte und erreichte Meilensteine werden vorher angezeigt.
- Umlaufende und angeheftete Angriffe folgen ihrem Pokémon. Salven starten auch während Bewegung am ausführenden Partner; Flächen und Fallen haben einen sichtbaren Flug vom Pokémon zum Einsatzort.
- Mehrphasige Questwächter, deutlich längere Arena-/Meisterkämpfe, Standort-Einschläge und versetzte Folgemuster. Veteran/Meister bekommen längere Zeitfenster für Wald- und Bossansturm-Prüfungen.
- Prüfverfahren und gemessene Grenzen: [RC5-Prüfung](docs/RC5-VALIDATION.md).

## 1.0.0-rc.4

- Center füllen nur Pokémon-Ausdauer auf und beenden Erholungspausen.
  Trainer-KP bleiben unverändert; Hinweise und Spielhilfe erklären die Regel.
- Korrekte sichtbare Möbelrahmen, einheitliche Pixelgrößen und passende
  Standflächen in allen 58 Innenräumen. Azurias Center und die übrigen Center
  erhalten abgestimmte Tresen-, NPC- und Teppichpositionen.
- Alle 14 benannten Häuser mit passenden Bewohnern und Einrichtung,
  einschließlich Fahrradladen, Hotel, Trainerschule und Bills Labor.
- 128 Tests bestanden; vollständige Raumgalerie und Heiltest im Browser.
  Die spätere Kanto-Balance benötigt nach Entfall der Center-KP-Heilung eine
  neue Spielabnahme. Details: [Innenraumprüfung](docs/INTERIORS-AND-CARE.md).

## 1.0.0-rc.3

- Kanto-Sperren als durchgehende Bauzäune mit Bauarbeitern; Wohnhäuser frei zugänglich,
  Arenen weiterhin an Voraussetzungen gebunden. Überflüssige Türvorplätze entfernt.
- Heller Grasboden zwischen Bäumen, unregelmäßige Grashalme statt dunkler Quadrate,
  weichere Wegekonturen aus der tatsächlichen Geometrie, passende RPG-Minimap.
- Bereits gespawnte Gegner bleiben in Städten; dort entstehen keine neuen Wildgegner.
  Prüfungen starten am aktuellen Standort. Leeres E zeigt keinen Fehler.
- Zufällige Levelangebote mit Wiederholungsschutz und sechs zusätzlichen Ausrüstungen.
  Keine garantierte Rangkarte; weiterhin eine charakteristische Attacke pro Partner.
- Alle 151 Arten als sehr seltene Shiny-Varianten (1:65.536), einschließlich Bewegungen,
  Fang, Entwicklung, Sicherung und freischaltbarer Shiny-Startpartner im Pokédex.
- Klare Fokusklammern auch für Wildgegner. Überarbeitete Windklingen, Felsen,
  Strahlen, Kettenblitze, Kegel, Flächen, Bewegungsspuren und native Angriffstaktung.
- Größere Bosse mit mehr KP, drei KP-Phasen, versetzten Folgeschlägen und Verstärkung.
  Acht späte Storyfinale erhalten echte Anführer, einschließlich Mewtu.
- 125 automatisierte Tests bestanden. Aktuelle Simulationen und Grenzen:
  [Welt- und Kampfprüfung](docs/WORLD-POLISH.md).

## 1.0.0-rc.2

- Schiggys Wasserstrahl etwas breiter und schneller; bleibt ein gerader Durchdringungsangriff.
- EP-Zusammenfassung erhält lokale Fundorte und den vollständigen Wert.
- Garantierte Rangangebote und Truhentraining bevorzugen trainierbare aktive Partner.
- Gemeinsame Grenze für automatische Elitekämpfe und Lichtungen; zusätzlicher Hornliu-Timer entfernt. Veteran/Meister behalten höhere Grenzen und ihre Schwierigkeitsskalierung.
- Spezialschwärme berücksichtigen jetzt ebenfalls die Geschwindigkeitsstufe. Heilfunde bleiben selten.
- RPG-Minimap mit geglätteten Wegen, tatsächlichen Bäumen, Felsen, Gebäuden, Sperren, Gegnern und Questzielen. Innenräume zeigen Einrichtung und NPCs.
- Große Waldkarte nutzt dieselben Weltkoordinaten statt erfundener Dekoration.
- 66 abgeschlossene Waldsimulationen, zusätzliche Kanto-/Bossregressionen und geometrische Kartentests. Details: `docs/FOREST-BALANCE.md`.

## 1.0.0-rc.1

Lokaler Release Candidate, öffentliche Medienfreigabe offen.

- Vier Schwierigkeitsgrade unabhängig von der Laufart.
- 15 Bossprofile mit unterschiedlichen Angriffen, Effekten und letzter Phase.
- Bossansturm in einer eigenen Arena mit 15 Prüfungen, vorbereiteten Partnern,
  Verbesserungen zwischen Kämpfen und eigenem Speicherplatz.
- Wechselnde Wächter in Expedition/Endlos und passende Story-Bossattacken.
- Fortschrittsbuch mit zehn Abzeichen, Bossmustern und Ausrüstungslexikon.
- Vollständige Sicherung und geprüfte, atomare Wiederherstellung von Profil
  und drei Speicherplätzen. Spielstände bis Format 5 bleiben lesbar.
- Markt zeigt alle verfügbaren Ausrüstungstypen.
- Windows-x64-Testpaket ohne vorausgesetzte Node-Installation; Server erkennt
  Doppelstarts, bleibt auf Loopback und verändert keine fremden Prozesse.
- GPL-3.0-only für eigenen Code, GitHub-CI, nachvollziehbarer Export und
  explizite Veröffentlichungsgates.

## 0.8.0

Überarbeitete Minimap, offene Routen, verbundene Wege und klare Sperren,
passende Innenraumböden, bedingter Gebäudezutritt und Weiterlaufen beim
Fensterwechsel.
