/** Reconstruct original FR/LG graphics from pinned source PNGs, palettes and tilemaps. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadSharp} from '../../../scripts/asset-tools.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const sharp=loadSharp();
const commit='ce6406d8c2eaf46d543c8a2606de0c3cb1951982';
const base=`https://raw.githubusercontent.com/pret/pokefirered/${commit}/`;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const sources=[],assets=[];
await fs.mkdir(path.join(root,'source'),{recursive:true});
async function get(p) {
 const local=path.join(root,'source',p.replaceAll('/','__'));
 let data;
 try{data=await fs.readFile(local);}catch{const r=await fetch(base+p);if(!r.ok)throw Error(`${r.status}: ${p}`);data=Buffer.from(await r.arrayBuffer());await fs.writeFile(local,data);}
 sources.push({path:p,url:base+p,sha256:digest(data)});
 return data;
}
async function save(file,pixels,width,height,extra={}) {
 const data=await sharp(pixels,{raw:{width,height,channels:4}}).png().toBuffer();
 await fs.writeFile(path.join(root,file),data);
 let x0=width,y0=height,x1=-1,y1=-1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(pixels[(y*width+x)*4+3]){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 assets.push({file,width,height,sha256:digest(data),visibleBounds:{x:x0,y:y0,width:x1-x0+1,height:y1-y0+1},...extra});
}
function palette(buf){return buf.toString().trim().split(/\r?\n/).slice(3).map(x=>x.split(/\s+/).map(Number));}
async function indexed(buf) {
 let off=8,pal=[];
 while(off<buf.length){const n=buf.readUInt32BE(off),tag=buf.toString('ascii',off+4,off+8);if(tag==='PLTE')for(let i=0;i<n;i+=3)pal.push([...buf.subarray(off+8+i,off+11+i)]);off+=n+12;}
 if(!pal.length)throw Error('Expected indexed PNG');
 const lookup=new Map(pal.map((rgb,i)=>[rgb.join(','),i]));
 const {data,info}=await sharp(buf).removeAlpha().raw().toBuffer({resolveWithObject:true});
 return {width:info.width,height:info.height,palette:pal,indices:Uint8Array.from({length:info.width*info.height},(_,i)=>lookup.get(`${data[i*3]},${data[i*3+1]},${data[i*3+2]}`)??0)};
}
const worker=await get('graphics/object_events/pics/people/worker_m.png');
const workerRaw=await sharp(worker).ensureAlpha().raw().toBuffer({resolveWithObject:true});
await save('worker-frlg-sheet.png',workerRaw.data,workerRaw.info.width,workerRaw.info.height,{source:'graphics/object_events/pics/people/worker_m.png',frameWidth:16,frameHeight:32,origin:{x:.5,y:1},scale:2});
const workerFirst=await sharp(worker).extract({left:0,top:0,width:16,height:32}).ensureAlpha().raw().toBuffer();
await save('worker-frlg.png',workerFirst,16,32,{source:'graphics/object_events/pics/people/worker_m.png',sourceRect:[0,0,16,32],origin:{x:.5,y:1},scale:2});
// Named graphics info verifies this is the original WorkerM object and its NPC_WHITE palette.
await get('src/data/object_events/object_event_graphics_info.h');
await get('src/data/object_events/object_event_pic_tables.h');

const region=await indexed(await get('graphics/region_map/region_map.png'));
const regionPal=palette(await get('graphics/region_map/region_map.pal'));
const regionMap=await get('graphics/region_map/kanto.bin');
const regionWidth=240,regionHeight=regionMap.length/2/30*8;
const regionOut=Buffer.alloc(regionWidth*regionHeight*4);
for(let at=0;at<regionMap.length;at+=2){
 const entry=regionMap.readUInt16LE(at),tile=entry&1023,h=!!(entry&1024),v=!!(entry&2048),p=(entry>>12)*16;
 const dx=(at/2%30)*8,dy=Math.floor(at/2/30)*8;
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){
  const sx=(tile%(region.width/8))*8+(h?7-x:x),sy=Math.floor(tile/(region.width/8))*8+(v?7-y:y);
  const c=region.indices[sy*region.width+sx],rgb=regionPal[p+c]??[0,0,0],i=((dy+y)*regionWidth+dx+x)*4;
  regionOut[i]=rgb[0];regionOut[i+1]=rgb[1];regionOut[i+2]=rgb[2];regionOut[i+3]=c===0?0:255;
 }
}
await save('kanto-region-map.png',regionOut,regionWidth,regionHeight,{source:'graphics/region_map/kanto.bin',tileSize:8,tilemapWidth:30,mapSectionToPixel:{xOffset:36,yOffset:36,step:8}});
const regionCrop=await sharp(regionOut,{raw:{width:regionWidth,height:regionHeight,channels:4}}).extract({left:24,top:16,width:192,height:144}).raw().toBuffer();
await save('kanto-region-map-cropped.png',regionCrop,192,144,{source:'graphics/region_map/kanto.bin',sourceRect:[24,16,192,144],mapSectionToPixel:{xOffset:12,yOffset:20,step:8}});
const sections=JSON.parse((await get('src/data/region_map/region_map_sections.json')).toString());
const sectionLayout=(await get('src/data/region_map/region_map_layout_kanto.h')).toString();
await get('src/region_map.c');
await fs.writeFile(path.join(root,'kanto-map-sections.json'),JSON.stringify(sections.map_sections.filter(s=>Number.isFinite(s.x)&&s.id!=='MAPSEC_NONE'),null,2)+'\n');
const points={};
for(const layer of ['MAP','DUNGEON']){
 const block=sectionLayout.match(new RegExp(`\\[LAYER_${layer}\\]\\s*=\\s*\\{([\\s\\S]*?)\\n    \\}`));
 if(!block)throw Error(`Missing region-map layer ${layer}`);
 const rows=[...block[1].matchAll(/\{([^{}]+)\}/g)].map(r=>r[1].split(',').map(x=>x.trim()));
 if(rows.length!==15||rows.some(r=>r.length!==22))throw Error('Unexpected original region-map dimensions');
 rows.forEach((row,y)=>row.forEach((id,x)=>{
  if(id==='MAPSEC_NONE')return;
  (points[id]??={layer,cells:[]}).cells.push({x,y,pixelX:36+x*8,pixelY:36+y*8,cropX:12+x*8,cropY:20+y*8});
 }));
}
for(const [id,p] of Object.entries(points)){
 const meanX=p.cells.reduce((s,c)=>s+c.x,0)/p.cells.length,meanY=p.cells.reduce((s,c)=>s+c.y,0)/p.cells.length;
 p.name=sections.map_sections.find(s=>s.id===id)?.name??id;
 p.center=p.cells.toSorted((a,b)=>Math.hypot(a.x-meanX,a.y-meanY)-Math.hypot(b.x-meanX,b.y-meanY))[0];
}
await fs.writeFile(path.join(root,'kanto-map-points.json'),JSON.stringify({fullImage:{file:'kanto-region-map.png',width:240,height:160},croppedImage:{file:'kanto-region-map-cropped.png',width:192,height:144},points},null,2)+'\n');

const sets={};
async function set(name,primary=false){
 const prefix=`data/tilesets/${primary?'primary':'secondary'}/${name}/`;
 const [png,meta]=await Promise.all([get(prefix+'tiles.png'),get(prefix+'metatiles.bin')]);
 const palettes={};
 await Promise.all((primary?[0,1,2,3,4,5,6]:[7,8,9,10,11,12]).map(async n=>palettes[n]=palette(await get(prefix+`palettes/${String(n).padStart(2,'0')}.pal`))));
 return sets[name]={...await indexed(png),meta,palettes,name};
}
await set('general',true);
await set('vermilion_city');
function renderMeta(id,secondary,upperOnly=false){
 const collection=id<640?sets.general:secondary,index=id<640?id:id-640,out=Buffer.alloc(16*16*4);
 for(let layer=upperOnly?1:0;layer<2;layer++)for(let q=0;q<4;q++){
  const at=index*16+(layer*4+q)*2;
  if(at+2>collection.meta.length)continue;
  const e=collection.meta.readUInt16LE(at),tile=e&1023,h=!!(e&1024),v=!!(e&2048),pn=e>>12;
  const set=tile<640?sets.general:secondary,ti=tile<640?tile:tile-640,pal=(pn<7?sets.general:secondary).palettes[pn];
  if(!pal)throw Error(`Missing palette ${pn}`);
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
   const sx=(ti%(set.width/8))*8+(h?7-x:x),sy=Math.floor(ti/(set.width/8))*8+(v?7-y:y),c=set.indices[sy*set.width+sx];
   if(c===0&&(layer===1||upperOnly))continue;
   const rgb=pal[c]??[255,0,255],i=((Math.floor(q/2)*8+y)*16+(q%2)*8+x)*4;
   out[i]=rgb[0];out[i+1]=rgb[1];out[i+2]=rgb[2];out[i+3]=255;
  }
 }
 return out;
}
// Exact original fence upper layers. The grass base is deliberately omitted.
for(const [name,id] of Object.entries({'horizontal':0xe7,'vertical':0xf4,'corner-nw':0xee,'corner-ne':0xef,'corner-sw':0xf6,'corner-se':0xf7})){
 await save(`fence-frlg-${name}.png`,renderMeta(id,sets.vermilion_city,true),16,16,{source:'data/tilesets/primary/general/metatiles.bin',metatile:id,layer:1,origin:{x:.5,y:1},scale:2});
}
{
 const candidates=[0xc6,0xc7,0xce,0xcf,0xd6,0xd7,0xde,0xdf,0xe6,0xe7,0xee,0xef,0xf6,0xf7],parts=[];
 for(const [i,id] of candidates.entries()){
  parts.push({input:await sharp(renderMeta(id,sets.vermilion_city,true),{raw:{width:16,height:16,channels:4}}).resize(64,64,{kernel:'nearest'}).png().toBuffer(),left:i%7*90,top:Math.floor(i/7)*100});
  parts.push({input:Buffer.from(`<svg width="90" height="24"><text x="30" y="14" fill="white" font-size="14">${id.toString(16)}</text></svg>`),left:i%7*90,top:Math.floor(i/7)*100+64});
 }
 await sharp({create:{width:630,height:200,channels:4,background:'#304e41'}}).composite(parts).png().toFile(path.join(root,'catalogue-fence-candidates.png'));
}
for(const set of Object.values(sets)){
 const count=set.meta.length/16,cols=16,cell=40,parts=[];
 for(let i=0;i<count;i++){
  const id=set.name==='general'?i:i+640;
  const png=await sharp(renderMeta(id,sets.vermilion_city),{raw:{width:16,height:16,channels:4}}).resize(32,32,{kernel:'nearest'}).png().toBuffer();
  const x=i%cols*cell,y=Math.floor(i/cols)*cell;
  parts.push({input:png,left:x,top:y},{input:Buffer.from(`<svg width="40" height="8"><text x="1" y="7" fill="white" font-size="8">${id.toString(16)}</text></svg>`),left:x,top:y+32});
 }
 await sharp({create:{width:cols*cell,height:Math.ceil(count/cols)*cell,channels:4,background:'#314746'}}).composite(parts).png().toFile(path.join(root,`catalogue-${set.name}.png`));
}
const vermilion=JSON.parse((await get('data/layouts/layouts.json')).toString()).layouts.find(l=>l.name==='VermilionCity_Layout');
const map=await get(vermilion.blockdata_filepath),out=Buffer.alloc(vermilion.width*vermilion.height*16*16*4);
for(let y=0;y<vermilion.height;y++)for(let x=0;x<vermilion.width;x++){
 const id=map.readUInt16LE((y*vermilion.width+x)*2)&1023,tile=renderMeta(id,sets.vermilion_city);
 for(let ty=0;ty<16;ty++)tile.copy(out,((y*16+ty)*vermilion.width*16+x*16)*4,ty*16*4,(ty+1)*16*4);
}
await save('vermilion-reference.png',out,vermilion.width*16,vermilion.height*16,{source:vermilion.blockdata_filepath});
const contact=[];
const displayed=['worker-frlg.png','fence-frlg-horizontal.png','fence-frlg-vertical.png','fence-frlg-corner-nw.png','fence-frlg-corner-ne.png','fence-frlg-corner-sw.png','fence-frlg-corner-se.png'];
for(const [i,file] of displayed.entries()){
 const a=assets.find(a=>a.file===file),cell=120,left=i*cell;
 contact.push({input:await sharp(path.join(root,file)).resize(a.width*3,a.height*3,{kernel:'nearest'}).png().toBuffer(),left:left+Math.floor((cell-a.width*3)/2),top:112-a.height*3});
 contact.push({input:Buffer.from(`<svg width="120" height="24"><text x="60" y="12" text-anchor="middle" fill="white" font-size="10">${file.replace('fence-frlg-','').replace('worker-frlg','worker').replace('.png','')}</text></svg>`),left,top:120});
}
contact.push({input:await sharp(path.join(root,'kanto-region-map-cropped.png')).resize(576,432,{kernel:'nearest'}).png().toBuffer(),left:132,top:152});
await sharp({create:{width:840,height:600,channels:4,background:'#304e41'}}).composite(contact).png().toFile(path.join(root,'contact-sheet.png'));
await fs.writeFile(path.join(root,'metadata.json'),JSON.stringify({version:1,edition:'Pokemon FireRed / LeafGreen',commit,assets,sources},null,2)+'\n');
console.log(JSON.stringify({assets:assets.map(a=>({file:a.file,width:a.width,height:a.height})),sources:sources.length}));
