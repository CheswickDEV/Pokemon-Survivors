/** Horde-game rarity; identity hashing does not perturb combat RNG or reroll on save/load. */
export const SHINY_ODDS=65536;
export function isShinyEncounter(seed:number,identity:string){
 let h=(seed^2166136261)>>>0;
 for(const ch of identity){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
 h=Math.imul(h^(h>>>16),0x7feb352d);h=Math.imul(h^(h>>>15),0x846ca68b);
 return ((h^(h>>>16))>>>0)%SHINY_ODDS===0;
}
