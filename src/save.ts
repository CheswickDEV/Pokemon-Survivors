import {BOONS,freshBoonState} from './boons.ts';
import {newJournal,type Journal} from './progress.ts';
import {isDifficulty} from './difficulty.ts';
import {BOSS_STYLES,BOSSES} from './bosses.ts';
import {newWorld,kantoLocationAt} from './world.ts';
import {newStory,storyStage} from './story.ts';
import {KANTO_LOCATIONS,KANTO_STORY,KANTO_UNLOCK_NAMES} from './kanto-world-catalog.ts';
import {createQuests,QUEST_IDS} from './quests.ts';
import type {RunState} from './engine.ts';
import {DATA_VERSION,SPECIES,PASSIVES,STONES,POIS,ELEMENTS,LEGACY_RECRUITS} from './data.ts';
import {TRAINERS,DEFAULT_TRAINER_ID,trainerById} from './trainer-art.ts';
import {normalizeSettings} from './settings.ts';
import type {Settings} from './settings.ts';
import {PARTNER_MAX_LEVEL,partnerXpNeeded} from './partner-progress.ts';
import {KANTO_BUILDINGS,buildingDoor,serviceAt} from './kanto-layout.ts';
import {stageBuilding,roomPlan,roomContains} from './interior-layout.ts';
export interface Profile {shinies:number[];journal:Journal;version:1;trainerId:string;targetSpecies:number|null;caught:number[];wins:number;runs:number;best:number;settings:Settings;lastOutcome:string|null}
export const defaultProfile=():Profile=>({shinies:[],journal:newJournal(),version:1,trainerId:DEFAULT_TRAINER_ID,targetSpecies:null,caught:[1,4,7],wins:0,runs:0,best:0,settings:normalizeSettings(undefined),lastOutcome:null});
export interface Envelope {version:1;generation:number;savedAt:string;payload:string;checksum:string}
export function checksum(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(16);}
export function envelope(state:RunState,generation:number):Envelope {
 const payload=JSON.stringify(state);return {version:1,generation,savedAt:new Date().toISOString(),payload,checksum:checksum(payload)};
}
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const number=(v:unknown,min=-1e7,max=1e9)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const ints=(v:unknown,n=1000):v is number[]=>Array.isArray(v)&&v.length<=n&&v.every(x=>Number.isInteger(x)&&number(x));
const strings=(v:unknown,n=1000):v is string[]=>Array.isArray(v)&&v.length<=n&&v.every(x=>typeof x==='string'&&x.length<=160);
const point=(v:unknown)=>obj(v)&&number(v.x,-1e9,1e9)&&number(v.y,-1e9,1e9);
const speciesId=(v:unknown)=>typeof v==='number'&&Number.isInteger(v)&&Object.hasOwn(SPECIES,v);

// v0.1–0.3 stored four independent move ranks. Preserve all purchased ranks;
// overflow beyond the new eight-rank weapon becomes twelve coins per rank.
function migrateLegacy(s:RunState){
 if(!Array.isArray(s.party)||!Array.isArray(s.enemies)||!Array.isArray(s.shots)||!Array.isArray(s.hazards)||!Array.isArray(s.choices)||!Array.isArray(s.completed)||!obj(s.poiProgress))throw new Error('Ungültiger alter Spielstand.');
 let overflow=0;
 for(const p of s.party){
  if(!ints(p.ranks,4)||p.ranks.length!==4||p.ranks.some(n=>n<1||n>5)||!Array.isArray(p.nextFire)||p.nextFire.length!==4||p.nextFire.some(n=>!number(n,0)))throw new Error('Ungültiges altes Training.');
  const rank=1+p.ranks.reduce((sum,r)=>sum+r-1,0);overflow+=Math.max(0,rank-8);
  p.ranks=[Math.min(8,rank)];p.equipped=[0];p.nextFire=[Math.max(...p.nextFire)];
 }
 s.coins+=overflow*12;s.version=DATA_VERSION;s.fields=[];s.quests=createQuests();
 for(const id of QUEST_IDS){
  const q=s.quests[id],old=s.poiProgress[id];if(!number(old,0,id==='garden'?36:id==='tree'?1:3))throw new Error('Ungültiges altes Waldziel.');
  const done=s.completed.includes(id),ready=done||old>=(id==='garden'?36:id==='tree'?1:3);
  q.ready=ready;q.started=ready;
  if(ready){q.progress=id==='garden'?30:id==='tree'?4:3;if(id==='camp')q.collected=[0,1,2];if(id==='garden')q.wave=3;}
  // Incomplete old instant objectives restart with the new quest briefing.
  s.poiProgress[id]=q.progress;
 }
 if(s.completed.includes('camp')){s.merchantPos={x:POIS[0].x+95,y:POIS[0].y+65};s.merchantUntil=s.duration+s.bossLimit+10;}
 s.enemies=s.enemies.filter(e=>e.kind!=='guardian');
 for(const p of s.shots)Object.assign(p,{behavior:'straight',traveled:0,range:400,returning:false,delay:0,pierce:0,maxPierce:0,bounces:0,hitIds:[],healing:0,healed:false});
 for(const h of s.hazards){h.style=h.shape==='ring'?'pollen':h.shape==='circle'?'spores':h.width>=40?'solar':'vines';h.createdAt=Math.max(0,h.warnUntil-1.2);}
 const seen=new Set<number>();
 s.choices=s.choices.map(c=>{
  if(c.kind!=='rank')return c;const p=s.party.find(p=>p.uid===c.uid);
  if(!p||p.ranks[0]>=8||seen.has(p.uid))return {kind:'heal',title:'Verschnaufpause',description:'+5 KP'};
  seen.add(p.uid);return {...c,slot:0,title:SPECIES[p.species]?.weapon.name??c.title,description:'Charakteristische Attacke um einen Rang verbessern.'};
 });
 s.message='Spielstand umgestellt: Training vereint'+(overflow?' · '+overflow*12+' Münzen für überzählige Ränge':'')+'. Offene Waldaufträge beginnen neu.';s.messageUntil=s.time+12;
}

