import {KANTO_LOCATIONS,KANTO_ROUTES,type KantoLocation} from './kanto-world-catalog.ts';
type Point={x:number;y:number};
export const segmentDistance=(p:Point,a:Point,b:Point)=>{
 const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
};
const places=new Map(KANTO_LOCATIONS.map(l=>[l.id,l]));
export const WORLD_ROUTES=KANTO_ROUTES.map(e=>({...e,points:[places.get(e.from)!,...(e.via??[]),places.get(e.to)!]}));
export function routeDistance(p:Point,e:typeof WORLD_ROUTES[number]){
 let d=Infinity;for(let i=1;i<e.points.length;i++)d=Math.min(d,segmentDistance(p,e.points[i-1],e.points[i]));return d;
}
/** One outline for terrain, collision and both maps. Routes include generous verges. */
export const kantoContains=(p:Point,l:KantoLocation,radius=0)=>l.safe?
 Math.abs(p.x-l.x)<l.radius-radius&&Math.abs(p.y-l.y)<l.radius-radius:
 Math.hypot(p.x-l.x,p.y-l.y)<l.radius-radius;
const coastalLandRoutes=WORLD_ROUTES.filter(e=>e.requirement!=='surf'&&e.from!=='seafoam-islands'&&e.to!=='ss-anne');
export const kantoWater=(p:Point,l:KantoLocation)=>l.id==='ss-anne'||
 (l.biome==='water'||l.biome==='coast'&&!kantoContains(p,l))&&!coastalLandRoutes.some(e=>routeDistance(p,e)<e.width/2);
const harbor=WORLD_ROUTES.find(e=>e.to==='ss-anne')!;
export function kantoDeck(p:Point,l:KantoLocation){
 if(l.id==='ss-anne'&&kantoContains(p,l))return true;
 if(p.y>places.get('vermilion')!.y+360&&routeDistance(p,harbor)<harbor.width/2)return true;
 return l.id==='route-24'&&kantoContains(p,l)&&p.y>=l.y&&Math.abs(p.x-l.x)<70;
}
export function terrainDistance(p:Point){
 let distance=Infinity;
 for(const l of KANTO_LOCATIONS){
  const dx=Math.abs(p.x-l.x)-l.radius,dy=Math.abs(p.y-l.y)-l.radius;
  const d=l.safe?Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0):Math.hypot(p.x-l.x,p.y-l.y)-l.radius;
  distance=Math.min(distance,d);
 }
 for(const e of WORLD_ROUTES)distance=Math.min(distance,routeDistance(p,e)-e.width/2);
 return distance;
}
const reachCache=new Map<string,Set<string>>();
export function reachableKanto(unlocks:readonly string[]){
 const key=[...unlocks].sort().join('|'),cached=reachCache.get(key);if(cached)return cached;
 const reached=new Set(['pallet']);let changed=true;
 while(changed){changed=false;for(const edge of KANTO_ROUTES){if(edge.requirement&&!unlocks.includes(edge.requirement))continue;if(reached.has(edge.from)&&!reached.has(edge.to)){reached.add(edge.to);changed=true;}if(reached.has(edge.to)&&!reached.has(edge.from)){reached.add(edge.from);changed=true;}}}
 if(reachCache.size>100)reachCache.clear();reachCache.set(key,reached);return reached;
}
export interface RouteGate {id:string;requirement:string;x:number;y:number;nx:number;ny:number;halfWidth:number;a:Point;b:Point}
const gateCache=new Map<string,RouteGate[]>();
export function routeGates(unlocks:readonly string[]){
 const key=[...unlocks].sort().join('|'),cached=gateCache.get(key);if(cached)return cached;
 const reached=reachableKanto(unlocks),out:RouteGate[]=[];
 for(const e of WORLD_ROUTES){
  if(!e.requirement||unlocks.includes(e.requirement))continue;
  for(const id of [e.from,e.to]){
   if(!reached.has(id))continue;
   const l=places.get(id)!,points=id===e.from?e.points:[...e.points].reverse(),next=points[1];
   const length=Math.hypot(next.x-l.x,next.y-l.y),nx=(next.x-l.x)/length,ny=(next.y-l.y)/length;
   const d=(l.safe?l.radius/Math.max(Math.abs(nx),Math.abs(ny)):l.radius)-10;
   const x=l.x+nx*d,y=l.y+ny*d,halfWidth=e.width/2+36;
   out.push({id:e.id+':'+id,requirement:e.requirement,x,y,nx,ny,halfWidth,
    a:{x:x-ny*halfWidth,y:y+nx*halfWidth},b:{x:x+ny*halfWidth,y:y-nx*halfWidth}});
  }
 }
 if(gateCache.size>100)gateCache.clear();gateCache.set(key,out);return out;
}
export function kantoWalkable(p:Point,unlocks:readonly string[],radius=0){
 if(routeGates(unlocks).some(g=>segmentDistance(p,g.a,g.b)<radius+12))return false;
 const reachable=reachableKanto(unlocks);
 radius-=54; // Walkable grass extends to the physical tree/rock bank. Gates keep their full collision.
 if(KANTO_LOCATIONS.some(l=>reachable.has(l.id)&&kantoContains(p,l,radius)))return true;
 return WORLD_ROUTES.some(e=>(!e.requirement||unlocks.includes(e.requirement))&&reachable.has(e.from)&&reachable.has(e.to)&&routeDistance(p,e)<e.width/2-radius);
}
