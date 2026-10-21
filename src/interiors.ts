import type {Engine,RunState,Point} from './engine.ts';
import {KANTO_BUILDINGS,buildingDoor} from './kanto-layout.ts';
import {activeRoom,roomPlan,roomPropFootprint,doorNear,buildingAccess,type RoomContents} from './interior-layout.ts';
const empty=():RoomContents=>({pickups:[],encounters:[]});
/** Older rooms let people walk through the now-solid reception work area. */
export function restoreCenterReception(s:RunState){
 const room=activeRoom(s);if(room?.building.kind!=='center')return;
 const counter=room.props.find(p=>p.key==='healing-machine')!,foot=roomPropFootprint(counter);
 const inside=(p:Point,r:number)=>Math.hypot(Math.max(0,Math.abs(p.x-foot.x)-foot.w/2),Math.max(0,Math.abs(p.y-foot.y)-foot.h/2))<r;
 if(inside(s.trainer,12))Object.assign(s.trainer,room.npcs.find(n=>n.role==='heal')!.approach);
 s.party.forEach((p,i)=>{if(inside(p,10)){p.x=s.trainer.x+(i%2?28:-28);p.y=s.trainer.y+28;delete p.navigation;}});
}
export function enterBuilding(e:Engine,id:string){
 const s=e.s,b=KANTO_BUILDINGS.find(b=>b.id===id);
 if(s.mode!=='story'||s.interior||s.screen!=='play'||s.story.active||!b||doorNear(s)?.id!==id)return false;
 const access=buildingAccess(s,b);
 if(!access.open){e.banner('closed:'+b.id,'blocked',b.name+' · Geschlossen',access.reason);return false;}
 const outside={enemies:s.enemies,pickups:s.pickups,encounters:s.encounters},door=buildingDoor(b);
 s.interior={buildingId:id,returnPoint:{x:door.x,y:door.y+28},outside};
 const saved=s.rooms[id]??empty();s.enemies=[];s.pickups=saved.pickups;s.encounters=saved.encounters;delete s.rooms[id];
 transition(e,roomPlan(b).entrance);e.banner('enter:'+id,'place',b.name,'E · Mit Personen sprechen · Ausgang am unteren Raumrand');return true;
}
export function leaveBuilding(e:Engine,force=false){
 const s=e.s,room=activeRoom(s),inside=s.interior;if(!inside||!room||s.screen!=='play')return false;
 if(!force&&Math.hypot(s.trainer.x-room.exit.x,s.trainer.y-room.exit.y)>75)return false;
 if(s.story.active)e.abortStory();
 s.rooms[inside.buildingId]={pickups:s.pickups,encounters:s.encounters};
 Object.assign(s,inside.outside);s.interior=null;transition(e,inside.returnPoint);
 e.banner('exit:'+inside.buildingId,'place','Wieder draußen',room.building.name+' verlassen.');return true;
}
export function transition(e:Engine,p:{x:number;y:number}){
 const s=e.s;Object.assign(s.trainer,p,{dx:0,dy:1,dashUntil:0,invincibleUntil:s.time+.6});
 s.shots=[];s.fields=[];s.hazards=[];s.focus=null;s.spawnBudget=0;e.effects=[];e.lastArea='';e.dashBufferedUntil=-1;
 s.party.forEach((member,i)=>{member.x=p.x+(i%2?28:-28);member.y=p.y-35;delete member.navigation;});
}
export function roomExitNear(e:Engine){const room=activeRoom(e.s);return !!room&&Math.hypot(e.s.trainer.x-room.exit.x,e.s.trainer.y-room.exit.y)<75;}
