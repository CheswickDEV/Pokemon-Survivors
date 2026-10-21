import {approachStage,visit} from './story-helpers.ts';
import {activeRoom} from '../src/interior-layout.ts';
import {leaveBuilding} from '../src/interiors.ts';
import {serviceAt,buildingDoor} from '../src/kanto-layout.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {decorations,nearbySites,kantoWalkable,WORLD_ROUTES,reachableKanto} from '../src/world.ts';
import {KANTO_STORY,KANTO_LOCATIONS,KANTO_GYMS} from '../src/kanto-world-catalog.ts';
import {updateStory,availableStages,badgeCount} from '../src/story.ts';
import {expeditionEvents,openTreasure} from '../src/expedition.ts';
import {validateState,decodeEnvelope,envelope,SaveStore} from '../src/save.ts';
import {defaultProfile} from '../src/save.ts';
import {homeMarkup} from '../src/ui-v2.ts';

test('streamed terrain is deterministic across visits and negative coordinates, with independent seeds',()=>{
 const first=decorations(456,-8,13);for(let i=0;i<130;i++)decorations(200,i,i);
 assert.deepEqual(decorations(456,-8,13),first);assert.notDeepEqual(decorations(457,-8,13),first);
 assert.ok(first.every(d=>d.x>=-4096&&d.x<-3584&&d.y>=6656&&d.y<7168));
 assert.deepEqual(nearbySites(88,{x:-9000,y:8000}),nearbySites(88,{x:-9000,y:8000}));
});

test('forest movement, combat and saved positions work beyond every former map edge',()=>{
 for(const [x,y,dx,dy] of [[-5,550,-80,0],[4005,550,80,0],[450,-5,0,-80],[450,4005,0,80]]){
  const e=new Engine(newRun(7,'endless',81));Object.assign(e.s.trainer,{x,y});e.move(e.s.trainer,dx,dy);
  assert.ok(dx?Math.sign(e.s.trainer.x-x)===Math.sign(dx):Math.sign(e.s.trainer.y-y)===Math.sign(dy));
  const foe=e.addEnemy(19,'wild',{x:x+100,y});e.hit(foe,100,'water');
  assert.equal(e.s.kills,1);assert.deepEqual(decodeEnvelope(envelope(e.s,1)),e.s);
 }
});

test('a legacy position overlapping new terrain can walk out without allowing entry through trees',()=>{
 const e=new Engine(newRun(1,'normal',456)),tree=decorations(456,-8,13).find(d=>d.r>0)!;
 Object.assign(e.s.trainer,{x:tree.x,y:tree.y});e.move(e.s.trainer,3,0);assert.equal(e.s.trainer.x,tree.x+3);
 e.move(e.s.trainer,-2,0);assert.equal(e.s.trainer.x,tree.x+3);
});

test('all unlocked Kanto corridor polylines are physically walkable, including underground turns',()=>{
 const unlocks:string[]=[];
 for(const stage of KANTO_STORY){
  const reached=reachableKanto(unlocks),loc=KANTO_LOCATIONS.find(l=>l.id===stage.locationId)!;
  assert.ok(kantoWalkable(loc,unlocks,12),stage.id+' goal');
  for(const route of WORLD_ROUTES){
   if(route.requirement&&!unlocks.includes(route.requirement)||!reached.has(route.from)||!reached.has(route.to))continue;
   for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];for(let f=0;f<=1;f+=.1)assert.ok(kantoWalkable({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f},unlocks,12),stage.id+' '+route.id);}
  }
  unlocks.push(...stage.rewardUnlocks);
 }
 assert.equal(kantoWalkable(KANTO_LOCATIONS.find(l=>l.id==='saffron')!,[]),false);
 assert.equal(kantoWalkable(KANTO_LOCATIONS.find(l=>l.id==='indigo')!,[]),false);
 assert.equal(kantoWalkable(KANTO_LOCATIONS.find(l=>l.id==='cerulean-cave')!,[]),false);
});

test('27 story encounters require actual defeated waves, save during combat and award eight unique badges',()=>{
 let e=new Engine(newRun(1,'story',123));
 for(const q of KANTO_STORY){
  approachStage(e,q);
  assert.ok(availableStages(e.s).some(stage=>stage.id===q.id));
  e.s.screen='play';e.interact();assert.equal(e.s.pendingId,q.id);assert.equal(e.startStory(q.id),true);
  assert.equal(e.startStory(q.id),false);updateStory(e,1/60);assert.ok(!e.s.story.done.includes(q.id));
  const fought:number[]=[];
  for(let wave=0;wave<q.waves;wave++){
   e.s.time+=3;updateStory(e,1/60);let foes=e.s.enemies.filter(f=>f.storyId===q.id&&f.hp>0);assert.ok(foes.length,q.id+' wave '+wave);
   if(wave===0){e=new Engine(decodeEnvelope(envelope(e.s,1)));foes=e.s.enemies.filter(f=>f.storyId===q.id&&f.hp>0);}
   for(const foe of foes){fought.push(foe.species);e.hit(foe,100000,'normal');}
   e.s.enemies=e.s.enemies.filter(f=>f.hp>0);
  }
  if(q.kind==='gym'||q.kind==='league'||q.kind==='rival')assert.deepEqual(fought,q.team);
  e.s.time+=3;updateStory(e,q.duration+1);assert.ok(e.s.story.done.includes(q.id),q.id+' reward');
  const coins=e.s.coins;updateStory(e,1);assert.equal(e.s.coins,coins);validateState(e.s);
  if(q.id==='champion'){assert.equal(e.s.outcome,'win');assert.equal(e.s.screen,'result');e.s.outcome=null;e.s.screen='play';e.s.bossDead=false;}
 }
 assert.equal(badgeCount(e.s),8);assert.equal(e.s.story.done.length,27);assert.ok(KANTO_GYMS.every(g=>e.s.story.unlocks.includes(g.rewardUnlocks[0])));
});

