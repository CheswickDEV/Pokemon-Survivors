import {sceneryChunk} from './kanto-scenery.ts';
import type {Point,RunState} from './engine.ts';
import {decorations,forestTrees,nearbySites,hash,kantoLocationAt,forestSwayX,forestSwayY} from './world.ts';
import {terrainDistance} from './kanto-terrain.ts';
import {POIS} from './data.ts';
export interface MapBounds {x:number;y:number;width:number;height:number}
export interface MapObject extends Point {kind:'tree'|'bush'|'rock'|'cabin'|'garden';width:number;height:number}
export function forestRoadPolygons(b:MapBounds):Point[][]{
 const paths:Point[][]=[];
 for(let k=Math.floor((b.x-180)/900);k<=Math.ceil((b.x+b.width+180)/900);k++){
  const left:Point[]=[],right:Point[]=[];
  for(let y=b.y-32;y<=b.y+b.height+32;y+=16){const x=450+k*900-forestSwayX(y);left.push({x:x-42,y});right.push({x:x+42,y});}
  paths.push([...left,...right.reverse()]);
 }
 for(let k=Math.floor((b.y-180)/1100);k<=Math.ceil((b.y+b.height+180)/1100);k++){
  const top:Point[]=[],bottom:Point[]=[];
  for(let x=b.x-32;x<=b.x+b.width+32;x+=16){const y=550+k*1100-forestSwayY(x);top.push({x,y:y-42});bottom.push({x,y:y+42});}
  paths.push([...top,...bottom.reverse()]);
 }
 for(const p of POIS)paths.push(Array.from({length:64},(_,i)=>({x:p.x+135*Math.cos(i*Math.PI/32),y:p.y+135*Math.sin(i*Math.PI/32)})));
 return paths;
}
/** The same generated coordinates, sizes and ground anchors as WorldView. */
export function mapObjects(s:RunState,b:MapBounds):MapObject[]{
 const out:MapObject[]=[],inside=(p:Point,pad=100)=>p.x>b.x-pad&&p.x<b.x+b.width+pad&&p.y>b.y-pad&&p.y<b.y+b.height+pad;
 if(s.mode==='story'){
  for(let cy=Math.floor((b.y-100)/512);cy<=Math.floor((b.y+b.height+100)/512);cy++)for(let cx=Math.floor((b.x-100)/512);cx<=Math.floor((b.x+b.width+100)/512);cx++)out.push(...sceneryChunk(s.seed,cx,cy).filter(o=>inside(o)));
 }else{
  for(const p of forestTrees())if(inside(p))out.push({...p,kind:'tree',width:70.4,height:105.6});
  for(let cy=Math.floor((b.y-80)/512);cy<=Math.floor((b.y+b.height+80)/512);cy++)for(let cx=Math.floor((b.x-80)/512);cx<=Math.floor((b.x+b.width+80)/512);cx++){
   for(const p of decorations(s.seed,cx,cy))if(p.kind!=='flower'&&inside(p))out.push({...p,kind:p.kind,width:(p.kind==='tree'?32:16)*p.scale,height:(p.kind==='tree'?48:16)*p.scale});
  }
  for(const site of nearbySites(s.seed,{x:b.x+b.width/2,y:b.y+b.height/2}))if(inside(site))out.push({x:site.x,y:site.y-35,kind:'tree',width:89.6,height:134.4});
  for(const p of POIS)if(inside(p)){
   if(p.id==='camp')out.push({x:p.x,y:p.y-40,kind:'cabin',width:128,height:96});
   if(p.id==='tree')out.push({x:p.x,y:p.y-40,kind:'tree',width:96,height:144});
   if(p.id==='garden')out.push({...p,kind:'garden',width:156,height:156});
  }
 }
 return out.sort((a,b)=>a.y-b.y);
}
/**
 * Isocontours from the actual terrain predicates. Each shared vertex is sampled
 * once; polygons interpolate across cell edges instead of drawing pixel tiles.
 * Negative values are inside. No decorative or invented map features.
 */
export function contourPolygons(bounds:MapBounds,step:number,sample:(p:Point)=>number):Point[][]{
 const nx=Math.ceil(bounds.width/step),ny=Math.ceil(bounds.height/step),grid:number[][]=[];
 for(let y=0;y<=ny;y++){grid[y]=[];for(let x=0;x<=nx;x++)grid[y][x]=sample({x:bounds.x+x*step,y:bounds.y+y*step});}
 const out:Point[][]=[];
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
  const p=[{x:bounds.x+x*step,y:bounds.y+y*step},{x:bounds.x+(x+1)*step,y:bounds.y+y*step},{x:bounds.x+(x+1)*step,y:bounds.y+(y+1)*step},{x:bounds.x+x*step,y:bounds.y+(y+1)*step}];
  const v=[grid[y][x],grid[y][x+1],grid[y+1][x+1],grid[y+1][x]];
  if(v.every(v=>v>=0))continue;
  if(v.every(v=>v<0)){out.push(p);continue;}
  for(const tri of [[0,1,2],[0,2,3]]){
   const poly:Point[]=[];
   for(let i=0;i<3;i++){
    const a=tri[i],b=tri[(i+1)%3];
    if(v[a]<0)poly.push(p[a]);
    if((v[a]<0)!==(v[b]<0)){const t=v[a]/(v[a]-v[b]);poly.push({x:p[a].x+(p[b].x-p[a].x)*t,y:p[a].y+(p[b].y-p[a].y)*t});}
   }
   if(poly.length>=3)out.push(poly);
  }
 }
 return out;
}
export function mapProjection(center:Point,span:number,size:number,p:Point){return {x:(p.x-center.x)*size/span+size/2,y:(p.y-center.y)*size/span+size/2};}
