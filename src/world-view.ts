import {sceneryChunk} from './kanto-scenery.ts';
import {drawWorksite} from './gate-art.ts';
import {drawWorldGround} from './world-ground.ts';
import {drawTrialArena} from './trial-arena.ts';
import {activeRoom,buildingAccess} from './interior-layout.ts';
import {drawInterior} from './interior-view.ts';
import {BUILDING_BOUNDS} from './kanto-colliders.ts';
import Phaser from 'phaser';
import type {Point,RunState} from './engine.ts';
import {POIS,OBSTACLES} from './data.ts';
import {decorations,hash,forestPath,kantoLocationAt,reachableKanto,WORLD_ROUTES,routeDistance,nearbySites,kantoContains,forestTrees} from './world.ts';
import {KANTO_LOCATIONS} from './kanto-world-catalog.ts';
import {KANTO_BUILDINGS,kantoRoad,buildingsAt} from './kanto-layout.ts';

import {routeGates,terrainDistance,kantoWater,kantoDeck} from './kanto-terrain.ts';

/** Only the visible neighbourhood owns textures. Coordinates and generated objects are stable on return. */
export class WorldView {
 chunks=new Map<string,{texture:string;objects:Phaser.GameObjects.GameObject[]}>();
 landmarks:Phaser.GameObjects.GameObject[]=[];key='';serial=0;
 constructor(public scene:Phaser.Scene){}
 clear(){for(const c of this.chunks.values()){c.objects.forEach(o=>o.destroy());this.scene.textures.remove(c.texture);}this.chunks.clear();this.landmarks.forEach(o=>o.destroy());this.landmarks=[];}
 label(x:number,y:number,text:string,color='#fff6d7'){
  return this.scene.add.text(x,y,text,{fontFamily:'Trebuchet MS',fontSize:'12px',fontStyle:'bold',color,backgroundColor:'#284c42e8',padding:{x:8,y:5},align:'center'}).setOrigin(.5).setDepth(y+120);
 }
 update(s:RunState|undefined,p:Point,width:number,height:number,canPrefetch=true){
  if(s?.mode==='bossrush'){if(this.key!=='trial-arena'){this.clear();this.key='trial-arena';this.scene.cameras.main.setBackgroundColor('#294744');this.landmarks.push(drawTrialArena(this.scene));}return;}
  const room=s&&activeRoom(s);
  if(room){const roomKey='room:'+room.building.id;if(this.key!==roomKey){this.clear();this.key=roomKey;this.scene.cameras.main.setBackgroundColor('#263d40');this.chunks.set('room',drawInterior(this.scene,room,'world-room-'+(++this.serial)));}return;}
  const story=s?.mode==='story',seed=s?.seed??429,unlocks=s?.story.unlocks??[];
  const key=(story?'story':'forest')+':'+seed+':'+(story?unlocks.join(',')+':'+s!.story.done.join(',')+':'+Object.entries(s!.rooms).map(([id,r])=>id+':'+r.pickups.length+':'+r.encounters.filter(e=>!e.claimed).length).join('|'):'');
  if(key!==this.key){this.clear();this.key=key;this.scene.cameras.main.setBackgroundColor('#86b979');this.createLandmarks(story,unlocks,s);}
  const active=new Set<string>(),pending:{id:string;x:number;y:number}[]=[],initial=this.chunks.size===0;
  for(let y=Math.floor((p.y-height/2-160)/512);y<=Math.floor((p.y+height/2+160)/512);y++)for(let x=Math.floor((p.x-width/2-120)/512);x<=Math.floor((p.x+width/2+120)/512);x++){
   const id=x+':'+y;active.add(id);if(!this.chunks.has(id))pending.push({id,x,y});
  }
  pending.sort((a,b)=>Math.hypot(a.x*512+256-p.x,a.y*512+256-p.y)-Math.hypot(b.x*512+256-p.x,b.y*512+256-p.y));
  const visible=(c:{x:number;y:number})=>Math.abs(c.x*512+256-p.x)<width/2+256&&Math.abs(c.y*512+256-p.y)<height/2+256;
  for(const c of initial?pending:pending.filter(c=>canPrefetch||visible(c)).slice(0,1))this.chunk(c.id,c.x,c.y,seed,!!story,unlocks);
  for(const [id,c] of this.chunks)if(!active.has(id)){c.objects.forEach(o=>o.destroy());this.scene.textures.remove(c.texture);this.chunks.delete(id);}
 }
 createLandmarks(story:boolean,unlocks:string[],s?:RunState){
  const scene=this.scene;
  if(!story){
   for(const o of forestTrees())this.landmarks.push(scene.add.image(o.x,o.y,'forest-tree').setOrigin(.5,.9).setScale(2.2).setDepth(o.y));
   for(const p of POIS){
    this.landmarks.push(this.label(p.x,p.y-150,p.name),scene.add.image(p.x-68,p.y+48,'forest-sign').setScale(2).setDepth(p.y+48));
    if(p.id==='camp')this.landmarks.push(scene.add.image(p.x,p.y-40,'forest-cabin').setOrigin(.5,1).setScale(2).setDepth(p.y-40));
    if(p.id==='tree')this.landmarks.push(scene.add.image(p.x,p.y-40,'forest-tree').setOrigin(.5,.9).setScale(3).setDepth(p.y-40));
    if(p.id==='garden')for(let i=0;i<16;i++){const a=i*Math.PI/8;this.landmarks.push(scene.add.image(p.x+Math.cos(a)*78,p.y+Math.sin(a)*78,'forest-flower',i%5).setScale(2).setDepth(p.y-110));}
   }return;
  }
  for(const b of KANTO_BUILDINGS){
   const art=BUILDING_BOUNDS[b.kind],image=scene.add.image(b.x,b.y,'kanto-'+b.kind).setOrigin(.5,art.groundY/art.height);
   image.setScale(b.width/image.width).setDepth(b.y);this.landmarks.push(image);
   const access=s&&buildingAccess(s,b),g=scene.add.graphics().setDepth(b.y+25);this.landmarks.push(g);
   if(access&&!access.open){
    g.lineStyle(5,0x72533e).lineBetween(b.x-13,b.y-15,b.x+13,b.y-3);
    g.lineStyle(2,0xe7c38a).lineBetween(b.x-13,b.y-16,b.x+13,b.y-4);
   }

   if(b.service){
    const sign=scene.add.image(b.x+b.width*.48+11,b.y+10,'forest-sign').setScale(1.8).setDepth(b.y+10);this.landmarks.push(sign);
   }
  }
  for(const gate of routeGates(unlocks))this.landmarks.push(...drawWorksite(scene,gate));

 }

