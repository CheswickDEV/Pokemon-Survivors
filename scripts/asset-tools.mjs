import {createRequire} from 'node:module';
const require = createRequire(new URL('../tools/assets/package.json', import.meta.url));
export function loadSharp() {
  try { return require('sharp'); }
  catch (error) {
    throw new Error('Optional image tool missing. Open a terminal in tools/assets and run npm ci there.', {cause: error});
  }
}
