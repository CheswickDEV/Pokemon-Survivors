import type {Pickup,RunState} from './engine.ts';
export const isForest=(s:Pick<RunState,'mode'>)=>['learn','normal','endless'].includes(s.mode);
/** Simultaneous special fights, shared by roaming elites and rare groves. */
export const forestEliteLimit=(s:Pick<RunState,'difficulty'>)=>s.difficulty==='master'?4:s.difficulty==='veteran'?3:2;
export const activeEliteCount=(s:RunState)=>s.enemies.filter(e=>e.hp>0&&(e.kind==='elite'||e.kind==='guardian'&&e.objective===3)).length;
/**
 * Keep fresh local experience local. Combine the closest same-kind pair, rather
 * than sending an arbitrary fifty drops to the oldest point in the world.
 * This preserves every reward, type and an existing reachable pickup position.
 */
export function compactPickups(pickups:Pickup[],limit=200){
 while(pickups.length>limit){
  let ai=-1,bi=-1,best=Infinity;
  const sorted=pickups.map((p,i)=>({p,i})).sort((a,b)=>a.p.x-b.p.x);
  for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){
   const a=sorted[i],b=sorted[j],dx=b.p.x-a.p.x;
   if(dx*dx>best)break;
   if(a.p.kind!==b.p.kind)continue;
   const d=dx*dx+(a.p.y-b.p.y)**2;
   if(d<best){best=d;ai=a.i;bi=b.i;}
  }
  if(ai<0)break;
  const a=pickups[ai],b=pickups[bi];
  // Retain the larger pile's position; never relocate the entire kind's rewards.
  if(b.value>a.value){a.x=b.x;a.y=b.y;}
  a.value+=b.value;pickups.splice(bi,1);
 }
}
