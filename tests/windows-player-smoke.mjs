// SPDX-License-Identifier: GPL-3.0-only
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {mkdir,readFile,copyFile,mkdtemp} from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {setTimeout as delay} from 'node:timers/promises';
if(process.platform!=='win32')throw Error('This integration test requires Windows.');
const folder=path.resolve(process.argv[2]||'');
const meta=JSON.parse(await readFile(path.join(folder,'PLAYER-PACKAGE.json')));
const qa=path.resolve('qa/windows-launcher-check');await mkdir(qa,{recursive:true});
const system=process.env.SystemRoot||'C:\\Windows',probe=path.join(qa,'WindowsUiProbe.exe');
const compiler=spawnSync(path.join(system,'Microsoft.NET/Framework64/v4.0.30319/csc.exe'),['/nologo','/target:exe','/platform:x64','/debug-','/reference:System.Drawing.dll','/reference:System.Web.Extensions.dll','/out:'+probe,path.resolve('tests/windows-ui-probe.cs')],{encoding:'utf8',windowsHide:true});
assert.equal(compiler.status,0,compiler.stdout+compiler.stderr);
const children=new Set(),servers=new Set();
function ui(child,action='snapshot',output){const r=spawnSync(probe,[action,String(child.pid),...(output?[output]:[])],{encoding:'utf8',windowsHide:true,timeout:6000});assert.equal(r.status,0,r.stderr);return r.stdout?JSON.parse(r.stdout):{};}
function launch(port,from=folder){const child=spawn(path.join(from,'Pokemon Survivors.exe'),[],{cwd:qa,windowsHide:true,stdio:'ignore',env:{...process.env,PATH:path.join(system,'System32')+';'+system,PORT:String(port),POKEMON_NO_BROWSER:'1',NODE_OPTIONS:'--require missing-fixture-should-not-load.cjs',NODE_PATH:qa}});children.add(child);return child;}
async function waitUi(child,text){for(let i=0;i<60;i++){assert.equal(child.exitCode,null,'Launcher exited prematurely');const s=ui(child);if(s.texts?.some(t=>t.includes(text)))return s;await delay(150);}throw Error('Launcher status timed out: '+text);}
async function serving(port){try{return await (await fetch('http://127.0.0.1:'+port+'/__game_health',{signal:AbortSignal.timeout(700)})).json();}catch{return null;}}
async function gone(port){for(let i=0;i<30;i++){if(!await serving(port))return;await delay(100);}throw Error('Owned server remained running');}
async function fixture(handler){const s=http.createServer(handler);servers.add(s);await new Promise(r=>s.listen(0,'127.0.0.1',r));return s;}
async function freePort(){const s=await fixture((q,r)=>r.end());const p=s.address().port;await new Promise(r=>s.close(r));servers.delete(s);return p;}
const result={version:meta.version,tests:[]};
try {
 const port=await freePort(),first=launch(port);
 const state=await waitUi(first,'Your game is running locally');
 assert.equal((await serving(port)).version,meta.version);
 ui(first,'capture',path.join(qa,'launcher.png'));
 result.tests.push('Starts from a path with spaces, no Node on PATH, and ignores inherited NODE_OPTIONS');
 const second=launch(port);await waitUi(second,'The game is already running');
 ui(second,'close');await delay(300);assert.equal((await serving(port)).version,meta.version);
 result.tests.push('Closing a second launcher preserves the original server');
 ui(first,'close');await gone(port);
 result.tests.push('Closing the owning launcher stops its server');
 const crashPort=await freePort(),crash=launch(crashPort);await waitUi(crash,'Your game is running locally');
 crash.kill();await gone(crashPort);
 result.tests.push('Terminating the launcher also stops its child server through its Windows Job Object');
 const unrelated=await fixture((q,r)=>{r.setHeader('Content-Type','application/json');r.end('{"unrelated":true}');});
 const conflict=launch(unrelated.address().port);await waitUi(conflict,'The game could not start');
 assert.deepEqual(await serving(unrelated.address().port),{unrelated:true});ui(conflict,'close');
 result.tests.push('Occupied port does not stop an unrelated process');
 const old=await fixture((q,r)=>{r.setHeader('Content-Type','application/json');r.end('{"app":"pokemon-survivors-local","version":"0.0.0-fixture"}');});
 const mismatch=launch(old.address().port);await waitUi(mismatch,'Another game version is running');ui(mismatch,'close');
 assert.equal((await serving(old.address().port)).version,'0.0.0-fixture');
 result.tests.push('Another game version is reported and preserved');
 const missing=await mkdtemp(path.join(qa,'missing files '));await copyFile(path.join(folder,'Pokemon Survivors.exe'),path.join(missing,'Pokemon Survivors.exe'));
 const incomplete=launch(await freePort(),missing);await waitUi(incomplete,'Files are missing');ui(incomplete,'close');
 result.tests.push('Incomplete extraction shows a readable error');
 const invalid=launch('invalid');await waitUi(invalid,'The PORT setting must be');ui(invalid,'close');
 result.tests.push('Invalid port settings fail without starting a server');
 console.log(JSON.stringify(result,null,2));
} finally {
 for(const child of children){if(child.exitCode===null){try{ui(child,'close');}catch{}if(child.exitCode===null)child.kill();}}
 for(const server of servers)await new Promise(r=>server.close(r));
}
