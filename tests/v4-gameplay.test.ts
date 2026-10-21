import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {SPECIES,POIS} from '../src/data.ts';
import {CRATES,SEALS} from '../src/quests.ts';
import {decodeEnvelope,envelope,validateState} from '../src/save.ts';
import {attackStats} from '../src/combat.ts';
import {fireWeapon,updateWeaponFields} from '../src/weapon-system.ts';
import {POKEMON_WORLD_SCALE,POKEMON_CONTENT_EXTENT} from '../src/pokemon-size.ts';
import {drawBossAttack} from '../src/boss-art.ts';
const kill=(e:Engine,id:string,objective?:number)=>e.s.enemies.filter(f=>f.hp>0&&f.questId===id&&(objective===undefined||f.objective===objective)).forEach(f=>e.hit(f,100000,'normal'));
test('Ranger quest requires combat, three timed crates and return; repeated E grants nothing',()=>{
 const e=new Engine(newRun(1,'learn',99));Object.assign(e.s.trainer,POIS[0]);e.interact();assert.equal(e.s.screen,'quest');assert.equal(e.s.quests.camp.started,false);
 e.startQuest('camp');for(let i=0;i<5;i++)e.interact();assert.equal(e.s.quests.camp.progress,0);assert.equal(e.s.balls,3);
 for(let i=0;i<3;i++){
  Object.assign(e.s.trainer,CRATES[i]);e.interact();assert.equal(e.s.quests.camp.channel,null);kill(e,'camp',i);e.interact();
  e.objectives(1);const resumed=new Engine(decodeEnvelope(envelope(e.s,2)));assert.equal(resumed.s.quests.camp.channelProgress,1);
  e.objectives(1.4);assert.equal(e.s.quests.camp.collected.length,i);e.objectives(.1);assert.equal(e.s.quests.camp.collected.length,i+1);
 }
 assert.equal(e.s.quests.camp.ready,true);assert.equal(e.s.screen,'play');assert.equal(e.claimReward('heal'),false);
 Object.assign(e.s.trainer,POIS[0]);e.interact();assert.equal(e.s.screen,'reward');assert.equal(e.claimReward('training',String(e.s.party[0].uid)),true);
 assert.equal(e.s.party[0].ranks[0],2);assert.equal(e.s.balls,5);assert.equal(e.s.coins,60);assert.ok(e.s.merchantUntil!>e.s.duration);assert.equal(e.claimReward('heal'),false);validateState(e.s);
});
test('crate channel cancels on departure and guards remain near distant crates',()=>{
 const e=new Engine(newRun(1,'learn'));e.startQuest('camp');const before=e.s.enemies.filter(f=>f.objective===2).map(f=>({x:f.x,y:f.y}));
 Object.assign(e.s.trainer,CRATES[0]);for(let i=0;i<300;i++)e.enemies(1/60);
 e.s.enemies.filter(f=>f.objective===2).forEach((f,i)=>assert.ok(Math.hypot(f.x-before[i].x,f.y-before[i].y)<1));
 kill(e,'camp',0);e.interact();e.objectives(1);e.s.trainer.x+=100;e.objectives(.1);assert.equal(e.s.quests.camp.channel,null);assert.equal(e.s.quests.camp.collected.length,0);
});
test('garden demands three battles plus protected time; tree demands three seals and Bibor',()=>{
 const e=new Engine(newRun(7,'normal',98));Object.assign(e.s.trainer,POIS[1]);e.startQuest('garden');e.objectives(30);assert.equal(e.s.quests.garden.progress,0);
 for(let wave=1;wave<=3;wave++){assert.equal(e.s.quests.garden.wave,wave);kill(e,'garden');e.s.trainer.x+=200;e.objectives(5);assert.equal(e.s.quests.garden.progress,(wave-1)*10);e.s.trainer.x-=200;e.objectives(10);}
 assert.equal(e.s.quests.garden.ready,true);e.interact();e.claimReward('heal');e.s.trainer.hp=50;e.s.time=12;e.objectives(.1);assert.equal(e.s.trainer.hp,50);
 Object.assign(e.s.trainer,POIS[2]);e.startQuest('tree');assert.equal(e.s.enemies.filter(f=>f.questId==='tree'&&f.hp>0).length,3);
 for(let i=0;i<3;i++)kill(e,'tree',i);const boss=e.s.enemies.find(f=>f.questId==='tree'&&f.objective===3)!;assert.equal(boss.species,15);assert.equal(e.s.quests.tree.ready,false);
 e.hit(boss,10000,'normal');e.interact();assert.equal(e.s.screen,'reward');e.claimReward('stone','link');assert.equal(e.s.bag.link,1);assert.ok(e.s.completed.includes('tree'));validateState(e.s);
});
test('legacy ranks consolidate with overflow coins; completed quests retain earned rewards',()=>{
 const old:any=newRun(1,'learn',81);old.version=1;delete old.quests;delete old.fields;old.party[0].ranks=[5,5,5,5];old.party[0].nextFire=[11,14,17,20];old.poiProgress.camp=3;old.completed=['camp'];old.poiProgress.garden=12;
 const next=decodeEnvelope(envelope(old,1));assert.equal(next.party[0].ranks[0],8);assert.equal(next.coins,108);assert.deepEqual(next.party[0].nextFire,[20]);assert.equal(next.quests.camp.ready,true);assert.equal(next.quests.garden.started,false);assert.equal(old.party[0].ranks.length,4);validateState(next);
});
test('melee and mine counts grow, sectors miss enemies behind, chain jumps and beams pierce',()=>{
 for(const id of [15,27]){
  const e=new Engine(newRun(id,'normal',9)),p=e.s.party[0];p.ranks=[8];e.random=()=>.99;const a=attackStats(e.s,p),foe=e.addEnemy(19,'wild',{x:p.x+45,y:p.y});foe.hp=foe.maxHp=10000;
  const behind=e.addEnemy(19,'wild',{x:p.x-30,y:p.y});behind.hp=behind.maxHp=10000;fireWeapon(e,p,a,foe);
  if(id===27)assert.equal(e.s.fields.length,a.projectiles);else{for(let i=0;i<100;i++){e.s.time+=1/60;updateWeaponFields(e,1/60);}assert.equal(10000-foe.hp,Math.round(a.power)*a.projectiles);assert.equal(behind.hp,10000);}
 }
 for(const id of [7,25]){const e=new Engine(newRun(id,'normal')),p=e.s.party[0];e.random=()=>.99;const foes=[40,80,120,160,200].map(x=>{const f=e.addEnemy(19,'wild',{x:p.x+x,y:p.y});f.hp=f.maxHp=10000;return f;});const a=attackStats(e.s,p);fireWeapon(e,p,a,foes[0]);assert.equal(foes.filter(f=>f.hp<10000).length,1+(id===25?a.bounces:a.pierce));}
});
test('all normal Pokémon and every evolution fit the same sprite footprint',()=>{
 for(const sp of Object.values(SPECIES)){assert.ok(Math.abs(POKEMON_WORLD_SCALE[sp.id]*POKEMON_CONTENT_EXTENT[sp.id]-36)<.0001);for(const ev of sp.evolutions)assert.ok(Math.abs(POKEMON_WORLD_SCALE[ev.to]*POKEMON_CONTENT_EXTENT[ev.to]-36)<.0001);}
});
test('boss rendering changes across charge, impact and decay with finite geometry even with reduced effects',()=>{
 const e=new Engine(newRun(1,'learn',4)),boss=e.addEnemy(3,'boss');for(let i=0;i<3;i++)e.bossAttack(boss);
 for(const h of e.s.hazards)for(const full of [true,false]){
  const renders=[];for(const t of [h.createdAt+.1,h.warnUntil+.1,h.expire-.1]){const commands:any[]=[];const g:any=new Proxy({}, {get:(_,name)=>(...args:any[])=>{for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg));commands.push([name,...args]);return g;}});drawBossAttack(g,{...h,fired:t>=h.warnUntil},t,full);assert.ok(commands.length>20);renders.push(JSON.stringify(commands));}assert.equal(new Set(renders).size,3);
 }
});

