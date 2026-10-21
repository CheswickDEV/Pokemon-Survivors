import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun,type Effect,type AttackField} from '../src/engine.ts';
import {KANTO_LOCATIONS,KANTO_STORY} from '../src/kanto-world-catalog.ts';
import {KANTO_BUILDINGS,kantoRoad,kantoRoadDistance} from '../src/kanto-layout.ts';
import {buildingAccess} from '../src/interior-layout.ts';
import {updateStory} from '../src/story.ts';
import {approachStage} from './story-helpers.ts';
import {SPECIES,PASSIVES,ELEMENTS} from '../src/data.ts';
import {attackStats} from '../src/combat.ts';
import {choiceKey} from '../src/level-rewards.ts';
import {isShinyEncounter,SHINY_ODDS} from '../src/shiny.ts';
import {defaultProfile,validateProfile,validateState,envelope,decodeEnvelope} from '../src/save.ts';
import {recordProgress} from '../src/progress.ts';
import {focusAt,enemyScale} from '../src/combat-visuals.ts';
import {advanceBossPhase,attackBoss,bossPhase,BOSSES} from '../src/bosses.ts';
import {worldWalkable,forestPath,forestPathDistance} from '../src/world.ts';
import {drawWeaponEffect,drawWeaponField,drawWeaponNova} from '../src/weapon-art.ts';
import {fireWeapon} from '../src/weapon-system.ts';
import {POKEMON_MOTION} from '../src/pokemon-motion.ts';

test('smooth road contours agree with town streets, forest paths and building exclusions',()=>{
 for(const l of KANTO_LOCATIONS)for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
  const p={x:l.x+dx*137.7,y:l.y+dy*137.7},d=kantoRoadDistance(p);
  if(Math.abs(d)>.001)assert.equal(d<0,kantoRoad(p),l.id+':'+JSON.stringify(p));
  assert.equal(forestPathDistance(p.x,p.y)<0,forestPath(p.x,p.y));
 }
});

