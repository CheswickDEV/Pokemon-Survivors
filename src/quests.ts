import {difficulty} from './difficulty.ts';
import {trialHealth} from './boss-balance.ts';
import {POIS,SPECIES,STONES} from './data.ts';
import type {Engine,RunState,Enemy} from './engine.ts';
export type QuestId='camp'|'garden'|'tree';
export interface QuestProgress {started:boolean;ready:boolean;wave:number;progress:number;collected:number[];channel:number|null;channelProgress:number;nextPulse:number}
export const QUEST_IDS:QuestId[]=['camp','garden','tree'];
export const createQuests=():Record<QuestId,QuestProgress>=>Object.fromEntries(QUEST_IDS.map(id=>[id,{started:false,ready:false,wave:0,progress:0,collected:[],channel:null,channelProgress:0,nextPulse:0}])) as unknown as Record<QuestId,QuestProgress>;
export const CRATES=[{x:1010,y:1780},{x:1300,y:2020},{x:1460,y:1900}];
export const SEALS=[{x:1050,y:1090},{x:1250,y:1090},{x:1150,y:940}];
export const QUESTS={
 camp:{title:'Verlorene Vorräte',story:'Die Ranger brauchen ihre Vorräte zurück. Wilde Pokémon bewachen drei verstreute Kisten.',steps:['Nimm den Auftrag im Rangerlager an.','Besiege die Wachen an den drei markierten Kisten.','Drücke E an einer freien Kiste und sichere sie 2,5 Sekunden lang.','Kehre mit allen Vorräten zum Lager zurück.'],perk:'Rangerversorgung: +25 % Sammelradius und ein Rangerladen bis zum Laufende.',coins:60,xp:.4},
 garden:{title:'Die Blütenwacht',story:'Giftige Schwärme bedrohen den Pollengarten. Befreie die Blüten und halte ihre Lichtung.',steps:['Rufe die Blütenwacht mit E.','Besiege drei aufeinanderfolgende Schwärme.','Bleibe nach jeder Welle zehn Sekunden im Blütenkreis.','Hole die Belohnung am Garten ab.'],perk:'Blütensegen: im Kampf alle 45 Sekunden bis zu +2 Trainer-KP.',coins:50,xp:.5},
 tree:{title:'Das Dornensiegel',story:'Drei Dornenherde verschließen den Alten Baum. Hinter ihnen wartet ein aufgebrachter Bibor-Wächter.',steps:['Beginne die Prüfung am Alten Baum.','Zerstöre die drei markierten Dornenherde.','Besiege den Bibor-Wächter und weiche seinen Giftstößen aus.','Kehre zum Baum zurück und öffne den Waldschatz.'],perk:'Waldkraft: +12 % Schaden für alle Partner.',coins:80,xp:.7}
};
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
const foes=(s:RunState,id:QuestId,objective?:number)=>s.enemies.filter(e=>e.hp>0&&e.questId===id&&(objective===undefined||e.objective===objective));
export function questStatus(s:RunState,id:QuestId){
 const q=s.quests[id];if(s.completed.includes(id))return 'Abgeschlossen · Segen aktiv';if(!q.started)return 'E · Auftrag annehmen';if(q.ready)return 'Schatz bereit · zum Ort zurückkehren';
 if(id==='camp')return `Vorräte ${q.collected.length}/3`+(q.channel!==null?` · Sichern ${Math.round(q.channelProgress/2.5*100)} %`:' · Wachen besiegen & Kisten bergen');
 if(id==='garden'){const count=foes(s,id).length;return count?`Welle ${q.wave}/3 · ${count} Gegner`:`Blüten schützen · ${Math.floor(q.progress)}/30 s`;}
 return q.wave===1?'Besiege den Bibor-Wächter':`Dornenherde ${Math.min(3,q.progress)}/3 zerstört`;
}
function spawn(e:Engine,id:QuestId,species:number,point:{x:number;y:number},objective:number,hp:number,immobile=false){
 const foe=e.addEnemy(species,id==='tree'?'guardian':'wild',point);foe.questId=id;foe.objective=objective;foe.hp=foe.maxHp=hp*difficulty(e.s).hp;foe.speed=immobile?0:45;return foe;
}
function gardenWave(e:Engine){
 const q=e.s.quests.garden;q.wave++;const c=POIS[1],count=3+q.wave;
 for(let i=0;i<count;i++){const a=i/count*Math.PI*2;spawn(e,'garden',q.wave===3?49:13,{x:c.x+Math.cos(a)*165,y:c.y+Math.sin(a)*165},q.wave,24+q.wave*8);}
 if(q.wave===3)questLeader(e,spawn(e,'garden',45,{x:c.x,y:c.y-180},3,1),300);
 e.notify(`Blütenwacht · Welle ${q.wave}/3!`);e.soundEvents.push('warning');
}
function questLeader(e:Engine,foe:Enemy,base:number){
 foe.kind='guardian';foe.storyLeader=true;foe.r=29;
 foe.hp=foe.maxHp=trialHealth(e.s,base);foe.nextAttack=e.s.time+2.5;
 foe.speed=40*difficulty(e.s).speed;return foe;
}
export function startQuest(e:Engine,id:QuestId){
 const s=e.s,q=s.quests[id];if(!q||q.started||s.completed.includes(id))return false;
 q.started=true;s.screen='play';s.pendingId=null;
 if(id==='camp')CRATES.forEach((p,index)=>{for(let j=0;j<3;j++){const a=j*Math.PI*2/3;spawn(e,id,[19,21,23][index],{x:p.x+Math.cos(a)*45,y:p.y+Math.sin(a)*45},index,28+index*5);}});
 if(id==='camp')questLeader(e,spawn(e,id,24,{x:CRATES[2].x+40,y:CRATES[2].y},2,1),250);
 if(id==='garden')gardenWave(e);
 if(id==='tree')SEALS.forEach((p,index)=>spawn(e,id,14,p,index,80,true));
 e.notify(QUESTS[id].title+' · Auftrag begonnen');e.soundEvents.push('select');return true;
}
function ready(e:Engine,id:QuestId){
 const q=e.s.quests[id];if(q.ready)return;q.ready=true;
 e.s.poiProgress[id]=POIS.find(p=>p.id===id)!.goal;
 const p=POIS.find(p=>p.id===id)!;e.fx('quest',p,0xffdd75,90,1.5,{label:'Schatz bereit'});e.notify(p.name+' gesichert! Kehre zurück und öffne den Schatz.');e.soundEvents.push('reward');
}
export function questDefeated(e:Engine,enemy:Enemy){
 const id=enemy.questId;if(!id)return;const q=e.s.quests[id];if(!q.started||q.ready)return;
 if(id==='camp'&&!foes(e.s,id,enemy.objective).length)e.notify(`Vorratskiste ${(enemy.objective??0)+1} ist frei · E zum Sichern.`);
 if(id==='tree'&&!enemy.questReinforcement&&enemy.objective!==undefined){
  q.progress++;e.s.poiProgress.tree=q.progress;
  if(enemy.objective===3){ready(e,id);return;}
  if(q.progress===3&&q.wave===0){q.wave=1;const p=POIS[2];questLeader(e,spawn(e,id,15,{x:p.x+75,y:p.y+30},3,1),420);e.notify('Das Siegel bricht · Bibor erscheint!');e.soundEvents.push('boss');}
 }
}
export function updateQuests(e:Engine,dt:number){
 const s=e.s,c=s.quests.camp,g=s.quests.garden;
 if(c.started&&!c.ready&&c.channel!==null){
  const point=CRATES[c.channel];
  if(distance(s.trainer,point)>55||s.enemies.some(f=>f.hp>0&&distance(f,point)<65)){c.channel=null;c.channelProgress=0;}
  else{
   c.channelProgress=Math.min(2.5,c.channelProgress+dt);
   if(c.channelProgress>=2.5){c.collected.push(c.channel);c.progress=c.collected.length;s.poiProgress.camp=c.progress;c.channel=null;c.channelProgress=0;e.fx('quest',point,0xffdb77,55,1,{label:'Vorräte geborgen'});e.soundEvents.push('reward');if(c.collected.length===3)ready(e,'camp');else e.notify(`Vorräte geborgen · ${c.collected.length}/3`);}
  }
 }
 if(g.started&&!g.ready&&distance(s.trainer,POIS[1])<100&&!foes(s,'garden').length){
  g.progress=Math.min(30,g.progress+dt);s.poiProgress.garden=g.progress;
  if(g.progress>=30)ready(e,'garden');else if(g.progress>=g.wave*10)gardenWave(e);
 }
 if(s.completed.includes('garden')&&s.time>=g.nextPulse&&s.enemies.some(f=>f.hp>0)){g.nextPulse=s.time+45;e.combatHeal(2);}
 if(s.merchantUntil===-1&&distance(s.trainer,s.merchantPos)<120)s.merchantUntil=s.time+30;
}
export function interactQuest(e:Engine):boolean{
 const s=e.s,c=s.quests.camp;
 if(c.started&&!c.ready){
  const index=CRATES.findIndex((p,i)=>!c.collected.includes(i)&&distance(p,s.trainer)<55);
  if(index>=0){if(foes(s,'camp',index).length)e.notify('Besiege zuerst die Wachen dieser Vorratskiste.');else if(c.channel===null){c.channel=index;c.channelProgress=0;e.notify('Vorräte sichern · bleibe 2,5 Sekunden an der Kiste.');}return true;}
 }
 const p=POIS.find(p=>!s.completed.includes(p.id)&&distance(s.trainer,p)<120);if(!p)return false;
 const id=p.id as QuestId,q=s.quests[id];
 if(!q.started){s.pendingId=id;s.screen='quest';}
 else if(q.ready){s.pendingId=id;s.screen='reward';}
 else e.notify(questStatus(s,id));return true;
}
export function claimQuestReward(e:Engine,kind:string,id?:string){
 const s=e.s,quest=s.pendingId as QuestId,q=s.quests[quest];
 if(s.screen!=='reward'||!q?.ready||s.completed.includes(quest))return false;
 const partner=kind==='training'?s.party.find(p=>p.uid===Number(id)):null;
 if(kind==='stone'&&(!id||!Object.hasOwn(STONES,id)))return false;
 if(kind==='passive'&&!e.canPassive(id??''))return false;
 if(kind==='training'&&(!partner||partner.ranks[0]>=8))return false;
 if(!['stone','passive','training','heal'].includes(kind))return false;
 const def=QUESTS[quest];
 s.completed.push(quest);s.balls+=2;s.coins+=Math.round(def.coins*difficulty(s).reward);s.xp+=Math.ceil((12+6*(s.level-1)+1.5*(s.level-1)**2)*def.xp);e.awardPartnerXp(40);
 if(kind==='stone')s.bag[id!]=(s.bag[id!]??0)+1;
 if(kind==='passive')s.passives[id!]=(s.passives[id!]??0)+1;
 if(kind==='training'){partner!.ranks[0]++;partner!.points++;}
 if(kind==='heal')e.heal(15);
 if(quest==='camp'){s.merchantPos={x:POIS[0].x+95,y:POIS[0].y+65};s.merchantUntil=s.duration+s.bossLimit+10;s.merchantStock={stones:2,balls:3};}
 if(quest==='garden')q.nextPulse=s.time+45;
 s.screen='play';s.pendingId=null;e.fx('quest',s.trainer,0xffe477,125,1.8,{label:'Waldsegen erhalten!'});e.notify(`Auftrag erfüllt · +2 Bälle · +${def.coins} Münzen · ${QUESTS[quest].perk}`);e.soundEvents.push('reward');return true;
}
