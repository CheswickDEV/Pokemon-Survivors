import {translateText} from './i18n.ts';
import {measureTrainerSize,type DirectionSize} from './trainer-size.ts';
import {preloadGateArt} from './gate-art.ts';
import {preloadInteriorArt} from './interior-view.ts';
import {activeRoom,roomNpcNear,stageBuilding,storyAnchor} from './interior-layout.ts';
import {WorldView} from './world-view.ts';
import {TRAINER_COMPLETE_SHEETS} from './trainer-art-v5.ts';
import {KANTO_LOCATIONS} from './kanto-world-catalog.ts';
import {nextStoryStage} from './story.ts';
import {POKEMON_WORLD_SCALE} from './pokemon-size.ts';
import {drawBossAttack} from './boss-art.ts';
import {drawWeaponEffect,drawWeaponField,drawWeaponNova} from './weapon-art.ts';
import {anchoredWeaponEffect} from './weapon-system.ts';
import {CRATES,type QuestId} from './quests.ts';
import Phaser from 'phaser';
import {SPECIES,TYPE_COLOR,POIS,OBSTACLES,WORLD_SIZE} from './data.ts';
import type {Element} from './data.ts';
import type {Engine,Effect} from './engine.ts';
import {POKEMON_MOTION} from './pokemon-motion.ts';
import {POKEMON_SHINY} from './pokemon-shiny.ts';
import {enemyScale} from './combat-visuals.ts';
import type {PokemonDirection} from './pokemon-motion.ts';
import {directionFor,motionFrame,walkTime} from './motion.ts';
import {TRAINERS,trainerById} from './trainer-art.ts';
import {TrainerMotion} from './trainer-motion.ts';
import {rememberTrainerPreview} from './trainer-render.ts';
import {preloadForestArt} from './forest-art.ts';
import {preloadKantoArt} from './kanto-art.ts';
import {ATTACK_TYPES,makeProjectileSheet,makePickupSheet} from './effects-art.ts';