test('ordinary homes stay open; gym prerequisites gate entry, completed gyms remain accessible',()=>{
 const s=newRun(7,'story');
 for(const b of KANTO_BUILDINGS)if(b.kind!=='league'&&!(b.kind==='gym'&&b.name.startsWith('Arena')))assert.ok(buildingAccess(s,b).open,b.name);
 const gym=KANTO_BUILDINGS.find(b=>b.locationId==='pewter'&&b.kind==='gym')!;
 assert.equal(buildingAccess(s,gym).open,false);
 const q=KANTO_STORY.find(q=>q.id==='brock')??KANTO_STORY.find(q=>q.kind==='gym'&&q.locationId==='pewter')!;
 s.story.done=[...q.requires];assert.ok(buildingAccess(s,gym).open);
 s.story.done.push(q.id);assert.ok(buildingAccess(s,gym).open);
});
test('existing pursuers survive entering towns, while ambient spawns stop until leaving',()=>{
 const e=new Engine(newRun(7,'story',123)),town=KANTO_LOCATIONS.find(l=>l.id==='viridian')!;
 Object.assign(e.s.trainer,{x:town.x,y:town.y});
 const enemy=e.addEnemy(19,'wild',{x:town.x+90,y:town.y});
 for(let i=0;i<120;i++){e.spawn(1);updateStory(e,1);}
 assert.equal(e.s.enemies.length,1);assert.equal(e.s.enemies[0],enemy);assert.ok(enemy.hp>0);
 Object.assign(e.s.trainer,KANTO_LOCATIONS.find(l=>l.id==='route-1')!);e.spawn(1);assert.ok(e.s.enemies.length>1);
});
test('all 27 trials begin at the approached position and preserve existing wild enemies',()=>{
 for(const q of KANTO_STORY){
  const e=new Engine(newRun(1,'story',5)),s=e.s;
  s.story.done=KANTO_STORY.slice(0,KANTO_STORY.indexOf(q)).map(q=>q.id);
  s.story.unlocks=[...new Set(KANTO_STORY.filter(q=>s.story.done.includes(q.id)).flatMap(q=>q.rewardUnlocks))];
  approachStage(e,q);assert.ok(e.interact(),q.id);
  const before={x:s.trainer.x,y:s.trainer.y};
  const foe=e.addEnemy(19,'wild',{x:before.x+85,y:before.y+85});
  assert.ok(e.startStory(q.id),q.id);assert.deepEqual({x:s.trainer.x,y:s.trainer.y},before);
  assert.ok(s.enemies.includes(foe));
 }
});
test('empty interaction stays silent even during a trial and cannot clear a focus target',()=>{
 const e=new Engine(newRun(7,'normal')),notice=e.notice,message=e.s.message;
 e.s.focus=234;for(let i=0;i<50;i++)assert.equal(e.interact(),false);
 assert.equal(e.notice,notice);assert.equal(e.s.message,message);assert.equal(e.s.focus,234);assert.equal(e.s.screen,'play');
 const story=new Engine(newRun(7,'story'));story.s.story.active='oak-parcel';
 assert.equal(story.interact(),false);assert.equal(story.notice,null);
});
test('level rewards vary across all slots and rerolls, remain useful, reproducible and capacity limited',()=>{
 const a=new Engine(newRun(1,'normal',557)),b=new Engine(newRun(1,'normal',557));
 const keys=new Set<string>(),offers=new Set<string>();let rankOffers=0,repeats=0,previous:string[]=[];
 for(let i=0;i<250;i++){
  const cards=a.choices();assert.deepEqual(cards,b.choices());const k=cards.map(choiceKey);
  assert.equal(new Set(k).size,3);k.forEach(key=>keys.add(key));offers.add(k.join('|'));
  rankOffers+=cards.some(c=>c.kind==='rank')?1:0;repeats+=k.filter(v=>previous.includes(v)).length;previous=k;
 }
 assert.ok(keys.size>=13);assert.ok(offers.size>160);assert.ok(rankOffers>25&&rankOffers<200);assert.ok(repeats<250);
 a.s.passives=Object.fromEntries(PASSIVES.slice(0,6).map(p=>[p.id,4]));
 for(let i=0;i<30;i++)for(const c of a.choices())if(c.kind==='passive')assert.ok(c.id! in a.s.passives);
 a.s.screen='level';a.s.choices=a.choices();const state=decodeEnvelope(envelope(a.s,1));
 assert.deepEqual(new Engine(state).choices(),a.choices());
});
test('new equipment changes real power, timing, projectiles, XP, dash and endurance',()=>{
 const e=new Engine(newRun(16,'normal',123)),s=e.s,p=s.party[0],base=attackStats(s,p);
 s.passives={power:3,duration:2,velocity:2,dash:2,study:2,endurance:2};
 const boosted=attackStats(s,p);
 assert.ok(boosted.power>base.power);assert.ok(boosted.duration>base.duration);assert.ok(boosted.speed>base.speed);
 e.step(1/30,{x:0,y:0,dash:true});assert.ok(s.trainer.dashReady-s.time<4);
 s.pickups.push({uid:s.nextId++,x:s.trainer.x,y:s.trainer.y,kind:'xp',value:10});e.collect(0);assert.equal(s.xp,11);
 const plain=new Engine(newRun(16,'normal',123));for(const runner of [e,plain]){runner.s.trainer.invincibleUntil=0;runner.s.trainer.dashUntil=0;runner.hazard('circle',runner.s.trainer,0,30,0,0,10);runner.hazards();}
 assert.ok(p.stamina>plain.s.party[0].stamina);
});
test('rare shiny identities are stable, sparse and independent of combat RNG',()=>{
 assert.equal(SHINY_ODDS,65536);let count=0;
 for(let i=0;i<400000;i++)if(isShinyEncounter(738,'wild:'+i+':16'))count++;
 assert.ok(count>=1&&count<=17,'observed '+count+' in 400000 identities');
 const e=new Engine(newRun(7,'normal',73)),before=e.s.rng;
 assert.equal(isShinyEncounter(73,'encounter:fixed'),isShinyEncounter(73,'encounter:fixed'));assert.equal(e.s.rng,before);
 let seed=1;while(!isShinyEncounter(seed,'encounter:test')&&seed<1000000)seed++;
 assert.ok(seed<1000000);const rare=new Engine(newRun(7,'normal',seed)),enc=rare.addEncounter(16,'test');
 assert.equal(enc.shiny,true);assert.equal(rare.s.enemies.at(-1)?.shiny,true);
 assert.equal(decodeEnvelope(envelope(rare.s,2)).encounters[0].shiny,true);
});
test('wild shiny remains catchable, updates an existing species without losing training and survives evolution/backup',()=>{
 const e=new Engine(newRun(1,'normal',44)),s=e.s,p=s.party[0];p.ranks=[4];p.level=20;p.points=3;
 const foe=e.addEnemy(1,'wild');foe.shiny=true;e.hit(foe,100000,'normal');
 const en=s.encounters.find(c=>c.shiny)!;assert.ok(en.ready&&!en.claimed);
 s.screen='capture';s.pendingId=en.id;const balls=s.balls;assert.ok(e.capture());
 assert.equal(s.balls,balls-1);assert.equal(s.party.length,1);assert.equal(p.shiny,true);assert.equal(p.ranks[0],4);
 assert.ok(e.evolve(p.uid,2));assert.equal(p.shiny,true);assert.deepEqual(s.shinyCaught,[1,2]);
 const restored=decodeEnvelope(envelope(s,1));assert.equal(restored.party[0].shiny,true);
 const profile=defaultProfile();profile.caught=[...s.caught];recordProgress(profile,s);
 assert.deepEqual(validateProfile(profile).shinies,[1,2]);
 assert.throws(()=>validateState({...s,shinyCaught:[999]}));assert.throws(()=>validateProfile({...profile,shinies:[151]}));
 const legacy:any=structuredClone(s);delete legacy.recentChoices;delete legacy.shinyCaught;legacy.party[0].shiny=false;
 assert.deepEqual(validateState(legacy).shinyCaught,[]);
});
test('ordinary mobs can be focused across their visible sprite; dead targets clear and bosses are larger',()=>{
 const e=new Engine(newRun(7,'normal')),foe=e.addEnemy(16,'wild');Object.assign(foe,{x:100,y:100});
 assert.equal(focusAt(e.s,{x:100,y:72}),foe.uid);assert.equal(focusAt(e.s,{x:200,y:72}),null);
 e.s.focus=foe.uid;e.hit(foe,10000,'normal');assert.equal(e.s.focus,null);assert.equal(focusAt(e.s,{x:100,y:72}),null);
 assert.ok(enemyScale({kind:'guardian',storyLeader:true})>1.5);assert.ok(enemyScale({kind:'boss'})>2);
});
test('boss phases summon once across saves, own their attack poses, and leave reachable escape points',()=>{
 for(const b of BOSSES)for(const fraction of [1,.6,.25]){
  const e=new Engine(newRun(7,'bossrush',6,'red',null,'master')),s=e.s,foe=e.addEnemy(b.species,'boss',{x:s.trainer.x+180,y:s.trainer.y});
  foe.hp=foe.maxHp*fraction;advanceBossPhase(e,foe);const count=s.enemies.length;
  advanceBossPhase(e,foe);assert.equal(s.enemies.length,count);assert.equal(count,fraction<.3?3:1);
  const saved=new Engine(validateState(s));advanceBossPhase(saved,saved.s.enemies[0]);assert.equal(saved.s.enemies.length,count);
  foe.attackPhase=1;attackBoss(e,foe);
  assert.ok(e.effects.some(f=>f.kind==='cast'&&f.owner===foe.uid));
  assert.equal(bossPhase(foe),fraction<.3?2:fraction<.65?1:0);
  assert.ok(s.hazards.length<12);
  let escapes=0;
  for(let a=0;a<Math.PI*2;a+=Math.PI/24)for(const r of [45,80,110,130]){
   const p={x:s.trainer.x+Math.cos(a)*r,y:s.trainer.y+Math.sin(a)*r};
   if(worldWalkable(s,p,12)&&!s.hazards.some(h=>e.inHazard(p,h)))escapes++;
  }
  assert.ok(escapes,b.species+' HP '+fraction);
 }
});
test('all 151 partner attacks use their native animation length',()=>{
 for(const id of Object.keys(SPECIES).map(Number)){
  const e=new Engine(newRun(id,'normal',37)),p=e.s.party[0],foe=e.addEnemy(143,'wild');
  Object.assign(foe,{x:p.x+60,y:p.y,hp:100000,maxHp:100000});fireWeapon(e,p,attackStats(e.s,p),foe);
  assert.equal(e.effects.find(f=>f.kind==='cast'&&f.owner===p.uid)?.max,POKEMON_MOTION[id].attack.durationMs/1000);
 }
});
test('every attack family renders finite bounded geometry with distinct materials in full and reduced mode',()=>{
 let commands=0;
 const finite=(v:unknown):void=>{if(typeof v==='number')assert.ok(Number.isFinite(v));else if(Array.isArray(v))v.forEach(finite);else if(v&&typeof v==='object')Object.values(v).forEach(finite);};
 const g:any=new Proxy({},{get:(_o,key)=> (...args:unknown[])=>{commands++;args.forEach(finite);return g;}});
 for(const full of [true,false])for(const type of ELEMENTS)for(const t of [.01,.25,.49]){
  const effect:Effect={id:1,kind:'weapon',x:0,y:0,r:100,color:0xffffff,life:.5-t,max:.5,type,angle:1,width:18,points:[{x:0,y:0},{x:100,y:50},{x:150,y:80}]};
  for(const pattern of ['beam','chain','drain','cone','slash','dash','charge'] as const){effect.pattern=pattern;if(pattern==='cone'||pattern==='slash')effect.width=1;else effect.width=18;drawWeaponEffect(g,effect,t,full);}
  drawWeaponNova(g,effect,t,full);
  const field:AttackField={uid:1,owner:1,x:0,y:0,kind:'orbit',pattern:'orbit',type,power:10,burn:false,slow:false,healing:0,healed:false,life:1-t,duration:1,radius:70,size:14,count:3,angle:1,speed:180,pierce:0,hitNext:{},triggered:false,strikes:0,arc:1,fromX:0,fromY:0,targetX:100,targetY:50};
  for(const kind of ['orbit','zone','mine','charge'] as const){field.kind=kind;drawWeaponField(g,field,t,full);}
 }
 assert.ok(commands>1000&&commands<150000);
});
