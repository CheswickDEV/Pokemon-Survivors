import type {Engine} from '../src/engine.ts';
import {KANTO_LOCATIONS,type KantoStoryMilestone} from '../src/kanto-world-catalog.ts';
import {stageBuilding,roomPlan,activeRoom} from '../src/interior-layout.ts';
import {buildingDoor,type KantoBuilding} from '../src/kanto-layout.ts';
import {leaveBuilding} from '../src/interiors.ts';
import assert from 'node:assert/strict';
export function visit(e:Engine,building:KantoBuilding,role:'heal'|'shop'|'story'|'talk'){
 e.s.screen='play';if(e.s.interior)assert.ok(leaveBuilding(e,true));
 Object.assign(e.s.trainer,buildingDoor(building));assert.ok(e.enterBuilding(building.id));
 Object.assign(e.s.trainer,roomPlan(building).npcs.find(n=>n.role===role)!.approach);
 e.s.party.forEach(p=>Object.assign(p,{x:e.s.trainer.x,y:e.s.trainer.y}));
}
export function approachStage(e:Engine,q:KantoStoryMilestone){
 const b=stageBuilding(q);if(b)visit(e,b,'story');else{e.s.screen='play';if(e.s.interior)leaveBuilding(e,true);Object.assign(e.s.trainer,KANTO_LOCATIONS.find(l=>l.id===q.locationId)!);}
}
