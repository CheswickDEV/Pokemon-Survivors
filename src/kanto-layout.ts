import {BUILDING_BOUNDS} from './kanto-colliders.ts';
import {segmentDistance,WORLD_ROUTES,routeDistance,kantoContains} from './kanto-terrain.ts';
import {KANTO_LOCATIONS,KANTO_GYMS,KANTO_ROUTES,type KantoLocation} from './kanto-world-catalog.ts';
export type BuildingKind='house-red'|'house-blue'|'lab'|'center'|'mart'|'gym'|'department'|'silph'|'tower'|'mansion'|'league'|'cave';
export interface KantoBuilding {id:string;locationId:string;kind:BuildingKind;name:string;x:number;y:number;width:number;service?:'heal'|'shop'}
const b=(l:KantoLocation,kind:BuildingKind,x:number,y:number,name:string,width=148,service?:KantoBuilding['service']):KantoBuilding=>
 ({id:l.id+':'+kind+':'+x+':'+y,locationId:l.id,kind,name,x:l.x+x,y:l.y+y,width,service});
/** Authored town blocks, with central travel lanes and open battle squares.
 * Gen-I landmarks and neighbourhood identities; dimensions adapted to real-time combat. */
export const KANTO_BUILDINGS:KantoBuilding[]=KANTO_LOCATIONS.flatMap(l=>{
 if(l.id==='pallet')return [b(l,'house-red',-165,-80,'Dein Zuhause',148),b(l,'house-blue',165,-80,'Haus deines Rivalen'),b(l,'lab',165,165,'Professor Eichs Labor',182)];
 if(l.id==='indigo')return [b(l,'league',0,-185,'Pokémon-Liga',258),b(l,'center',-180,150,'Pokémon-Center',166,'heal'),b(l,'mart',180,150,'Pokémon-Markt',148,'shop')];
 if(l.id==='sea-cottage')return [b(l,'house-blue',95,-105,'Bills Küstenhaus',158)];
 if(l.kind==='town'){
  const gym='Arena · '+KANTO_GYMS.find(g=>g.locationId===l.id)?.leader;
  const layouts:Record<string,[BuildingKind,number,number,string,number,KantoBuilding['service']?][]>= {
   viridian:[['center',-145,205,'Pokémon-Center',166,'heal'],['mart',165,60,'Pokémon-Markt',148,'shop'],['gym',165,-145,gym,182],['house-red',-145,-125,'Trainerschule',148]],
   pewter:[['lab',-155,-170,'Wissenschaftsmuseum',186],['gym',-155,35,gym,182],['mart',165,55,'Pokémon-Markt',148,'shop'],['center',-155,225,'Pokémon-Center',166,'heal'],['house-red',165,-135,'Nidoran-Haus',148]],
   cerulean:[['center',-155,-25,'Pokémon-Center',166,'heal'],['gym',165,55,gym,182],['house-blue',-155,185,'Fahrradladen',148],['mart',165,230,'Pokémon-Markt',148,'shop'],['house-red',165,-140,'Überfallenes Haus',148]],
   vermilion:[['center',-165,-135,'Pokémon-Center',166,'heal'],['house-blue',-165,40,'Pokémon-Fanclub',154],['gym',-165,220,gym,182],['mart',165,40,'Pokémon-Markt',148,'shop'],['house-red',165,220,'Haus des Anglers',148]],
   lavender:[['center',-165,-125,'Pokémon-Center',166,'heal'],['house-red',-165,60,'Mr. Fujis Haus',148],['mart',165,210,'Pokémon-Markt',148,'shop'],['house-blue',-165,230,'Namensbewerter',140]],
   celadon:[['department',-175,-75,'Kaufhaus',194,'shop'],['center',175,-130,'Pokémon-Center',166,'heal'],['gym',-175,200,gym,182],['house-blue',175,175,'Prismania-Hotel',158]],
   fuchsia:[['mart',-175,-110,'Pokémon-Markt',148,'shop'],['gym',-175,205,gym,182],['center',30,245,'Pokémon-Center',156,'heal'],['house-blue',215,200,'Haus des Safari-Wärters',148]],
   saffron:[['center',-165,225,'Pokémon-Center',166,'heal'],['mart',165,50,'Pokémon-Markt',148,'shop'],['gym',165,-150,gym,182],['gym',-165,-150,'Kampf-Dojo',164],['house-blue',-165,40,'Haus der Nachahmerin',148]],
   cinnabar:[['center',-65,225,'Pokémon-Center',156,'heal'],['mart',155,225,'Pokémon-Markt',148,'shop'],['gym',165,-100,gym,182],['lab',-175,20,'Pokémon-Labor',176]],
  };
  return (layouts[l.id]??[]).map(([kind,x,y,name,width,service])=>b(l,kind,x,y,name,width,service));
 }
 const landmark:Record<string,[BuildingKind,string,number]>={
  'pokemon-tower':['tower','Pokémon-Turm',194],'silph-co':['silph','Silph Co.',222],
  'pokemon-mansion':['mansion','Pokémon-Villa',226],'power-plant':['lab','Kraftwerk',224],
  'rocket-hideout':['department','Spielhalle · Rocket-Versteck',194],
  'mt-moon':['cave','Mondberg',196],'rock-tunnel':['cave','Felstunnel',196],
  'digletts-cave':['cave','Digdas Höhle',176],'seafoam-islands':['cave','Seeschauminseln',210],
  'victory-road':['cave','Siegesstraße',216],'cerulean-cave':['cave','Azuria-Höhle',208],
 };
 const entry=landmark[l.id];return entry?[b(l,entry[0],0,-165,entry[1],entry[2])]:[];
});
const buildingLists=new Map(KANTO_LOCATIONS.map(l=>[l.id,KANTO_BUILDINGS.filter(b=>b.locationId===l.id)]));
const streetLocations=KANTO_LOCATIONS.filter(l=>l.safe||buildingLists.get(l.id)!.length);
export const buildingsAt=(id:string)=>buildingLists.get(id)??[];
export const serviceAt=(id:string,service:KantoBuilding['service'])=>KANTO_BUILDINGS.find(b=>b.locationId===id&&b.service===service);
export const buildingDoor=(b:KantoBuilding)=>({x:b.x,y:b.y+24});
export const buildingFootprint=(b:KantoBuilding)=>{const art=BUILDING_BOUNDS[b.kind],f=art.footprint,scale=b.width/art.width;return {shape:'rect' as const,id:b.id,x:b.x+(f.x+f.width/2)*scale,y:b.y+(f.y+f.height/2+art.height-art.groundY)*scale,w:f.width*scale,h:f.height*scale,r:0};};

