import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {collectSource, sourceHash, runtimeAssets, readSafe, sha256} from './scripts/release-policy.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
let command;
export default defineConfig({
  publicDir: false,
  server: {host: '127.0.0.1', strictPort: true, fs: {deny: ['**/.git/**', '**/.env*', '**/*.{crt,pem}', '**/public/**', '**/qa/**', '**/.cache/**', '**/.asset-cache/**']}},
  build: {sourcemap: false},
  plugins: [{
    name: 'reviewed-runtime-assets',
    configResolved(config) { command = config.command; },
    async buildStart() {
      if (command !== 'build') return;
      const files = await runtimeAssets(root);
      let count = 0;
      for (const file of files) {
        let bytes;
        try { bytes = await readSafe(root, 'public/' + file.path); }
        catch (error) { if (error.code === 'ENOENT') continue; throw error; }
        if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) throw Error('Asset hash changed: ' + file.path);
        this.emitFile({type: 'asset', fileName: file.path, source: bytes});
        count++;
      }
      if (count !== files.length) this.warn('Source snapshot: ' + (files.length - count) + ' media files missing. This is not a playable player build.');
      const version = JSON.parse((await readSafe(root, 'package.json')).toString()).version;
      this.emitFile({type: 'asset', fileName: 'build-info.json', source: JSON.stringify({version, sourceSha256: sourceHash(await collectSource(root)), assetCount: count, assetsComplete: count === files.length}, null, 2)});
    },
    async configureServer(server) {
      const files = new Map((await runtimeAssets(root)).map(f => ['/' + f.path, f]));
      server.middlewares.use(async (req, res, next) => {
        let name;
        try { name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); } catch { res.statusCode = 400; res.end(); return; }
        if (!name.startsWith('/art/') && !name.startsWith('/audio/')) return next();
        const file = files.get(name);
        if (!file || !['GET', 'HEAD'].includes(req.method)) { res.statusCode = 404; res.end(); return; }
        try {
          const bytes = await readSafe(root, 'public/' + file.path);
          if (sha256(bytes) !== file.sha256) throw Error('Changed asset');
          res.setHeader('Content-Type', name.endsWith('.png') ? 'image/png' : name.endsWith('.ogg') ? 'audio/ogg' : 'font/ttf');
          res.end(req.method === 'HEAD' ? undefined : bytes);
        } catch { res.statusCode = 404; res.end(); }
      });
    },
  }],
});
