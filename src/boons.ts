import type {Engine,Partner,Enemy,Point,RunState} from './engine.ts';
import type {Element} from './data.ts';
import {attackStats} from './combat.ts';
import {fireWeapon} from './weapon-system.ts';
export const BOONS=[
 {id:'decoy',name:'Nachbild',rarity:'rare',icon:'◈',trigger:'Beim Dash · alle 8 s',description:'Dein Dash hinterlässt 2 Sekunden ein Lockbild. Gegner verfolgen es; angekündigte Bossflächen bleiben an ihrem Ort.'},
 {id:'magnet-wave',name:'Sammelwelle',rarity:'rare',icon:'◎',trigger:'Beim EP-Sammeln · alle 12 s',description:'Ein EP-Fund zieht alle Erfahrungskristalle und Münzen im Umkreis von 360 an dich. Keine zusätzliche Heilung.'},
 {id:'echo',name:'Attacken-Echo',rarity:'epic',icon:'»',trigger:'Jeder fünfte Angriff je Partner',description:'Das Pokémon wiederholt seine eigene Attacke nach 0,4 Sekunden mit 45 % Stärke. Das Echo startet an seiner aktuellen Position.'},
 {id:'resonance',name:'Typenresonanz',rarity:'epic',icon:'✧',trigger:'Drei verschiedene Angriffstypen in 4 s',description:'Drei Typen auf demselben Gegner lösen eine Resonanz mit 120 % Stärke des letzten Treffers aus. Danach beginnt die Kombination neu.'},
 {id:'parry',name:'Mutiger Schritt',rarity:'epic',icon:'◇',trigger:'Bossfläche mit Dash abfangen · alle 12 s',description:'Vermeidest du einen angekündigten Treffer während des Dashes, erhältst du 10 Schild und dein aktives Team 12 Ausdauer.'},
 {id:'timefold',name:'Zeitfalte',rarity:'legendary',icon:'⌛',trigger:'Beim Dash · alle 14 s',description:'Du verschiebst alle angekündigten Einschläge um 0,65 Sekunden und verlangsamst Gegner für 2 Sekunden. Die verlängerten Warnflächen bleiben sichtbar.'},
 {id:'second-wind',name:'Phönixfeder',rarity:'legendary',icon:'✦',trigger:'Einmal pro Lauf bei tödlichem Treffer',description:'Statt zu fallen erhältst du 30 KP, 2 Sekunden Schutz und 40 Ausdauer für alle Partner. Der Verbrauch wird mitgespeichert.'},
 {id:'chorus',name:'Dreiklang',rarity:'legendary',icon:'♬',trigger:'Jeder achte Angriff je Partner',description:'Die anderen aktiven Partner antworten nacheinander mit ihrer eigenen Attacke bei 60 % Stärke. Zusatzattacken lösen keine weitere Kette aus.'},
] as const;
export type BoonId=typeof BOONS[number]['id'];
export interface BoonState {cooldowns:Record<string,number>;echoes:{uid:number;target:number;at:number;strength:number}[];spent:boolean;lure:({until:number}&Point)|null}
export const freshBoonState=():BoonState=>({cooldowns:{},echoes:[],spent:false,lure:null});
export const hasBoon=(s:RunState,id:BoonId)=>s.boons?.includes(id)??false;
export function boonReady(e:Engine,id:BoonId,seconds:number){
 const state=e.s.boonState??=freshBoonState();
 if(!hasBoon(e.s,id)||(state.cooldowns[id]??0)>e.s.time)return false;
 state.cooldowns[id]=e.s.time+seconds;return true;
}
export function boonDash(e:Engine){
 const s=e.s,state=s.boonState??=freshBoonState();
 if(boonReady(e,'decoy',8)){state.lure={x:s.trainer.x,y:s.trainer.y,until:s.time+2};e.fx('quest',s.trainer,0x91e4f4,35,2,{label:'Nachbild'});}
 if(boonReady(e,'timefold',14)){
  for(const h of s.hazards)if(!h.fired){h.warnUntil+=.65;h.expire+=.65;}
  for(const f of s.enemies)f.slowUntil=Math.max(f.slowUntil,s.time+2);
  e.fx('pulse',s.trainer,0xba9eff,170,.65,{label:'Zeitfalte'});
 }
}
export function boonDodge(e:Engine){
 if(!boonReady(e,'parry',12))return;
 const s=e.s;s.trainer.shield=Math.max(s.trainer.shield,10);
 for(const p of e.activePartners())p.stamina=Math.min(100,p.stamina+12);
 e.fx('pulse',s.trainer,0x9ce7db,65,.6,{label:'Mutiger Schritt'});
}
export function boonCast(e:Engine,p:Partner,target:Enemy){
 const s=e.s,state=s.boonState??=freshBoonState();
 if(hasBoon(s,'echo')&&p.salvos%5===0)state.echoes.push({uid:p.uid,target:target.uid,at:s.time+.4,strength:.45});
 if(hasBoon(s,'chorus')&&p.salvos%8===0)e.activePartners().filter(q=>q.uid!==p.uid).forEach((q,i)=>state.echoes.push({uid:q.uid,target:target.uid,at:s.time+.2+i*.18,strength:.6}));
 state.echoes=state.echoes.slice(-12);
}
export function updateBoons(e:Engine){
 const s=e.s,state=s.boonState;if(!state)return;
 if(state.lure&&state.lure.until<=s.time)state.lure=null;
 const due=state.echoes.filter(c=>c.at<=s.time);state.echoes=state.echoes.filter(c=>c.at>s.time);
 for(const c of due){
  const p=e.activePartners().find(p=>p.uid===c.uid);if(!p)continue;
  const stats=attackStats(s,p),inRange=(f:Enemy)=>f.hp>0&&Math.hypot(f.x-p.x,f.y-p.y)<=stats.range+f.r;
  const target=s.enemies.find(f=>f.uid===c.target&&inRange(f))??s.enemies.find(inRange);if(!target)continue;
  fireWeapon(e,p,{...stats,power:stats.power*c.strength,heal:0},target,true);
  e.fx('cast',p,0xe3b7ff,30,.4,{owner:p.uid,label:'Zusatzattacke'});
 }
}
export function boonResonance(e:Engine,foe:Enemy,type:Element,power:number){
 if(!hasBoon(e.s,'resonance')||foe.hp<=0)return;
 const combo=foe.resonance??={types:[],until:0};
 if(combo.until<e.s.time)combo.types=[];combo.until=e.s.time+4;
 if(!combo.types.includes(type))combo.types.push(type);
 if(combo.types.length<3)return;combo.types=[];
 e.hit(foe,power*1.2,type,false,false,true);e.fx('pulse',foe,0xe6c8ff,60,.5,{label:'Typenresonanz'});
}
