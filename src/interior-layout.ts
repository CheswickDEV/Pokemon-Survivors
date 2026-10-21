import {ROOM_PROP_BOUNDS} from './interior-bounds.ts';
import {KANTO_BUILDINGS,buildingDoor,type KantoBuilding} from './kanto-layout.ts';
import {KANTO_LOCATIONS,KANTO_GYMS,KANTO_STORY,type KantoStoryMilestone} from './kanto-world-catalog.ts';
import type {RunState,Point,Enemy,Pickup,Encounter} from './engine.ts';
export interface RoomContents {pickups:Pickup[];encounters:Encounter[]}
export interface InteriorState {buildingId:string;returnPoint:Point;outside:RoomContents&{enemies:Enemy[]}}
export interface RoomProp extends Point {key:string;w:number;h:number;solid?:boolean}
export interface RoomNpc extends Point {id:string;name:string;sprite:string;role:'heal'|'shop'|'story'|'talk';text:string;approach:Point}
const RESIDENTS:Record<string,{name:string;sprite?:string;text:string;style?:'study'|'shop'|'hotel'|'lab'|'club'}>={
 'Dein Zuhause':{name:'Mama',sprite:'mom',text:'Pass gut auf dich auf! Schwester Joy füllt die Ausdauer deiner Pokémon auf. Für deine eigenen KP brauchst du die seltenen Vorräte auf deiner Reise.'},
 'Haus deines Rivalen':{name:'Schwester deines Rivalen',text:'Mein Bruder ist schon unterwegs. Ein gutes Team wächst mit seinen Aufgaben – wechsle deine Partner rechtzeitig.'},
 'Trainerschule':{name:'Lehrerin',style:'study',text:'Nur aktive, einsatzfähige Pokémon sammeln Kampf-Erfahrung. Ihre Entwicklung hängt von ihrem eigenen Level ab.'},
 'Nidoran-Haus':{name:'Nidoran-Freundin',text:'Nidoran gibt es in zwei Arten. Ein Mondstein hilft ihren späteren Entwicklungsstufen weiter.'},
 'Fahrradladen':{name:'Fahrradhändler',style:'shop',text:'Hier pflege ich meine Räder. Auf den gefährlichen Routen ist vor allem Platz zum Ausweichen wichtig.'},
 'Überfallenes Haus':{name:'Hausbewohnerin',style:'study',text:'Team Rocket hat hier alles durchsucht. Pass auf deine Partner auf und hilf den Leuten auf deiner Reise.'},
 'Mr. Fujis Haus':{name:'Pokémon-Betreuerin',style:'club',text:'Mr. Fuji kümmert sich um verlassene Pokémon. Er ist zum Pokémon-Turm gegangen.'},
 'Namensbewerter':{name:'Namensbewerter',sprite:'fuji',style:'study',text:'Der schönste Name ist der, den du mit guten Erinnerungen verbindest. Dein Team hat sicher noch viele Abenteuer vor sich.'},
 'Pokémon-Fanclub':{name:'Fanclub-Vorsitzender',sprite:'guide',style:'club',text:'Ein einzelner Angriff kann eine ganze Gruppe schützen. Lerne die Eigenheiten deiner Partner kennen.'},
 'Haus des Anglers':{name:'Angler',sprite:'guide',text:'An den Küsten leben ganz andere Pokémon. Mit Surf erschließt du dir später neue Wege.'},
 'Prismania-Hotel':{name:'Hotelangestellte',style:'hotel',text:'Willkommen im Hotel! Nimm dir Zeit, dein Team für die nächste Route zusammenzustellen.'},
 'Haus des Safari-Wärters':{name:'Safari-Wärter',sprite:'fuji',style:'study',text:'In der Safari-Zone lohnt sich ein genauer Blick. Vergiss deine Pokébälle nicht!'},
 'Haus der Nachahmerin':{name:'Nachahmerin',text:'Dein Team läuft dir nach? Dann versuche ich es auch! Jeder Partner hat seinen eigenen Kampfstil.'},
 'Bills Küstenhaus':{name:'Bill',sprite:'bill',style:'lab',text:'Mein Experiment braucht deine Hilfe. Bist du bereit?'},
};
export const interiorBuilding=(s:RunState)=>s.interior?KANTO_BUILDINGS.find(b=>b.id===s.interior!.buildingId):undefined;
export function stageBuilding(q:KantoStoryMilestone){
 const list=KANTO_BUILDINGS.filter(b=>b.locationId===q.locationId);
 if(q.kind==='gym')return list.find(b=>b.kind==='gym'&&b.name.startsWith('Arena'));
 if(q.kind==='league')return list.find(b=>b.kind==='league');
 if(q.id==='oak-parcel')return list.find(b=>b.service==='shop');
 if(q.id==='oak-return')return list.find(b=>b.kind==='lab');
 if(q.id==='bill')return list[0];
 return list.find(b=>!b.service&&['cave','tower','silph','mansion','department','lab'].includes(b.kind));
}
export function storyAnchor(q:KantoStoryMilestone){return stageBuilding(q)?buildingDoor(stageBuilding(q)!):KANTO_LOCATIONS.find(l=>l.id===q.locationId)!;}
export function buildingAccess(s:Pick<RunState,'story'|'rooms'>,b:KantoBuilding){
 if(b.service)return {open:true,reason:b.service==='heal'?'Schwester Joy erwartet dich.':'Der Markt ist geöffnet.'};
 if(b.kind!=='league'&&!(b.kind==='gym'&&b.name.startsWith('Arena')))return {open:true,reason:'Willkommen! Sprich mit den Bewohnern.'};
 const quests=KANTO_STORY.filter(q=>stageBuilding(q)?.id===b.id);
 if(quests.some(q=>s.story.done.includes(q.id)||q.requires.every(id=>s.story.done.includes(id))))return {open:true,reason:'Die Arena ist geöffnet.'};
 // Earned loot must remain collectible after completing an indoor challenge.
 const stash=s.rooms[b.id];
 if(stash&&(stash.pickups.length||stash.encounters.some(e=>!e.claimed)))return {open:true,reason:'Drinnen warten noch deine Funde.'};
 const next=quests.find(q=>!s.story.done.includes(q.id));
 return {open:false,reason:next?'Zuerst abschließen: '+next.requires.filter(id=>!s.story.done.includes(id)).map(id=>KANTO_STORY.find(q=>q.id===id)?.title??id).join(' · '):
  quests.length?'Diese Prüfung ist abgeschlossen. Hier wartet derzeit kein neuer Auftrag.':'Zurzeit geschlossen. Hier gibt es aktuell keinen Auftrag.'};
}
const plans=new Map<string,ReturnType<typeof buildRoomPlan>>();
export function roomPlan(building:KantoBuilding){let room=plans.get(building.id);if(!room){room=buildRoomPlan(building);plans.set(building.id,room);}return room;}
function buildRoomPlan(building:KantoBuilding){
 const location=KANTO_LOCATIONS.find(l=>l.id===building.locationId)!;
 const quests=KANTO_STORY.filter(q=>stageBuilding(q)?.id===building.id);
 const gym=KANTO_GYMS.find(g=>g.locationId===building.locationId&&building.kind==='gym'&&building.name.startsWith('Arena'));
 const combat=quests.length>0;
 const width=combat?880:640,height=combat?720:520,origin={x:location.x,y:location.y};
 const at=(x:number,y:number)=>({x:origin.x+x,y:origin.y+y});
 const entrance=at(0,height/2-58),exit=at(0,height/2-20),props:RoomProp[]=[],npcs:RoomNpc[]=[];
 // One source pixel always occupies two world pixels; transparent sheet padding
 // must never change a prop's visible size, ground anchor or collision position.
 const prop=(key:string,x:number,y:number,solid=true)=>{
  const art=ROOM_PROP_BOUNDS[key];if(!art)throw Error('Unknown room prop: '+key);
  props.push({...at(x,y),key,w:art.width*2,h:art.height*2,solid});
 };
 const npc=(id:string,name:string,sprite:string,role:RoomNpc['role'],x:number,y:number,text:string,approachY=y+40)=>{
  npcs.push({...at(x,y),id,name,sprite,role,text,approach:at(x,approachY)});
 };
 const north=-height/2+85;
 let theme:string=gym?.type??building.kind;
 if(building.kind==='center'){
  const back=-height/2;
  prop('healing-machine',0,back+96);
  prop('bench',-195,35);prop('bookshelf',225,back+70);prop('plant',-245,back+68);
  npc('nurse','Schwester Joy','nurse','heal',0,back+76,'Ich fülle die Ausdauer aller deiner Pokémon auf. Deine eigenen KP bleiben unverändert.',back+140);
  npc('visitor','Reisende','civilian','talk',175,85,'Schwester Joy macht erschöpfte Pokémon wieder einsatzbereit. Tränke für uns Trainer bleiben selten.');
 }else if(building.service==='shop'){
  prop('counter',0,north+65);
  for(const x of [-width/2+80,width/2-80])for(const y of [north+40,north+160])prop('shelf',x,y);
  npc('clerk','Marktmitarbeiter','clerk','shop',0,north+41,'Bälle und Entwicklungsmittel helfen dir auf der Reise. Notversorgung ist begrenzt.',north+106);
  if(quests.length)npc('delivery','Lieferant','civilian','story',-205,-60,'Professor Eich wartet auf sein Paket. Hilf zuerst bei der Lieferung.');
  else npc('customer','Kundin','civilian','talk',150,110,'Eine gute Ausrüstung spart mehr KP als ein Trank.');
 }else if(building.kind==='gym'||building.kind==='league'){
  prop('statue',-140,height/2-90);prop('statue',140,height/2-90);
  for(const x of [-width/2+65,width/2-65]){prop('plant',x,north+60);prop('plant',x,100);}
  npc('leader',gym?.leader??(building.kind==='league'?'Liga-Prüfer':'Dojo-Meister'),gym?.id??'professor',quests.length?'story':'talk',0,north+25,
   quests.length?'Bist du bereit? Zeig mir, wie gut dein Team zusammenarbeitet.':'Hier trainieren wir. Die offizielle Arena von Saffronia liegt im Osten.');
  npc('guide','Arena-Guide','guide','talk',-230,height/2-120,'Sprich den Leiter an. Verlasse bei Gefahr die Markierungen und nutze deinen Dash.');
 }else if(building.kind==='lab'||building.kind==='silph'){
  const museum=building.locationId==='pewter';
  for(const x of [-width/2+100,width/2-100]){prop(museum?'statue':'bookshelf',x,north+15);prop(museum?'statue':'console',x,20);}
  prop('lab-table',-165,north+100);
  npc('professor',building.locationId==='pallet'?'Professor Eich':building.locationId==='pewter'?'Museumsführer':'Wissenschaftler',building.locationId==='pallet'?'professor':building.locationId==='pewter'?'guide':'scientist',quests.length?'story':'talk',0,north+45,
   quests.length?'Zeige mir dein Team. Wir beginnen, sobald du bereit bist.':museum?'Unsere Exponate erinnern an die lange Geschichte der Pokémon. Im Mondberg findest du Spuren der Vergangenheit.':'Wir erforschen Pokémon und ihre Entwicklung. Jeder Partner sammelt seine eigene Erfahrung, während er aktiv kämpft.');
 }else if(building.kind==='house-red'||building.kind==='house-blue'){
  const resident=RESIDENTS[building.name]??{name:'Bewohnerin',text:'Die Karte zeigt dir dein nächstes Ziel und die offenen Wege.'};
  const style=resident.style??'home';
  if(style==='shop'){
   prop('counter',80,north+70);
   for(const x of [-230,-110])for(const y of [north+40,75])prop('bicycle',x,y);
  }else if(style==='lab'){
   theme='lab';for(const x of [-width/2+90,width/2-90])prop('console',x,north+75);
   prop('bookshelf',width/2-230,north+15);prop('lab-table',-170,30);
  }else{
   prop('bookshelf',width/2-85,north+15);
   if(style==='study'){prop('bookshelf',-width/2+85,north+15);prop('table',-145,40);}
   else if(style==='hotel'){prop('bed',-220,north+65);prop('bed',-120,north+65);prop('counter',100,north+100);}
   else if(style==='club'){prop('table',-170,25);prop('table',165,95);}
   else{prop('bed',-width/2+85,north+55);prop('table',-130,40);}
  }
  prop('plant',width/2-65,155);
  const behindCounter=style==='shop'||style==='hotel',residentX=style==='shop'?80:100,residentY=behindCounter?north+(style==='hotel'?76:46):north+70;
  npc('resident',resident.name,resident.sprite??'civilian',quests.length?'story':'talk',residentX,residentY,resident.text,behindCounter?residentY+65:residentY+45);
 }else{
  theme=building.kind;
  for(const x of [-width/2+75,width/2-75])for(const y of [north+55,60])prop(building.kind==='cave'?'rock':building.kind==='tower'?'statue':'bookshelf',x,y);
  if(building.kind==='mansion'){prop('bed',-width/2+150,130);prop('console',width/2-150,130);}
  if(building.locationId==='rocket-hideout'){prop('console',-width/2+150,130);prop('lab-table',width/2-150,130);}
  npc('guide',building.kind==='tower'?'Mr. Fuji':building.locationId==='rocket-hideout'?'Rocket-Rüpel':'Forscher',building.kind==='tower'?'fuji':building.locationId==='rocket-hideout'?'rocket':'scientist',quests.length?'story':'talk',0,north+45,
   quests.length?'Im Inneren wartet eine Prüfung. Bereite dein Team vor.':'Bleib auf den freien Wegen und achte auf dein Team.');
 }
 return {building,origin,width,height,entrance,exit,props,npcs,theme,combat,quests,gym};
}
export function roomPropFootprint(p:RoomProp){
 const meta=ROOM_PROP_BOUNDS[p.key],f=meta.footprint,scale=p.w/meta.width;
 return {shape:'rect' as const,x:p.x+(f.x+f.width/2)*scale,y:p.y+(f.y+f.height/2)*scale,w:f.width*scale,h:f.height*scale,r:0};
}
export function roomRug(room:ReturnType<typeof roomPlan>){
 if(['gym','league','cave'].includes(room.building.kind))return null;
 let top=-room.height/2+(room.building.kind==='center'?108:120);
 // A runner starts in front of furniture, never halfway under a desk's side.
 for(const p of room.props)if(Math.abs(p.x-room.origin.x)<p.w/2+45&&p.y-room.origin.y<0)
  top=Math.max(top,p.y-room.origin.y+12);
 const bottom=room.height/2-38;
 return {x:room.origin.x-45,y:room.origin.y+top,w:90,h:bottom-top,
  color:room.building.kind==='center'?'#d8a3a0':room.building.service==='shop'?'#a3b6a3':'#c19579'};
}
/** Room function determines its surfaces; having a quest does not make it a gym. */
export function roomSurface(room:ReturnType<typeof roomPlan>){
 const kind=room.building.kind;
 if(kind==='center')return 'center';
 if(room.building.service==='shop')return 'mart';
 if(kind==='cave')return 'cave';
 if(kind==='tower')return 'tower';
 if(kind==='gym'||kind==='league')return 'gym';
 if(['lab','silph','department'].includes(kind)||room.theme==='lab')return 'lab';
 return 'home';
}
export const activeRoom=(s:RunState)=>{const b=interiorBuilding(s);return b?roomPlan(b):null;};
export function roomContains(s:RunState,p:Point,r=0){const room=activeRoom(s);return !!room&&Math.abs(p.x-room.origin.x)<room.width/2-r-12&&Math.abs(p.y-room.origin.y)<room.height/2-r-12;}
export function roomObstacles(s:RunState){
 const room=activeRoom(s);if(!room)return [];
 return [...room.props.filter(p=>p.solid).map(roomPropFootprint),
 ...room.npcs.map(p=>({x:p.x,y:p.y,r:13}))];
}
export function roomNpcNear(s:RunState){return activeRoom(s)?.npcs.find(n=>Math.hypot(n.approach.x-s.trainer.x,n.approach.y-s.trainer.y)<65);}
export const doorNear=(s:RunState)=>KANTO_BUILDINGS.find(b=>{const p=buildingDoor(b);return Math.abs(p.x-s.trainer.x)<43&&Math.abs(p.y-s.trainer.y)<42;});
