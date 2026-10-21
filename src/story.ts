import {difficulty} from './difficulty.ts';
import {storyBossHealth} from './story-trials.ts';
import {badgeReward} from './badge-progress.ts';
import {attackBoss} from './bosses.ts';
import {KANTO_LOCATIONS,KANTO_STORY,KANTO_GYMS,KANTO_START} from './kanto-world-catalog.ts';
import {SPECIES} from './data.ts';
import type {Engine,Enemy,RunState} from './engine.ts';
import {currentLocation,worldPoint} from './world.ts';
import {activeRoom,roomNpcNear,doorNear,stageBuilding,storyAnchor,roomContains,buildingAccess} from './interior-layout.ts';
import {enterBuilding,leaveBuilding,roomExitNear} from './interiors.ts';
import {serviceAt,buildingDoor} from './kanto-layout.ts';
export interface StoryProgress {done:string[];unlocks:string[];active:string|null;wave:number;progress:number;nextWave:number;startedAt:number;healReady:number;visited:string[];checkpoint:string}
export const newStory=():StoryProgress=>({done:[],unlocks:[],active:null,wave:0,progress:0,nextWave:0,startedAt:0,healReady:0,visited:[],checkpoint:KANTO_START.locationId});
export const storyStage=(id:string)=>KANTO_STORY.find(q=>q.id===id);
export const badgeCount=(s:RunState)=>KANTO_GYMS.filter(g=>s.story.done.includes(g.id)).length;
export const availableStages=(s:RunState)=>KANTO_STORY.filter(q=>!s.story.done.includes(q.id)&&q.requires.every(id=>s.story.done.includes(id)));
export const nextStoryStage=(s:RunState)=>s.story.active?storyStage(s.story.active):availableStages(s)[0];
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
export function storyContext(s:RunState){
 const st=s.story,room=activeRoom(s);
 if(st.active){const q=storyStage(st.active)!;return `${q.title} · Welle ${st.wave}/${q.waves} · ${s.enemies.filter(e=>e.storyId===q.id&&e.hp>0).length} Gegner`+(st.progress<q.duration?' · '+Math.floor(st.progress)+'/'+q.duration+' s':'');}
 if(room){
  if(distance(s.trainer,room.exit)<75)return 'E · '+room.building.name+' verlassen';
  const npc=roomNpcNear(s);if(npc)return 'E · '+npc.name+(npc.role==='heal'?' · Pokémon-Ausdauer auffüllen':npc.role==='shop'?' · Einkaufen':npc.role==='story'?' · Ansprechen':' · Sprechen');
  return room.building.name+' · Sprich mit den Personen · Ausgang unten';
 }
 const door=doorNear(s);if(door)return buildingAccess(s,door).open?'E · '+door.name+' betreten':door.name+' · Geschlossen · E: Hinweis';
 const loc=currentLocation(s),stage=availableStages(s).find(q=>q.locationId===loc.id&&!stageBuilding(q));
 if(distance(loc,s.trainer)<180&&stage)return 'E · '+stage.title;
 const next=nextStoryStage(s),goal=next&&storyAnchor(next);
 return next&&goal?`${next.title} · ${Math.round(distance(s.trainer,goal)/32)} Schritte · M: Karte`:'Kanto erkunden · M: Karte';
}
export function interactStory(e:Engine){
 const s=e.s;if(s.mode!=='story')return false;
 if(s.interior&&roomExitNear(e))return leaveBuilding(e);
 if(s.story.active)return false;
 const room=activeRoom(s);
 if(room){
  const npc=roomNpcNear(s);if(!npc)return false;
  const available=availableStages(s).find(q=>stageBuilding(q)?.id===room.building.id);
  if(npc.role==='shop'){
   s.screen='merchant';s.merchantStock={stones:2,balls:3};return true;
  }
  if(npc.role==='heal'){
   if(s.time<s.story.healReady){e.banner('heal-cooldown','info','Das Team wurde gerade versorgt','Schwester Joy ist in '+Math.ceil(s.story.healReady-s.time)+' Sekunden wieder bereit.');return true;}
   s.party.forEach(p=>{p.stamina=100;p.recoveryUntil=0;e.fx('heal',p,0x8be68a,25,.6);});s.story.healReady=s.time+20;s.story.checkpoint=room.building.locationId;
   if(!s.story.visited.includes(room.building.locationId)){s.story.visited.push(room.building.locationId);s.balls+=3;s.coins+=20;}
   e.banner('healed:'+room.building.id,'info','Schwester Joy · Deine Pokémon sind wieder fit','Pokémon-Ausdauer aufgefüllt · Trainer-KP unverändert · Rastpunkt gespeichert.');e.soundEvents.push('heal');return true;
  }
  if(npc.role==='story'){
   if(available){s.screen='story';s.pendingId=available.id;return true;}
   const locked=room.quests.find(q=>!s.story.done.includes(q.id));
   e.banner('npc:'+room.building.id+':'+npc.id,locked?'blocked':'info',npc.name,locked?'Zuerst abschließen: '+locked.requires.filter(id=>!s.story.done.includes(id)).map(id=>storyStage(id)?.title??id).join(', '):'Dein Team hat diese Prüfung bestanden. Viel Erfolg auf deiner weiteren Reise!');return true;
  }
  e.banner('npc:'+room.building.id+':'+npc.id,'info',npc.name,npc.text);return true;
 }
 const door=doorNear(s);if(door){enterBuilding(e,door.id);return true;}
 const loc=currentLocation(s),q=availableStages(s).find(q=>q.locationId===loc.id&&!stageBuilding(q));
 if(q&&distance(loc,s.trainer)<180){s.screen='story';s.pendingId=q.id;return true;}
 return false;
}
export function startStory(e:Engine,id:string){
 const s=e.s,q=availableStages(s).find(q=>q.id===id),loc=q&&KANTO_LOCATIONS.find(l=>l.id===q.locationId);
 if(s.mode!=='story'||s.screen!=='story'||s.pendingId!==id||!q||!loc||s.story.active)return false;
 const building=stageBuilding(q),room=activeRoom(s);
 if(building?room?.building.id!==building.id||roomNpcNear(s)?.role!=='story':!!room||distance(loc,s.trainer)>190)return false;
 Object.assign(s.story,{active:id,wave:0,progress:0,nextWave:s.time+.75,startedAt:s.time});s.screen='play';s.pendingId=null;
 // Starting a trial never moves the trainer or erases pursuers.
 s.hazards=[];s.shots=[];s.fields=[];s.focus=null;
 e.notify(q.title+' · '+q.objective);e.soundEvents.push('boss');return true;
}
export function abortStory(e:Engine){
 const s=e.s,id=s.story.active;if(!id)return false;
 s.enemies=s.enemies.filter(f=>f.storyId!==id);s.hazards=[];s.story.active=null;s.story.wave=0;s.story.progress=0;
 e.notify('Prüfung verlassen. Du kannst sie am selben Ort erneut beginnen.');return true;
}
/** The same checkpoint recovery used by the result screen and campaign tests. */
export function continueStory(e:Engine){
 const s=e.s;if(s.mode!=='story'||!s.outcome)return false;
 const lost=s.outcome!=='win';abortStory(e);s.outcome=null;s.bossDead=false;s.screen='play';s.pendingId=null;
 s.trainer.hp=100;s.enemies=[];s.hazards=[];s.shots=[];s.fields=[];
 if(s.boonState){s.boonState.echoes=[];s.boonState.lure=null;}
 if(lost){leaveBuilding(e,true);const center=serviceAt(s.story.checkpoint,'heal')??serviceAt('viridian','heal')!;Object.assign(s.trainer,buildingDoor(center));e.enterBuilding(center.id);s.coins=Math.floor(s.coins*.9);}
 s.party.forEach(p=>{p.stamina=100;p.recoveryUntil=0;p.x=s.trainer.x;p.y=s.trainer.y;});
 return true;
}
function completeStory(e:Engine){
 const s=e.s,st=s.story,q=storyStage(st.active!)!;if(st.done.includes(q.id))return;
 st.done.push(q.id);st.unlocks=[...new Set([...st.unlocks,...q.rewardUnlocks])];st.active=null;st.progress=0;st.wave=0;
 s.coins+=Math.round(q.coins*difficulty(s).reward);s.balls+=3;s.xp+=Math.ceil((12+6*(s.level-1)+1.5*(s.level-1)**2)*1.15);
 e.awardPartnerXp(30+st.done.length*5);
 // A story victory always offers practical progress, including a partner to catch.
 const species=q.team[q.team.length-1];
 if(species&&!s.caught.includes(species)){
  const id='story-catch:'+q.id,point=worldPoint(s,{x:s.trainer.x+120,y:s.trainer.y+65});s.encounters.push({id,species,...point,ready:true,claimed:false});
 }
 const stoneByGym=['link','water','thunder','leaf','moon','moon','fire','link'];
 const gym=KANTO_GYMS.findIndex(g=>g.id===q.id);if(gym>=0){const stone=stoneByGym[gym];s.bag[stone]=(s.bag[stone]??0)+1;}
 e.fx('quest',s.trainer,0xffe17a,130,2,{label:'Etappe geschafft'});e.soundEvents.push('reward');
 e.notify(q.title+' geschafft · +3 Bälle · +'+q.coins+' Münzen'+(gym>=0?' · '+KANTO_GYMS[gym].badge+' · '+badgeReward(gym):''));
 if(q.rewardUnlocks.includes('champion')){s.bossDead=true;e.finish('win');}
}
export function updateStory(e:Engine,dt:number){
 const s=e.s,st=s.story;if(s.mode!=='story')return;
 const loc=currentLocation(s);
 if(!st.active)return;
 const q=storyStage(st.active)!,origin=KANTO_LOCATIONS.find(l=>l.id===q.locationId)!;
 const room=activeRoom(s);
 if(room?stageBuilding(q)?.id!==room.building.id||!roomContains(s,s.trainer):!!stageBuilding(q)||distance(s.trainer,origin)>Math.max(origin.radius,480)+250){abortStory(e);return;}
 const foes=s.enemies.filter(f=>f.storyId===q.id&&f.hp>0);
 if(room||distance(s.trainer,origin)<Math.max(origin.radius,480))st.progress+=dt;
 if(foes.length||s.time<st.nextWave)return;
 if(st.wave>=q.waves){if(st.progress>=q.duration)completeStory(e);return;}
 const wave=st.wave++;
 const team=q.team.length?q.team:[19];
 const count=q.kind==='gym'||q.kind==='league'||q.kind==='rival'?Math.max(1,Math.ceil(team.length/q.waves)):Math.min(5,2+Math.floor(st.done.length/6));
 for(let i=0;i<count;i++){
  const finale=q.kind==='quest'&&wave===q.waves-1&&i===count-1;
  const species=finale?team.at(-1)!:team[(wave*count+i)%team.length],a=i/count*Math.PI*2+wave*.7;
  const foe=e.addEnemy(species,'guardian',{x:origin.x+Math.cos(a)*210,y:origin.y+Math.sin(a)*210});
  foe.storyId=q.id;foe.storyLeader=q.kind!=='quest'||finale;
  foe.hp=foe.maxHp=foe.storyLeader?storyBossHealth(s,q.id,wave):(36+st.done.length*5)*difficulty(s).hp;
  foe.speed=(foe.storyLeader?40:48)*difficulty(s).speed;
  foe.r=foe.storyLeader?29:14;foe.nextAttack=s.time+2.5;
 }
 st.nextWave=s.time+2;e.notify(q.title+' · Welle '+st.wave+'/'+q.waves);
}
export function storyDefeated(e:Engine,foe:Enemy){if(foe.storyId)e.s.story.nextWave=Math.max(e.s.story.nextWave,e.s.time+1.6);}
export function storyAttack(e:Engine,foe:Enemy){attackBoss(e,foe);}
