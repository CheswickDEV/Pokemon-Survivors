import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm, readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {collectDeveloper} from '../scripts/developer-package.mjs';
import {sha256} from '../scripts/release-policy.mjs';

async function fixture(run: (root: string, put: (name: string, value: unknown) => Promise<void>) => Promise<void>) {
  const root = await mkdtemp(path.join(tmpdir(), 'survivors-developer-'));
  const put = async (name: string, value: unknown) => {
    await mkdir(path.dirname(path.join(root, name)), {recursive: true});
    await writeFile(path.join(root, name), typeof value === 'string' ? value : JSON.stringify(value));
  };
  try {
    await put('package.json', {version: 'fixture'});
    await put('release-config/source-files.json', {files: ['package.json']});
    await put('release-config/developer-files.json', {files: ['public/art/test.png', 'public/art/source.txt']});
    await put('release-config/runtime-assets.json', {count: 1, files: [{path: 'art/test.png', bytes: 5, sha256: sha256(Buffer.from('image'))}]});
    await put('public/art/test.png', 'image');
    await put('public/art/source.txt', 'editable source and credits');
    await run(root, put);
  } finally {
    assert.equal(path.dirname(root), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith('survivors-developer-'));
    await rm(root, {recursive: true, force: true});
  }
}

test('developer export includes code, runtime media and editable sources together', async () => {
  await fixture(async root => {
    const files = await collectDeveloper(root);
    assert.equal(files.size, 3);
    assert.equal(files.get('public/art/source.txt')?.toString(), 'editable source and credits');
  });
});
test('developer export rejects absent or changed runtime media', async () => {
  await fixture(async (root, put) => {
    await put('public/art/test.png', 'changed');
    await assert.rejects(collectDeveloper(root), /changed developer runtime asset/);
    await put('release-config/developer-files.json', {files: ['public/art/source.txt']});
    await assert.rejects(collectDeveloper(root), /Missing/);
  });
});
test('developer export rejects private content, traversal, duplicate and obsolete paths', async () => {
  await fixture(async (root, put) => {
    await put('public/art/source.txt', 'C:' + '/' + ['Users', 'Example', 'private'].join('/'));
    await assert.rejects(collectDeveloper(root), /Private|private/);
    for (const files of [['../outside'], ['public/../outside'], ['public/art/pokemon/old.png'], ['public/a', 'public/a']]) {
      await put('release-config/developer-files.json', {files});
      await assert.rejects(collectDeveloper(root));
    }
  });
});

test('asset refresh registers deliberately added media in both manifests and rejects traversal', async () => {
  await fixture(async (root, put) => {
    for (const name of ['update-runtime-assets.mjs', 'release-policy.mjs']) {
      await put('scripts/' + name, await readFile(new URL('../scripts/' + name, import.meta.url), 'utf8'));
    }
    await put('public/art/new.png', 'new-image');
    const run = (arg: string) => spawnSync(process.execPath, [path.join(root, 'scripts/update-runtime-assets.mjs'), arg], {encoding: 'utf8', windowsHide: true});
    assert.equal(run('art/new.png').status, 0);
    const assets = JSON.parse(await readFile(path.join(root, 'release-config/runtime-assets.json'), 'utf8'));
    assert.equal(assets.count, 2);
    assert.equal(assets.files[1].sha256, sha256(Buffer.from('new-image')));
    const media = JSON.parse(await readFile(path.join(root, 'release-config/developer-files.json'), 'utf8'));
    assert.ok(media.files.includes('public/art/new.png'));
    assert.notEqual(run('../outside.png').status, 0);
    assert.notEqual(run('art/new.txt').status, 0);
    assert.equal(JSON.parse(await readFile(path.join(root, 'release-config/runtime-assets.json'), 'utf8')).count, 2);
  });
});
