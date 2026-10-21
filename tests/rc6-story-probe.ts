import {writeFileSync} from 'node:fs';
import {Engine,newRun} from '../src/engine.ts';
import type {Hazard,Point,RunState} from '../src/engine.ts';
import {KANTO_STORY,KANTO_LOCATIONS} from '../src/kanto-world-catalog.ts';
import {partnerLevelCap} from '../src/badge-progress.ts';
import {clearWorldPoint} from '../src/world.ts';
import {activeRoom} from '../src/interior-layout.ts';
import {decodeEnvelope,envelope,validateState} from '../src/save.ts';
import {approachStage} from './story-helpers.ts';
import {attackStats} from '../src/combat.ts';
import {SPECIES} from '../src/data.ts';
import type {Difficulty} from '../src/difficulty.ts';
import {pathToFileURL} from 'node:url';
export function stageFixture(index:number,starter=1,loadout='reference',difficulty:Difficulty='master'){
 const e=new Engine(newRun(starter,'story',617+starter,'red',null,difficulty)),s=e.s;
 const q=KANTO_STORY[index],before=KANTO_STORY.slice(0,index);
 s.story.done=before.map(q=>q.id);s.story.unlocks=[...new Set(before.flatMap(q=>q.rewardUnlocks))];
 const level=index<2?3+index*3:partnerLevelCap(s),ids=index<2?[starter]:[starter,...[1,4,7].filter(id=>id!==starter)];
 s.level=index<2?2+index*2:16+index;
 s.party=ids.map(id=>{
  const p=newRun(id,'story').party[0];p.uid=s.nextId++;p.level=level;p.ranks=[index<2?2+index:index===2?6:8];
  p.points=p.ranks[0]-1;
  if(index>=2){p.species=id+1;if(level>=36)p.species=id+2;}
  return p;
 });
 s.active=s.party.map(p=>p.uid);s.caught=s.party.map(p=>p.species);
 if(index>=3){const rank=Math.min(5,2+Math.floor(index/5));s.passives={power:rank,tempo:rank,armor:rank,crit:rank,speed:rank,magnet:rank};}
 if(loadout==='talents'){s.boons=['echo','resonance','chorus'];}
 approachStage(e,q);s.screen='play';e.interact();
 if(!e.startStory(q.id))throw Error('Cannot start '+q.id);
 return e;
}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
function clearance(p:Point,h:Hazard){
 const dx=p.x-h.x,dy=p.y-h.y,d=Math.hypot(dx,dy);
 if(h.shape==='circle')return d-h.r-9;
 if(h.shape==='ring')return Math.abs(d-h.r)-h.width-9;
 const along=dx*Math.cos(h.angle)+dy*Math.sin(h.angle),across=Math.abs(-dx*Math.sin(h.angle)+dy*Math.cos(h.angle));
 return Math.max(-along-9,along-h.r-9,across-h.width-9);
}
export function dodgeInput(e:Engine){
 const s=e.s,t=s.trainer,q=KANTO_STORY.find(q=>q.id===s.story.active),center=activeRoom(s)?.origin??KANTO_LOCATIONS.find(l=>l.id===q?.locationId)??t;
 const boss=s.enemies.find(f=>f.hp>0&&f.storyLeader),target=boss??s.enemies.find(f=>f.hp>0)??center;
 const danger=s.hazards.filter(h=>!h.fired&&s.time-h.createdAt>=.12&&h.warnUntil-s.time<2);
 const imminent=danger.some(h=>h.warnUntil-s.time<.19&&e.inHazard(t,h));
 let best=-Infinity,input={x:0,y:0,dash:false};
 for(let i=-1;i<32;i++){
  const a=i*Math.PI/16,dx=i<0?0:Math.cos(a),dy=i<0?0:Math.sin(a);
  const speed=140*(1+Math.min(.35,(s.passives.speed??0)*.04));
  const next={x:t.x+dx*speed*.36,y:t.y+dy*speed*.36};
  if(!clearWorldPoint(s,next,14))continue;
  let score=-Math.abs(distance(next,target)-155)*.09-distance(next,center)*.006;
  for(const f of s.enemies)if(f.hp>0){const d=distance(next,f);if(d<f.r+64)score-=(f.r+64-d)*4;}
  for(const h of danger){
   const remain=h.warnUntil-s.time;
   const forecast={x:t.x+dx*speed*Math.min(.65,Math.max(.12,remain)),y:t.y+dy*speed*Math.min(.65,Math.max(.12,remain))};
   const margin=clearance(forecast,h);
   if(margin<10)score-=(500+Math.max(0,20-margin)*4)/(.3+remain);
  }
  score+=Math.cos(a-s.time*.65)*.2;
  if(score>best){best=score;input={x:dx,y:dy,dash:imminent};}
 }
 return input;
}
export function runStage(index:number,starter=1,moving=true,loadout='reference',difficulty:Difficulty='master',startHp=100,prepared?:Engine,onEnd?:(state:RunState)=>void){
 let e=prepared??stageFixture(index,starter,loadout,difficulty);const id=KANTO_STORY[index].id;if(!prepared)e.s.trainer.hp=startHp;const started=e.s.time;
 const phases=new Set<string>();let damage=0,previous=e.s.trainer.hp,lowestStamina=100,exhaustions=0,saved=false,maxHazards=0,casts=0;
 let input={x:0,y:0,dash:false};
 for(let frame=0;frame<30*1200&&!e.s.outcome&&!e.s.story.done.includes(id);frame++){
  const s=e.s;
  if(s.screen==='level'){
   const scores=s.choices.map((c,i)=>({i,score:c.kind==='rank'?100:c.kind==='boon'?90:c.kind==='heal'&&s.trainer.hp<80?85:c.kind==='passive'?50:0}));
   e.choose(scores.sort((a,b)=>b.score-a.score)[0].i);
  }
  if(frame%3===0)input=moving?(loadout==='circle'?{x:Math.cos(s.time*.65),y:Math.sin(s.time*.65),dash:s.time>=s.trainer.dashReady}:dodgeInput(e)):{x:0,y:0,dash:false};
  e.step(1/30,input);input.dash=false;e.soundEvents=[];e.effects=[];
  damage+=Math.max(0,previous-s.trainer.hp);previous=s.trainer.hp;
  lowestStamina=Math.min(lowestStamina,...s.party.map(p=>p.stamina));
  if(s.party.some(p=>p.recoveryUntil>s.time))exhaustions++;
  for(const f of s.enemies)if(f.storyLeader){phases.add(f.species+':'+(f.bossPhase??0));casts=Math.max(casts,f.attackPhase??0);}
  maxHazards=Math.max(maxHazards,s.hazards.length);
  if(!saved&&s.time-started>12){e=new Engine(decodeEnvelope(envelope(s,1)));saved=true;}
 }
 const s=e.s;validateState(s);onEnd?.(s);
 return {id,starter,moving,loadout,difficulty,won:s.story.done.includes(id),seconds:Math.round(s.time-started),hp:s.trainer.hp,damageTaken:damage,lowestStamina:Math.round(lowestStamina),exhaustedSeconds:exhaustions/30,phases:phases.size,casts,maxHazards,saved,team:s.party.map(p=>({species:p.species,level:p.level,rank:p.ranks[0],power:Math.round(attackStats(s,p).power)})),remaining:s.enemies.filter(f=>f.storyLeader).map(f=>({species:f.species,hp:Math.round(f.hp),max:f.maxHp}))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const indices=(process.env.STAGES??KANTO_STORY.map((_,i)=>i).join(',')).split(',').map(Number),results=[];
 const starters=(process.env.STARTERS??'1').split(',').map(Number),health=new Map<number,number>();
 for(const index of indices)for(const starter of starters)for(const moving of (process.env.STATIONARY==='1'?[false,true]:[true])){
  const result=runStage(index,starter,moving,process.env.LOADOUT??'reference',(process.env.DIFFICULTY??'master') as Difficulty,process.env.CARRY_HP==='1'?(health.get(starter)??100):100);
  if(process.env.CARRY_HP==='1'){health.set(starter,result.hp);if(!result.won)throw Error('Campaign lost: '+JSON.stringify(result));}
  results.push(result);console.log(JSON.stringify(result));
  writeFileSync(process.env.PROBE_OUTPUT??'qa/rc6-story-master.json',JSON.stringify(results,null,2));
 }
}
