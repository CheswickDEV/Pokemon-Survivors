# Signaturwaffen der 151 Pokémon

Jedes Pokémon besitzt genau **eine automatische, bis Rang 8 trainierbare Waffe**. Es gibt keine austauschbaren Attackenplätze und kein standardmäßiges Paket aus Fern-, Flächen- und Heilattacke. Die Identität entsteht aus Bewegungsmuster, Reichweite, Form, Tempo, Trefferzahl, Durchdringung und Nebeneffekt.

Die Daten stehen in `src/signature-weapons.ts`. `src/kanto-catalog.ts` bleibt die Quelle für Namen, Typen und Entwicklungslinien. Die Attackennamen greifen auf diesen bereits geprüften Katalog und bekannte Attacken der ersten Generation zurück. Es handelt sich um ausdrücklich auf das Echtzeitspiel angepasste Waffen, nicht um eine Simulation der Game-Boy-Kampfregeln.

## Waffenfamilien

| Beispiel | Spielweise | Besonderer Ausbau |
|---|---|---|
| Bisasam-Linie | Zurückkehrende Rasierblätter | Mehr Blätter |
| Glumanda-Linie | Gerichteter Flammenkegel | Größerer Treffbereich |
| Schiggy-Linie | Schmaler durchdringender Wasserstrahl | Mehr Durchdringung |
| Pikachu-Linie | Kettenblitz zwischen Gegnern | Mehr Sprungziele |
| Sandan-Linie | Erdhügel als Kontaktfallen | Mehr Fallen |
| Rattfratz-Linie | Kurzer Ruckzuckhieb | Kürzere Pausen |
| Onix | Eng kreisende Felsen | Mehr Felsen |
| Tragosso-Linie | Knochen auf Hin- und Rückweg | Mehr Durchdringung |
| Nebulak-Linie | Saugender Nebeltreffer | Höheres Tempo |
| Relaxo | Schwerer Aufprall rundum | Größerer Einschlag |

Alle 16 Muster sind vertreten: Einzelgeschoss, Fächer, zeitversetzte Salve, Strahl, Kettenblitz, Orbit, Rundwelle, Kegel, Nahkampfschnitt, schneller Vorstoß, Bumerang, Kontaktfalle, Dauerfeld, Saugtreffer, Ansturm und abprallendes Geschoss. Muster dürfen zwischen Familien vorkommen; ihre Kombination aus Zahlen, Form und Nebeneffekten unterscheidet die Familien.

Reguläre Entwicklungslinien behalten ihr Muster und ihren Ausbauschwerpunkt. Die Attacke kann dabei einen passenderen Namen oder Typ erhalten. Zwei bewusst große Veränderungen bleiben erhalten: **Karpador wird vom kleinen Platscher-Kreis zum Hydropumpen-Strahl**, und **Evolis drei Entwicklungen erhalten jeweils Wasserfeld, Nadelfächer oder Flammenkegel**. Der erreichte Waffenrang soll beim Entwickeln erhalten bleiben. Die Größe des Pokémon-Sprites ist von Waffenwerten unabhängig.

## Ränge und Balancevertrag

- Rang 1 ist bei allen 151 Arten offensiv spielbar. Heilung bleibt ein sekundärer Effekt.
- Jeder weitere Rang erhöht den Grundschaden um 16 Prozentpunkte gegenüber Rang 1 und verkürzt die Grundpause um 4 Prozentpunkte.
- Auf Rang 3, 5 und 8 kommt der jeweilige Schwerpunkt hinzu: ein weiteres Geschoss bzw. ein weiterer Treffer, eine weitere Durchdringung, ein weiteres Sprungziel, 12 % mehr Trefferfläche, 20 % mehr Wirkungsdauer oder zusätzlich 7 % weniger Pause.
- Die Zahl der Angriffe pro Auslösung ist auf acht begrenzt. Die höchste Grundzahl ist fünf, sodass alle drei Meilensteine wirksam bleiben.
- Die acht `rankNotes` sind unmittelbar aus diesem Vertrag abgeleitet. Sie beschreiben den Grundwert-Ausbau, bevor Teamstufe, Entwicklung, Typvorteil und Ausrüstung einfließen.

`power` meint **Schaden je Treffer**, nicht Schaden pro Sekunde. Dauerfelder sind für eine Trefferpause von ungefähr 0,65 Sekunden pro Gegner abgestimmt; kreisende Waffen für ungefähr 0,75 Sekunden. Kleine Geschosse benötigen eine Treffermenge pro Gegner, damit derselbe Treffer nicht in jedem Bild erneut zählt. Zurückkehrende Geschosse dürfen nach der Umkehr erneut treffen. Die Root-Engine begrenzt sekundäre Heilung auf insgesamt zwei KP pro Auslösung.

Bei Rang 8 liegt der reine Grundschadensfaktor bei 2,12 und die normale Pausenlänge bei 0,72 des Ausgangswerts. Zusätzliche Projektile erhöhen vor allem die Gruppenabdeckung; Nahkampfsalven können gegen große Einzelziele überdurchschnittlich stark werden. Diese Fälle benötigen bei späteren Balance-Runden besondere Beachtung. Das sind Spielwerte, keine Behauptung über einen bereits durchgeführten Langzeittest.

## Darstellung und Maße

Entfernungen und Größen sind Weltpixel, Zeitwerte Sekunden, Winkel Radiant. `bounces` zählt zusätzliche Ziele. Bei Feldern/Fallen ist `size` der Radius, bei Strahlen die halbe Breite und bei Geschossen der Kontaktradius. Bei Nahkampf und Kegel geben `range` und `arc` Reichweite und Öffnungswinkel an.

Die Basisgrößen werden im Katalog begrenzt: bewegte Projektile höchstens 12 Pixel Radius, Felder und Fallen 45–80 Pixel, Rundwellen 65–110 Pixel. Kreisende Waffen bleiben 45–80 Pixel vom Trainer entfernt und haben 10–17 Pixel Kontaktradius. Die Grenzen helfen, den Trainer und gegnerische Warnzeichen auch mit mehreren Partnern zu erkennen.

## Bewusste Survivors-Anpassungen

Fadenschuss, Schlafpuder, Pilzspore, Gesang, Hypnose und Barriere verursachen in dieser Fassung Schaden, damit ihr Pokémon als alleiniger Startpartner funktionieren kann. Panzerschutz wird als kreisender Wasserpanzer dargestellt. Platscher verursacht einen kleinen Kontaktschaden. Chaneiras Eierbombe verbindet Angriff und geringe Heilung. Wandler ist ein elastisches, abprallendes Geschoss und übernimmt **keine** gegnerische Attacke. Metronom hat feste Stern-/Lichtmuster; es würfelt keine fremden Waffen aus. Frühe Formen dürfen die für ihre Linie nötige Signaturattacke bereits vor den originalen Lernstufen einsetzen. Diese Regeln sind Teil des Spielentwurfs und werden nicht als Originalverhalten ausgegeben.

Die separaten Katalogtests prüfen vollständige 151er-Abdeckung, alle 15 Typen und 16 Muster, offensive Startwerte, acht Ranghinweise, wirkungsvolle Meilensteine, Entwicklungskohärenz und lesbare Basisgrößen.
