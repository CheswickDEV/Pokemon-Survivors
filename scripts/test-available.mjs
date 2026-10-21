import {access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {readdir} from 'node:fs/promises';
import {runtimeAssets} from './release-policy.mjs';
import {collectDeveloper} from './developer-package.mjs';
let developerPackage = false;
try { await access('DEVELOPER-PACKAGE.json'); developerPackage = true; } catch {}
// A complete checkout must not silently downgrade its checks if a file is lost.
if (developerPackage) await collectDeveloper(process.cwd());
let complete = true;
for (const asset of await runtimeAssets(process.cwd())) {
  try { await access('public/' + asset.path); } catch { complete = false; break; }
}
console.log(complete ? 'Complete developer checkout: running all tests.' : 'Code-only snapshot: running media-independent tests.');
const args = complete || developerPackage ? ['--experimental-strip-types', '--test', ...(await readdir('tests')).filter(f => f.endsWith('.test.ts')).map(f => 'tests/' + f)] : ['scripts/test-core.mjs'];
const result = spawnSync(process.execPath, args, {stdio: 'inherit', windowsHide: true});
process.exitCode = result.status ?? 1;
