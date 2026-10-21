import {writeFile} from 'node:fs/promises';
import {Engine,newRun} from '../src/engine.ts';
import {envelope,validateState} from '../src/save.ts';
// Prepared states for the UI import flow, on a separate browser origin from the player's save.
const e=new Engine(newRun(1,'learn',424242,'may'));e.s.level=10;e.s.time=180;e.s.balls=20;e.s.bag.thunder=1;
for(const species of [4,7,10,19]){
 const en=e.addEncounter(species,'visual-'+species,{x:1536,y:1710});
 e.hit(e.s.enemies.find(q=>q.encounterId===en.id)!,10000,'normal');e.s.pendingId=en.id;e.s.screen='capture';e.capture();
}
const en=e.addEncounter(25,'visual-capture',{x:1550,y:1710});
e.hit(e.s.enemies.find(q=>q.encounterId===en.id)!,10000,'normal');
e.s.enemies=[];e.s.pickups=[];e.s.balls=3;e.s.screen='play';e.s.pendingId=null;
e.s.active=e.s.party.slice(0,3).map(p=>p.uid);for(const p of e.s.party){p.ranks=[3,2,1,1];p.points=3;}
e.s.events=['encounter-0','encounter-1','encounter-2','encounter-3','encounter-4','encounter-5','merchant-0','merchant-1','elite','boss-warning'];
await writeFile('qa/v2-team-flow.json',JSON.stringify(envelope(validateState(e.s),1),null,2));
e.s.time=480;e.s.bossSpawned=true;e.s.encounters=[];e.s.enemies=[];
for(const p of e.s.party){p.species=({1:3,4:6,7:9,10:12,19:20} as Record<number,number>)[p.species];p.ranks=[4,3,2,1];}
e.s.level=18;e.s.caught=[1,3,4,6,7,9,10,12,19,20];
e.addEnemy(3,'boss',{x:1750,y:1690});
await writeFile('qa/v2-boss-flow.json',JSON.stringify(envelope(validateState(e.s),1),null,2));
