import {clearWorldPoint} from '../src/world.ts';
import {CRATES,type QuestId} from '../src/quests.ts';
// Headless balance probe: uses ordinary input and decisions, never grants HP, XP or damage.
import {Engine,newRun,activeCapacity} from '../src/engine.ts';
import {POIS,OBSTACLES,SPECIES} from '../src/data.ts';
import {validateState} from '../src/save.ts';
export function probe(starter:number,mode:'learn'|'normal',seed:number){
 const engine=new Engine(newRun(starter,mode,seed)),s=engine.s;
 let input={x:0,y:0,dash:false},frames=0,peak=0;
 const milestones:unknown[]=[];
 const distance=(p:{x:number;y:number},q=s.trainer)=>Math.hypot(p.x-q.x,p.y-q.y);
 while(!s.outcome&&frames++<42000){
  if(s.screen==='quest')engine.startQuest(s.pendingId as QuestId);
  if(s.screen==='level'){
   const order=s.choices.map((c,i)=>({i,score:c.kind==='evolve'?100:c.kind==='rank'?50+(s.active.includes(c.uid!)?20:0):c.id==='tempo'?45:c.id==='magnet'?40:10})).sort((a,b)=>b.score-a.score);
   engine.choose(order[0].i);
  }
  if(s.screen==='capture'&&!engine.capture(s.party[5]?.uid)){s.screen='play';s.pendingId=null;}
  if(s.screen==='reward')engine.claimReward(s.trainer.hp<65?'heal':'stone','thunder');
  if(s.screen==='merchant'||s.screen==='treasure'){s.screen='play';s.pendingId=null;}
  if(frames%6===0){
   for(const p of s.party)if(!engine.evolutionReason(p.uid))engine.evolve(p.uid);
   if(s.active.length<activeCapacity(s)&&s.party.length>s.active.length&&s.time>=s.swapReady){
    const ids=s.party.slice(0,activeCapacity(s)).map(p=>p.uid);engine.setActive(ids);
   }
   if(!s.encounters.some(e=>e.ready&&!e.claimed&&distance(e)<100)||s.balls>0)engine.interact();
   const boss=s.enemies.find(e=>e.kind==='boss');
   let target:{x:number;y:number}=POIS.find(p=>!s.completed.includes(p.id))??{x:1536+Math.cos(s.time*.04)*350,y:1536+Math.sin(s.time*.04)*350};
   const cq=s.quests.camp;if(cq.started&&!cq.ready){target=CRATES.find((_,i)=>!cq.collected.includes(i))??target;}
   const ready=s.balls>0?s.encounters.find(e=>e.ready&&!e.claimed):null;
   const pickup=s.pickups.filter(p=>distance(p)<350).sort((a,b)=>(distance(a)-(a.kind==='heal'&&s.trainer.hp<80?200:0))-(distance(b)-(b.kind==='heal'&&s.trainer.hp<80?200:0)))[0];
   if(pickup)target=pickup;
   if(ready)target=ready;
   if(boss){const a=Math.atan2(s.trainer.y-boss.y,s.trainer.x-boss.x)+.7;target={x:boss.x+Math.cos(a)*170,y:boss.y+Math.sin(a)*170};s.focus=boss.uid;}
   let best=-Infinity;
   for(let i=0;i<16;i++){
    const a=i*Math.PI/8,x=Math.cos(a),y=Math.sin(a),future={x:s.trainer.x+x*65,y:s.trainer.y+y*65};
    let score=-distance(future,target)*.55;
    for(const enemy of s.enemies){const d=distance(enemy,future);if(d<100)score-=Math.max(0,100-d)*(enemy.kind==='boss'?3:1.7);}
    for(const h of s.hazards)if(!h.fired&&engine.inHazard(future,h))score-=300;
    for(const o of OBSTACLES)if(distance(o,future)<o.r+20)score-=500;
    if(!clearWorldPoint(s,future,18))score-=1000;
    if(score>best){best=score;input={x,y,dash:s.enemies.some(e=>distance(e)<55)};}
   }
  }
  engine.step(1/30,s.quests.camp.channel!==null?{x:0,y:0}:input);input.dash=false;engine.soundEvents.length=0;peak=Math.max(peak,s.enemies.length);
  if(frames%1800===0){validateState(s);milestones.push({time:Math.round(s.time),hp:Math.round(s.trainer.hp),level:s.level,kills:s.kills,party:s.party.map(p=>p.species)});}
 }
 validateState(s);
 return {starter,mode,seed,outcome:s.outcome,time:Math.round(s.time),level:s.level,hp:Math.round(s.trainer.hp),kills:s.kills,party:s.party.map(p=>SPECIES[p.species].name),completed:s.completed,damage:s.damageDone,screen:s.screen,bossHP:s.enemies.find(e=>e.kind==='boss')?.hp,peak,milestones};
}
if(process.argv[1]?.endsWith('run-probe.ts')){
 const mode=process.argv.includes('--normal')?'normal':'learn';
 for(const starter of [1,4,7])console.log(JSON.stringify(probe(starter,mode,123)));
}
