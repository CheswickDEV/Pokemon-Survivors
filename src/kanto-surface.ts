import {KANTO_LOCATIONS} from './kanto-world-catalog.ts';
import {kantoWater,kantoDeck,terrainDistance} from './kanto-terrain.ts';
import {kantoRoadDistance} from './kanto-layout.ts';
type Surface={water:boolean;deck:boolean;edge:number;road:number;rock:boolean};
const samples=new Map<string,Surface>();
/** Static world predicates are shared by both renderers; gates remain state-dependent. */
export function kantoSurface(p:{x:number;y:number}):Surface{
 const key=p.x+','+p.y,cached=samples.get(key);if(cached)return cached;
 let loc=KANTO_LOCATIONS[0],distance=Infinity;
 for(const l of KANTO_LOCATIONS){const d=(p.x-l.x)**2+(p.y-l.y)**2;if(d<distance){distance=d;loc=l;}}
 const water=kantoWater(p,loc);
 const value={water,deck:kantoDeck(p,loc),edge:terrainDistance(p),road:water?1:kantoRoadDistance(p),rock:['cave','mountain','ruins'].includes(loc.biome)};
 if(samples.size>=48000)samples.delete(samples.keys().next().value!);samples.set(key,value);return value;
}
