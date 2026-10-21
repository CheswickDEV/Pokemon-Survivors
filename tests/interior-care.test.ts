import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,newRun} from '../src/engine.ts';
import {KANTO_BUILDINGS} from '../src/kanto-layout.ts';
import {roomPlan,roomPropFootprint,roomRug,roomSurface} from '../src/interior-layout.ts';
import {ROOM_PROP_BOUNDS} from '../src/interior-bounds.ts';
import {decodeEnvelope,envelope} from '../src/save.ts';
import {visit} from './story-helpers.ts';
import {leaveBuilding} from '../src/interiors.ts';
import {clearWorldPoint} from '../src/world.ts';

test('every Center restores active, reserve and exhausted Pokemon without healing the trainer',()=>{
 for(const center of KANTO_BUILDINGS.filter(b=>b.service==='heal'))for(const hp of [1,37,99,100]){
  let e=new Engine(newRun(7,'story',15)),s=e.s;
  s.party=[1,4,7,25,39,133].map((id,i)=>({...newRun(id,'story',15).party[0],uid:s.nextId++,stamina:i*13,recoveryUntil:i%2?999:0}));
  s.level=8;s.active=s.party.slice(0,3).map(p=>p.uid);s.caught=s.party.map(p=>p.species);
  s.trainer.hp=hp;s.passives.heal=2;
  visit(e,center,'heal');
  const before={coins:s.coins,balls:s.balls,active:[...s.active]};
  assert.ok(e.interact(),center.id);
  assert.equal(s.trainer.hp,hp,center.id+' trainer HP');
  assert.ok(s.party.every(p=>p.stamina===100&&p.recoveryUntil===0));
  assert.deepEqual(s.active,before.active);assert.equal(e.activePartners().length,3);
  assert.equal(s.story.checkpoint,center.locationId);
  assert.equal(s.coins,before.coins+20);assert.equal(s.balls,before.balls+3);
  assert.ok(e.effects.every(f=>f.value===undefined),'no trainer healing number');
  // Cooldown, save/load and repeat visits must not introduce free HP or supplies.
  s.party[0].stamina=8;s.party[0].recoveryUntil=999;e.interact();
  assert.equal(s.party[0].stamina,8);assert.equal(s.trainer.hp,hp);
  e=new Engine(decodeEnvelope(envelope(s,1)));s=e.s;
  leaveBuilding(e,true);visit(e,center,'heal');s.time=s.story.healReady;e.interact();
  assert.equal(s.trainer.hp,hp);assert.ok(s.party.every(p=>p.stamina===100&&p.recoveryUntil===0));
  assert.equal(s.coins,before.coins+20);assert.equal(s.balls,before.balls+3);
  assert.deepEqual(decodeEnvelope(envelope(s,2)),s);
 }
});

test('all room props have consistent pixel scale, grounded hitboxes and no overlapping furniture',()=>{
 for(const building of KANTO_BUILDINGS){
  const room=roomPlan(building);
  for(const p of room.props){
   const a=ROOM_PROP_BOUNDS[p.key],f=roomPropFootprint(p),label=building.name+' '+p.key;
   assert.equal(p.w/a.width,2,label);assert.equal(p.h/a.height,2,label);
   assert.equal(f.y+f.h/2,p.y,label+' ground');
   assert.ok(f.x-f.w/2>=p.x-p.w/2&&f.x+f.w/2<=p.x+p.w/2,label+' horizontal footprint');
   assert.ok(f.y-f.h/2>=p.y-p.h,label+' vertical footprint');
   assert.ok(p.x-p.w/2>=room.origin.x-room.width/2+12&&p.x+p.w/2<=room.origin.x+room.width/2-12,label+' side walls');
   if(p.key==='healing-machine'){
    assert.equal(p.y-p.h,room.origin.y-room.height/2-32,label+' rear wall aligns with the room');
    assert.equal(f.y-f.h/2,room.origin.y-room.height/2,label+' service bay starts at the rear wall');
   }else assert.ok(p.y-p.h>=room.origin.y-room.height/2+12&&p.y<=room.origin.y+room.height/2-12,label+' floor bounds');
  }
  for(let i=0;i<room.props.length;i++)for(const b of room.props.slice(i+1)){
   const a=room.props[i],overlap=Math.abs(a.x-b.x)<(a.w+b.w)/2&&a.y-a.h<b.y&&b.y-b.h<a.y;
   assert.equal(overlap,false,building.name+': '+a.key+' / '+b.key+' visible overlap');
  }
 }
});

