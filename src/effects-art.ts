import type {Element} from './data.ts';
import {ELEMENTS} from './data.ts';
export const ATTACK_TYPES:Element[]=ELEMENTS;
/** Small authored pixel effects. Six frames face right; the renderer rotates them along travel. */
export function makeProjectileSheet(type:Element){
 const canvas=document.createElement('canvas');canvas.width=32*6;canvas.height=24;
 const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
 for(let frame=0;frame<6;frame++){
  ctx.save();ctx.translate(frame*32,0);
  const pixel=(color:string,x:number,y:number,w=2,h=2)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  const poly=(color:string,points:number[][])=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
  const wave=frame%3;
  if(type==='grass'){
   poly('#285e39',[[5,12],[11,5],[21,4],[28,10],[25,15],[15,20],[8,17]]);
   poly('#83cc46',[[8,11],[14,6],[23,6],[27,10],[23,14],[15,17],[10,16]]);
   poly('#c5ef74',[[10,11],[16,7],[24,8],[16,12]]);
   pixel('#3d8c43',10,12,15,2);pixel('#f1f7ac',2+wave,5+wave);pixel('#77b94e',5-wave,18-wave);
  }else if(type==='fire'){
   poly('#bc343a',[[1+wave,5],[12,7],[16,3],[26,6],[31,11],[28,17],[20,21],[12,17],[2,20],[7,12]]);
   poly('#f47c37',[[6,8],[15,10],[18,5],[26,8],[29,12],[26,17],[20,18],[12,14],[5,17],[10,12]]);
   poly('#ffd25d',[[13,10],[22,8],[27,12],[24,16],[17,15]]);
   pixel('#fff3b2',21,10,5,4);pixel('#ffd778',2,3+frame*2%16);
  }else if(type==='water'){
   poly('#285eac',[[4,11],[13,5],[22,4],[28,8],[30,12],[27,18],[19,20],[11,17]]);
   poly('#53bfe0',[[8,11],[16,7],[24,7],[28,12],[24,17],[16,17]]);
   poly('#a0edee',[[14,8],[22,6],[26,9],[19,11]]);pixel('#ecffff',20,7,4,2);
   pixel('#8de0f2',2+wave,15,3,2);pixel('#d4f9ff',8-wave,3+frame%2);
  }else if(type==='electric'){
   poly('#ad7c20',[[1,10],[12,6],[9,11],[22,4],[18,11],[31,8],[23,17],[23,13],[10,19],[13,13],[2,16]]);
   poly('#ffe04c',[[2,11],[14,7],[11,12],[24,6],[20,12],[29,10],[21,16],[21,12],[11,17],[15,12],[4,14]]);
   pixel('#fffce0',16,10,8,2);pixel('#ffed7c',5+wave*2,2+wave);pixel('#fff8a9',25-wave,20-wave);
  }else if(type==='bug'){
   for(let i=0;i<4;i++){pixel(i%2?'#eff0bd':'#92ac63',2+i*6,9+(i+frame)%3*2,7,2);}
   poly('#e7e4b1',[[18,6],[27,5],[30,11],[27,18],[18,17],[15,11]]);
   for(const [x,y]of [[20,8],[25,8],[18,12],[24,12],[23,16]])pixel('#809c61',x,y);
  }else if(type==='ice'){
   poly('#3f92b3',[[6,12],[18,2],[30,12],[18,22]]);poly('#9ceaf3',[[9,12],[18,4],[27,12],[18,19]]);
   poly('#ecffff',[[18,4],[25,11],[18,12],[13,10]]);pixel('#fff',17,6,2,12);pixel('#bceef6',2+wave,4);pixel('#6dccdd',4,18-wave);
  }else if(type==='ground'||type==='rock'){
   poly(type==='rock'?'#5c5051':'#8b5d38',[[8,5],[19,3],[28,8],[30,16],[22,21],[10,18],[5,12]]);
   poly(type==='rock'?'#aba28a':'#d3a56a',[[10,6],[20,5],[27,10],[20,15],[9,12]]);
   poly(type==='rock'?'#d1cbb4':'#ecc38b',[[11,6],[20,5],[22,8],[14,10]]);poly('#736454',[[20,15],[27,10],[28,16],[21,19]]);
   pixel('#b8a079',2+wave,6,3,3);pixel('#c2ac84',3,17-wave,4,3);
  }else if(type==='psychic'||type==='ghost'){
   poly(type==='ghost'?'#44296e':'#8c306e',[[3+wave,3],[12,7],[20,3],[28,7],[30,14],[23,20],[14,18],[6,21],[8,13]]);
   poly(type==='ghost'?'#8c73cf':'#e77cbb',[[11,9],[19,6],[26,9],[27,14],[21,17],[14,15]]);
   pixel('#f9dbfc',18,8,6,3);pixel('#f9ebff',23,12,3,3);
   if(type==='ghost'){pixel('#322758',17,12,3,3);pixel('#322758',24,12,3,3);}else{pixel('#fff4ff',5+wave,5,2,7);pixel('#fff4ff',3+wave,7,6,2);}
  }else if(type==='fighting'){
   for(let i=0;i<3;i++)pixel('#caa88b',2+i*3,5+i*6,8,2);
   poly('#703f35',[[12,7],[17,3],[22,3],[28,7],[29,16],[23,21],[15,18],[11,12]]);
   poly('#d78d66',[[14,8],[18,5],[22,5],[26,8],[27,15],[22,18],[16,16]]);
   for(let i=0;i<3;i++)pixel('#f4c9a3',17+i*3,6,2,5);pixel('#9e5946',16,13,9,2);
  }else if(type==='dragon'){
   poly('#34377e',[[1,3],[12,8],[18,3],[28,6],[31,12],[27,18],[17,22],[9,16],[2,20],[6,12]]);
   poly('#617edb',[[6,7],[15,11],[20,5],[27,9],[29,13],[25,17],[18,18],[10,13]]);
   poly('#e9bd66',[[15,10],[22,8],[27,12],[22,16],[17,14]]);pixel('#fff3bd',22,10,3,4);pixel('#9bb5ff',3+wave,4+frame*2);
  }else if(type==='normal'||type==='flying'){
   const color=type==='flying'?'#b9e3f0':'#e9dfca';
   for(let i=0;i<3;i++)poly(color,[[4+i*4,5+i*4],[25,2+i*5],[29,5+i*5],[14+i*3,9+i*4]]);
   pixel('#fffdeb',22,9,7,2);pixel('#9d9bb0',5+frame,19);
  }else{
   poly('#754293',[[10,5],[22,4],[29,9],[27,17],[18,20],[9,16],[6,10]]);
   poly('#bd7ac8',[[12,7],[22,6],[26,10],[24,15],[16,16],[11,12]]);
   pixel('#f0b4e2',17,7,6,3);pixel('#a766b5',3+wave,15,4,4);pixel('#de91d1',5,4,3,3);
  }
  ctx.restore();
 }
 return canvas;
}
export function makePickupSheet(){
 const canvas=document.createElement('canvas');canvas.width=20*8;canvas.height=24;const c=canvas.getContext('2d')!;
 for(let i=0;i<8;i++){
  const x=i*20,w=3+Math.round(Math.abs(Math.cos(i*Math.PI/4))*5);
  c.fillStyle='#175c87';c.beginPath();c.moveTo(x+10,2);c.lineTo(x+10+w,11);c.lineTo(x+10,22);c.lineTo(x+10-w,11);c.closePath();c.fill();
  c.fillStyle='#53c5f3';c.beginPath();c.moveTo(x+10,4);c.lineTo(x+8+w,11);c.lineTo(x+10,19);c.lineTo(x+12-w,11);c.closePath();c.fill();
  c.fillStyle='#dcffff';c.fillRect(x+9,6,2,7);
 }
 return canvas;
}
