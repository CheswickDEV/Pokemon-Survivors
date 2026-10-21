import test from 'node:test';
import assert from 'node:assert/strict';
import {KANTO_CATALOG,KANTO_TYPE_CHART} from '../src/kanto-catalog.ts';

const catalog=new Map(KANTO_CATALOG.map(p=>[p.id,p]));

test('Kanto catalogue covers exactly 001–151 and every species can fight from its first slot',()=>{
 assert.deepEqual(KANTO_CATALOG.map(p=>p.id),Array.from({length:151},(_,i)=>i+1));
 const types=new Set(Object.keys(KANTO_TYPE_CHART));
 assert.equal(types.size,15);
 for(const p of KANTO_CATALOG){
  assert.equal(p.moves.length,4,p.name);
  assert.equal(new Set(p.moves.map(m=>m.name)).size,4,p.name+' distinct attack slots');
  assert.notEqual(p.moves[0].pattern,'heal',p.name+' must be playable at level 1');
  assert.ok(p.types.length>=1&&p.types.length<=2);
  assert.ok(p.types.every(t=>types.has(t)),p.name+' historical typing');
  assert.ok(p.moves.every(m=>types.has(m.type)&&m.power>0&&m.interval>0&&m.range>0),p.name);
 }
 assert.equal(catalog.get(29)?.name,'Nidoran♀');
 assert.equal(catalog.get(32)?.name,'Nidoran♂');
 assert.equal(catalog.get(122)?.name,'Pantimos');
 assert.equal(catalog.get(151)?.name,'Mew');
});

test('all 72 original evolution edges stay within Kanto, including all three Eevee choices',()=>{
 const families=[
  [1,2,3],[4,5,6],[7,8,9],[10,11,12],[13,14,15],[16,17,18],[19,20],[21,22],[23,24],
  [25,26],[27,28],[29,30,31],[32,33,34],[35,36],[37,38],[39,40],[41,42],[43,44,45],
  [46,47],[48,49],[50,51],[52,53],[54,55],[56,57],[58,59],[60,61,62],[63,64,65],
  [66,67,68],[69,70,71],[72,73],[74,75,76],[77,78],[79,80],[81,82],[84,85],[86,87],
  [88,89],[90,91],[92,93,94],[96,97],[98,99],[100,101],[102,103],[104,105],[109,110],
  [111,112],[116,117],[118,119],[120,121],[129,130],[133,134],[133,135],[133,136],
  [138,139],[140,141],[147,148,149]
 ];
 const expected=families.flatMap(f=>f.slice(1).map((to,i)=>f[i]+'>'+to)).sort();
 const actual=KANTO_CATALOG.flatMap(p=>p.evolutions.map(e=>p.id+'>'+e.to)).sort();
 assert.equal(actual.length,72);
 assert.deepEqual(actual,expected);
 assert.deepEqual(catalog.get(133)?.evolutions.map(e=>[e.to,e.stone]),[[134,'water'],[135,'thunder'],[136,'fire']]);
 for(const [from,to] of [[64,65],[67,68],[75,76],[93,94]]){
  assert.deepEqual(catalog.get(from)?.evolutions,[{to,level:14,stone:'link'}]);
 }
 assert.deepEqual(catalog.get(1)?.evolutions,[{to:2,level:8}]);
 assert.deepEqual(catalog.get(2)?.evolutions,[{to:3,level:16}]);
 assert.deepEqual(catalog.get(25)?.evolutions,[{to:26,level:8,stone:'thunder'}]);
 for(const p of KANTO_CATALOG) for(const e of p.evolutions){
  assert.ok(catalog.has(e.to));
  assert.ok(e.level>=4&&e.level<=18);
  assert.ok((catalog.get(e.to)?.stage??0)>p.stage,p.name+' evolution depth');
 }
});

test('historical types and matchups do not inherit later Steel, Dark or Fairy rules',()=>{
 for(const id of [81,82]) assert.deepEqual(catalog.get(id)?.types,['electric']);
 for(const id of [35,36,39,40]) assert.deepEqual(catalog.get(id)?.types,['normal']);
 assert.deepEqual(catalog.get(122)?.types,['psychic']);
 assert.equal(KANTO_TYPE_CHART.poison.bug,2);
 assert.equal(KANTO_TYPE_CHART.bug.poison,2);
 assert.equal(KANTO_TYPE_CHART.ghost.psychic,0);
 assert.equal(KANTO_TYPE_CHART.ice.fire??1,1);
 assert.equal(KANTO_TYPE_CHART.electric.ground,0);
 assert.equal(KANTO_TYPE_CHART.ground.flying,0);
 assert.equal(KANTO_TYPE_CHART.normal.ghost,0);
 for(const p of KANTO_CATALOG) for(const m of p.moves){
  if(['Biss','Windstoß','Sandwirbel','Karateschlag'].includes(m.name)) assert.equal(m.type,'normal');
 }
});
