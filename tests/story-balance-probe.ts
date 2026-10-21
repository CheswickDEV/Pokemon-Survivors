import {approachStage,visit} from './story-helpers.ts';
// Encounter balance probe. Travel is skipped; battles use ordinary movement, automatic weapons,
// level choices and catches. No injected damage/XP/HP during battles. Town rest uses the Center.
import {Engine,newRun,activeCapacity} from '../src/engine.ts';
import {KANTO_STORY,KANTO_LOCATIONS} from '../src/kanto-world-catalog.ts';
import {clearWorldPoint} from '../src/world.ts';
import {SPECIES} from '../src/data.ts';
import {validateState} from '../src/save.ts';
import {serviceAt,buildingDoor} from '../src/kanto-layout.ts';
import {writeFileSync} from 'node:fs';
const results=[];
for(const starter of [1,4,7]){
 const e=new Engine(newRun(starter,'story',123+starter)),s=e.s;const stages=[];
 for(const q of KANTO_STORY){
  const origin=KANTO_LOCATIONS.find(l=>l.id===q.locationId)!;
  const center=serviceAt(origin.id,'heal');
  if(center){visit(e,center,'heal');s.time=Math.max(s.time,s.story.healReady);e.interact();}
  approachStage(e,q);
  s.screen='play';e.interact();e.startStory(q.id);const start=s.time;let frame=0;
  while(!s.story.done.includes(q.id)&&!s.outcome&&s.time-start<240&&frame++<20000){
   if(s.screen==='level'){
    const scores=s.choices.map((c,i)=>({i,score:c.kind==='evolve'?100:c.kind==='rank'?(s.active.includes(c.uid!)?80:15):c.id==='tempo'?60:c.id==='magnet'?50:c.kind==='heal'&&s.trainer.hp<50?90:10}));scores.sort((a,b)=>b.score-a.score);e.choose(scores[0].i);
   }
   for(const p of s.party)if(!e.evolutionReason(p.uid))e.evolve(p.uid);
   let goal=s.pickups.filter(p=>Math.hypot(p.x-s.trainer.x,p.y-s.trainer.y)<240).sort((a,b)=>Math.hypot(a.x-s.trainer.x,a.y-s.trainer.y)-Math.hypot(b.x-s.trainer.x,b.y-s.trainer.y))[0]??{x:origin.x+Math.cos(s.time*.5)*90,y:origin.y+Math.sin(s.time*.5)*90};
   let best=-Infinity,input={x:0,y:0,dash:false};
   for(let i=0;i<16;i++){
    const a=i*Math.PI/8,dx=Math.cos(a),dy=Math.sin(a),p={x:s.trainer.x+dx*45,y:s.trainer.y+dy*45};
    if(!clearWorldPoint(s,p,12)||Math.hypot(p.x-origin.x,p.y-origin.y)>Math.min(origin.radius,450)-30)continue;
    let score=-Math.hypot(p.x-goal.x,p.y-goal.y)*.3;
    for(const foe of s.enemies)if(foe.hp>0){const d=Math.hypot(foe.x-p.x,foe.y-p.y);if(d<90)score-=(90-d)*3;}
    for(const h of s.hazards)if(!h.fired&&e.inHazard(p,h))score-=600;
    if(score>best){best=score;input={x:dx,y:dy,dash:s.enemies.some(f=>f.hp>0&&Math.hypot(f.x-s.trainer.x,f.y-s.trainer.y)<40)};}
   }
   e.step(1/30,input);e.soundEvents.length=0;
  }
  stages.push({id:q.id,won:s.story.done.includes(q.id),seconds:Math.round(s.time-start),hp:Math.round(s.trainer.hp),level:s.level,party:s.party.map(p=>SPECIES[p.species].name)});
  validateState(s);
  if(!s.story.done.includes(q.id))break;
  if(s.outcome==='win'){s.outcome=null;s.screen='play';s.bossDead=false;}
  if(s.screen==='level')e.choose(0);
  const catchable=s.encounters.find(c=>c.id==='story-catch:'+q.id);
  if(catchable){Object.assign(s.trainer,{x:catchable.x,y:catchable.y});s.screen='play';e.interact();if(s.screen==='capture')e.capture(s.party.length>=6?s.party[s.party.length-1].uid:undefined);}
  if(s.active.length<activeCapacity(s)&&s.party.length>s.active.length)e.setActive(s.party.slice(0,activeCapacity(s)).map(p=>p.uid));
 }
 results.push({starter,completed:s.story.done.length,outcome:s.outcome,stages});
}
writeFileSync(process.env.PROBE_OUTPUT??'qa/story-balance.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({starter:r.starter,completed:r.completed,outcome:r.outcome,last:r.stages.at(-1)})),null,2));
