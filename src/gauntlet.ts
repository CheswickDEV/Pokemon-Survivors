import type {Engine} from './engine.ts';
import {BOSSES} from './bosses.ts';
import {difficulty} from './difficulty.ts';
import {xpNeeded} from './engine.ts';
export function updateGauntlet(e:Engine){
 const s=e.s;if(s.mode!=='bossrush')return;
 const g=s.gauntlet;
 if(s.bossDead){
  s.bossDead=false;s.bossSpawned=false;g.round++;s.enemies=s.enemies.filter(f=>f.kind!=='guardian');s.hazards=[];s.shots=[];s.fields=[];
  if(g.round>=BOSSES.length){e.finish('win');return;}
  s.coins+=Math.round(40*difficulty(s).reward);
  s.xp+=xpNeeded(s.level);
  s.party.forEach(p=>{p.stamina=Math.min(100,p.stamina+25);p.recoveryUntil=0;});
  g.nextAt=s.time+6;g.deadline=0;
  e.notify('Prüfung '+g.round+'/'+BOSSES.length+' geschafft · Verbesserung wählen · Nächster Gegner in 6 Sekunden.');
 }
 if(s.bossSpawned&&s.time>=g.deadline){e.finish('timeout');return;}
 if(!s.bossSpawned&&s.time>=g.nextAt){
  const boss=BOSSES[g.round],foe=e.addEnemy(boss.species,'boss',{x:s.trainer.x+220,y:s.trainer.y-100});
  foe.hp=foe.maxHp=(780+g.round*205)*difficulty(s).hp*(s.difficulty==='master'?8:s.difficulty==='veteran'?3:1);
  s.bossSpawned=true;g.deadline=s.time+(s.difficulty==='master'?420:s.difficulty==='veteran'?240:120);
  e.banner('trial:'+g.round,'info',`${g.round+1}/${BOSSES.length} · ${boss.title}`,boss.hint);
  e.soundEvents.push('boss');
 }
}
