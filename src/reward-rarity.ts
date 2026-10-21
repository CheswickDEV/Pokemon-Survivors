import type {Choice} from './engine.ts';
export const RARITIES=[
 {id:'common',name:'Gewöhnlich',ranks:1,weight:65,color:'#85998b'},
 {id:'rare',name:'Selten',ranks:2,weight:25,color:'#568fda'},
 {id:'epic',name:'Episch',ranks:3,weight:9,color:'#aa72cd'},
 {id:'legendary',name:'Legendär',ranks:4,weight:1,color:'#d9a13d'},
] as const;
export type Rarity=typeof RARITIES[number]['id'];
export const rarityOf=(c:Choice)=>RARITIES.find(r=>r.id===c.rarity)??RARITIES[0];
export const upgradeRanks=(c:Choice,current:number,max:number)=>Math.min(max-current,rarityOf(c).ranks);
export function rollRarity(random:()=>number,remaining:number):Rarity{
 // Legendary rank bundles remain readable in old saves; new legendary offers are unique talents.
 const eligible=RARITIES.filter(r=>r.id!=='legendary'&&r.ranks<=remaining);
 let roll=random()*eligible.reduce((n,r)=>n+r.weight,0);
 for(const r of eligible){roll-=r.weight;if(roll<0)return r.id;}
 return 'common';
}
