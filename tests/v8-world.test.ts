import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {KANTO_LOCATIONS,KANTO_STORY} from '../src/kanto-world-catalog.ts';
import {KANTO_BUILDINGS,buildingDoor,buildingFootprint,townStreets,townPath,kantoRoad} from '../src/kanto-layout.ts';
import {kantoContains,kantoWalkable,WORLD_ROUTES,routeGates,segmentDistance,terrainDistance,kantoWater,kantoDeck} from '../src/kanto-terrain.ts';
import {buildingAccess,stageBuilding} from '../src/interior-layout.ts';
import {clearWorldPoint,obstacleDistance,kantoLocationAt} from '../src/world.ts';
import {SimulationClock} from '../src/simulation-clock.ts';
const all=[...new Set(KANTO_STORY.flatMap(q=>q.rewardUnlocks))];
test('all 58 doors join connected streets with no centreline through a building foundation',()=>{
 const e=new Engine(newRun(7,'story',18));e.s.story.unlocks=all;
 for(const l of KANTO_LOCATIONS.filter(l=>l.safe||KANTO_BUILDINGS.some(b=>b.locationId===l.id))){
  const streets=townStreets(l),buildings=KANTO_BUILDINGS.filter(b=>b.locationId===l.id),boxes=buildings.map(buildingFootprint);
  assert.ok(streets.length,l.id);
  for(const street of streets){
   const length=Math.hypot(street.b.x-street.a.x,street.b.y-street.a.y);
   for(let t=0;t<=1;t+=8/Math.max(length,8)){
    const p={x:street.a.x+(street.b.x-street.a.x)*t,y:street.a.y+(street.b.y-street.a.y)*t};
    assert.ok(boxes.every(box=>obstacleDistance(p,box)>=12),l.id+' foundation '+JSON.stringify(p));
    assert.ok(clearWorldPoint(e.s,p,12),l.id+' road outside world '+JSON.stringify(p));
    assert.ok(kantoRoad(p),l.id+' road not painted '+JSON.stringify(p));
   }
  }
  // Graph flood by shared endpoints, then check every porch belongs to the connected network.
  const points=streets.flatMap(e=>[e.a,e.b]),key=(p:{x:number;y:number})=>p.x.toFixed(3)+':'+p.y.toFixed(3),seen=new Set([key(l)]);
  for(let pass=0;pass<streets.length;pass++){let changed=false;for(const st of streets){if(seen.has(key(st.a))&&!seen.has(key(st.b))){seen.add(key(st.b));changed=true;}if(seen.has(key(st.b))&&!seen.has(key(st.a))){seen.add(key(st.a));changed=true;}}if(!changed)break;}
  for(const b of buildings){assert.ok(seen.has(key(buildingDoor(b))),b.id+' disconnected');assert.ok(townPath(buildingDoor(b),l),b.id+' unpainted porch');}
  assert.ok(points.every(p=>seen.has(key(p))),l.id+' disconnected street');
 }
});
test('all 57 route connections have open verges and continuous traversable centre lines outside towns',()=>{
 for(const route of WORLD_ROUTES){
  for(let i=1;i<route.points.length;i++){
   const a=route.points[i-1],b=route.points[i],len=Math.hypot(a.x-b.x,a.y-b.y),nx=(b.x-a.x)/len,ny=(b.y-a.y)/len;
   for(let d=0;d<=len;d+=32){
    const p={x:a.x+nx*d,y:a.y+ny*d};
    assert.ok(kantoWalkable(p,all,13),route.id+' centreline');
    for(const offset of [-route.width/2+28,route.width/2-28]){
     const q={x:p.x-ny*offset,y:p.y+nx*offset};assert.ok(kantoWalkable(q,all,12),route.id+' verge');assert.ok(terrainDistance(q)<0);
    }
   }
  }
 }
 assert.ok(WORLD_ROUTES.filter(e=>e.width>=380).length>=53);
});
test('every locked checkpoint covers the whole corridor, blocks walking and dash, and opens on its key',()=>{
 for(const required of new Set(WORLD_ROUTES.map(e=>e.requirement).filter(Boolean))){
  const keys=all.filter(k=>k!==required),gates=routeGates(keys);
  for(const gate of gates){
   for(let t=-gate.halfWidth+16;t<=gate.halfWidth-16;t+=16){
    const p={x:gate.x-gate.ny*t,y:gate.y+gate.nx*t};
    assert.equal(kantoWalkable(p,keys,12),false,gate.id+' gap '+t);
   }
   const e=new Engine(newRun(7,'story',1));e.s.story.unlocks=keys;
   Object.assign(e.s.trainer,{x:gate.x-gate.nx*45,y:gate.y-gate.ny*45});
   if(clearWorldPoint(e.s,e.s.trainer,12)){
    e.move(e.s.trainer,gate.nx*120,gate.ny*120);assert.ok(segmentDistance(e.s.trainer,gate.a,gate.b)>23,gate.id+' dash');
   }
   assert.ok(kantoWalkable(gate,all,12),gate.id+' stays blocked');
  }
 }
});
test('building access follows quest progress at every campaign stage, and closed doors explain why',()=>{
 const e=new Engine(newRun(7,'story',2));
 for(let i=0;i<=KANTO_STORY.length;i++){
  e.s.story.done=KANTO_STORY.slice(0,i).map(q=>q.id);
  for(const b of KANTO_BUILDINGS){
   const gated=b.kind==='league'||b.kind==='gym'&&b.name.startsWith('Arena');
   const expected=!gated||KANTO_STORY.some(q=>stageBuilding(q)?.id===b.id&&(e.s.story.done.includes(q.id)||q.requires.every(id=>e.s.story.done.includes(id))));
   assert.equal(buildingAccess(e.s,b).open,expected,b.id+' stage '+i);
  }
 }
 const home=KANTO_BUILDINGS[0];Object.assign(e.s.trainer,buildingDoor(home));assert.ok(e.interact());assert.equal(e.s.interior?.buildingId,home.id);assert.equal(e.notice?.kind,'place');
 const lab=KANTO_BUILDINGS.find(b=>b.locationId==='pallet'&&b.kind==='lab')!;
 e.s.rooms[lab.id]={pickups:[{uid:77,kind:'xp',value:3,x:0,y:0}],encounters:[]};
 assert.ok(buildingAccess(e.s,lab).open,'earned loot remains accessible');
});
test('background time advances without input, respects choices, and bounds suspended-device catchup',()=>{
 const c=new SimulationClock();let elapsed=0,steps=0;
 for(let i=0;i<20;i++)c.advance(.25,{x:0,y:0},(dt,input)=>{assert.equal(input.dash,false);assert.equal(input.x,0);elapsed+=dt;steps++;return true;},2);
 assert.ok(Math.abs(elapsed-5)<1/60);assert.ok(steps>=299);
 c.advance(60,{x:0,y:0},()=>{steps++;return true;},2);assert.ok(steps<=420);
 let choices=0;c.advance(1,{x:0,y:0},()=>{choices++;return false;},2);assert.equal(choices,1);
});
test('pedestrian coastal routes stay on land or a continuous deck, without requiring walking over water',()=>{
 for(const e of WORLD_ROUTES.filter(e=>e.requirement!=='surf'&&e.from!=='seafoam-islands')){
  for(let i=1;i<e.points.length;i++){
   const a=e.points[i-1],b=e.points[i],len=Math.hypot(b.x-a.x,b.y-a.y);
   for(let d=0;d<=len;d+=16){
    const p={x:a.x+(b.x-a.x)*d/len,y:a.y+(b.y-a.y)*d/len},loc=kantoLocationAt(p);
    assert.ok(!kantoWater(p,loc)||kantoDeck(p,loc),e.id+' water gap '+JSON.stringify(p));
   }
  }
 }
});
