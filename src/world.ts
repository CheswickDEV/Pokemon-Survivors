import {sceneryChunk} from './kanto-scenery.ts';
import {TRIAL_ARENA} from './trial-arena.ts';
import {CRATES} from './quests.ts';
import {POIS,OBSTACLES} from './data.ts';
import type {Point,RunState} from './engine.ts';
import {KANTO_LOCATIONS} from './kanto-world-catalog.ts';
import {kantoWalkable} from './kanto-terrain.ts';
export {WORLD_ROUTES,routeDistance,kantoContains,reachableKanto,kantoWalkable,segmentDistance} from './kanto-terrain.ts';
import {KANTO_BUILDINGS,buildingFootprint} from './kanto-layout.ts';
import {roomContains,roomObstacles,interiorBuilding} from './interior-layout.ts';

export const CHUNK_SIZE=512;
export type RunMode='learn'|'normal'|'endless'|'story'|'bossrush';
export interface Treasure extends Point {id:string;quality:number;opened:boolean;evolution:boolean}
export interface WorldProgress {cycle:number;eliteWave:number;encounterWave:number;sites:string[];treasures:Treasure[];lastTreasure:string[]}
export const newWorld=():WorldProgress=>({cycle:0,eliteWave:0,encounterWave:0,sites:[],treasures:[],lastTreasure:[]});
export function hash(seed:number,x:number,y:number,salt=0){let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^seed^salt;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
export const forestSwayX=(y:number)=>Math.sin(y/620)*120;
export const forestSwayY=(x:number)=>Math.sin(x/730)*100;
export function forestPathDistance(x:number,y:number){
 const bentX=x+forestSwayX(y),bentY=y+forestSwayY(x);
 return Math.min(Math.abs(((bentX%900)+900)%900-450)-42,Math.abs(((bentY%1100)+1100)%1100-550)-42,...POIS.map(p=>Math.hypot(x-p.x,y-p.y)-135));
}
export function forestPath(x:number,y:number){
 const bentX=x+forestSwayX(y),bentY=y+forestSwayY(x);
 return Math.abs(((bentX%900)+900)%900-450)<42||Math.abs(((bentY%1100)+1100)%1100-550)<42||POIS.some(p=>Math.hypot(x-p.x,y-p.y)<135);
}
export function forestRoadClear(x:number,y:number,margin=48){
 // Keep the entire visible crown clear, including its tall northern half.
 for(let dy=-margin*1.8;dy<=margin*.4;dy+=12)for(let dx=-margin;dx<=margin;dx+=12)if(forestPath(x+dx,y+dy))return false;
 return true;
}
let forestTreeCache:typeof OBSTACLES|undefined;
export const forestTrees=()=>forestTreeCache??=OBSTACLES.filter(o=>forestRoadClear(o.x,o.y,54));
export interface Decoration extends Point {kind:'tree'|'bush'|'flower'|'rock';r:number;scale:number}
const decorCache=new Map<string,Decoration[]>();
export function decorations(seed:number,cx:number,cy:number):Decoration[]{
 const key=seed+':'+cx+':'+cy,cached=decorCache.get(key);if(cached)return cached;
 const out:Decoration[]=[];
 for(let i=0;i<30;i++){
  const x=cx*512+24+hash(seed,cx,cy,i*3+91)*464,y=cy*512+24+hash(seed,cx,cy,i*3+92)*464;
  if(!forestRoadClear(x,y,i<9?48:24)||Math.hypot(x-1536,y-1710)<170||POIS.some(p=>Math.hypot(x-p.x,y-p.y)<230)||CRATES.some(p=>Math.hypot(x-p.x,y-p.y)<85))continue;
  const kind=i<9?'tree':i<15?'bush':i<27?'flower':'rock';
  out.push({x,y,kind,r:kind==='tree'?14:kind==='rock'?13:0,scale:kind==='tree'?1.8:1.5});
 }
 if(decorCache.size>=96)decorCache.delete(decorCache.keys().next().value!);decorCache.set(key,out);return out;
}
/** One sparse landmark per 8x8-chunk sector at most, never a copy of the three quests. */
function createRareSite(seed:number,sx:number,sy:number){
 if(Math.abs(sx)<1&&Math.abs(sy)<1||hash(seed,sx,sy,771)>.62)return null;
 const x=sx*4096+700+hash(seed,sx,sy,772)*2600,y=sy*4096+700+hash(seed,sx,sy,773)*2600;
 for(let i=0;i<32;i++){const a=i*Math.PI/4,r=Math.floor(i/8)*100,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(forestRoadClear(px,py-35,65))return {id:`grove:${sx}:${sy}`,x:px,y:py,species:[59,65,94,112,123,143][Math.floor(hash(seed,sx,sy,774)*6)]};}
 return null;
}
const rareSiteCache=new Map<string,ReturnType<typeof createRareSite>>();
export function rareSite(seed:number,sx:number,sy:number){const key=seed+':'+sx+':'+sy;if(rareSiteCache.has(key))return rareSiteCache.get(key)!;const site=createRareSite(seed,sx,sy);if(rareSiteCache.size>=256)rareSiteCache.delete(rareSiteCache.keys().next().value!);rareSiteCache.set(key,site);return site;}
export function nearbySites(seed:number,p:Point){const sx=Math.floor(p.x/4096),sy=Math.floor(p.y/4096),out=[];for(let y=sy-1;y<=sy+1;y++)for(let x=sx-1;x<=sx+1;x++){const site=rareSite(seed,x,y);if(site)out.push(site);}return out;}

export function kantoLocationAt(p:Point){let best=KANTO_LOCATIONS[0],distance=Infinity;for(const l of KANTO_LOCATIONS){const d=(l.x-p.x)**2+(l.y-p.y)**2;if(d<distance){distance=d;best=l;}}return best;}
export interface WorldObstacle extends Point {r:number;playerR?:number;playerYOffset?:number;shape?:'circle'|'rect';w?:number;h?:number;id?:string}
export const worldWalkable=(s:RunState,p:Point,r=0)=>s.interior?roomContains(s,p,r):s.mode==='bossrush'?Math.hypot(p.x-TRIAL_ARENA.x,p.y-TRIAL_ARENA.y)<=TRIAL_ARENA.r-r:s.mode!=='story'||kantoWalkable(p,s.story.unlocks,r);
export function currentLocation(s:RunState){const b=interiorBuilding(s);return b?KANTO_LOCATIONS.find(l=>l.id===b.locationId)!:kantoLocationAt(s.trainer);}
const obstacleCache=new Map<string,WorldObstacle[]>();
export function obstaclesAt(s:RunState,p:Point):WorldObstacle[]{
 if(s.mode==='bossrush')return [];
 if(s.interior)return roomObstacles(s);
 const cx=Math.floor(p.x/512),cy=Math.floor(p.y/512),key=s.mode+':'+s.seed+':'+cx+':'+cy,cached=obstacleCache.get(key);if(cached)return cached;
 const out:WorldObstacle[]=[];
 if(s.mode==='story'){
  out.push(...KANTO_BUILDINGS.filter(b=>Math.abs(b.x-(cx*512+256))<800&&Math.abs(b.y-(cy*512+256))<800).map(buildingFootprint));
  for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)out.push(...sceneryChunk(s.seed,x,y).map(o=>({x:o.x,y:o.y-5,r:o.kind==='tree'?15:18,playerR:o.kind==='tree'?18:20})));
 }else{
 out.push(...forestTrees().map(o=>({...o,r:17,playerR:23,playerYOffset:-7})));
 for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)out.push(...decorations(s.seed,x,y).filter(d=>d.r>0).map(d=>({...d,playerR:d.kind==='tree'?19:d.r,playerYOffset:d.kind==='tree'?-5:0})));
 const oldTree=POIS[2];out.push({x:oldTree.x,y:oldTree.y-40,r:24,playerR:30,playerYOffset:-10});
 for(const site of nearbySites(s.seed,p))out.push({x:site.x,y:site.y-35,r:24,playerR:28,playerYOffset:-9});
 const camp=POIS[0];out.push({shape:'rect',x:camp.x,y:camp.y-70,w:110,h:60,r:0});
 }
 if(obstacleCache.size>=96)obstacleCache.delete(obstacleCache.keys().next().value!);obstacleCache.set(key,out);return out;
}
export function obstacleDistance(p:Point,o:WorldObstacle){
 if(o.shape!=='rect')return Math.hypot(p.x-o.x,p.y-o.y)-o.r;
 const dx=Math.abs(p.x-o.x)-o.w!/2,dy=Math.abs(p.y-o.y)-o.h!/2;
 return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0);
}
export function clearWorldPoint(s:RunState,p:Point,r=12){
 return worldWalkable(s,p,r)&&obstaclesAt(s,p).every(o=>obstacleDistance(p,o)>=r);
}
export function worldPoint(s:RunState,p:Point,r=16):Point{
 if(clearWorldPoint(s,p,r))return p;
 for(const distance of [32,64,96,144,208])for(let i=0;i<8;i++){
  const a=i*Math.PI/4,q={x:p.x+Math.cos(a)*distance,y:p.y+Math.sin(a)*distance};
  if(clearWorldPoint(s,q,r))return q;
 }
 // Spawns stay on the continuous route network, with an open point near the trainer as fallback.
 const t=s.trainer;for(let i=0;i<24;i++){const a=i*Math.PI/4,q={x:t.x+Math.cos(a)*(350-i*10),y:t.y+Math.sin(a)*(350-i*10)};if(clearWorldPoint(s,q,r))return q;}
 return {x:t.x+60,y:t.y+60};
}
