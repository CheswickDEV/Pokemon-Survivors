import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
// These two suites inspect binary sprite/audio files excluded from the public source snapshot.
const mediaSuites=new Set(['pokemon-motion.test.ts','kanto-integration.test.ts']);
const tests=(await readdir('tests')).filter(f=>f.endsWith('.test.ts')&&!mediaSuites.has(f)).map(f=>'tests/'+f);
const result=spawnSync(process.execPath,['--experimental-strip-types','--test',...tests],{stdio:'inherit',windowsHide:true});
process.exitCode=result.status??1;
