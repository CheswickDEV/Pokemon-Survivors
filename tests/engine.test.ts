import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun,activeCapacity,knownMoves,xpNeeded} from '../src/engine.ts';
import {decodeEnvelope,envelope,validateState,SaveStore} from '../src/save.ts';
import {typeFactor} from '../src/data.ts';
function capture(e:Engine,id:number){
 const en=e.addEncounter(id,'test-'+e.s.nextId,{x:e.s.trainer.x+30,y:e.s.trainer.y});
 const enemy=e.s.enemies.find(q=>q.encounterId===en.id)!;
 e.hit(enemy,10000,'normal');e.s.enemies=e.s.enemies.filter(q=>q.hp>0);
 e.s.screen='capture';e.s.pendingId=en.id;
 return en;
}
test('diagonal movement is normalized and menu pause freezes simulation',()=>{
 const a=new Engine(newRun(1,'learn',4)),b=new Engine(newRun(1,'learn',4));
 a.step(1/60,{x:1,y:0});b.step(1/60,{x:1,y:1});
 assert.ok(Math.abs(Math.hypot(b.s.trainer.x-1536,b.s.trainer.y-1710)-(a.s.trainer.x-1536))<.00001);
 const before=a.s.time;a.s.screen='level';a.step(1/60,{x:1,y:0});assert.equal(a.s.time,before);
});
test('capture requires encounter victory, consumes one ball and cannot repeat',()=>{
 const e=new Engine(newRun(1,'learn',1));
 const en=capture(e,25);assert.equal(en.ready,true);assert.equal(e.capture(),true);
 assert.equal(e.s.party.length,2);assert.equal(e.s.balls,2);assert.ok(e.s.caught.includes(25));
 e.s.pendingId=en.id;e.s.screen='capture';assert.equal(e.capture(),false);assert.equal(e.s.balls,2);
});
test('duplicate encounter does not consume a ball; empty stock keeps encounter available',()=>{
 const e=new Engine(newRun(1,'learn',1));capture(e,1);assert.equal(e.capture(),true);assert.equal(e.s.balls,3);assert.equal(e.s.party.length,1);
 const en=capture(e,25);e.s.balls=0;assert.equal(e.capture(),false);assert.equal(en.claimed,false);
});
test('full party replacement preserves training and costs exactly one ball',()=>{
 const e=new Engine(newRun(1,'normal',7));e.s.balls=20;e.s.level=10;
 for(const id of [4,7,10,19]){capture(e,id);assert.equal(e.capture(),true);}
 capture(e,25);assert.equal(e.capture(),true);assert.equal(e.s.party.length,6);
 e.s.party[0].ranks=[5];e.s.party[0].points=4;e.s.party[0].level=8;
 assert.equal(e.evolve(e.s.party[0].uid),true);
 const en=capture(e,1),old=e.s.party[0],balls=e.s.balls;
 assert.equal(e.capture(),false);assert.equal(e.s.balls,balls);assert.equal(en.claimed,false);
 assert.equal(e.capture(old.uid),true);assert.equal(e.s.balls,balls-1);assert.deepEqual(e.s.party[0].ranks,[5]);assert.equal(e.s.party[0].points,4);
});
test('switch and move edits preserve individual attack clocks and stamina',()=>{
 const e=new Engine(newRun(1,'normal',6));capture(e,25);e.capture();
 const [first,second]=e.s.party;first.stamina=21;first.nextFire=[20];
 assert.equal(e.setActive([second.uid]),true);assert.equal(e.setActive([first.uid]),false);
 assert.equal(e.setMoves(second.uid,[0,1]),false);
 e.s.time=21;assert.equal(e.setActive([first.uid]),true);
 assert.equal(first.stamina,21);assert.deepEqual(first.nextFire,[20]);assert.equal(e.s.deployReady,22);
});
test('recovering reserve never takes an occupied active slot',()=>{
 const e=new Engine(newRun(1,'normal',6));capture(e,25);e.capture();
 const [first,second]=e.s.party;first.recoveryUntil=20;first.stamina=0;
 assert.equal(e.setActive([second.uid]),true);e.s.time=20;e.step(1/60);
 assert.deepEqual(e.s.active,[second.uid]);assert.equal(first.stamina,50);assert.equal(first.recoveryUntil,0);
});
test('normal evolution follows level and preserves ranks; stone evolution is atomic',()=>{
 const e=new Engine(newRun(1,'normal',6));const first=e.s.party[0];
 assert.equal(e.evolve(first.uid),false);first.level=8;assert.equal(e.evolve(first.uid),true);assert.equal(first.species,2);
 capture(e,25);e.capture();const pika=e.s.party[1];e.s.bag.thunder=1;
 assert.equal(e.evolve(pika.uid),false);assert.equal(e.s.bag.thunder,1);
 pika.ranks[0]=3;pika.level=8;assert.equal(e.evolve(pika.uid),true);assert.equal(pika.species,26);assert.equal(e.s.bag.thunder,0);
});
test('evolving into an occupied species does not consume a stone',()=>{
 const e=new Engine(newRun(1,'normal',6));e.s.level=10;
 capture(e,25);e.capture();capture(e,26);e.capture();
 const pika=e.s.party.find(p=>p.species===25)!;pika.ranks[0]=3;e.s.bag.thunder=1;
 assert.equal(e.evolve(pika.uid),false);assert.equal(e.s.bag.thunder,1);assert.equal(pika.species,25);
});
test('POI reward and merchant stock cannot be duplicated or overdrawn',()=>{
 const e=new Engine(newRun(1,'normal',6));e.s.screen='reward';e.s.pendingId='camp';
 assert.equal(e.claimReward('stone','thunder'),false);e.s.poiProgress.camp=3;Object.assign(e.s.quests.camp,{started:true,ready:true,progress:3,collected:[0,1,2]});
 assert.equal(e.claimReward('stone','thunder'),true);assert.equal(e.s.balls,5);assert.equal(e.s.bag.thunder,1);
 e.s.screen='reward';e.s.pendingId='camp';assert.equal(e.claimReward('stone','thunder'),false);
 e.s.screen='merchant';e.s.coins=1000;
 assert.equal(e.buy('stone','thunder'),true);assert.equal(e.buy('stone','thunder'),true);assert.equal(e.buy('stone','thunder'),false);assert.equal(e.s.coins,850);
});
test('level unlocks and original type mapping are explicit',()=>{
 const s=newRun(1,'normal');assert.equal(activeCapacity(s),1);s.level=4;assert.equal(activeCapacity(s),2);assert.equal(knownMoves(s),1);s.level=8;assert.equal(activeCapacity(s),3);
 assert.equal(typeFactor('electric',['water','flying']),1.65);assert.equal(typeFactor('grass',['fire','flying']),.6);assert.equal(xpNeeded(1),12);
});
test('boss begins at deadline; defeat, timeout and simultaneous lethal resolution work',()=>{
 const e=new Engine(newRun(1,'learn',7));e.s.time=479.999;e.step(1/60);
 assert.equal(e.s.bossSpawned,true);const boss=e.s.enemies.find(e=>e.kind==='boss')!;assert.ok(boss);
 e.hit(boss,100000,'fire');e.step(1/60);assert.equal(e.s.outcome,'win');
 const lost=new Engine(newRun(1,'learn'));lost.s.trainer.hp=0;lost.s.bossDead=true;lost.step(1/60);assert.equal(lost.s.outcome,'lost');
 const expired=new Engine(newRun(1,'normal'));expired.s.time=1320;expired.step(1/60);assert.equal(expired.s.outcome,'timeout');
});
test('checksum, schema and species bounds reject damaged or incompatible imports',()=>{
 const s=newRun(1,'learn',8),data=envelope(s,1);assert.deepEqual(decodeEnvelope(data),s);
 assert.throws(()=>decodeEnvelope({...data,payload:data.payload+' '}),/beschädigt/);
 assert.throws(()=>validateState({...s,version:99}),/Version/);
 const invalid=structuredClone(s);invalid.party[0].species=152;assert.throws(()=>validateState(invalid),/Partner/);
 const duplicate=structuredClone(s);duplicate.party.push({...duplicate.party[0],uid:4});assert.throws(()=>validateState(duplicate),/Partner/);
});
test('snapshot replay continues exactly through RNG, attacks, motion and pickups',()=>{
 const a=new Engine(newRun(4,'normal',123));
 for(let i=0;i<900;i++){a.step(1/60,{x:Math.sin(i/200),y:Math.cos(i/200)});if(a.s.screen==='level')a.choose(0);}
 const b=new Engine(decodeEnvelope(envelope(a.s,1)));
 for(let i=0;i<600;i++){
  const input={x:Math.sin(i/120),y:Math.cos(i/120)};
  a.step(1/60,input);b.step(1/60,input);
  if(a.s.screen==='level'){a.choose(0);b.choose(0);}
 }
 assert.deepEqual(a.s,b.s);
});
test('storage retains the previous valid generation when newest snapshot is damaged',async()=>{
 class MemoryStore extends SaveStore {
  records=new Map<string,unknown>();
  override async get<T>(key:string){return this.records.get(key) as T|undefined;}
  override async put(key:string,value:unknown){this.records.set(key,structuredClone(value));}
 }
 const store=new MemoryStore(),s=newRun(7,'learn',16);
 await store.saveRun(s);s.time=12;await store.saveRun(s);
 assert.equal((await store.loadRun())!.time,12);
 store.records.set('run-0',{...store.records.get('run-0') as object,checksum:'broken'});
 assert.equal((await store.loadRun())!.time,0);assert.equal(store.recovered,true);
 store.records.set('run-1',{payload:'invalid'});
 await assert.rejects(store.loadRun(),/Beide Laufkopien/);
});
test('boss telegraphs wait before damage and fire only once',()=>{
 const e=new Engine(newRun(7,'learn',19));e.hazard('circle',e.s.trainer,0,60,0,1.1,20);
 e.hazards();assert.equal(e.s.trainer.hp,100);
 e.s.time=1.2;e.hazards();const hp=e.s.trainer.hp;assert.ok(hp<100);
 e.s.time=2.1;e.hazards();assert.equal(e.s.trainer.hp,hp);
});
