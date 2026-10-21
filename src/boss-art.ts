import type Phaser from 'phaser';
import type {BossStyle} from './bosses.ts';

/** All distances are world pixels. The outline is the exact gameplay footprint. */
export interface BossVisualHazard {
 uid:number;shape:'circle'|'line'|'ring';style:BossStyle;
 x:number;y:number;angle:number;r:number;width:number;
 createdAt:number;warnUntil:number;expire:number;fired:boolean;
}
type Graphics=Phaser.GameObjects.Graphics;
type Point={x:number;y:number};
const TAU=Math.PI*2;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const fract=(v:number)=>v-Math.floor(v);
const point=(h:BossVisualHazard,forward:number,side=0):Point=>({
 x:Math.round(h.x+Math.cos(h.angle)*forward-Math.sin(h.angle)*side),
 y:Math.round(h.y+Math.sin(h.angle)*forward+Math.cos(h.angle)*side)
});
function polygon(g:Graphics,color:number,alpha:number,points:Point[]){
 g.fillStyle(color,alpha).fillPoints(points,true);
}
function star(g:Graphics,x:number,y:number,size:number,color:number,alpha=1){
 g.fillStyle(color,alpha).fillRect(Math.round(x-size),Math.round(y-1),size*2,2);
 g.fillRect(Math.round(x-1),Math.round(y-size),2,size*2);
}
function diamond(g:Graphics,x:number,y:number,r:number,color:number,alpha=1){
 polygon(g,color,alpha,[{x:x-r,y},{x,y:y-r},{x:x+r,y},{x,y:y+r}]);
}
function leaf(g:Graphics,x:number,y:number,a:number,size:number,alpha:number,color=0x84ca62){
 const dx=Math.cos(a)*size,dy=Math.sin(a)*size,nx=-Math.sin(a)*size*.4,ny=Math.cos(a)*size*.4;
 polygon(g,0x244e3a,alpha,[{x:x-dx*.4,y:y-dy*.4},{x:x+nx,y:y+ny},{x:x+dx,y:y+dy},{x:x-nx,y:y-ny}]);
 polygon(g,color,alpha,[{x:x-dx*.2,y:y-dy*.2},{x:x+nx*.7,y:y+ny*.7},{x:x+dx*.84,y:y+dy*.84},{x:x-nx*.6,y:y-ny*.6}]);
 g.lineStyle(1,0xe2eaa0,alpha*.8).lineBetween(x-dx*.15,y-dy*.15,x+dx*.65,y+dy*.65);
}
function spore(g:Graphics,x:number,y:number,size:number,alpha:number,poison=false){
 // Hard-edged, highlighted seed heads remain legible on the forest tiles.
 diamond(g,Math.round(x),Math.round(y),size+1,poison?0x563f72:0x7f663c,alpha);
 diamond(g,Math.round(x),Math.round(y-1),size,poison?0xbca0dc:0xffd96b,alpha);
 g.fillStyle(poison?0xf2d8f6:0xffffce,alpha).fillRect(Math.round(x-1),Math.round(y-size*.5-1),2,2);
}

function footprint(g:Graphics,h:BossVisualHazard,clock:number,warning:number){
 const pulse=.72+Math.sin(clock*7+h.uid)*.13;
 const color=elementPalette(h.style)[1];
 // Geometry is unchanged by animation: no invisible edges or moving safe zone.
 g.lineStyle(h.fired?1.5:2,color,h.fired?.55:pulse);
 if(h.shape==='line'){
  const corners=[point(h,0,-h.width),point(h,h.r,-h.width),point(h,h.r,h.width),point(h,0,h.width)];
  polygon(g,h.style==='solar'?0xd7de78:0x537c43,h.fired?.075:.045+warning*.035,corners);
  g.strokePoints(corners,true);
  if(!h.fired){
   const count=Math.max(3,Math.floor(h.r/75));
   for(let i=1;i<=count;i++){
    const f=h.r*i/(count+1),d=3+warning*3;
    g.lineStyle(1,color,.4+warning*.3);
    const a=point(h,f-d,-h.width+4),b=point(h,f,-h.width+8),c=point(h,f+d,-h.width+4);
    g.strokePoints([a,b,c],false);
    const d1=point(h,f-d,h.width-4),e=point(h,f,h.width-8),f1=point(h,f+d,h.width-4);
    g.strokePoints([d1,e,f1],false);
   }
  }
 }else if(h.shape==='ring'){
  g.lineStyle(h.width*2,0xa4a34f,h.fired?.085:.075).strokeCircle(h.x,h.y,h.r);
  g.lineStyle(2,color,h.fired?.5:pulse).strokeCircle(h.x,h.y,Math.max(0,h.r-h.width)).strokeCircle(h.x,h.y,h.r+h.width);
 }else{
  g.fillStyle(0x795083,h.fired?.1:.055+warning*.035).fillCircle(h.x,h.y,h.r);
  g.strokeCircle(h.x,h.y,h.r);
 }
}

