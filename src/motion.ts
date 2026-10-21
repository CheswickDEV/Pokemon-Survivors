import type {PokemonDirection,PokemonMotionAction} from './pokemon-motion.ts';
const directions:PokemonDirection[]=['down','downRight','right','upRight','up','upLeft','left','downLeft'];
export function directionFor(dx:number,dy:number):PokemonDirection{
 return directions[(2-Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
}
export function motionFrame(action:PokemonMotionAction,direction:PokemonDirection,elapsedMs:number,loop=true){
 const at=loop?((elapsedMs%action.durationMs)+action.durationMs)%action.durationMs:Math.max(0,Math.min(action.durationMs-.001,elapsedMs));
 let end=0,column=action.columns-1;
 for(let i=0;i<action.durationsMs.length;i++){end+=action.durationsMs[i];if(at<end){column=i;break;}}
 return action.directions[direction]*action.columns+column;
}
export const walkTime=(distance:number,durationMs:number)=>distance/60*durationMs;
