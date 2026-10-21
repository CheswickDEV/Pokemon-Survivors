# Abnahme für 1.0

**Stand: 1.0.0-rc.6.4. Veröffentlichung als Entwickler-Vorabversion beauftragt;
keine vollständige stabile 1.0-Abnahme.**

Der vollständige Entwicklerdownload enthält inzwischen alle aktuellen Medien
und vorhandenen Bearbeitungsquellen. Siehe [Entwicklerhandbuch](DEVELOPMENT.md)
und [Übergabeprüfung](DEVELOPER-VALIDATION.md). Die technische Vollständigkeit
und die unten dokumentierten offenen Medienrechte werden getrennt behandelt.

Die Inhaltsmenge reicht für einen klar begrenzten ersten Desktop-Release.
Die wichtigste Lücke war nicht eine größere Pokédex-Zahl, sondern
abwechslungsreiche Herausforderungen, verlässliches Sichern und ein einfacher
Start. Diese Fassung ergänzt die entsprechenden Systeme. Sie erhebt keinen
Anspruch, sämtliche Inhalte oder Regeln von Vampire Survivors nachzubauen.

## Inhaltsprüfung

| Bereich | Vorher | Release Candidate / Bewertung |
|---|---|---|
| Modi | Lernlauf, Expedition, Endlos, Kanto | Zusätzlich Bossansturm mit 15 Prüfungen; fünf klar beschriebene Modi |
| Schwierigkeit | Vor allem an Lernlauf/Expedition gekoppelt | Entspannt, Standard, Veteran, Meister unabhängig von der Laufart; gespeicherte Regeln |
| Bosse | Waldendkampf immer Bisaflor, andere Gegner mit wenigen gemeinsamen Effekten | 15 Bossprofile mit eigenen Sequenzen; Wechsel im Wald/Endlos; passende Muster für Storygegner; Warn-, Treffer- und Ausklangphase |
| Pokémon | 151 Arten, 72 Entwicklungen | Vollständig im bestehenden Gen-1-Scope; ein Signaturangriff mit acht Rängen je Art; alle 151 mit seltenen Shiny-Varianten |
| Items | Zwölf Passiva, sechs Entwicklungsmittel, Bälle und seltene Heilfunde | Jetzt 18 Passiva, zufällige Levelangebote mit Wiederholungsschutz und acht zusätzliche Talente, drei Talentplätze und legendäre Spieleffekte; Training +1 bis +3 Ränge; Ausrüstungslexikon, Markt, sechs Plätze und fünf Ränge je Passiv |
| Waldquests | Drei mehrstufige Aufgaben und seltene Lichtungen | Vorhanden und getrennt von Bossansturm; Belohnung einmalig; Erfolgsabzeichen dauerhaft |
| Story | 27 Etappen, acht Arenen, Rocket, Liga, Mewtu | Alle 27 Etappen im Meister-Kampagnentest mit drei Starter-Konstellationen durchlaufen; reguläre Niederlagen/Wiederholungen. Reisen und Training vorbereitet, manuelle Vollreise weiterhin offen. Siehe [RC6-Prüfung](RC6-VALIDATION.md) |
| Karten | Räumlich unendlicher Auenwald, Kanto mit 51 Orten/57 Verbindungen/58 Gebäuden | Originale FR/LG-Regionskarte; eigene geländetreue RPG-Minimap, Mauszoom und Verschieben. Zusätzlich feste Prüfungsarena. Keine Zusage einer originalgetreuen Vollrekonstruktion: komplexe Gebäude bleiben verdichtete Räume |
| Langzeitziele | Pokédex und einfache Siegzahl | Fortschrittsbuch mit zehn Abzeichen, Bossbuch, Entwicklungssammlung und Siegen je Modus/Schwierigkeit |
| Speicher | Zwei wechselnde Kopien für Wald und Story; Einzelrun-Export | Dritter eigener Boss-Slot; vollständiger Export/Import von Profil und allen Slots; Format 1–5 wird auf 6 übernommen |
| Installation | Node.js musste installiert sein | Windows-x64-ZIP mit mitgelieferter, hashgeprüfter Laufzeit; Doppelklick startet lokalen Browser |
| GitHub | Kein geregelter Export und kein CI | Positivlisten-Export, GPL-3.0-only, Drittanbietertexte, CI für Quellcode, Bugvorlage, Changelog, Hashes; kein automatischer öffentlicher Medienupload |