test('Center counter blocks access to the machine, keeps Joy behind the lip and restores legacy positions safely',()=>{
 for(const b of KANTO_BUILDINGS.filter(b=>b.kind==='center')){
  const e=new Engine(newRun(1,'story')),s=e.s;visit(e,b,'heal');
  const r=roomPlan(b),prop=r.props.find(p=>p.key==='healing-machine')!,n=r.npcs.find(n=>n.role==='heal')!;
  const art=ROOM_PROP_BOUNDS[prop.key],lip=prop.y-(art.height-art.splitY!)*2;
  assert.ok(n.y>lip&&n.y<prop.y,'nurse feet are behind the opaque counter lip');
  assert.ok(clearWorldPoint(s,n.approach,13),'front service position reachable');
  e.move(s.trainer,0,-160);assert.ok(s.trainer.y>=prop.y+11.9,'trainer cannot walk through the counter');
  Object.assign(s.trainer,{x:prop.x+60,y:prop.y-55});assert.ok(!clearWorldPoint(s,s.trainer,12));
  s.trainer.hp=37;s.party[0].stamina=42;Object.assign(s.party[0],s.trainer);
  const restored=new Engine(decodeEnvelope(envelope(s,1)));
  assert.ok(clearWorldPoint(restored.s,restored.s.trainer,12),'old position moved to the front service point');
  assert.equal(restored.s.trainer.hp,37);assert.equal(restored.s.party[0].stamina,42);
  assert.ok(clearWorldPoint(restored.s,restored.s.party[0],10));assert.deepEqual(restored.s.story,s.story);
 }
});

test('named houses have appropriate residents and furnishing instead of a shared bedroom',()=>{
 const named=(name:string)=>roomPlan(KANTO_BUILDINGS.find(b=>b.name===name)!);
 const bike=named('Fahrradladen');
 assert.equal(bike.props.filter(p=>p.key==='bicycle').length,4);assert.equal(bike.npcs[0].name,'Fahrradhändler');
 assert.ok(!bike.props.some(p=>p.key==='bed'));
 const bill=named('Bills Küstenhaus');
 assert.equal(bill.theme,'lab');assert.equal(bill.npcs[0].sprite,'bill');assert.equal(bill.npcs[0].role,'story');
 assert.ok(bill.props.some(p=>p.key==='console'));assert.ok(!bill.props.some(p=>p.key==='bed'));
 const school=named('Trainerschule');
 assert.equal(school.npcs[0].name,'Lehrerin');assert.equal(school.props.filter(p=>p.key==='bookshelf').length,2);
 assert.ok(!school.props.some(p=>p.key==='bed'));
 assert.equal(named('Prismania-Hotel').props.filter(p=>p.key==='bed').length,2);
 assert.equal(named('Dein Zuhause').npcs[0].sprite,'mom');
 for(const b of KANTO_BUILDINGS.filter(b=>b.kind.startsWith('house-'))){
  assert.notEqual(roomPlan(b).npcs[0].name,'Bewohnerin',b.name+' has an authored resident');
  assert.ok(roomPlan(b).npcs[0].text.length>40,b.name+' dialogue');
 }
});

test('indoor runners do not cut through furniture and shopkeepers stand behind the countertop',()=>{
 for(const b of KANTO_BUILDINGS){
  const r=roomPlan(b),rug=roomRug(r);
  for(const p of r.props){
   if(rug)assert.equal(rug.x<p.x+p.w/2&&rug.x+rug.w>p.x-p.w/2&&rug.y<p.y&&rug.y+rug.h>p.y-p.h,false,b.name+' rug crosses '+p.key);
   if(p.key==='counter'){
    const staff=r.npcs.find(n=>Math.abs(n.x-p.x)<p.w/2&&n.y<p.y)!;
    assert.ok(staff,b.name+' staffed counter');
    assert.ok(staff.y>p.y-p.h+8&&staff.y<p.y-8,b.name+' lower body hidden by counter');
    const e=new Engine(newRun(1,'story'));visit(e,b,staff.role);
    assert.ok(clearWorldPoint(e.s,staff.approach,13),b.name+' reachable desk front');
   }
  }
 }
});

test('quests do not substitute arena surfaces for houses, caves or offices',()=>{
 const byName=(name:string)=>roomPlan(KANTO_BUILDINGS.find(b=>b.name===name)!);
 assert.equal(roomSurface(byName('Kampf-Dojo')),'gym');assert.equal(roomRug(byName('Kampf-Dojo')),null);
 for(const name of ['Dein Zuhause','Prismania-Hotel','Pokémon-Villa'])assert.equal(roomSurface(byName(name)),'home',name);
 for(const name of ['Bills Küstenhaus','Spielhalle · Rocket-Versteck','Silph Co.'])assert.equal(roomSurface(byName(name)),'lab',name);
 for(const b of KANTO_BUILDINGS.filter(b=>b.kind==='cave'))assert.equal(roomSurface(roomPlan(b)),'cave',b.name);
});
