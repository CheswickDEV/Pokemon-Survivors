import {directionFor} from './motion.ts';
import type {TrainerDirection} from './trainer-art.ts';

/** Presentation state only: never changes movement speed, collisions or saved progress. */
export const TRAINER_STRIDE=120;
export const TRAINER_MIN_CYCLE=.72;
export interface TrainerSample {x:number;y:number;time:number;playing:boolean}
export class TrainerMotion {
 direction:TrainerDirection='down';phase=0;moving=false;settle=0;footfall=false;
 sample:TrainerSample;
 constructor(sample:TrainerSample){this.sample={...sample};}
 update(next:TrainerSample){
  this.footfall=false;
  const dt=next.time-this.sample.time;
  // Render frames can outnumber fixed simulation ticks. Keep the last pose between ticks.
  if(dt<=0)return;
  const dx=next.x-this.sample.x,dy=next.y-this.sample.y,distance=Math.hypot(dx,dy);
  this.sample={...next};
  if(!next.playing)return;
  // A load/teleport is not a footstep or a burst of animation.
  if(dt>.2||distance>100){this.moving=false;this.phase=0;this.settle=0;return;}
  this.moving=distance>.01;
  if(this.moving){
   this.direction=directionFor(dx,dy);
   const before=this.phase;
   // Normal cycle: ~0.86 s at 140 px/s. A dash cannot triple the cadence.
   this.phase+=Math.min(distance/TRAINER_STRIDE,dt/TRAINER_MIN_CYCLE);
   this.footfall=Math.floor((before-.25)*2)!==Math.floor((this.phase-.25)*2);
   this.settle=0;
  }else if(this.phase!==0){
   // Finish the nearest passing pose instead of snapping from a lifted foot to idle.
   if(!this.settle)this.settle=Math.ceil((this.phase+1e-6)*2)/2;
   this.phase=Math.min(this.settle,this.phase+dt*3.5);
   if(this.phase>=this.settle){this.phase=0;this.settle=0;}
  }
 }
 get walking(){return this.moving||this.phase!==0;}
 get column(){return Math.floor((this.phase%1)*8)%8;}
}
