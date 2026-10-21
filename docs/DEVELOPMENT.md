# Lokal weiterentwickeln

Der vollständige Entwicklerdownload ist ein eigenständiges Arbeitsprojekt.
Code, Tests, Spielmedien, Credits, Animations-XML, vorhandene Quellbilder,
Paletten, Raumdaten und Importprogramme sind enthalten. Persönliche Caches,
alte QA-Ausgaben und der ungenutzte historische Ordner `public/art/pokemon/`
gehören nicht dazu. Ein normales Klonen/Entpacken benötigt kein Git LFS.

## Alltag

```text
npm ci
npm run doctor -- --player
npm run dev
```

Zum Prüfen: `npm run check`, `npm test`, `npm run check:release`,
`npm run check:developer`, `npm run build`. Mit `npm start` den gebauten Stand
auf Port 4173 prüfen. Ein frisch entpacktes Paket kann mit Git verwaltet werden:
`git init -b main`, anschließend vor `git add` die Dateiliste prüfen.
Im bereits geklonten Repository ist keine neue Initialisierung nötig.

## Wo ändere ich was?

| Bereich | Einstieg |
|---|---|
| Start, Ansichten und Oberfläche | `src/main.ts`, `src/view.ts`, `src/ui-v2.ts`, CSS unter `src/` |
| Spielablauf und Kampf | `src/engine.ts`, `src/combat.ts`, `src/weapon-system.ts` |
| Welt und Innenräume | `src/world.ts`, `src/kanto-*.ts`, `src/interior-*.ts` |
| Pokémon, Trainer und Animationen | `src/pokemon-motion.ts`, `src/pokemon-shiny.ts`, `src/trainer-*.ts` |
| Fortschritt und Spielstände | `src/save.ts`, `src/progress.ts`, `src/quests.ts` |
| Ton und Rufe | `src/audio.ts`, `src/cry-audio.ts`, `public/audio/` |
| Bilder, Quellen und Credits | `public/art/`, `docs/asset-sources/` |
| Tests | `tests/*.test.ts`; ergänzende Proben und Fixtures im selben Ordner |
| Server, Build und Pakete | `server.mjs`, `vite.config.mjs`, `scripts/`, `release-config/` |

Die TypeScript-Dateien sind die bearbeitbaren Quellen, nicht das gebündelte
JavaScript in `dist/`. Bilder können mit einem beliebigen geeigneten Bildeditor
bearbeitet werden. Transparenz, Atlasmaße und Animationsmetadaten erhalten,
wenn die bestehende Darstellung weiterverwendet wird.

## Bilder und andere Laufzeitmedien ändern

1. Gewünschte Datei unter `public/` bearbeiten. Herkunft und Lizenz neuer
   Inhalte dokumentieren. PNGs und Quelldaten sind normale Repositorydateien.
2. Neue Laufzeitdateien gezielt anmelden, zum Beispiel mit
   `npm run assets:refresh -- art/mein-bild.png` (Pfad ohne `public/`).
   Das trägt die Datei mit Hash und Bytezahl in beide Medienlisten ein.
   Zusätzliche reine Bearbeitungsquellen, etwa XML oder Paletten, nur in
   `release-config/developer-files.json` aufnehmen.
3. `npm run assets:refresh` aktualisiert Bytezahlen und SHA-256 der gelisteten
   Laufzeitmedien. Es nimmt keine beliebigen Dateien automatisch auf.
4. Falls nötig Ladepfad/Atlasbeschreibung in `src/` anpassen.
   `npm run doctor -- --player`, Tests und Build ausführen, Darstellung prüfen.
5. Geänderte Bilder, Metadaten, Credits und Manifeste zusammen committen.

Die Positivlisten verhindern, dass persönliche Rohdateien unbemerkt im
Spielerbuild landen. Der Entwicklerdownload enthält zusätzlich bewusst die
bearbeitbaren Quellen und Werkzeuge; der Webserver liefert nur Spielmedien aus.
Neue Code-/Dokumentationsdateien in `source-files.json` aufnehmen.
Alle Listen verwenden relative Pfade mit `/`.

