import {boonCast} from './boons.ts';
import {OBSTACLES,TYPE_COLOR} from './data.ts';
import {obstaclesAt} from './world.ts';
import {attackStats} from './combat.ts';
import {POKEMON_MOTION} from './pokemon-motion.ts';
import type {Engine,Partner,Enemy,Point,AttackField,Effect} from './engine.ts';
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const turn=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
const along=(p:Point,from:Point,angle:number)=>({forward:(p.x-from.x)*Math.cos(angle)+(p.y-from.y)*Math.sin(angle),side:Math.abs(-(p.x-from.x)*Math.sin(angle)+(p.y-from.y)*Math.cos(angle))});
type Stats=ReturnType<typeof attackStats>;
export function fireWeapon(e:Engine,p:Partner,a:Stats,target:Enemy,secondary=false){
 const s=e.s,m=a.move,angle=Math.atan2(target.y-p.y,target.x-p.x),power=a.power*(e.random()<a.crit?1.5:1),color=TYPE_COLOR[m.type];
 const victims=s.enemies.filter(f=>f.hp>0&&distance(p,f)<=a.range+f.r);
 if(!secondary){p.salvos++;boonCast(e,p,target);}
 let hits=0;
 const hit=(f:Enemy)=>{if(f.hp<=0)return;e.hit(f,power,m.type,a.burn,a.slow);hits++;};
 const fx=(pattern=m.pattern,points:Point[]=[])=>e.fx('weapon',p,color,a.range,.5,{pattern,points,type:m.type,angle,owner:p.uid,width:m.pattern==='cone'?a.arc:a.size,label:m.name});
 e.fx('cast',p,color,24,POKEMON_MOTION[p.species].attack.durationMs/1000,{owner:p.uid,type:m.type,angle,label:m.name});
 if(['shot','fan','burst','boomerang','ricochet'].includes(m.pattern)){
  const extra=a.extraEvery&&p.salvos%a.extraEvery===0?1:0,count=Math.min(9,a.projectiles+extra);
  for(let j=0;j<count&&s.shots.length<300;j++){
   const heading=angle+(m.pattern==='burst'?0:(j-(count-1)/2)*(m.pattern==='fan'?a.arc/Math.max(1,count-1):.12));
   s.shots.push({uid:s.nextId++,x:p.x,y:p.y,vx:Math.cos(heading)*a.speed,vy:Math.sin(heading)*a.speed,life:a.range/a.speed*(m.pattern==='boomerang'?2.8:1.2),power,type:m.type,owner:p.uid,r:a.size,burn:a.burn,slow:a.slow,behavior:m.pattern==='boomerang'?'boomerang':m.pattern==='ricochet'?'ricochet':'straight',traveled:0,range:a.range,returning:false,delay:m.pattern==='burst'?j*.11:0,pierce:a.pierce,maxPierce:a.pierce,bounces:a.bounces,hitIds:[],healing:a.heal,healed:false});
  }
 }else if(m.pattern==='beam'){
  victims.filter(f=>{const v=along(f,p,angle);return v.forward>=0&&v.side<a.size+f.r;}).sort((x,y)=>distance(p,x)-distance(p,y)).slice(0,1+a.pierce).forEach(hit);fx();
 }else if(m.pattern==='chain'){
  const points:Point[]=[{x:p.x,y:p.y}],seen=new Set<number>();let current:Enemy|undefined=target;
  for(let jump=0;jump<=a.bounces&&current;jump++){
   hit(current);seen.add(current.uid);points.push({x:current.x,y:current.y});const previous:Enemy=current;
   current=s.enemies.filter(f=>f.hp>0&&!seen.has(f.uid)&&distance(previous,f)<160).sort((x,y)=>distance(previous,x)-distance(previous,y))[0];
  }fx(m.pattern,points);
 }else if(m.pattern==='drain'){hit(target);fx(m.pattern,[{x:p.x,y:p.y},{x:target.x,y:target.y}]);}
 else if(m.pattern==='nova'){
  s.enemies.filter(f=>f.hp>0&&distance(p,f)<a.size+f.r).forEach(hit);e.fx('pulse',p,color,a.size,.5,{type:m.type,pattern:m.pattern,owner:p.uid});
 }else if(m.pattern==='cone'){
  victims.filter(f=>Math.abs(turn(Math.atan2(f.y-p.y,f.x-p.x)-angle))<=a.arc/2).forEach(hit);fx();
 }else if(['dash','charge','orbit','zone','mine','slash'].includes(m.pattern)){
  const kind=m.pattern==='slash'?'melee':m.pattern==='dash'||m.pattern==='charge'?'charge':m.pattern as AttackField['kind'];
  if(kind==='orbit')s.fields=s.fields.filter(f=>!(f.owner===p.uid&&f.kind==='orbit'));
  if(s.fields.length>=100)s.fields.shift();
  const duration=kind==='charge'?.5:kind==='melee'?a.projectiles*.15+.05:a.duration+(kind==='zone'||kind==='mine'?.28:0);
  const copies=kind==='mine'?a.projectiles:1;
  for(let i=0;i<copies;i++){
  if(s.fields.length>=100)s.fields.shift();
  const mineAngle=angle+(i-(copies-1)/2)*.45;
  const destination=kind==='mine'?{x:p.x+Math.cos(mineAngle)*(50+i*12),y:p.y+Math.sin(mineAngle)*(50+i*12)}:target;
  s.fields.push({uid:s.nextId++,owner:p.uid,kind,pattern:m.pattern,type:m.type,power,burn:a.burn,slow:a.slow,healing:a.heal,healed:false,life:duration,duration,radius:a.range,size:a.size,count:a.projectiles,angle,speed:a.speed,pierce:a.pierce,hitNext:{},triggered:false,strikes:0,arc:a.arc,x:p.x,y:p.y,fromX:p.x,fromY:p.y,targetX:destination.x,targetY:destination.y});
  }
 }
 if(hits&&a.heal)e.combatHeal(a.heal);
 if(e.soundEvents.length<4)e.soundEvents.push('attack:'+m.type);
}
export function updateProjectiles(e:Engine,dt:number){
 const s=e.s;
 for(const p of s.shots){
  const owner=e.getPartner(p.owner);if(!owner||!s.active.includes(owner.uid)||owner.recoveryUntil>s.time){p.life=0;continue;}
  let travelDt=dt;
  if(p.delay>0){
   p.x=owner.x;p.y=owner.y;travelDt=Math.max(0,dt-p.delay);p.delay=Math.max(0,p.delay-dt);if(!travelDt)continue;
  }
  const speed=Math.hypot(p.vx,p.vy);
  if(p.behavior==='boomerang'){
   if(!p.returning&&p.traveled>=p.range){p.returning=true;p.hitIds=[];p.pierce=p.maxPierce;}
   if(p.returning){const d=distance(p,owner);if(d<18){p.life=0;continue;}p.vx=(owner.x-p.x)/d*speed;p.vy=(owner.y-p.y)/d*speed;}
  }
  p.x+=p.vx*travelDt;p.y+=p.vy*travelDt;p.traveled+=speed*travelDt;p.life-=travelDt;
  if(obstaclesAt(s,p).some(o=>distance(o,p)<o.r)){p.life=0;continue;}
  for(const f of s.enemies)if(f.hp>0&&!p.hitIds.includes(f.uid)&&distance(p,f)<f.r+p.r){
   e.hit(f,p.power,p.type,p.burn,p.slow);p.hitIds.push(f.uid);
   if(p.healing&&!p.healed){e.combatHeal(p.healing);p.healed=true;}
   if(p.behavior==='ricochet'&&p.bounces>0){
    const target=s.enemies.filter(q=>q.hp>0&&!p.hitIds.includes(q.uid)&&distance(p,q)<180).sort((a,b)=>distance(p,a)-distance(p,b))[0];
    if(target){const d=distance(p,target);p.vx=(target.x-p.x)/Math.max(1,d)*speed;p.vy=(target.y-p.y)/Math.max(1,d)*speed;p.life=Math.max(p.life,180/speed);p.bounces--;break;}
   }
   if(p.behavior==='boomerang'){if(p.pierce>0){p.pierce--;continue;}if(p.returning)p.life=0;else p.traveled=p.range;break;}
   if(p.pierce>0)p.pierce--;else{p.life=0;break;}
  }
 }
 s.shots=s.shots.filter(p=>p.life>0&&distance(p,s.trainer)<1800);
}
export function orbitPoints(field:AttackField,time:number){
 const radius=field.radius*Math.min(1,(field.duration-field.life)/.22);
 return Array.from({length:field.count},(_,i)=>{const angle=time*(field.speed/Math.max(1,field.radius))+i*Math.PI*2/field.count;return {x:field.x+Math.cos(angle)*radius,y:field.y+Math.sin(angle)*radius};});
}
/** Attached cast effects move with their caster; detached impacts and flight paths do not. */
export function anchoredWeaponEffect(e:Engine,f:Effect):Effect{
 if(!f.owner||!['cast','weapon','pulse'].includes(f.kind)||['charge','dash'].includes(f.pattern??''))return f;
 const p=e.getPartner(f.owner)??e.s.enemies.find(p=>p.uid===f.owner);if(!p)return f;
 return {...f,x:p.x,y:p.y,points:f.points?.map((v,i)=>i===0?{x:p.x,y:p.y}:v)};
}
export function updateWeaponFields(e:Engine,dt:number){
 const s=e.s;
 for(const f of s.fields){
  const p=e.getPartner(f.owner);if(!p||!s.active.includes(p.uid)||p.recoveryUntil>s.time){f.life=0;continue;}
  f.life-=dt;const elapsed=f.duration-f.life,phase=Math.min(1,elapsed/f.duration);
  if(f.kind==='zone'||f.kind==='mine'){
   const travel=Math.min(1,elapsed/.28);f.x=f.fromX+(f.targetX-f.fromX)*travel;f.y=f.fromY+(f.targetY-f.fromY)*travel;
   if(travel<1)continue;
  }
  let hits=0;
  const hit=(enemy:Enemy)=>{e.hit(enemy,f.power,f.type,f.burn,f.slow);hits++;};
  if(f.kind==='melee'){
   f.x=p.x;f.y=p.y;
   if(f.strikes<f.count&&elapsed>=f.strikes*.15){f.strikes++;
    s.enemies.filter(q=>q.hp>0&&distance(p,q)<f.radius+q.r&&Math.abs(turn(Math.atan2(q.y-p.y,q.x-p.x)-f.angle))<=f.arc/2).forEach(hit);
    e.fx('weapon',p,TYPE_COLOR[f.type],f.radius,.25,{pattern:'slash',type:f.type,angle:f.angle,width:f.arc,owner:p.uid});
   }
  }else if(f.kind==='charge'){
   const travel=Math.sin(phase*Math.PI);p.x=f.fromX+(f.targetX-f.fromX)*travel;p.y=f.fromY+(f.targetY-f.fromY)*travel;
   if(!f.triggered&&phase>=.45){f.triggered=true;
    const candidates=s.enemies.filter(q=>q.hp>0).filter(q=>{
     if(f.pattern==='dash')return distance(q,{x:f.targetX,y:f.targetY})<q.r+f.size;
     const v=along(q,{x:f.fromX,y:f.fromY},f.angle);return v.forward>=0&&v.forward<=distance({x:f.fromX,y:f.fromY},{x:f.targetX,y:f.targetY})+q.r&&v.side<f.size+q.r;
    }).sort((a,b)=>distance(a,p)-distance(b,p));
    candidates.slice(0,f.pattern==='dash'?1:1+f.pierce).forEach(hit);
    e.fx('weapon',p,TYPE_COLOR[f.type],f.size,.35,{pattern:f.pattern,type:f.type,angle:f.angle,points:[{x:f.fromX,y:f.fromY},{x:f.targetX,y:f.targetY}],width:f.size});
   }
  }else if(f.kind==='orbit'){
   f.x=p.x;f.y=p.y;const points=orbitPoints(f,s.time);
   for(const enemy of s.enemies)if(enemy.hp>0&&(f.hitNext[enemy.uid]??0)<=s.time&&points.some(point=>distance(enemy,point)<enemy.r+f.size)){hit(enemy);f.hitNext[enemy.uid]=s.time+.75;}
  }else if(f.kind==='zone'){
   for(const enemy of s.enemies)if(enemy.hp>0&&(f.hitNext[enemy.uid]??0)<=s.time&&distance(f,enemy)<f.size+enemy.r){hit(enemy);f.hitNext[enemy.uid]=s.time+.65;}
  }else if(f.kind==='mine'&&elapsed>.55&&s.enemies.some(enemy=>enemy.hp>0&&distance(enemy,f)<enemy.r+18)){
   s.enemies.filter(enemy=>enemy.hp>0&&distance(enemy,f)<f.size+enemy.r).forEach(hit);f.life=0;e.fx('pulse',f,TYPE_COLOR[f.type],f.size,.6,{type:f.type});
  }
  if(hits&&f.healing&&!f.healed){f.healed=true;e.combatHeal(f.healing);}
 }
 s.fields=s.fields.filter(f=>f.life>0);
}