 chunk(id:string,cx:number,cy:number,seed:number,story:boolean,unlocks:string[]){
  const scene=this.scene,ox=cx*512,oy=cy*512,canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;
  const objects:Phaser.GameObjects.GameObject[]=[],reached=reachableKanto(unlocks);
  const road=(wx:number,wy:number)=>story?kantoRoad({x:wx,y:wy}):forestPath(wx,wy);
  drawWorldGround(scene,c,ox,oy,seed,story);
  const texture='world-chunk-'+(++this.serial);scene.textures.addCanvas(texture,canvas);
  objects.push(scene.add.image(ox,oy,texture).setOrigin(0).setDepth(-100000000));
  if(!story){
   for(const d of decorations(seed,cx,cy))objects.push(scene.add.image(d.x,d.y,'forest-'+d.kind,d.kind==='flower'?Math.floor(hash(seed,d.x,d.y)*5):undefined).setOrigin(.5,d.kind==='flower'?.5:.9).setScale(d.scale).setDepth(d.y));
   for(const site of nearbySites(seed,{x:ox+256,y:oy+256}))if(Math.floor(site.x/512)===cx&&Math.floor(site.y/512)===cy){objects.push(scene.add.image(site.x,site.y-35,'forest-tree').setOrigin(.5,.9).setScale(2.8).setDepth(site.y-35),this.label(site.x,site.y-165,'Seltene Lichtung'));}
  }else{
   for(const o of sceneryChunk(seed,cx,cy))objects.push(scene.add.image(o.x,o.y,'forest-'+o.kind).setOrigin(.5,.9).setScale(o.kind==='rock'?2.5:1.8).setDepth(o.y));
   // Flower patches sit on lawns, clear of foundations and road entrances.
   for(let i=0;i<15;i++){
    const x=ox+hash(seed,cx,cy,i+800)*512,y=oy+hash(seed,cx,cy,i+900)*512,loc=kantoLocationAt({x,y});
    if(!loc.safe||!kantoContains({x,y},loc)||road(x,y)||buildingsAt(loc.id).some(b=>Math.abs(x-b.x)<b.width*.65&&y<b.y+30&&y>b.y-180))continue;
    objects.push(scene.add.image(x,y,'forest-flower',i%5).setScale(1.5).setDepth(y));
   }
  }
  this.chunks.set(id,{texture,objects});
 }
}
