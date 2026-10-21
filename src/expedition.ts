import {difficulty} from './difficulty.ts';
import {activeEliteCount,forestEliteLimit} from './forest-balance.ts';
import {BOSSES} from './bosses.ts';
import type {Engine,Enemy,RunState} from './engine.ts';
import {SPECIES} from './data.ts';
import {nearbySites,kantoLocationAt,worldPoint} from './world.ts';
export function dropTreasure(e:Engine,foe:Enemy){
 const s=e.s,roll=e.random(),quality=roll<.02?5:roll<.15?3:1;
 s.world.treasures.push({id:'chest:'+foe.uid,x:foe.x,y:foe.y,opened:false,quality,evolution:s.time>=600||s.mode==='story'&&s.story.done.length>=8});
 e.fx('quest',foe,0xffd376,50,1,{label:'Truhe erschienen'});
}
export function openTreasure(e:Engine){
 const s=e.s,chest=s.world.treasures.find(t=>!t.opened&&Math.hypot(t.x-s.trainer.x,t.y-s.trainer.y)<80);if(!chest)return false;
 chest.opened=true;const results:string[]=[];const coins=Math.round(25*chest.quality*difficulty(s).reward);s.coins+=coins;s.balls++;results.push(`+${coins} Münzen`, '+1 Pokéball');
 for(let i=0;i<chest.quality;i++){
  const evo=chest.evolution&&s.party.find(p=>SPECIES[p.species].evolutions.some(ev=>!e.evolutionReason(p.uid,ev.to)));
  if(evo){const target=SPECIES[evo.species].evolutions.find(ev=>!e.evolutionReason(evo.uid,ev.to))!;e.evolve(evo.uid,target.to);results.push(SPECIES[target.to].name+' entwickelt');continue;}
  const candidates=s.party.filter(p=>p.ranks[0]<8),active=candidates.filter(p=>s.active.includes(p.uid)),train=active.length?active:candidates;
  if(train.length){const p=train[Math.floor(e.random()*train.length)];p.ranks[0]++;p.points++;results.push(SPECIES[p.species].name+' · Rang '+(p.ranks[0]-1)+' → '+p.ranks[0]+' · '+SPECIES[p.species].weapon.rankNotes[p.ranks[0]-1]);}
  else{s.coins+=40;results.push('+40 Münzen · Training vollständig');}
 }
 s.world.lastTreasure=results;s.screen='treasure';s.pendingId=null;e.soundEvents.push('reward');e.fx('quest',chest,0xffe477,100,1.5,{label:'Schatz geöffnet'});return true;
}
export function expeditionEvents(e:Engine){
 const s=e.s,w=s.world;if(s.interior||s.mode==='bossrush')return;
 if(s.mode==='story'){
  const wave=Math.floor(s.time/45);
  if(wave>w.encounterWave&&!s.story.active){w.encounterWave=wave;const pool=kantoLocationAt(s.trainer).encounters;const species=pool[Math.floor(e.random()*pool.length)]??19;if(pool.length&&s.encounters.filter(c=>!c.claimed).length<8)e.addEncounter(species,'regional:'+wave);}
 }else{
  const wave=Math.floor(s.time/90);
  if(wave>w.eliteWave&&!s.bossSpawned&&activeEliteCount(s)<forestEliteLimit(s)){w.eliteWave=wave;e.addEnemy(BOSSES[(wave-1)%BOSSES.length].species,'elite');e.notify('Ein starker Gegner nähert sich · besiege ihn für eine Truhe.');}
  const phase=Math.floor(s.time/60);
  if(phase>w.encounterWave&&!s.bossSpawned){
   w.encounterWave=phase;
   if(phase%5===0||phase%3===2){
    const flowers=phase%5===0,count=flowers?16:12;
    for(let i=0;i<count;i++){const a=i/count*Math.PI*2,p={x:s.trainer.x+Math.cos(a)*380,y:s.trainer.y+Math.sin(a)*380},f=e.addEnemy(flowers?43:41,'wild',p);f.speed=(flowers?25:105)*difficulty(s).speed;}
    e.notify(flowers?'Ein Blütenring zieht sich zusammen · suche eine Lücke!':'Zubat-Schwarm · bleib in Bewegung!');
   }
   if(s.mode==='endless'&&phase>=20&&phase%2===0&&s.encounters.filter(c=>!c.claimed).length<8)e.addEncounter(1+Math.floor(e.random()*151),'endless:'+phase);
  }
  for(const site of nearbySites(s.seed,s.trainer))if(Math.hypot(site.x-s.trainer.x,site.y-s.trainer.y)<340&&!w.sites.includes(site.id)&&!s.bossSpawned&&activeEliteCount(s)<forestEliteLimit(s)){
   w.sites.push(site.id);const foe=e.addEnemy(site.species,'elite',worldPoint(s,site));foe.siteId=site.id;foe.hp=foe.maxHp=(250+Math.min(600,s.level*12))*difficulty(s).hp;e.notify('Seltene Lichtung · '+SPECIES[site.species].name+' bewacht einen Schatz!');
  }
 }
 // Offscreen ambient mobs are replaced, never counted as kills or quest victories.
 s.enemies=s.enemies.filter(f=>f.kind!=='wild'||f.questId||f.storyId||Math.hypot(f.x-s.trainer.x,f.y-s.trainer.y)<1300);
 s.encounters=s.encounters.filter(c=>!c.claimed||Math.hypot(c.x-s.trainer.x,c.y-s.trainer.y)<700);
 // Claimed chest IDs cannot reappear because enemy/site issuance is separately persisted.
 w.treasures=w.treasures.filter(t=>!t.opened||Math.hypot(t.x-s.trainer.x,t.y-s.trainer.y)<700);
 const distant=s.pickups.filter(p=>p.kind==='xp'&&Math.hypot(p.x-s.trainer.x,p.y-s.trainer.y)>1500);
 if(distant.length>20){const total=distant.reduce((sum,p)=>sum+p.value,0),ids=new Set(distant.map(p=>p.uid));const kept=distant[0];kept.value=total;s.pickups=s.pickups.filter(p=>!ids.has(p.uid));s.pickups.push(kept);}
}