type Point={x:number;y:number};
export interface Street {a:Point;b:Point;width:number}
const streetsCache=new Map<string,Street[]>();
/** Streets route around foundations and join every porch to the route network. */
export function townStreets(l:KantoLocation):Street[]{
 const cached=streetsCache.get(l.id);if(cached)return cached;
 const buildings=buildingsAt(l.id),boxes=buildings.map(buildingFootprint),streets:Street[]=[];
 const step=16,limit=Math.ceil((l.radius+80)/step),at=(x:number,y:number)=>({x:l.x+x*step,y:l.y+y*step});
 const exits=WORLD_ROUTES.filter(e=>e.from===l.id||e.to===l.id);
 const clear=(p:Point)=>(kantoContains(p,l,42)||exits.some(e=>routeDistance(p,e)<e.width/2-42))&&boxes.every(b=>Math.abs(p.x-b.x)>b.w/2+42||Math.abs(p.y-b.y)>b.h/2+42);
 // Breadth-first tree connects all destinations to the same central square.
 const queue=[{x:0,y:0}],parents=new Map<string,{x:number;y:number}|null>([['0,0',null]]);
 for(let i=0;i<queue.length;i++){
  const q=queue[i];for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){
   const x=q.x+dx,y=q.y+dy,key=x+','+y;
   if(Math.abs(x)>limit||Math.abs(y)>limit||parents.has(key)||!clear(at(x,y)))continue;
   parents.set(key,q);queue.push({x,y});
  }
 }
 const destinations:Point[]=buildings.map(b=>({x:b.x,y:b.y+64}));
 for(const e of KANTO_ROUTES.filter(e=>e.from===l.id||e.to===l.id)){
  const other=KANTO_LOCATIONS.find(n=>n.id===(e.from===l.id?e.to:e.from))!;
  const next=e.via?.length?(e.from===l.id?e.via[0]:e.via[e.via.length-1]):other;
  const dx=next.x-l.x,dy=next.y-l.y,len=l.safe?Math.max(Math.abs(dx),Math.abs(dy)):Math.hypot(dx,dy),factor=(l.radius+64)/len;
  destinations.push({x:l.x+dx*factor,y:l.y+dy*factor});
 }
 const used=new Set<string>();
 for(const target of destinations){
  let q=queue.reduce((best,n)=>Math.hypot(at(n.x,n.y).x-target.x,at(n.x,n.y).y-target.y)<Math.hypot(at(best.x,best.y).x-target.x,at(best.x,best.y).y-target.y)?n:best,queue[0]);
  streets.push({a:at(q.x,q.y),b:target,width:64});
  for(let parent=parents.get(q.x+','+q.y);parent;parent=parents.get(q.x+','+q.y)){
   const key=q.x+','+q.y;if(used.has(key))break;used.add(key);
   streets.push({a:at(q.x,q.y),b:at(parent.x,parent.y),width:64});q=parent;
  }
 }
 for(const b of buildings)streets.push({a:buildingDoor(b),b:{x:b.x,y:b.y+64},width:48});
 streetsCache.set(l.id,streets);return streets;
}
export function townPath(p:Point,l:KantoLocation){
 if(buildingsAt(l.id).some(b=>{const f=buildingFootprint(b);return Math.abs(p.x-f.x)<f.w/2+3&&Math.abs(p.y-f.y)<f.h/2+3;}))return false;
 return townStreets(l).some(e=>segmentDistance(p,e.a,e.b)<=e.width/2);
}
/** Route roads meet the same town streets used by the minimap. */
export function kantoRoad(p:Point){
 const towns=streetLocations.filter(l=>
  (l.safe?Math.max(Math.abs(p.x-l.x),Math.abs(p.y-l.y)):Math.hypot(p.x-l.x,p.y-l.y))<l.radius+90);
 if(towns.some(l=>townPath(p,l)))return true;
 if(towns.some(l=>kantoContains(p,l)))return false;
 return WORLD_ROUTES.some(e=>routeDistance(p,e)<(e.width<190?28:52));
}
/** Signed road edges for smooth rendering; uses the same authored street network. */
export function kantoRoadDistance(p:Point){
 const towns=streetLocations.filter(l=>
  (l.safe?Math.max(Math.abs(p.x-l.x),Math.abs(p.y-l.y)):Math.hypot(p.x-l.x,p.y-l.y))<l.radius+90);
 let d=Infinity;
 for(const l of towns){
  let street=Math.min(...townStreets(l).map(e=>segmentDistance(p,e.a,e.b)-e.width/2));
  for(const b of buildingsAt(l.id)){
   const f=buildingFootprint(b),dx=Math.abs(p.x-f.x)-f.w/2-3,dy=Math.abs(p.y-f.y)-f.h/2-3;
   const box=Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0);
   street=Math.max(street,-box);
  }
  d=Math.min(d,street);
 }
 if(!towns.some(l=>kantoContains(p,l)))d=Math.min(d,...WORLD_ROUTES.map(e=>routeDistance(p,e)-(e.width<190?28:52)));
 return d;
}
