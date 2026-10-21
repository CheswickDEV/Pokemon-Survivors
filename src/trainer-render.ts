import {TRAINER_DIRECTIONS,type TrainerArt,type TrainerDirection} from './trainer-art.ts';

/** Cardinal articulation and complete, newly drawn diagonal poses. */
type CanvasFactory=(width:number,height:number)=>HTMLCanvasElement;
const browserCanvas:CanvasFactory=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const vectors:Record<TrainerDirection,[number,number]>={down:[0,1],downRight:[Math.SQRT1_2,Math.SQRT1_2],right:[1,0],upRight:[Math.SQRT1_2,-Math.SQRT1_2],up:[0,-1],upLeft:[-Math.SQRT1_2,-Math.SQRT1_2],left:[-1,0],downLeft:[-Math.SQRT1_2,Math.SQRT1_2]};
const previews=new Map<string,string>();
export const trainerPreview=(trainer:TrainerArt)=>previews.get(trainer.id)??trainer.portrait;

export function makeTrainerAtlas(source:CanvasImageSource,trainer:TrainerArt,make:CanvasFactory=browserCanvas,diagonals?:CanvasImageSource){
 const original=make(384,32),oc=original.getContext('2d')!;oc.drawImage(source,0,0);
 const data=oc.getImageData(0,0,384,32).data;
 const bounds=(frame:number,y:number)=>{
  let lo=32,hi=-1;
  for(let x=0;x<32;x++)if(data[(y*384+frame*32+x)*4+3]>0){lo=Math.min(lo,x);hi=x;}
  return {lo,hi,width:hi-lo+1};
 };
 let top=32,bottom=0;
 for(let y=0;y<32;y++)if(bounds(0,y).width>0){top=Math.min(top,y);bottom=y+1;}
 const height=bottom-top,feet=Math.round(bottom-height*.24),head=Math.round(top+height*.57);
 const atlas=make(64*9,64*8),ctx=atlas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
 for(const [row,direction] of TRAINER_DIRECTIONS.entries()){
  const [vx,vy]=vectors[direction],diagonal=!!vx&&!!vy,mirror=vx<0;
  if(diagonal){
   if(diagonals)ctx.drawImage(diagonals,0,row*64,576,64,0,row*64,576,64);
   continue;
  }
  const base=vy>0?0:vy<0?3:9;
  const pose=make(64,64),pc=pose.getContext('2d')!;pc.imageSmoothingEnabled=false;
  pc.drawImage(original,base*32,0,32,32,0,0,64,64);
  for(let col=0;col<9;col++){
   const phase=col===0?0:(col-1)/8,swing=col===0?0:Math.sin(phase*Math.PI*2);
   const upperBob=0;
   ctx.save();ctx.translate(col*64,row*64);
   ctx.beginPath();ctx.rect(0,0,64,64);ctx.clip();
   if(mirror){ctx.translate(64,0);ctx.scale(-1,1);}
   const draw=(sx:number,sy:number,w:number,h:number,dx:number,dy:number)=>{
    if(w>0&&h>0)ctx.drawImage(pose,sx,sy,w,h,Math.round(sx+dx),Math.round(sy+dy),w,h);
   };
   // Independent feet: travel forward/backward with alternating lift, not a whole-body bounce.
   for(const [i,sign] of [[0,1],[1,-1]]){
    const stride=swing*sign,forward=Math.abs(vx)*stride*(trainer.generation===2?3:2.2);
    const lift=Math.max(0,Math.sin(phase*Math.PI*2+sign*Math.PI/2))*(col===0?0:1.2);
    draw(i*32,feet*2,32,64-feet*2,forward,vy*stride*1.4-Math.abs(vy*swing)*1.4-lift);
   }
   // Body anchored at the hips; only the arm strips counter-swing.
   const arm=trainer.generation===2?12:19;
   draw(arm,head*2,64-arm*2,(feet-head)*2,0,-upperBob);
   draw(0,head*2,arm,(feet-head)*2,-Math.abs(vx)*swing,vy*swing-upperBob);
   draw(64-arm,head*2,arm,(feet-head)*2,Math.abs(vx)*swing,-vy*swing-upperBob);
   draw(0,0,64,head*2,0,-upperBob);
   ctx.restore();
  }
 }
 return atlas;
}

export function rememberTrainerPreview(id:string,atlas:HTMLCanvasElement){previews.set(id,atlas.toDataURL('image/png'));}