function ribbon(g:Graphics,h:BossVisualHazard,clock:number,halfWidth:number,color:number,alpha:number,frequency:number,amplitude:number,phase=0){
 const count=Math.max(10,Math.ceil(h.r/13)),upper:Point[]=[],lower:Point[]=[];
 for(let i=0;i<=count;i++){
  const f=h.r*i/count;
  const wave=Math.sin(f*frequency-clock*11+phase)*amplitude*Math.sin(i/count*Math.PI);
  const thickness=halfWidth*(.88+.12*Math.sin(f*.08+clock*19+phase));
  upper.push(point(h,f,wave-thickness));lower.push(point(h,f,wave+thickness));
 }
 polygon(g,color,alpha,[...upper,...lower.reverse()]);
}

function vines(g:Graphics,h:BossVisualHazard,clock:number,warning:number,strike:number,full:boolean){
 const count=Math.max(8,Math.ceil(h.r/29));
 if(!h.fired){
  // Roots and buds mark the complete threat while the plant gathers force.
  for(let i=0;i<count;i++){
   const f=(i+.5)*h.r/count,sway=Math.sin(clock*3+i)*2,p=point(h,f,sway);
   const size=2+warning*3;
   g.lineStyle(2,0x3e673d,.55+warning*.3).lineBetween(p.x-3,p.y+2,p.x+2,p.y-3);
   leaf(g,p.x,p.y,h.angle+(i%2?1.1:-1.1),size,.5+warning*.4);
  }
  for(let i=0;i<3;i++){
   const p=point(h,12+warning*12,i*5-5);
   leaf(g,p.x,p.y,h.angle+(i-1)*.7,6+warning*6,.95);
  }
  return;
 }
 const fade=1-Math.max(0,strike-.76)/.3;
 const width=h.width*(.42+.15*Math.sin(strike*Math.PI));
 ribbon(g,h,clock,width+2,0x203d31,fade,.036,h.width*.19);
 ribbon(g,h,clock,width,0x579243,fade,.036,h.width*.19);
 ribbon(g,h,clock,width*.43,0x99c864,fade,.036,h.width*.19,0);
 // The live vine bends at every segment; thorns, leaf veins and sap move with it.
 for(let i=0;i<count;i++){
  const f=(i+.5)*h.r/count,side=Math.sin(f*.036-clock*11)*h.width*.19;
  const sign=i%2?1:-1,p=point(h,f,side+sign*width*.8);
  const thornBaseA=point(h,f-5,side+sign*width*.7),thornBaseB=point(h,f+5,side+sign*width*.7);
  const tip=point(h,f+3,side+sign*Math.min(h.width-2,width+8));
  polygon(g,0x263e2e,fade,[thornBaseA,tip,thornBaseB]);
  polygon(g,0xd4e39a,fade,[p,tip,thornBaseB]);
  if(full||i%2===0)leaf(g,p.x,p.y,h.angle+sign*(.75+Math.sin(clock*9+i)*.13),8+Math.sin(i*1.7)*2,fade);
 }
 if(full)for(let i=0;i<10;i++){
  const f=fract(clock*1.4+i*.127)*h.r,p=point(h,f,Math.sin(i*2.3+clock*4)*h.width*.55);
  diamond(g,p.x,p.y,2,0xdbefae,fade*.65);
 }
 const tip=point(h,h.r-5,Math.sin(clock*11)*3);
 leaf(g,tip.x,tip.y,h.angle,11,fade,0xc0d977);
}

