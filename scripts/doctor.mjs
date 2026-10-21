import {fileURLToPath} from 'node:url';
import {readSafe, runtimeAssets, sha256} from './release-policy.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const [major, minor, patch] = process.versions.node.split('.').map(Number);
const nodeOk = major === 22 && (minor > 23 || minor === 23 && patch >= 3);
console.log('Node.js: ' + process.versions.node + (nodeOk ? ' — supported' : ' — please use Node.js 22.23.3 or a later 22.x patch'));
let dependenciesOk = true;
const pkg = JSON.parse(await readSafe(root, 'package.json'));
for (const [name, version] of Object.entries({...pkg.dependencies, ...pkg.devDependencies})) {
  let installed;
  try { installed = JSON.parse(await readSafe(root, 'node_modules/' + name + '/package.json')).version; } catch {}
  if (installed !== version) dependenciesOk = false;
  console.log(name + ': ' + (installed ?? 'missing') + ' (required: ' + version + ')');
}
const assets = await runtimeAssets(root);
let found = 0, invalid = 0;
for (const asset of assets) {
  try { const data = await readSafe(root, 'public/' + asset.path); if (sha256(data) === asset.sha256) found++; else invalid++; }
  catch (error) { if (error.code !== 'ENOENT') invalid++; }
}
console.log('Game media: ' + found + '/' + assets.length + ' verified; ' + invalid + ' changed or invalid.');
if (found !== assets.length) console.log('Game media is missing or changed. Use the full developer package; after intentional media edits, run npm run assets:refresh. The smaller source export contains no Pokémon media. See docs/INSTALLATION.md.');
if (!dependenciesOk) console.log('Install dependencies in the project folder with npm ci.');
process.exitCode = nodeOk && dependenciesOk && !invalid && (!process.argv.includes('--player') || found === assets.length) ? 0 : 1;