Die vier Schwierigkeitsstufen sind eine eigene Designentscheidung. Das Original
hat auch eigene Modifikatoren wie Hyper und Inverse; diese sind nicht mit
unseren vier Stufen gleichzusetzen. Die offizielle
[Adventures-FAQ](https://poncle.games/adventures-faq) beschreibt separate
Kapitelziele und solche freischaltbaren Modi. Unsere Echtzeit-Kanto-Kampagne
bleibt ein eigener Entwurf.

## Tatsächliche Blocker vor dem öffentlichen Vollrelease

1. **Medienrechte:** Die Weiterverteilung aktiver Originalgrafiken und Rufe ist
   nicht dokumentiert freigegeben. Rechte klären oder den betroffenen Bestand
   vollständig ersetzen; Branding/Charaktere mitprüfen. Details:
   [Assetstatus](ASSET-STATUS.md). Ein Fanprojekt-Hinweis hebt das nicht auf.
2. **Unabhängige Spielabnahme:** Ein vollständiger Durchlauf auf einer sauberen
   Windows-Installation ohne vorhandenes Node.js, eine echte Kanto-Reise mit
   Wegen/Gebäuden und längere manuelle Balance-Tests stehen aus. Automatisierte
   Kampfsimulationen überspringen teilweise Reisewege und sind dafür kein Ersatz.
   Die RC6-Stichprobe auf Standard ergab 18 Siege in 18 Waldläufen. Drei
   vorbereitete Meister-Kampfketten erreichten Mewtu mit jeweils zwei Niederlagen
   und regulärer Wiederaufnahme. Stillstehen verliert alle 81 Einzeltests.
   Manuelle menschliche Spieltests bleiben zusätzlich nötig. Aktuelle Ergebnisse:
   [RC6-VALIDATION.md](RC6-VALIDATION.md).
   Frühere Vergleichswerte: [FOREST-BALANCE.md](FOREST-BALANCE.md)
   und [VALIDATION.md](VALIDATION.md).
3. **Publikationsfreigabe erteilt:** Der Projektinhaber hat am 21. Oktober 2026
   den öffentlichen Upload des vollständigen Projekts inklusive aller Medien
   und einen Download-Release ausdrücklich beauftragt. Die Vorabversion dient
   der lokalen Weiterentwicklung; die beiden fachlichen Punkte oben bleiben
   als Grenzen dokumentiert. Die Freigabe des Uploads ersetzt keine Fremdlizenz.

`release-config/status.json` hält diese offenen Punkte maschinenlesbar fest.
`npm run release:public` verweigert das Vollpaket, solange ein Gate offen ist.
Die normalen lokalen Tests und der Quellcodeexport bleiben nutzbar.

## Sinnvolle spätere Erweiterungen, keine verdeckten 1.0-Zusagen

- Separate Survival-Biome mit eigenen Questketten, statt nur farbiger Waldkopien.
- Mehrstöckige Dungeons und handgebaute Rätsel; die vorhandene Kanto-Karte ist
  eine verdichtete Survivors-Adaption.
- Gamepad, Touch, mobile Bildschirme, Linux-/macOS-Spielerpakete.
- Weitere Relikte, Run-Modifikatoren, gezieltes Verbannen von Levelangeboten,
  zusätzliche Team-Synergien und Mehrsprachigkeit.
- Umfassende Balance-Matrix für alle 151 Startpartner, Vierer-Schwierigkeiten
  und späte Endloszyklen. Keine Behauptung, alle Kombinationen seien gleich stark.

## Manuelle Abnahme

- [ ] Frisches Windows-x64-Benutzerprofil, kein Node.js im PATH: ZIP entpacken,
  starten, spielen, sichern, schließen, erneut starten, fortsetzen.
- [ ] Zweiter Start öffnet denselben lokalen Server; fremder Portdienst bleibt
  unangetastet; Start aus einem Ordner mit Leerzeichen.
- [ ] Komplette Sicherung in einem anderen Browser importieren; Pokédex,
  Einstellungen und alle drei Laufstände vergleichen.
- [ ] Lernlauf und Expedition auf Standard gewinnen; Veteran/Meister mit
  verschiedenen Teams bewerten, nicht nur mit dem Ausweichbot.
- [ ] Alle 15 Bossmuster visuell und mit reduzierten Effekten prüfen; keine
  unsichtbaren Treffer oder unentrinnbaren Flächen an Arenarändern.
- [ ] Kanto vom Start bis zur Liga und Mewtu auf regulären Wegen durchspielen;
  Rastpunkte, Türen, Sperren, Markt, Questbelohnungen und Wiederaufnahme testen.
- [ ] Mindestens 60 Minuten Endlos auf einem schwächeren Rechner; Speicher,
  Bildrate und Gegner-/Beutegrenzen beobachten.

Aktuelle Regel-, Kampf- und Leistungsprüfung: [RC6-Prüfung](RC6-VALIDATION.md).

## Sicherheits- und Exportprüfung rc.6.3

Aktuelle Behebungen und Prüfgrenzen: [SECURITY-AUDIT.md](SECURITY-AUDIT.md).
Installation und Voraussetzungen: [INSTALLATION.md](INSTALLATION.md) und
[DEPENDENCIES.md](DEPENDENCIES.md). Die drei Freigaben oben bleiben offen.
