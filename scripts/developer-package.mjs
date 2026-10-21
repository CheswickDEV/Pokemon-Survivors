import {writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {collectSource, readSafe, scanPublicFile, runtimeAssets, sha256, safeRelative} from './release-policy.mjs';
import {makeZip} from './zip.mjs';

export async function collectDeveloper(root) {
  const files = await collectSource(root);
  const manifest = JSON.parse(await readSafe(root, 'release-config/developer-files.json'));
  if (!Array.isArray(manifest.files) || new Set(manifest.files).size !== manifest.files.length) throw Error('Invalid developer media manifest');
  for (const name of manifest.files) {
    safeRelative(name);
    if (!name.startsWith('public/') || name.startsWith('public/art/pokemon/')) throw Error('Unexpected developer media path');
    const bytes = await readSafe(root, name);
    scanPublicFile(name, bytes);
    files.set(name, bytes);
  }
  for (const asset of await runtimeAssets(root)) {
    const bytes = files.get('public/' + asset.path);
    if (!bytes || bytes.length !== asset.bytes || sha256(bytes) !== asset.sha256) throw Error('Missing or changed developer runtime asset: ' + asset.path);
  }
  return files;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.length === 3 && process.argv[2] === '--check';
  if (process.argv.length !== 2 && !checkOnly) throw Error('Use no arguments to create a local archive, or --check to validate only.');
  const root = fileURLToPath(new URL('../', import.meta.url)), files = await collectDeveloper(root);
  const pkg = JSON.parse(files.get('package.json')), status = JSON.parse(files.get('release-config/status.json'));
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version) || status.version !== pkg.version) throw Error('Invalid developer version');
  const info = {version: pkg.version, completeDeveloperFiles: true, codeLicense: 'GPL-3.0-only', allContentsOpenSource: false, assetRedistributionCleared: status.assetRedistributionCleared === true, publicationApproved: status.publicReleaseApproved === true};
  if (checkOnly) {
    console.log(JSON.stringify({...info, entries: files.size}, null, 2));
  } else {
  files.set('DEVELOPER-PACKAGE.json', Buffer.from(JSON.stringify(info, null, 2) + '\n'));
  const inventory = [...files].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([file, bytes]) => ({file, bytes: bytes.length, sha256: sha256(bytes)}));
  files.set('DEVELOPER-FILES.json', Buffer.from(JSON.stringify(inventory, null, 2) + '\n'));
  const base = 'Pokemon-Survivors-' + pkg.version + '-developer';
  const archive = makeZip(new Map([...files].map(([name, bytes]) => [base + '/' + name, bytes])));
  await mkdir(path.join(root, 'release'), {recursive: true});
  await writeFile(path.join(root, 'release', base + '.zip'), archive);
  const result = {...info, file: base + '.zip', entries: files.size, bytes: archive.length, sha256: sha256(archive)};
  await writeFile(path.join(root, 'release', 'developer-manifest.json'), JSON.stringify(result, null, 2) + '\n');
  await writeFile(path.join(root, 'release', 'DEVELOPER-SHA256SUMS.txt'), result.sha256 + '  ' + result.file + '\n');
  console.log(JSON.stringify(result, null, 2));
  }
}
