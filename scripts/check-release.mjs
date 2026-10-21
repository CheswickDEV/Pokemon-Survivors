import {fileURLToPath} from 'node:url';
import {collectSource, runtimeAssets, sourceHash} from './release-policy.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = await collectSource(root);
await runtimeAssets(root);
const pkg = JSON.parse(files.get('package.json'));
const lock = JSON.parse(files.get('package-lock.json'));
const status = JSON.parse(files.get('release-config/status.json'));
if (pkg.version !== lock.version || pkg.version !== lock.packages[''].version || pkg.version !== status.version) throw Error('Version mismatch');
if (!pkg.private) throw Error('Accidental npm publishing must remain disabled');
for (const file of ['package-lock.json', 'tools/assets/package-lock.json']) {
  const dependencyLock = JSON.parse(files.get(file));
  for (const [name, entry] of Object.entries(dependencyLock.packages)) {
    if (name && (!entry.integrity?.startsWith('sha512-') || !entry.resolved?.startsWith('https://registry.npmjs.org/'))) throw Error('Unpinned or non-registry dependency: ' + name);
  }
}
for (const [name, bytes] of files) {
  if (name.startsWith('.github/workflows/') && /uses:\s+[^\s]+@(?!(?:[0-9a-f]{40})(?:\s|$))/.test(bytes.toString())) throw Error('Workflow action must use a full commit SHA: ' + name);
}
console.log(JSON.stringify({version: pkg.version, sourceFiles: files.size, sourceSha256: sourceHash(files), publicPlayerReleaseReady: status.publicReleaseApproved === true && status.assetRedistributionCleared === true && status.manualAcceptanceComplete === true}, null, 2));
