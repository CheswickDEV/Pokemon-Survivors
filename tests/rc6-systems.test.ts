import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {BOONS,boonDash,updateBoons} from '../src/boons.ts';
import {attackStats} from '../src/combat.ts';
import {fireWeapon} from '../src/weapon-system.ts';
import {decodeEnvelope,envelope,validateState} from '../src/save.ts';
import {KANTO_STORY} from '../src/kanto-world-catalog.ts';
import {storyBossHealth,trialProfile} from '../src/story-trials.ts';
import {attackBoss} from '../src/bosses.ts';
import {stageFixture} from './rc6-story-probe.ts';
import {clearWorldPoint} from '../src/world.ts';
import {continueStory} from '../src/story.ts';
test('partner-only boss impacts cannot exhaust an automatically following team',()=>{
 const e=new Engine(newRun(4,'story')),s=e.s,p=s.party[0];
 Object.assign(s.trainer,{x:p.x+200,y:p.y});
 for(let i=0;i<20;i++){e.hazard('circle',p,0,40,0,0,80);e.hazards();s.time++;}
 assert.equal(p.stamina,100);assert.equal(p.recoveryUntil,0);assert.equal(s.trainer.hp,100);
 s.trainer.invincibleUntil=0;s.trainer.dashUntil=0;
 e.hazard('circle',s.trainer,0,40,0,0,40);e.hazards();
 assert.equal(s.trainer.hp,60);assert.equal(p.stamina,76);
 // Multiple simultaneous hitboxes cannot charge the team repeatedly through trainer i-frames.
 e.hazard('circle',s.trainer,0,40,0,0,40);e.hazards();assert.equal(p.stamina,76);
});
test('a clean boss dash preserves stamina and a safe interval regenerates it without healing trainer HP',()=>{
 const e=new Engine(newRun(7,'story')),s=e.s,p=s.party[0];s.trainer.hp=37;p.stamina=55;
 e.step(1/30,{x:1,y:0,dash:true});e.hazard('circle',s.trainer,0,180,0,0,90);e.hazards();
 assert.equal(p.stamina,55);assert.equal(s.trainer.hp,37);
 s.time=6;s.lastTrainerHit=0;e.partners(.5);assert.ok(p.stamina>55);assert.equal(s.trainer.hp,37);
});
test('epic echo repeats the owned weapon from its current position and cannot recursively echo',()=>{
 const e=new Engine(newRun(7,'story')),s=e.s,p=s.party[0];s.boons=['echo'];p.salvos=4;
 const f=e.addEnemy(19,'guardian',{x:p.x+100,y:p.y});f.hp=f.maxHp=10000;
 fireWeapon(e,p,attackStats(s,p),f);assert.equal(s.boonState!.echoes.length,1);
 p.x+=30;s.time=.5;const before=s.damageDone;updateBoons(e);
 assert.ok(s.damageDone>before);assert.equal(s.boonState!.echoes.length,0);assert.equal(p.salvos,5);
 const beam=e.effects.filter(f=>f.kind==='weapon').at(-1)!;assert.equal(beam.x,p.x);assert.equal(beam.owner,p.uid);
});
test('three distinct types trigger one resonance, repeated same-type hits do not',()=>{
 const e=new Engine(newRun(7,'story'));e.s.boons=['resonance'];
 const f=e.addEnemy(19,'guardian');f.hp=f.maxHp=1000;
 e.hit(f,10,'water');e.hit(f,10,'water');assert.equal(f.hp,980);
 e.hit(f,10,'fire');e.hit(f,10,'grass');assert.equal(f.hp,948);
 assert.deepEqual(f.resonance!.types,[]);
 validateState(e.s);
});
test('legendary timefold delays both warning and impact, has a cooldown and survives saving',()=>{
 let e=new Engine(newRun(4,'story'));e.s.boons=['timefold'];
 e.hazard('circle',e.s.trainer,0,50,0,.5,30);const old=e.s.hazards[0].warnUntil;
 boonDash(e);assert.equal(e.s.hazards[0].warnUntil,old+.65);
 boonDash(e);assert.equal(e.s.hazards[0].warnUntil,old+.65);
 e=new Engine(decodeEnvelope(envelope(e.s,1)));e.s.time=.6;e.hazards();assert.equal(e.s.trainer.hp,100);
 e.s.time=1.2;e.hazards();assert.equal(e.s.trainer.hp,70);
});
test('legendary second wind triggers exactly once even across save/load',()=>{
 let e=new Engine(newRun(7,'story'));e.s.boons=['second-wind'];
 e.damageTrainer(999,true);assert.equal(e.s.trainer.hp,30);assert.equal(e.s.boonState!.spent,true);
 e=new Engine(decodeEnvelope(envelope(e.s,1)));e.s.time=3;e.damageTrainer(999,true);
 assert.equal(e.s.trainer.hp,0);assert.equal(e.s.boonState!.spent,true);
});
test('legendary chorus calls the two other partners without triggering a second chorus',()=>{
 const e=stageFixture(2);const s=e.s;s.boons=['chorus'];const p=s.party[0];p.salvos=7;
 s.party.forEach((p,i)=>{p.x=s.trainer.x+i*20;p.y=s.trainer.y;});
 const f=e.addEnemy(19,'guardian',{x:p.x+100,y:p.y});f.hp=f.maxHp=100000;
 fireWeapon(e,p,attackStats(s,p),f);assert.equal(s.boonState!.echoes.length,2);
 s.time+=.5;updateBoons(e);assert.equal(s.boonState!.echoes.length,0);
 assert.deepEqual(s.party.map(p=>p.salvos),[8,0,0]);
 for(const q of s.party.slice(1))assert.ok(e.effects.some(f=>f.kind==='cast'&&f.owner===q.uid&&f.x===q.x));
});
test('rare decoy and magnetic wave have distinct gameplay effects',()=>{
 const e=new Engine(newRun(7,'story')),s=e.s;s.boons=['decoy','magnet-wave'];
 boonDash(e);const lure={...s.boonState!.lure!};s.trainer.x+=150;
 const f=e.addEnemy(19,'wild',{x:lure.x+30,y:lure.y});const before=f.x;e.enemies(.1);assert.ok(f.x<before);
 s.pickups=[{uid:s.nextId++,x:s.trainer.x,y:s.trainer.y,kind:'xp',value:1},{uid:s.nextId++,x:s.trainer.x+300,y:s.trainer.y,kind:'coin',value:4}];
 e.collect(0);e.collect(0);assert.equal(s.coins,4);assert.equal(s.pickups.length,0);
});
test('epic dash parry rewards one avoided hit and obeys cooldown',()=>{
 const e=new Engine(newRun(7,'story')),s=e.s;s.boons=['parry'];s.party[0].stamina=40;s.trainer.dashUntil=1;
 for(let i=0;i<2;i++)e.hazard('circle',s.trainer,0,40,0,0,40);
 e.hazards();assert.equal(s.trainer.hp,100);assert.equal(s.trainer.shield,10);assert.equal(s.party[0].stamina,52);
});
test('talents offer rare new mechanics, use three slots, and reject tampered saves',()=>{
 const e=new Engine(newRun(7,'story',624)),s=e.s;s.level=10;
 const counts={rare:0,epic:0,legendary:0};
 for(let i=0;i<5000;i++)for(const c of e.choices())if(c.kind==='boon')counts[c.rarity as keyof typeof counts]++;
 assert.ok(counts.rare>counts.epic&&counts.epic>counts.legendary&&counts.legendary>30&&counts.legendary<130);
 s.screen='level';const b=BOONS[5];s.choices=[{kind:'boon',id:b.id,rarity:b.rarity,title:b.name,description:b.description},...e.choices().slice(0,2).filter(c=>c.kind!=='boon')];
 while(s.choices.length<3)s.choices.push({kind:'heal',title:'Rast',description:'Rast'});
 assert.ok(e.choose(0));assert.deepEqual(s.boons,['timefold']);
 s.boons=['timefold','second-wind','chorus'];assert.ok(e.choices().every(c=>c.kind!=='boon'));
 const bad=structuredClone(s);bad.boons!.push('chorus');assert.throws(()=>validateState(bad));
 const duplicate=structuredClone(s);duplicate.boons=['echo','echo'];assert.throws(()=>validateState(duplicate));
});
test('all 27 trials have authored health and readable mechanics with open retreat positions in each phase',()=>{
 for(let i=0;i<KANTO_STORY.length;i++){
  const e=stageFixture(i),s=e.s,id=KANTO_STORY[i].id;assert.ok(trialProfile(id));assert.ok(storyBossHealth(s,id,0)>0);
  const f=e.addEnemy(KANTO_STORY[i].team.at(-1)!,'guardian',{x:s.trainer.x+120,y:s.trainer.y+100});f.storyId=id;f.storyLeader=true;f.maxHp=1000;
  for(const ratio of [1,.5,.2]){
   f.hp=f.maxHp*ratio;s.hazards=[];attackBoss(e,f);
   assert.ok(s.hazards.every(h=>h.warnUntil>s.time+.6),id);
   let safe=0;for(const radius of [40,80,120,150])for(let a=0;a<32;a++){const p={x:s.trainer.x+Math.cos(a*Math.PI/16)*radius,y:s.trainer.y+Math.sin(a*Math.PI/16)*radius};if(clearWorldPoint(s,p,14)&&!s.hazards.some(h=>h.warnUntil-s.time<1.5&&e.inHazard(p,h)))safe++;}
   assert.ok(safe,id+' phase '+ratio+' needs a retreat corridor');
  }
 }
});

