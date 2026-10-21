# Kanto-Katalog: 151 spielbare Pokémon

> Historischer Stammdatenkatalog der Fassung 0.3. Die 604 damaligen Attackenplätze werden ab 0.4 im Spiel durch genau eine Signaturwaffe pro Pokémon ersetzt. Aktuelle Waffenregeln und Ditto-Adaption: [WEAPONS.md](WEAPONS.md). Arten, Typen und Entwicklungskanten dieses Katalogs bleiben aktiv.

`src/kanto-catalog.ts` enthält lückenlos die National-Pokédex-Nummern 001–151,
604 Attackenplätze und alle 72 Entwicklungskanten, deren Ausgang und Ziel zu
diesen 151 Pokémon gehören. Der Spielbetrieb lädt hierfür keine externen Daten.
Der Katalog enthält sechs Bewegungsarten: Gehen, Hüpfen, Fliegen, Schweben,
Schlängeln und Schwimmen.

## Quelle und Reproduzierbarkeit

Datengrundlage ist das primäre CSV-Repository des PokeAPI-Projekts:
[PokeAPI/pokeapi, Snapshot 6fd69dfe90465ba96534f6816fc817737d1f97f6](https://github.com/PokeAPI/pokeapi/tree/6fd69dfe90465ba96534f6816fc817737d1f97f6/data/v2/csv).
PokeAPI ist ein unabhängiges Datenprojekt und keine Veröffentlichung von Nintendo.
Die vollständige BSD-3-Clause-Lizenz liegt unter
`public/art/data/PokeAPI-LICENSE.txt` und wird lokal mit ausgeliefert.

`scripts/build-kanto-catalog.py` liest daraus deutsche Pokémon- und Attackennamen,
Typen einschließlich historischer Änderungen, die Lernlisten von Rot/Blau/Gelb,
Entwicklungsbedingungen und die Typentabelle. Der Generator speichert die Dateien
zum Wiederholen unter `.cache/kanto-data/`; er führt heruntergeladene Inhalte
nicht aus. `qa/kanto-catalog-audit.json` enthält den Quell-Commit, alle Datei-URLs,
SHA-256-Prüfsummen, ausgewählte Attacken-IDs und verworfene Attackenvorschläge.
Eine erneute Erzeugung verwendet denselben dort gecachten Snapshot.

## Gen-I-Regeln

- Genau 15 Typen; kein Stahl, Unlicht oder Fee.
- Magnetilo und Magneton haben nur Elektro. Piepi, Pixi, Pummeluff und Knuddeluff
  sind Normal; Pantimos ist Psycho.
- Biss, Windstoß, Karateschlag und Sandwirbel verwenden ihren damaligen Normal-Typ.
- Entwicklungen zu später eingeführten Pokémon sind nicht enthalten. Das gilt
  auch für spätere Babys, regionale Formen und Evoli-Ziele außerhalb von Kanto.
- Evoli kann mit dem passenden Stein zu Aquana, Blitza oder Flamara werden.
- Simsala, Machomei, Geowaz und Gengar verwenden eine Link-Marke statt eines
  externen Tauschs.
- Die Typentabelle berücksichtigt die vier historischen Abweichungen innerhalb
  dieser 15 Typen: Gift gegen Käfer und Käfer gegen Gift jeweils 2×, Geist gegen
  Psycho 0×, Eis gegen Feuer 1×. Das Spiel kann anschließend seine bestehenden,
  abgeschwächten Survivors-Multiplikatoren anwenden.

## Bewusste Anpassungen für den Auenwald-Lauf

Die deutschen Attackennamen und ihre ursprüngliche Lernbarkeit stammen aus den
Rot-/Blau-/Gelb-Lernlisten. Eine Entwicklung darf Attacken ihrer Vorentwicklung
behalten. Vier thematisch passende Attacken wurden pro Familie ausgewählt;
zahlreiche Endformen besitzen eigene Zusammenstellungen. Fernkampf, Fächer,
Flächenangriff, Sprungstoß, Heilung und Umlauf bilden diese Attacken in den sechs
Spielmechaniken des Prototyps ab.

Schaden, Reichweite, Abklingzeiten und Entwicklungsebenen sind für den kurzen
Survivors-Lauf neu abgestimmt. Heilattacken wie Absorber, Blutsauger und
Traumfresser versorgen hier den Trainer. Statusattacken wie Donnerwelle,
Schlafpuder, Gesang, Schwerttanz oder Barriere werden als thematische Angriffs-
und Flächeneffekte umgesetzt; der Katalog behauptet dadurch keine vollständige
Nachbildung ihres rundenbasierten Originaleffekts. K.-o.-Soforttreffer, Selbst-K.-o.
und die zufällige Attackenauswahl von Metronom werden nicht ausgelöst.

Raupy, Safcon, Hornliu, Kokuna, Karpador und Ditto besitzen im Original zu wenige
verschiedene passende Angriffe für vier Survivors-Slots. Ihre zusätzlichen
Slots sind deshalb ausdrücklich benannte Varianten der eigenen Angriffe, etwa
„Fadenschuss · Ring“ oder „Platscher · Welle“. Karpador erhält funktionierende
Treffer statt eines wirkungslosen Platschers. Dittos vier Wandler-Varianten sind
eigenständige Kopierangriffe; sie ändern weder dauerhaft seine Art noch kopieren
sie die komplette Gegnerlogik. Jeder Eintrag hat in Slot 0 einen schädigenden
Angriff, damit auch neu gefangene Unterstützer sofort kämpfen können.

Die bisherigen Entwicklungsgrenzen bleiben erhalten: Starter 8/16, Raupy und
Hornliu 4/8, Rattfratz 10, Pikachu 8 plus Donnerstein. Die übrigen Level werden
aus den ursprünglichen Anforderungen abgeleitet und auf 4–18 begrenzt.
Steinentwicklungen benötigen Level 8 plus den Stein, Tausch-Endformen Level 14
plus Link-Marke. Pokémon aus einstufigen oder zweistufigen Familien bekommen
keine erfundenen weiteren Entwicklungen.

`role`, `traitKind` und `locomotion` sind eigens für diesen Prototyp entworfene
Spielangaben, keine Behauptung historischer Pokémon-Fähigkeiten.
