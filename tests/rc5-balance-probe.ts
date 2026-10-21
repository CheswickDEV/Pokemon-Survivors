import {writeFileSync} from 'node:fs';
import {brockFixture} from './rc5-fixtures.ts';
import {clearWorldPoint} from '../src/world.ts';
import {activeRoom} from '../src/interior-layout.ts';
import {validateState} from '../src/save.ts';
import type {Difficulty} from '../src/difficulty.ts';
const results=[];
for(const difficulty of ['standard','veteran','master'] as Difficulty[])for(const rank of [4,8])for(const moving of [false,true]){
 const e=brockFixture(difficulty,rank),s=e.s,room=activeRoom(s)!;
 const phases=new Set<string>();let maxHazards=0,damageTaken=0,previousHp=100;
 for(let frame=0;frame<60*420&&!s.outcome&&!s.story.done.includes('brock');frame++){
  if(s.screen==='level')e.choose(s.choices.findIndex(c=>c.kind==='rank')>=0?s.choices.findIndex(c=>c.kind==='rank'):0);
  let input={x:0,y:0,dash:false};
  if(moving){
   let best=-Infinity;
   const boss=s.enemies.find(f=>f.storyLeader&&f.hp>0),target=boss??room.origin;
   const danger=s.hazards.filter(h=>!h.fired&&h.warnUntil-s.time<1.5);
   for(let i=0;i<24;i++){
    const a=i*Math.PI/12,dx=Math.cos(a),dy=Math.sin(a);
    const next={x:s.trainer.x+dx*50,y:s.trainer.y+dy*50};if(!clearWorldPoint(s,next,14))continue;
    let score=-Math.abs(Math.hypot(next.x-target.x,next.y-target.y)-150)*.12;
    score-=Math.hypot(next.x-room.origin.x,next.y-room.origin.y)*.008;
    for(const foe of s.enemies)if(foe.hp>0){const d=Math.hypot(foe.x-next.x,foe.y-next.y);if(d<85)score-=(85-d)*3;}
    for(const h of danger)if(e.inHazard(next,h))score-=900/(.2+Math.max(0,h.warnUntil-s.time));
    score+=Math.cos(a-s.time*.7)*.5;
    if(score>best){best=score;input={x:dx,y:dy,dash:danger.some(h=>h.warnUntil-s.time<.22&&e.inHazard(s.trainer,h))};}
   }
  }
  e.step(1/60,input);e.soundEvents.length=0;
  damageTaken+=Math.max(0,previousHp-s.trainer.hp);previousHp=s.trainer.hp;
  for(const b of s.enemies)if(b.storyLeader)phases.add(b.species+':'+(b.bossPhase??0));
  maxHazards=Math.max(maxHazards,s.hazards.length);
 }
 validateState(s);
 results.push({difficulty,rank,moving,won:s.story.done.includes('brock'),seconds:Math.round(s.time),hp:s.trainer.hp,damageTaken,damageDone:Math.round(s.damageDone),phases:[...phases],maxHazards,remaining:s.enemies.filter(e=>e.storyLeader).map(e=>({id:e.species,hp:Math.round(e.hp),max:e.maxHp}))});
}
writeFileSync('qa/rc5-brock-balance.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
