import {BOONS,hasBoon,freshBoonState,boonDash,boonDodge,updateBoons,boonReady,boonResonance,type BoonId,type BoonState} from './boons.ts';
import {difficulty,type Difficulty} from './difficulty.ts';
import {partnerLevelCap,battleLevel,badgeProtection} from './badge-progress.ts';
import {rarityOf,upgradeRanks,type Rarity} from './reward-rarity.ts';
import {compactPickups} from './forest-balance.ts';
import {levelRewards} from './level-rewards.ts';
import {isShinyEncounter} from './shiny.ts';
import {attackBoss,advanceBossPhase,bossInterval,expeditionBoss,type BossStyle} from './bosses.ts';
import {updateGauntlet} from './gauntlet.ts';
import {roomNpcNear} from './interior-layout.ts';
import {DATA_VERSION, SPECIES, PASSIVES, POIS, OBSTACLES, STONES, WORLD_SIZE, typeFactor,encounterRoster} from './data.ts';
import type {Element} from './data.ts';
import {attackStats} from './combat.ts';
import {createQuests,startQuest,updateQuests,questDefeated,interactQuest,claimQuestReward,questStatus,CRATES} from './quests.ts';
import type {QuestId,QuestProgress} from './quests.ts';
import {fireWeapon,updateWeaponFields,updateProjectiles} from './weapon-system.ts';
import type {WeaponPattern} from './signature-weapons.ts';
import {newWorld,obstaclesAt,kantoWalkable,worldPoint,kantoLocationAt,type WorldProgress,type RunMode} from './world.ts';
import {newStory,updateStory,startStory,interactStory,storyContext,storyAttack,storyDefeated,abortStory,type StoryProgress} from './story.ts';
import {KANTO_START} from './kanto-world-catalog.ts';
import {expeditionEvents,dropTreasure,openTreasure} from './expedition.ts';
import {grantPartnerXp} from './partner-progress.ts';
import {moveBody} from './collision.ts';
import {areaAt,blockedGate,type WorldNotice} from './world-notices.ts';
import {findDetour,crossesObstacle,type Detour} from './navigation.ts';
import {activeRoom,roomContains,type InteriorState,type RoomContents} from './interior-layout.ts';
import {enterBuilding,leaveBuilding,restoreCenterReception} from './interiors.ts';
export interface Point {x:number;y:number}
export interface Partner extends Point {shiny?:boolean;uid:number;species:number;level:number;xp:number;stamina:number;recoveryUntil:number;ranks:number[];equipped:number[];nextFire:number[];traitNext:number;salvos:number;points:number;navigation?:Detour}
export interface Enemy extends Point {braceUntil?:number;resonance?:{types:Element[];until:number};questReinforcement?:boolean;shiny?:boolean;bossPhase?:number;attackPhase?:number;uid:number;species:number;hp:number;maxHp:number;speed:number;r:number;kind:'wild'|'elite'|'encounter'|'boss'|'guardian';encounterId?:string;questId?:QuestId;objective?:number;storyId?:string;storyLeader?:boolean;siteId?:string;slowUntil:number;burnUntil:number;burnNext:number;burnPower:number;nextAttack:number;flash:number;navigation?:Detour}
export interface Projectile extends Point {uid:number;vx:number;vy:number;life:number;power:number;type:Element;owner:number;r:number;burn:boolean;slow:boolean;behavior:'straight'|'boomerang'|'ricochet';traveled:number;range:number;returning:boolean;delay:number;pierce:number;maxPierce:number;bounces:number;hitIds:number[];healing:number;healed:boolean}
export interface AttackField extends Point {uid:number;owner:number;kind:'orbit'|'mine'|'zone'|'charge'|'melee';pattern:WeaponPattern;type:Element;power:number;burn:boolean;slow:boolean;healing:number;healed:boolean;life:number;duration:number;radius:number;size:number;count:number;angle:number;speed:number;pierce:number;hitNext:Record<string,number>;triggered:boolean;strikes:number;arc:number;fromX:number;fromY:number;targetX:number;targetY:number}
export interface Pickup extends Point {uid:number;kind:'xp'|'heal'|'coin'|'stamina';value:number}
export interface Hazard extends Point {uid:number;shape:'circle'|'line'|'ring';style:BossStyle;createdAt:number;angle:number;r:number;width:number;warnUntil:number;expire:number;fired:boolean;damage:number}
export interface Effect extends Point {id:number;kind:'hit'|'heal'|'pulse'|'dash'|'cast'|'evolve'|'capture'|'collect'|'faint'|'level'|'switch'|'weapon'|'quest';color:number;r:number;life:number;max:number;type?:Element;angle?:number;value?:number;owner?:number;species?:number;label?:string;pattern?:WeaponPattern;points?:Point[];width?:number}
export interface Encounter extends Point {shiny?:boolean;id:string;species:number;ready:boolean;claimed:boolean}
export interface Choice {kind:'rank'|'passive'|'evolve'|'heal'|'boon';replaceBoon?:BoonId;rarity?:Rarity;uid?:number;slot?:number;id?:string;target?:number;title:string;description:string}
export type Screen='play'|'level'|'capture'|'reward'|'merchant'|'result'|'quest'|'story'|'treasure';
export interface RunState {
 boons?:BoonId[];boonState?:BoonState;lastTrainerHit?:number;
 recentChoices?:string[];shinyCaught?:number[];
 difficulty:Difficulty;clearedBosses:number[];gauntlet:{round:number;nextAt:number;deadline:number};
 interior:InteriorState|null;rooms:Record<string,RoomContents>;healing:{nextDrop:number;nextCombat:number;purchased:number};
 version:number;trainerId:string;encounterRoster:number[];targetSpecies:number|null;seed:number;rng:number;mode:RunMode;time:number;duration:number;bossLimit:number;nextId:number;world:WorldProgress;story:StoryProgress;
 trainer:Point&{hp:number;maxHp:number;invincibleUntil:number;dashUntil:number;dashReady:number;dx:number;dy:number;shield:number};
 level:number;xp:number;kills:number;balls:number;coins:number;party:Partner[];active:number[];swapReady:number;deployReady:number;formation:'ring'|'wedge'|'trail';
 passives:Record<string,number>;bag:Record<string,number>;enemies:Enemy[];shots:Projectile[];fields:AttackField[];pickups:Pickup[];hazards:Hazard[];quests:Record<QuestId,QuestProgress>;
 encounters:Encounter[];poiProgress:Record<string,number>;completed:string[];events:string[];choices:Choice[];
 screen:Screen;pendingId:string|null;spawnBudget:number;bossSpawned:boolean;bossDead:boolean;bossPattern:number;focus:number|null;
 outcome:'win'|'lost'|'timeout'|null;message:string;messageUntil:number;rerolls:number;skips:number;evolved:number[];caught:number[];
 merchantStock:{stones:number;balls:number};merchantUntil:number|null;merchantPos:Point;lastTrait:number;damageDone:number;
}
export const xpNeeded=(level:number)=>Math.ceil(12+6*(level-1)+1.5*(level-1)**2);
export const activeCapacity=(s:RunState)=>s.level>=8?3:s.level>=4?2:1;
export const knownMoves=(_s:RunState)=>1;
export const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const dist=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export function newRun(starter:number,mode:RunMode,seed=Date.now()>>>0,trainerId='red',targetSpecies:number|null=null,selectedDifficulty:Difficulty='standard',starterShiny=false):RunState {
 if(!Number.isInteger(starter)||!SPECIES[starter]) throw new Error('Ungültiger Startpartner.');
 const s:RunState={boons:[],boonState:freshBoonState(),lastTrainerHit:0,recentChoices:[],difficulty:selectedDifficulty,clearedBosses:[],gauntlet:{round:0,nextAt:5,deadline:0},interior:null,rooms:{},healing:{nextDrop:0,nextCombat:0,purchased:0},world:newWorld(),story:newStory(),version:DATA_VERSION,trainerId,encounterRoster:encounterRoster(seed,targetSpecies),targetSpecies,seed,rng:seed||1,mode,time:0,duration:mode==='learn'?480:1200,bossLimit:(mode==='learn'?60:120)*(selectedDifficulty==='master'?4:selectedDifficulty==='veteran'?2:1),nextId:1,
 trainer:{x:1536,y:1710,hp:100,maxHp:100,invincibleUntil:0,dashUntil:0,dashReady:0,dx:0,dy:1,shield:0},
 level:1,xp:0,kills:0,balls:3,coins:0,party:[],active:[],swapReady:0,deployReady:0,formation:'ring',passives:{},bag:{},
 enemies:[],shots:[],fields:[],quests:createQuests(),pickups:[],hazards:[],encounters:[],poiProgress:{camp:0,garden:0,tree:0},completed:[],events:[],choices:[],
 screen:'play',pendingId:null,spawnBudget:0,bossSpawned:false,bossDead:false,bossPattern:0,focus:null,outcome:null,message:'WASD bewegen · Leertaste ausweichen · E interagieren',messageUntil:12,
 rerolls:2,skips:1,evolved:[],caught:[starter],merchantStock:{stones:2,balls:3},merchantUntil:null,merchantPos:{x:1450,y:1800},lastTrait:0,damageDone:0};
 if(mode==='story')Object.assign(s.trainer,{x:KANTO_START.x,y:KANTO_START.y});
 const p=makePartner(s,starter);p.shiny=starterShiny;s.shinyCaught=starterShiny?[starter]:[];s.party.push(p);s.active.push(p.uid);
 if(mode==='bossrush'){s.level=8;for(const id of [1,4,7].filter(id=>id!==starter).slice(0,2)){const partner=makePartner(s,id);s.party.push(partner);s.active.push(partner.uid);}s.party.forEach(p=>{p.level=12;p.ranks=[3];});s.bag={leaf:2,fire:2,water:2,thunder:2,moon:2,link:2};}
 return s;
}
function makePartner(s:RunState,species:number):Partner {
 return {uid:s.nextId++,species,level:1,xp:0,x:s.trainer.x-45,y:s.trainer.y,stamina:100,recoveryUntil:0,ranks:[1],equipped:[0],nextFire:[0],traitNext:s.time+12,salvos:0,points:0};
}
export class Engine {
 s:RunState;effects:Effect[]=[];soundEvents:string[]=[];visualId=0;
 notice:WorldNotice|null=null;lastArea='';noticeSerial=0;noticeTimes=new Map<string,number>();
 dashBufferedUntil=-1;
 constructor(state:RunState){this.s=state;restoreCenterReception(state);}
 random(){this.s.rng=(Math.imul(this.s.rng,1664525)+1013904223)>>>0;return this.s.rng/4294967296;}
 notify(message:string){this.s.message=message;this.s.messageUntil=this.s.time+5;}
 banner(key:string,kind:WorldNotice['kind'],title:string,detail:string){
  if(this.s.time-(this.noticeTimes.get(key)??-100)<7)return;
  this.noticeTimes.set(key,this.s.time);
  if(this.noticeTimes.size>150)this.noticeTimes.delete(this.noticeTimes.keys().next().value!);
  this.notice={key,kind,title,detail,until:this.s.time+(kind==='place'?4:5.5),serial:++this.noticeSerial};
 }
 fx(kind:Effect['kind'],p:Point,color:number,r=25,life=.3,extra:Partial<Effect>={}){this.effects.push({id:++this.visualId,x:p.x,y:p.y,kind,color,r,life,max:life,...extra});if(this.effects.length>180)this.effects.shift();}
 bonus(id:string){return this.s.passives[id]??0;}
 getPartner(uid:number){return this.s.party.find(p=>p.uid===uid);}
 activePartners(){return this.s.party.filter(p=>this.s.active.includes(p.uid)&&p.recoveryUntil<=this.s.time);}
 awardPartnerXp(amount:number){
  for(const p of this.activePartners()){
   const wasReady=SPECIES[p.species].evolutions.some(ev=>!this.evolutionReason(p.uid,ev.to));
   if(grantPartnerXp(p,amount,partnerLevelCap(this.s))){
    this.fx('level',p,0xa9d9ff,38,.65,{value:p.level});
    if(!wasReady&&SPECIES[p.species].evolutions.some(ev=>!this.evolutionReason(p.uid,ev.to)))
     this.notify(SPECIES[p.species].name+' ist bereit zur Entwicklung · Tab: Team öffnen.');
   }
  }
 }
 scaledTime(){const s=this.s;return s.mode==='story'?Math.min(1000,s.story.done.length*35):s.mode==='endless'?s.time%1200+Math.min(600,s.world.cycle*60):s.time*1200/s.duration;}
 move(body:Point,dx:number,dy:number,r=12){
  const probe={x:body.x+dx,y:body.y+dy};
  if(moveBody(this.s,body,dx,dy,r)&&body===this.s.trainer){
   if(this.s.interior)return;
   const gate=blockedGate(this.s,probe);
   if(gate)this.banner('gate:'+gate.key,'blocked',gate.title,gate.detail);
   else this.banner('edge','info','Hier geht es nicht weiter','Folge dem Weg. Mit M findest du die nächste Route auf deiner Karte.');
  }
 }
 step(dt:number,input:{x:number;y:number;dash?:boolean}={x:0,y:0}){
  const s=this.s;if(s.screen!=='play'||s.outcome)return;
  dt=clamp(dt,0,1/30);s.time+=dt;
  for(const fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(f=>f.life>0);
  const length=Math.hypot(input.x,input.y), t=s.trainer;
  if(length){t.dx=input.x/length;t.dy=input.y/length;}
  if(input.dash)this.dashBufferedUntil=s.time+.15;
  if(this.dashBufferedUntil>=s.time&&s.time>=t.dashReady){this.dashBufferedUntil=-1;t.dashUntil=s.time+.2;t.dashReady=s.time+4*(1-this.bonus('dash')*.06);t.invincibleUntil=Math.max(t.invincibleUntil,t.dashUntil+.1);this.soundEvents.push('dash');boonDash(this);}
  const speed=140*(1+Math.min(.35,this.bonus('speed')*.04)), dash=s.time<t.dashUntil;
  if(length||dash)this.move(t,t.dx*speed*dt*(dash?3.3:1),t.dy*speed*dt*(dash?3.3:1));
  const area=areaAt(s);if(area.id!==this.lastArea){this.lastArea=area.id;if(!this.notice||this.notice.until<s.time||this.notice.kind==='place')this.banner('place:'+area.id,'place',area.name,area.detail);}
  for(const p of s.party){
   if(p.recoveryUntil>0&&p.recoveryUntil<=s.time){p.recoveryUntil=0;p.stamina=50;this.notify(SPECIES[p.species].name+' ist wieder einsatzbereit.');}
  }
  this.events();this.spawn(dt);this.partners(dt);updateBoons(this);updateWeaponFields(this,dt);this.projectiles(dt);this.enemies(dt);this.hazards();this.collect(dt);this.objectives(dt);expeditionEvents(this);updateStory(this,dt);if(s.outcome)return;
  s.enemies=s.enemies.filter(e=>e.hp>0);
  if(t.hp<=0){this.finish('lost');return;}
  updateGauntlet(this);if(s.outcome)return;
  if(s.bossDead&&s.mode!=='story'&&s.mode!=='bossrush'){if(s.mode==='endless'){s.world.cycle++;s.bossDead=false;s.bossSpawned=false;this.heal(10);this.notify('Neue Runde · Gegner werden stärker.');}else{this.finish('win');return;}}
  if(s.mode!=='story'&&s.mode!=='endless'&&s.mode!=='bossrush'&&s.time>=s.duration+s.bossLimit){this.finish('timeout');return;}
  if(s.xp>=xpNeeded(s.level)){
   s.xp-=xpNeeded(s.level);s.level++;s.screen='level';s.choices=this.choices();
   this.fx('level',t,0xffe278,80,1.2,{value:s.level});
   this.soundEvents.push('level');
  }
 }
 finish(outcome:RunState['outcome']){this.s.outcome=outcome;this.s.screen='result';this.soundEvents.push(outcome==='win'?'win':'lost');}
 once(id:string,callback:()=>void){if(!this.s.events.includes(id)){this.s.events.push(id);callback();}}
 events(){
  const s=this.s,clock=this.scaledTime();
  if(s.mode==='story'||s.mode==='bossrush')return;
  [60,180,360,540,720,960].forEach((at,i)=>{
   if(clock>=at)this.once('encounter-'+i,()=>this.addEncounter(s.encounterRoster[i],'encounter-'+i));
  });
  [420,840].forEach((at,i)=>{
   if(clock>=at&&!s.completed.includes('camp'))this.once('merchant-'+i,()=>{s.merchantPos={x:s.trainer.x+120,y:s.trainer.y+50};s.merchantUntil=-1;s.merchantStock={stones:2,balls:3};this.notify('Ein Ranger bietet Vorräte an.');});
  });
  if(clock>=1080)this.once('boss-warning',()=>this.notify(SPECIES[expeditionBoss(s.seed,s.world.cycle,s.mode==='learn').species].name+' erwacht. Bereite dein Team vor!'));
  if(s.time>=s.duration*(s.world.cycle+1)&&!s.bossSpawned){s.bossSpawned=true;const boss=expeditionBoss(s.seed,s.world.cycle,s.mode==='learn');this.addEnemy(boss.species,'boss');this.notify(SPECIES[boss.species].name+' · '+boss.title);this.soundEvents.push('boss');}
 }
 spawn(dt:number){
  const s=this.s;if(s.mode==='bossrush'||s.interior||s.bossSpawned||s.mode==='story'&&(s.story.active||kantoLocationAt(s.trainer).safe&&dist(kantoLocationAt(s.trainer),s.trainer)<kantoLocationAt(s.trainer).radius))return;
  const minute=this.scaledTime()/60;
  const rate=minute<3?2.1:minute<7?3.3:minute<12?4.5:minute<16?5.8:7;
  s.spawnBudget=Math.min(4,s.spawnBudget+rate*difficulty(s).spawn*dt);
  const cap=minute<3?80:minute<7?140:minute<12?220:minute<16?300:400;
  const pool=s.mode==='story'?kantoLocationAt(s.trainer).encounters:[10,19,13,16,41,23,43,69].slice(0,Math.min(8,2+Math.floor(minute/3)));
  while(s.spawnBudget>=1){s.spawnBudget--;if(s.enemies.length<cap&&pool.length)this.addEnemy(pool[Math.floor(this.random()*pool.length)],'wild');}
 }
 addEnemy(species:number,kind:Enemy['kind'],point?:Point,encounterId?:string){
  const s=this.s,a=this.random()*Math.PI*2,d=550+this.random()*100;
  const radius=kind==='boss'?48:kind==='elite'?22:14;
  const pos=worldPoint(s,point??{x:s.trainer.x+Math.cos(a)*d,y:s.trainer.y+Math.sin(a)*d},radius);
  const minute=this.scaledTime()/60;
  const hp=kind==='boss'?(s.mode==='learn'?3500:7600)*(s.mode==='endless'?1+s.world.cycle*.15:1):kind==='elite'?220+minute*15:kind==='guardian'?140:kind==='encounter'?70+minute*6:10+minute*2.5;
  const e:Enemy={...pos,uid:s.nextId++,species,hp,maxHp:hp,speed:kind==='boss'?30:kind==='encounter'?45:48+Math.min(40,minute*1.6)+(species===19?8:0),r:kind==='boss'?48:kind==='elite'?22:14,kind,encounterId,slowUntil:0,burnUntil:0,burnNext:0,burnPower:0,nextAttack:s.time+3,flash:0};
  if(encounterId===undefined)delete e.encounterId;
  e.hp=e.maxHp=hp*difficulty(s).hp*(kind==='boss'?(s.difficulty==='master'?3:s.difficulty==='veteran'?1.5:1):1);e.speed*=difficulty(s).speed;
  if(['wild','elite','encounter'].includes(kind))e.shiny=isShinyEncounter(s.seed,'wild:'+e.uid+':'+species);
  s.enemies.push(e);return e;
 }
 addEncounter(species:number,id:string,point?:Point){
  if(!SPECIES[species])throw new Error('Ungültige Begegnung.');
  const s=this.s,a=this.random()*6.28;
  const pos=worldPoint(s,point??{x:s.trainer.x+Math.cos(a)*280,y:s.trainer.y+Math.sin(a)*280});
  const encounter={...pos,id,species,shiny:isShinyEncounter(s.seed,'encounter:'+id),ready:false,claimed:false};s.encounters.push(encounter);
  this.addEnemy(species,'encounter',pos,id).shiny=encounter.shiny;this.notify((encounter.shiny?'✦ Shiny! ':'')+SPECIES[species].name+' möchte dein Können sehen.');this.soundEvents.push('cry:'+species);return encounter;
 }
 partners(dt:number){
  const s=this.s,active=this.activePartners();
  active.forEach((p,i)=>{
   if(s.time-(s.lastTrainerHit??0)>5)p.stamina=Math.min(100,p.stamina+dt*(s.enemies.some(f=>f.hp>0&&(f.kind==='boss'||f.storyLeader))?2.5:1));
   const angle=s.formation==='ring'?i*2*Math.PI/3-Math.PI/2:s.formation==='wedge'?Math.atan2(s.trainer.dy,s.trainer.dx)+(i-1)*.8:Math.atan2(-s.trainer.dy,-s.trainer.dx);
   const gap=s.formation==='trail'?42+i*28:58,dest={x:s.trainer.x+Math.cos(angle)*gap,y:s.trainer.y+Math.sin(angle)*gap},delta=dist(p,dest);
   if(!s.fields.some(f=>f.kind==='charge'&&f.owner===p.uid)){
    if(delta>320){Object.assign(p,worldPoint(s,dest));}else if(delta>3)this.follow(p,dest,Math.min(delta,delta*dt*7),10,p.uid);
   }
   if(p.traitNext<=s.time){
    const healing=SPECIES[p.species].traitKind==='heal';
    if(healing&&s.enemies.some(f=>f.hp>0))this.combatHeal(1+SPECIES[p.species].stage);
    if(SPECIES[p.species].traitKind==='guard')s.trainer.shield=Math.max(s.trainer.shield,12*(1+this.bonus('shield')*.08));p.traitNext=s.time+(healing?45:12);
   }
   if(s.time<s.deployReady||s.time<p.nextFire[0])return;
   const stats=attackStats(s,p),range=stats.move.pattern==='nova'?stats.size:stats.move.pattern==='orbit'?stats.range+stats.size:stats.range;
   let target=s.enemies.find(f=>f.uid===s.focus&&f.hp>0&&dist(p,f)<=range);
   if(!target)target=s.enemies.filter(f=>f.hp>0&&dist(p,f)<=range).sort((a,b)=>dist(p,a)-dist(p,b))[0];
   if(!target)return;fireWeapon(this,p,stats,target);p.nextFire[0]=s.time+stats.interval;
  });
 }
 hit(e:Enemy,power:number,type:Element,burn=false,slow=false,secondary=false){
  if(e.hp<=0)return;
  const s=this.s,focus=e.uid===s.focus?1+this.bonus('focus')*.06:1;
  const n=Math.max(1,Math.round(power*typeFactor(type,SPECIES[e.species].types)*focus*((e.braceUntil??0)>s.time?.5:1)));
  e.hp-=n;s.damageDone+=n;e.flash=s.time+.1;
  if(burn){e.burnUntil=s.time+4*(1+this.bonus('status')*.08);e.burnPower=power*.1;}
  if(slow)e.slowUntil=s.time+2*(1+this.bonus('status')*.08);
  this.fx('hit',e,SPECIES[e.species].color,12,.4,{type,value:n});
  if(e.hp<=0)this.defeat(e);else if(!secondary)boonResonance(this,e,type,power);
 }
 defeat(e:Enemy){
  const s=this.s;s.kills++;if(s.focus===e.uid)s.focus=null;
  // XP is credited to the partners fighting now, never to a reserve switched in at pickup time.
  this.awardPartnerXp((e.kind==='boss'?100:e.kind==='elite'?20:e.kind==='wild'?1:6)*(s.mode==='learn'?2.5:s.mode==='story'?3:1));
  this.fx('faint',e,SPECIES[e.species].color,e.r,.35,{species:e.species});
  if((e.kind==='boss'||e.storyLeader||e.kind==='elite')&&!s.clearedBosses.includes(e.species))s.clearedBosses.push(e.species);
  if(e.kind==='boss'){s.bossDead=true;if(s.mode==='endless')dropTreasure(this,e);return;}
  if(e.encounterId){
   const en=s.encounters.find(c=>c.id===e.encounterId);
   if(en){en.ready=true;en.x=e.x;en.y=e.y;this.notify(SPECIES[e.species].name+' ist bereit. Nähe suchen und E drücken.');}
  }
  questDefeated(this,e);
  storyDefeated(this,e);if(e.kind==='elite')dropTreasure(this,e);
  if(e.siteId&&!s.encounters.some(c=>c.id===e.siteId))s.encounters.push({id:e.siteId,species:e.species,shiny:e.shiny,x:e.x+45,y:e.y,ready:true,claimed:false});
  if(e.shiny&&!e.encounterId&&!e.siteId){s.encounters.push({id:'shiny:'+e.uid,species:e.species,shiny:true,x:e.x,y:e.y,ready:true,claimed:false});this.notify('✦ Shiny '+SPECIES[e.species].name+' · E zum Fangen!');}
  const xp=(e.kind==='elite'?20:e.kind==='wild'?1:6)*(s.mode==='learn'?2.5:s.mode==='story'?3:1);
  s.pickups.push({uid:s.nextId++,x:e.x,y:e.y,kind:'xp',value:xp});
  if(e.kind==='elite')s.coins+=Math.round(10*difficulty(s).reward);
  else if(this.random()<.10)s.pickups.push({uid:s.nextId++,x:e.x+7,y:e.y,kind:'coin',value:1});
  if(this.random()<.002&&s.time>=s.healing.nextDrop){s.healing.nextDrop=s.time+60;s.pickups.push({uid:s.nextId++,x:e.x-7,y:e.y,kind:'heal',value:10});}
  compactPickups(s.pickups);
 }
 projectiles(dt:number){updateProjectiles(this,dt);}
 damageTrainer(power:number,teamStress=false){
  const s=this.s,t=s.trainer;if(s.time<t.invincibleUntil||s.time<t.dashUntil)return false;
  const guard=this.activePartners().reduce((v,p)=>Math.max(v,SPECIES[p.species].traitKind==='guard'?.06+SPECIES[p.species].stage*.02:0),0);
  const n=Math.max(1,Math.round(power*difficulty(s).damage*(1-Math.min(.55,this.bonus('armor')*.04+guard+badgeProtection(s)))));
  const absorb=Math.min(t.shield,n);t.shield-=absorb;t.hp=Math.max(0,t.hp-(n-absorb));t.invincibleUntil=s.time+.75;
  s.lastTrainerHit=s.time;
  // Followers cannot dodge independently. Only a real trainer hit costs team stamina.
  if(teamStress)for(const p of this.activePartners()){
   p.stamina=Math.max(0,p.stamina-Math.min(26,n*.6)*(1-this.bonus('endurance')*.06));
   if(p.stamina<=0){p.recoveryUntil=s.time+12;this.notify(SPECIES[p.species].name+' erholt sich für 12 Sekunden.');}
  }
  if(t.hp<=0&&hasBoon(s,'second-wind')&&!s.boonState?.spent){
   const state=s.boonState??=freshBoonState();state.spent=true;t.hp=30;t.invincibleUntil=s.time+2;
   for(const p of s.party){p.recoveryUntil=0;p.stamina=Math.min(100,p.stamina+40);}
   this.fx('heal',t,0xffd47b,95,1,{label:'Phönixfeder'});this.notify('Phönixfeder verbraucht · Du stehst wieder auf!');
  }
  this.soundEvents.push('hurt');this.fx('hit',t,0xff9a89,26,.3);return true;
 }
 enemies(dt:number){
  const s=this.s,t=s.trainer;
  for(const e of s.enemies){
   if(e.hp<=0)continue;
   advanceBossPhase(this,e);
   if(e.burnUntil>s.time&&e.burnNext<=s.time){e.burnNext=s.time+1;e.hp-=Math.max(1,Math.round(e.burnPower));if(e.hp<=0){this.defeat(e);continue;}}
   const home=e.questId==='camp'?CRATES[e.objective??0]:null;
   if(home&&dist(t,home)>210){if(dist(e,home)>50)this.move(e,(home.x-e.x)*Math.min(1,dt*2),(home.y-e.y)*Math.min(1,dt*2),e.r*.55);continue;}
   const chase=s.boonState?.lure&&s.boonState.lure.until>s.time?s.boonState.lure:t;
   const d=dist(e,chase);
   if(d>e.r+10){
    const speed=e.speed*(e.slowUntil>s.time?(e.kind==='boss'?.85:.75):1);
    this.follow(e,chase,speed*dt,e.r*.55,e.uid);
   }else if(chase===t)this.damageTrainer(e.kind==='boss'||e.storyLeader?18:e.kind==='elite'?12:6,!!(e.kind==='boss'||e.storyLeader));
   if(e.kind==='boss'&&e.nextAttack<=s.time){this.bossAttack(e);e.nextAttack=s.time+bossInterval(this,e);}
   if(e.storyLeader&&e.nextAttack<=s.time){storyAttack(this,e);e.nextAttack=s.time+bossInterval(this,e);}
   if((e.kind==='elite'||e.questId==='tree'&&e.objective===3)&&e.nextAttack<=s.time){
    attackBoss(this,e);e.nextAttack=s.time+bossInterval(this,e);
   }
  }
 }
 follow(body:Point&{navigation?:Detour},target:Point,step:number,r:number,id:number){
  let detour=body.navigation;
  if(detour){
   if(!crossesObstacle(body,target,detour.obstacle,r+1)){delete body.navigation;detour=undefined;}
   else{
    if(dist(body,detour.points[0])<Math.max(4,step*2))detour.points.shift();
    if(detour.points.length){const goal=detour.points[0],d=dist(body,goal);this.move(body,(goal.x-body.x)/d*Math.min(step,d),(goal.y-body.y)/d*Math.min(step,d),r);return;}
    delete body.navigation;
   }
  }
  const angle=Math.atan2(target.y-body.y,target.x-body.x),before={x:body.x,y:body.y};
  this.move(body,Math.cos(angle)*step,Math.sin(angle)*step,r);
  if(dist(body,before)>step*.45)return;
  const route=findDetour(this.s,body,target,r);
  if(route){body.navigation=route;return;}
  // A stable side prevents frame-to-frame left/right jitter at a trunk or a wall.
  const side=id%2?1:-1;
  for(const turn of [Math.PI/3,Math.PI/2,Math.PI*2/3]){
   const candidate={...before};moveBody(this.s,candidate,Math.cos(angle+side*turn)*step,Math.sin(angle+side*turn)*step,r);
   if(dist(candidate,before)>step*.7){body.x=candidate.x;body.y=candidate.y;break;}
  }
 }
 hazard(shape:Hazard['shape'],p:Point,angle:number,r:number,width:number,warning:number,damage:number,style:Hazard['style']='spores'){
  const s=this.s;warning*=difficulty(s).warning;s.hazards.push({x:p.x,y:p.y,uid:s.nextId++,shape,style,createdAt:s.time,angle,r,width,warnUntil:s.time+warning,expire:s.time+warning+.85,fired:false,damage});
 }
 bossAttack(e:Enemy){attackBoss(this,e);}
 inHazard(p:Point,h:Hazard){
  const dx=p.x-h.x,dy=p.y-h.y,d=Math.hypot(dx,dy);
  if(h.shape==='circle')return d<h.r;
  if(h.shape==='ring')return Math.abs(d-h.r)<h.width;
  const along=dx*Math.cos(h.angle)+dy*Math.sin(h.angle),across=Math.abs(-dx*Math.sin(h.angle)+dy*Math.cos(h.angle));
  return along>=0&&along<h.r&&across<h.width;
 }
 hazards(){
  const s=this.s;
  for(const h of s.hazards)if(!h.fired&&h.warnUntil<=s.time){
   h.fired=true;
   if(this.inHazard(s.trainer,h)){
    if(s.time<s.trainer.dashUntil)boonDodge(this);
    this.damageTrainer(h.damage,true);
   }
  }
  s.hazards=s.hazards.filter(h=>h.expire>s.time);
 }
 collect(dt:number){
  const s=this.s,rat=this.activePartners().reduce((n,p)=>Math.max(n,SPECIES[p.species].traitKind==='magnet'?(SPECIES[p.species].stage?.3:.2):0),0);
  const radius=55*(1+this.bonus('magnet')*.15+rat+(s.completed.includes('camp')?.25:0));
  for(const p of s.pickups){
   const d=dist(p,s.trainer);
   if(d<radius&&d>10){p.x+=(s.trainer.x-p.x)*Math.min(1,dt*12);p.y+=(s.trainer.y-p.y)*Math.min(1,dt*12);}
   if(d<18){
    this.fx('collect',p,p.kind==='xp'?0x5bc6ff:p.kind==='heal'?0xff8ca5:0xffdf72,12,.35,{value:p.kind==='xp'?p.value:undefined,label:p.kind});
    if(p.kind==='xp'){
     s.xp+=p.value*(1+this.bonus('study')*.05);
     if(boonReady(this,'magnet-wave',12)){
      for(const loot of s.pickups)if(['xp','coin'].includes(loot.kind)&&dist(loot,s.trainer)<360)Object.assign(loot,{x:s.trainer.x,y:s.trainer.y});
      this.fx('pulse',s.trainer,0x88d3ff,170,.5,{label:'Sammelwelle'});
     }
    }
    if(p.kind==='coin')s.coins+=p.value;
    if(p.kind==='heal')this.heal(p.value);
    if(p.kind==='stamina')for(const partner of this.activePartners())partner.stamina=Math.min(100,partner.stamina+p.value);
    p.value=0;
   }
  }
  s.pickups=s.pickups.filter(p=>p.value>0);
 }
 heal(n:number,applyBonus=true){const t=this.s.trainer,old=t.hp;t.hp=Math.min(t.maxHp,t.hp+n*(applyBonus?1+this.bonus('heal')*.08:1));if(t.hp>old)this.fx('heal',t,0x8be68a,35,.6,{value:Math.round(t.hp-old)});}
 combatHeal(n:number){const s=this.s;if(s.time<s.healing.nextCombat||s.trainer.hp>=100)return;s.healing.nextCombat=s.time+10;this.heal(Math.min(3,n),false);}
 enterBuilding(id:string){return enterBuilding(this,id);}
 leaveBuilding(){return leaveBuilding(this);}
 objectives(dt:number){if(this.s.mode!=='story'&&this.s.mode!=='bossrush')updateQuests(this,dt);}
 startStory(id:string){return startStory(this,id);}
 abortStory(){return abortStory(this);}
 startQuest(id:QuestId){return this.s.mode!=='story'&&this.s.mode!=='bossrush'&&startQuest(this,id);}
 interact(){
  const s=this.s;if(s.screen!=='play'||s.mode==='bossrush')return false;
  const ready=s.encounters.find(e=>e.ready&&!e.claimed&&dist(e,s.trainer)<100);
  if(ready){s.pendingId=ready.id;s.screen='capture';return true;}
  if(!s.interior&&openTreasure(this))return true;
  if(s.mode==='story'){if(interactStory(this))return true;}else if(interactQuest(this))return true;
  if(s.merchantUntil!==null&&(s.merchantUntil===-1||s.time<s.merchantUntil)&&dist(s.trainer,s.merchantPos)<120){s.screen='merchant';return true;}
  return false;
 }
 claimReward(kind:string,id?:string){return claimQuestReward(this,kind,id);}
 capture(replaceUid?:number,campOnly=false){
  const s=this.s,en=s.encounters.find(e=>e.id===s.pendingId);
  if(s.screen!=='capture'||!en||!en.ready||en.claimed)return false;
  const existing=s.party.find(p=>p.species===en.species),duplicate=!!existing&&(!en.shiny||!!existing.shiny);
  if(!duplicate&&s.balls<1){this.notify('Du brauchst einen Pokéball. Die Begegnung bleibt hier.');return false;}
  if(!duplicate&&!existing&&!campOnly&&s.party.length>=6&&!s.party.some(p=>p.uid===replaceUid))return false;
  en.claimed=true;if(!duplicate)s.balls--;
  if(!s.caught.includes(en.species))s.caught.push(en.species);
  if(en.shiny&&!s.shinyCaught?.includes(en.species))(s.shinyCaught??=[]).push(en.species);
  if(existing&&en.shiny&&!campOnly)existing.shiny=true;
  if(!duplicate&&!existing&&!campOnly){
   const p=makePartner(s,en.species);p.shiny=!!en.shiny;
   if(s.party.length>=6){
    const index=s.party.findIndex(q=>q.uid===replaceUid),old=s.party[index];
    p.ranks=[...old.ranks];p.points=old.points;p.nextFire=old.nextFire.map(n=>Math.max(n,s.time+1));
    s.fields=s.fields.filter(f=>f.owner!==old.uid);s.shots=s.shots.filter(f=>f.owner!==old.uid);
    s.party[index]=p;s.active=s.active.map(uid=>uid===old.uid?p.uid:uid);
   }else{s.party.push(p);if(s.active.length<activeCapacity(s))s.active.push(p.uid);}
   s.deployReady=Math.max(s.deployReady,s.time+1);
  }
  s.screen='play';s.pendingId=null;this.notify(duplicate?'Begegnung erforscht. Kein Ball verbraucht.':(en.shiny?'✦ Shiny ':'')+SPECIES[en.species].name+(campOnly?' ist im Camp registriert!':' ist deinem Team beigetreten!'));
  this.fx('capture',en,0xffe786,65,1,{species:en.species});this.soundEvents.push('catch','cry:'+en.species);return true;
 }
 canPassive(id:string){
  if(id==='duration'&&!this.s.party.some(p=>['zone','orbit','mine'].includes(SPECIES[p.species].weapon.pattern)))return false;
  if(id==='velocity'&&!this.s.party.some(p=>['shot','fan','burst','boomerang','ricochet','orbit'].includes(SPECIES[p.species].weapon.pattern)))return false;
  if(id==='shots'&&!this.s.party.some(p=>['shot','fan','burst','boomerang','ricochet'].includes(SPECIES[p.species].weapon.pattern)))return false;
  if(id==='status'&&!this.s.party.some(p=>SPECIES[p.species].weapon.burn||SPECIES[p.species].weapon.slow))return false;
  if(id==='shield'&&!this.s.party.some(p=>SPECIES[p.species].traitKind==='guard'))return false;
  return PASSIVES.some(p=>p.id===id)&&(this.s.passives[id]??0)<5&&(id in this.s.passives||Object.keys(this.s.passives).length<6);
 }
 choices():Choice[]{
  return levelRewards(this);
 }
 choose(index:number){
  const s=this.s,c=s.choices[index];if(s.screen!=='level'||!c)return false;
  if(c.kind==='rank'){
   const p=this.getPartner(c.uid!);if(!p||c.slot!==0||p.ranks[0]>=8)return false;const gain=upgradeRanks(c,p.ranks[0],8);p.ranks[0]+=gain;p.points+=gain;
  }else if(c.kind==='passive'){if(!this.canPassive(c.id!))return false;const rank=s.passives[c.id!]??0;s.passives[c.id!]=rank+upgradeRanks(c,rank,5);}
  else if(c.kind==='evolve'){if(!this.evolve(c.uid!,c.target))return false;}
  else if(c.kind==='boon'){
   const b=BOONS.find(b=>b.id===c.id),owned=s.boons??[],order={rare:1,epic:2,legendary:3};
   if(!b||hasBoon(s,b.id))return false;
   const old=c.replaceBoon?BOONS.find(b=>b.id===c.replaceBoon):undefined;
   if(c.replaceBoon&&(!old||!owned.includes(old.id)||order[b.rarity]<=order[old.rarity]))return false;
   if(owned.length>=3&&!old)return false;
   s.boons=[...owned.filter(id=>id!==old?.id),b.id];this.fx('level',s.trainer,0xe7bdff,80,1,{label:b.name});
  }
  else this.heal(5*rarityOf(c).ranks);
  s.screen='play';s.choices=[];this.soundEvents.push('select');return true;
 }
 reroll(){if(this.s.screen!=='level'||this.s.rerolls<=0)return false;this.s.rerolls--;this.s.choices=this.choices();return true;}
 skip(){if(this.s.screen!=='level'||this.s.skips<=0)return false;this.s.skips--;this.s.screen='play';this.s.choices=[];return true;}
 setActive(ids:number[]){
  const s=this.s;
  if(s.time<s.swapReady||!ids.length||ids.length>activeCapacity(s)||new Set(ids).size!==ids.length||ids.some(id=>!this.getPartner(id)||this.getPartner(id)!.recoveryUntil>s.time))return false;
  s.active=[...ids];s.swapReady=s.time+20;s.deployReady=s.time+1;this.fx('switch',s.trainer,0x85d4ff,75,.7);this.soundEvents.push('select');return true;
 }
 setMoves(uid:number,slots:number[]){return !!this.getPartner(uid)&&slots.length===1&&slots[0]===0;}
 evolutionReason(uid:number,target?:number):string|null{
  const p=this.getPartner(uid);if(!p)return 'Partner fehlt.';
  const ev=target===undefined?SPECIES[p.species].evolves:SPECIES[p.species].evolutions.find(e=>e.to===target);if(!ev)return 'Keine passende Entwicklung.';
  if(this.s.party.some(q=>q.species===ev.to))return SPECIES[ev.to].name+' ist bereits im Team.';
  if(p.level<ev.level)return 'Pokémon-Level '+ev.level+' nötig · aktuell '+p.level;
  if(battleLevel(this.s,p)<ev.level)return 'Nächsten Orden gewinnen · Pokémon-Levelgrenze '+partnerLevelCap(this.s);
  if(ev.stone&&Math.max(...p.ranks)<3)return 'Ein Angriff auf Rang 3';
  if(ev.stone&&!(this.s.bag[ev.stone]>0))return STONES[ev.stone]+' fehlt';
  return null;
 }
 evolve(uid:number,target?:number){
  if(this.evolutionReason(uid,target))return false;
  const s=this.s,p=this.getPartner(uid)!,ev=target===undefined?SPECIES[p.species].evolves!:SPECIES[p.species].evolutions.find(e=>e.to===target)!;
  if(ev.stone)s.bag[ev.stone]--;
  s.fields=s.fields.filter(f=>f.owner!==uid);s.shots=s.shots.filter(f=>f.owner!==uid);
  p.species=ev.to;if(p.shiny&&!s.shinyCaught?.includes(ev.to))(s.shinyCaught??=[]).push(ev.to);s.evolved.push(ev.to);if(!s.caught.includes(ev.to))s.caught.push(ev.to);
  p.nextFire=p.nextFire.map(n=>Math.max(n,s.time+1));
  this.notify(SPECIES[ev.to].name+' · Entwicklung abgeschlossen!');this.fx('evolve',p,0xffdf8d,90,1.4,{owner:p.uid,species:ev.to});this.soundEvents.push('evolve','cry:'+ev.to);return true;
 }
 buy(kind:string,id?:string){
  const s=this.s;if(s.screen!=='merchant'||s.mode==='story'&&roomNpcNear(s)?.role!=='shop')return false;
  const price=kind==='stone'?75:kind==='ball'?20:kind==='heal'?75:50;
  if(kind==='heal'&&(s.healing.purchased>=2||s.trainer.hp>=100))return false;
  if(s.coins<price)return false;
  if(kind==='stone'&&(!id||!STONES[id]||s.merchantStock.stones<1))return false;
  if(kind==='ball'&&s.merchantStock.balls<1)return false;
  if(kind==='passive'&&!this.canPassive(id??''))return false;
  if(!['stone','ball','heal','passive'].includes(kind))return false;
  s.coins-=price;
  if(kind==='stone'){s.bag[id!]=(s.bag[id!]??0)+1;if(s.mode!=='story')s.merchantStock.stones--;}
  if(kind==='ball'){s.balls++;if(s.mode!=='story')s.merchantStock.balls--;}
  if(kind==='heal'){s.healing.purchased++;this.heal(10);}
  if(kind==='passive')s.passives[id!]=(s.passives[id!]??0)+1;
  this.soundEvents.push('reward');return true;
 }
 context():string{
  const s=this.s;
  const en=s.encounters.find(e=>e.ready&&!e.claimed&&dist(e,s.trainer)<100);
  if(en)return 'E · '+SPECIES[en.species].name+' aufnehmen';
  if(!s.interior&&s.world.treasures.some(c=>!c.opened&&dist(c,s.trainer)<80))return 'E · Schatztruhe öffnen';
  if(s.mode==='bossrush')return s.bossSpawned?'Bossansturm · '+Math.ceil(Math.max(0,s.gauntlet.deadline-s.time))+' Sekunden · Tab: Team & Entwicklung':'Nächste Prüfung in '+Math.ceil(Math.max(0,s.gauntlet.nextAt-s.time))+' Sekunden · Tab: Team vorbereiten';
  if(s.mode==='story')return storyContext(s);
  const crate=CRATES.findIndex((c,i)=>s.quests.camp.started&&!s.quests.camp.collected.includes(i)&&dist(c,s.trainer)<55);if(crate>=0)return 'E · Vorratskiste '+(crate+1)+' sichern';
  const p=POIS.find(p=>!s.completed.includes(p.id)&&dist(s.trainer,p)<120);
  if(p)return p.name+' · '+questStatus(s,p.id as QuestId);
  if(s.merchantUntil!==null&&(s.merchantUntil===-1||s.time<s.merchantUntil)&&dist(s.trainer,s.merchantPos)<120)return 'E · Rangerhandel';
  return '';
 }
}