function solar(g:Graphics,h:BossVisualHazard,clock:number,warning:number,strike:number,full:boolean){
 if(!h.fired){
  const orb=5+warning*h.width*.38,origin=point(h,10,0);
  g.fillStyle(0x93cc68,.18+warning*.13).fillCircle(origin.x,origin.y,orb*1.8);
  diamond(g,origin.x,origin.y,orb+3,0x8db35c,.9);
  diamond(g,origin.x,origin.y,orb,0xf4d76f,1);
  diamond(g,origin.x,origin.y,orb*.58,0xfff9c5,1);
  const count=full?14:7;
  for(let i=0;i<count;i++){
   const t=fract(i/count-clock*(.4+warning*.8));
   const f=18+t*h.r*.75,side=Math.sin(i*2.9+clock*3)*h.width*.55*t,p=point(h,f,side);
   star(g,p.x,p.y,2+warning,0xfff3b5,(1-t)*(.4+warning*.6));
  }
  for(let i=0;i<6;i++){
   const a=clock*1.4+i*TAU/6,r=orb+6+Math.sin(clock*9+i)*3;
   g.lineStyle(2,0xffed9d,.55+warning*.3).lineBetween(origin.x+Math.cos(a)*r,origin.y+Math.sin(a)*r,origin.x+Math.cos(a)*(r+5),origin.y+Math.sin(a)*(r+5));
  }
  return;
 }
 const fade=1-Math.max(0,strike-.72)/.3;
 const swell=.83+Math.sin(strike*Math.PI)*.12,beam=h.width*swell;
 ribbon(g,h,clock,beam,0x95c578,fade*.34,.024,2);
 ribbon(g,h,clock,beam*.75,0xe0db72,fade*.83,.022,3,1);
 ribbon(g,h,clock,beam*.48,0xffe8a0,fade,.033,2,2);
 ribbon(g,h,clock,beam*.21,0xffffdd,fade,.041,1,3);
 const packets=full?16:8;
 for(let i=0;i<packets;i++){
  const f=fract(clock*2.4+i/packets)*h.r,side=Math.sin(i*2.17+clock*6)*beam*.55,p=point(h,f,side);
  // Traveling tapered cores make the beam read as energy instead of a static strip.
  polygon(g,0xfffce0,fade*.72,[point(h,f-14,side),point(h,f,side-3),point(h,Math.min(h.r,f+15),side),point(h,f,side+3)]);
  if(full&&i%3===0)star(g,p.x,p.y,3,0xffffff,fade*.85);
 }
 for(const f of [10,h.r-10]){
  const p=point(h,f),r=beam*(.52+.06*Math.sin(clock*36));
  diamond(g,p.x,p.y,r+7,0xece79b,fade*.5);
  diamond(g,p.x,p.y,r,0xfff8c2,fade);
  star(g,p.x,p.y,r*.85,0xffffff,fade*.9);
 }
 if(full)for(let i=0;i<10;i++){
  const f=fract(i*.173+clock*.7)*h.r,side=(i%2?1:-1)*beam*(.8+.18*Math.sin(clock*8+i));
  const p=point(h,f,side);
  leaf(g,p.x,p.y,clock*5+i,4,fade*.7,0xcde18a);
 }
}

function pollen(g:Graphics,h:BossVisualHazard,clock:number,warning:number,strike:number,full:boolean){
 const count=full?44:26,phase=h.uid*.71;
 if(!h.fired){
  for(let i=0;i<count;i++){
   const a=i*TAU/count+clock*.23,rad=h.r+Math.sin(i*1.9+clock*2)*h.width*.55;
   const x=h.x+Math.cos(a)*rad,y=h.y+Math.sin(a)*rad;
   if(i%3===0)leaf(g,x,y,a+Math.PI*.5,3+warning*4,.4+warning*.45);
   else spore(g,x,y,1.5+warning, .3+warning*.55);
  }
  // Sequential glints visibly complete the charge around the safe central island.
  g.lineStyle(2,0xffedab,.4+warning*.4).beginPath().arc(h.x,h.y,h.r,-Math.PI*.5,-Math.PI*.5+warning*TAU,false).strokePath();
  return;
 }
 const fade=clamp((1-strike)*3),lift=Math.sin(strike*Math.PI)*14;
 g.lineStyle(h.width*1.4,0xffdc7a,fade*.13).strokeCircle(h.x,h.y,h.r);
 for(let i=0;i<count;i++){
  const a=i*TAU/count+clock*.7+phase,wave=Math.sin(i*2.4-clock*8);
  const rad=h.r+wave*h.width*.72;
  const x=h.x+Math.cos(a)*rad,y=h.y+Math.sin(a)*rad-lift*(.25+.75*fract(i*.618));
  if(full){
   const past=a-.045;
   g.lineStyle(2,0xedcf6d,fade*.4).lineBetween(h.x+Math.cos(past)*rad,h.y+Math.sin(past)*rad-lift*.6,x,y);
  }
  spore(g,x,y,3+fract(i*.317)*2,fade);
  if(i%4===0)leaf(g,x+4,y+4,a+clock*3,7,fade,0xc6ce6f);
  if(full&&i%5===0)star(g,x-3,y-6,3,0xffffd0,fade*.8);
 }
}

