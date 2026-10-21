import {trialMechanic,trialProfile} from './story-trials.ts';
import type {Engine,Enemy,Point} from './engine.ts';
import {SPECIES} from './data.ts';
import {difficulty} from './difficulty.ts';
import {trialPressure} from './boss-balance.ts';
export const BOSS_STYLES=['vines','pollen','solar','spores','flame','water','ice','lightning','stone','psychic','slash','shadow'] as const;
export type BossStyle=typeof BOSS_STYLES[number];
export const BOSSES=[
 {species:3,title:'Hüter des Auenwalds',pattern:'roots',hint:'Rankenfächer, Pollenring und ein gebündelter Solarstrahl.'},
 {species:15,title:'Schwarmkönig',pattern:'stingers',hint:'Drei versetzte Stachelbahnen. Weiche quer zur Flugrichtung aus.'},
 {species:95,title:'Felswächter',pattern:'rockfall',hint:'Steinschläge folgen deiner Spur; das nächste Beben lässt die Mitte frei.'},
 {species:9,title:'Brandungsmeister',pattern:'tides',hint:'Wasserkanonen wechseln mit zwei zeitversetzten Flutringen.'},
 {species:59,title:'Glutläufer',pattern:'firelane',hint:'Flammen schneiden sich auf deiner letzten Position.'},
 {species:94,title:'Nachtgespenst',pattern:'haunt',hint:'Schatten erscheinen um dich herum. Der schmale Zwischenraum bleibt frei.'},
 {species:123,title:'Sichelwind',pattern:'crosscut',hint:'Gekreuzte Schnitte schließen sich um deinen alten Standort.'},
 {species:143,title:'Schlummerkoloss',pattern:'bodypress',hint:'Bodyslam trifft das Zielgebiet, danach folgt eine äußere Druckwelle.'},
 {species:130,title:'Tiefenwächter',pattern:'maelstrom',hint:'Eine Flutwelle und seitliche Wasserbahnen rollen nacheinander an.'},
 {species:6,title:'Flammenkrone',pattern:'firefan',hint:'Breite Feuerfächer wechseln mit angekündigten Einschlägen.'},
 {species:144,title:'Frostschwinge',pattern:'blizzard',hint:'Eiskristalle bilden einen Ring; die nächste Frostfläche bleibt an ihrem Ort.'},
 {species:145,title:'Donnerkrone',pattern:'thunder',hint:'Blitze schlagen auf markierten Feldern in zwei Folgen ein.'},
 {species:146,title:'Sonnenflügel',pattern:'inferno',hint:'Feuerinseln und ein Strahlenfächer lassen offene Fluchtkorridore.'},
 {species:149,title:'Himmelswächter',pattern:'dragon',hint:'Drei Drachenstrahlen feuern nacheinander; danach kommt ein Ring.'},
 {species:150,title:'Ursprungskraft',pattern:'psywave',hint:'Psychowellen drehen ihre Richtung. Verlasse jede Bahn vor dem Blitz.'}
] as const;
export const bossProfile=(species:number)=>BOSSES.find(b=>b.species===species);
export const bossPhase=(foe:Pick<Enemy,'hp'|'maxHp'>)=>foe.hp<foe.maxHp*.3?2:foe.hp<foe.maxHp*.65?1:0;
/** One reinforcement call per boss, saved with the enemy so restoring cannot repeat it. */
export function advanceBossPhase(e:Engine,foe:Enemy){
 if(foe.kind!=='boss'&&!foe.storyLeader)return;
 const phase=bossPhase(foe),previous=foe.bossPhase??0;
 if(phase<=previous)return;
 foe.bossPhase=phase;foe.nextAttack=(foe.storyLeader?Math.min:Math.max)(foe.nextAttack,e.s.time+1.2);
 e.fx('quest',foe,0xffd78a,70,1.1,{label:'Phase '+(phase+1)});
 if(phase===2){
  const type=SPECIES[foe.species].types[0],species=type==='fire'?37:type==='water'?54:type==='grass'?43:type==='rock'||type==='ground'?74:type==='psychic'?96:type==='electric'?81:type==='ice'?86:type==='ghost'?92:16;
  for(const side of [-1,1]){
   const ally=e.addEnemy(species,'guardian',{x:foe.x+side*100,y:foe.y-65});
   ally.hp=ally.maxHp=(foe.storyLeader?35+e.s.story.done.length*3:95)*difficulty(e.s).hp;
   ally.speed=52*difficulty(e.s).speed;
   if(foe.storyId){ally.storyId=foe.storyId;ally.storyLeader=false;}
   if(foe.questId){ally.questId=foe.questId;ally.objective=foe.objective;ally.questReinforcement=true;}
  }
  e.notify(SPECIES[foe.species].name+' ruft Verstärkung · Letzte Kampfphase!');
 }else e.notify(SPECIES[foe.species].name+' · Phase 2: Achte auf versetzte Folgeschläge!');
}
export function expeditionBoss(seed:number,cycle:number,learn=false){
 return BOSSES[learn&&cycle===0?0:((seed>>>0)+cycle)%BOSSES.length];
}
/** Positions are frozen when telegraphed. The animation and damage share these footprints. */
export function attackBoss(e:Engine,foe:Enemy){
 const s=e.s,p=bossProfile(foe.species),type=SPECIES[foe.species].types[0];
 const fallback=type==='fire'?'firefan':type==='water'?'tides':type==='electric'?'thunder':type==='ice'?'blizzard':type==='rock'||type==='ground'?'rockfall':type==='psychic'?'psywave':type==='ghost'||type==='poison'?'haunt':type==='fighting'||type==='bug'?'crosscut':type==='dragon'?'dragon':type==='grass'?'roots':'crosscut';
 const pattern=p?.pattern??fallback,phase=foe.attackPhase??0;foe.attackPhase=phase+1;
 const origin={x:foe.x,y:foe.y},target={x:s.trainer.x,y:s.trainer.y},a=Math.atan2(target.y-origin.y,target.x-origin.x);
 const heavy=foe.kind==='boss',stage=heavy||foe.storyLeader?bossPhase(foe):0,power=heavy?20*trialPressure(s):foe.storyLeader?(18+Math.min(8,s.story.done.length/3))*trialPressure(s):12;
 if(foe.storyLeader&&(s.difficulty==='master'||s.difficulty==='veteran'))foe.braceUntil=s.time+1.05;
 const warn=(heavy?1.35:1.2)*(foe.hp<foe.maxHp*.4?.9:1);
 const line=(at:Point,angle:number,style:BossStyle,delay=0,length=heavy?520:360,width=22)=>e.hazard('line',at,angle,length,width,warn+delay,power,style);
 const circle=(at:Point,r:number,style:BossStyle,delay=0)=>e.hazard('circle',at,0,r,0,warn+delay,power,style);
 const ring=(at:Point,r:number,style:BossStyle,delay=0)=>e.hazard('ring',at,0,r,19,warn+delay,power,style);
 const around=(c:Point,r:number,n:number)=>Array.from({length:n},(_,i)=>({x:c.x+Math.cos(a+i*Math.PI*2/n)*r,y:c.y+Math.sin(a+i*Math.PI*2/n)*r}));
 switch(pattern){
  case 'roots': if(phase%3===0)[-.34,0,.34].forEach(v=>line(origin,a+v,'vines'));else if(phase%3===1)ring(origin,180,'pollen');else line(origin,a,'solar',.2,650,44);break;
  case 'stingers': [-.22,0,.22].forEach((v,i)=>line(origin,a+v,'slash',i*.2,440,13));break;
  case 'rockfall': if(phase%2)ring(origin,135,'stone');else [target,...around(target,100,3)].forEach((v,i)=>circle(v,42,'stone',i*.22));break;
  case 'tides': if(phase%2){ring(origin,125,'water');ring(origin,225,'water',.4);}else[-.2,.2].forEach(v=>line(origin,a+v,'water',0,520,27));break;
  case 'firelane': line({x:target.x-240,y:target.y},0,'flame',0,480,24);line({x:target.x,y:target.y-240},Math.PI/2,'flame',.5,480,24);break;
  case 'haunt': around(target,95,5).forEach((v,i)=>circle(v,40,'shadow',i*.08));if(phase%2)circle(target,46,'shadow',.6);break;
  case 'crosscut': [a-.65,a+.65].forEach((angle,i)=>line({x:target.x-Math.cos(angle)*190,y:target.y-Math.sin(angle)*190},angle,'slash',i*.35,380,17));break;
  case 'bodypress': circle(target,80,'stone');ring(target,155,'stone',.55);break;
  case 'maelstrom': line(origin,a,'water',0,560,40);[-1,1].forEach(sign=>line({x:origin.x-Math.sin(a)*100*sign,y:origin.y+Math.cos(a)*100*sign},a,'water',.55,520,22));break;
  case 'firefan': if(phase%2)[target,...around(target,135,3)].forEach((v,i)=>circle(v,48,'flame',i*.18));else[-.5,0,.5].forEach(v=>line(origin,a+v,'flame',0,470,27));break;
  case 'blizzard': ring(origin,160,'ice');circle(target,65,'ice',.6);break;
  case 'thunder': [target,...around(target,120,4)].forEach((v,i)=>circle(v,36,'lightning',(i%2)*.45));break;
  case 'inferno': if(phase%2)around(origin,150,5).forEach(v=>circle(v,55,'flame'));else[-.65,0,.65].forEach((v,i)=>line(origin,a+v,'flame',i*.15,550,22));break;
  case 'dragon': [-.4,0,.4].forEach((v,i)=>line(origin,a+v,'solar',i*.35,600,24));if(phase%2)ring(origin,120,'water',.9);break;
  case 'psywave': [-.55,0,.55].forEach((v,i)=>line(origin,a+v,'psychic',i*.45,550,20));if(phase%2)ring(origin,150,'psychic',.6);break;
 }
 // A frozen, delayed aftershock adds a second decision without tracking the player.
 if(stage>0&&phase%2===1){
  const style:BossStyle=type==='fire'?'flame':type==='water'?'water':type==='electric'?'lightning':type==='ice'?'ice':type==='psychic'?'psychic':type==='ghost'?'shadow':type==='grass'?'spores':'stone';
  circle(target,stage===2?49:38,style,.9);
 }
 // Veteran/master leaders punish standing still in every pattern. The snapshots
 // never chase the player after appearing; each impact retains an escape window.
 if((heavy||foe.storyLeader)&&(s.difficulty==='master'||s.difficulty==='veteran')){
  const style:BossStyle=type==='rock'||type==='ground'?'stone':type==='fire'?'flame':type==='water'?'water':type==='electric'?'lightning':'psychic';
  circle(target,s.difficulty==='master'?66:48,style,.15);
  if(stage>=1)ring(target,155,style,1.05);
  if(stage===2&&s.difficulty==='master'){
   const side=a+Math.PI/2;
   line({x:target.x-Math.cos(side)*220,y:target.y-Math.sin(side)*220},side,style,1.7,440,21);
  }
 }
 if(foe.storyLeader)trialMechanic(e,foe,stage,phase);
 e.fx('cast',foe,SPECIES[foe.species].color,32,.55,{owner:foe.uid,type,angle:a,label:'Bossattacke'});
 if(heavy)e.notify(SPECIES[foe.species].name+' · '+(foe.hp<foe.maxHp*.4?'Letzte Kraft! · ':'')+(p?.hint??'Verlasse die angekündigten Trefferflächen.'));
 e.soundEvents.push('warning');
}
export const bossInterval=(e:Engine,foe:Enemy)=>(foe.kind==='boss'?4.6:5.2)*(1-bossPhase(foe)*.09)*difficulty(e.s).cadence/(foe.storyLeader||foe.kind==='boss'?Math.sqrt(trialPressure(e.s)):1);
