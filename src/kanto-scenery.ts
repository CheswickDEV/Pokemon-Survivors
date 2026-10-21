import {KANTO_LOCATIONS} from './kanto-world-catalog.ts';
import {terrainDistance} from './kanto-terrain.ts';
export interface KantoScenery {x:number;y:number;kind:'tree'|'rock';width:number;height:number}
const cache=new Map<string,KantoScenery[]>();
const hash=(seed:number,x:number,y:number)=>{let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^seed^201;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
/** Shared by scenery, physical trunks, and minimap. Generated once per chunk. */
export function sceneryChunk(seed:number,cx:number,cy:number){
 const key=seed+':'+cx+':'+cy,cached=cache.get(key);if(cached)return cached;
 const out:KantoScenery[]=[];
 for(let y=Math.ceil(cy*512/48)*48;y<(cy+1)*512;y+=48)for(let x=Math.ceil(cx*512/48)*48;x<(cx+1)*512;x+=48){
  const edge=terrainDistance({x,y:y-30});if(edge<14||edge>120&&hash(seed,x,y)<.18)continue;
  let loc=KANTO_LOCATIONS[0],d=Infinity;
  for(const l of KANTO_LOCATIONS){const n=(l.x-x)**2+(l.y-y)**2;if(n<d){loc=l;d=n;}}
  const rock=['water','coast','cave','mountain','ruins'].includes(loc.biome);
  out.push({x,y,kind:rock?'rock':'tree',width:rock?40:57.6,height:rock?40:86.4});
 }
 if(cache.size>=256)cache.delete(cache.keys().next().value!);cache.set(key,out);return out;
}