export interface ViewHooks {
 engine:()=>Engine|null;trainer:()=>string;effects:()=>boolean;ready:()=>void;loadError:()=>void;
 playing:()=>boolean;
 tick:(delta:number,keys:{x:number;y:number;dash:boolean})=>void;
 key:(key:string)=>void;focus:(x:number,y:number)=>void;step:()=>void;
}
export class ForestScene extends Phaser.Scene {
 hooks:ViewHooks;figures=new Map<string,Phaser.GameObjects.Image>();labels=new Map<string,Phaser.GameObjects.Text>();
 groundFx!:Phaser.GameObjects.Graphics;lines!:Phaser.GameObjects.Graphics;warnings!:Phaser.GameObjects.Graphics;
 trainer!:Phaser.GameObjects.Image;flowers:Phaser.GameObjects.Image[]=[];
 keys:Record<string,Phaser.Input.Keyboard.Key>={};lastDash=false;dashQueued=false;failed=false;
 lastRun:Engine|null=null;worldView!:WorldView;trainerSizes=new Map<string,DirectionSize>();
 trainerMotion=new TrainerMotion({x:1536,y:1710,time:0,playing:false});queued=new Set<string>();
 motion=new Map<string,{species:number;x:number;y:number;distance:number;time:number;direction:PokemonDirection;frame:number;texture:string}>();
 constructor(hooks:ViewHooks){super('forest');this.hooks=hooks;}
 preload(){
  this.load.on('loaderror',()=>{this.failed=true;this.hooks.loadError();});
  preloadForestArt(this);preloadGateArt(this);
  preloadKantoArt(this);
  preloadInteriorArt(this);
  for(const art of Object.values(POKEMON_MOTION))this.load.image('portrait-'+art.id,art.portrait);
  this.queueSpecies([1,3,4,7,10,13,16,19]);
  for(const [id,url] of Object.entries(TRAINER_COMPLETE_SHEETS))this.load.image('trainer-motion-'+id,url);
  for(const trainer of TRAINERS)this.load.spritesheet('trainer-'+trainer.id,trainer.sheet,{frameWidth:32,frameHeight:32});
 }
 queueSpecies(ids:number[],shiny=false){
  for(const id of ids){
   const key=id+':'+shiny;if(this.queued.has(key)||!POKEMON_MOTION[id])continue;
   this.queued.add(key);const art=shiny?POKEMON_SHINY[id]:POKEMON_MOTION[id];
   if(shiny)this.load.image('portrait-shiny-'+id,art.portrait);
   for(const action of [art.walk,art.idle,art.attack])this.load.spritesheet(action.key,action.url,{frameWidth:action.frameWidth,frameHeight:action.frameHeight,endFrame:action.frameCount-1});
  }
 }
 prepareSpecies(ids:number[],shiny=false){this.queueSpecies(ids,shiny);if(!this.load.isLoading()&&this.load.list.size>0)this.load.start();}
 create(){
  if(this.failed)return;
  for(const art of TRAINERS){
   const texture=this.textures.get('trainer-motion-'+art.id);
   const atlas=document.createElement('canvas');atlas.width=576;atlas.height=512;
   atlas.getContext('2d')!.drawImage(texture.getSourceImage() as HTMLImageElement,0,0);
   for(let row=0;row<8;row++)for(let col=0;col<9;col++)texture.add(row*9+col,0,col*64,row*64,64,64);
   rememberTrainerPreview(art.id,atlas);
   this.trainerSizes.set(art.id,measureTrainerSize(atlas.getContext('2d')!.getImageData(0,0,576,512).data));
  }
  this.worldView=new WorldView(this);
  for(const type of ATTACK_TYPES){
   const texture=this.textures.addCanvas('shot-'+type,makeProjectileSheet(type))!;
   for(let i=0;i<6;i++)texture.add(i,0,i*32,0,32,24);
  }
  const xp=this.textures.addCanvas('experience',makePickupSheet())!;
  for(let i=0;i<8;i++)xp.add(i,0,i*20,0,20,24);
  this.groundFx=this.add.graphics().setDepth(-50000000);
  this.lines=this.add.graphics().setDepth(1000000000);
  this.warnings=this.add.graphics().setDepth(1000000001);
  this.trainer=this.add.image(1536,1710,'trainer-red',0).setOrigin(.5,1).setScale(1.5);
  this.cameras.main.setZoom(this.scale.width<800?1.2:1.5);
  this.cameras.main.centerOn(1536,1750);
  if(this.input.keyboard){
   this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE',false) as typeof this.keys;
   this.input.keyboard.on('keydown',(ev:KeyboardEvent)=>{
    const target=ev.target as HTMLElement;
    if(target?.tagName==='INPUT'||target?.tagName==='SELECT')return;
    const modal=!!document.querySelector('[role=dialog]');
    if(!modal&&this.hooks.engine()&&[' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(ev.key))ev.preventDefault();
    if(!ev.repeat&&ev.code==='Space'&&this.hooks.playing())this.dashQueued=true;
    if(!ev.repeat&&['Tab','Escape','m','M','e','E','1','2','3'].includes(ev.key))this.hooks.key(ev.key);
   });
  }
  this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>this.hooks.focus(pointer.worldX,pointer.worldY));
  this.scale.on('resize',()=>this.cameras.main.setZoom(this.scale.width<800?1.2:1.5));
  this.hooks.ready();
 }
 resetKeys(){Object.values(this.keys).forEach(key=>key.reset());this.lastDash=false;this.dashQueued=false;}
 image(key:string,texture:string,x:number,y:number,scale=1,alpha=1,frame=0){
  let sprite=this.figures.get(key);
  if(!sprite){sprite=this.add.image(x,y,texture,frame);this.figures.set(key,sprite);}
  sprite.setTexture(texture,frame).setPosition(x,y).setScale(scale).setAlpha(alpha).setDepth(y).setOrigin(.5,1).setRotation(0).clearTint().setFlipX(false);
  return sprite;
 }
 pokemon(key:string,species:number,x:number,y:number,time:number,phase:number,scale=1,alpha=1,cast?:Effect,shiny=false){
  const art=shiny?POKEMON_SHINY[species]:POKEMON_MOTION[species];
  let state=this.motion.get(key);
  if(!state||state.species!==species){state={species,x,y,distance:0,time:-1,direction:'down',frame:0,texture:''};this.motion.set(key,state);}
  const dx=x-state.x,dy=y-state.y,distance=Math.hypot(dx,dy),advanced=time!==state.time;
  const moving=advanced&&distance>.025;
  if(moving){state.distance+=Math.min(distance,35);state.direction=directionFor(dx,dy);}
  const action=cast?art.attack:moving?art.walk:art.idle;
  if(cast)state.direction=directionFor(Math.cos(cast.angle??0),Math.sin(cast.angle??0));
  if(advanced){
   const ms=cast?(1-cast.life/cast.max)*action.durationMs:moving?walkTime(state.distance,action.durationMs):time*1000+phase*173;
   state.frame=motionFrame(action,state.direction,ms,!cast);state.texture=action.key;
  }
  state.x=x;state.y=y;state.time=time;
  const rendered=[art.walk,art.idle,art.attack].find(a=>a.key===state.texture)??art.idle;
  if(!this.textures.exists(rendered.key)){const portrait=(shiny&&this.textures.exists('portrait-shiny-'+species)?'portrait-shiny-':'portrait-')+species;return this.image(key,portrait,x,y,POKEMON_WORLD_SCALE[species]*scale,alpha);}
  return this.image(key,rendered.key,x,y,POKEMON_WORLD_SCALE[species]*scale,alpha,state.frame).setOrigin(rendered.originX,rendered.originY);
 }
 label(key:string,text:string,x:number,y:number,color='#ffffff',size=11){
  text=translateText(text);let label=this.labels.get(key);
  if(!label){label=this.add.text(x,y,text,{fontFamily:'Trebuchet MS',fontSize:size+'px',fontStyle:'bold',color,stroke:'#253d42',strokeThickness:3}).setOrigin(.5);this.labels.set(key,label);}
  label.setText(text).setPosition(x,y).setColor(color).setDepth(1000000002);
 }
 visible(x:number,y:number){const v=this.cameras.main.worldView;return x>v.x-120&&x<v.right+120&&y>v.y-120&&y<v.bottom+120;}
 shadow(x:number,y:number,r=14,color=0x365f4b){this.groundFx.fillStyle(color,.28).fillEllipse(x,y+1,r*2,r*.7);}
 spark(g:Phaser.GameObjects.Graphics,x:number,y:number,r:number,color:number,alpha=1){
  g.fillStyle(color,alpha);g.fillRect(Math.round(x-r),Math.round(y-1),r*2,2);g.fillRect(Math.round(x-1),Math.round(y-r),2,r*2);
 }
 ball(g:Phaser.GameObjects.Graphics,x:number,y:number,scale=1){
  const r=7*scale;g.fillStyle(0x283b45).fillCircle(x,y,r+1);g.fillStyle(0xfff9df).fillCircle(x,y,r);
  g.fillStyle(0xe45253).slice(x,y,r,Math.PI,Math.PI*2,false).fillPath();
  g.lineStyle(2,0x283b45).lineBetween(x-r,y,x+r,y);g.fillStyle(0x283b45).fillCircle(x,y,3*scale);g.fillStyle(0xffffff).fillCircle(x,y,1.5*scale);
 }
 area(f:Effect,g:Phaser.GameObjects.Graphics){
  const progress=1-f.life/f.max,r=f.r*(.45+progress*.55),a=f.life/f.max,type=f.type??'normal',color=TYPE_COLOR[type];
  g.lineStyle(2,color,a*.8).strokeCircle(f.x,f.y,r);
  const pieces=this.hooks.effects()?12:6;
  for(let i=0;i<pieces;i++){
   const angle=i*Math.PI*2/pieces+progress*.8,x=f.x+Math.cos(angle)*r,y=f.y+Math.sin(angle)*r;
   if(type==='electric'){
    g.lineStyle(2,0xfff5a1,a);g.beginPath();g.moveTo(f.x+Math.cos(angle)*r*.65,f.y+Math.sin(angle)*r*.35);g.lineTo(x-5,y-8);g.lineTo(x+5,y+2);g.lineTo(x,y-14);g.strokePath();
   }else if(type==='fire'){
    g.fillStyle(0xe96e35,a).fillTriangle(x-5,y+3,x+5,y+3,x+Math.sin(i+progress*18)*3,y-15);
    g.fillStyle(0xffeaa4,a).fillTriangle(x-2,y+2,x+2,y+2,x,y-8);
   }else if(type==='water'){
    g.lineStyle(3,0xe4ffff,a).beginPath();g.arc(x,y,7,Math.PI,Math.PI*1.7);g.strokePath();
    g.fillStyle(0x63c8ef,a).fillRect(x-2,y-12,3,4);
   }else if(type==='grass'){
    g.fillStyle(0x3d874c,a).fillEllipse(x,y,12,6);g.lineStyle(1,0xd6f08b,a).lineBetween(x-5,y,x+5,y);
   }else if(type==='psychic'||type==='ghost'){
    g.lineStyle(2,color,a).strokeEllipse(x,y,14+Math.sin(progress*12+i)*5,20);this.spark(g,x,y,3,0xfbe0ff,a);
   }else if(type==='ice'){
    g.fillStyle(0xa3e8f5,a).fillTriangle(x-5,y+4,x+5,y+4,x,y-15);g.lineStyle(1,0xf4ffff,a).lineBetween(x,y-12,x,y+3);
   }else if(type==='ground'||type==='rock'){
    g.fillStyle(color,a).fillTriangle(x-7,y+4,x+7,y+4,x-2,y-9);g.fillStyle(0xe0c19b,a).fillRect(x-3,y-5,4,3);
   }else if(type==='dragon'){
    g.fillStyle(0x798be8,a).fillTriangle(x-6,y+4,x+6,y+4,x+Math.sin(progress*16+i)*4,y-17);this.spark(g,x,y-5,3,0xffeab0,a);
   }else if(type==='bug'){
    g.lineStyle(1,0xf4efd0,a).lineBetween(f.x,f.y,x,y);this.spark(g,x,y,4,0xd7eaaa,a);
   }else{g.lineStyle(3,0xfff6dd,a).lineBetween(x-7,y+8,x+5,y-8);}
  }
 }
 effects(engine:Engine,alive:Set<string>,aliveLabels:Set<string>){
  const g=this.lines,t=engine.s.time,full=this.hooks.effects();let numbers=0;
  for(const raw of engine.effects){
   const f=anchoredWeaponEffect(engine,raw);
   if(!this.visible(f.x,f.y))continue;
   const a=f.life/f.max,p=1-a,id='fx'+f.id;
   if(f.kind==='weapon'){drawWeaponEffect(g,f,t,full);continue;}
   if(f.kind==='quest'){g.lineStyle(3,0xffdd76,a).strokeEllipse(f.x,f.y,30+p*f.r*2,15+p*f.r);for(let i=0;i<12;i++){const angle=i*Math.PI/6+p;this.spark(g,f.x+Math.cos(angle)*p*f.r,f.y-15+Math.sin(angle)*p*f.r*.55,3+a*2,0xfff0b3,a);}aliveLabels.add(id);this.label(id,f.label??'Waldschatz',f.x,f.y-55-p*28,'#ffe39a',14);continue;}
   if(f.kind==='pulse'){drawWeaponNova(g,f,t,full);continue;}
   if(f.kind==='dash'){this.area(f,g);continue;}
   if(f.kind==='hit'){
    if(full)for(let i=0;i<6;i++){
     const angle=i*Math.PI/3+f.id;this.spark(g,f.x+Math.cos(angle)*(6+p*15),f.y-10+Math.sin(angle)*(6+p*15),2,TYPE_COLOR[f.type??'normal'],a);
    }
    if(numbers++<30&&f.value){aliveLabels.add(id);this.label(id,String(Math.round(f.value)),f.x+Math.sin(f.id)*9,f.y-24-p*22,f.value>=40?'#fff2a0':'#ffffff',f.value>=40?13:11);}
   }else if(f.kind==='cast'){
    if(full){
     for(let i=0;i<4;i++){const angle=i*Math.PI/2+t*8;this.spark(g,f.x+Math.cos(angle)*16*a,f.y-16+Math.sin(angle)*9*a,3,TYPE_COLOR[f.type??'normal'],a);}
    }
   }else if(f.kind==='heal'){
    for(let i=0;i<3;i++)this.spark(g,f.x+(i-1)*16,f.y-12-p*30+Math.sin(i)*6,4,0xa7f579,a);
    if(f.value&&numbers++<30){aliveLabels.add(id);this.label(id,'+'+Math.round(f.value)+' KP',f.x,f.y-48-p*20,'#bff7a5');}
   }else if(f.kind==='collect'){
    if(full){this.spark(g,f.x,f.y-7-p*14,3,f.color,a);}
    if(full&&f.label==='xp'&&(f.value??0)>=5&&numbers++<22){aliveLabels.add(id);this.label(id,'+'+Math.round(f.value!)+' EP',f.x,f.y-24-p*15,'#b5f2ff',10);}
   }else if(f.kind==='evolve'||f.kind==='level'||f.kind==='switch'){
    const color=f.kind==='evolve'?0xe9d6ff:f.kind==='level'?0xffe68a:0xc7f6ff;
    g.lineStyle(3,color,a).strokeEllipse(f.x,f.y,25+p*f.r*2,12+p*f.r);
    for(let i=0;i<8;i++){
     const angle=i*Math.PI/4+p*2,x=f.x+Math.cos(angle)*(20+p*40),y=f.y-25+Math.sin(angle)*(20+p*20);
     this.spark(g,x,y,2+a*3,color,a);
    }
    if(f.kind==='evolve'&&f.owner){
     const sprite=this.figures.get('p'+f.owner);if(sprite&&a>.3)sprite.setTintFill(Math.floor(t*14)%2?0xffffff:0xf1d7ff);
    }
   }else if(f.kind==='capture'){
    const trainer=engine.s.trainer,travel=Math.min(1,p/.45);
    const x=Phaser.Math.Linear(trainer.x,f.x,travel),y=Phaser.Math.Linear(trainer.y-18,f.y-12,travel)-Math.sin(travel*Math.PI)*65;
    this.ball(g,x+(p>.45?Math.sin(p*55)*3*a:0),y,1.3);
    if(p>.65)for(let i=0;i<5;i++){const angle=i*1.256;this.spark(g,f.x+Math.cos(angle)*p*35,f.y-12+Math.sin(angle)*p*25,3,0xffed91,a);}
   }else if(f.kind==='faint'&&full&&f.species){
    alive.add(id);this.pokemon(id,f.species,f.x,f.y-p*8,t,f.id,.85*(.8+a*.2),a*.65).setTintFill(0xe2f5d6);
   }
  }
 }
 update(wallTime:number,delta:number){
  const frameStarted=performance.now();
  if(!this.trainer)return;
  const down=(name:string)=>this.keys[name]?.isDown,dash=!!down('SPACE');
  this.hooks.tick(Math.min(delta/1000,.1),{x:Number(down('D')||down('RIGHT'))-Number(down('A')||down('LEFT')),y:Number(down('S')||down('DOWN'))-Number(down('W')||down('UP')),dash:this.dashQueued||dash&&!this.lastDash});
  this.lastDash=dash;this.dashQueued=false;
  const engine=this.hooks.engine(),s=engine?.s,clock=s?.time??wallTime/1000,g=this.lines,b=this.groundFx;
  g.clear();b.clear();this.warnings.clear();
  const alive=new Set<string>(),aliveLabels=new Set<string>();
  const t=s?.trainer??{x:1536,y:1710,dx:0,dy:1,invincibleUntil:0,dashUntil:0};
  const trainer=trainerById(s?.trainerId??this.hooks.trainer());
  const sample={x:t.x,y:t.y,time:clock,playing:this.hooks.playing()};
  if(engine!==this.lastRun){this.lastRun=engine;this.trainerMotion=new TrainerMotion(sample);this.motion.clear();if(s)this.prepareSpecies([...s.encounterRoster,...s.party.map(p=>p.species)]);}
  this.trainerMotion.update(sample);
  const motion=this.trainerMotion,frame=motion.walking?trainer.animations[motion.direction][motion.column]:trainer.idleFrames[motion.direction];
  if(motion.footfall)this.hooks.step();
  const fit=this.trainerSizes.get(trainer.id)![motion.direction];
  this.trainer.setTexture('trainer-motion-'+trainer.id,frame).setOrigin(.5,trainer.groundOrigin).setScale(trainer.displayScale*fit.x,trainer.displayScale*fit.y).setPosition(t.x,t.y).setDepth(t.y).setAlpha(clock<t.invincibleUntil&&Math.floor(clock*14)%2===0?.5:1);
  this.shadow(t.x,t.y-2,11);
  this.cameras.main.centerOn(t.x,t.y+42);
  this.worldView.update(s,t,this.scale.width/this.cameras.main.zoom,this.scale.height/this.cameras.main.zoom,performance.now()-frameStarted<5);
  for(let i=0;i<this.flowers.length;i++)this.flowers[i].setFrame(Math.floor(clock*3.75+i)%5);
  if(s&&engine){
   this.prepareSpecies([...s.party.map(p=>p.species),...s.enemies.map(e=>e.species),...s.encounters.filter(e=>!e.claimed).map(e=>e.species)]);
   this.prepareSpecies([...s.party,...s.enemies,...s.encounters.filter(e=>!e.claimed)].filter(p=>p.shiny).map(p=>p.species),true);
   if(clock<t.dashUntil)for(let i=1;i<=3;i++){
    const id='trail'+i;alive.add(id);this.image(id,'trainer-motion-'+trainer.id,t.x-t.dx*i*12,t.y-t.dy*i*12,trainer.displayScale,(4-i)*.12,frame).setOrigin(.5,trainer.groundOrigin).setScale(trainer.displayScale*fit.x,trainer.displayScale*fit.y).setTint(0xd6f7eb);
   }
   for(const poi of s.mode==='story'||s.mode==='bossrush'?[]:POIS){
    const done=s.completed.includes(poi.id);
    b.lineStyle(2,done?0x55a474:0xfff5bb,.8).strokeCircle(poi.x,poi.y,100);
    if(poi.id==='garden'&&!done){b.lineStyle(4,0x548d49,.95).beginPath();b.arc(poi.x,poi.y,103,-Math.PI/2,-Math.PI/2+Math.PI*2*s.poiProgress.garden/30,false);b.strokePath();}
    const q=s.quests[poi.id as QuestId];
    if(q.ready&&!done){const y=poi.y-18+Math.sin(clock*4)*3;b.fillStyle(0x674836).fillRoundedRect(poi.x-17,y-14,34,26,3);b.fillStyle(0xdfa748).fillRect(poi.x-15,y-13,30,11);b.lineStyle(2,0xffe494).strokeRect(poi.x-15,y-13,30,23);b.fillStyle(0xffe9a0).fillRect(poi.x-3,y-4,6,7);this.spark(g,poi.x+22,poi.y-32+Math.sin(clock*3)*4,4,0xffed9c);}
   }
   if(s.mode!=='story'&&s.quests.camp.started&&!s.quests.camp.ready)CRATES.forEach((p,i)=>{
    if(!this.visible(p.x,p.y)||s.quests.camp.collected.includes(i))return;
    const q=s.quests.camp,guards=s.enemies.filter(e=>e.hp>0&&e.questId==='camp'&&e.objective===i).length;
    b.fillStyle(0x544f36,.3).fillEllipse(p.x,p.y+5,36,15);g.fillStyle(0x705037).fillRect(p.x-14,p.y-24,28,24);g.fillStyle(0xc28c4e).fillRect(p.x-12,p.y-22,24,20);g.lineStyle(2,0xf2cf86).strokeRect(p.x-12,p.y-22,24,20).lineBetween(p.x-11,p.y-21,p.x+11,p.y-3).lineBetween(p.x+11,p.y-21,p.x-11,p.y-3);
    if(q.channel===i){g.lineStyle(4,0xffe7a0).beginPath();g.arc(p.x,p.y-12,25,-Math.PI/2,-Math.PI/2+q.channelProgress/2.5*Math.PI*2);g.strokePath();}
    const id='crate'+i;aliveLabels.add(id);this.label(id,guards?'Vorräte '+(i+1)+' · '+guards+' Wachen':'E · Vorräte '+(i+1)+' sichern',p.x,p.y-43,guards?'#ffcf9e':'#ffeb9b');
   });
   for(const chest of s.interior?[]:s.world.treasures){
    if(chest.opened||!this.visible(chest.x,chest.y))continue;
    const {x,y}=chest;g.fillStyle(0x533f32).fillRoundedRect(x-17,y-23,34,26,3);g.fillStyle(0xd99a3d).fillRect(x-15,y-22,30,11);g.lineStyle(2,0xffe59a).strokeRect(x-15,y-22,30,24);g.fillStyle(0xfff1ae).fillRect(x-3,y-12,6,8);this.spark(g,x+23,y-30+Math.sin(clock*3)*4,4,0xffed9c);
   }
   if(s.mode==='story'){
    const room=activeRoom(s),stage=nextStoryStage(s),goal=stage&&storyAnchor(stage);
    if(room){
     const npc=roomNpcNear(s);if(npc&&!s.story.active){aliveLabels.add('npc');this.label('npc','E · '+npc.name,npc.x,npc.y-49,'#fff2c7',12);}
     if(Math.hypot(room.exit.x-t.x,room.exit.y-t.y)<125){aliveLabels.add('exit');this.label('exit','E · Ausgang',room.exit.x,room.exit.y-40,'#fff2c7',12);}
    }else if(goal&&this.visible(goal.x,goal.y)){
     if(stageBuilding(stage!)){b.lineStyle(2,0xffe09a,.85).strokeEllipse(goal.x,goal.y+10,52,20);aliveLabels.add('story-goal');this.label('story-goal',stage!.title+' · E am Eingang',goal.x,goal.y+35,'#fff2ad',11);}
     else {b.lineStyle(3,0xffe09a,.8).strokeCircle(goal.x,goal.y,s.story.active?480:150);aliveLabels.add('story-goal');this.label('story-goal',stage!.title,goal.x,goal.y-95,'#fff2ad',14);}
    }
   }
   for(const pickup of s.pickups){
    if(!this.visible(pickup.x,pickup.y))continue;
    if(pickup.kind==='xp'){
     const id='xp'+pickup.uid;alive.add(id);
     this.image(id,'experience',pickup.x,pickup.y+Math.sin(clock*3+pickup.uid)*2,.57+Math.min(.23,pickup.value/65),1,Math.floor(clock*8+pickup.uid)%8).setDepth(-1);
    }else if(pickup.kind==='coin'){
     b.fillStyle(0x9c6c28).fillEllipse(pickup.x,pickup.y,13,16);b.fillStyle(0xffda54).fillEllipse(pickup.x,pickup.y-1,10,13);b.fillStyle(0xfff6b5).fillRect(pickup.x-1,pickup.y-4,2,6);
    }else{
     const {x,y}=pickup,heal=pickup.kind==='heal';
     b.fillStyle(0x25443c,.25).fillEllipse(x,y+3,23,9);
     g.fillStyle(0x34314d).fillRoundedRect(x-9,y-21,18,24,3);
     g.fillStyle(heal?0xb984dc:0x69bed7).fillRoundedRect(x-7,y-19,14,20,2);
     g.fillStyle(heal?0xf4b8df:0xc9f5ff).fillRect(x-5,y-16,4,12);
     g.fillStyle(0x40364b).fillRect(x-6,y-26,12,7);
     g.fillStyle(heal?0xef8aab:0xe6d77d).fillRect(x-5,y-25,10,4);
     g.fillStyle(0xfff5df).fillRect(x-5,y-10,10,7);
     if(heal){g.fillStyle(0xc55377).fillRect(x-1,y-9,2,5).fillRect(x-3,y-7,6,2);}
     else g.fillStyle(0x397c9a).fillTriangle(x-3,y-9,x+3,y-9,x,y-4);
     if(Math.hypot(x-t.x,y-t.y)<95){const id='pickup'+pickup.uid;aliveLabels.add(id);this.label(id,heal?'Trank · +'+pickup.value+' KP':'Äther · Ausdauer',x,y-39,heal?'#ffe3ee':'#cef4ff',10);}
    }
   }
   for(const p of s.party)if(s.active.includes(p.uid)&&p.recoveryUntil<=clock){
    const id='p'+p.uid;alive.add(id);this.shadow(p.x,p.y,18,0x30664f);
    b.lineStyle(1,0xbaf4e2,.9).strokeEllipse(p.x,p.y,32,12);
    const cast=engine.effects.find(f=>f.kind==='cast'&&f.owner===p.uid);
    this.pokemon(id,p.species,p.x,p.y,clock,p.uid,1,1,cast,!!p.shiny);
    if(p.shiny)this.shinySparkles(p.x,p.y,clock,p.uid,1);
    const height=38;
    if(!s.interior||s.story.active||p.stamina<99.5){
     g.fillStyle(0x37514d,.8).fillRect(p.x-16,p.y-height-6,32,3);g.fillStyle(0x99e4c1).fillRect(p.x-15,p.y-height-5,30*p.stamina/100,1);
    }
   }
   for(const e of s.enemies){
    if(!this.visible(e.x,e.y))continue;
    const id='e'+e.uid;alive.add(id);const scale=enemyScale(e);
    this.shadow(e.x,e.y,16*scale,e.kind==='wild'?0x52604a:0x7f4947);
    const cast=engine.effects.find(f=>f.kind==='cast'&&f.owner===e.uid);
    const sprite=this.pokemon(id,e.species,e.x,e.y,clock,e.uid,scale,1,cast,!!e.shiny);
    if(e.shiny)this.shinySparkles(e.x,e.y,clock,e.uid,scale);
    if(e.flash>clock)sprite.setTintFill(0xffffff);
    const height=38*scale;
    if(e.kind!=='wild'||e.flash>clock||s.focus===e.uid){
     const color=e.kind==='encounter'?0x66c1dd:e.kind==='boss'?0xe35c64:0xf4c56a;
     if(e.kind!=='boss'){g.fillStyle(0x41464a,.9).fillRect(e.x-17,e.y-height-5,34,4);g.fillStyle(color).fillRect(e.x-16,e.y-height-4,32*Math.max(0,e.hp/e.maxHp),2);}
     b.lineStyle(1,color,.8).strokeEllipse(e.x,e.y,e.r*2.1,e.r*.9);
    }
    if(e.uid===s.focus){
     const w=22*scale+3,y=e.y-height-8,pulse=.8+Math.sin(clock*3)*.12;
     b.lineStyle(4,0x284c59,.9).strokeEllipse(e.x,e.y+2,w*2+8,w);b.lineStyle(2,0xffd77c,pulse).strokeEllipse(e.x,e.y+2,w*2+8,w);
     for(const sign of [-1,1])for(const bottom of [false,true]){const xx=e.x+sign*w,yy=bottom?e.y+5:y,dy=bottom?-9:9;g.lineStyle(5,0x304758,.9).lineBetween(xx,yy,xx-sign*9,yy).lineBetween(xx,yy,xx,yy+dy);g.lineStyle(2,0xffe8a4,pulse).lineBetween(xx,yy,xx-sign*9,yy).lineBetween(xx,yy,xx,yy+dy);}
     aliveLabels.add('focus');this.label('focus','FOKUS',e.x,y-13,'#fff0b7',10);
    }
    if(e.burnUntil>clock){g.fillStyle(0xed823b,.9).fillTriangle(e.x-5,e.y-8,e.x+4,e.y-8,e.x+Math.sin(clock*17)*4,e.y-20);g.fillStyle(0xffec98).fillRect(e.x-2,e.y-13,3,5);}
    if(e.slowUntil>clock){g.lineStyle(1,0xd3f4fa,.8).strokeEllipse(e.x,e.y,22,8);g.lineBetween(e.x-11,e.y-4,e.x+11,e.y+4);g.lineBetween(e.x-11,e.y+4,e.x+11,e.y-4);}
   }
   for(const encounter of s.encounters)if(encounter.ready&&!encounter.claimed&&this.visible(encounter.x,encounter.y)){
    const id='c'+encounter.id;alive.add(id);aliveLabels.add(id);
    this.pokemon(id,encounter.species,encounter.x,encounter.y,clock,13,1,1,undefined,!!encounter.shiny);
    if(encounter.shiny)this.shinySparkles(encounter.x,encounter.y,clock,13,1);
    this.shadow(encounter.x,encounter.y,18);b.lineStyle(2,0xfff3ab).strokeEllipse(encounter.x,encounter.y,48+Math.sin(clock*4)*4,21);
    this.label(id,(encounter.shiny?'✦ Shiny ':'')+SPECIES[encounter.species].name+' · E: Fangen',encounter.x,encounter.y-55,'#ffefb3');
    this.ball(g,encounter.x+26,encounter.y-30+Math.sin(clock*3)*3,.8);
   }
   if(s.merchantUntil!==null&&(s.merchantUntil===-1||clock<s.merchantUntil)){
    alive.add('merchant');aliveLabels.add('merchant');
    this.image('merchant','trainer-brendan',s.merchantPos.x,s.merchantPos.y,1.5,1,0).setTint(0xc9dfa8);
    this.label('merchant','Ranger · E: Vorräte',s.merchantPos.x,s.merchantPos.y-52,'#fff4bd');
   }
   for(const shot of s.shots){
    if(shot.delay>0||!this.visible(shot.x,shot.y))continue;
    const id='shot'+shot.uid;alive.add(id);
    const angle=Math.atan2(shot.vy,shot.vx),scale=Math.max(.6,Math.min(1.3,shot.r/9));
    if(shot.behavior==='boomerang'&&shot.type==='ground'){
     const dx=Math.cos(clock*15)*11,dy=Math.sin(clock*15)*11;g.lineStyle(5,0x76664e).lineBetween(shot.x-dx,shot.y-dy,shot.x+dx,shot.y+dy);g.lineStyle(3,0xffefcb).lineBetween(shot.x-dx,shot.y-dy,shot.x+dx,shot.y+dy);for(const sign of [-1,1]){g.fillStyle(0xffefcb).fillCircle(shot.x+dx*sign-dy*.17,shot.y+dy*sign+dx*.17,3).fillCircle(shot.x+dx*sign+dy*.17,shot.y+dy*sign-dx*.17,3);}
    }else if(shot.behavior==='ricochet'&&[52,53].includes(engine.getPartner(shot.owner)?.species??0)){g.fillStyle(0xa87838).fillEllipse(shot.x,shot.y,12,15);g.fillStyle(0xffdf7c).fillEllipse(shot.x,shot.y-1,9,12);g.lineStyle(2,0xfff4b0).lineBetween(shot.x,shot.y-5,shot.x,shot.y+4);}
    else this.image(id,'shot-'+shot.type,shot.x,shot.y,scale,1,Math.floor(clock*10+shot.uid)%6).setOrigin(.5).setRotation(shot.behavior==='boomerang'?clock*9:angle).setDepth(1000000000);
    if(this.hooks.effects())for(let i=1;i<=3;i++){
     const x=shot.x-shot.vx*.015*i,y=shot.y-shot.vy*.015*i;
     g.lineStyle(Math.max(1,shot.r*(.5-i*.1)),TYPE_COLOR[shot.type],.38-i*.08).lineBetween(x,y,x-shot.vx*.012,y-shot.vy*.012);
    }
   }
   for(const field of s.fields)if(this.visible(field.x,field.y))drawWeaponField(g,field,clock,this.hooks.effects());
   this.effects(engine,alive,aliveLabels);
   // Keep the controlled trainer identifiable even behind a large partner.
   g.fillStyle(0x294d45).fillTriangle(t.x-5,t.y-57,t.x+5,t.y-57,t.x,t.y-50);
   g.fillStyle(0xfff3b2).fillTriangle(t.x-3,t.y-56,t.x+3,t.y-56,t.x,t.y-52);
   this.drawWarnings(engine);
  }
  for(const [id,item]of this.figures)if(!alive.has(id)){item.destroy();this.figures.delete(id);this.motion.delete(id);}
  for(const [id,item]of this.labels)if(!aliveLabels.has(id)){item.destroy();this.labels.delete(id);}
 }
 shinySparkles(x:number,y:number,time:number,id:number,scale:number){
  const g=this.lines;for(let i=0;i<3;i++){const phase=(time*.65+id*.17+i/3)%1,alpha=Math.sin(phase*Math.PI),angle=i*2.4+id;const xx=x+Math.cos(angle)*(21*scale+phase*7),yy=y-20*scale+Math.sin(angle)*14*scale-phase*10;this.spark(g,xx,yy,2+alpha*2,0xfff1a6,alpha*.85);}
 }
 drawWarnings(engine:Engine){
  for(const h of engine.s.hazards)drawBossAttack(this.warnings,h,engine.s.time,this.hooks.effects());
 }

}
export function createView(parent:HTMLElement,hooks:ViewHooks){
 const scene=new ForestScene(hooks);
 const game=new Phaser.Game({type:Phaser.AUTO,parent,backgroundColor:'#86bd7a',pixelArt:true,antialias:false,transparent:false,
  scale:{mode:Phaser.Scale.RESIZE,width:parent.clientWidth,height:parent.clientHeight},scene,
  audio:{noAudio:true},render:{roundPixels:true},fps:{target:60},banner:false});
 return {game,scene};
}
