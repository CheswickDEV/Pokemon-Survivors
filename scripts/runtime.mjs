import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import path from 'node:path';
import {readSafe} from './release-policy.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
export function validateRuntimeConfig(config){
 if(!/^22\.\d+\.\d+$/.test(config.version)||!/^[a-f0-9]{64}$/.test(config.sha256))throw Error('Invalid runtime pin');
 const archive='node-v'+config.version+'-win-x64.zip',base='https://nodejs.org/dist/v'+config.version+'/';
 if(config.archive!==archive||config.url!==base+archive||config.checksums!==base+'SHASUMS256.txt')throw Error('Runtime must use the pinned official Node.js distribution');
}
async function download(url,maxBytes){
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(60000)});
 if(!response.ok||Number(response.headers.get('content-length'))>maxBytes)throw Error('Runtime download unavailable or too large');
 const chunks=[];let size=0;
 for await(const part of response.body){size+=part.length;if(size>maxBytes)throw Error('Runtime download size exceeded');chunks.push(part);}
 return Buffer.concat(chunks);
}
// Read only two exact ZIP entries after verifying the entire official archive.
function zipEntry(bytes,wanted){
 for(let offset=0;offset<bytes.length-46;offset++){
  if(bytes.readUInt32LE(offset)!==0x02014b50)continue;
  const size=bytes.readUInt32LE(offset+20),nameLength=bytes.readUInt16LE(offset+28),local=bytes.readUInt32LE(offset+42);
  const name=bytes.subarray(offset+46,offset+46+nameLength).toString();
  if(name!==wanted)continue;
  if(bytes.readUInt32LE(local)!==0x04034b50)throw Error('Invalid runtime ZIP header');
  const start=local+30+bytes.readUInt16LE(local+26)+bytes.readUInt16LE(local+28),data=bytes.subarray(start,start+size),method=bytes.readUInt16LE(offset+10);
  if(method===0)return data;if(method===8)return inflateRawSync(data);
  throw Error('Unsupported runtime ZIP compression');
 }
 throw Error('Runtime file missing: '+wanted);
}
export async function prepareRuntime(root){
 const config=JSON.parse(await readSafe(root,'release-config/node-runtime.json'));
 validateRuntimeConfig(config);
 const cache=path.join(root,'.cache/runtime'),archive=path.join(cache,config.archive);
 await mkdir(cache,{recursive:true});
 let bytes;try{bytes=await readFile(archive);}catch{}
 if(!bytes||hash(bytes)!==config.sha256){
  const sums=await download(config.checksums,1024*1024);
  const line=sums.toString().split('\n').find(l=>l.endsWith('  '+config.archive));
  if(!line||line.split(/\s+/)[0]!==config.sha256)throw Error('Runtime pin differs from official checksums');
  bytes=await download(config.url,80*1024*1024);
  if(hash(bytes)!==config.sha256)throw Error('Runtime checksum failed');
  await writeFile(archive,bytes);
 }
 const prefix='node-v'+config.version+'-win-x64/',exe=zipEntry(bytes,prefix+'node.exe'),license=zipEntry(bytes,prefix+'LICENSE');
 // Package the verified bytes directly; never overwrite a possibly running cached executable.
 const proof={...config,verifiedArchiveSha256:hash(bytes),executableSha256:hash(exe),licenseSha256:hash(license)};
 await writeFile(path.join(cache,'verification.json'),JSON.stringify(proof,null,2));
 return {exe,license,proof};
}
