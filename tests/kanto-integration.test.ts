import {dexMarkup} from '../src/dex-ui.ts';
import {attackStats} from '../src/combat.ts';
import {fireWeapon,updateWeaponFields,orbitPoints} from '../src/weapon-system.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Engine,newRun} from '../src/engine.ts';
import {SPECIES,ELEMENTS,encounterRoster,LEGACY_RECRUITS} from '../src/data.ts';
import {decodeEnvelope,envelope,validateState,defaultProfile,SaveStore} from '../src/save.ts';
import {POKEMON_MOTION} from '../src/pokemon-motion.ts';
import {CRY_AUDIO} from '../src/cry-audio.ts';
import {directionFor,motionFrame,walkTime} from '../src/motion.ts';
import {normalizeSettings} from '../src/settings.ts';
import {cue} from '../src/audio.ts';
import {homeMarkup,teamBody} from '../src/ui-v2.ts';

test('all 151 research targets appear first, can be caught, saved and started as a partner',()=>{
 for(const species of Object.values(SPECIES)){
  const e=new Engine(newRun(species.id===1?4:1,'learn',147,'red',species.id));
  assert.deepEqual(e.s.encounterRoster,encounterRoster(147,species.id));
  assert.equal(new Set(e.s.encounterRoster).size,6);e.s.time=24;e.events();
  const encounter=e.s.encounters[0];assert.equal(encounter.species,species.id);
  e.hit(e.s.enemies.find(q=>q.encounterId===encounter.id)!,10000,'normal');
  e.s.enemies=e.s.enemies.filter(q=>q.hp>0);e.s.screen='capture';e.s.pendingId=encounter.id;
  assert.equal(e.capture(),true,species.name);assert.equal(e.s.balls,2);
  const loaded=decodeEnvelope(envelope(e.s,1));assert.ok(loaded.party.some(p=>p.species===species.id));
  const start=newRun(species.id,'normal',99);assert.equal(validateState(start).party[0].species,species.id);
 }
});
test('all 151 signature weapons deal damage at ranks one and eight and serialize during combat',()=>{
 for(const species of Object.values(SPECIES))for(const rank of [1,8]){
  const e=new Engine(newRun(species.id,'normal',44)),p=e.s.party[0];p.ranks=[rank];e.random=()=>.99;
  const a=attackStats(e.s,p),enemy=e.addEnemy(19,'wild',{x:p.x+Math.min(45,a.range*.6),y:p.y});enemy.hp=enemy.maxHp=100000;enemy.speed=0;
  fireWeapon(e,p,a,enemy);validateState(e.s);
  if(species.weapon.pattern==='orbit'){const f=e.s.fields[0];Object.assign(enemy,{x:p.x+Math.cos(1)*f.radius,y:p.y+Math.sin(1)*f.radius});}
  if(species.weapon.pattern==='mine')Object.assign(enemy,{x:e.s.fields[0].targetX,y:e.s.fields[0].targetY});
  for(let i=0;i<200;i++){e.s.time+=1/60;updateWeaponFields(e,1/60);e.projectiles(1/60);}
  assert.ok(enemy.hp<100000,species.name+' R'+rank+' '+species.weapon.pattern);validateState(e.s);
 }
});
test('all 72 evolutions enforce level and items atomically while preserving training',()=>{
 let count=0;
 for(const species of Object.values(SPECIES))for(const edge of species.evolutions){
  const e=new Engine(newRun(species.id,'normal',100));const p=e.s.party[0];p.ranks=[4];p.points=3;p.nextFire=[70];
  p.level=edge.level-1;if(edge.stone)e.s.bag[edge.stone]=1;
  assert.equal(e.evolve(p.uid,edge.to),false);assert.equal(p.species,species.id);
  p.level=edge.level;
  if(edge.stone){e.s.bag[edge.stone]=0;assert.equal(e.evolve(p.uid,edge.to),false);e.s.bag[edge.stone]=1;}
  assert.equal(e.evolve(p.uid,edge.to),true,`${species.id} → ${edge.to}`);
  assert.equal(p.species,edge.to);assert.deepEqual(p.ranks,[4]);assert.deepEqual(p.nextFire,[70]);assert.equal(p.points,3);
  if(edge.stone)assert.equal(e.s.bag[edge.stone],0);
  assert.ok(decodeEnvelope(envelope(e.s,2)).caught.includes(edge.to));count++;
 }
 assert.equal(count,72);
});
test('Eevee UI exposes all three branches and each captured species is a starter option',()=>{
 const e=new Engine(newRun(133,'normal',2));e.s.level=18;e.s.party[0].ranks=[3];e.s.bag={fire:1,water:1,thunder:1};
 const body=teamBody(e,null);for(const id of [134,135,136])assert.match(body,new RegExp(`data-target="${id}"`));
 const profile=defaultProfile();profile.caught=Object.values(SPECIES).map(p=>p.id);
 const html=homeMarkup({starter:151,trainer:'may',mode:'learn',profile,saved:null,ready:true,writable:true,assetsReady:true,error:''});
 const dex=dexMarkup(profile,'starter');for(const id of profile.caught)assert.match(dex,new RegExp('data-action="dex-starter" data-id="'+id+'"'));assert.ok(!html.includes('<select'));assert.equal((dex.match(/<article/g)??[]).length,151);
 assert.ok(!html.includes('undefined'));
});
test('older saves retain their scheduled encounters and new targeting rejects invalid IDs',()=>{
 const old=JSON.parse(JSON.stringify(newRun(7,'learn',8)));delete old.encounterRoster;delete old.targetSpecies;old.time=19;
 const restored=decodeEnvelope(envelope(old,3));assert.deepEqual(restored.encounterRoster,LEGACY_RECRUITS);assert.equal(restored.targetSpecies,null);assert.equal(restored.time,19);
 assert.equal(old.encounterRoster,undefined);assert.throws(()=>encounterRoster(1,152));assert.throws(()=>validateState({...restored,encounterRoster:[1,1,1,1,1,1]}));
});
test('HUD and volume preferences are bounded and persist with the full Pokédex',async()=>{
 assert.deepEqual(normalizeSettings(undefined),{sound:true,effects:true,hudScale:1,volume:.55});
 assert.equal(normalizeSettings({hudScale:Infinity}).hudScale,1);assert.equal(normalizeSettings({hudScale:5}).hudScale,1.5);assert.equal(normalizeSettings({hudScale:0}).hudScale,.7);
 const store=new SaveStore(),profile=defaultProfile();profile.caught=Object.keys(SPECIES).map(Number);profile.targetSpecies=151;profile.settings={sound:false,effects:false,hudScale:1.3,volume:.35};
 store.get=async<T>()=>structuredClone(profile) as T;assert.deepEqual(await store.loadProfile(),profile);
});
test('walk cycles follow distance in all eight directions and attack cycles clamp at their end',()=>{
 for(const [dx,dy,direction] of [[0,1,'down'],[1,1,'downRight'],[1,0,'right'],[1,-1,'upRight'],[0,-1,'up'],[-1,-1,'upLeft'],[-1,0,'left'],[-1,1,'downLeft']] as const){
  assert.equal(directionFor(dx,dy),direction);
  for(const art of Object.values(POKEMON_MOTION)){
   const a=art.walk,row=a.directions[direction];
   assert.equal(motionFrame(a,direction,walkTime(0,a.durationMs)),row*a.columns);
   assert.equal(motionFrame(a,direction,walkTime(60,a.durationMs)),row*a.columns);
   assert.equal(motionFrame(a,direction,a.durationMs+10,false),row*a.columns+a.columns-1);
  }
 }
});
test('151 local cries have Ogg headers and all 15 attack sound cues differ',()=>{
 assert.equal(Object.keys(CRY_AUDIO).length,151);
 for(const url of Object.values(CRY_AUDIO))assert.equal(readFileSync(new URL('../public'+url,import.meta.url)).subarray(0,4).toString(),'OggS');
 assert.equal(new Set(ELEMENTS.map(type=>JSON.stringify(cue('attack:'+type)))).size,15);
 for(const name of ['step','select','dash','hurt','warning','boss','level','catch','evolve','reward','win','lost',...ELEMENTS.map(t=>'attack:'+t)]){
  const notes=cue(name);assert.ok(notes.length>0);assert.ok(notes.every(n=>n.duration>0&&n.gain>0&&n.frequency>0&&n.at>=0));
 }
});