function spores(g:Graphics,h:BossVisualHazard,clock:number,warning:number,strike:number,full:boolean){
 if(!h.fired){
  const count=full?14:9;
  for(let i=0;i<count;i++){
   const a=i*2.39996+clock*.3,rad=Math.sqrt((i+.5)/count)*h.r*.85;
   const x=h.x+Math.cos(a)*rad,y=h.y+Math.sin(a)*rad;
   spore(g,x,y,2+warning*2,.35+warning*.55,true);
   if(i%3===0)leaf(g,x,y+3,a,4+warning*3,.65,0xa6b47a);
  }
  g.lineStyle(2,0xe8c7ee,.35+warning*.4).strokeCircle(h.x,h.y,h.r*(.2+warning*.6));
  return;
 }
 const fade=clamp((1-strike)*2.5),count=full?30:18;
 g.lineStyle(3,0xdcb7e2,fade*.7).strokeCircle(h.x,h.y,h.r*(.25+.7*strike));
 for(let i=0;i<count;i++){
  const a=i*2.39996+clock*.35,rad=Math.sqrt((i+.5)/count)*h.r*.88;
  const rise=Math.sin(clamp(strike*1.3-fract(i*.171)*.25)*Math.PI)*(12+fract(i*.41)*25);
  const x=h.x+Math.cos(a)*rad,y=h.y+Math.sin(a)*rad-rise;
  if(full){g.lineStyle(2,0x92749e,fade*.35).lineBetween(x,y+rise*.65,x,y+3);}
  spore(g,x,y,3+fract(i*.77)*3,fade,true);
  if(i%5===0)star(g,x-4,y-5,3,0xffd6ed,fade*.7);
 }
 // The central bloom opens continuously, rather than popping a damage rectangle.
 for(let i=0;i<6;i++){
  const a=i*TAU/6+clock*.4,size=7+Math.sin(strike*Math.PI)*8;
  leaf(g,h.x+Math.cos(a)*9,h.y+Math.sin(a)*7,a,size,fade,0xb79abb);
 }
 spore(g,h.x,h.y-3-Math.sin(strike*Math.PI)*8,7,fade,true);
}

/** Deterministic at simulation time, including pause. Reduced effects retain all core attacks. */
export function drawBossAttack(g:Graphics,h:BossVisualHazard,clock:number,full:boolean):void {
 const warning=clamp((clock-h.createdAt)/Math.max(.001,h.warnUntil-h.createdAt));
 const strike=clamp((clock-h.warnUntil)/Math.max(.001,h.expire-h.warnUntil));
 footprint(g,h,clock,warning);
 if(h.style==='vines')vines(g,h,clock,warning,strike,full);
 else if(h.style==='solar')solar(g,h,clock,warning,strike,full);
 else if(h.style==='pollen')pollen(g,h,clock,warning,strike,full);
 else if(h.style==='spores')spores(g,h,clock,warning,strike,full);
 else elemental(g,h,clock,warning,strike,full);
}

