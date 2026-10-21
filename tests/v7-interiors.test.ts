import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {KANTO_BUILDINGS,buildingDoor,serviceAt,townPath} from '../src/kanto-layout.ts';
import {KANTO_STORY,KANTO_LOCATIONS} from '../src/kanto-world-catalog.ts';
import {activeRoom,roomPlan,stageBuilding,roomContains} from '../src/interior-layout.ts';
import {leaveBuilding} from '../src/interiors.ts';
import {worldWalkable,clearWorldPoint,decorations,forestTrees,forestRoadClear,obstaclesAt,rareSite} from '../src/world.ts';
import {POIS} from '../src/data.ts';
import {decodeEnvelope,envelope,validateState} from '../src/save.ts';
import {SimulationClock} from '../src/simulation-clock.ts';
import {expeditionEvents} from '../src/expedition.ts';
import {updateStory} from '../src/story.ts';
import {visit,approachStage} from './story-helpers.ts';
import {worldMapMarkup} from '../src/world-ui.ts';

function unlockAll(e:Engine){
 e.s.story.done=KANTO_STORY.map(q=>q.id);
 e.s.story.unlocks=[...new Set(KANTO_STORY.flatMap(q=>q.rewardUnlocks))];
}
test('every authored room retains reachable NPCs, solid furniture and a working exit, including legacy closed-room saves',()=>{
 const e=new Engine(newRun(7,'story',14));unlockAll(e);
 for(const b of KANTO_BUILDINGS){
  Object.assign(e.s.trainer,buildingDoor(b));
  const quest=KANTO_STORY.find(q=>stageBuilding(q)?.id===b.id);e.s.story.done=quest?[...quest.requires]:[];
  assert.ok(e.enterBuilding(b.id),b.id);
  const room=activeRoom(e.s)!;assert.ok(room.npcs.length>0);assert.ok(clearWorldPoint(e.s,room.entrance,12),b.id+' arrival');
  // Flood the actual collision geometry from the entry, including furniture and NPC bodies.
  const step=16,queue=[{x:0,y:0}],seen=new Set(['0,0']);
  for(let i=0;i<queue.length;i++){
   const q=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const a=q.x+dx,c=q.y+dy,key=a+','+c,p={x:room.entrance.x+a*step,y:room.entrance.y+c*step};
    if(!seen.has(key)&&clearWorldPoint(e.s,p,13)){seen.add(key);queue.push({x:a,y:c});}
   }
  }
  for(const npc of room.npcs){
   assert.ok(clearWorldPoint(e.s,npc.approach,12),b.id+' '+npc.id+' approach');
   assert.ok(queue.some(p=>Math.hypot(room.entrance.x+p.x*step-npc.approach.x,room.entrance.y+p.y*step-npc.approach.y)<24),b.id+' '+npc.id+' route');
  }
  Object.assign(e.s.trainer,room.origin);e.move(e.s.trainer,2000,0);assert.ok(roomContains(e.s,e.s.trainer,11));
  Object.assign(e.s.trainer,room.exit);assert.ok(e.leaveBuilding(),b.id+' exit');
  assert.equal(e.s.interior,null);assert.ok(clearWorldPoint(e.s,e.s.trainer,12),b.id+' return');
  unlockAll(e);
  assert.deepEqual(decodeEnvelope(envelope(e.s,1)),e.s);
 }
});
test('healing and shopping require indoor NPCs; no ambient enemies appear in occupied buildings',()=>{
 const e=new Engine(newRun(7,'story',6)),center=serviceAt('viridian','heal')!,market=serviceAt('viridian','shop')!;
 e.s.trainer.hp=20;Object.assign(e.s.trainer,buildingDoor(center));e.interact();
 assert.ok(e.s.interior);assert.equal(e.s.trainer.hp,20);
 Object.assign(e.s.trainer,roomPlan(center).npcs.find(n=>n.role==='heal')!.approach);e.interact();assert.equal(e.s.trainer.hp,20);
 for(let i=0;i<180;i++){e.s.time+=10;e.spawn(10);expeditionEvents(e);}
 assert.equal(e.s.enemies.length,0);assert.equal(e.s.encounters.length,0);
 visit(e,market,'shop');e.interact();assert.equal(e.s.screen,'merchant');e.s.coins=200;e.s.trainer.hp=50;
 assert.ok(e.buy('heal'));assert.equal(e.s.trainer.hp,60);assert.ok(e.buy('heal'));assert.equal(e.s.trainer.hp,70);
 assert.equal(e.buy('heal'),false);assert.equal(e.s.coins,50);
 e.s.screen='play';leaveBuilding(e,true);e.s.screen='merchant';assert.equal(e.buy('ball'),false);
});
test('all eight gym challenges start only with the leader indoors; waves stay within arena walls',()=>{
 for(const q of KANTO_STORY.filter(q=>q.kind==='gym')){
  const e=new Engine(newRun(7,'story',4)),index=KANTO_STORY.indexOf(q);
  e.s.story.done=KANTO_STORY.slice(0,index).map(q=>q.id);e.s.story.unlocks=[...new Set(KANTO_STORY.slice(0,index).flatMap(q=>q.rewardUnlocks))];
  const b=stageBuilding(q)!;Object.assign(e.s.trainer,buildingDoor(b));e.s.screen='story';e.s.pendingId=q.id;
  assert.equal(e.startStory(q.id),false);e.s.screen='play';
  approachStage(e,q);assert.ok(e.interact());assert.ok(e.startStory(q.id));e.s.time+=2;updateStory(e,1);
  assert.ok(e.s.enemies.length>0);assert.ok(e.s.enemies.every(f=>worldWalkable(e.s,f,f.r)));
  const resumed=new Engine(decodeEnvelope(envelope(e.s,2)));assert.equal(resumed.s.story.active,q.id);assert.equal(resumed.s.interior?.buildingId,b.id);
  Object.assign(resumed.s.trainer,activeRoom(resumed.s)!.exit);assert.ok(resumed.leaveBuilding());assert.equal(resumed.s.story.active,null);
  assert.ok(!resumed.s.story.done.includes(q.id));
 }
});
test('outdoor enemies, room loot and catch rewards survive round trips, saves and independent rooms',()=>{
 let e=new Engine(newRun(7,'story',21));const a=serviceAt('viridian','heal')!,b=serviceAt('viridian','shop')!;
 const foe=e.addEnemy(19,'wild',{x:0,y:100}),outside=e.addEncounter(25,'qa:outside',{x:0,y:60});
 visit(e,a,'heal');e.s.pickups.push({uid:e.s.nextId++,kind:'xp',value:7,...activeRoom(e.s)!.origin});
 const inside=e.addEncounter(35,'qa:inside',activeRoom(e.s)!.origin);inside.ready=true;
 e=new Engine(decodeEnvelope(envelope(e.s,1)));assert.ok(leaveBuilding(e,true));assert.equal(e.s.enemies[0].uid,foe.uid);assert.equal(e.s.encounters[0].id,outside.id);
 visit(e,b,'shop');assert.equal(e.s.pickups.length,0);assert.equal(e.s.encounters.length,0);leaveBuilding(e,true);
 visit(e,a,'heal');assert.equal(e.s.pickups[0].value,7);assert.equal(e.s.encounters[0].id,inside.id);
 Object.assign(e.s.trainer,e.s.encounters[0]);e.interact();assert.ok(e.capture());leaveBuilding(e,true);visit(e,a,'heal');assert.ok(e.s.encounters[0].claimed);assert.equal(e.s.balls,2);
 assert.deepEqual(decodeEnvelope(envelope(e.s,2)),e.s);
 const bad=structuredClone(e.s);bad.interior!.outside.enemies[0].hp=NaN;assert.throws(()=>validateState(bad));
});
test('v4 outdoor challenges and open market saves migrate to the appropriate room without losing progress',()=>{
 for(const screen of ['play','story','merchant'] as const){
  const raw:any=newRun(7,'story',8);raw.version=4;delete raw.interior;delete raw.rooms;delete raw.healing;
  raw.screen=screen;Object.assign(raw.trainer,KANTO_LOCATIONS.find(l=>l.id==='viridian')!);
  if(screen==='play'){raw.story.active='oak-parcel';raw.story.wave=1;raw.story.progress=5;}else if(screen==='story')raw.pendingId='oak-parcel';
  const s=validateState(raw);assert.equal(s.version,6);assert.equal(s.interior?.buildingId,serviceAt('viridian','shop')!.id);assert.ok(roomContains(s,s.trainer));
  if(screen==='play'){assert.equal(s.story.wave,1);assert.equal(s.story.progress,5);}
  if(screen==='merchant'){s.coins=20;assert.ok(new Engine(s).buy('ball'));}
  if(screen==='story')assert.ok(new Engine(s).startStory('oak-parcel'));
  assert.equal(raw.interior,undefined);
 }
});
test('dash taps survive render frames without a simulation step at high refresh rates, and buffer near cooldown',()=>{
 for(const hz of [60,90,120,144,240]){
  const clock=new SimulationClock(),e=new Engine(newRun(7,'story',91));
  // Choose the tap on a frame with no physics update whenever that rate permits it.
  const tap=hz===60?1:0;
  for(let f=0;f<Math.ceil(hz*.4);f++)clock.advance(1/hz,{x:0,y:1,dash:f===tap},(dt,input)=>{e.step(dt,input);return true;});
  assert.equal(e.soundEvents.filter(s=>s==='dash').length,1,'one tap at '+hz+'Hz');assert.ok(e.s.trainer.dashReady>4);
 }
 const e=new Engine(newRun(1,'story',1));e.s.trainer.dashReady=.1;
 e.step(1/60,{x:0,y:1,dash:true});for(let n=0;n<10;n++)e.step(1/60);
 assert.equal(e.soundEvents.filter(s=>s==='dash').length,1);
 const clock=new SimulationClock();clock.advance(1/240,{x:0,y:0,dash:true},()=>true);clock.reset();
 let dash=false;clock.advance(1/60,{x:0,y:0},(_dt,i)=>{dash=i.dash;return true;});assert.equal(dash,false,'pause cancels pending tap');
});
test('player reaches the compact trunk collision while enemies slide around a narrower circle',()=>{
 const e=new Engine(newRun(7,'endless',456)),tree=decorations(456,-8,13).find(t=>t.kind==='tree')!;
 const o=obstaclesAt(e.s,tree).find(o=>o.x===tree.x&&o.y===tree.y)!;
 for(const sign of [-1,1]){
  Object.assign(e.s.trainer,{x:o.x+sign*90,y:o.y+o.playerYOffset!});
  e.move(e.s.trainer,-sign*120,0);
  assert.ok(Math.abs(e.s.trainer.x-o.x)>=o.playerR!+11.9);
  assert.ok(Math.abs(e.s.trainer.x-o.x)<100);
 }
 assert.ok(o.playerR!>o.r&&o.playerR!<o.r*1.5);assert.equal(o.r,14);
});
test('procedural crowns and fixed forest trees leave paths open across seeds and negative chunks',()=>{
 for(const o of forestTrees())assert.ok(forestRoadClear(o.x,o.y,54));
 for(const seed of [1,456,794])for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++){
  for(const d of decorations(seed,x,y).filter(d=>d.kind==='tree'))assert.ok(forestRoadClear(d.x,d.y,48));
 }
 const pallet=KANTO_LOCATIONS.find(l=>l.id==='pallet')!;
 assert.equal(townPath({x:pallet.x-350,y:pallet.y},pallet),false,'no west route ending in trees');
 assert.equal(townPath({x:pallet.x,y:pallet.y-350},pallet),true,'north Route 1 stays connected');
});
test('landmark trees have collisions too, and distant rare groves avoid road crowns deterministically',()=>{
 const e=new Engine(newRun(7,'endless',42)),old=POIS[2];
 assert.ok(obstaclesAt(e.s,old).some(o=>o.x===old.x&&o.y===old.y-40&&o.playerR===30));
 let count=0;
 for(let x=-4;x<=4;x++)for(let y=-4;y<=4;y++){
  const site=rareSite(42,x,y);if(!site)continue;count++;
  assert.deepEqual(rareSite(42,x,y),site);assert.ok(forestRoadClear(site.x,site.y-35,65));
  assert.ok(obstaclesAt(e.s,site).some(o=>o.x===site.x&&o.y===site.y-35&&o.playerR===28));
 }
 assert.ok(count>10);
});
test('rare ten-HP drops have a global cooldown, and passive combat healing cannot refill the trainer instantly',()=>{
 const e=new Engine(newRun(7,'normal',318)),f=e.addEnemy(19,'wild',{x:500,y:500});let drops=0,last=-100;
 for(let n=0;n<10000;n++){
  e.s.time=n;e.defeat(f);const found=e.s.pickups.filter(p=>p.kind==='heal');
  if(found.length){drops++;assert.equal(found[0].value,10);assert.ok(n-last>=60);last=n;}
  e.s.pickups=[];e.effects=[];e.soundEvents=[];e.s.enemies=[];
 }
 assert.ok(drops>=5&&drops<40,'seeded 10k kills produce a rare, nonzero supply: '+drops);
 e.s.trainer.hp=30;e.s.healing.nextCombat=0;
 for(let i=0;i<100;i++)e.combatHeal(10);assert.equal(e.s.trainer.hp,33);
 e.s.time+=10;e.combatHeal(10);assert.equal(e.s.trainer.hp,36);
 const hp=e.s.trainer.hp;e.s.screen='level';e.skip();assert.equal(e.s.trainer.hp,hp);
});
test('map exposes all Kanto destinations, distinct badges and the current interior as a location card',()=>{
 const e=new Engine(newRun(7,'story',1));visit(e,serviceAt('viridian','heal')!,'heal');
 const html=worldMapMarkup(e.s,1,'pewter');
 assert.equal((html.match(/data-action="map-place"/g)??[]).length,KANTO_LOCATIONS.length);
 assert.match(html,/Marmoria City/);assert.match(html,/Arena · Rocko/);assert.match(html,/DEIN NÄCHSTES ZIEL/);assert.ok(!html.includes('undefined'));
});
