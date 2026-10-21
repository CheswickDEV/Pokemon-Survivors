import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {DIFFICULTIES,difficulty} from '../src/difficulty.ts';
import {BOSSES,attackBoss,expeditionBoss} from '../src/bosses.ts';
import {validateState,defaultProfile,validateProfile,backupEnvelope,decodeBackup,saveSlot} from '../src/save.ts';
import {recordProgress} from '../src/progress.ts';
import {worldWalkable} from '../src/world.ts';
import {TRIAL_ARENA} from '../src/trial-arena.ts';
import {updateGauntlet} from '../src/gauntlet.ts';
test('difficulty changes real damage, health, speed, waves and telegraph timing without changing a restored run',()=>{
 const values=DIFFICULTIES.map(d=>{
  const e=new Engine(newRun(7,'normal',55,'red',null,d.id));
  const foe=e.addEnemy(3,'boss');e.damageTrainer(20);attackBoss(e,foe);
  const hp=foe.maxHp,speed=foe.speed,loss=100-e.s.trainer.hp,warn=e.s.hazards[0].warnUntil;
  e.s.enemies=[];e.spawn(1);
  assert.equal(validateState(e.s).difficulty,d.id);
  return {hp,speed,loss,warn,spawn:e.s.enemies.length};
 });
 for(let i=1;i<values.length;i++){
  assert.ok(values[i].hp>values[i-1].hp);assert.ok(values[i].loss>values[i-1].loss);
  assert.ok(values[i].speed>values[i-1].speed);assert.ok(values[i].warn<values[i-1].warn);
 }
 assert.ok(values.at(-1)!.spawn>values[0].spawn);
 const old:any=newRun(1,'story');old.version=5;delete old.difficulty;delete old.clearedBosses;delete old.gauntlet;
 assert.equal(validateState(old).difficulty,'standard');assert.equal(validateState(old).version,6);
 assert.throws(()=>validateState({...newRun(1,'normal'),difficulty:'impossible'}));
});
test('15 bosses have distinct attack sequences, bounded effects and reachable safe positions during warning',()=>{
 const signatures=new Set<string>();
 for(const b of BOSSES){
  const e=new Engine(newRun(7,'bossrush',80,'red',null,'master')),s=e.s;
  const foe=e.addEnemy(b.species,'boss',{x:s.trainer.x+180,y:s.trainer.y});
  const signaturesForBoss=[];
  for(let phase=0;phase<3;phase++){
   s.hazards=[];attackBoss(e,foe);assert.ok(s.hazards.length>0&&s.hazards.length<12);
   assert.ok(s.hazards.every(h=>h.warnUntil>s.time+.7&&h.expire>h.warnUntil));
   const safe=[];for(let angle=0;angle<Math.PI*2;angle+=Math.PI/16)for(const r of [40,70,100]){
    const p={x:s.trainer.x+Math.cos(angle)*r,y:s.trainer.y+Math.sin(angle)*r};
    if(worldWalkable(s,p,12)&&!s.hazards.some(h=>e.inHazard(p,h)))safe.push(p);
   }
   assert.ok(safe.length,b.species+' phase '+phase+' must offer an escape');
   signaturesForBoss.push(s.hazards.map(h=>[h.shape,h.style,h.r,h.width,Math.round(h.angle*100),Math.round((h.warnUntil-s.time)*100)]));
   assert.deepEqual(validateState(s).hazards,s.hazards);
  }
  signatures.add(JSON.stringify(signaturesForBoss));
 }
 assert.equal(signatures.size,15);
 assert.equal(new Set(Array.from({length:15},(_,i)=>expeditionBoss(7,i).species)).size,15);
 assert.equal(expeditionBoss(999,0,true).species,3);
});
test('gauntlet completes all 15 rounds, persists intermissions and cannot award quests',()=>{
 const e=new Engine(newRun(25,'bossrush',99)),s=e.s;
 assert.equal(s.party.length,3);assert.equal(s.active.length,3);assert.equal(s.level,8);
 assert.ok(s.party.every(p=>p.level===12&&p.ranks[0]===3));
 assert.equal(e.startQuest('camp'),false);assert.equal(e.interact(),false);
 for(let i=0;i<BOSSES.length;i++){
  s.time=Math.max(s.time,s.gauntlet.nextAt);s.screen='play';updateGauntlet(e);
  const foe=s.enemies.find(f=>f.hp>0&&f.kind==='boss')!;assert.equal(foe.species,BOSSES[i].species);
  assert.ok(s.gauntlet.deadline>s.time);
  e.hit(foe,1e7,'normal');updateGauntlet(e);s.enemies=s.enemies.filter(f=>f.hp>0);
  assert.equal(s.gauntlet.round,i+1);assert.equal(s.clearedBosses.length,i+1);
  assert.deepEqual(validateState(s).gauntlet,s.gauntlet);
 }
 assert.equal(s.outcome,'win');assert.equal(s.screen,'result');
 assert.deepEqual(s.completed,[]);assert.equal(saveSlot('bossrush'),'bossrush');
});
test('gauntlet timeout and solid arena prevent an endless off-map escape',()=>{
 const e=new Engine(newRun(1,'bossrush')),s=e.s;
 s.time=5;updateGauntlet(e);s.time=s.gauntlet.deadline;updateGauntlet(e);assert.equal(s.outcome,'timeout');
 Object.assign(s.trainer,{x:TRIAL_ARENA.x+TRIAL_ARENA.r-13,y:TRIAL_ARENA.y});
 e.move(s.trainer,1000,0,12);assert.ok(s.trainer.x<=TRIAL_ARENA.x+TRIAL_ARENA.r-12);
});
test('full backup preserves all modes and profile, rejects checksum, slot and journal corruption',()=>{
 const p=defaultProfile(),a=newRun(1,'story',9,'red',null,'veteran'),b=newRun(4,'normal'),c=newRun(7,'bossrush');
 a.clearedBosses=[95];a.completed=['camp'];a.evolved=[2];recordProgress(p,a);assert.equal(recordProgress(p,a),false);
 const data={profile:p,story:a,forest:b,bossrush:c},file=backupEnvelope(data);
 assert.deepEqual(decodeBackup(file),data);
 assert.throws(()=>decodeBackup({...file,payload:file.payload.replace('veteran','master')}));
 assert.throws(()=>decodeBackup(backupEnvelope({...data,story:c})));
 assert.throws(()=>validateProfile({...p,journal:{...p.journal,bosses:[999]}}));
 assert.throws(()=>validateProfile({...p,journal:{...p.journal,bosses:[95,95]}}));
 const legacy:any={...p};delete legacy.journal;assert.deepEqual(validateProfile(legacy).journal.bosses,[]);
});
test('boss phase continues after save and damage is applied once per telegraph',()=>{
 const e=new Engine(newRun(7,'bossrush')),s=e.s,foe=e.addEnemy(145,'boss',{x:s.trainer.x+100,y:s.trainer.y});
 attackBoss(e,foe);const restored=new Engine(validateState(s)),rfoe=restored.s.enemies[0];
 assert.equal(rfoe.attackPhase,1);attackBoss(restored,rfoe);assert.equal(rfoe.attackPhase,2);
 const h=s.hazards[0];s.time=h.warnUntil;e.hazards();const hp=s.trainer.hp;e.hazards();assert.equal(s.trainer.hp,hp);
 assert.ok(hp<100);assert.equal(difficulty(s).name,'Standard');
});
