import {mkdir,writeFile} from 'node:fs/promises';
import {Engine,newRun} from '../src/engine.ts';
import {envelope,validateState} from '../src/save.ts';
// Explicit test fixtures for importing through the real UI, not normal player progress.
await mkdir('qa',{recursive:true});
const e=new Engine(newRun(1,'learn',424242));e.s.level=8;e.s.time=120;e.s.bag.thunder=1;
for(const species of [4,7,10]){
 const en=e.addEncounter(species,'fixture-'+species,{x:1536,y:1710});
 e.hit(e.s.enemies.find(q=>q.encounterId===en.id)!,10000,'normal');
 e.s.pendingId=en.id;e.s.screen='capture';e.capture();
}
const en=e.addEncounter(25,'fixture-capture',{x:1550,y:1710});
e.hit(e.s.enemies.find(q=>q.encounterId===en.id)!,10000,'normal');
e.s.enemies=[];e.s.pickups=[];e.s.balls=3;e.s.screen='play';e.s.pendingId=null;e.s.swapReady=0;
for(const p of e.s.party)p.ranks[0]=3;
await writeFile('qa/team-flow.json',JSON.stringify(envelope(validateState(e.s),1),null,2));
e.s.time=479.5;e.s.events=['encounter-0','encounter-1','encounter-2','encounter-3','encounter-4','encounter-5','merchant-0','merchant-1','elite','boss-warning'];
e.s.party.forEach(p=>{p.ranks=[5,5,5,5];p.species=({1:3,4:6,7:9,10:12} as Record<number,number>)[p.species];});
e.s.caught=[1,3,4,6,7,9,10,12];e.s.level=18;e.s.enemies=[];e.s.encounters=[];e.s.trainer.hp=100;
await writeFile('qa/boss-flow.json',JSON.stringify(envelope(validateState(e.s),1),null,2));
