# Pokémon cries, Generation I roster

These 151 unmodified Ogg/Vorbis files are the `legacy` cries for National Pokédex IDs 1–151 from [PokeAPI/cries](https://github.com/PokeAPI/cries/tree/b3a9044bb839b5e3152aaa536c7b463a0fcf0140/cries/pokemon/legacy), pinned to commit `b3a9044bb839b5e3152aaa536c7b463a0fcf0140`.

The original binary files are downloaded as data without executing them. No pitch, speed, encoding, volume, or duration transformation was applied. Their runtime URLs are `/audio/cries/<national-id>.ogg`; all runtime playback is local and requires no remote service. `legacy` is the upstream variant name, not a claim that every recording was taken from a particular original cartridge.

The upstream README credits Pokémon Showdown, Veekun, and The Sounds Resource as its collection sources. The copied `upstream-LICENSE` expressly states that the audio content is copyright The Pokémon Company; the repository's CC0 statement does not make those game recordings original project material. The complete upstream notice and README are retained alongside the assets.

`source-manifest.json` records each pinned source URL, SHA-256, byte length, channel count, sample rate, stream duration, and Ogg page count. Import verified all 151 streams for Ogg framing, complete segment tables and payloads, sequential page numbers, Vorbis identification, end-of-stream, and plausible sample-count duration. Total: 916,983 bytes; durations: 0.181–2.238 seconds. Structural verification does not replace an audible playback check in the target browser.

Reproduce with `node scripts/import-gen1-cries.mjs` from the `game` directory. The importer is pinned and only requests IDs 1–151.
