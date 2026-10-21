// Full ordered combat campaign with one persistent run, clock, HP, unlocks and saves.
// Travel/farming/catching preparation is replaced by the declared reference loadout.
// No trainer HP refill, forced damage, invulnerability or quest completion is injected.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {Engine} from '../src/engine.ts';
import {stageFixture,runStage} from './rc6-story-probe.ts';
import {KANTO_STORY} from '../src/kanto-world-catalog.ts';
import {serviceAt,KANTO_BUILDINGS} from '../src/kanto-layout.ts';
import {approachStage,visit} from './story-helpers.ts';
import {decodeEnvelope,envelope} from '../src/save.ts';
import {continueStory} from '../src/story.ts';
const results=[];
for(const starter of (process.env.STARTERS??'1,4,7').split(',').map(Number)){
 let e=stageFixture(0,starter),stages=[];let completed=0,deaths=0;
 for(let index=0;index<KANTO_STORY.length;index++){
  const q=KANTO_STORY[index];
  if(index){
   // The real completion and prerequisites from all preceding battles are retained.
   assert.deepEqual(e.s.story.done,KANTO_STORY.slice(0,index).map(q=>q.id));
   if(e.s.outcome==='win'){e.s.outcome=null;e.s.screen='play';e.s.bossDead=false;}
   while(e.s.screen==='level')e.choose(0);
   const ref=stageFixture(index,starter).s,s=e.s;
   s.level=Math.max(s.level,ref.level);
   for(const rp of ref.party){
    const family=Math.floor((rp.species-1)/3),p=s.party.find(p=>Math.floor((p.species-1)/3)===family);
    if(p){p.species=rp.species;p.level=rp.level;p.ranks=[...rp.ranks];p.xp=0;p.points=rp.points;}
    else s.party.push({...rp,uid:s.nextId++,nextFire:[s.time+1],traitNext:s.time+12});
   }
   s.active=s.party.slice(0,3).map(p=>p.uid);s.passives={...ref.passives};s.caught=[...new Set([...s.caught,...s.party.map(p=>p.species)])];
   const center=serviceAt(q.locationId,'heal')??KANTO_BUILDINGS.find(b=>b.service==='heal')!;
   const hp=s.trainer.hp;visit(e,center,'heal');s.time=Math.max(s.time,s.story.healReady);e.interact();assert.equal(s.trainer.hp,hp,'Center may not refill HP');
   approachStage(e,q);s.screen='play';e.interact();assert.ok(e.startStory(q.id));
  }
  let won=false;
  for(let attempt=1;attempt<=8;attempt++){
   const result=runStage(index,starter,true,'reference','master',100,e,state=>e=new Engine(decodeEnvelope(envelope(state,index+2))));
   stages.push({...result,attempt});console.log(JSON.stringify({...result,attempt}));
   if(result.won){won=true;break;}
   if(e.s.outcome!=='lost')break;
   deaths++;const coins=e.s.coins,done=[...e.s.story.done];
   assert.ok(continueStory(e));assert.equal(e.s.coins,Math.floor(coins*.9));assert.deepEqual(e.s.story.done,done);
   // Retry uses the real checkpoint recovery. No reset of the run clock, RNG,
   // accumulated talents, used phoenix feather or earned training.
   approachStage(e,q);e.interact();assert.ok(e.startStory(q.id));
  }
  if(!won)break;
  completed++;
 }
 results.push({starter,completed,deaths,hp:e.s.trainer.hp,simulationSeconds:e.s.time,badges:e.s.story.done.filter(id=>['brock','misty','surge','erika','koga','sabrina','blaine','giovanni'].includes(id)).length,stages});
 writeFileSync('qa/rc6-persistent-campaign.json',JSON.stringify({method:'Persistent battle campaign with normal checkpoint retries and coin penalty. Travel and training/catch preparation are substituted, not a fresh-save full overworld playthrough.',results},null,2));
}
