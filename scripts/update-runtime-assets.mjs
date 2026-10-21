import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {runtimeAssets, readSafe, sha256, safeRelative, scanPublicFile} from './release-policy.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readSafe(root, 'release-config/runtime-assets.json'));
const developer = JSON.parse(await readSafe(root, 'release-config/developer-files.json'));
if (!Array.isArray(developer.files)) throw Error('Invalid developer manifest');
for (const asset of await runtimeAssets(root)) {
  const bytes = await readSafe(root, 'public/' + asset.path);
  const target = manifest.files.find(file => file.path === asset.path);
  target.bytes = bytes.length; target.sha256 = sha256(bytes);
}
for (const name of process.argv.slice(2)) {
  safeRelative(name);
  if (!/^(art|audio)\/.+\.(png|ogg|ttf)$/.test(name) || name.startsWith('art/pokemon/')) throw Error('Expected art/...png, audio/...ogg or art/...ttf; no public/ prefix.');
  const bytes = await readSafe(root, 'public/' + name);
  if (!bytes.length) throw Error('Empty media file');
  scanPublicFile('public/' + name, bytes);
  if (!manifest.files.some(file => file.path === name)) manifest.files.push({path: name, bytes: bytes.length, sha256: sha256(bytes)});
  if (!developer.files.includes('public/' + name)) developer.files.push('public/' + name);
}
manifest.count = manifest.files.length;
manifest.bytes = manifest.files.reduce((sum, file) => sum + file.bytes, 0);
await writeFile(new URL('../release-config/runtime-assets.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
if (process.argv.length > 2) {
  developer.files.sort();
  await writeFile(new URL('../release-config/developer-files.json', import.meta.url), JSON.stringify(developer, null, 2) + '\n');
}
console.log('Hashes of ' + manifest.count + ' runtime assets refreshed. Review the changes before committing.');
