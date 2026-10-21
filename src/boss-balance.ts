import type {RunState} from './engine.ts';
import {difficulty} from './difficulty.ts';
/** Arena endurance is independent of ordinary forest waves. No player-stat scaling. */
export function trialHealth(s:RunState,base:number){
 const factor={relaxed:1,standard:6,veteran:14,master:24}[difficulty(s).id];
 return Math.round(base*difficulty(s).hp*factor);
}
export const trialPressure=(s:RunState)=>({relaxed:1,standard:1,veteran:1.35,master:1.9}[difficulty(s).id]);
