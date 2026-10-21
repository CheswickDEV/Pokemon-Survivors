import type {Enemy,Point,RunState} from './engine.ts';
export const enemyScale=(e:Pick<Enemy,'kind'|'storyLeader'>)=>e.kind==='boss'?2.15:e.storyLeader?1.7:e.kind==='elite'?1.25:1;
export function focusAt(s:RunState,p:Point){
 return s.enemies.filter(e=>{
  const scale=enemyScale(e);
  return e.hp>0&&Math.abs(p.x-e.x)<20*scale+8&&p.y>e.y-40*scale-8&&p.y<e.y+12;
 }).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y+18*enemyScale(a))-Math.hypot(p.x-b.x,p.y-b.y+18*enemyScale(b)))[0]?.uid??null;
}
