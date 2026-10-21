import test from 'node:test';
import assert from 'node:assert/strict';
import {TrainerMotion,TRAINER_STRIDE,TRAINER_MIN_CYCLE} from '../src/trainer-motion.ts';
import {TRAINERS,TRAINER_DIRECTIONS} from '../src/trainer-art.ts';
const sample=(time=0,x=0,y=0,playing=true)=>({time,x,y,playing});

test('trainer has a distinct idle and eight walk phases for all eight directions',()=>{
 for(const trainer of TRAINERS){
  const frames=TRAINER_DIRECTIONS.flatMap(dir=>[trainer.idleFrames[dir],...trainer.animations[dir]]);
  assert.equal(new Set(frames).size,72);assert.ok(frames.every(f=>f>=0&&f<72));
 }
 const vectors=[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
 vectors.forEach(([x,y],index)=>{
  const m=new TrainerMotion(sample());m.update(sample(1/60,x,y));
  assert.equal(m.direction,TRAINER_DIRECTIONS[index]);assert.ok(m.walking);
 });
});

test('120/144 Hz presentation keeps the walking pose on frames without a simulation tick',()=>{
 for(const hz of [60,120,144]){
  const m=new TrainerMotion(sample());let simulation=0,x=0,footfalls=0;
  for(let frame=1;frame<=hz*3;frame++){
   const target=Math.floor(frame/hz*60+1e-8);
   while(simulation<target){simulation++;x+=140/60;}
   const before=m.column;m.update(sample(simulation/60,x,0));
   if(simulation>0){assert.ok(m.walking);assert.equal(m.direction,'right');}
   if(Math.floor((frame-1)/hz*60+1e-8)===target){assert.equal(m.column,before);assert.equal(m.footfall,false);}
   if(m.footfall)footfalls++;
  }
  assert.ok(Math.abs(m.phase-420/TRAINER_STRIDE)<1e-8);assert.equal(footfalls,7);
 }
});

test('normal cadence follows distance, diagonal pace matches straight pace, sprint cadence is capped',()=>{
 const travel=(speed:number,diagonal=false)=>{
  const m=new TrainerMotion(sample());let steps=0;
  for(let tick=1;tick<=60;tick++){
   const d=speed*tick/60;m.update(sample(tick/60,diagonal?d/Math.SQRT2:d,diagonal?d/Math.SQRT2:0));
   if(m.footfall)steps++;
  }
  return {phase:m.phase,steps};
 };
 assert.ok(TRAINER_STRIDE/140>=.8);
 const straight=travel(140),diagonal=travel(140,true),dash=travel(462);
 assert.ok(Math.abs(straight.phase-diagonal.phase)<1e-10);
 assert.ok(Math.abs(dash.phase-1/TRAINER_MIN_CYCLE)<1e-10);
 assert.ok(dash.steps<=3);assert.ok(dash.phase<straight.phase*1.2);
});

test('stopping settles promptly, pausing preserves pose, turning preserves phase, walls make no steps',()=>{
 const m=new TrainerMotion(sample());
 for(let tick=1;tick<=20;tick++)m.update(sample(tick/60,tick*140/60,0));
 const column=m.column,phase=m.phase;
 m.update({...m.sample,playing:false});assert.equal(m.column,column);assert.equal(m.phase,phase);assert.equal(m.footfall,false);
 m.update(sample(21/60,m.sample.x,m.sample.y-2));assert.equal(m.direction,'up');assert.ok(m.phase>phase);
 const {x,y}=m.sample;
 for(let tick=22;tick<=35;tick++){m.update(sample(tick/60,x,y));assert.equal(m.footfall,false);}
 assert.equal(m.walking,false);assert.equal(m.direction,'up');assert.equal(m.phase,0);
});

test('large time gaps and loads cannot trigger footstep bursts',()=>{
 const m=new TrainerMotion(sample());m.update(sample(2,400,400));
 assert.equal(m.walking,false);assert.equal(m.footfall,false);
 m.update(sample(2+1/60,402,400));assert.ok(m.walking);assert.ok(m.phase<.03);
 m.update(sample(2+2/60,2000,2000));assert.equal(m.walking,false);assert.equal(m.footfall,false);
});
