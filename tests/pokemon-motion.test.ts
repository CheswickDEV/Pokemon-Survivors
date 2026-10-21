import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {POKEMON_MOTION,pokemonMotion} from '../src/pokemon-motion.ts';
import {POKEMON_SHINY} from '../src/pokemon-shiny.ts';

test('motion catalog covers exactly all 151 original species with their own assets',()=>{
 assert.deepEqual(Object.keys(POKEMON_MOTION).map(Number),Array.from({length:151},(_,i)=>i+1));
 for(const id of [0,152,-1,1.5,NaN])assert.equal(pokemonMotion(id),undefined);
 for(let id=1;id<=151;id++){
  const art=pokemonMotion(id)!;assert.equal(art.id,id);
  assert.equal(art.portrait,'/art/pokemon-motion/'+id+'/portrait.png');
  for(const name of ['walk','idle','attack'] as const){
   const action=art[name];
   assert.equal(action.url,'/art/pokemon-motion/'+id+'/'+name+'.png');
   assert.equal(action.rows,8);
   assert.deepEqual(Object.values(action.directions),[0,1,2,3,4,5,6,7]);
   assert.equal(action.durationsMs.length,action.columns);
   assert.equal(action.frameCount,action.columns*8);
   assert.ok(action.durationsMs.every(n=>n>0&&Number.isFinite(n)));
   assert.ok(Math.abs(action.durationsMs.reduce((sum,n)=>sum+n,0)-action.durationMs)<.01);
   assert.ok(action.columns>=(name==='walk'?3:1),'Walking preserves a real multi-frame sequence.');
  }
 }
});

test('all 151 shiny species have their own valid eight-direction atlases and distinct portraits',()=>{
 assert.equal(Object.keys(POKEMON_SHINY).length,151);
 for(let id=1;id<=151;id++){
  const shiny=POKEMON_SHINY[id],normal=POKEMON_MOTION[id];
  for(const name of ['walk','idle','attack'] as const){
   const a=shiny[name],bytes=readFileSync(new URL('../public'+a.url,import.meta.url));
   assert.equal(a.rows,8);assert.equal(a.frameCount,a.columns*8);
   assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[a.frameWidth*a.columns,a.frameHeight*a.rows]);
   assert.deepEqual(a.durationsMs,normal[name].durationsMs);
   assert.equal(a.durationMs,normal[name].durationMs);
   assert.ok(a.url.startsWith('/art/pokemon-shiny/'+id+'/'));
  }
  const portrait=readFileSync(new URL('../public'+shiny.portrait,import.meta.url));
  assert.notDeepEqual(portrait,readFileSync(new URL('../public'+normal.portrait,import.meta.url)),String(id));
 }
});

test('all 453 motion atlases and 151 portraits match their load metadata',()=>{
 const dimensions=(url:string)=>{
  const bytes=readFileSync(new URL('../public'+url,import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  return [bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
 };
 for(const art of Object.values(POKEMON_MOTION)){
  assert.deepEqual(dimensions(art.portrait),[art.portraitWidth,art.portraitHeight]);
  for(const name of ['walk','idle','attack'] as const){
   const action=art[name];
   assert.deepEqual(dimensions(action.url),[action.frameWidth*action.columns,action.frameHeight*action.rows]);
   assert.ok(action.frameWidth*action.columns<=2048&&action.frameHeight*action.rows<=2048);
  }
 }
});
