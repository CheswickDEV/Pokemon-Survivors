import {POIS} from './data.ts';
import {KANTO_LOCATIONS,KANTO_UNLOCK_NAMES} from './kanto-world-catalog.ts';
import {WORLD_ROUTES,reachableKanto,routeDistance,kantoContains} from './world.ts';
import {routeGates,segmentDistance} from './kanto-terrain.ts';
import type {RunState,Point} from './engine.ts';
import {interiorBuilding} from './interior-layout.ts';
export interface WorldNotice {key:string;kind:'place'|'blocked'|'info';title:string;detail:string;until:number;serial:number}
export function areaAt(s:RunState){
 if(s.mode==='bossrush')return {id:'trials',name:'Prüfungsarena',detail:'15 Wächter · Jeder Sieg bringt eine Verbesserung'};
 const building=interiorBuilding(s);if(building)return {id:'room:'+building.id,name:building.name,detail:'Innenraum · E zum Ansprechen · Ausgang unten'};
 if(s.mode!=='story'){
  const poi=POIS.find(p=>Math.hypot(s.trainer.x-p.x,s.trainer.y-p.y)<180);
  return poi?{id:poi.id,name:poi.name,detail:'Auenwald · Waldauftrag'}:{id:'auenwald',name:'Auenwald',detail:'Kanto · Wilde Pokémon & verborgene Lichtungen'};
 }
 const p=s.trainer,loc=KANTO_LOCATIONS.find(l=>kantoContains(p,l));
 if(loc)return {id:loc.id,name:loc.name,detail:loc.safe?'Kanto · Ein Ort zum Durchatmen':loc.kind==='route'?'Kanto · Auf deiner Reise':'Kanto · Erkunde das Gebiet'};
 const route=[...WORLD_ROUTES].sort((a,b)=>routeDistance(p,a)-routeDistance(p,b))[0];
 return {id:route?.name??'kanto',name:route?.name??'Kanto',detail:'Kanto · Auf deiner Reise'};
}
const GATE_HELP:Record<string,string>={
 pokedex:'Hole Eichs Paket im Markt von Vertania ab und bringe es nach Alabastia zu Professor Eich.',
 'boulder-badge':'Besiege Rocko in der Arena von Marmoria City und erhalte den Felsorden.',
 'moon-pass':'Schließe die Fossil-Prüfung im Mondberg ab.',
 ticket:'Hilf Bill in seinem Küstenhaus auf Route 25, um das Bootsticket zu erhalten.',
 cut:'Hilf dem Kapitän der M.S. Anne. Mit Zerschneider öffnest du diesen Weg.',
 'tunnel-pass':'Bestehe die Prüfung im Felstunnel, um den südlichen Ausgang zu erreichen.',
 drink:'Besorge das Getränk bei der Prismania-Etappe für die Torwachen von Saffronia.',
 flute:'Rette Mr. Fuji im Pokémon-Turm. Seine Pokéflöte weckt das schlafende Relaxo.',
 surf:'Finde das Geheimhaus in der Safari-Zone. Dort erhältst du Surfer für die Wasserwege.',
 strength:'Schließe die Safari-Aufgabe mit den Goldzähnen ab. Stärke räumt die Felsen aus dem Weg.',
 badges8:'Gewinne alle acht Arenaorden von Kanto, um zur Siegesstraße zu reisen.',
 'victory-pass':'Bestehe die Siegesstraße, bevor du die Pokémon-Liga herausforderst.',
 champion:'Besiege die Top Vier und den Champ. Danach darfst du die Azuria-Höhle betreten.',
};
export function blockedGate(s:RunState,p:Point){
 if(s.mode!=='story'||s.interior)return null;
 for(const gate of routeGates(s.story.unlocks)){
  if(segmentDistance(p,gate.a,gate.b)>65)continue;
  return {key:gate.requirement,title:'Noch benötigt: '+(KANTO_UNLOCK_NAMES[gate.requirement]??'Reisehilfe'),detail:GATE_HELP[gate.requirement]??'Schließe zuerst die passende Etappe im Reisetagebuch ab.'};
 }
 return null;
}
