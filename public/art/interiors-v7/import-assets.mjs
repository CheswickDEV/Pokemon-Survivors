/** Deterministic conversion of pinned pret/pokefirered asset data. No runtime dependency. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadSharp} from '../../../scripts/asset-tools.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const sharp=loadSharp();
const commit='ce6406d8c2eaf46d543c8a2606de0c3cb1951982';
const base=`https://raw.githubusercontent.com/pret/pokefirered/${commit}/`;
const sources=[];
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
async function get(p) {
 const local=path.join(root,'source',p.replaceAll('/','__'));
 let data;
 try { data=await fs.readFile(local); } catch { const r=await fetch(base+p);if(!r.ok)throw Error(`${r.status}: ${p}`);data=Buffer.from(await r.arrayBuffer());await fs.writeFile(local,data); }
 sources.push({path:p,url:base+p,sha256:digest(data)});
 return data;
}
const npcSources={nurse:'nurse',clerk:'clerk',professor:'prof_oak',civilian:'woman_1',mom:'mom',scientist:'scientist',brock:'brock',misty:'misty',surge:'lt_surge',erika:'erika',koga:'koga',sabrina:'sabrina',blaine:'blaine',giovanni:'giovanni',fuji:'mr_fuji',bill:'bill',rocket:'rocket_m',guide:'gym_guy'};
const assets=[];
for(const [key,source] of Object.entries(npcSources)){
 const input=await get(`graphics/object_events/pics/people/${source}.png`);
 const sprite=await sharp(input).extract({left:0,top:0,width:16,height:32}).png().toBuffer();
 const file=`npc-${key}.png`;await fs.writeFile(path.join(root,file),sprite);
 assets.push({id:`npc-${key}`,file,width:16,height:32,ground:{x:8,y:32},origin:{x:.5,y:1},recommendedScale:2.2,source:`graphics/object_events/pics/people/${source}.png`,sha256:digest(sprite)});
}
const sets={};
async function tileset(name,primary=false) {
 const prefix=`data/tilesets/${primary?'primary':'secondary'}/${name}/`;
 const [png,meta]=await Promise.all([get(prefix+'tiles.png'),get(prefix+'metatiles.bin')]);
 const palettes={};
 const palIds=primary?[0,1,2,3,4,5,6]:[7,8,9,10,11,12];
 await Promise.all(palIds.map(async i=>{
  const text=(await get(prefix+`palettes/${String(i).padStart(2,'0')}.pal`)).toString();
  palettes[i]=text.trim().split(/\r?\n/).slice(3).map(x=>x.split(/\s+/).map(Number));
 }));
 let offset=8,plte=[];
 while(offset<png.length){const n=png.readUInt32BE(offset),tag=png.toString('ascii',offset+4,offset+8);if(tag==='PLTE')for(let i=0;i<n;i+=3)plte.push([...png.subarray(offset+8+i,offset+11+i)]);offset+=n+12;}
 const lookup=new Map(plte.map((rgb,i)=>[rgb.join(','),i]));
 const {data,info}=await sharp(png).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const indices=new Uint8Array(info.width*info.height);
 for(let i=0;i<indices.length;i++)indices[i]=lookup.get(`${data[i*3]},${data[i*3+1]},${data[i*3+2]}`)??0;
 return sets[name]={name,indices,width:info.width,height:info.height,palettes,meta};
}
await tileset('building',true);
await Promise.all(['generic_building_1','lab','pokemon_center','mart','pewter_gym'].map(n=>tileset(n)));
function renderMeta(id,set,upperOnly=false) {
 const primary=id<640,collection=primary?sets.building:set,index=primary?id:id-640;
 const out=Buffer.alloc(16*16*4);
 for(let layer=upperOnly?1:0;layer<2;layer++)for(let quadrant=0;quadrant<4;quadrant++){
  const ptr=index*16+(layer*4+quadrant)*2;
  if(ptr+2>collection.meta.length)continue;
  const entry=collection.meta.readUInt16LE(ptr),tile=entry&1023,hflip=!!(entry&1024),vflip=!!(entry&2048),palette=entry>>12;
  const tileSet=tile<640?sets.building:set,tileIndex=tile<640?tile:tile-640;
  const pal=(palette<7?sets.building:set).palettes[palette]??sets.building.palettes[0];
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
   const sx=(tileIndex%16)*8+(hflip?7-x:x),sy=Math.floor(tileIndex/16)*8+(vflip?7-y:y);
   if(sy>=tileSet.height)continue;
   const color=tileSet.indices[sy*tileSet.width+sx];if(color===0&&layer===1)continue;
   const rgb=pal[color]??[255,0,255],dx=(quadrant%2)*8+x,dy=Math.floor(quadrant/2)*8+y,o=(dy*16+dx)*4;
   out[o]=rgb[0];out[o+1]=rgb[1];out[o+2]=rgb[2];out[o+3]=255;
  }
 }
 return out;
}
const layouts=JSON.parse((await get('data/layouts/layouts.json')).toString()).layouts;
const roomNames={'PalletTown_PlayersHouse_1F_Layout':'generic_building_1','PalletTown_PlayersHouse_2F_Layout':'generic_building_1','PalletTown_ProfessorOaksLab_Layout':'lab','PokemonCenter_1F_Layout':'pokemon_center','Mart_Layout':'mart','PewterCity_Gym_Layout':'pewter_gym'};
const rooms={};
const ROOM_PIXELS={};
for(const [name,setName] of Object.entries(roomNames)){
 const l=layouts.find(x=>x.name===name);if(!l)continue;
 const map=await get(l.blockdata_filepath),out=Buffer.alloc(l.width*16*l.height*16*4);
 const ids=[];
 for(let y=0;y<l.height;y++)for(let x=0;x<l.width;x++){
  const id=map.readUInt16LE((y*l.width+x)*2)&1023;ids.push(id);
  const tile=renderMeta(id,sets[setName]);
  for(let ty=0;ty<16;ty++)tile.copy(out,((y*16+ty)*l.width*16+x*16)*4,ty*16*4,(ty+1)*16*4);
 }
 const file=`room-reference-${name.replace('_Layout','').replaceAll('_','-').toLowerCase()}.png`;
 await sharp(out,{raw:{width:l.width*16,height:l.height*16,channels:4}}).png().toFile(path.join(root,file));
 ROOM_PIXELS[name]=out;
 rooms[name]={...l,setName,ids,file};
}
const props=[
 {id:'healing-station',room:'PokemonCenter_1F_Layout',rect:[4,1,7,3]},
 // This is an attached service bay, not a freestanding foreground prop.
 // Its rear wall, work floor, machine bases and counter need both metatile layers.
 {id:'center-reception',room:'PokemonCenter_1F_Layout',rect:[4,0,7,4],composite:true},
 {id:'market-shelf',room:'Mart_Layout',rect:[7,1,3,2]},
 {id:'market-counter',room:'Mart_Layout',rect:[0,3,3,2]},
 {id:'lab-console',room:'PalletTown_ProfessorOaksLab_Layout',rect:[1,3,2,3]},
 {id:'bookshelf',room:'PalletTown_ProfessorOaksLab_Layout',rect:[9,0,2,3]},
 {id:'table',room:'PalletTown_ProfessorOaksLab_Layout',rect:[8,4,3,2]},
 {id:'home-table',room:'PalletTown_PlayersHouse_1F_Layout',rect:[5,4,4,2]},
 {id:'bed',room:'PalletTown_PlayersHouse_2F_Layout',rect:[1,5,3,2]},
 {id:'plant',room:'PalletTown_ProfessorOaksLab_Layout',rect:[0,11,1,2]},
 {id:'gym-statue',room:'PewterCity_Gym_Layout',rect:[4,11,2,3]},
];
for(const p of props){
 const room=rooms[p.room],x=p.rect[0]*16,y=p.rect[1]*16,width=p.rect[2]*16,height=p.rect[3]*16;
 const out=Buffer.alloc(width*height*4);
 for(let ty=0;ty<p.rect[3];ty++)for(let tx=0;tx<p.rect[2];tx++){
  const id=room.ids[(p.rect[1]+ty)*room.width+p.rect[0]+tx],tile=renderMeta(id,sets[room.setName],!p.composite);
  // The top row above the Center counter contains the wall TV and wall trim.
  // Only the healing machine itself belongs to the freestanding prop.
  if(p.id==='healing-station'&&ty===0&&tx!==1&&tx!==2)continue;
  for(let py=0;py<16;py++)tile.copy(out,((ty*16+py)*width+tx*16)*4,py*16*4,(py+1)*16*4);
 }
 const file=`prop-${p.id}.png`;
 await sharp(out,{raw:{width,height,channels:4}}).png().toFile(path.join(root,file));
 const feet={
  'healing-station':[-55,-16,110,16],'market-counter':[-24,-14,48,14],
  'center-reception':[-56,-48,112,48],
  'market-shelf':[-24,-10,48,10],'lab-console':[-14,-14,28,14],
  bookshelf:[-16,-12,32,12],table:[-24,-14,48,14],'home-table':[-32,-24,64,24],
  bed:[-12,-28,24,28],plant:[-6,-8,12,8],'gym-statue':[-14,-16,16,16]
 }[p.id];
 assets.push({id:`prop-${p.id}`,file,width,height,ground:{x:width/2,y:height},origin:{x:.5,y:1},recommendedScale:2,footprint:{x:feet[0],y:feet[1],width:feet[2],height:feet[3]},solidBaseHeight:feet[3],sourceRoom:p.room,sourceRect:p.rect});
}
const tiles=[
 ['floor-home','generic_building_1',0x001],['floor-center','pokemon_center',0x281],
 ['floor-mart','mart',0x281],['floor-lab','lab',0x289],['floor-gym','pewter_gym',0x294],
 ['wall-home-top','generic_building_1',0x020],['wall-home-bottom','generic_building_1',0x028],
 ['wall-center-top','pokemon_center',0x284],['wall-center-bottom','pokemon_center',0x028],
 ['wall-mart-top','mart',0x285],['wall-mart-bottom','mart',0x28d],
 ['wall-lab-top','lab',0x020],['wall-lab-bottom','lab',0x028],
 ['wall-gym-top','pewter_gym',0x282],['wall-gym-bottom','pewter_gym',0x28a],
 ];
for(const [key,set,id] of tiles){
 const file=`tile-${key}.png`,data=renderMeta(id,sets[set]);
 await sharp(data,{raw:{width:16,height:16,channels:4}}).png().toFile(path.join(root,file));
 assets.push({id:`tile-${key}`,file,width:16,height:16,recommendedScale:2,sourceTileset:set,metatile:id});
}
const cols=6,cellW=180,cellH=170,contact=[];
for(const [index,a] of assets.entries()){
 const scale=a.id.startsWith('npc')?3:a.width>80?1:2;
 const png=await sharp(path.join(root,a.file)).resize(a.width*scale,a.height*scale,{kernel:'nearest'}).png().toBuffer();
 const left=(index%cols)*cellW+Math.max(0,Math.floor((cellW-a.width*scale)/2)),top=Math.floor(index/cols)*cellH+Math.max(18,cellH-a.height*scale-24);
 contact.push({input:png,left,top});
 contact.push({input:Buffer.from(`<svg width="${cellW}" height="${cellH}"><text x="90" y="14" fill="#e4f4ef" text-anchor="middle" font-family="Arial" font-size="12">${a.id}</text><text x="90" y="164" fill="#e4f4ef" text-anchor="middle" font-family="Arial" font-size="10">${a.width}x${a.height}</text></svg>`),left:(index%cols)*cellW,top:Math.floor(index/cols)*cellH});
}
await sharp({create:{width:cols*cellW,height:Math.ceil(assets.length/cols)*cellH,channels:4,background:'#294d47'}}).composite(contact).png().toFile(path.join(root,'contact-sheet.png'));
// Numbered tile catalogue for selecting exact whole furniture pieces.
for(const [name,set] of Object.entries(sets)){
 const count=set.meta.length/16,columns=16,cell=40,rows=Math.ceil(count/columns);
 const parts=[];
 for(let i=0;i<count;i++){
  const id=name==='building'?i:i+640;
  const png=await sharp(renderMeta(id,set),{raw:{width:16,height:16,channels:4}}).resize(32,32,{kernel:'nearest'}).png().toBuffer();
  const x=(i%columns)*cell,y=Math.floor(i/columns)*cell;
  parts.push({input:png,left:x,top:y});
  parts.push({input:Buffer.from(`<svg width="40" height="8"><text x="0" y="7" fill="white" font-size="8">${id.toString(16)}</text></svg>`),left:x,top:y+32});
 }
 await sharp({create:{width:columns*cell,height:rows*cell,channels:4,background:'#28433c'}}).composite(parts).png().toFile(path.join(root,`catalogue-${name}.png`));
}
await fs.writeFile(path.join(root,'room-references.json'),JSON.stringify(rooms,null,2)+'\n');
await fs.writeFile(path.join(root,'metadata.json'),JSON.stringify({version:1,commit,assets,sources},null,2)+'\n');
const checks=[];
for(const a of assets){
 const input=await fs.readFile(path.join(root,a.file)),m=await sharp(input).metadata();
 const {data}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let transparentPixels=0,visiblePixels=0;
 for(let i=3;i<data.length;i+=4)if(data[i]===0)transparentPixels++;else visiblePixels++;
 if(m.width!==a.width||m.height!==a.height||!visiblePixels||(!a.id.startsWith('tile')&&a.id!=='prop-center-reception'&&!transparentPixels))throw Error(`Validation failed: ${a.id}`);
 checks.push({id:a.id,width:m.width,height:m.height,transparentPixels,visiblePixels,sha256:digest(input)});
}
await fs.writeFile(path.join(root,'validation.json'),JSON.stringify({ok:true,count:checks.length,checks},null,2)+'\n');
console.log(JSON.stringify({npcs:Object.keys(npcSources).length,assets:assets.length,rooms:Object.keys(rooms),sets:Object.keys(sets)},null,2));
