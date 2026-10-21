import {TRAINER_DIRECTIONS,type TrainerDirection} from './trainer-art.ts';
export type DirectionSize=Record<TrainerDirection,{x:number;y:number}>;
/** Match cardinal silhouette area to the four approved diagonal rows.
 * One scale per direction, never per frame, avoids size pulsing during footsteps. */
export function measureTrainerSize(data:Uint8ClampedArray,width=576):DirectionSize{
 const sizes=TRAINER_DIRECTIONS.map((_,row)=>{
  let area=0,height=0;
  for(let col=1;col<=8;col++){
   let top=64,bottom=-1;
   for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(data[((row*64+y)*width+col*64+x)*4+3]>32){area++;top=Math.min(top,y);bottom=Math.max(bottom,y);}
   height+=Math.max(1,bottom-top+1);
  }return {area:area/8,height:height/8};
 });
 const targetArea=[1,3,5,7].reduce((sum,i)=>sum+sizes[i].area,0)/4;
 const targetHeight=[1,3,5,7].reduce((sum,i)=>sum+sizes[i].height,0)/4;
 return Object.fromEntries(TRAINER_DIRECTIONS.map((d,i)=>{
  if(i%2)return [d,{x:1,y:1}];
  const y=Math.min(1,targetHeight/sizes[i].height);
  const x=Math.min(1,targetArea/(Math.max(1,sizes[i].area)*y));
  return [d,{x,y}];
 })) as DirectionSize;
}