## Optionale Grafikwerkzeuge

Bereits enthaltene Grafiken können direkt geändert werden. Die folgenden
Werkzeuge werden nur für bewussten Neuimport oder erneutes Packen benötigt.

**Node-Bildwerkzeuge:** In einem Terminal in `tools/assets/` ausführen:

```text
npm ci
npm audit
```

Danach ins Projektverzeichnis zurückwechseln. `sharp` und seine nativen
Bibliotheken bleiben isoliert unter `tools/assets/node_modules/`.
Die drei portablen Importer verwenden diese lokale Installation:

```text
node public/art/kanto-v6/import-buildings.mjs
node public/art/interiors-v7/import-assets.mjs
node public/art/original-overworld/import-assets.mjs
```

Der Gebäudeimport nutzt die mitgelieferten `generated/*.png`. Innenraum- und
Weltimport nutzen gepinnte Quellstände; fehlende Rohdaten können von GitHub
geladen werden. Die Befehle überschreiben ihre jeweiligen erzeugten Medien
und Metadaten: vorher eigenen Arbeitsstand sichern, danach Änderungen prüfen
und `npm run assets:refresh` ausführen.

**Python-Bildwerkzeuge:** Python 3.12 oder neuer mit passender Pillow-Unterstützung
separat bereitstellen. Unter Windows eine lokale Umgebung verwenden:

```text
py -3.12 -m venv .venv
.venv\Scripts\python -m pip install -r requirements-assets.txt
.venv\Scripts\python scripts/import-trainer-diagonals.py
```

Auf macOS/Linux entsprechend `python3 -m venv .venv` und
`.venv/bin/python` verwenden. Aktivierung der Umgebung ist nicht erforderlich.
Pillow ist in `requirements-assets.txt` festgelegt. Die übrigen Importer unter
`scripts/` sowie Python-Importer in den Medienordnern beschreiben ihre Eingaben
im Dateikopf. Der Kanto-Datenimport nutzt nur die Standardbibliothek.

Die mitgelieferten generierten Quellbilder sind direkt bearbeitbar. Für sie
besteht keine Abhängigkeit von einem KI-Konto; die historischen Prompts dienen
der Herkunftsdokumentation, nicht als Zusage einer identischen Neugenerierung.
Animationen liegen mit Credits und XML vor; ein erneuter Upstream-Import
kann Internet benötigen. Die Python-Pipeline wurde in diesem Release nicht
vollständig erneut ausgeführt.

## Pakete und Beiträge

`npm run release:developer` erzeugt den vollständigen Entwicklerdownload.
`npm run check:developer` prüft denselben Bestand ohne ZIP-Erzeugung.
Beide verweigern fehlende/geänderte Laufzeitmedien, private Pfade, bekannte
Secret-Muster und unzulässige Dateipfade.

`npm run release:source` ist ein zusätzlicher Codeexport ohne Pokémon-Bilder
und Rufe. Dort laufen `npm run test:core` und ein Code-Build;
`npm run test:available` wählt bei vollständigem Bestand sämtliche Tests.
Ein Entwicklerpaket mit fehlenden Dateien bricht bei dieser Auswahl ab.

`DEVELOPER-FILES.json` enthält die Prüfsummen des ausgelieferten Pakets. Nach
eigenen Änderungen ist es ein historisches Inventar; erst der nächste Export
erzeugt es neu. `DEVELOPER-PACKAGE.json` kennzeichnet den vollständigen Bestand
und den getrennten Lizenzstatus.

Die GitHub-CI prüft Code/Build auf Windows und Linux und erzeugt ausschließlich
den kleinen Codeexport als CI-Artefakt. Sie lädt keine Originalmedien nach und
veröffentlicht keinen Release. Für Pull Requests siehe [Mitmachen](../CONTRIBUTING.md).
