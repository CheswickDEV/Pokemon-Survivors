import {cryAudio} from './cry-audio.ts';
import type {Settings} from './settings.ts';
export interface Note {at:number;duration:number;frequency:number;end?:number;gain:number;wave?:'pulse'|'square'|'triangle'|'noise'}
const n=(frequency:number,at=0,duration=.09,gain=.16,wave:Note['wave']='pulse',end?:number):Note=>({frequency,at,duration,gain,wave,end});
const melody=(notes:number[],length=.095)=>notes.map((freq,i)=>n(freq,i*length,length*.85,.16));
/** Newly arranged pulse/noise cues, inspired by handheld synthesis; no extracted music. */
export function cue(name:string):Note[]{
 if(name.startsWith('attack:')){
  const type=name.split(':')[1];
  const frequencies:Record<string,[number,number]>={fire:[240,75],water:[780,320],grass:[620,1050],electric:[1600,210],ice:[1400,2400],fighting:[140,65],poison:[320,190],ground:[90,45],flying:[600,1200],psychic:[440,1760],bug:[880,660],rock:[120,55],ghost:[220,550],dragon:[165,990],normal:[200,80]};
  const [from,to]=frequencies[type]??[330,160];
  return [n(from,0,.08,.055,['fire','ground','rock','fighting'].includes(type)?'noise':'pulse',to),n(to,.025,.06,.035,'triangle',from*.75)];
 }
 switch(name){
  case 'step':return [n(350,0,.025,.014,'noise',140)];
  case 'select':return [n(341,0,.035,.1,'square'),n(1024,.055,.05,.12,'square')];
  case 'dash':return [n(1100,0,.12,.09,'noise',120),n(300,0,.09,.06,'pulse',800)];
  case 'hurt':return [n(180,0,.12,.18,'noise',55),n(160,.04,.16,.1,'square',70)];
  case 'warning':return [n(440,0,.1,.14),n(660,.14,.1,.14),n(440,.28,.12,.14)];
  case 'boss':return [n(110,0,.3,.2,'square',65),n(220,.15,.3,.1),n(82,.3,.35,.18,'noise')];
  case 'level':return [...melody([523,659,784,1047],.1),n(1047,.4,.3,.15),n(523,.4,.3,.07,'triangle')];
  case 'catch':return [n(390,0,.18,.12,'pulse',850),n(395,0,.18,.04,'pulse',860),...melody([659,784,988,784,1047],.13).map(x=>({...x,at:x.at+.25})),n(523,.9,.35,.1,'triangle')];
  case 'evolve':return [...Array.from({length:8},(_,i)=>n(i%2?880:440,i*.09,.1,.1,'pulse',i%2?1320:660)),...melody([523,659,784,1047],.1).map(x=>({...x,at:x.at+.8})),n(1047,1.2,.3,.16)];
  case 'reward':return melody([512,683,1024,2048],.065);
  case 'win':return [...melody([523,523,523,659,784,1047],.14),n(1047,.84,.55,.16),n(523,.84,.55,.09,'triangle')];
  case 'lost':return [...melody([392,349,294,196],.18),n(130,.6,.5,.1,'triangle')];
  default:return [n(600,0,.06,.1)];
 }
}
export class GameAudio {
 context:AudioContext|null=null;master:GainNode|null=null;pulse:PeriodicWave|null=null;noise:AudioBuffer|null=null;
 buffers=new Map<number,Promise<AudioBuffer>>();lastAttack=-100;lastStep=-100;cryUntil=0;voices=0;
 settings:()=>Settings;
 constructor(settings:()=>Settings){this.settings=settings;}
 async unlock(){
  if(!this.settings().sound)return;
  if(!this.context){
   const a=this.context=new AudioContext(),master=this.master=a.createGain(),compressor=a.createDynamicsCompressor();
   compressor.threshold.value=-12;compressor.ratio.value=6;master.connect(compressor).connect(a.destination);
   const real=new Float32Array(32),imag=new Float32Array(32);
   for(let i=1;i<32;i++){real[i]=2*Math.sin(2*Math.PI*i*.125)/(i*Math.PI);imag[i]=2*(1-Math.cos(2*Math.PI*i*.125))/(i*Math.PI);}
   this.pulse=a.createPeriodicWave(real,imag);
   this.noise=a.createBuffer(1,a.sampleRate,a.sampleRate);const data=this.noise.getChannelData(0);let register=0x7fff;
   for(let i=0;i<data.length;i++){register=(register>>>1)|(((register^(register>>>1))&1)<<14);data[i]=(register&1)?.4:-.4;}
  }
  this.updateVolume();if(this.context.state==='suspended')await this.context.resume();
 }
 updateVolume(){if(this.context&&this.master)this.master.gain.setTargetAtTime(this.settings().sound?this.settings().volume:0,this.context.currentTime,.02);}
 play(name:string){
  if(!this.settings().sound||!this.context||this.context.state!=='running')return;
  if(name.startsWith('cry:')){void this.cry(Number(name.slice(4)));return;}
  const now=this.context.currentTime;
  if(name.startsWith('attack:')){if(now-this.lastAttack<.09)return;this.lastAttack=now;}
  if(name==='step'){if(now-this.lastStep<.1)return;this.lastStep=now;}
  for(const note of cue(name))this.note(note,now);
 }
 private note(note:Note,now:number){
  if(this.voices>=32||!this.context||!this.master)return;
  const a=this.context,start=now+note.at,duration=note.duration,gain=a.createGain();
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(note.gain,start+.003);
  gain.gain.setValueAtTime(note.gain*.7,start+duration*.4);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  gain.connect(this.master);this.voices++;
  const voice=note.wave==='noise'?a.createBufferSource():a.createOscillator();
  if(voice instanceof AudioBufferSourceNode){voice.buffer=this.noise;voice.playbackRate.setValueAtTime(Math.max(.12,note.frequency/500),start);if(note.end)voice.playbackRate.exponentialRampToValueAtTime(Math.max(.08,note.end/500),start+duration);}
  else{if(note.wave==='pulse')voice.setPeriodicWave(this.pulse!);else voice.type=note.wave==='triangle'?'triangle':'square';voice.frequency.setValueAtTime(note.frequency,start);if(note.end)voice.frequency.exponentialRampToValueAtTime(note.end,start+duration);}
  voice.connect(gain);voice.onended=()=>{voice.disconnect();gain.disconnect();this.voices--;};voice.start(start);voice.stop(start+duration+.01);
 }
 async cry(id:number){
  const path=cryAudio(id),a=this.context;if(!path||!a||!this.master||!this.settings().sound)return false;
  if(a.currentTime<this.cryUntil)return false;
  this.cryUntil=a.currentTime+.8;
  try{
   let buffer=this.buffers.get(id);
   if(!buffer){buffer=fetch(path).then(r=>{if(!r.ok)throw new Error('Ruf nicht verfügbar');return r.arrayBuffer();}).then(bytes=>a.decodeAudioData(bytes));this.buffers.set(id,buffer);}
   const decoded=await buffer;if(!this.settings().sound||a.state!=='running')return false;
   const voice=a.createBufferSource(),gain=a.createGain();voice.buffer=decoded;gain.gain.value=.24;voice.connect(gain).connect(this.master);
   voice.onended=()=>{voice.disconnect();gain.disconnect();};voice.start();return true;
  }catch{this.buffers.delete(id);return false;}
 }
}