function elementPalette(style:BossStyle):[number,number]{
 switch(style){
  case 'flame':return [0xe24d32,0xffe29b];
  case 'water':return [0x328ab8,0xb3f1ff];
  case 'ice':return [0x639bb8,0xe1ffff];
  case 'lightning':return [0xc7a427,0xfff6a0];
  case 'stone':return [0x866451,0xe7d4aa];
  case 'psychic':return [0xab57b5,0xfed1ff];
  case 'shadow':return [0x654b8a,0xd9bbff];
  case 'slash':return [0x6fa885,0xe2fff1];
  case 'spores':return [0x795083,0xe3b3ea];
  case 'solar':return [0xd7de78,0xffe9a3];
  default:return [0x537c43,0xe3e8a1];
 }
}
function elemental(g:Graphics,h:BossVisualHazard,clock:number,warning:number,strike:number,full:boolean){
 const [base,light]=elementPalette(h.style),fade=h.fired?clamp((1-strike)*2):.3+warning*.65;
 const count=full?20:10;
 if(h.shape==='line'){
  if(h.fired){
   ribbon(g,h,clock,h.width*.72,base,fade*.8,.05,h.width*.12);
   ribbon(g,h,clock,h.width*.27,light,fade,.05,h.width*.12);
  }
  for(let i=0;i<count;i++){
   const f=(h.fired?fract(i/count+strike*.8):i/count)*h.r,p=point(h,f,Math.sin(i*2.4+clock*3)*h.width*.6);
   glyph(g,h.style,p.x,p.y,h.angle,h.fired?5+Math.sin(strike*Math.PI)*4:2+warning*3,base,light,fade,clock+i);
  }
 }else{
  if(h.fired){g.lineStyle(4,light,fade*.6).strokeCircle(h.x,h.y,h.r*(.2+.75*strike));}
  for(let i=0;i<count;i++){
   const angle=i*TAU/count+(h.style==='psychic'||h.style==='shadow'?clock*.8:0);
   const radius=h.shape==='ring'?h.r:Math.sqrt((i+.5)/count)*h.r*.8;
   const x=h.x+Math.cos(angle)*radius,y=h.y+Math.sin(angle)*radius;
   glyph(g,h.style,x,y,angle,h.fired?6+Math.sin(strike*Math.PI)*5:2+warning*3,base,light,fade,clock+i);
  }
  if(h.style==='lightning'&&h.fired){
   g.lineStyle(4,light,fade).strokePoints([{x:h.x+8,y:h.y-65},{x:h.x-7,y:h.y-30},{x:h.x+6,y:h.y-30},{x:h.x,y:h.y+6}],false);
  }
 }
}
function glyph(g:Graphics,style:BossStyle,x:number,y:number,a:number,size:number,base:number,light:number,alpha:number,t:number){
 x=Math.round(x);y=Math.round(y);
 if(style==='flame'){
  const flicker=Math.sin(t*12)*size*.2;
  polygon(g,base,alpha,[{x:x-size,y},{x:x-size*.6,y:y-size},{x:x+flicker,y:y-size*2.5},{x:x+size,y}]);
  polygon(g,light,alpha,[{x:x-size*.4,y},{x,y:y-size*1.5},{x:x+size*.4,y}]);
 }else if(style==='stone'){
  polygon(g,base,alpha,[{x:x-size,y:y-size*.5},{x:x-size*.3,y:y-size},{x:x+size,y:y-size*.6},{x:x+size*.8,y:y+size*.6},{x:x-size*.8,y:y+size}]);
  g.lineStyle(2,light,alpha).lineBetween(x-size*.5,y-size*.3,x+size*.4,y-size*.6);
 }else if(style==='ice'){
  diamond(g,x,y,size,base,alpha);diamond(g,x,y-size*.4,size*.6,light,alpha);star(g,x,y,size*.75,light,alpha);
 }else if(style==='lightning'){
  g.lineStyle(2,light,alpha).strokePoints([{x:x-size,y:y-size},{x:x+size*.3,y:y-2},{x:x-size*.3,y:y+2},{x:x+size,y:y+size}],false);
 }else if(style==='water'){
  g.lineStyle(3,base,alpha).strokeCircle(x,y,size);
  g.lineStyle(2,light,alpha).lineBetween(x-size*.5,y-size*.6,x+size*.4,y-size*.6);
 }else if(style==='slash'){
  g.lineStyle(3,light,alpha).lineBetween(x-Math.cos(a)*size*2,y-Math.sin(a)*size*2,x+Math.cos(a)*size*2,y+Math.sin(a)*size*2);
 }else{
  g.fillStyle(base,alpha*.4).fillCircle(x,y,size);
  g.lineStyle(2,light,alpha).strokeCircle(x,y,size*.75);
  star(g,x,y,size*.45,light,alpha);
 }
}
