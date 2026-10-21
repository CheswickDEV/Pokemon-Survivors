import {BOONS} from './boons.ts';
import {SPECIES,TYPE_NAME,TYPE_COLOR,PASSIVES} from './data.ts';
import type {Element} from './data.ts';
import {knownMoves} from './engine.ts';
import type {RunState,Partner,Choice} from './engine.ts';
import {attackStats,attackDescription,numberText as n,evolutionMultiplier} from './combat.ts';
import {POKEMON_MOTION} from './pokemon-motion.ts';
import {POKEMON_SHINY} from './pokemon-shiny.ts';
import {partnerXpNeeded,PARTNER_MAX_LEVEL} from './partner-progress.ts';
import {partnerLevelCap,battleLevel} from './badge-progress.ts';
import {rarityOf,upgradeRanks} from './reward-rarity.ts';
export const escapeHtml=(value:unknown)=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]!));
export const pokemonImage=(id:number,cls='',_animated=false,shiny=false)=>`<img class="pokemon-image ${cls} ${shiny?'shiny-portrait':''}" src="${(shiny?POKEMON_SHINY:POKEMON_MOTION)[id]?.portrait}" alt="${shiny?'Shiny ':''}${SPECIES[id]?.name??'Pokémon'}">`;
export const pips=(rank:number,max=5)=>`<span class="rank-pips" aria-label="Rang ${rank} von ${max}">${Array.from({length:max},(_,i)=>`<i class="${i<rank?'lit':''}"></i>`).join('')}</span>`;
const typeColor=(type:Element)=>'#'+TYPE_COLOR[type].toString(16).padStart(6,'0');
export const typeChip=(type:Element)=>`<span class="type-chip type-${type}" style="--type:${typeColor(type)}">${TYPE_NAME[type]}</span>`;
export function moveCard(s:RunState,p:Partner,_slot=0,_locked=false){
 const a=attackStats(s,p),d=attackDescription(s,p);
 return `<div class="move-option equipped signature-card"><span class="move-top">${typeChip(a.move.type)}<span>Charakteristische Attacke</span></span><span class="move-title"><b>${a.move.name}</b><span>Rang ${a.rank}/8</span></span>${pips(a.rank,8)}<p>${a.move.description}</p><span class="move-stats">${d.details.map(text=>'<span>'+text+'</span>').join('')}</span><span class="move-description">${d.shape}. ${d.status}</span><details class="rank-path"><summary>Alle acht Ausbaustufen</summary><ol>${a.move.rankNotes.map((note,i)=>`<li class="${i<a.rank?'learned':''}"><b>R${i+1}</b> ${note}</li>`).join('')}</ol></details></div>`;
}
export function partnerHud(s:RunState,p:Partner){
 const sp=SPECIES[p.species],recover=p.recoveryUntil>s.time;
 return `<div class="partner-pill ${recover?'recovering':''}"><header>${pokemonImage(p.species,'',false,!!p.shiny)}<div><b>${p.shiny?'✦ ':''}${sp.name}</b><small>${recover?'Erholung '+Math.ceil(p.recoveryUntil-s.time)+' s':sp.weapon.name+' · '+p.points+' Training'}</small></div><span class="active-light"></span></header>
 ${partnerExperience(p,true,s)}
 <div class="stamina-line"><span>AUSDAUER</span><div class="bar"><i style="width:${p.stamina}%"></i></div></div>
 <div class="active-moves">${p.equipped.filter(slot=>slot<knownMoves(s)).map(slot=>{
  const a=attackStats(s,p,slot),remaining=Math.max(0,p.nextFire[slot]-s.time),fill=100-Math.min(100,remaining/a.interval*100);
  return `<div class="mini-move" title="${a.move.name+' · '+attackDescription(s,p,slot).details.join(' · ')}"><div><span class="move-dot" style="background:${typeColor(a.move.type)}"></span><b>${a.move.name}</b><span class="mini-rank">R${a.rank}/8</span></div><div class="bar attack-cd"><i style="width:${fill}%;background:${typeColor(a.move.type)}"></i></div></div>`;
 }).join('')}</div></div>`;
}
export function partnerExperience(p:Partner,compact=false,s?:RunState){
 const cap=s?partnerLevelCap(s):PARTNER_MAX_LEVEL,max=p.level>=cap,need=partnerXpNeeded(p.level),effective=s?battleLevel(s,p):p.level;
 return `<div class="partner-experience ${compact?'compact':''}"><div><b>Pokémon · Lv. ${p.level}${effective<p.level?' · wirksam '+effective:''}</b><span>${max?(cap<100?'ORDENLIMIT '+cap:'MAX'):n(p.xp)+' / '+need+' EP'}</span></div><div class="bar personal-xp"><i style="width:${max?100:p.xp/need*100}%"></i></div>${compact?'':'<small>Eigene Kampf-EP · '+(cap<100?'Levelgrenze '+cap+' · der nächste Orden erlaubt weiteres Training.':'Nur aktive, einsatzfähige Partner lernen.')+'</small>'}</div>`;
}
export function upgradeBody(s:RunState,c:Choice){
 if(c.kind==='boon'){
  const b=BOONS.find(b=>b.id===c.id);if(!b)return '';
  return `<div class="item-symbol">${b.icon}</div><span class="type-chip evolve-chip">Neuer Spieleffekt</span><h3>${b.name}</h3><div class="stat-up"><small>Auslöser</small><strong>${b.trigger}</strong></div><p>${b.description}</p><small class="upgrade-note">${c.replaceBoon?'Ersetzt '+BOONS.find(b=>b.id===c.replaceBoon)!.name:'Belegt einen Talentplatz · '+(s.boons?.length??0)+'/3 belegt'} · für diesen Lauf · keine Rangstufen</small>`;
 }
 if(c.kind==='rank'){
  const p=s.party.find(p=>p.uid===c.uid);if(!p)return '<b>Partner nicht verfügbar</b>';
  const before=attackStats(s,p),after=attackStats(s,p,0,p.ranks[0]+upgradeRanks(c,p.ranks[0],8));
  return `<div class="choice-owner">${pokemonImage(p.species,'',false,!!p.shiny)}<span>${SPECIES[p.species].name}<small>Einzigartige Attacke aufwerten</small></span></div>${typeChip(before.move.type)}<h3>${before.move.name}</h3><div class="rank-up">Rang ${before.rank} <span>→</span> <strong>${after.rank}/8</strong>${pips(after.rank,8)}</div><div class="stat-up"><small>Schaden je Treffer</small><div>${n(before.power)} → <strong>${n(after.power)}</strong></div></div><div class="stat-up"><small>Abklingzeit</small><div>${n(before.interval,2)} s → <strong>${n(after.interval,2)} s</strong></div></div><p>${before.move.rankNotes[after.rank-1]}</p><small class="upgrade-note">${attackDescription(s,p,0,after.rank).details.slice(2).join(' · ')}<br>Bleibt bei Entwicklung und Teamwechsel erhalten.</small>`;
 }
 if(c.kind==='evolve'){
  const p=s.party.find(p=>p.uid===c.uid);if(!p)return '';
  const target=c.target??SPECIES[p.species].evolves!.to,improvement=Math.round((evolutionMultiplier(target)/evolutionMultiplier(p.species)-1)*100);
  return `<div class="evolution-pair">${pokemonImage(p.species,'',true,!!p.shiny)}<span>→</span>${pokemonImage(target,'',true,!!p.shiny)}</div><span class="type-chip evolve-chip">Entwicklung</span><h3>${SPECIES[target].name}</h3><p>${SPECIES[p.species].name} entwickelt sich.</p><div class="stat-up"><small>Angriffswirkung</small><strong>+${improvement} %</strong></div><small class="upgrade-note">Training und Angriffsrang bleiben erhalten. Die Figur bleibt gleich groß.</small>`;
 }
 if(c.kind==='passive'){
  const pass=PASSIVES.find(p=>p.id===c.id)!,rank=s.passives[pass.id]??0,next=rank+upgradeRanks(c,rank,5);
  return `<div class="item-symbol">${pass.icon}</div><span class="type-chip item-chip">Team-Ausrüstung</span><h3>${pass.name}</h3><div class="rank-up">Rang ${rank} <span>→</span><strong>${next}</strong>${pips(next)}</div><div class="passive-compare"><small>Bisher</small><p>${rank?pass.description(rank):'Noch nicht ausgerüstet'}</p><small>Nach Verbesserung</small><strong>${pass.description(next)}</strong></div><small class="upgrade-note">Wirkt auf das ganze Team. Maximal sechs Gegenstände.</small>`;
 }
 return '<div class="item-symbol">✚</div><h3>Verschnaufpause</h3><div class="stat-up"><strong>+'+5*rarityOf(c).ranks+' KP</strong></div><p>Füllt Trainerleben auf.</p>';
}
