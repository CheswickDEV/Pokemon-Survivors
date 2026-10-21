import {KANTO_GYMS} from './kanto-world-catalog.ts';
import type {RunState,Partner} from './engine.ts';
export const BADGE_LEVEL_CAPS=[16,22,28,34,40,46,52,58,70] as const;
export const earnedBadges=(s:RunState)=>s.mode==='story'?KANTO_GYMS.filter(g=>s.story.done.includes(g.id)).length:0;
export const partnerLevelCap=(s:RunState)=>s.mode!=='story'||s.story.unlocks.includes('champion')?100:BADGE_LEVEL_CAPS[earnedBadges(s)];
// Preserve earned levels in old saves; only their battle contribution is capped.
export const battleLevel=(s:RunState,p:Partner)=>Math.min(p.level,partnerLevelCap(s));
export const badgePower=(s:RunState)=>1+earnedBadges(s)*.03;
export const badgeProtection=(s:RunState)=>earnedBadges(s)*.02;
export const badgeReward=(index:number)=>`Pokémon-Levelgrenze ${BADGE_LEVEL_CAPS[index+1]} · +3 % Team-Attackenschaden · −2 % Trainer-Schaden`;
