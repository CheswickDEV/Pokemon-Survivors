import {SPECIES,TYPE_NAME} from './data.ts';
import {battleLevel,badgePower} from './badge-progress.ts';
import type {RunState,Partner} from './engine.ts';
import type {WeaponPattern} from './signature-weapons.ts';
export const MAX_WEAPON_RANK=8;
export const evolutionMultiplier=(id:number)=>SPECIES[id].stage===0?1:SPECIES[id].evolutions.length?1.12:1.25;
export const PATTERN_NAME:Record<WeaponPattern,string>={shot:'Zielgeschoss',fan:'Fächersalve',burst:'Salve in Folge',beam:'Durchdringender Strahl',chain:'Sprungkette',orbit:'Umlaufende Geschosse',nova:'Nahbereichsstoß',cone:'Gerichteter Kegel',slash:'Nahkampfhieb',dash:'Gezielter Sprungangriff',boomerang:'Rückkehrendes Geschoss',mine:'Lauernde Falle',zone:'Anhaltendes Feld',drain:'Lebensentzug',charge:'Durchbrechender Ansturm',ricochet:'Abprallendes Geschoss'};
export function attackStats(s:RunState,p:Partner,_slot=0,requested=p.ranks[0]){
 const m=SPECIES[p.species].weapon,rank=Math.max(1,Math.min(MAX_WEAPON_RANK,requested)),bonus=(id:string)=>s.passives[id]??0;
 const milestones=[3,5,8].filter(r=>rank>=r).length,focus=(name:string)=>m.upgradeFocus===name?milestones:0;
 const power=m.power*evolutionMultiplier(p.species)*(1+.16*(rank-1))*(1+.03*((s.mode==='story'?battleLevel(s,p):s.level)-1))*badgePower(s)*(1+bonus('power')*.05)*(SPECIES[p.species].types.includes(m.type)?1.15:1)*(s.completed.includes('tree')?1.12:1);
 const range=m.range*(1+bonus('reach')*.1);
 const interval=Math.max(.3,m.interval*(1-.04*(rank-1)-.07*focus('tempo'))*Math.max(.4,1-bonus('tempo')*.04));
 const projectiles=Math.min(8,m.count+focus('count'));
 const area=m.size*(1+bonus('area')*.05)*(1+.12*focus('area'));
 return {move:m,rank,power,range,interval,projectiles,area,size:area,pierce:m.pierce+focus('pierce'),bounces:m.bounces+focus('bounces'),duration:m.duration*(1+.2*focus('duration'))*(1+bonus('duration')*.08),speed:m.speed*(1+bonus('velocity')*.06),arc:Math.min(Math.PI*2,m.arc*(1+.12*focus('area'))*(1+bonus('area')*.05)),
 heal:Math.min(2,m.healing*(1+.07*(rank-1))*(1+bonus('heal')*.08)),burn:m.burn,slow:m.slow,
 crit:Math.min(.4,.05+bonus('crit')*.04+(SPECIES[p.species].traitKind==='focus'?.08:0)),burnDuration:4*(1+bonus('status')*.08),slowDuration:2*(1+bonus('status')*.08),extraEvery:bonus('shots')>0?Math.max(1,6-bonus('shots')):0};
}
export const numberText=(value:number,digits=1)=>Number(value.toFixed(digits)).toLocaleString('de-DE',{maximumFractionDigits:digits});
export function attackDescription(s:RunState,p:Partner,slot=0,rank=p.ranks[0]){
 const a=attackStats(s,p,slot,rank),m=a.move;
 const details=[numberText(a.power)+' Schaden je Treffer','alle '+numberText(a.interval,2)+' s'];
 if(['shot','fan','burst','boomerang','ricochet','orbit'].includes(m.pattern))details.push(a.projectiles+' Geschoss'+(a.projectiles===1?'':'e'));
 if(m.pattern==='slash')details.push(a.projectiles+' Hiebe je Einsatz');
 if(m.pattern==='mine')details.push(a.projectiles+' Fallen je Einsatz');
 if(['beam','charge','boomerang'].includes(m.pattern))details.push('bis zu '+(1+a.pierce)+' Ziele je Bahn');
 if(['chain','ricochet'].includes(m.pattern))details.push('bis zu '+(1+a.bounces)+' Ziele');
 if(['nova','zone','mine'].includes(m.pattern))details.push('Radius '+Math.round(a.area));
 if(['cone','slash'].includes(m.pattern))details.push('Winkel '+Math.round(a.arc/Math.PI*180)+'°');
 if(['zone','orbit','mine'].includes(m.pattern))details.push(numberText(a.duration)+' s Dauer');
 if(a.heal>0)details.push('bis zu '+numberText(a.heal)+' KP Rückgewinnung · teamweit alle 10 s');
 details.push('Reichweite '+Math.round(a.range));
 return {shape:PATTERN_NAME[m.pattern],details,type:TYPE_NAME[m.type],status:a.burn?'Verursacht Brand für '+numberText(a.burnDuration)+' s.':a.slow?'Verlangsamt für '+numberText(a.slowDuration)+' s.':'',extra:rank<8?m.rankNotes[rank]: 'Meisterrang erreicht.'};
}
