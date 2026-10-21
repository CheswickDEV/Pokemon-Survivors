import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const commit = 'b3a9044bb839b5e3152aaa536c7b463a0fcf0140';
const base = `https://raw.githubusercontent.com/PokeAPI/cries/${commit}`;
const output = path.join(root, 'public/audio/cries');

function inspectOgg(buffer) {
  let offset = 0, pages = 0, previousSequence = -1, serial, lastGranule = 0n, eos = false;
  while (offset < buffer.length) {
    if (buffer.toString('ascii', offset, offset + 4) !== 'OggS' || buffer[offset + 4] !== 0)
      throw new Error(`Invalid Ogg page at ${offset}`);
    if (offset + 27 > buffer.length) throw new Error('Truncated Ogg page header');
    const sequence = buffer.readUInt32LE(offset + 18);
    const pageSerial = buffer.readUInt32LE(offset + 14);
    if (serial !== undefined && pageSerial !== serial) throw new Error('Unexpected chained stream');
    if (sequence !== previousSequence + 1) throw new Error('Nonsequential Ogg page');
    serial = pageSerial;
    previousSequence = sequence;
    const granule = buffer.readBigUInt64LE(offset + 6);
    if (granule !== 0xffffffffffffffffn) lastGranule = granule;
    eos = Boolean(buffer[offset + 5] & 4);
    const segments = buffer[offset + 26];
    if (offset + 27 + segments > buffer.length) throw new Error('Truncated segment table');
    let bytes = 0;
    for (let i = 0; i < segments; i++) bytes += buffer[offset + 27 + i];
    offset += 27 + segments + bytes;
    if (offset > buffer.length) throw new Error('Truncated Ogg payload');
    pages++;
  }
  const identification = buffer.indexOf(Buffer.from([1, ...Buffer.from('vorbis')]));
  if (!eos || identification < 0 || pages < 2) throw new Error('Incomplete Vorbis stream');
  const channels = buffer[identification + 11];
  const sampleRate = buffer.readUInt32LE(identification + 12);
  if (!(sampleRate >= 8000 && sampleRate <= 192000) || !(channels >= 1 && channels <= 2))
    throw new Error('Invalid Vorbis format');
  const durationSeconds = Number(lastGranule) / sampleRate;
  if (!(durationSeconds > 0.1 && durationSeconds < 20)) throw new Error('Implausible cry duration');
  return { bytes: buffer.length, channels, sampleRate, durationSeconds, oggPages: pages };
}

async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url);
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if (attempt === 2) throw new Error(`${response.status} ${url}`);
  }
}

await fs.mkdir(output, { recursive: true });
const manifest = new Array(151);
let next = 1;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (next <= 151) {
    const id = next++;
    const source = `${base}/cries/pokemon/legacy/${id}.ogg`;
    const buffer = await get(source);
    const details = inspectOgg(buffer);
    await fs.writeFile(path.join(output, `${id}.ogg`), buffer);
    manifest[id - 1] = {
      id, file: `${id}.ogg`, source, sha256: crypto.createHash('sha256').update(buffer).digest('hex'), ...details,
    };
  }
}));
for (const name of ['LICENSE', 'README.md']) {
  await fs.writeFile(path.join(output, `upstream-${name}`), await get(`${base}/${name}`));
}
await fs.writeFile(path.join(output, 'source-manifest.json'), JSON.stringify({
  repository: 'https://github.com/PokeAPI/cries', commit, variant: 'legacy', transformed: false,
  count: manifest.length, cries: manifest,
}, null, 2) + '\n');
await fs.writeFile(path.join(root, 'src/cry-audio.ts'),
  '// Original legacy cry assets, pinned to PokeAPI/cries. See public/audio/cries/PROVENANCE.md.\n' +
  'export const CRY_AUDIO: Readonly<Record<number, string>> = Object.freeze({\n' +
  manifest.map(({ id }) => `  ${id}: '/audio/cries/${id}.ogg',`).join('\n') +
  '\n});\n\n' +
  'export function cryAudio(id: number): string | undefined {\n' +
  '  return Number.isInteger(id) && id >= 1 && id <= 151 ? CRY_AUDIO[id] : undefined;\n' +
  '}\n');
console.log(JSON.stringify({ count: manifest.length, totalBytes: manifest.reduce((n, x) => n + x.bytes, 0),
  minimumDuration: Math.min(...manifest.map(x => x.durationSeconds)),
  maximumDuration: Math.max(...manifest.map(x => x.durationSeconds)), verified: 'Ogg pages, Vorbis identification, complete EOS, sample count, SHA-256' }));
