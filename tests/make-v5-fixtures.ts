// Explicit QA snapshots, isolated from the user's browser storage.
import {newRun,Engine} from '../src/engine.ts';
import {KANTO_STORY,KANTO_LOCATIONS} from '../src/kanto-world-catalog.ts';
import {envelope,validateState} from '../src/save.ts';
import {writeFileSync} from 'node:fs';
const save=(name:string,s:ReturnType<typeof newRun>)=>writeFileSync('qa/v5-'+name+'.json',JSON.stringify(envelope(validateState(s),1),null,2));
const arena=newRun(1,'story',505,'kris');arena.story.done=KANTO_STORY.slice(0,2).map(q=>q.id);arena.story.unlocks=KANTO_STORY.slice(0,2).flatMap(q=>q.rewardUnlocks);arena.level=5;arena.party[0].ranks=[3];arena.time=180;Object.assign(arena.trainer,{x:0,y:-5200});arena.party[0].x=-45;arena.party[0].y=-5200;arena.story.checkpoint='pewter';save('arena',arena);
const far=newRun(7,'endless',505,'ethan');Object.assign(far.trainer,{x:-8300,y:5700});Object.assign(far.party[0],{x:-8345,y:5700});far.time=331;far.level=8;far.party[0].ranks=[5];far.world.treasures.push({id:'chest:qa',x:-8270,y:5690,quality:3,opened:false,evolution:false});far.world.eliteWave=3;far.world.encounterWave=5;save('far-forest',far);
const champ=newRun(3,'story',505,'may');champ.story.done=KANTO_STORY.slice(0,26).map(q=>q.id);champ.story.unlocks=[...new Set(KANTO_STORY.slice(0,26).flatMap(q=>q.rewardUnlocks))];champ.level=35;champ.party[0].ranks=[8];champ.time=3600;Object.assign(champ.trainer,{x:-1600,y:-5850});Object.assign(champ.party[0],{x:-1645,y:-5850});champ.story.checkpoint='viridian';champ.outcome='win';champ.bossDead=true;champ.screen='result';save('champion',champ);