test('story challenge aborts away from its location and cannot grant a locked or repeated stage',()=>{
 const e=new Engine(newRun(4,'story',5));assert.equal(e.startStory('champion'),false);
 approachStage(e,KANTO_STORY[0]);e.interact();assert.ok(e.startStory('oak-parcel'));assert.ok(e.s.story.active);Object.assign(e.s.trainer,activeRoom(e.s)!.exit);assert.ok(leaveBuilding(e));updateStory(e,1);
 assert.equal(e.s.story.active,null);assert.deepEqual(e.s.story.done,[]);
 const bad=structuredClone(e.s);bad.story.unlocks=['champion'];assert.throws(()=>validateState(bad));
});

test('elite chests pay out once through save and restore; distant ordinary enemies earn nothing',()=>{
 let e=new Engine(newRun(7,'endless',17));e.s.time=91;expeditionEvents(e);
 const elite=e.s.enemies.find(f=>f.kind==='elite')!;assert.ok(elite);e.hit(elite,100000,'water');
 assert.equal(e.s.world.treasures.length,1);const chest=e.s.world.treasures[0];Object.assign(e.s.trainer,{x:chest.x,y:chest.y});
 assert.equal(openTreasure(e),true);const coins=e.s.coins,rank=e.s.party[0].ranks[0];
 e=new Engine(decodeEnvelope(envelope(e.s,1)));e.s.screen='play';assert.equal(openTreasure(e),false);assert.equal(e.s.coins,coins);assert.equal(e.s.party[0].ranks[0],rank);
 e.addEnemy(10,'wild',{x:100000,y:-100000});const kills=e.s.kills;expeditionEvents(e);assert.equal(e.s.kills,kills);assert.ok(!e.s.enemies.some(f=>f.x===100000));
});

test('endless boss victory advances a cycle without a result screen; old v2 saves migrate intact',()=>{
 const e=new Engine(newRun(7,'endless',71));e.s.time=1200;e.events();const boss=e.s.enemies.find(f=>f.kind==='boss')!;
 e.hit(boss,100000,'water');e.step(1/60);assert.equal(e.s.world.cycle,1);assert.equal(e.s.outcome,null);assert.equal(e.s.bossSpawned,false);validateState(e.s);
 const old:any=newRun(1,'normal',12);old.version=2;delete old.world;delete old.story;
 const migrated=validateState(old);assert.equal(migrated.version,6);assert.equal(migrated.seed,12);assert.deepEqual(migrated.story.done,[]);assert.deepEqual(old.world,undefined);
});

test('story and forest saves retain independent alternating snapshots',async()=>{
 const store=new SaveStore(),data=new Map<string,unknown>();store.put=async(k,v)=>{data.set(k,v);};store.get=async<T>(k:string)=>data.get(k) as T;
 const forest=newRun(7,'endless',1),story=newRun(1,'story',2);await store.saveRun(forest);await store.saveRun(story);forest.time=17;await store.saveRun(forest);story.time=23;await store.saveRun(story);
 assert.equal((await store.loadRun('forest'))!.seed,1);assert.equal((await store.loadRun('story'))!.seed,2);
 assert.equal((await store.loadRun('story'))!.time,23);assert.equal((await store.loadRun('forest'))!.time,17);
 assert.ok(data.has('run-0')&&data.has('run-1')&&data.has('story-0')&&data.has('story-1'));
 const latest=data.get('story-0') as any;data.set('story-0',{...latest,checksum:'broken'});assert.equal((await store.loadRun('story'))!.time,0);
});

test('a completed or lost story remains resumable from camp; finished forest runs do not',()=>{
 for(const mode of ['story','normal'] as const)for(const outcome of ['win','lost'] as const){
  const saved=newRun(1,mode,1);saved.outcome=outcome;saved.screen='result';
  const html=homeMarkup({starter:1,trainer:'red',mode,profile:defaultProfile(),saved,ready:true,writable:true,assetsReady:true,error:''});
  assert.equal(html.includes('data-action="resume"'),mode==='story');
 }
});

test('Kanto markets sell supplies for earned coins while preserving ordinary ranger stock limits',()=>{
 const e=new Engine(newRun(7,'story',1));Object.assign(e.s.trainer,buildingDoor(serviceAt('viridian','shop')!));e.s.coins=100;
 assert.match(e.context(),/Pokémon-Markt/);assert.equal(e.interact(),true);assert.ok(e.s.interior);visit(e,serviceAt('viridian','shop')!,'shop');assert.ok(e.interact());assert.equal(e.s.screen,'merchant');
 for(let i=0;i<5;i++)assert.equal(e.buy('ball'),true);
 assert.equal(e.s.coins,0);assert.equal(e.s.balls,8);assert.equal(e.buy('ball'),false);validateState(e.s);
});
