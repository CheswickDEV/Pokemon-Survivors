import {Engine,newRun} from '../src/engine.ts';
import {KANTO_STORY} from '../src/kanto-world-catalog.ts';
import type {Difficulty} from '../src/difficulty.ts';
import {approachStage} from './story-helpers.ts';
export function brockFixture(level:Difficulty='master',rank=8,seed=217){
 const e=new Engine(newRun(1,'story',seed,'red',null,level)),s=e.s;
 s.level=16;s.story.done=['oak-parcel','oak-return'];s.story.unlocks=['parcel','pokedex'];
 s.party=[1,4,7].map(id=>({...newRun(id,'story').party[0],uid:s.nextId++,level:16,ranks:[rank],points:rank-1}));
 s.active=s.party.map(p=>p.uid);s.caught=[1,4,7];
 const q=KANTO_STORY.find(q=>q.id==='brock')!;approachStage(e,q);e.interact();e.startStory(q.id);
 return e;
}
