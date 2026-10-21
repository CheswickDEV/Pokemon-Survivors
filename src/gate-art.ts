import type Phaser from 'phaser';
import type {RouteGate} from './kanto-terrain.ts';
export function preloadGateArt(scene:Phaser.Scene){
 for(const name of ['worker-frlg','fence-frlg-horizontal','fence-frlg-vertical'])scene.load.image(name,'/art/original-overworld/'+name+'.png');
}
/** Untouched FR/LG sprite pixels. Source/hash records live with the assets. */
export function drawWorksite(scene:Phaser.Scene,gate:RouteGate){
 const objects:Phaser.GameObjects.GameObject[]=[],{a,b}=gate;
 const horizontal=Math.abs(b.x-a.x)>=Math.abs(b.y-a.y),spacing=24;
 const panels=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/spacing);
 for(let i=0;i<=panels;i++){
  const t=i/panels,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
  objects.push(scene.add.image(x,y,'fence-frlg-'+(horizontal?'horizontal':'vertical')).setOrigin(horizontal?.5:5/16,1).setScale(1.5).setDepth(y));
 }
 const x=gate.x-gate.nx*50,y=gate.y-gate.ny*50;
 objects.push(scene.add.image(x,y,'worker-frlg').setOrigin(.5,31/32).setScale(2).setDepth(y));
 return objects;
}
