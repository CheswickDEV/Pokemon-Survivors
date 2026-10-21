import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm, symlink} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {Engine, newRun} from '../src/engine.ts';
import {validateState, decodeBackup, backupEnvelope, defaultProfile} from '../src/save.ts';
import {escapeHtml} from '../src/ui-components.ts';
import {safeRelative, scanPublicFile, readSafe, collectSource, sourceHash, sha256} from '../scripts/release-policy.mjs';
import {makeZip} from '../scripts/zip.mjs';
import {validateRuntimeConfig} from '../scripts/runtime.mjs';
import {verifyBuild} from '../scripts/verify-build.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));

test('import rejects prototype names and non-numeric species in enemies and encounters', () => {
  for (const id of ['constructor', '__proto__', 'toString', '1', 1.5, -1, 152]) {
    const e = new Engine(newRun(1, 'normal'));
    e.addEnemy(1, 'wild');
    (e.s.enemies[0] as any).species = id;
    assert.throws(() => validateState(e.s), /Gegner/);
    e.s.enemies = [];
    e.s.encounters = [{id: 'fixture', species: id, x: 0, y: 0, ready: true, claimed: false}] as any;
    assert.throws(() => validateState(e.s), /Begegnung/);
    assert.throws(() => decodeBackup(backupEnvelope({profile: defaultProfile(), forest: e.s, story: null, bossrush: null})));
  }
});
test('imported display text is encoded as text for HTML contexts', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('release scans reject private content in every extension, caches and unsafe ZIP paths', () => {
  const examples = ['C:' + '/' + ['Users', 'Example', 'private'].join('/'), '/ho' + 'me/example/private', 'gh' + 'p_' + 'a'.repeat(30), 'github_' + 'pat_' + 'a'.repeat(40), 'sk-' + 'proj-' + 'a'.repeat(30), '-----BEGIN ' + 'PRIVATE KEY-----', 'https://' + 'user:secret@example.invalid/'];
  for (const text of examples) for (const name of ['NOTICE', 'script.py', 'start.cmd', 'data.json']) assert.throws(() => scanPublicFile(name, Buffer.from(text)));
  assert.throws(() => scanPublicFile('scripts/__pycache__/import.pyc', Buffer.from('cache')));
  assert.throws(() => scanPublicFile('.npmrc', Buffer.from('_auth' + 'Token=' + 'fixture-secret')));
  assert.throws(() => scanPublicFile('config.json', Buffer.from('npm' + '_' + 'a'.repeat(36))));
  for (const name of ['../escape', '/absolute', 'a/../b', 'C:' + '/file', 'a\\b', 'a//b', 'a:stream', './a']) {
    assert.throws(() => safeRelative(name));
    assert.throws(() => makeZip(new Map([[name, Buffer.from('test')]])));
  }
});
test('public source manifest excludes generated and unapproved media files', async () => {
  const files = await collectSource(root);
  for (const name of files.keys()) assert.ok(!/\.(?:png|ogg|pyc|zip|exe)$/.test(name), name);
  assert.ok(files.has('package-lock.json') && files.has('SECURITY.md') && files.has('docs/INSTALLATION.md'));
  assert.equal(sourceHash(files), sourceHash(new Map([...files].reverse())));
});
test('source reads reject directory junctions and symlink escapes', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'survivors-policy-'));
  try {
    await mkdir(path.join(dir, 'root')); await mkdir(path.join(dir, 'outside'));
    await writeFile(path.join(dir, 'outside/private.txt'), 'fixture');
    await symlink(path.join(dir, 'outside'), path.join(dir, 'root/link'), process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(readSafe(path.join(dir, 'root'), 'link/private.txt'), /Link/);
  } finally {
    assert.equal(path.dirname(dir), path.resolve(tmpdir())); assert.ok(path.basename(dir).startsWith('survivors-policy-'));
    await rm(dir, {recursive: true, force: true});
  }
});
test('runtime pins only accept the exact official HTTPS archive and checksum paths', async () => {
  const config = JSON.parse(await readSafe(root, 'release-config/node-runtime.json'));
  validateRuntimeConfig(config);
  for (const change of [{url: config.url.replace('nodejs.org', 'example.invalid')}, {archive: '../node.zip'}, {checksums: 'http://nodejs.org/sums'}, {sha256: 'bad'}]) assert.throws(() => validateRuntimeConfig({...config, ...change}));
});
test('ambiguous release flags and unapproved public builds fail before packaging', async () => {
  const run = (...args: string[]) => spawnSync(process.execPath, ['scripts/release.mjs', ...args], {cwd: root, encoding: 'utf8', windowsHide: true});
  assert.notEqual(run('--source', '--public').status, 0);
  const status = JSON.parse(await readSafe(root, 'release-config/status.json'));
  if (!status.publicReleaseApproved || !status.assetRedistributionCleared || !status.manualAcceptanceComplete) assert.match(run('--public').stderr, /blocked/);
});
test('build verification rejects extra raw files, changed source and missing player media', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'survivors-build-'));
  const put = async (name: string, value: unknown) => { await mkdir(path.dirname(path.join(dir, name)), {recursive: true}); await writeFile(path.join(dir, name), typeof value === 'string' ? value : JSON.stringify(value)); };
  try {
    await put('package.json', {version: 'fixture'});
    await put('release-config/source-files.json', {files: ['package.json']});
    await put('release-config/runtime-assets.json', {count: 1, files: [{path: 'art/test.png', bytes: 1, sha256: sha256(Buffer.from('a'))}]});
    await put('dist/index.html', '<script src="/assets/test.js"></script>'); await put('dist/assets/test.js', '// fixture');
    const info = {version: 'fixture', sourceSha256: sourceHash(await collectSource(dir)), assetCount: 0, assetsComplete: false};
    await put('dist/build-info.json', info);
    await verifyBuild(dir);
    await assert.rejects(verifyBuild(dir, {requireAssets: true}), /media missing/);
    await put('dist/prompts.json', '{}'); await assert.rejects(verifyBuild(dir), /Unexpected build file/);
    await rm(path.join(dir, 'dist/prompts.json'));
    await put('package.json', {version: 'changed'}); await assert.rejects(verifyBuild(dir), /stale/);
  } finally {
    assert.equal(path.dirname(dir), path.resolve(tmpdir())); assert.ok(path.basename(dir).startsWith('survivors-build-'));
    await rm(dir, {recursive: true, force: true});
  }
});
