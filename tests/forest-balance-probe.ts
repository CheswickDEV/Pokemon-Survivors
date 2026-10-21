// Reproducible player simulation. Uses ordinary movement, menus and available resources.
// No grants of health, experience, ranks, damage, immunity or favorable encounter rosters.
import {Engine,newRun,activeCapacity,type Point} from '../src/engine.ts';
import {POIS,SPECIES} from '../src/data.ts';
import {CRATES,SEALS,type QuestId} from '../src/quests.ts';
import {obstaclesAt,obstacleDistance} from '../src/world.ts';
import {crossesObstacle} from '../src/navigation.ts';
import {validateState} from '../src/save.ts';
import type {Difficulty} from '../src/difficulty.ts';
import {writeFileSync} from 'node:fs';
export type Policy='prepared'|'wander'|'idle';
export function forestProbe(starter:number,mode:'learn'|'normal',seed:number,difficulty:Difficulty='standard',policy:Policy='prepared'){
 const e=new Engine(newRun(starter,mode,seed,'red',null,difficulty)),s=e.s,starterUid=s.party[0].uid;
 // Rendering has no part in simulation results.
 e.fx=()=>{};let damageTaken=0,hits=0,healed=0,peak=0,frames=0,stuck=0;
 const originalDamage=e.damageTrainer.bind(e),originalHeal=e.heal.bind(e);
 e.damageTrainer=(power,teamStress=false)=>{const before=s.trainer.hp;const hit=originalDamage(power,teamStress);const loss=before-s.trainer.hp;if(loss){hits++;damageTaken+=loss;}return hit;};
 e.heal=(n,bonus=true)=>{const before=s.trainer.hp;originalHeal(n,bonus);healed+=s.trainer.hp-before;};
 const distance=(p:Point,q:Point=s.trainer)=>Math.hypot(p.x-q.x,p.y-q.y);
 let input={x:0,y:0,dash:false},last={...s.trainer},destination:Point={...POIS[0]};
 const timeline:unknown[]=[];
 const baseFamily=(id:number)=>id<=9?Math.floor((id-1)/3):100+id;
 const scoreChoice=(c:typeof s.choices[number])=>{
  if(c.kind==='evolve')return s.active.includes(c.uid!)?140:5;
  if(c.kind==='rank')return s.active.includes(c.uid!)?95-(e.getPartner(c.uid!)!.ranks[0])*3:3;
  if(c.kind==='heal')return s.trainer.hp<40?85:0;
  const have=s.passives[c.id!]??0;
  return (c.id==='tempo'?78:c.id==='armor'?72:c.id==='magnet'?(have<2?82:44):c.id==='reach'?61:c.id==='speed'?60:c.id==='area'?59:30)-have*5;
 };
 while(!s.outcome&&frames++<43000){
  if(s.screen==='level'){const index=s.choices.map((c,i)=>({i,v:scoreChoice(c)})).sort((a,b)=>b.v-a.v)[0].i;e.choose(index);}
  if(s.screen==='quest')e.startQuest(s.pendingId as QuestId);
  if(s.screen==='capture'){
   const encounter=s.encounters.find(c=>c.id===s.pendingId);
   // Register duplicates of the starter's evolution line without obstructing its evolution.
   if(encounter&&baseFamily(encounter.species)===baseFamily(starter))e.capture(undefined,true);
   else if(!e.capture(s.party.find(p=>p.uid!==starterUid&&!s.active.includes(p.uid))?.uid)){s.screen='play';s.pendingId=null;}
  }
  if(s.screen==='reward'){
   const partner=e.activePartners().find(p=>p.ranks[0]<8);
   e.claimReward(s.trainer.hp<55?'heal':partner?'training':'passive',s.trainer.hp<55?undefined:partner?String(partner.uid):'armor');
  }
  if(s.screen==='merchant'){
   if(s.trainer.hp<50)e.buy('heal');
   for(const id of ['tempo','armor','magnet'])if((s.passives[id]??0)<3)e.buy('passive',id);
   if(s.balls<2)e.buy('ball');
   s.screen='play';s.pendingId=null;
  }
  if(s.screen==='treasure'){s.screen='play';s.pendingId=null;}
  if(frames%6===0){
   if(policy==='prepared'){
    for(const p of s.party)for(const ev of SPECIES[p.species].evolutions)if(!e.evolutionReason(p.uid,ev.to)){e.evolve(p.uid,ev.to);break;}
    if(s.time>=s.swapReady){
     const selected=s.party.filter(p=>p.recoveryUntil<=s.time).sort((a,b)=>
      (s.active.includes(b.uid)?100:0)+b.ranks[0]*5-(s.active.includes(a.uid)?100:0)-a.ranks[0]*5
     ).slice(0,activeCapacity(s)).map(p=>p.uid);
     if(selected.length&&selected.join()!==s.active.join())e.setActive(selected);
    }
    e.interact();
   }
   const boss=s.enemies.find(f=>f.kind==='boss'&&f.hp>0);
   const dangers=s.enemies.filter(f=>f.hp>0&&distance(f)<220);
   const nearestDanger=Math.min(...dangers.map(f=>distance(f)-f.r));
   const qid=(['camp','tree','garden'] as QuestId[]).find(id=>!s.completed.includes(id));
   if(qid){
    const q=s.quests[qid];destination=POIS.find(p=>p.id===qid)!;
    if(q.started&&!q.ready){
     if(qid==='camp')destination=CRATES.find((_,i)=>!q.collected.includes(i))??destination;
     if(qid==='tree')destination=s.enemies.find(f=>f.hp>0&&f.questId==='tree')??SEALS[0];
    }
   }else destination={x:1536+Math.cos(s.time*.018)*500,y:1536+Math.sin(s.time*.018)*500};
   const capturable=s.balls>0?s.encounters.filter(c=>c.ready&&!c.claimed).sort((a,b)=>distance(a)-distance(b))[0]:undefined;
   const trainingFoe=s.balls>0&&s.party.length<3?s.enemies.find(f=>f.kind==='encounter'&&f.hp>0):undefined;
   const chest=s.world.treasures.filter(t=>!t.opened).sort((a,b)=>distance(a)-distance(b))[0];
   const pickup=s.pickups.filter(p=>distance(p)<(s.level<8?220:150)).sort((a,b)=>
    distance(a)/(a.kind==='heal'&&s.trainer.hp<85?8:a.kind==='xp'?Math.sqrt(a.value):.4)-distance(b)/(b.kind==='heal'&&s.trainer.hp<85?8:b.kind==='xp'?Math.sqrt(b.value):.4)
   )[0];
   if(pickup&&(!s.quests[qid!]?.started||s.level<4||s.level<8&&distance(pickup)<100))destination=pickup;
   if(chest&&distance(chest)<600)destination=chest;
   if(trainingFoe)destination=trainingFoe;
   if(capturable&&distance(capturable)<800)destination=capturable;
   if(policy==='wander')destination={x:1536+Math.cos(s.time*.025)*450,y:1710+Math.sin(s.time*.025)*450};
   if(boss){const a=Math.atan2(s.trainer.y-boss.y,s.trainer.x-boss.x)+.6;destination={x:boss.x+Math.cos(a)*160,y:boss.y+Math.sin(a)*160};s.focus=boss.uid;}
   else s.focus=trainingFoe?.uid??null;
   const obstacles=obstaclesAt(s,s.trainer).map(o=>o.playerR?{...o,r:o.playerR,y:o.y+(o.playerYOffset??0)}:o);
   let best=-Infinity;const previous={...input};
   for(let i=0;i<17;i++){
    const angle=i*Math.PI/8,x=i===16?0:Math.cos(angle),y=i===16?0:Math.sin(angle);
    const future={x:s.trainer.x+x*48,y:s.trainer.y+y*48};
    let score=(distance(destination)-distance(future,destination))*.75;
    for(const f of dangers){
     const d=distance(f,future)-f.r;
     score-=Math.max(0,80-d)*2.5+Math.max(0,30-d)*5;
    }
    for(const h of s.hazards)if(!h.fired&&h.warnUntil-s.time<1.5&&e.inHazard(future,h))score-=250;
    if(obstacles.some(o=>crossesObstacle(s.trainer,future,o,13)))score-=500;
    if(obstacles.some(o=>obstacleDistance(future,o)<14))score-=500;
    if(stuck>4)score+=(x*previous.y-y*previous.x)*35;
    if(score>best){best=score;input={x,y,dash:nearestDanger<48||s.hazards.some(h=>!h.fired&&h.warnUntil-s.time<.35&&e.inHazard(s.trainer,h))};}
   }
   stuck=distance(last)<2&&Math.hypot(previous.x,previous.y)>0?stuck+1:0;last={...s.trainer};
   if(policy==='idle')input={x:0,y:0,dash:false};
  }
  e.step(1/30,s.quests.camp.channel!==null?{x:0,y:0}:input);input.dash=false;e.soundEvents.length=0;peak=Math.max(peak,s.enemies.length);
  if(frames%1800===0){validateState(s);timeline.push({t:Math.round(s.time),hp:Math.round(s.trainer.hp),level:s.level,party:s.party.map(p=>({id:p.species,level:p.level,rank:p.ranks[0]})),kills:s.kills,quests:[...s.completed]});}
 }
 validateState(s);
 return {starter,mode,seed,difficulty,policy,outcome:s.outcome??'simulation-limit',seconds:Math.round(s.time),hp:Math.round(s.trainer.hp),damageTaken,hits,healed:Math.round(healed),level:s.level,kills:s.kills,peak,quests:s.completed,party:s.party.map(p=>({species:p.species,level:p.level,rank:p.ranks[0]})),passives:s.passives,boss:s.enemies.find(f=>f.kind==='boss')?.species,timeline};
}
if(process.argv[1]?.endsWith('forest-balance-probe.ts')){
 const seeds=(process.env.PROBE_SEEDS??'123').split(',').map(Number),difficulties=(process.env.PROBE_DIFFICULTIES??'standard').split(',') as Difficulty[];
 const modes=(process.env.PROBE_MODES??'learn,normal').split(',') as ('learn'|'normal')[],policy=(process.env.PROBE_POLICY??'prepared') as Policy;
 const results=[];
 for(const difficulty of difficulties)for(const mode of modes)for(const seed of seeds)for(const starter of [1,4,7]){
  const result=forestProbe(starter,mode,seed,difficulty,policy);results.push(result);
  console.log(JSON.stringify({...result,timeline:undefined}));
  if(process.env.PROBE_OUTPUT)writeFileSync(process.env.PROBE_OUTPUT,JSON.stringify(results,null,2));
 }
}
