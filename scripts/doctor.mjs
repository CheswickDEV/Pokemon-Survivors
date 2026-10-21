import {fileURLToPath} from 'node:url';
import {readSafe, runtimeAssets, sha256} from './release-policy.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const [major, minor, patch] = process.versions.node.split('.').map(Number);
const nodeOk = major === 22 && (minor > 23 || minor === 23 && patch >= 3);
console.log('Node.js: ' + process.versions.node + (nodeOk ? ' — unterstützt' : ' — bitte Node.js 22.23.3 oder neueren 22.x-Patch verwenden'));
let dependenciesOk = true;
const pkg = JSON.parse(await readSafe(root, 'package.json'));
for (const [name, version] of Object.entries({...pkg.dependencies, ...pkg.devDependencies})) {
  let installed;
  try { installed = JSON.parse(await readSafe(root, 'node_modules/' + name + '/package.json')).version; } catch {}
  if (installed !== version) dependenciesOk = false;
  console.log(name + ': ' + (installed ?? 'fehlt') + ' (benötigt: ' + version + ')');
}
const assets = await runtimeAssets(root);
let found = 0, invalid = 0;
for (const asset of assets) {
  try { const data = await readSafe(root, 'public/' + asset.path); if (sha256(data) === asset.sha256) found++; else invalid++; }
  catch (error) { if (error.code !== 'ENOENT') invalid++; }
}
console.log('Spielmedien: ' + found + '/' + assets.length + ' geprüft; ' + invalid + ' verändert oder unzulässig.');
if (found !== assets.length) console.log('Spielmedien fehlen oder wurden verändert. Für ein vollständiges Projekt das Entwicklerpaket verwenden; nach bewussten Medienänderungen npm run assets:refresh ausführen. Der kleine source-Export enthält keine Pokémon-Medien. Siehe docs/INSTALLATION.md.');
if (!dependenciesOk) console.log('Abhängigkeiten im Projektordner mit npm ci installieren.');
process.exitCode = nodeOk && dependenciesOk && !invalid && (!process.argv.includes('--player') || found === assets.length) ? 0 : 1;
