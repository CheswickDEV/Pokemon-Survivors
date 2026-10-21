import {createRequire} from 'node:module';
const require = createRequire(new URL('../tools/assets/package.json', import.meta.url));
export function loadSharp() {
  try { return require('sharp'); }
  catch (error) {
    throw new Error('Optionales Bildwerkzeug fehlt. Ein Terminal in tools/assets öffnen und dort npm ci ausführen.', {cause: error});
  }
}
