import type {Point,RunState} from './engine.ts';
import {obstacleDistance,obstaclesAt,segmentDistance,worldWalkable,type WorldObstacle} from './world.ts';
export function crossesObstacle(a:Point,b:Point,o:WorldObstacle,r:number){
 if(o.shape!=='rect')return segmentDistance(o,a,b)<o.r+r;
 let enter=0,exit=1;
 for(const axis of ['x','y'] as const){
  const half=(axis==='x'?o.w!:o.h!)/2+r,delta=b[axis]-a[axis];
  if(Math.abs(delta)<.00001){if(a[axis]<=o[axis]-half||a[axis]>=o[axis]+half)return false;continue;}
  const t1=(o[axis]-half-a[axis])/delta,t2=(o[axis]+half-a[axis])/delta;
  enter=Math.max(enter,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));if(enter>exit)return false;
 }
 return enter<1&&exit>0;
}
export interface Detour {obstacle:WorldObstacle;points:Point[]}
/** Small visibility graph around the currently blocking object, not a whole-map search. */
export function findDetour(s:RunState,start:Point,target:Point,r:number):Detour|null{
 const obstacles=obstaclesAt(s,start),o=obstacles.filter(o=>obstacleDistance(start,o)<r+9&&crossesObstacle(start,target,o,r)).sort((a,b)=>obstacleDistance(start,a)-obstacleDistance(start,b))[0];
 if(!o)return null;
 const margin=r+10;
 const corners:Point[]=o.shape==='rect'?
  [[-1,-1],[1,-1],[1,1],[-1,1]].map(([dx,dy])=>({x:o.x+dx*(o.w!/2+margin),y:o.y+dy*(o.h!/2+margin)})):
  Array.from({length:12},(_,i)=>({x:o.x+Math.cos(i*Math.PI/6)*(o.r+margin),y:o.y+Math.sin(i*Math.PI/6)*(o.r+margin)}));
 const nodes=[start,...corners.filter(p=>worldWalkable(s,p,r)),target],last=nodes.length-1;
 const cost=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),done=new Set<number>();cost[0]=0;
 for(let iter=0;iter<nodes.length;iter++){
  let i=-1;for(let j=0;j<nodes.length;j++)if(!done.has(j)&&(i===-1||cost[j]<cost[i]))i=j;
  if(i<0||!Number.isFinite(cost[i]))break;if(i===last)break;done.add(i);
  for(let j=1;j<nodes.length;j++){
   if(i===j||done.has(j)||obstacles.some(o=>crossesObstacle(nodes[i],nodes[j],o,Math.max(0,r-.05))))continue;
   const d=cost[i]+Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
   if(d<cost[j]){cost[j]=d;prev[j]=i;}
  }
 }
 if(prev[last]===-1)return null;
 const points:Point[]=[];for(let i=prev[last];i>0;i=prev[i])points.unshift({...nodes[i]});
 return points.length?{obstacle:o,points}:null;
}
