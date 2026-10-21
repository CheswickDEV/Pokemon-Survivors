# Classic sound design references

Research references for the project's own short Web Audio effects. These notes describe building blocks; they do not claim hardware-accurate Game Boy emulation. Cry recordings are documented separately in `cries/PROVENANCE.md`.

The inspected [Pokémon Crystal sound-effect definitions](https://github.com/pret/pokecrystal/blob/97187cd21b15e9a266a786318c851848f2fac24b/audio/sfx.asm) support these concise design choices:

- Menu movement uses a short, decaying noise accent. Button confirmation uses two separated 50%-duty pulse notes, with register values 1664 then 1920: approximately 341.3 then 1024 Hz.
- Ball wobble uses a pulse with reversing pitch sweep. Ball throwing layers two near-detuned pulses; ball release mixes swept pulse and decaying noise. Treat those as distinct moments instead of one generic beep.
- Sparkle uses a narrow pulse and rising pitches: approximately 512, 682.7, 1024, 2048, and 4096 Hz, then a fading final tone.
- Level-up and successful-catch sounds use multiple voices with short repeated notes and a longer resolved ending. Use a separate species cry after capture or evolution, with restrained simultaneous voices during combat.

[Crystal's evolution music](https://github.com/pret/pokecrystal/blob/97187cd21b15e9a266a786318c851848f2fac24b/audio/music/evolution.asm) combines pulsed alternating-note motifs, pitch slides, vibrato, stereo separation, bass, and noise percussion. A short rising, pulsed texture followed by a resolving chime adapts those techniques to the game's brief evolution animation without importing background music.

[Pan Docs: audio registers](https://github.com/gbdev/pandocs/blob/master/src/Audio_Registers.md) documents pulse duties of 12.5%, 25%, 50%, and 75%; the pulse frequency is `131072 / (2048 - registerValue)` Hz. Envelope updates tick at 64 Hz; pitch-sweep pacing uses 128 Hz ticks. A periodic wave can supply the narrow pulse; stepped gain envelopes and deterministic LFSR noise sound closer to this hardware than a smooth sine oscillator. A triangle oscillator is a convenient browser bass approximation, not the original programmable wave-channel waveform.

Suggested project integration: master effect volume, rate-limited attack sounds, short UI acknowledgements, and a single cry voice to avoid overlapping recordings. Generate these effects locally; do not fetch remote audio during gameplay.
