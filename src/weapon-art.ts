import type Phaser from 'phaser';
import {TYPE_COLOR} from './data.ts';
import type {Effect,AttackField} from './engine.ts';
import {orbitPoints} from './weapon-system.ts';
type G=Phaser.GameObjects.Graphics;
const point=(x:number,y:number,a:number,d:number)=>({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d});
function star(g:G,x:number,y:number,r:number,color:number,a=1){g.lineStyle(2,color,a).lineBetween(x-r,y,x+r,y).lineBetween(x,y-r,x,y+r);}
function polygon(g:G,pts:{x:number;y:number}[],color:number,a:number){g.fillStyle(color,a).fillPoints(pts,true);}
function ribbon(g:G,x:number,y:number,angle:number,length:number,width:number,color:number,a:number,bend=0){
 const left=[],right=[];
 for(let i=0;i<=12;i++){const t=i/12,d=t*length,w=width*Math.sin(Math.PI*t)**.6,offset=Math.sin(t*Math.PI)*bend,q=point(x,y,angle,d);
  left.push({x:q.x-Math.sin(angle)*(w+offset),y:q.y+Math.cos(angle)*(w+offset)});
  right.push({x:q.x+Math.sin(angle)*(w-offset),y:q.y-Math.cos(angle)*(w-offset)});
 }
 polygon(g,[...left,...right.reverse()],color,a);
}
function rock(g:G,x:number,y:number,r:number,angle:number,a:number){
 const pts=Array.from({length:6},(_,i)=>point(x,y,angle+i*Math.PI/3,r*(i%2?.87:1)));
 g.fillStyle(0x394f46,a*.22).fillEllipse(x+3,y+r*.65,r*2,r*.65);
 polygon(g,pts,0x5a6061,a);polygon(g,[pts[0],pts[1],{x:x-r*.12,y:y+r*.1},pts[5]],0xaab7b0,a);
 polygon(g,[pts[1],pts[2],pts[3],{x:x-r*.12,y:y+r*.1}],0xd0d6b9,a);
 g.lineStyle(1.4,0xf1e6c6,a*.8).lineBetween(pts[1].x,pts[1].y,pts[2].x,pts[2].y);
 g.lineStyle(1,0x737f77,a).lineBetween(x-r*.12,y+r*.1,pts[4].x,pts[4].y);
}
function wind(g:G,x:number,y:number,r:number,heading:number,a:number){
 const from=point(x,y,heading,-r);
 ribbon(g,from.x,from.y,heading,r*2,r*.44,0x548b9d,a*.35,r*.5);
 ribbon(g,from.x,from.y,heading,r*2,r*.23,0xd6f3ec,a,r*.5);
 ribbon(g,from.x,from.y,heading,r*1.8,r*.08,0xffffff,a*.9,r*.46);
 const tail=point(x,y,heading,-r*1.5);
 g.lineStyle(1,0xbbe5db,a*.5).lineBetween(tail.x,tail.y,from.x,from.y);
}
export function drawWeaponEffect(g:G,f:Effect,time:number,full:boolean){
 const a=Math.max(0,f.life/f.max),p=1-a,color=TYPE_COLOR[f.type??'normal'],angle=f.angle??0,pattern=f.pattern;
 if(pattern==='chain'||pattern==='drain'){
  const pts=f.points??[];
  for(let i=1;i<pts.length;i++){
   const from=pts[i-1],to=pts[i],dx=to.x-from.x,dy=to.y-from.y,d=Math.max(1,Math.hypot(dx,dy));
   if(pattern==='chain'){
    const bolts=Array.from({length:9},(_,j)=>{const v=j/8,w=j===0||j===8?0:Math.sin(j*7.3+f.id)*9*(.75+p*.25);return{x:from.x+dx*v-dy/d*w,y:from.y+dy*v+dx/d*w};});
    g.lineStyle(full?9:5,color,a*.3).strokePoints(bolts,false);g.lineStyle(3,0xfff9bd,a).strokePoints(bolts,false);
   }else{
    ribbon(g,from.x,from.y,Math.atan2(dy,dx),d,4,color,a*.4,Math.sin(p*Math.PI)*18);
    for(let j=0;j<7;j++){const v=(p*2+j/7)%1,x=to.x-dx*v,y=to.y-dy*v;g.fillStyle(color,a).fillCircle(x,y,3+Math.sin(v*Math.PI)*2);star(g,x,y,2,0xffefec,a);}
   }star(g,to.x,to.y,7+Math.sin(p*20)*3,0xffffff,a);
  }
 }else if(pattern==='beam'){
  const end=point(f.x,f.y,angle,f.r),w=f.width??10;
  ribbon(g,f.x,f.y,angle,f.r,w,color,a*.32);
  ribbon(g,f.x,f.y,angle,f.r,w*.5,color,a);
  ribbon(g,f.x,f.y,angle,f.r,w*.15,0xf5ffff,a);
  for(let i=0;i<(full?12:6);i++){
   const d=((p*1.5+i/(full?12:6))%1)*f.r,q=point(f.x,f.y,angle,d);
   if(f.type==='ground'||f.type==='rock')rock(g,q.x,q.y,4+Math.sin(i)*2,i,a*.8);
   else if(f.type==='water'){const side=Math.sin(i*2.3+p*8)*w*.55;g.fillStyle(0xc5f6ff,a*.8).fillCircle(q.x-Math.sin(angle)*side,q.y+Math.cos(angle)*side,1.7);g.lineStyle(1,0xeaffff,a*.55).lineBetween(q.x-Math.sin(angle)*w*.6,q.y+Math.cos(angle)*w*.6,q.x+Math.sin(angle)*w*.6,q.y-Math.cos(angle)*w*.6);}
   else if(f.type==='ice'){polygon(g,[point(q.x,q.y,angle,7),point(q.x,q.y,angle+2.5,4),point(q.x,q.y,angle-2.5,4)],0xe3ffff,a);}
   else star(g,q.x,q.y,2+Math.sin(i)*1.5,0xfff7df,a*.7);
  }
  star(g,end.x,end.y,5+Math.sin(p*Math.PI)*4,color,a*.7);
 }else if(pattern==='slash'){
  const arc=f.width??.8,heading=angle-arc/2+arc*p;
  for(let j=0;j<3;j++){const r=f.r*(.65+j*.12);g.lineStyle(6-j*2,j===1?0xffffff:color,a).beginPath();g.arc(f.x,f.y,r,heading-.35,heading+.2);g.strokePath();}
  const q=point(f.x,f.y,heading,f.r*.8);star(g,q.x,q.y,6,color,a);
 }else if(pattern==='cone'){
  const arc=f.width??.8,tip=point(f.x,f.y,angle,f.r*(.4+p*.6)),left=point(f.x,f.y,angle-arc/2,f.r),right=point(f.x,f.y,angle+arc/2,f.r);
  g.fillStyle(color,a*.12).fillTriangle(f.x,f.y,left.x,left.y,right.x,right.y);
  for(let i=0;i<(full?18:8);i++){const spread=Math.sin(i*6.7)*arc/2,q=point(f.x,f.y,angle+spread,f.r*((p*1.3+i/18)%1));
   if(f.type==='fire'){g.fillStyle(i%2?0xffd467:0xee7639,a).fillTriangle(q.x-5,q.y+5,q.x+6,q.y+3,q.x+Math.sin(time*15+i)*5,q.y-13);g.fillStyle(0xfff2ba,a).fillCircle(q.x,q.y,2);}
   else if(f.type==='normal'||f.type==='flying')wind(g,q.x,q.y,6,angle+spread,a);
   else if(f.type==='water'){g.fillStyle(0x6fc9dc,a*.65).fillEllipse(q.x,q.y,7,4);star(g,q.x,q.y,2,0xeaffff,a);}
   else if(f.type==='ice'){polygon(g,[point(q.x,q.y,angle,8),point(q.x,q.y,angle+2.4,4),point(q.x,q.y,angle-2.4,4)],0xc7f4f5,a);}
   else if(f.type==='grass'||f.type==='bug'){g.fillStyle(color,a).fillEllipse(q.x,q.y,9,4);g.lineStyle(1,0xecf5cf,a).lineBetween(q.x-4,q.y,q.x+4,q.y);}
   else{g.lineStyle(1.5,color,a*.7).strokeCircle(q.x,q.y,3+p*2);star(g,q.x,q.y,2,0xffffff,a*.7);}}
  star(g,tip.x,tip.y,5,color,a);
 }else if(pattern==='charge'||pattern==='dash'){
  const pts=f.points??[];if(pts.length>1){const len=Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y);
   for(let i=0;i<3;i++){const off=(i-1)*7;ribbon(g,pts[0].x-Math.sin(angle)*off,pts[0].y+Math.cos(angle)*off,angle,len,3-i*.4,color,a*.45);}
  }
  for(let i=0;i<8;i++){const q=point(f.x,f.y,i*Math.PI/4,f.r*(.4+p));star(g,q.x,q.y,4,0xfff4cc,a);}
 }
}
export function drawWeaponField(g:G,f:AttackField,time:number,full:boolean){
 const color=TYPE_COLOR[f.type],elapsed=f.duration-f.life,alpha=Math.min(1,f.life/.3),phase=elapsed/f.duration;
 if((f.kind==='zone'||f.kind==='mine')&&elapsed<.28){
  const lift=Math.sin(elapsed/.28*Math.PI)*22;
  g.lineStyle(2,color,.35).lineBetween(f.fromX,f.fromY,f.x,f.y-lift);
  g.fillStyle(color,.9).fillCircle(f.x,f.y-lift,6);star(g,f.x,f.y-lift,3,0xfff7df);return;
 }
 if(f.kind==='orbit'){
  g.lineStyle(1,color,.15).strokeEllipse(f.x,f.y,f.radius*2,f.radius*2);
  for(const q of orbitPoints(f,time)){
   const heading=Math.atan2(q.y-f.y,q.x-f.x)+Math.PI/2;
   if(f.type==='rock'||f.type==='ground'){
    if(full)for(let i=1;i<=3;i++){const a=Math.atan2(q.y-f.y,q.x-f.x)-i*.075,p=point(f.x,f.y,a,f.radius);g.fillStyle(0xc4c4a6,alpha*(.25-i*.05)).fillCircle(p.x,p.y+3,3-i*.4);}
    rock(g,q.x,q.y,f.size,heading+time*.8,alpha);
   }
   else if(f.type==='fire'){g.fillStyle(0xe97936,alpha).fillTriangle(q.x-f.size*.65,q.y+5,q.x+f.size*.65,q.y+5,q.x+Math.sin(time*15)*4,q.y-f.size);g.fillStyle(0xffeaa1,alpha).fillTriangle(q.x-3,q.y+3,q.x+4,q.y+3,q.x,q.y-f.size*.65);}
   else if(f.type==='grass'){g.fillStyle(0x497b4b,alpha).fillEllipse(q.x,q.y,f.size*1.5,f.size*.8);g.lineStyle(2,0xe0f7b5,alpha).lineBetween(q.x-f.size*.6,q.y+2,q.x+f.size*.6,q.y-2);}
   else if(f.type==='psychic'){g.fillStyle(color,alpha*.25).fillCircle(q.x,q.y,f.size);g.fillStyle(color,alpha).fillCircle(q.x,q.y,f.size*.5);star(g,q.x,q.y,5,0xffffff,alpha);}
   else if(f.type==='water'){g.fillStyle(color,alpha).fillCircle(q.x,q.y,f.size*.65);g.lineStyle(2,0xe6ffff,alpha).strokeCircle(q.x,q.y,f.size*.65);star(g,q.x-3,q.y-3,3,0xffffff,alpha);}
   else if(f.type==='normal'||f.type==='flying')wind(g,q.x,q.y,f.size*1.15,heading,alpha);
   else{g.lineStyle(2,color,alpha).beginPath();g.arc(q.x,q.y,f.size,time*3,time*3+Math.PI*1.6);g.strokePath();star(g,q.x,q.y,5,0xf5eadf,alpha*.7);}
  }
 }else if(f.kind==='zone'){
  g.fillStyle(color,.1*alpha).fillCircle(f.x,f.y,f.size);
  const boundary=Array.from({length:40},(_,i)=>point(f.x,f.y,i*Math.PI/20,f.size*(.98+.025*Math.sin(i*3.2+time*1.5))));
  g.lineStyle(1.5,color,.45*alpha).strokePoints(boundary,true);
  for(let i=0;i<(full?14:7);i++){
   const q=point(f.x,f.y,i*2.4,Math.sqrt((i+1)/14)*f.size*.85),rise=(elapsed*12+i*7)%25;
   if(f.type==='poison'||f.type==='ghost'){g.fillStyle(color,alpha*.2).fillEllipse(q.x,q.y,20,10);g.lineStyle(1.5,color,alpha*(1-rise/25)).strokeCircle(q.x,q.y-rise,2+rise*.1);}
   else if(f.type==='grass'||f.type==='bug'){g.fillStyle(0x7fb875,alpha*.8).fillEllipse(q.x+Math.sin(time*2+i)*3,q.y-rise,8,4);g.lineStyle(1,0xd4ebb0,alpha*.6).lineBetween(q.x-3,q.y-rise,q.x+3,q.y-rise-1);}
   else if(f.type==='fire'){g.fillStyle(0xf5b36d,alpha*(1-rise/25)).fillTriangle(q.x-3,q.y,q.x+3,q.y,q.x+Math.sin(time*5+i)*2,q.y-9-rise*.4);}
   else if(f.type==='ground'||f.type==='rock')rock(g,q.x,q.y,3+Math.sin(i)*2,i,alpha*.6);
   else if(f.type==='water'){g.lineStyle(1.5,0xcdf8f3,alpha*(1-rise/25)).strokeEllipse(q.x,q.y,8+rise,4+rise*.4);}
   else{star(g,q.x,q.y-rise,2+Math.sin(time*2+i),color,alpha*.6);}
  }
 }else if(f.kind==='mine'){
  const armed=elapsed>.55;g.fillStyle(0x404d39,.35).fillEllipse(f.x,f.y,26,10);g.lineStyle(2,color,.5).strokeCircle(f.x,f.y,18);
  if(f.type==='normal'||f.type==='grass'){g.fillStyle(0x665744,alpha).fillEllipse(f.x,f.y-5,17,22);g.fillStyle(0xfff7df,alpha).fillEllipse(f.x,f.y-6,14,20);g.fillStyle(0xc8a171,alpha).fillRect(f.x-4,f.y-10,4,4).fillRect(f.x+2,f.y-3,3,4);}
  else if(f.type==='psychic'){g.lineStyle(2,color,alpha).strokeCircle(f.x,f.y-4,13).strokeRect(f.x-8,f.y-12,16,16);for(let i=0;i<4;i++){const q=point(f.x,f.y-4,time*2+i*Math.PI/2,14);star(g,q.x,q.y,2,0xffe4ff,alpha);}}
  else for(let i=0;i<5;i++){const q=point(f.x,f.y,i*1.256,7);g.fillStyle(color,alpha).fillTriangle(q.x-4,q.y+4,q.x+4,q.y+4,q.x,q.y-7);}
  if(armed)star(g,f.x,f.y-4,3+Math.sin(time*8),0xffefa1,alpha);else{g.lineStyle(2,0xffe8b6).beginPath();g.arc(f.x,f.y,20,-Math.PI/2,-Math.PI/2+elapsed/.55*Math.PI*2);g.strokePath();}
 }else if(f.kind==='charge'){
  g.lineStyle(2,color,.2).lineBetween(f.fromX,f.fromY,f.targetX,f.targetY);
  if(full)for(let i=0;i<6;i++){const t=Math.max(0,Math.sin(phase*Math.PI)-i*.06);star(g,f.fromX+(f.targetX-f.fromX)*t,f.fromY+(f.targetY-f.fromY)*t,3,color,.5-i*.07);}
 }
}
export function drawWeaponNova(g:G,f:Effect,time:number,full:boolean){
 const a=f.life/f.max,p=1-a,color=TYPE_COLOR[f.type??'normal'],r=f.r*(.25+.75*(1-(1-p)**2));
 g.lineStyle(7,color,a*.12).strokeCircle(f.x,f.y,r);
 g.lineStyle(2.5,color,a*.8).strokeCircle(f.x,f.y,r);
 const n=full?14:7;
 for(let i=0;i<n;i++){
  const angle=i*Math.PI*2/n,q=point(f.x,f.y,angle,r);
  if(f.type==='rock'||f.type==='ground')rock(g,q.x,q.y,4+a*3,angle,a);
  else if(f.type==='water'||f.type==='normal'||f.type==='flying')wind(g,q.x,q.y,7+a*5,angle+Math.PI/2,a*.8);
  else if(f.type==='grass'||f.type==='bug'){g.fillStyle(color,a).fillEllipse(q.x,q.y,10,5);g.lineStyle(1,0xf1f7d6,a).lineBetween(q.x-4,q.y,q.x+4,q.y-1);}
  else if(f.type==='fire'||f.type==='dragon'){const tail=point(q.x,q.y,angle,-10);ribbon(g,tail.x,tail.y,angle,18,4,color,a);star(g,q.x,q.y,2,0xffefbf,a);}
  else star(g,q.x,q.y,3+a*3,color,a);
 }
}
