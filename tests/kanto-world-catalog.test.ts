import test from 'node:test';
import assert from 'node:assert/strict';
import {KANTO_LOCATIONS,KANTO_ROUTES,KANTO_GYMS,KANTO_STORY,KANTO_ELITE_FOUR,KANTO_CHAMPION,KANTO_START} from '../src/kanto-world-catalog.ts';

function reachable(unlocks:ReadonlySet<string>) {
  const visited=new Set([KANTO_START.locationId as string]);
  for(let changed=true;changed;){
    changed=false;
    for(const edge of KANTO_ROUTES){
      if(edge.requirement&&!unlocks.has(edge.requirement))continue;
      if(visited.has(edge.from)&&!visited.has(edge.to)){visited.add(edge.to);changed=true;}
      if(visited.has(edge.to)&&!visited.has(edge.from)){visited.add(edge.from);changed=true;}
    }
  }
  return visited;
}

test('the Kanto graph contains all ten settlements, routes 1–25 and the connected major dungeons',()=>{
  const ids=new Set(KANTO_LOCATIONS.map(p=>p.id));
  assert.equal(ids.size,KANTO_LOCATIONS.length);
  assert.equal(KANTO_LOCATIONS.filter(p=>p.kind==='town').length,10);
  assert.equal(KANTO_LOCATIONS.filter(p=>p.kind==='route').length,25);
  for(let n=1;n<=25;n++)assert.ok(ids.has(`route-${n}`));
  for(const id of ['viridian-forest','mt-moon','digletts-cave','rock-tunnel','pokemon-tower','rocket-hideout','silph-co','safari-zone','seafoam-islands','pokemon-mansion','power-plant','victory-road','cerulean-cave','ss-anne','indigo'])assert.ok(ids.has(id),id);
  for(const edge of KANTO_ROUTES){assert.ok(ids.has(edge.from),edge.from);assert.ok(ids.has(edge.to),edge.to);assert.ok(edge.width>0);}
  const allUnlocks=new Set(KANTO_STORY.flatMap(m=>m.rewardUnlocks));
  assert.equal(reachable(allUnlocks).size,ids.size);
  for(const point of KANTO_LOCATIONS){
    assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y)&&point.radius>0,point.id);
    for(const species of point.encounters)assert.ok(Number.isInteger(species)&&species>=1&&species<=151,`${point.id}: ${species}`);
  }
});

test('the whole story is reachable in order with rewards already earned, including the Champion and postgame',()=>{
  const done=new Set<string>(),unlocks=new Set<string>();
  for(const step of KANTO_STORY){
    assert.ok(!done.has(step.id),`duplicate ${step.id}`);
    assert.ok(step.requires.every(id=>done.has(id)),`unmet story prerequisite: ${step.id}`);
    assert.ok(reachable(unlocks).has(step.locationId),`softlocked destination: ${step.id}`);
    assert.ok(step.team.length>0&&step.waves>0&&step.duration>0,step.id);
    for(const id of step.team)assert.ok(id>=1&&id<=151,step.id);
    done.add(step.id);step.rewardUnlocks.forEach(id=>unlocks.add(id));
  }
  assert.ok(unlocks.has('champion'));assert.ok(unlocks.has('mewtwo-sanctuary'));
});

test('original key-item gates protect late routes while underground tunnels keep early progression open',()=>{
  const early=reachable(new Set(['pokedex','boulder-badge','moon-pass']));
  assert.ok(early.has('vermilion'),'Route 5–6 underground path reaches Orania without the Saffron drink');
  assert.ok(!early.has('saffron'));assert.ok(!early.has('cinnabar'));assert.ok(!early.has('indigo'));assert.ok(!early.has('cerulean-cave'));
  const tower=reachable(new Set(['pokedex','boulder-badge','moon-pass','cut','tunnel-pass']));
  assert.ok(tower.has('celadon'),'Route 8–7 underground path reaches Prismania before the drink');
  assert.ok(!tower.has('fuchsia'),'Relaxo still blocks both southern land routes');
  const late=reachable(new Set(['pokedex','boulder-badge','moon-pass','cut','tunnel-pass','flute','drink','surf','strength','badges8','victory-pass','champion']));
  for(const id of ['saffron','fuchsia','cinnabar','power-plant','indigo','cerulean-cave'])assert.ok(late.has(id),id);
});

test('every gym awards one distinct badge and the league retains complete Gen-I parties',()=>{
  assert.equal(KANTO_GYMS.length,8);assert.equal(new Set(KANTO_GYMS.map(g=>g.badge)).size,8);
  assert.deepEqual(KANTO_GYMS.map(g=>g.order),[1,2,3,4,5,6,7,8]);
  for(const gym of KANTO_GYMS){
    const story=KANTO_STORY.find(s=>s.id===gym.id)!;
    assert.ok(story);assert.equal(story.kind,'gym');assert.equal(story.locationId,gym.locationId);
    assert.deepEqual(story.team,gym.team);assert.equal(gym.team.length,gym.levels.length);
  }
  assert.equal(KANTO_ELITE_FOUR.length,4);assert.ok(KANTO_ELITE_FOUR.every(t=>t.team.length===5));
  assert.equal(KANTO_CHAMPION.team.length,6);
  assert.deepEqual(KANTO_GYMS.find(g=>g.id==='giovanni')!.team,[111,51,31,34,112]);
});