test('a higher rarity talent can replace a full slot, but an invalid downgrade changes nothing',()=>{
 const e=new Engine(newRun(4,'story',624)),s=e.s;s.level=15;s.boons=['decoy','echo','resonance'];
 let replacement;
 for(let i=0;i<2000&&!replacement;i++)replacement=e.choices().find(c=>c.kind==='boon'&&c.rarity==='legendary');
 assert.ok(replacement);assert.equal(replacement.replaceBoon,'decoy');
 s.screen='level';s.choices=[replacement,...e.choices().filter(c=>c.kind!=='boon').slice(0,2)];
 while(s.choices.length<3)s.choices.push({kind:'heal',title:'Rast',description:'Rast'});
 validateState(s);assert.ok(e.choose(0));assert.equal(s.boons.length,3);assert.ok(!s.boons.includes('decoy'));assert.ok(s.boons.includes(replacement.id as any));
 const before=[...s.boons],b=BOONS[0];s.screen='level';
 s.choices=[{kind:'boon',id:b.id,rarity:b.rarity,replaceBoon:'echo',title:b.name,description:b.description}];
 assert.equal(e.choose(0),false);assert.deepEqual(s.boons,before);assert.throws(()=>validateState(s));
});

test('checkpoint recovery requires a result, keeps earned progress and consumed talents, and charges the loss penalty',()=>{
 const e=stageFixture(2),s=e.s,done=[...s.story.done];s.trainer.hp=37;s.coins=123;s.boons=['second-wind'];s.boonState!.spent=true;
 assert.equal(continueStory(e),false);assert.equal(s.trainer.hp,37);
 s.trainer.hp=0;s.outcome='lost';s.screen='result';s.party[0].stamina=0;s.party[0].recoveryUntil=s.time+12;
 assert.ok(continueStory(e));assert.equal(s.trainer.hp,100);assert.equal(s.coins,110);
 assert.equal(s.party[0].stamina,100);assert.equal(s.party[0].recoveryUntil,0);
 assert.equal(s.story.active,null);assert.deepEqual(s.story.done,done);assert.equal(s.boonState!.spent,true);assert.ok(s.interior);
 validateState(s);
});
