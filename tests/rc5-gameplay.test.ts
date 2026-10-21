import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {attackStats} from '../src/combat.ts';
import {partnerLevelCap,battleLevel,badgePower,badgeProtection} from '../src/badge-progress.ts';
import {RARITIES,rollRarity} from '../src/reward-rarity.ts';
import {validateState,envelope,decodeEnvelope} from '../src/save.ts';
import {KANTO_GYMS,KANTO_LOCATIONS,KANTO_STORY} from '../src/kanto-world-catalog.ts';
import {KANTO_ATLAS} from '../src/kanto-atlas.ts';
import {fireWeapon,updateWeaponFields,anchoredWeaponEffect} from '../src/weapon-system.ts';
import {trialHealth} from '../src/boss-balance.ts';
import {attackBoss,advanceBossPhase} from '../src/bosses.ts';
import {questDefeated} from '../src/quests.ts';
import {brockFixture} from './rc5-fixtures.ts';
test('dash rejects contact and telegraphed damage for its full duration and short exit window',()=>{
 const e=new Engine(newRun(7,'story'));e.step(1/60,{x:1,y:0,dash:true});
 const until=e.s.trainer.dashUntil,protectedUntil=e.s.trainer.invincibleUntil;
 assert.ok(protectedUntil>=until+.09);
 for(const time of [until-.01,until+.05]){e.s.time=time;e.damageTrainer(70);assert.equal(e.s.trainer.hp,100);}
 e.s.time=protectedUntil+.01;e.damageTrainer(70);assert.ok(e.s.trainer.hp<100);
});
test('badge limits stop XP, protect existing saves and grant combat bonuses for every earned badge',()=>{
 const e=new Engine(newRun(1,'story')),p=e.s.party[0];p.level=16;
 e.awardPartnerXp(10000);assert.equal(p.level,16);assert.equal(p.xp,0);
 const base=attackStats(e.s,p).power;
 e.s.story.done.push(KANTO_GYMS[0].id);assert.equal(partnerLevelCap(e.s),22);
 assert.ok(attackStats(e.s,p).power>base);e.awardPartnerXp(10000);assert.equal(p.level,22);
 p.level=80;e.s.story.done=[];assert.equal(battleLevel(e.s,p),16);assert.equal(p.level,80);
 e.s.story.done=KANTO_STORY.filter(q=>q.id!=='mewtwo').map(q=>q.id);assert.equal(partnerLevelCap(e.s),70);assert.equal(badgePower(e.s),1.24);assert.equal(badgeProtection(e.s),.16);
 assert.equal(decodeEnvelope(envelope(e.s,1)).party[0].level,80);
});
test('rarity weights and applied gains agree and cannot overrun remaining ranks',()=>{
 const e=new Engine(newRun(7,'normal',831)),counts:Record<string,number>={};
 for(let i=0;i<10000;i++){const r=rollRarity(()=>e.random(),4);counts[r]=(counts[r]??0)+1;}
 assert.ok(counts.common>counts.rare&&counts.rare>counts.epic&&!counts.legendary);
 for(const r of RARITIES){
  const e=new Engine(newRun(7,'normal')),p=e.s.party[0];e.s.screen='level';e.s.choices=[{kind:'rank',uid:p.uid,slot:0,title:'Test',description:'Test',rarity:r.id},{kind:'heal',title:'Rast',description:'Rast'},{kind:'heal',title:'Rast',description:'Rast'}];
  const restored=new Engine(decodeEnvelope(envelope(e.s,1)));restored.choose(0);assert.equal(restored.s.party[0].ranks[0],1+r.ranks);validateState(restored.s);
 }
 for(let i=0;i<100;i++)assert.equal(rollRarity(()=>e.random(),1),'common');
});
test('orbit and attached effects belong to their casting partner during trainer movement',()=>{
 const e=new Engine(newRun(12,'normal')),p=e.s.party[0]; // Find an orbit species without coupling this test to its name.
 const species=Object.values(SPECIES).find(s=>s.weapon.pattern==='orbit')!;p.species=species.id;
 const enemy=e.addEnemy(19,'wild',{x:p.x+40,y:p.y});fireWeapon(e,p,attackStats(e.s,p),enemy);
 p.x+=80;p.y+=35;e.s.trainer.x-=200;updateWeaponFields(e,.02);
 const field=e.s.fields.find(f=>f.kind==='orbit')!;assert.equal(field.x,p.x);assert.equal(field.y,p.y);
 const effect=e.effects.find(f=>f.kind==='cast')!,anchored=anchoredWeaponEffect(e,effect);assert.equal(anchored.x,p.x);assert.equal(anchored.y,p.y);
});
import {SPECIES} from '../src/data.ts';

test('all destinations have original atlas coordinates and no original map marker is off canvas',()=>{
 for(const l of KANTO_LOCATIONS){const p=KANTO_ATLAS[l.id];assert.ok(p,l.id);assert.ok(p.x>=0&&p.x<192&&p.y>=0&&p.y<144,l.id);}
});
test('Meister leaders demand endurance and announce unavoidable-at-rest attacks in all three phases',()=>{
 const e=brockFixture(),s=e.s;
 assert.ok(trialHealth(s,290)>10000);
 e.step(1/30);s.time=1;e.step(1/30);const boss=s.enemies.find(f=>f.storyLeader)!;assert.ok(boss);
 for(const ratio of [1,.5,.2]){
  boss.hp=boss.maxHp*ratio;s.hazards=[];attackBoss(e,boss);
  assert.ok(s.hazards.some(h=>h.shape==='circle'&&e.inHazard(s.trainer,h)));
  assert.ok(s.hazards.every(h=>h.warnUntil>s.time+.6));
 }
});
test('quest reinforcements survive saving and never count as broken seals or the defeated guardian',()=>{
 const e=new Engine(newRun(7,'learn',815));e.startQuest('tree');
 const s=e.s,boss=e.addEnemy(15,'guardian',{x:1100,y:1100});
 boss.questId='tree';boss.objective=3;boss.storyLeader=true;boss.maxHp=1000;boss.hp=200;
 s.quests.tree.progress=3;s.quests.tree.wave=1;
 advanceBossPhase(e,boss);
 const loaded=new Engine(decodeEnvelope(envelope(s,3))),ally=loaded.s.enemies.find(f=>f.questReinforcement)!;
 assert.ok(ally);ally.hp=0;questDefeated(loaded,ally);
 assert.equal(loaded.s.quests.tree.progress,3);assert.equal(loaded.s.quests.tree.ready,false);
 const leader=loaded.s.enemies.find(f=>f.storyLeader)!;leader.hp=0;questDefeated(loaded,leader);
 assert.equal(loaded.s.quests.tree.ready,true);
});
test('older saved boss time limits remain loadable while future master fights get their extended window',()=>{
 const old=newRun(7,'normal',77,'red',null,'master');old.bossLimit=120;
 assert.equal(validateState(old).bossLimit,480);
 old.bossSpawned=true;assert.equal(validateState(old).bossLimit,120);
});
