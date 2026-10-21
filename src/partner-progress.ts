import type {Partner} from './engine.ts';
export const PARTNER_MAX_LEVEL=100;
/** Personal battle experience; independent of trainer upgrades and their XP bar. */
export const partnerXpNeeded=(level:number)=>Math.ceil(10+4*(level-1)+.8*(level-1)**2);
export function grantPartnerXp(p:Partner,amount:number,cap=PARTNER_MAX_LEVEL){
 const before=p.level;
 if(!Number.isFinite(amount)||amount<=0||p.level>=cap)return false;
 p.xp+=amount;
 while(p.level<cap&&p.xp>=partnerXpNeeded(p.level)){p.xp-=partnerXpNeeded(p.level);p.level++;}
 if(p.level>=cap)p.xp=0;
 return p.level>before;
}