test('all sixteen weapon patterns replay identically after saving an attack in progress',()=>{
 const kinds=new Set<string>();
 for(const sp of Object.values(SPECIES)){
  if(kinds.has(sp.weapon.pattern))continue;kinds.add(sp.weapon.pattern);
  const a=new Engine(newRun(sp.id,'normal',441)),p=a.s.party[0];p.ranks=[8];
  const target=a.addEnemy(19,'wild',{x:p.x+50,y:p.y});target.hp=target.maxHp=100000;
  fireWeapon(a,p,attackStats(a.s,p),target);a.s.time+=.1;updateWeaponFields(a,.1);a.projectiles(.1);
  const b=new Engine(decodeEnvelope(envelope(a.s,1)));
  for(let i=0;i<120;i++)for(const e of [a,b]){e.s.time+=1/60;updateWeaponFields(e,1/60);e.projectiles(1/60);}
  assert.deepEqual(a.s,b.s,sp.weapon.pattern);
 }
 assert.equal(kinds.size,16);
});
test('boomerangs respect piercing per outbound and returning leg',()=>{
 const e=new Engine(newRun(104,'normal',24)),p=e.s.party[0];e.random=()=>.99;
 const enemies=[40,75,110,145,180].map(x=>{const enemy=e.addEnemy(19,'wild',{x:p.x+x,y:p.y});enemy.hp=enemy.maxHp=10000;return enemy;});
 const stats=attackStats(e.s,p);fireWeapon(e,p,stats,enemies[0]);
 for(let i=0;i<150;i++){e.s.time+=1/60;e.projectiles(1/60);}
 assert.equal(enemies.filter(f=>f.hp<10000).length,1+stats.pierce);
 assert.ok(enemies[0].hp<=10000-Math.round(stats.power)*2);
});
