/** Button edges survive render frames with no fixed simulation update (e.g. 144 Hz). */
export class SimulationClock {
 accumulator=0;dashPending=false;
 reset(){this.accumulator=0;this.dashPending=false;}
 advance(delta:number,input:{x:number;y:number;dash?:boolean},step:(dt:number,input:{x:number;y:number;dash:boolean})=>boolean,maxCatchup=.15){
  this.accumulator=Math.min(this.accumulator+delta,maxCatchup);this.dashPending ||= !!input.dash;
  while(this.accumulator>=1/60){
   const dash=this.dashPending;this.dashPending=false;this.accumulator-=1/60;
   if(!step(1/60,{x:input.x,y:input.y,dash})){this.reset();break;}
  }
 }
}
