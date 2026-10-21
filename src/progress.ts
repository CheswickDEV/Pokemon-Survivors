import {BOSSES} from './bosses.ts';
import {SPECIES,PASSIVES} from './data.ts';
import type {Profile} from './save.ts';
import type {RunState} from './engine.ts';
export interface Journal {bosses:number[];quests:string[];evolutions:number[];stages:string[];clears:string[]}
export const newJournal=():Journal=>({bosses:[],quests:[],evolutions:[],stages:[],clears:[]});
export function recordProgress(p:Profile,s:RunState){
 const j=p.journal;let changed=false;
 for(const id of s.shinyCaught??[])if(!p.shinies.includes(id)){p.shinies.push(id);changed=true;}
 const merge=<T>(key:keyof Journal,values:T[])=>{
  const current=j[key] as T[];for(const v of values)if(!current.includes(v)){current.push(v);changed=true;}
 };
 merge('bosses',s.clearedBosses);merge('quests',s.completed);merge('evolutions',s.evolved);merge('stages',s.story.done);
 if(s.outcome==='win')merge('clears',[s.mode+':'+s.difficulty]);
 return changed;
}
export function journalMarkup(p:Profile){
 const j=p.journal,bosses=BOSSES.filter(b=>j.bosses.includes(b.species)).length;
 const awards=[
  ['Erste Partner','10 Arten registrieren',p.caught.length,10],
  ['Kanto-Forscher','50 Arten registrieren',p.caught.length,50],
  ['Lebender Pokédex','Alle 151 Arten registrieren',p.caught.length,151],
  ['Waldhelfer','Alle drei Waldaufträge abschließen',j.quests.length,3],
  ['Wachsendes Team','Zehn verschiedene Entwicklungen erleben',j.evolutions.length,10],
  ['Bosskenner','Alle 15 besonderen Bossarten besiegen',bosses,15],
  ['Kanto-Champion','Die Pokémon-Liga gewinnen',j.stages.includes('champion')?1:0,1],
  ['Letztes Geheimnis','Mewtu in der Azuria-Höhle bezwingen',j.stages.includes('mewtwo')?1:0,1],
  ['Prüfungsmeister','Einen Bossansturm abschließen',j.clears.some(x=>x.startsWith('bossrush:'))?1:0,1],
  ['Veteran','Einen Lauf auf Veteran oder Meister gewinnen',j.clears.some(x=>/:veteran$|:master$/.test(x))?1:0,1]
 ] as const;
 return `<p class="muted">Abzeichen halten deine Leistungen dauerhaft fest. Siege aus älteren Versionen erhalten nachträglich keine erfundene Schwierigkeit. Deine Sammlung bleibt erhalten.</p>
 <div class="achievement-grid">${awards.map(([name,text,count,goal])=>`<article class="achievement ${count>=goal?'earned':''}"><span>${count>=goal?'✦':'◇'}</span><h3>${name}</h3><p>${text}</p><progress max="${goal}" value="${Math.min(count,goal)}"></progress><small>${Math.min(count,goal)} / ${goal}${count>=goal?' · Abzeichen erhalten':''}</small></article>`).join('')}</div>
 <h3>Bossbuch · ${bosses} / ${BOSSES.length}</h3><div class="boss-catalog">${BOSSES.map(b=>`<article class="${j.bosses.includes(b.species)?'defeated':''}"><b>${j.bosses.includes(b.species)?'✓':'◇'} ${SPECIES[b.species].name}</b><small>${b.title}</small><p>${b.hint}</p></article>`).join('')}</div>
 <h3>Ausrüstungslexikon · ${PASSIVES.length} Gegenstände</h3><div class="boss-catalog">${PASSIVES.map(p=>`<article><b>${p.icon} ${p.name}</b><p>Rang 1: ${p.description(1)}<br>Rang 5: ${p.description(5)}</p></article>`).join('')}</div><p class="muted">Sechs Ausrüstungsplätze pro Lauf. Keine permanenten Stärke-Upgrades: Ein neuer Lauf beginnt unter denselben Regeln.</p>`;
}
