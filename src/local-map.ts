import {translateText,getLanguage} from './i18n.ts';
import {kantoSurface} from './kanto-surface.ts';
import {TRIAL_ARENA} from './trial-arena.ts';
import type {RunState} from './engine.ts';
import {activeRoom,buildingAccess,storyAnchor,roomPropFootprint,roomRug} from './interior-layout.ts';
import {KANTO_BUILDINGS,kantoRoad,kantoRoadDistance} from './kanto-layout.ts';
import {BUILDING_BOUNDS} from './kanto-colliders.ts';
import {kantoWalkable,terrainDistance,routeGates,kantoWater,kantoDeck} from './kanto-terrain.ts';
import {kantoLocationAt} from './world.ts';
import {mapObjects,mapProjection,contourPolygons,forestRoadPolygons,type MapObject} from './map-geometry.ts';
import {CRATES,SEALS} from './quests.ts';
import {nextStoryStage} from './story.ts';
import {POIS} from './data.ts';
const chunks=new Map<string,HTMLCanvasElement>();
const objectChunks=new Map<string,MapObject[]>();
let terrainKey='';
function objects(s:RunState,cx:number,cy:number){
 const key=cx+','+cy,cached=objectChunks.get(key);if(cached)return cached;
 const list=mapObjects(s,{x:cx*512,y:cy*512,width:512,height:512}).filter(p=>Math.floor(p.x/512)===cx&&Math.floor(p.y/512)===cy);
 if(objectChunks.size>64)objectChunks.delete(objectChunks.keys().next().value!);objectChunks.set(key,list);return list;
}
function forestRoads(c:CanvasRenderingContext2D,x:number,y:number){
 c.fillStyle='#f1dfb2';
 for(const poly of forestRoadPolygons({x,y,width:512,height:512})){
  c.beginPath();c.moveTo(poly[0].x,poly[0].y);for(const p of poly.slice(1))c.lineTo(p.x,p.y);c.closePath();c.fill();
 }
}
function terrainChunk(s:RunState,cx:number,cy:number){
 const key=cx+','+cy,cached=chunks.get(key);if(cached)return cached;
 // High-resolution vector contours, cached in world coordinates. No enlarged
 // ground tiles, procedural map noise or fictional trees/roads.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!;
 const bounds={x:cx*512,y:cy*512,width:512,height:512},story=s.mode==='story';
 c.translate(-bounds.x,-bounds.y);
 c.fillStyle='#c3d7ac';c.fillRect(bounds.x,bounds.y,512,512);
 const samples=new Map<string,{distance:number;rock:boolean;water:boolean;road:boolean;deck:boolean;locked:boolean}>();
 const at=(p:{x:number;y:number})=>{
  const key=p.x+','+p.y,cached=samples.get(key);if(cached)return cached;
  const surface=kantoSurface(p),distance=surface.edge,land=distance<=0;
  const water=land&&surface.water;
  const result={distance,rock:land&&surface.rock,water,road:land&&!water&&surface.road<0,deck:surface.deck,locked:land&&!kantoWalkable(p,s.story.unlocks)};
  samples.set(key,result);return result;
 };
 const layer=(color:string,sample:(p:{x:number;y:number})=>number)=>{
  c.beginPath();for(const poly of contourPolygons(bounds,32,sample)){c.moveTo(poly[0].x,poly[0].y);for(const p of poly.slice(1))c.lineTo(p.x,p.y);c.closePath();}
  c.fillStyle=color;c.fill();
 };
 if(story){
  layer('#c3d7ac',p=>at(p).distance);
  layer('#aaa98e',p=>at(p).rock?-1:1);
  layer('#76b9c2',p=>at(p).water?-1:1);
 }
 if(story)layer('#f1dfb2',p=>at(p).water?1:kantoSurface(p).road);
 else forestRoads(c,bounds.x,bounds.y);
 if(story){
  layer('#cda778',p=>at(p).deck?-1:1);
  layer('#405c5828',p=>at(p).locked?-1:1);
 }
 if(chunks.size>64)chunks.delete(chunks.keys().next().value!);chunks.set(key,canvas);return canvas;
}
export function drawLocalMap(canvas:HTMLCanvasElement,s:RunState){
 const c=canvas.getContext('2d')!,size=canvas.width,room=activeRoom(s),span=room?Math.max(room.width,room.height)+150:s.mode==='bossrush'?1500:1200,scale=size/span;
 const center=s.mode==='bossrush'?TRIAL_ARENA:room?.origin??s.trainer,to=(p:{x:number;y:number})=>mapProjection(center,span,size,p);
 const key=s.mode+':'+s.seed+':'+s.story.unlocks.join('|');if(key!==terrainKey){terrainKey=key;chunks.clear();objectChunks.clear();}
 c.clearRect(0,0,size,size);c.save();c.beginPath();c.roundRect(0,0,size,size,16);c.clip();
 c.fillStyle='#4b6b60';c.fillRect(0,0,size,size);c.lineJoin='round';c.lineCap='round';
 const staticKey=getLanguage()+key+':'+size+':'+(room?.building.id??'outside')+':'+s.story.done.join(',')+':'+s.completed.join(',')+':'+s.quests.camp.collected.join(',')+':'+s.quests.camp.started+':'+s.quests.tree.started+':'+s.enemies.filter(f=>f.questId==='tree'&&f.objective!==undefined&&f.hp>0).map(f=>f.objective).join(',');
 const anchor=room||s.mode==='bossrush'?center:{x:Math.round(center.x/128)*128,y:Math.round(center.y/128)*128};
 let base=staticBases.get(canvas);
 if(!base||base.key!==staticKey||base.x!==anchor.x||base.y!==anchor.y){
  const layer=document.createElement('canvas');layer.width=layer.height=size+128;
  drawStaticMap(layer.getContext('2d')!,s,layer.width,anchor,span+128/scale);
  base={key:staticKey,x:anchor.x,y:anchor.y,layer};staticBases.set(canvas,base);
 }
 c.drawImage(base.layer,(base.x-center.x)*scale-64,(base.y-center.y)*scale-64);
 // Visible foes use their real positions. Small dots leave landmarks readable.
 for(const foe of s.enemies)if(foe.hp>0){const p=to(foe);if(p.x<6||p.y<6||p.x>size-6||p.y>size-6)continue;
  c.beginPath();c.arc(p.x,p.y,foe.kind==='boss'?5:foe.kind==='elite'?3.5:1.7,0,Math.PI*2);c.fillStyle=foe.kind==='boss'?'#8d3653':foe.kind==='elite'?'#bd6e35':'#b45555';c.fill();if(foe.kind==='boss'){c.strokeStyle='#fff3d4';c.lineWidth=1.5;c.stroke();}
 }
 for(const e of s.encounters)if(!e.claimed){const p=to(e);marker(c,p.x,p.y,e.ready?'#f2ecd4':'#a171b4',e.ready?'○':'·');}
 if(!room)for(const t of s.world.treasures)if(!t.opened){const p=to(t);marker(c,p.x,p.y,'#b99345','◆');}
 const stage=s.mode==='story'&&!room?nextStoryStage(s):null,goal=stage&&storyAnchor(stage);
 if(goal){
  const q=to(goal),x=Math.max(18,Math.min(size-18,q.x)),y=Math.max(18,Math.min(size-18,q.y));
  c.strokeStyle='#fff8db';c.lineWidth=5;c.beginPath();c.arc(x,y,10,0,7);c.stroke();c.strokeStyle='#bc8638';c.lineWidth=2;c.stroke();
  if(x!==q.x||y!==q.y){c.save();c.translate(x,y);c.rotate(Math.atan2(q.y-y,q.x-x));c.fillStyle='#bc8638';c.beginPath();c.moveTo(6,0);c.lineTo(-4,-4);c.lineTo(-4,4);c.fill();c.restore();}
 }
 const me=to(s.trainer);c.fillStyle='#fff9df99';c.beginPath();c.arc(me.x,me.y,12,0,7);c.fill();
 c.save();c.translate(me.x,me.y);c.rotate(Math.atan2(s.trainer.dy,s.trainer.dx)+Math.PI/2);c.beginPath();c.moveTo(0,-9);c.lineTo(7,7);c.lineTo(0,4);c.lineTo(-7,7);c.closePath();c.fillStyle='#c15859';c.strokeStyle='#fff9e9';c.lineWidth=2;c.fill();c.stroke();c.restore();
 c.fillStyle='#f8f1d8e8';c.beginPath();c.roundRect(size-34,9,24,30,5);c.fill();c.fillStyle='#4d6c60';c.font='bold 13px Trebuchet MS';c.textAlign='center';c.fillText('N',size-22,24);c.beginPath();c.moveTo(size-25,33);c.lineTo(size-19,33);c.lineTo(size-22,28);c.fill();
 if(!room){c.fillStyle='#f8f1d8dd';c.fillRect(12,size-34,82,24);c.strokeStyle='#52725e';c.lineWidth=2;c.beginPath();c.moveTo(18,size-17);c.lineTo(18+256*scale,size-17);c.stroke();c.font='11px Trebuchet MS';c.textAlign='left';c.fillStyle='#486751';c.fillText(translateText('8 Schritte'),18,size-23);}
 c.restore();c.strokeStyle='#688b74';c.lineWidth=4;c.beginPath();c.roundRect(2,2,size-4,size-4,14);c.stroke();
}
const staticBases=new WeakMap<HTMLCanvasElement,{key:string;x:number;y:number;layer:HTMLCanvasElement}>();
function drawStaticMap(c:CanvasRenderingContext2D,s:RunState,size:number,center:{x:number;y:number},span:number){
 const room=activeRoom(s),scale=size/span,to=(p:{x:number;y:number})=>mapProjection(center,span,size,p);
 c.fillStyle='#4b6b60';c.fillRect(0,0,size,size);c.lineJoin='round';c.lineCap='round';
 if(s.mode==='bossrush'){c.fillStyle='#bfc5a7';c.beginPath();c.arc(size/2,size/2,TRIAL_ARENA.r*scale,0,Math.PI*2);c.fill();c.strokeStyle='#e9ce8e';c.lineWidth=4;c.stroke();c.beginPath();c.arc(size/2,size/2,270*scale,0,Math.PI*2);c.stroke();
 }else if(room){
  const w=room.width*scale,h=room.height*scale,x=(size-w)/2,y=(size-h)/2;
  c.fillStyle='#243f3e33';c.fillRect(x+5,y+5,w,h);c.fillStyle='#f0ead3';c.fillRect(x,y,w,h);
  c.strokeStyle='#d1d6bf66';c.lineWidth=.6;
  for(let col=x;col<x+w;col+=64*scale){c.beginPath();c.moveTo(col,y);c.lineTo(col,y+h);c.stroke();}
  for(let row=y;row<y+h;row+=64*scale){c.beginPath();c.moveTo(x,row);c.lineTo(x+w,row);c.stroke();}
  c.strokeStyle='#8eaa94';c.lineWidth=5;c.strokeRect(x,y,w,h);
  if(room.gym||room.building.kind==='league'){
   c.strokeStyle='#ceb98a';c.lineWidth=2;c.strokeRect(x+120*scale,y+125*scale,w-240*scale,h-290*scale);c.beginPath();c.arc(size/2,size/2,64*scale,0,7);c.stroke();
  }else{
   const rug=roomRug(room);if(rug){const p=to(rug);c.fillStyle=rug.color;c.fillRect(p.x,p.y,rug.w*scale,rug.h*scale);}
  }
  for(const obj of room.props){const foot=roomPropFootprint(obj),p=to(foot);c.fillStyle=obj.key==='plant'?'#709679':'#8b9c8a';c.fillRect(p.x-foot.w*scale/2,p.y-foot.h*scale/2,foot.w*scale,foot.h*scale);c.fillStyle='#c1cbb0';c.fillRect(p.x-foot.w*scale/2,p.y-foot.h*scale/2,foot.w*scale,1);}
  for(const npc of room.npcs){const p=to(npc);marker(c,p.x,p.y,npc.role==='heal'?'#bf747a':npc.role==='shop'?'#648fa9':'#b98e48',npc.role==='heal'?'C':npc.role==='shop'?'M':npc.role==='talk'?'·':'!');}
  const exit=to(room.exit);c.fillStyle='#b88370';c.fillRect(exit.x-13,exit.y-2,26,7);c.fillStyle='#fff1cb';c.beginPath();c.moveTo(exit.x-5,exit.y-6);c.lineTo(exit.x+5,exit.y-6);c.lineTo(exit.x,exit.y+1);c.fill();
 }else{
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  for(let cy=Math.floor((center.y-span/2)/512);cy<=Math.floor((center.y+span/2)/512);cy++)for(let cx=Math.floor((center.x-span/2)/512);cx<=Math.floor((center.x+span/2)/512);cx++){
   const p=to({x:cx*512,y:cy*512});c.drawImage(terrainChunk(s,cx,cy),p.x,p.y,512*scale,512*scale);
  }
  c.imageSmoothingEnabled=true;
  const scenery:MapObject[]=[];
  for(let cy=Math.floor((center.y-span/2-150)/512);cy<=Math.floor((center.y+span/2+150)/512);cy++)for(let cx=Math.floor((center.x-span/2-100)/512);cx<=Math.floor((center.x+span/2+100)/512);cx++)scenery.push(...objects(s,cx,cy));
  for(const o of scenery.sort((a,b)=>a.y-b.y)){const p=to(o);drawMapObject(c,o,p.x,p.y,scale);}
  if(s.mode==='story'){
   for(const b of KANTO_BUILDINGS){
    const art=BUILDING_BOUNDS[b.kind],worldScale=b.width/art.width;
    const p=to({x:b.x,y:b.y+(art.height/2-art.groundY)*worldScale}),w=b.width*scale,h=art.height*worldScale*scale;
    if(p.x<-w||p.x>size+w||p.y<-h||p.y>size+h)continue;
    c.fillStyle='#294f4144';c.fillRect(p.x-w/2+3,p.y-h/2+4,w,h);
    c.fillStyle='#f1e4bd';c.fillRect(p.x-w/2,p.y-h/2,w,h);
    c.fillStyle=b.kind==='center'||b.kind==='house-red'?'#bd777c':b.kind==='cave'?'#969785':'#7296ab';c.fillRect(p.x-w/2-1,p.y-h/2-1,w+2,h*.7);
    c.fillStyle='#ffffff55';c.fillRect(p.x-w/2+2,p.y-h/2+1,w-4,2);
    c.fillStyle='#486657';c.fillRect(p.x-2,p.y+h/2-5,4,5);
    if(b.service||b.kind==='gym')marker(c,p.x,p.y-2,b.service==='heal'?'#ab646b':b.service==='shop'?'#577f9b':'#9c8051',b.service==='heal'?'C':b.service==='shop'?'M':getLanguage()==='de'?'A':'G');
    if(!buildingAccess(s,b).open){c.fillStyle='#485e53';c.fillRect(p.x-6,p.y+h/2+1,12,4);}
   }
   for(const gate of routeGates(s.story.unlocks)){
    const a=to(gate.a),b=to(gate.b);c.strokeStyle='#8a6746';c.lineWidth=6;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
    c.strokeStyle='#f3d594';c.lineWidth=2;c.setLineDash([5,4]);c.stroke();c.setLineDash([]);const worker=to({x:gate.x-gate.nx*50,y:gate.y-gate.ny*50});c.fillStyle='#edb34f';c.beginPath();c.arc(worker.x,worker.y,2.6,0,7);c.fill();
   }
  }else{
   for(const p of POIS){const q=to(p);marker(c,q.x,q.y,s.completed.includes(p.id)?'#53816c':'#b1873c',s.completed.includes(p.id)?'✓':'!');}
   if(s.quests.camp.started&&!s.quests.camp.ready)CRATES.forEach((p,i)=>{if(!s.quests.camp.collected.includes(i)){const q=to(p);marker(c,q.x,q.y,'#a77a45','□');}});
   if(s.quests.tree.started&&!s.quests.tree.ready)SEALS.forEach((p,i)=>{if(s.enemies.some(f=>f.questId==='tree'&&f.objective===i&&f.hp>0)){const q=to(p);marker(c,q.x,q.y,'#966294','◇');}});
  }
 }
}
function drawMapObject(c:CanvasRenderingContext2D,o:MapObject,x:number,y:number,scale:number){
 const w=o.width*scale,h=o.height*scale;
 if(o.kind==='tree'||o.kind==='bush'){
  const cy=y-h*.45;
  c.fillStyle='#3d604e35';c.beginPath();c.ellipse(x+2,cy+3,w*.54,h*.42,0,0,Math.PI*2);c.fill();
  c.fillStyle='#8a7552';c.fillRect(x-w*.07,y-h*.25,w*.14,h*.22);
  c.fillStyle=o.kind==='tree'?'#507f60':'#799664';c.strokeStyle='#3f6b53';c.lineWidth=1;
  c.beginPath();c.ellipse(x,cy,w*.49,h*.42,0,0,Math.PI*2);c.fill();c.stroke();
  c.fillStyle='#8db079';c.beginPath();c.ellipse(x-w*.1,cy-h*.12,w*.32,h*.23,-.3,0,Math.PI*2);c.fill();
 }else if(o.kind==='rock'){
  c.fillStyle='#99a194';c.strokeStyle='#6b7e72';c.lineWidth=1;c.beginPath();c.moveTo(x-w*.46,y-h*.12);c.lineTo(x-w*.39,y-h*.65);c.lineTo(x-w*.04,y-h*.88);c.lineTo(x+w*.39,y-h*.65);c.lineTo(x+w*.48,y-h*.12);c.closePath();c.fill();c.stroke();
 }else if(o.kind==='cabin'){
  c.fillStyle='#efe3bd';c.strokeStyle='#8b7656';c.lineWidth=1.5;c.fillRect(x-w/2,y-h*.65,w,h*.65);c.strokeRect(x-w/2,y-h*.65,w,h*.65);
  c.fillStyle='#779ebc';c.beginPath();c.moveTo(x-w*.55,y-h*.6);c.lineTo(x,y-h);c.lineTo(x+w*.55,y-h*.6);c.closePath();c.fill();c.stroke();c.fillStyle='#546c58';c.fillRect(x-w*.08,y-h*.25,w*.16,h*.25);
 }else{
  c.strokeStyle='#b28aab';c.lineWidth=3;c.beginPath();c.ellipse(x,y,w/2,h/2,0,0,Math.PI*2);c.stroke();
 }
}
function marker(c:CanvasRenderingContext2D,x:number,y:number,color:string,label:string){
 c.fillStyle=color;c.strokeStyle='#fff5d9';c.lineWidth=1.5;c.beginPath();c.roundRect(x-7,y-7,14,14,4);c.fill();c.stroke();
 c.fillStyle='#fff7de';c.font='bold 10px Trebuchet MS';c.textAlign='center';c.textBaseline='middle';c.fillText(label,x,y+.5);c.textBaseline='alphabetic';
}
