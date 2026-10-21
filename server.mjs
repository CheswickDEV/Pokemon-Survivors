import http from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawn } from 'node:child_process';
export const APP_ID='pokemon-survivors-local';
const root = path.resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.ogg':'audio/ogg','.gif':'image/gif','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
export function createGameServer(directory=root,version='1.0.0-rc.6.5'){
 return http.createServer({requestTimeout:10000,headersTimeout:5000,keepAliveTimeout:5000,maxHeaderSize:8192},async (req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy','same-origin');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  const host=req.headers.host??'';
  if(host!=='127.0.0.1:'+req.socket.localPort){res.writeHead(403);res.end('Please use the displayed 127.0.0.1 address.');return;}
  if(req.headers.origin&&req.headers.origin!=='http://'+host||req.headers['sec-fetch-site']==='cross-site'){res.writeHead(403);res.end();return;}
  if(!['GET','HEAD'].includes(req.method??'')){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
  if(!req.url?.startsWith('/')||req.url.startsWith('//')){res.writeHead(400);res.end();return;}
  try {
   const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
   if(pathname==='/__game_health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(req.method==='HEAD'?undefined:JSON.stringify({app:APP_ID,version}));return;}
   if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(403);res.end();return;}
   const target=path.resolve(directory,'.'+(pathname==='/'?'/index.html':pathname));
   if(!target.startsWith(directory+path.sep)){res.writeHead(403);res.end();return;}
   const resolved=await realpath(target),base=await realpath(directory);
   if(!resolved.startsWith(base+path.sep)||!(await stat(resolved)).isFile())throw new Error();
   const data=await readFile(resolved);
   res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Content-Length':data.length});
   res.end(req.method==='HEAD'?undefined:data);
  }catch {res.writeHead(404);res.end('File not found. Please extract the complete ZIP.');}
 });
}
function openBrowser(url){
 const args=process.platform==='win32'?['rundll32',['url.dll,FileProtocolHandler',url]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];
 const child=spawn(args[0],args[1],{windowsHide:true,stdio:'ignore',detached:true});
 child.on('error',()=>console.log('Please open this address in your browser: '+url));child.unref();
}
export async function start(){
 const port=Number(process.env.PORT||4173);
 if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid local port.');
 await stat(path.join(root,'index.html')).catch(()=>{throw new Error('Game build missing: extract the entire ZIP first. For developers: npm run build.');});
 const info=JSON.parse(await readFile(path.join(root,'build-info.json'),'utf8'));
 if(info.assetsComplete!==true)throw new Error('This code-only build does not contain all game media. See docs/INSTALLATION.md and docs/ASSET-STATUS.md.');
 const url='http://127.0.0.1:'+port,server=createGameServer(root,info.version);
 server.on('error',async e=>{
  if(e.code==='EADDRINUSE'){
   try{
    const response=await fetch(url+'/__game_health',{signal:AbortSignal.timeout(1500),redirect:'error'});
    const data=await response.json();
    if(data.app===APP_ID){
     if(data.version!==info.version){console.error('Another game version is already running. Close the old launch window and start this version again.');process.exitCode=1;return;}
     console.log('The game is already running: '+url);if(process.argv.includes('--open')&&process.env.POKEMON_NO_BROWSER!=='1')openBrowser(url);return;
    }
   }catch{/* Never close or replace another program using the fixed save origin. */}
   console.error('Port '+port+' is in use. Close the previous game launch window and try again. No other process was stopped.');
  }else console.error('Local startup failed: '+e.message);
  process.exitCode=1;
 });
 server.listen(port,'127.0.0.1',()=>{
  console.log('Pokémon Survivors · '+url+'\nKeep this window open. Close it or press Ctrl+C to stop.\nSaves remain in your browser. Before switching browsers: Back up everything.');
  if(process.argv.includes('--open')&&process.env.POKEMON_NO_BROWSER!=='1')openBrowser(url);
 });
 process.on('SIGINT',()=>server.close());process.on('SIGTERM',()=>server.close());
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))start().catch(e=>{console.error(e.message);process.exitCode=1;});
