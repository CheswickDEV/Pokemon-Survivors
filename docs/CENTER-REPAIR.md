# Pokémon-Center: Korrektur in 1.0.0-rc.6.1

Die RC6-Vorschau zeigte weiterhin einen unvollständigen Empfang. Die damalige visuelle Abnahme war falsch: Joys Position und die Zeichenreihenfolge allein konnten die fehlenden Bestandteile nicht reparieren.

## Ursache und Änderung

Der frühere Import der Heilungsstation enthielt nur die Vordergrundebene und einen verkürzten Ausschnitt. Dadurch fehlten unter anderem der Bildschirm, die Maschinenbasis, die seitlichen Rückbauten und der Boden des Arbeitsbereichs.

Der neue Empfang übernimmt den vollständigen Bereich `(4, 0, 7, 4)` in Metatiles aus `PokemonCenter_1F_Layout`, einschließlich beider Bildebenen. Die resultierenden 112 × 64 Pixel stimmen exakt mit dem entsprechenden Ausschnitt der vorhandenen Originalreferenz überein. Grundlage bleibt der dokumentierte pokefirered-Stand `ce6406d8c2eaf46d543c8a2606de0c3cb1951982`; es wurden keine Originalpixel übermalt.

Der Empfang schließt nun an die Nordwand an. Die irrtümlich darunter verwendete blaue Wohnhaus-Wandreihe entfällt. Joy steht zwischen dem hinteren Arbeitsbereich und der separat gezeichneten vorderen Tresenkante. Der gesamte Arbeitsbereich hat eine zusammenhängende Kollision; die Ansprechposition liegt davor. Diese gemeinsame Vorlage verwenden alle zehn Pokémon-Center.

Falls ein älterer Spielstand eine Figur innerhalb des nun geschlossenen Arbeitsbereichs enthält, wird sie beim Laden an eine freie Position vor dem Empfang gesetzt. Trainer-KP, Pokémon-Ausdauer und Fortschritt werden dabei nicht verändert. Volle Ausdauerbalken werden in friedlichen Innenräumen ausgeblendet; angeschlagene Pokémon und laufende Prüfungen behalten ihre Anzeige.

## Prüfung

- Vollständige Testsuite: **150 bestanden, 0 fehlgeschlagen**. Enthalten sind die Laufwege aller 58 Innenräume sowie die Empfangskollision, Joys Ebenenreihenfolge und die Wiederherstellung alter Positionen in allen zehn Centern.
- Exakter Pixelvergleich des neuen Empfangs mit dem vollständigen Originalausschnitt: bestanden.
- Browserprüfung in Azuria mit dem tatsächlichen Spielrenderer: Frontansicht und linke Tresenseite visuell geprüft.
- Schwester Joy im Browser angesprochen: Pokémon-Ausdauer **12 → 100**, Trainer-KP unverändert **37**.

Lokale Nachweise stehen unter `qa/center-fix-full-tests.log`, `qa/center-repair-asset.json`, `qa/center-repair-front.png` und `qa/center-repair-side.png`. Die Browserbilder stammen aus einer separaten Prüfszene mit demselben Spielrenderer, nicht aus einer bearbeiteten Vorschaugrafik. Der Spielstand des Nutzers wurde dafür nicht verwendet.

Diese Korrektur betrifft den Empfang und seine Einbindung. Sie ersetzt die fehlerhafte visuelle RC6-Abnahme des Centers; die früheren Kampfprüfungen werden dadurch nicht zu neuen RC6.1-Durchläufen.
