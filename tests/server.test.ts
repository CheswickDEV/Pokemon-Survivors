import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,writeFile,rm,mkdir,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createGameServer,APP_ID} from '../server.mjs';
test('portable server serves offline assets, exposes identity, rejects writes, foreign hosts and hidden paths',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'survivors-server-'));
 await writeFile(path.join(dir,'index.html'),'<h1>Game</h1>');
 const server=createGameServer(dir);
 try{
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  const {port}=server.address() as {port:number},url='http://127.0.0.1:'+port;
  const response=await fetch(url);assert.equal(response.status,200);assert.match(await response.text(),/Game/);
  assert.match(response.headers.get('content-security-policy')!,/frame-ancestors 'none'/);
  assert.equal((await(await fetch(url+'/__game_health')).json()).app,APP_ID);
  assert.equal((await fetch(url,{method:'HEAD'})).status,200);
  assert.equal((await fetch(url,{method:'POST',body:'x'})).status,405);
  for(const p of ['/.git/config','/%2eenv','/%5c..%5cpackage.json','/%00','/missing.png'])assert.ok((await fetch(url+p)).status>=400);
  const status=await new Promise<number>((resolve,reject)=>{http.get(url,{headers:{Host:'attacker.example:'+port}},r=>{r.resume();resolve(r.statusCode!);}).on('error',reject);});
  assert.equal(status,403);
  for(const headers of [{Host:'127.0.0.1:1'},{Origin:'https://example.invalid'},{Origin:'null'},{'Sec-Fetch-Site':'cross-site'}]){
   const rejected=await new Promise<number>((resolve,reject)=>{http.get(url,{headers},r=>{r.resume();resolve(r.statusCode!);}).on('error',reject);});assert.equal(rejected,403);
  }
  assert.equal((await fetch(url,{headers:{Origin:url}})).status,200);
  assert.equal(response.headers.get('x-frame-options'),'DENY');
  const outside=path.join(dir,'outside'),publicRoot=path.join(dir,'public');
  await mkdir(outside);await mkdir(publicRoot);await writeFile(path.join(outside,'private.txt'),'private fixture');
  await symlink(outside,path.join(publicRoot,'escape'),process.platform==='win32'?'junction':'dir');
  const isolated=createGameServer(publicRoot);
  try{await new Promise<void>(r=>isolated.listen(0,'127.0.0.1',r));const address=isolated.address() as {port:number};assert.equal((await fetch('http://127.0.0.1:'+address.port+'/escape/private.txt')).status,404);}
  finally{await new Promise<void>(r=>isolated.close(()=>r()));}
 }finally{await new Promise<void>((r,j)=>server.close(e=>e?j(e):r()));assert.equal(path.dirname(path.resolve(dir)),path.resolve(tmpdir()));assert.ok(path.basename(dir).startsWith('survivors-server-'));await rm(dir,{recursive:true,force:true});}
});
