import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {SPECIES} from '../src/data.ts';
import {partnerXpNeeded,grantPartnerXp} from '../src/partner-progress.ts';
import {envelope,decodeEnvelope,validateState,defaultProfile} from '../src/save.ts';
import {dexMarkup} from '../src/dex-ui.ts';
import {KANTO_LOCATIONS,KANTO_STORY} from '../src/kanto-world-catalog.ts';
import {KANTO_BUILDINGS,buildingDoor,buildingFootprint,serviceAt} from '../src/kanto-layout.ts';
import {clearWorldPoint,obstacleDistance,decorations} from '../src/world.ts';
import {blockedGate,areaAt} from '../src/world-notices.ts';
import {TRAINERS} from '../src/trainer-art.ts';

test('starter selection conceals all locked partners and unlocks only registered species',()=>{
 const p=defaultProfile(),html=dexMarkup(p,'starter');
 assert.equal((html.match(/locked-starter/g)??[]).length,148);
 assert.equal((html.match(/data-action="dex-starter"/g)??[]).length,3);
 assert.ok(!html.includes('data-action="dex-starter" data-id="25"'));
 p.caught.push(25);const next=dexMarkup(p,'starter');
 assert.equal((next.match(/locked-starter/g)??[]).length,147);
 assert.ok(next.includes('data-action="dex-starter" data-id="25"'));
 assert.ok(!html.includes('undefined'));assert.equal((html.match(/<article/g)??[]).length,151);
});
test('only active healthy partners gain battle XP, not reserves, resting partners or pickup-time switches',()=>{
 const e=new Engine(newRun(1,'normal',9)),p=e.s.party[0];
 const reserve={...p,uid:e.s.nextId++,species:4,ranks:[1],nextFire:[0],equipped:[0]};
 e.s.party.push(reserve);e.s.level=100;
 e.hit(e.addEnemy(19,'wild',{x:p.x+60,y:p.y}),10000,'normal');
 assert.equal(p.xp,1);assert.equal(reserve.xp,0);assert.equal(e.evolve(p.uid),false);
 e.setActive([reserve.uid]);e.s.pickups.forEach(x=>Object.assign(x,e.s.trainer));e.collect(0);
 assert.equal(reserve.xp,0);assert.equal(e.s.xp,1);
 reserve.recoveryUntil=100;e.awardPartnerXp(50);assert.equal(reserve.xp,0);
 reserve.recoveryUntil=0;e.awardPartnerXp(50);assert.ok(reserve.level>1);assert.equal(p.xp,1);
 e.s.level=1;p.level=8;assert.equal(e.evolve(p.uid),true);assert.equal(p.level,8);
});
test('personal XP preserves overflow and evolution progress through a save, migration and invalid imports',()=>{
 const s=newRun(1,'normal',8),p=s.party[0];grantPartnerXp(p,partnerXpNeeded(1)+partnerXpNeeded(2)+3);
 assert.equal(p.level,3);assert.equal(p.xp,3);assert.deepEqual(decodeEnvelope(envelope(s,2)).party[0],p);
 const legacy:any=structuredClone(s);legacy.version=3;legacy.level=12;delete legacy.party[0].level;delete legacy.party[0].xp;
 const migrated=validateState(legacy);assert.equal(migrated.party[0].level,12);assert.equal(migrated.party[0].xp,0);assert.equal(migrated.version,6);assert.equal(legacy.party[0].xp,undefined);
 const invalid=structuredClone(s);invalid.party[0].xp=NaN;assert.throws(()=>validateState(invalid),/Erfahrung/);
 invalid.party[0].xp=partnerXpNeeded(3);assert.throws(()=>validateState(invalid),/Erfahrung/);
});
test('all 72 evolutions use personal level even when trainer level differs',()=>{
 for(const sp of Object.values(SPECIES))for(const ev of sp.evolutions){
  const e=new Engine(newRun(sp.id,'normal',1)),p=e.s.party[0];e.s.level=99;p.ranks=[3];if(ev.stone)e.s.bag[ev.stone]=1;
  p.level=ev.level-1;assert.ok(e.evolutionReason(p.uid,ev.to)?.includes('Pokémon-Level'));assert.equal(e.evolve(p.uid,ev.to),false);
  p.level=ev.level;e.s.level=1;assert.equal(e.evolve(p.uid,ev.to),true,sp.name);assert.equal(p.level,ev.level);
 }
});
test('solid building bases stop a walking trainer, enemies and a dash from every side; doors remain usable',()=>{
 const e=new Engine(newRun(1,'story',10));e.s.story.done=KANTO_STORY.map(q=>q.id);e.s.story.unlocks=[...new Set(KANTO_STORY.flatMap(q=>[...q.rewardUnlocks]))];
 for(const building of KANTO_BUILDINGS){
  const box=buildingFootprint(building),r=12;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const p={x:box.x-dx*(box.w/2+r+8),y:box.y-dy*(box.h/2+r+8)};
   if(!clearWorldPoint(e.s,p,r))continue;
   e.move(p,dx*100,dy*100,r);assert.ok(obstacleDistance(p,box)>=r-.01,building.id);
  }
  const door=buildingDoor(building);assert.ok(clearWorldPoint(e.s,door,12),building.id+' entrance');
 }
 assert.equal(serviceAt('pallet','shop'),undefined);assert.equal(serviceAt('pallet','heal'),undefined);
});
test('pursuers route around circular trunks rather than stopping head-on',()=>{
 const e=new Engine(newRun(7,'endless',456)),tree=decorations(456,-8,13).find(t=>t.kind==='tree')!;
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,foe={x:tree.x-Math.cos(a)*75,y:tree.y-Math.sin(a)*75},target={x:tree.x+Math.cos(a)*75,y:tree.y+Math.sin(a)*75};
  for(let n=0;n<500;n++)e.follow(foe,target,.9,8,i+1);
  assert.ok(Math.hypot(foe.x-target.x,foe.y-target.y)<20,'direction '+i);
 }
});
test('explicit story spawns and encounters are moved out of building foundations',()=>{
 const e=new Engine(newRun(1,'story',12)),house=KANTO_BUILDINGS.find(b=>b.locationId==='pallet'&&b.kind==='house-red')!,box=buildingFootprint(house);
 for(const kind of ['wild','elite','boss'] as const){
  const foe=e.addEnemy(19,kind,box);assert.ok(clearWorldPoint(e.s,foe,foe.r),kind);
 }
 const encounter=e.addEncounter(25,'qa:building',box);assert.ok(clearWorldPoint(e.s,encounter,14));
});
test('pursuers get around a solid house foundation without walking through it',()=>{
 const e=new Engine(newRun(1,'story',9)),house=KANTO_BUILDINGS.find(b=>b.locationId==='pallet'&&b.kind==='house-red')!,box=buildingFootprint(house);
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2,foe={x:box.x-Math.cos(a)*(box.w/2+30),y:box.y-Math.sin(a)*(box.h/2+30)},target={x:box.x+Math.cos(a)*(box.w/2+30),y:box.y+Math.sin(a)*(box.h/2+30)};
  for(let n=0;n<1000;n++){e.follow(foe,target,.9,8,i+1);assert.ok(obstacleDistance(foe,box)>=7.99);}
  assert.ok(Math.hypot(foe.x-target.x,foe.y-target.y)<20,'direction '+i);
 }
});
test('gate collision provides concrete story guidance once, and opens after the required stage',()=>{
 const e=new Engine(newRun(1,'story',8)),edge=-1950-KANTO_LOCATIONS.find(l=>l.id==='viridian')!.radius;Object.assign(e.s.trainer,{x:0,y:edge+35});
 e.move(e.s.trainer,0,-15);assert.equal(e.notice?.kind,'blocked');assert.match(e.notice!.detail,/Eichs Paket/);
 const serial=e.notice!.serial;for(let i=0;i<100;i++)e.move(e.s.trainer,0,-5);assert.equal(e.notice?.serial,serial);
 assert.ok(e.s.trainer.y>edge);e.s.story.unlocks.push('pokedex');e.move(e.s.trainer,0,-80);assert.ok(e.s.trainer.y<edge);
 assert.equal(blockedGate(e.s,e.s.trainer),null);
 e.s.trainer.x=0;e.s.trainer.y=0;assert.equal(areaAt(e.s).name,'Alabastia');e.step(1/60);assert.equal(e.lastArea,'pallet');
});
test('empty E stays silent and gameplay stays unpaused',()=>{
 const e=new Engine(newRun(7,'endless',8));assert.equal(e.interact(),false);assert.equal(e.notice,null);assert.equal(e.s.screen,'play');
 assert.equal(TRAINERS.find(t=>t.id==='red')!.groundOrigin,62/64);assert.equal(TRAINERS.find(t=>t.id==='kris')!.groundOrigin,1);
});
