import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {attackStats} from '../src/combat.ts';
import {upgradeBody,moveCard} from '../src/ui-components.ts';
import {validateState,decodeEnvelope,envelope,SaveStore,defaultProfile} from '../src/save.ts';
import {TRAINERS} from '../src/trainer-art.ts';
import {POKEMON_ART} from '../src/pokemon-art.ts';

test('version 0.1 saves migrate to Rot without changing progress or mutating the original',()=>{
 const state=newRun(7,'learn',45),old=JSON.parse(JSON.stringify(state));delete old.trainerId;
 old.version=1;old.party[0].nextFire=[0,0,0,0];old.xp=8;old.coins=21;old.party[0].ranks=[3,1,1,1];
 const restored=decodeEnvelope(envelope(old,5));
 assert.equal(restored.trainerId,'red');assert.equal(restored.xp,8);assert.equal(restored.coins,21);
 assert.deepEqual(restored.party[0].ranks,[3]);assert.equal(old.trainerId,undefined);
});
test('all six trainer choices survive saving; invalid identities are rejected',()=>{
 assert.equal(TRAINERS.length,6);
 for(const t of TRAINERS){
  const state=newRun(1,'normal',19,t.id);
  assert.equal(decodeEnvelope(envelope(state,1)).trainerId,t.id);
  assert.equal(Object.keys(t.animations).length,8);
  for(const frames of Object.values(t.animations)){assert.equal(frames.length,8);assert.equal(new Set(frames).size,8);}
 }
 assert.throws(()=>validateState({...newRun(1,'learn',4),trainerId:'../../other'}),/Trainerfigur/);
});
test('old profile preferences migrate while keeping progress and settings',async()=>{
 const store=new SaveStore(),profile=JSON.parse(JSON.stringify(defaultProfile()));delete profile.trainerId;
 profile.wins=3;profile.settings.effects=false;
 store.get=async<T>()=>profile as T;
 const loaded=await store.loadProfile();assert.equal(loaded.trainerId,'red');assert.equal(loaded.wins,3);assert.equal(loaded.settings.effects,false);
 profile.trainerId='may';assert.equal((await store.loadProfile()).trainerId,'may');
});
test('displayed attack values match fired projectiles and attack clocks',()=>{
 const e=new Engine(newRun(29,'normal',37)),p=e.s.party[0];e.s.level=12;p.species=30;p.ranks[0]=3;p.equipped=[0];
 e.s.passives={tempo:3,reach:2};e.random=()=>.9;
 e.addEnemy(19,'wild',{x:p.x+80,y:p.y});
 const stats=attackStats(e.s,p,0);e.partners(0);
 assert.equal(e.s.shots.length,stats.projectiles);assert.equal(e.s.shots[0].power,stats.power);
 assert.equal(e.s.shots[0].life,stats.range/stats.speed*1.2);assert.equal(p.nextFire[0],e.s.time+stats.interval);
 assert.match(moveCard(e.s,p,0),/Rang 3\/8/);
 assert.match(upgradeBody(e.s,{kind:'rank',uid:p.uid,slot:0,title:'',description:''}),/Nidorina/);
});
test('displayed drain healing includes supply once and ranks improve power and tempo',()=>{
 const e=new Engine(newRun(92,'normal',18)),p=e.s.party[0];p.ranks=[3];e.s.trainer.hp=20;e.s.passives.heal=2;
 e.addEnemy(19,'wild',{x:p.x+50,y:p.y});const stats=attackStats(e.s,p);e.partners(0);
 assert.equal(e.s.trainer.hp,20+stats.heal);
 assert.ok(attackStats(e.s,p,0,8).interval<attackStats(e.s,p,0,1).interval);
 assert.ok(attackStats(e.s,p,0,8).power>attackStats(e.s,p,0,1).power);
});
test('visual feedback is bounded, pauses with gameplay and is not serialized',()=>{
 const e=new Engine(newRun(1,'learn',4)),rng=e.s.rng;
 for(let i=0;i<300;i++)e.fx('hit',e.s.trainer,0xffffff);
 assert.equal(e.effects.length,180);assert.equal(e.s.rng,rng);
 const before=e.effects[0].life;e.s.screen='level';e.step(1/60);assert.equal(e.effects[0].life,before);
 assert.ok(!JSON.parse(envelope(e.s,1).payload).effects);
});
test('all encounter artwork stays within the first 151 and preserves per-frame timing',()=>{
 assert.equal(Object.keys(POKEMON_ART).length,18);
 let count=0;
 for(const art of Object.values(POKEMON_ART)){
  assert.ok(art.id>=1&&art.id<=151);assert.equal(art.durationsMs.length,art.frameCount);
  assert.ok(art.durationsMs.every(ms=>ms>0));count+=art.frameCount;
 }
 assert.equal(count,1073);
});
