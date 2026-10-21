import {BOONS} from './boons.ts';
import {PASSIVES,SPECIES} from './data.ts';
import type {Engine,Choice} from './engine.ts';
import {rollRarity,upgradeRanks} from './reward-rarity.ts';
export const choiceKey=(c:Choice)=>c.kind+':'+(c.uid??c.id??'')+':'+(c.target??'');
/** Weighted draws without replacement. Recent offers lose weight, never eligibility. */
export function levelRewards(e:Engine):Choice[]{
 const s=e.s,pool:{choice:Choice;weight:number}[]=[];
 const recent=new Set(s.recentChoices??[]);
 const add=(choice:Choice,weight:number)=>pool.push({choice,weight:weight*(recent.has(choiceKey(choice))?.18:1)});
 for(const p of s.party){
  if(p.ranks[0]<8)add({kind:'rank',uid:p.uid,slot:0,title:SPECIES[p.species].weapon.name+' '+(p.ranks[0]+1),description:SPECIES[p.species].weapon.rankNotes[p.ranks[0]]},s.active.includes(p.uid)?4:.65);
  for(const ev of SPECIES[p.species].evolutions)if(!e.evolutionReason(p.uid,ev.to))
   add({kind:'evolve',uid:p.uid,target:ev.to,title:SPECIES[p.species].name+' entwickeln',description:'Wird zu '+SPECIES[ev.to].name},2);
 }
 for(const p of PASSIVES)if(e.canPassive(p.id))
  add({kind:'passive',id:p.id,title:p.name,description:p.description((s.passives[p.id]??0)+1)},s.passives[p.id]?1.4:1);
 const chosen:Choice[]=[];
 while(chosen.length<3&&pool.length){
  let roll=e.random()*pool.reduce((n,p)=>n+p.weight,0),index=pool.length-1;
  for(let i=0;i<pool.length;i++){roll-=pool[i].weight;if(roll<0){index=i;break;}}
  const c=pool.splice(index,1)[0].choice;
  if(c.kind==='rank'){
   const p=e.getPartner(c.uid!)!;c.rarity=rollRarity(()=>e.random(),8-p.ranks[0]);
   const next=p.ranks[0]+upgradeRanks(c,p.ranks[0],8);c.title=SPECIES[p.species].weapon.name+' '+next;c.description=SPECIES[p.species].weapon.rankNotes[next-1];
  }else if(c.kind==='passive'){
   const rank=s.passives[c.id!]??0;c.rarity=rollRarity(()=>e.random(),5-rank);
   c.description=PASSIVES.find(p=>p.id===c.id)!.description(rank+upgradeRanks(c,rank,5));
  }else if(c.kind==='evolve')c.rarity='epic';
  chosen.push(c);
 }
 while(chosen.length<3)chosen.push({kind:'heal',title:'Verschnaufpause',description:'+5 Trainer-KP'});
 // At most one distinct talent offer. Its rarity changes behavior, not ranks.
 {
  const roll=e.random(),tier=s.level>=10&&roll<.015?'legendary':s.level>=6&&roll<.105?'epic':s.level>=3&&roll<.355?'rare':null;
  const order={rare:1,epic:2,legendary:3};
  const replace=(s.boons??[]).map(id=>BOONS.find(b=>b.id===id)!).sort((a,b)=>order[a.rarity]-order[b.rarity])[0];
  const room=(s.boons??[]).length<3;
  const talents=BOONS.filter(b=>b.rarity===tier&&!s.boons?.includes(b.id)&&(room||order[b.rarity]>order[replace.rarity]));
  if(talents.length){const b=talents[Math.floor(e.random()*talents.length)];chosen[2]={kind:'boon',id:b.id,rarity:b.rarity,title:b.name,description:b.description,...(!room?{replaceBoon:replace.id}:{})};}
 }

 s.recentChoices=[...(s.recentChoices??[]),...chosen.map(choiceKey)].slice(-6);
 return chosen;
}
