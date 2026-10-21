import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun,type Pickup,type Point} from '../src/engine.ts';
import {compactPickups,forestEliteLimit} from '../src/forest-balance.ts';
import {expeditionEvents,openTreasure} from '../src/expedition.ts';
import {mapObjects,mapProjection,contourPolygons,forestRoadPolygons} from '../src/map-geometry.ts';
import {decorations,forestTrees,forestPath,hash} from '../src/world.ts';
import {attackStats} from '../src/combat.ts';
import {fireWeapon} from '../src/weapon-system.ts';
import {validateState} from '../src/save.ts';
import {DIFFICULTIES} from '../src/difficulty.ts';
import {POIS} from '../src/data.ts';
import {forestSvg} from '../src/region-map.ts';
const inside=(p:Point,poly:Point[])=>{
 let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;
 }return yes;
};
test('pickup compaction preserves value and kind while leaving fresh distant XP where earned',()=>{
 const items:Pickup[]=Array.from({length:200},(_,i)=>({uid:i+1,x:10000+i*3,y:10000,kind:'xp',value:i+1}));
 items.push({uid:201,x:100,y:100,kind:'xp',value:9});
 items.push({uid:202,x:100,y:100,kind:'heal',value:10});
 const xp=items.filter(p=>p.kind==='xp').reduce((n,p)=>n+p.value,0);
 compactPickups(items);
 assert.equal(items.length,200);assert.equal(items.find(p=>p.uid===201)?.x,100);
 assert.equal(items.filter(p=>p.kind==='xp').reduce((n,p)=>n+p.value,0),xp);
 assert.equal(items.find(p=>p.kind==='heal')?.value,10);
 assert.ok(items.filter(p=>p.x>9000).every(p=>p.y===10000));
});
test('level choices weight active partners without guaranteeing a fixed card; chests retain active training',()=>{
 const e=new Engine(newRun(4,'normal',123)),s=e.s;
 s.party=Array.from({length:6},(_,i)=>({...s.party[0],uid:100+i,species:[4,7,1,16,19,25][i],ranks:[i?1:7],nextFire:[0]}));
 s.active=[100];s.nextId=200;
 const offers=Array.from({length:150},()=>e.choices());
 const active=offers.filter(cs=>cs.some(c=>c.kind==='rank'&&c.uid===100)).length;
 assert.ok(active>15&&active<140);
 const reserve=offers.flat().filter(c=>c.kind==='rank'&&c.uid!==100).length/5;assert.ok(active>reserve);
 s.world.treasures.push({id:'test',x:s.trainer.x,y:s.trainer.y,quality:1,opened:false,evolution:false});
 assert.equal(openTreasure(e),true);assert.equal(s.party[0].ranks[0],8);
 assert.ok(s.party.slice(1).every(p=>p.ranks[0]===1));
 // Once the active weapon is complete, reserve training remains available.
 assert.ok(Array.from({length:25},()=>e.choices()).flat().some(c=>c.kind==='rank'));
 validateState(s);
});
test('forest elite pressure is shared and bounded, with stricter challenges on higher difficulties',()=>{
 for(const difficulty of DIFFICULTIES){
  const e=new Engine(newRun(1,'normal',123,'red',null,difficulty.id)),s=e.s;
  for(let wave=1;wave<=12;wave++){s.time=wave*90;expeditionEvents(e);}
  assert.equal(s.enemies.filter(f=>f.kind==='elite').length,forestEliteLimit(s));
  const first=s.enemies.find(f=>f.kind==='elite')!;first.hp=0;expeditionEvents(e);
  assert.equal(s.enemies.filter(f=>f.kind==='elite'&&f.hp>0).length,forestEliteLimit(s));
  // No burst of catch-up elites on subsequent frames.
  expeditionEvents(e);assert.equal(s.enemies.filter(f=>f.kind==='elite'&&f.hp>0).length,forestEliteLimit(s));
 }
 const e=new Engine(newRun(1,'normal'));e.s.time=600;e.events();
 assert.equal(e.s.enemies.filter(f=>f.kind==='elite').length,0,'only the expedition director issues roaming elites');
});
test('water starter clears a narrow group without becoming a cone or a radial attack',()=>{
 const e=new Engine(newRun(7,'normal')),p=e.s.party[0];e.random=()=>.99;
 const targets=[[100,0],[130,29],[160,-29],[120,85]].map(([x,y])=>{
  const foe=e.addEnemy(19,'wild');Object.assign(foe,{x:p.x+x,y:p.y+y,hp:1000,maxHp:1000});return foe;
 });
 const stats=attackStats(e.s,p);fireWeapon(e,p,stats,targets[0]);
 assert.equal(stats.move.pattern,'beam');assert.equal(stats.interval,1.4);
 assert.deepEqual(targets.map(f=>f.hp<1000),[true,true,true,false]);
});
test('map scenery mirrors actual forest generation at positive and negative chunk coordinates',()=>{
 for(const [cx,cy] of [[2,3],[-4,-6],[14,19]]){
  const s=newRun(1,'normal',789),bounds={x:cx*512,y:cy*512,width:512,height:512},list=mapObjects(s,bounds);
  for(const d of decorations(s.seed,cx,cy).filter(d=>d.kind!=='flower')){
   assert.ok(list.some(o=>o.x===d.x&&o.y===d.y&&o.kind===d.kind));
  }
  for(const tree of forestTrees().filter(t=>t.x>bounds.x&&t.x<bounds.x+512&&t.y>bounds.y&&t.y<bounds.y+512)){
   assert.ok(list.some(o=>o.kind==='tree'&&o.x===tree.x&&o.y===tree.y));
  }
  assert.deepEqual(mapObjects(s,bounds),list);
 }
 const list=mapObjects(newRun(1,'normal'),{x:0,y:0,width:3072,height:3072});
 assert.equal(list.filter(p=>p.kind==='cabin').length,1);
 assert.ok(list.some(p=>p.kind==='cabin'&&p.x===POIS[0].x&&p.y===POIS[0].y-40));
});
test('smooth map roads follow real forest paths across chunk seams, including negative coordinates',()=>{
 const bounds={x:-1500,y:-1200,width:4500,height:4200},paths=forestRoadPolygons(bounds);
 let tested=0;
 for(let i=0;i<1400;i++){
  const p={x:bounds.x+hash(32,i,71)*bounds.width,y:bounds.y+hash(71,i,32)*bounds.height};
  const expected=forestPath(p.x,p.y);
  // Exclude points within 1 world unit of the polygon approximation boundary.
  if([[-1,0],[1,0],[0,-1],[0,1]].some(([x,y])=>forestPath(p.x+x,p.y+y)!==expected))continue;
  assert.equal(paths.some(poly=>inside(p,poly)),expected,JSON.stringify(p));tested++;
 }
 assert.ok(tested>1200);
});
test('contours interpolate actual world boundaries and projection preserves coordinates and scale',()=>{
 const paths=contourPolygons({x:0,y:0,width:64,height:64},16,p=>p.x+p.y-63);
 for(const p of [{x:4,y:4},{x:30,y:30},{x:40,y:10}])assert.ok(paths.some(poly=>inside(p,poly)));
 for(const p of [{x:40,y:40},{x:60,y:50}])assert.ok(!paths.some(poly=>inside(p,poly)));
 const center={x:-500,y:1400};assert.deepEqual(mapProjection(center,1200,320,center),{x:160,y:160});
 assert.deepEqual(mapProjection(center,1200,320,{x:-200,y:1100}),{x:240,y:80});
});
test('forest atlas stays bounded far from home and uses generated roads instead of a decorative sketch',()=>{
 const s=newRun(1,'normal',123);Object.assign(s.trainer,{x:500000,y:-500000});
 const map=forestSvg(s);assert.ok(map.length<500000);assert.match(map,/tatsächliche Wege/);assert.ok(!map.includes('M0 240Q190'));
});
