import type {Point,RunState} from './engine.ts';
import {worldWalkable,obstaclesAt,obstacleDistance} from './world.ts';
/** Swept small steps and circle projection: slide around trunks, stop at solid foundations.
 * Existing saves inside a newly added collider may move out, but cannot move deeper inside. */
export function moveBody(s:RunState,body:Point,dx:number,dy:number,r:number){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/6)),sx=dx/steps,sy=dy/steps;
 let boundary=false;
 const reach=Math.hypot(dx,dy)+r+8;
 const obstacles=obstaclesAt(s,body).filter(o=>Math.abs(o.x-body.x)<reach+(o.w??(o.playerR??o.r)*2)/2&&Math.abs(o.y-body.y)<reach+(o.h??(o.playerR??o.r)*2)/2+Math.abs(o.playerYOffset??0)).map(o=>body===s.trainer&&o.playerR?{...o,r:o.playerR,y:o.y+(o.playerYOffset??0)}:o);
 for(let step=0;step<steps;step++){
  const before={x:body.x,y:body.y},next={x:body.x+sx,y:body.y+sy};
  if(!worldWalkable(s,next,r)){
   boundary=true;
   if(worldWalkable(s,{x:next.x,y:body.y},r))next.y=body.y;
   else if(worldWalkable(s,{x:body.x,y:next.y},r))next.x=body.x;
   else {next.x=body.x;next.y=body.y;}
  }
  for(let pass=0;pass<2;pass++)for(const o of obstacles){
   const d=obstacleDistance(next,o),old=obstacleDistance(before,o);
   if(d>=r||old<r&&d>old+.00001)continue;
   if(old<r){next.x=before.x;next.y=before.y;continue;}
   const cx=o.shape==='rect'?Math.max(o.x-o.w!/2,Math.min(o.x+o.w!/2,next.x)):o.x;
   const cy=o.shape==='rect'?Math.max(o.y-o.h!/2,Math.min(o.y+o.h!/2,next.y)):o.y;
   let nx=next.x-cx,ny=next.y-cy,n=Math.hypot(nx,ny);
   if(n<.00001){nx=before.x-o.x;ny=before.y-o.y;n=Math.hypot(nx,ny)||1;}
   const push=r-d+.001;next.x+=nx/n*push;next.y+=ny/n*push;
  }
  if(worldWalkable(s,next,r)){body.x=next.x;body.y=next.y;}
 }
 return boundary;
}
