import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {prepareRuntime} from './runtime.mjs';
import {makeZip} from './zip.mjs';
import {collectSource, readSafe, scanPublicFile} from './release-policy.mjs';
import {verifyBuild} from './verify-build.mjs';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),out=path.join(root,'release');
const config=JSON.parse(await readFile(path.join(root,'release-config/status.json'),'utf8'));
const version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
if(!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version))throw Error('Invalid release version');
if(version!==config.version)throw Error('Package and release status version differ');
const publicBuild=process.argv.includes('--public'),localBuild=process.argv.includes('--local');
if(process.argv.length!==3||!['--source','--local','--public'].includes(process.argv[2]))throw Error('Choose exactly one: --source, --local or --public');
if(publicBuild&&(config.publicReleaseApproved!==true||config.assetRedistributionCleared!==true||config.manualAcceptanceComplete!==true)){
 throw Error('Öffentlicher Vollrelease gesperrt. Offene Freigaben stehen in release-config/status.json und docs/RELEASE-READINESS.md.');
}
if(!publicBuild&&!localBuild&&!process.argv.includes('--source'))throw Error('Choose --source, --local or --public');
const sha=data=>createHash('sha256').update(data).digest('hex');
const source=await collectSource(root);
const files=localBuild||publicBuild?await verifyBuild(root,{requireAssets:true}):new Map();
async function file(target,sourcePath=target,map=source){const bytes=await readSafe(root,sourcePath);scanPublicFile(target,bytes);map.set(target,bytes);}
source.set('ASSETS-NOT-INCLUDED.txt',Buffer.from('Dieser Quellcode-Snapshot enthaelt keine Pokemon-Grafiken und Rufe. Er ist kein spielbarer Download. Es erfolgt kein automatischer Mediendownload. Siehe docs/ASSET-STATUS.md.\\n'.replace('\\n','\n')));
// No machine paths, credentials, private saves, original media or caches enter this positive-list export.
for(const [name,bytes] of source)scanPublicFile(name,bytes);
await mkdir(out,{recursive:true});
const base='Pokemon-Survivors-'+version,sourceName=base+'-source.zip';
const wrap=(map,prefix)=>new Map([...map].map(([p,b])=>[prefix+'/'+p,b]));
const sourceZip=makeZip(wrap(source,base+'-source'));await writeFile(path.join(out,sourceName),sourceZip);
const artifacts=[{file:sourceName,bytes:sourceZip.length,sha256:sha(sourceZip),scope:'Own code under GPL-3.0-only, notices and metadata; Pokemon binary media excluded.'}];
if(localBuild||publicBuild){
 for(const name of ['server.mjs','Spiel starten.cmd','LICENSE','THIRD-PARTY-NOTICES.md','SECURITY.md'])await file(name,name,files);
 await file('BITTE ZUERST LESEN.txt','docs/PLAYER-QUICKSTART.txt',files);
 const runtime=await prepareRuntime(root);
 files.set('runtime/node.exe',runtime.exe);files.set('runtime/LICENSE',runtime.license);
 files.set('runtime/verification.json',Buffer.from(JSON.stringify(runtime.proof,null,2)));
 // Include the exact corresponding source alongside GPL binaries.
 files.set('source/'+sourceName,sourceZip);
 for(const [name,bytes] of source)if(name.startsWith('docs/asset-sources/'))files.set('notices/'+path.basename(name),bytes);
 const manifest=[...files].map(([file,data])=>({file,bytes:data.length,sha256:sha(data)}));
 files.set('FILES.json',Buffer.from(JSON.stringify(manifest,null,2)));
 const name=base+'-Windows-x64'+(localBuild?'-LOCAL-ONLY':'')+'.zip',zip=makeZip(wrap(files,base));
 await writeFile(path.join(out,name),zip);
 artifacts.push({file:name,bytes:zip.length,sha256:sha(zip),scope:localBuild?'Local test only; media redistribution unresolved.':'Approved public player package'});
}
await writeFile(path.join(out,'SHA256SUMS.txt'),artifacts.map(a=>a.sha256+'  '+a.file).join('\n')+'\n');
await writeFile(path.join(out,'manifest.json'),JSON.stringify({version,publicReleaseReady:publicBuild,artifacts},null,2));
console.log(JSON.stringify({version,artifacts},null,2));