export function validateState(raw:unknown):RunState {
 if(!obj(raw)||![1,2,3,4,5,DATA_VERSION].includes(Number(raw.version))||!['learn','normal','endless','story','bossrush'].includes(String(raw.mode)))throw new Error('Spielstand-Version oder Laufart passt nicht.');
 const s=JSON.parse(JSON.stringify(raw)) as RunState;
 if(s.boons===undefined)s.boons=[];
 if(s.boonState===undefined)s.boonState=freshBoonState();
 if(s.lastTrainerHit===undefined)s.lastTrainerHit=0;
 if(!strings(s.boons,3)||new Set(s.boons).size!==s.boons.length||s.boons.some(id=>!BOONS.some(b=>b.id===id))||!number(s.lastTrainerHit,0))throw new Error('Ungültige Talente.');
 const bs=s.boonState;
 if(!obj(bs)||typeof bs.spent!=='boolean'||!obj(bs.cooldowns)||Object.entries(bs.cooldowns).some(([id,n])=>!BOONS.some(b=>b.id===id)||!number(n,0))||!Array.isArray(bs.echoes)||bs.echoes.length>12||bs.echoes.some(c=>!obj(c)||!number(c.uid,1)||!number(c.target,1)||!number(c.at,0)||!number(c.strength,0,1))||bs.lure!==null&&(!point(bs.lure)||!number(bs.lure.until,0)))throw new Error('Ungültiger Talentzustand.');
 if(s.recentChoices===undefined)s.recentChoices=[];
 if(s.shinyCaught===undefined)s.shinyCaught=[];
 if(!ints(s.shinyCaught,151)||new Set(s.shinyCaught).size!==s.shinyCaught.length||s.shinyCaught.some(id=>!SPECIES[id]||!Array.isArray(s.caught)||!s.caught.includes(id)))throw new Error('Ungültige Shiny-Sammlung.');
 if(!strings(s.recentChoices,6))throw new Error('Ungültiger Auswahlverlauf.');
 if(Number(raw.version)<6){s.difficulty='standard';s.clearedBosses=[];s.gauntlet={round:0,nextAt:5,deadline:0};}
 if(!isDifficulty(s.difficulty)||!ints(s.clearedBosses,151)||new Set(s.clearedBosses).size!==s.clearedBosses.length||s.clearedBosses.some(id=>!SPECIES[id]))throw new Error('Ungültige Schwierigkeit oder Bossfortschritte.');
 if(!obj(s.gauntlet)||!Number.isInteger(s.gauntlet.round)||!number(s.gauntlet.round,0,BOSSES.length)||!number(s.gauntlet.nextAt,0)||!number(s.gauntlet.deadline,0))throw new Error('Ungültiger Bossansturm.');
 if(s.mode==='bossrush'&&s.gauntlet.round===BOSSES.length&&s.outcome!=='win')throw new Error('Unvollständiger Bossabschluss.');
 if(Number(raw.version)<5){s.interior=null;s.rooms={};s.healing={nextDrop:0,nextCombat:0,purchased:0};}
 if(s.version===1)migrateLegacy(s);
 if(Number(raw.version)<3){s.world=newWorld();s.story=newStory();s.version=DATA_VERSION;}
 if(s.trainerId===undefined)s.trainerId=DEFAULT_TRAINER_ID;
 if(!TRAINERS.some(t=>t.id===s.trainerId))throw new Error('Ungültige Trainerfigur.');
 if(s.encounterRoster===undefined)s.encounterRoster=[...LEGACY_RECRUITS];
 if(s.targetSpecies===undefined)s.targetSpecies=null;
 if(!ints(s.encounterRoster,6)||s.encounterRoster.length!==6||new Set(s.encounterRoster).size!==6||s.encounterRoster.some(id=>!SPECIES[id]))throw new Error('Ungültige Begegnungsliste.');
 if(s.targetSpecies!==null&&(!Number.isInteger(s.targetSpecies)||!SPECIES[s.targetSpecies]))throw new Error('Ungültiges Forschungsziel.');
 if(!number(s.time,0,1e8)||!number(s.seed,0,4294967295)||!number(s.rng,0,4294967295)||!number(s.nextId,1)||!number(s.level,1,10000)||!number(s.xp,0)||!number(s.balls,0,1e7)||!number(s.coins,0,1e7)||!number(s.kills,0)||![s.seed,s.rng,s.nextId,s.level,s.balls,s.coins,s.kills].every(Number.isInteger))throw new Error('Ungültige Laufwerte.');
 const baseBossLimit=s.mode==='learn'?60:120,expectedBossLimit=baseBossLimit*(s.difficulty==='master'?4:s.difficulty==='veteran'?2:1);
 if(s.duration!==(s.mode==='learn'?480:1200)||![baseBossLimit,expectedBossLimit].includes(s.bossLimit))throw new Error('Ungültige Laufzeit.');
 if(!s.bossSpawned)s.bossLimit=expectedBossLimit;
 if(!point(s.trainer)||!number(s.trainer.hp,0,100)||s.trainer.maxHp!==100)throw new Error('Ungültiger Trainer.');
 for(const key of ['invincibleUntil','dashUntil','dashReady','dx','dy','shield'] as const)if(!number(s.trainer[key]))throw new Error('Ungültiger Trainerzustand.');
 if(!Array.isArray(s.party)||s.party.length<1||s.party.length>6)throw new Error('Ungültige Teamgröße.');
 // Earlier saves had only a shared level. Keep their earned progress once; future XP is personal.
 if(Number(raw.version)<4){for(const p of s.party){p.level=Math.min(PARTNER_MAX_LEVEL,s.level);p.xp=0;}s.version=DATA_VERSION;}
 const ids=new Set<number>(),dex=new Set<number>();
 for(const p of s.party){
  if(!point(p)||!Number.isInteger(p.uid)||ids.has(p.uid)||!Number.isInteger(p.species)||!SPECIES[p.species]||dex.has(p.species)||!number(p.stamina,0,100)||!number(p.recoveryUntil,0)||!number(p.traitNext,0)||!number(p.points,0)||!number(p.salvos,0))throw new Error('Ungültiger Partner.');
  if(!Number.isInteger(p.level)||!number(p.level,1,PARTNER_MAX_LEVEL)||!number(p.xp,0)||p.xp>=partnerXpNeeded(p.level)||p.level===PARTNER_MAX_LEVEL&&p.xp!==0)throw new Error('Ungültige Pokémon-Erfahrung.');
  if(!ints(p.ranks,1)||p.ranks.length!==1||p.ranks.some(n=>n<1||n>8)||!ints(p.equipped,1)||p.equipped.length!==1||p.equipped[0]!==0||!Array.isArray(p.nextFire)||p.nextFire.length!==1||p.nextFire.some(n=>!number(n,0)))throw new Error('Ungültige Angriffe.');
  ids.add(p.uid);dex.add(p.species);
 }
 if(!ints(s.active,3)||s.active.length<1||new Set(s.active).size!==s.active.length||s.active.some(id=>!ids.has(id))||s.active.length>(s.level>=8?3:s.level>=4?2:1))throw new Error('Ungültige Aktivplätze.');
 if(!['ring','wedge','trail'].includes(s.formation)||!['play','level','capture','reward','merchant','result','quest','story','treasure'].includes(s.screen))throw new Error('Ungültiges Menü.');
 if(!['win','lost','timeout',null].includes(s.outcome)||!strings(s.events)||!strings(s.completed,3)||s.completed.some(p=>!POIS.some(q=>q.id===p))||!ints(s.caught,151)||s.caught.some(d=>!SPECIES[d])||!ints(s.evolved,200))throw new Error('Ungültige Fortschritte.');
 if(!obj(s.passives)||Object.keys(s.passives).length>6||Object.entries(s.passives).some(([id,r])=>!PASSIVES.some(p=>p.id===id)||!Number.isInteger(r)||!number(r,1,5)))throw new Error('Ungültige Ausrüstung.');
 if(!obj(s.bag)||Object.entries(s.bag).some(([id,r])=>!Object.hasOwn(STONES,id)||!Number.isInteger(r)||!number(r,0,1000)))throw new Error('Ungültige Tasche.');
 if(!obj(s.poiProgress)||POIS.some(p=>!number(s.poiProgress[p.id],0,p.goal)))throw new Error('Ungültige Ziele.');
 for(const field of ['swapReady','deployReady','spawnBudget','bossPattern','rerolls','skips','lastTrait','damageDone'] as const)if(!number(s[field],0))throw new Error('Ungültige Zeit- oder Ressourcenwerte.');
 if(typeof s.bossSpawned!=='boolean'||typeof s.bossDead!=='boolean'||!number(s.messageUntil)||typeof s.message!=='string'||s.message.length>300)throw new Error('Ungültige Laufmarkierung.');
 if(s.pendingId!==null&&(typeof s.pendingId!=='string'||s.pendingId.length>100))throw new Error('Ungültige Interaktion.');
 if(s.focus!==null&&!number(s.focus,0))throw new Error('Ungültiges Fokusziel.');
 if(s.merchantUntil!==null&&!number(s.merchantUntil,-1)||!point(s.merchantPos)||!obj(s.merchantStock)||!number(s.merchantStock.stones,0,2)||!number(s.merchantStock.balls,0,3))throw new Error('Ungültiger Händler.');
 const arrays:[string,unknown,number][]=[['Gegner',s.enemies,700],['Geschosse',s.shots,320],['Waffenfelder',s.fields,100],['Pickups',s.pickups,400],['Gefahren',s.hazards,100],['Begegnungen',s.encounters,256],['Auswahl',s.choices,3]];
 for(const [name,items,max] of arrays)if(!Array.isArray(items)||items.length>max)throw new Error('Ungültige '+name);
 if(!obj(s.healing)||!number(s.healing.nextDrop,0)||!number(s.healing.nextCombat,0)||!Number.isInteger(s.healing.purchased)||!number(s.healing.purchased,0,2))throw new Error('Ungültige Heilversorgung.');
 const roomContents=(v:unknown)=>obj(v)&&Array.isArray(v.pickups)&&v.pickups.length<=400&&Array.isArray(v.encounters)&&v.encounters.length<=256;
 if(!obj(s.rooms)||Object.keys(s.rooms).length>KANTO_BUILDINGS.length||Object.entries(s.rooms).some(([id,value])=>!KANTO_BUILDINGS.some(b=>b.id===id)||!roomContents(value)))throw new Error('Ungültiger Raumvorrat.');
 if(s.interior!==null&&(!obj(s.interior)||s.mode!=='story'||!KANTO_BUILDINGS.some(b=>b.id===s.interior!.buildingId)||!point(s.interior.returnPoint)||!roomContents(s.interior.outside)||!Array.isArray(s.interior.outside.enemies)||s.interior.outside.enemies.length>700||s.rooms[s.interior.buildingId]))throw new Error('Ungültiger Innenraum.');
 const allEnemies=[...s.enemies,...(s.interior?.outside.enemies??[])];
 const areas=[...Object.values(s.rooms),...(s.interior?[s.interior.outside]:[])];
 for(const e of allEnemies)if(!point(e)||!speciesId(e.species)||!number(e.uid,1)||!number(e.hp,-1e6)||!number(e.maxHp,1)||!number(e.speed,0,500)||!number(e.r,1,100)||!['wild','elite','encounter','boss','guardian'].includes(e.kind)||[e.slowUntil,e.burnUntil,e.burnNext,e.burnPower,e.nextAttack,e.flash].some(v=>!number(v,0)))throw new Error('Ungültiger Gegner.');
 for(const e of allEnemies)if(e.braceUntil!==undefined&&!number(e.braceUntil,0))throw new Error('Ungültige Bossdeckung.');
 for(const e of allEnemies)if(e.resonance!==undefined&&(!obj(e.resonance)||!Array.isArray(e.resonance.types)||e.resonance.types.length>3||new Set(e.resonance.types).size!==e.resonance.types.length||e.resonance.types.some(t=>!ELEMENTS.includes(t))||!number(e.resonance.until,0)))throw new Error('Ungültige Typenresonanz.');
 for(const e of allEnemies)if(e.bossPhase!==undefined&&(!Number.isInteger(e.bossPhase)||!number(e.bossPhase,0,2)))throw new Error('Ungültige Bossphase.');
 for(const e of allEnemies)if(e.attackPhase!==undefined&&(!Number.isInteger(e.attackPhase)||!number(e.attackPhase,0)))throw new Error('Ungültige Bossphase.');
 for(const body of [...s.party,...allEnemies,...s.encounters,...areas.flatMap(a=>a.encounters)])if(body.shiny!==undefined&&typeof body.shiny!=='boolean')throw new Error('Ungültige Shiny-Markierung.');
 for(const body of [...s.party,...allEnemies])if(body.navigation!==undefined){
  const n=body.navigation,o=n?.obstacle;
  if(!obj(n)||!point(o)||!number(o.r,0,500)||o.shape!==undefined&&!['circle','rect'].includes(o.shape)||o.shape==='rect'&&(!number(o.w,1,1000)||!number(o.h,1,1000))||!Array.isArray(n.points)||n.points.length<1||n.points.length>12||!n.points.every(point))throw new Error('Ungültiger Umweg.');
 }
 for(const p of s.shots)if(!point(p)||[p.uid,p.vx,p.vy,p.life,p.power,p.owner,p.r].some(v=>!number(v))||!ELEMENTS.includes(p.type)||typeof p.burn!=='boolean'||typeof p.slow!=='boolean'||!['straight','boomerang','ricochet'].includes(p.behavior)||![p.traveled,p.range,p.delay,p.pierce,p.maxPierce,p.bounces,p.healing].every(n=>number(n,0))||!ints(p.hitIds,700)||typeof p.returning!=='boolean'||typeof p.healed!=='boolean')throw new Error('Ungültiges Projektil.');
 for(const p of [...s.pickups,...areas.flatMap(a=>a.pickups)])if(!point(p)||!number(p.uid,1)||!number(p.value,0)||!['xp','heal','coin','stamina'].includes(p.kind))throw new Error('Ungültiger Bodenfund.');
 for(const h of s.hazards)if(!point(h)||![h.uid,h.angle,h.r,h.width,h.warnUntil,h.expire,h.damage,h.createdAt].every(n=>number(n))||!['line','ring','circle'].includes(h.shape)||typeof h.fired!=='boolean'||!BOSS_STYLES.includes(h.style))throw new Error('Ungültige Gefahr.');
 for(const e of [...s.encounters,...areas.flatMap(a=>a.encounters)])if(!point(e)||!speciesId(e.species)||typeof e.id!=='string'||e.id.length>100||typeof e.ready!=='boolean'||typeof e.claimed!=='boolean')throw new Error('Ungültige Begegnung.');
 for(const c of s.choices)if(!obj(c)||!['rank','passive','evolve','heal','boon'].includes(String(c.kind))||typeof c.title!=='string'||c.title.length>150||typeof c.description!=='string'||c.description.length>250)throw new Error('Ungültige Auswahl.');
 for(const c of s.choices){
  if(c.kind==='boon'&&(!BOONS.some(b=>b.id===c.id&&b.rarity===c.rarity)||s.boons.includes(c.id as any)||s.boons.length>=3&&!c.replaceBoon||c.replaceBoon&&!s.boons.includes(c.replaceBoon)))throw new Error('Ungültiges Talentangebot.');
  if(c.replaceBoon!==undefined){const ranks={rare:1,epic:2,legendary:3},old=BOONS.find(b=>b.id===c.replaceBoon),next=BOONS.find(b=>b.id===c.id);if(c.kind!=='boon'||!old||!next||ranks[next.rarity]<=ranks[old.rarity])throw new Error('Ungültiger Talenttausch.');}
  if(c.rarity!==undefined&&!['common','rare','epic','legendary'].includes(c.rarity))throw new Error('Ungültige Seltenheit.');
  if((c.kind==='rank'||c.kind==='evolve')&&!s.party.some(p=>p.uid===c.uid))throw new Error('Ungültiger Auswahlpartner.');
  if(c.kind==='rank'&&(!Number.isInteger(c.slot)||c.slot!==0))throw new Error('Ungültiger Auswahlangriff.');
  if(c.kind==='passive'&&!PASSIVES.some(p=>p.id===c.id))throw new Error('Ungültige Auswahlausrüstung.');
  if(c.kind==='evolve'&&c.target!==undefined){const partner=s.party.find(p=>p.uid===c.uid)!;if(!SPECIES[partner.species].evolutions.some(e=>e.to===c.target))throw new Error('Ungültiges Entwicklungsziel.');}
 }
 
 for(const id of QUEST_IDS){
  const q=s.quests?.[id];
  if(!q||typeof q.started!=='boolean'||typeof q.ready!=='boolean'||!number(q.progress,0,id==='garden'?30:id==='tree'?4:3)||!Number.isInteger(q.wave)||!number(q.wave,0,3)||!ints(q.collected,3)||new Set(q.collected).size!==q.collected.length||q.collected.some(n=>n<0||n>2)||!(q.channel===null||Number.isInteger(q.channel)&&number(q.channel,0,2))||!number(q.channelProgress,0,2.5)||!number(q.nextPulse,0)||q.ready&&(!q.started||q.progress<(id==='garden'?30:id==='tree'?4:3))||id==='camp'&&q.progress!==q.collected.length)throw new Error('Ungültiger Waldauftrag.');
 }
 for(const e of allEnemies)if(e.questReinforcement!==undefined&&typeof e.questReinforcement!=='boolean')throw new Error('Ungültige Verstärkung.');
 for(const e of allEnemies)if(e.questId!==undefined&&(!QUEST_IDS.includes(e.questId)||!Number.isInteger(e.objective)||!number(e.objective,0,3)))throw new Error('Ungültiger Auftragsgegner.');
 for(const f of s.fields){
  if(!point(f)||f.duration<=0||!['melee','orbit','mine','zone','charge'].includes(f.kind)||!ELEMENTS.includes(f.type)||!s.party.some(p=>p.uid===f.owner)||![f.uid,f.power,f.life,f.duration,f.radius,f.size,f.speed,f.pierce,f.healing,f.strikes,f.arc].every(n=>number(n,0))||!number(f.angle)||!Number.isInteger(f.count)||!number(f.count,1,9)||!point({x:f.fromX,y:f.fromY})||!point({x:f.targetX,y:f.targetY})||!obj(f.hitNext)||Object.keys(f.hitNext).length>700||Object.values(f.hitNext).some(v=>!number(v,0))||[f.burn,f.slow,f.healed,f.triggered].some(v=>typeof v!=='boolean'))throw new Error('Ungültiges Waffenfeld.');
 }
 if(s.screen==='quest'&&!QUEST_IDS.some(id=>id===s.pendingId&&!s.quests[id].started))throw new Error('Verwaister Auftrag.');
 if(s.screen==='level'&&s.choices.length!==3)throw new Error('Unvollständige Levelauswahl.');
 if(s.screen==='capture'&&!s.encounters.some(e=>e.id===s.pendingId&&e.ready&&!e.claimed))throw new Error('Verwaiste Fangentscheidung.');
 if(s.screen==='reward'&&!QUEST_IDS.some(id=>id===s.pendingId&&!s.completed.includes(id)&&s.quests[id].ready))throw new Error('Verwaiste Zielbelohnung.');
 if((s.screen==='result')!==(s.outcome!==null))throw new Error('Ungültiges Laufergebnis.');
 const w=s.world,st=s.story;
 if(!obj(w)||![w.cycle,w.eliteWave,w.encounterWave].every(v=>Number.isInteger(v)&&number(v,0))||!strings(w.sites,100000)||new Set(w.sites).size!==w.sites.length||!strings(w.lastTreasure,10)||!Array.isArray(w.treasures)||w.treasures.length>10000)throw new Error('Ungültige Weltfortschritte.');
 const chestIds=new Set<string>();for(const t of w.treasures){if(!point(t)||typeof t.id!=='string'||t.id.length>100||chestIds.has(t.id)||![1,3,5].includes(t.quality)||typeof t.opened!=='boolean'||typeof t.evolution!=='boolean')throw new Error('Ungültige Truhe.');chestIds.add(t.id);}
 if(!obj(st)||!strings(st.done,27)||new Set(st.done).size!==st.done.length||st.done.some(id=>!storyStage(id))||!strings(st.unlocks,100)||st.unlocks.some(id=>!KANTO_STORY.some(q=>q.rewardUnlocks.includes(id)))||!strings(st.visited,51)||st.visited.some(id=>!KANTO_LOCATIONS.some(l=>l.id===id))||!KANTO_LOCATIONS.some(l=>l.id===st.checkpoint)||![st.wave,st.progress,st.nextWave,st.startedAt,st.healReady].every(v=>number(v,0))||!Number.isInteger(st.wave)||!(st.active===null||typeof st.active==='string'&&!!storyStage(st.active)&&!st.done.includes(st.active)))throw new Error('Ungültiger Storyfortschritt.');
 if(st.done.some(id=>!storyStage(id)!.requires.every(req=>st.done.includes(req)))||st.unlocks.some(id=>!st.done.some(done=>storyStage(done)!.rewardUnlocks.includes(id))))throw new Error('Ungültige Storyfreischaltung.');
 if(st.active&&(!storyStage(st.active)!.requires.every(id=>st.done.includes(id))||st.wave>storyStage(st.active)!.waves))throw new Error('Ungültige Storyprüfung.');
 for(const f of allEnemies)if(f.storyId!==undefined&&(!storyStage(f.storyId)||typeof f.storyLeader!=='boolean')||f.siteId!==undefined&&(typeof f.siteId!=='string'||f.siteId.length>100))throw new Error('Ungültiger Weltgegner.');
 if(s.screen==='story'&&(s.mode!=='story'||!storyStage(s.pendingId??'')||st.active))throw new Error('Verwaiste Storyentscheidung.');
 if(Number(raw.version)<5){
  const q=storyStage(st.active??(s.screen==='story'?s.pendingId??'':'')),building=q?stageBuilding(q):s.mode==='story'&&s.screen==='merchant'?serviceAt(kantoLocationAt(s.trainer).id,'shop'):undefined;
  if(building){
   const room=roomPlan(building),door=buildingDoor(building);
   s.interior={buildingId:building.id,returnPoint:{x:door.x,y:door.y+28},outside:{enemies:s.enemies.filter(e=>!e.storyId),pickups:s.pickups,encounters:s.encounters}};
   s.enemies=s.enemies.filter(e=>!!e.storyId);s.pickups=[];s.encounters=[];s.shots=[];s.fields=[];s.hazards=[];
   Object.assign(s.trainer,s.screen==='story'?room.npcs.find(n=>n.role==='story')!.approach:s.screen==='merchant'?room.npcs.find(n=>n.role==='shop')!.approach:room.entrance);
   s.party.forEach(p=>{p.x=s.trainer.x;p.y=s.trainer.y;delete p.navigation;});
  }
  s.version=DATA_VERSION;
 }
 if(s.interior&&!roomContains(s,s.trainer))throw new Error('Trainer außerhalb des Innenraums.');
 s.version=DATA_VERSION;
 // Return a JSON-only copy. Import never executes functions or injects markup.
 return JSON.parse(JSON.stringify(s)) as RunState;
}
export function decodeEnvelope(raw:unknown):RunState{
 if(!obj(raw)||raw.version!==1||typeof raw.payload!=='string'||raw.payload.length>5_000_000||raw.checksum!==checksum(raw.payload)||!number(raw.generation,0))throw new Error('Spielstand ist beschädigt oder inkompatibel.');
 return validateState(JSON.parse(raw.payload));
}
function request<T>(req:IDBRequest<T>):Promise<T>{return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export class SaveStore {
 db!:IDBDatabase;generation=0;recovered=false;
 async open(){
  const req=indexedDB.open('pokemon-survivors-auenwald',1);
  req.onupgradeneeded=()=>req.result.createObjectStore('data');
  this.db=await request(req);
 }
 async get<T>(key:string):Promise<T|undefined>{return request(this.db.transaction('data').objectStore('data').get(key));}
 async put(key:string,value:unknown):Promise<void>{
  return new Promise((resolve,reject)=>{
   const tx=this.db.transaction('data','readwrite');tx.objectStore('data').put(value,key);
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
 }
 async loadRun(kind?:SaveSlot):Promise<RunState|null>{
  const records=(await Promise.all((kind==='bossrush'?['bossrush-0','bossrush-1']:kind==='story'?['story-0','story-1']:kind==='forest'?['run-0','run-1']:['run-0','run-1','story-0','story-1','bossrush-0','bossrush-1']).map(key=>this.get<Envelope>(key)))).filter((e):e is Envelope=>!!e).sort((a,b)=>b.generation-a.generation);
  if(!records.length)return null;
  this.generation=Math.max(this.generation,...records.map(e=>Number.isFinite(e.generation)?e.generation:0));
  for(let i=0;i<records.length;i++){
   try{const state=decodeEnvelope(records[i]);this.recovered=i>0;return state;}catch{/* Try the retained previous generation. */}
  }
  throw new Error('Beide Laufkopien sind beschädigt. Importiere eine exportierte Datei oder starte einen neuen Lauf.');
 }
 async saveRun(s:RunState){
  const prefix=s.mode==='bossrush'?'bossrush-':s.mode==='story'?'story-':'run-',previous=await Promise.all([this.get<Envelope>(prefix+'0'),this.get<Envelope>(prefix+'1')]);
  const generation=Math.max(this.generation,...previous.map(r=>Number.isFinite(r?.generation)?r!.generation:0))+1;
  const slot=!previous[1]?1:!previous[0]?0:previous[0].generation<previous[1].generation?0:1;
  const record=envelope(s,generation);decodeEnvelope(record);await this.put(prefix+slot,record);this.generation=generation;
 }
 async clearRun(kind:SaveSlot='forest'){
  const prefix=kind==='bossrush'?'bossrush-':kind==='story'?'story-':'run-';
  await new Promise<void>((resolve,reject)=>{const tx=this.db.transaction('data','readwrite');tx.objectStore('data').delete(prefix+'0');tx.objectStore('data').delete(prefix+'1');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});
 }
 async loadProfile():Promise<Profile>{
  try{return validateProfile(await this.get<Profile>('profile'));}catch{return defaultProfile();}
 }
 async backup(){return backupEnvelope({profile:await this.loadProfile(),forest:await this.loadRun('forest'),story:await this.loadRun('story'),bossrush:await this.loadRun('bossrush')});}
 async restoreBackup(data:BackupData){
  const checked=decodeBackup(backupEnvelope(data));
  await new Promise<void>((resolve,reject)=>{
   const tx=this.db.transaction('data','readwrite'),store=tx.objectStore('data');
   store.put(checked.profile,'profile');
   for(const slot of ['forest','story','bossrush'] as const){
    const prefix=slot==='forest'?'run-':slot+'-';
    store.delete(prefix+'0');store.delete(prefix+'1');
    if(checked[slot])store.put(envelope(checked[slot]!,1),prefix+'0');
   }
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });this.generation=1;
 }
}
export type SaveSlot='forest'|'story'|'bossrush';
export const saveSlot=(mode:string):SaveSlot=>mode==='story'?'story':mode==='bossrush'?'bossrush':'forest';
export function validateProfile(raw:unknown):Profile{
 if(!obj(raw)||raw.version!==1||!ints(raw.caught,151)||raw.caught.some(id=>!SPECIES[id])||!number(raw.wins,0)||!number(raw.runs,0)||!number(raw.best,0)||!obj(raw.settings))throw new Error('Ungültiges Profil.');
 const j=raw.journal===undefined?newJournal():raw.journal;
 if(!obj(j)||!ints(j.bosses,151)||j.bosses.some(id=>!SPECIES[id])||!ints(j.evolutions,151)||j.evolutions.some(id=>!SPECIES[id])||!strings(j.quests,3)||j.quests.some(id=>!QUEST_IDS.includes(id as typeof QUEST_IDS[number]))||!strings(j.stages,27)||j.stages.some(id=>!storyStage(id))||!strings(j.clears,20)||j.clears.some(id=>!/^(learn|normal|story|endless|bossrush):(relaxed|standard|veteran|master)$/.test(id)))throw new Error('Ungültiges Fortschrittsbuch.');
 if(Object.values(j).some(a=>!Array.isArray(a)||new Set(a).size!==a.length))throw new Error('Doppelte Fortschritte.');
 const shinies=raw.shinies??[];if(!ints(shinies,151)||shinies.some(id=>!(raw.caught as number[]).includes(id)))throw new Error('Ungültige Shiny-Sammlung.');
 return {version:1,shinies:[...new Set(shinies)],journal:JSON.parse(JSON.stringify(j)),trainerId:trainerById(String(raw.trainerId??'')).id,targetSpecies:Number.isInteger(raw.targetSpecies)&&SPECIES[Number(raw.targetSpecies)]?Number(raw.targetSpecies):null,caught:[...new Set(raw.caught)],wins:Number(raw.wins),runs:Number(raw.runs),best:Number(raw.best),settings:normalizeSettings(raw.settings),lastOutcome:typeof raw.lastOutcome==='string'?raw.lastOutcome.slice(0,100):null};
}
export interface BackupData {profile:Profile;forest:RunState|null;story:RunState|null;bossrush:RunState|null}
export function backupEnvelope(data:BackupData){const payload=JSON.stringify(data);return {format:'pokemon-survivors-backup',version:1,savedAt:new Date().toISOString(),payload,checksum:checksum(payload)};}
export function decodeBackup(raw:unknown):BackupData{
 if(!obj(raw)||raw.format!=='pokemon-survivors-backup'||raw.version!==1||typeof raw.payload!=='string'||raw.payload.length>16_000_000||checksum(raw.payload)!==raw.checksum)throw new Error('Vollständige Sicherung ist beschädigt oder inkompatibel.');
 const data=JSON.parse(raw.payload);if(!obj(data))throw new Error('Ungültige Sicherung.');
 const result:BackupData={profile:validateProfile(data.profile),forest:null,story:null,bossrush:null};
 for(const slot of ['forest','story','bossrush'] as const){if(data[slot]!==null){const state=validateState(data[slot]);if(saveSlot(state.mode)!==slot)throw new Error('Falscher Speicherplatz.');result[slot]=state;}}
 return result;
}
