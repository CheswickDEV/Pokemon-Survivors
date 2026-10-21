import test from 'node:test';
import assert from 'node:assert/strict';
import {KANTO_CATALOG} from '../src/kanto-catalog.ts';
import {SIGNATURE_WEAPONS} from '../src/signature-weapons.ts';

test('every Gen-I species has exactly one damaging signature weapon with eight ranks',()=>{
 assert.deepEqual(Object.keys(SIGNATURE_WEAPONS).map(Number),Array.from({length:151},(_,i)=>i+1));
 for(const species of KANTO_CATALOG){
  const w=SIGNATURE_WEAPONS[species.id];
  assert.ok(w,`${species.name}: missing weapon`);
  assert.ok(w.name.length>2&&w.description.length>25,`${species.name}: missing identity`);
  for(const key of ['power','interval','range','count','size','speed','duration','arc'] as const){
   assert.ok(Number.isFinite(w[key])&&w[key]>0,`${species.name}: invalid ${key}`);
  }
  assert.ok(Number.isInteger(w.count)&&w.count<=5,`${species.name}: count cannot reach the eight-projectile rank cap`);
  assert.ok(Number.isInteger(w.pierce)&&w.pierce>=0);
  assert.ok(Number.isInteger(w.bounces)&&w.bounces>=0);
  assert.ok(w.healing>=0&&w.healing<=1.2);
  assert.equal(w.rankNotes.length,8);
  assert.equal(w.rankNotes[0],w.description);
  assert.match(w.rankNotes[7],/112 %/);
 }
});

test('all sixteen combat patterns and all fifteen original elements have a role',()=>{
 const weapons=Object.values(SIGNATURE_WEAPONS);
 assert.deepEqual([...new Set(weapons.map(w=>w.pattern))].sort(),['shot','fan','burst','beam','chain','orbit','nova','cone','slash','dash','boomerang','mine','zone','drain','charge','ricochet'].sort());
 assert.deepEqual([...new Set(weapons.map(w=>w.type))].sort(),['normal','fighting','flying','poison','ground','rock','bug','ghost','fire','water','grass','electric','psychic','ice','dragon'].sort());
});

test('normal evolution lines retain the trained weapon mechanic',()=>{
 for(const species of KANTO_CATALOG){
  if(species.id===129||species.id===133)continue; // Deliberate Magikarp and Eevee transformations.
  for(const evolution of species.evolutions){
   assert.equal(SIGNATURE_WEAPONS[evolution.to].pattern,SIGNATURE_WEAPONS[species.id].pattern,`${species.name}: evolution changes the trained weapon family`);
   assert.equal(SIGNATURE_WEAPONS[evolution.to].upgradeFocus,SIGNATURE_WEAPONS[species.id].upgradeFocus);
  }
 }
 assert.equal(SIGNATURE_WEAPONS[129].pattern,'nova');
 assert.equal(SIGNATURE_WEAPONS[130].pattern,'beam');
 assert.equal(new Set([133,134,135,136].map(id=>SIGNATURE_WEAPONS[id].pattern)).size,4);
});

test('milestone upgrades affect properties used by their weapon pattern',()=>{
 const compatible={
  count:['fan','burst','orbit','slash','boomerang','mine'],
  pierce:['shot','beam','charge','boomerang'],
  bounces:['chain','ricochet'],
  area:['shot','beam','nova','cone','slash','zone','mine','charge'],
  duration:['zone','mine','orbit'],
  tempo:['dash','charge','slash','drain','nova']
 };
 for(const w of Object.values(SIGNATURE_WEAPONS)){
  assert.ok(compatible[w.upgradeFocus].includes(w.pattern),`${w.name}: unused ${w.upgradeFocus} upgrade`);
  assert.ok(w.rankNotes[2].length>w.rankNotes[1].length);
  assert.ok(w.rankNotes[4].length>w.rankNotes[3].length);
  assert.ok(w.rankNotes[7].length>w.rankNotes[6].length);
 }
});

test('base weapon silhouettes leave room to see the field and trainer',()=>{
 for(const w of Object.values(SIGNATURE_WEAPONS)){
  if(['shot','burst','ricochet','boomerang'].includes(w.pattern))assert.ok(w.size>=4&&w.size<=12,w.name);
  if(w.pattern==='zone'||w.pattern==='mine')assert.ok(w.size>=45&&w.size<=80,w.name);
  if(w.pattern==='nova')assert.ok(w.size>=65&&w.size<=110,w.name);
  if(w.pattern==='orbit'){
   assert.ok(w.range>=45&&w.range<=80,w.name);
   assert.ok(w.size>=10&&w.size<=17,w.name);
  }
  if(w.pattern==='beam')assert.ok(w.size>=8&&w.size<=20,w.name);
 }
});
