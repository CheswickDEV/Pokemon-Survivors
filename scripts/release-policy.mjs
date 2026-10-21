import {readFile, lstat, readdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function safeRelative(name) {
  if (typeof name !== 'string' || !name || /[\\:\x00-\x1f]/.test(name) || name.startsWith('/') || name.split('/').some(p => !p || p === '.' || p === '..')) {
    throw Error('Unsafe relative path');
  }
  return name;
}
export async function readSafe(root, name) {
  safeRelative(name);
  let target = path.resolve(root);
  const parts = name.split('/');
  for (const [i, part] of parts.entries()) {
    target = path.join(target, part);
    const info = await lstat(target);
    if (info.isSymbolicLink() || (i < parts.length - 1 ? !info.isDirectory() : !info.isFile())) throw Error('Link or non-file excluded: ' + name);
  }
  return readFile(target);
}
export function scanPublicFile(name, bytes) {
  safeRelative(name);
  if (/(^|\/)(?:__pycache__|node_modules|qa|\.git|\.cache|\.asset-cache)(\/|$)|\.(?:pyc|pyo|log|pem|key|pfx|p12)$/i.test(name) || /(^|\/)\.env(?:\.|$)/.test(name)) throw Error('Private/cache file excluded: ' + name);
  // Inspect all exported bytes, including files without an extension. Never print a match.
  const text = bytes.toString('utf8');
  const patterns = [
    /[A-Z]:[\\/]+(?:Users|Program Files)[\\/]/i,
    /\/(?:Users|home)\/[A-Za-z0-9_.-]+\//,
    /(?:sk-(?:proj-)?[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/,
    /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bnpm_[A-Za-z0-9]{30,}\b/,
    /(?:_authToken|_auth|_password)\s*=\s*\S+/i,
    /https?:\/\/[^\s/:]+:[^\s/@]+@/i,
    /(?:api[_-]?key|client[_-]?secret|password|access[_-]?token)\s*[=:]\s*["'][A-Za-z0-9_+\/-]{12,}["']/i,
  ];
  if (patterns.some(pattern => pattern.test(text))) throw Error('Private path or credential-like content: ' + name);
}
export async function collectSource(root) {
  const manifest = JSON.parse(await readSafe(root, 'release-config/source-files.json'));
  if (!Array.isArray(manifest.files) || new Set(manifest.files).size !== manifest.files.length) throw Error('Invalid source manifest');
  const result = new Map();
  for (const name of [...manifest.files].sort()) {
    const bytes = await readSafe(root, name);
    scanPublicFile(name, bytes);
    result.set(name, bytes);
  }
  return result;
}
export function sourceHash(files) {
  return sha256(JSON.stringify([...files].map(([name, bytes]) => [name, sha256(bytes)]).sort(([a], [b]) => a.localeCompare(b, 'en'))));
}
export async function runtimeAssets(root) {
  const data = JSON.parse(await readSafe(root, 'release-config/runtime-assets.json'));
  if (!Array.isArray(data.files) || data.count !== data.files.length || new Set(data.files.map(f => f.path)).size !== data.files.length) throw Error('Invalid runtime asset list');
  for (const file of data.files) {
    safeRelative(file.path);
    if (!/^(art|audio)\/.+\.(png|ogg|ttf)$/.test(file.path) || !/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isSafeInteger(file.bytes) || file.bytes <= 0) throw Error('Invalid runtime asset entry');
  }
  return data.files;
}
export async function listFiles(root, prefix = '') {
  const result = [];
  for (const entry of await readdir(path.join(root, prefix), {withFileTypes: true})) {
    const name = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isSymbolicLink()) throw Error('Links excluded: ' + name);
    if (entry.isDirectory()) result.push(...await listFiles(root, name));
    else if (entry.isFile()) result.push(name);
    else throw Error('Non-file excluded: ' + name);
  }
  return result.sort();
}
