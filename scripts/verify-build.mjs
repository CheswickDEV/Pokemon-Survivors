import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {collectSource, sourceHash, runtimeAssets, readSafe, listFiles, sha256, scanPublicFile} from './release-policy.mjs';

export async function verifyBuild(root, {requireAssets = false} = {}) {
  const source = await collectSource(root), assets = await runtimeAssets(root);
  const version = JSON.parse(source.get('package.json')).version;
  const info = JSON.parse(await readSafe(root, 'dist/build-info.json'));
  if (info.version !== version || info.sourceSha256 !== sourceHash(source)) throw Error('Build is stale. Run npm run build again.');
  const allowed = new Map(assets.map(file => [file.path, file]));
  const files = new Map(); let count = 0;
  for (const name of await listFiles(path.join(root, 'dist'))) {
    const bytes = await readSafe(root, 'dist/' + name), asset = allowed.get(name);
    if (asset) {
      if (sha256(bytes) !== asset.sha256 || bytes.length !== asset.bytes) throw Error('Invalid built asset: ' + name);
      count++;
    } else if (name === 'index.html' || name === 'build-info.json' || /^assets\/[A-Za-z0-9_-]+\.(?:js|css)$/.test(name)) {
      scanPublicFile('dist/' + name, bytes);
    } else throw Error('Unexpected build file: ' + name);
    files.set('dist/' + name, bytes);
  }
  if (!files.has('dist/index.html') || ![...files.keys()].some(name => name.endsWith('.js'))) throw Error('Incomplete code build');
  if (info.assetCount !== count || info.assetsComplete !== (count === assets.length)) throw Error('Build asset metadata mismatch');
  if (requireAssets && count !== assets.length) throw Error('Player package cannot be built: media missing. See docs/ASSET-STATUS.md.');
  return files;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = await verifyBuild(fileURLToPath(new URL('../', import.meta.url)));
  console.log('Verified build: ' + files.size + ' files; only reviewed runtime assets and compiled code.');
}
