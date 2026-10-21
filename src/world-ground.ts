import {kantoSurface} from './kanto-surface.ts';
import type Phaser from 'phaser';
import {hash,forestPathDistance,kantoLocationAt} from './world.ts';
import {kantoRoadDistance} from './kanto-layout.ts';
import {kantoContains,kantoWater,kantoDeck,terrainDistance} from './kanto-terrain.ts';
import {contourPolygons} from './map-geometry.ts';
/** Continuous masks over original ground textures; stable at negative/chunk coordinates. */
export function drawWorldGround(scene:Phaser.Scene,c:CanvasRenderingContext2D,ox:number,oy:number,seed:number,story:boolean){
 const bounds={x:ox,y:oy,width:512,height:512};
 const tile=(key:string,frame:number,x:number,y:number)=>{
  const f=scene.textures.get(key).get(frame);
  c.drawImage(f.source.image as CanvasImageSource,f.cutX,f.cutY,f.cutWidth,f.cutHeight,x-ox,y-oy,32,32);
 };
 const sample=new Map<string,{water:boolean;road:number;deck:boolean;edge:number}>();
 const at=(x:number,y:number)=>{
  const key=x+','+y,cached=sample.get(key);if(cached)return cached;
  const value=story?kantoSurface({x,y}):{water:false,road:forestPathDistance(x,y),deck:false,edge:-1};
  sample.set(key,value);return value;
 };
 for(let y=oy;y<oy+512;y+=32)for(let x=ox;x<ox+512;x+=32){
  const r=hash(seed,x+16,y+16);tile('forest-grass',r<.92?0:1+Math.floor(r*4),x,y);
  if(story){
   const p={x:x+16,y:y+16},l=kantoLocationAt(p);
   if(['cave','mountain','ruins'].includes(l.biome)&&kantoContains(p,l)){
    const blend=Math.min(1,Math.max(0,(l.radius-Math.hypot(p.x-l.x,p.y-l.y))/110));
    c.globalAlpha=blend*.92;c.fillStyle=l.biome==='cave'?'#b3b1a0':l.biome==='ruins'?'#b6bfad':'#c3bf99';c.fillRect(x-ox,y-oy,32,32);c.globalAlpha=1;
    if(r>.78){c.fillStyle='#e8dbb37a';c.fillRect(x-ox+9,y-oy+12,4,2);}
   }
  }
 }
 const mask=(field:'water'|'road'|'deck',draw:()=>void)=>{
  const polygons=contourPolygons(bounds,32,p=>field==='road'?at(p.x,p.y).road:at(p.x,p.y)[field]?-1:1);
  if(!polygons.length)return;
  c.save();c.beginPath();for(const poly of polygons){c.moveTo(poly[0].x-ox,poly[0].y-oy);for(const p of poly.slice(1))c.lineTo(p.x-ox,p.y-oy);c.closePath();}
  c.clip();draw();c.restore();
 };
 if(story)mask('water',()=>{for(let y=oy;y<oy+512;y+=32)for(let x=ox;x<ox+512;x+=32)tile('forest-water',Math.floor(hash(seed,x,y)*4),x,y);});
 mask('road',()=>{
  c.fillStyle='#dccc98';c.fillRect(0,0,512,512);
  for(let y=oy;y<oy+512;y+=32)for(let x=ox;x<ox+512;x+=32)tile('forest-path',4,x,y);
 });
 // Irregular, light grass tufts instead of dark square overlays.
 for(let gy=Math.floor(oy/80)-1;gy<=Math.ceil((oy+512)/80);gy++)for(let gx=Math.floor(ox/80)-1;gx<=Math.ceil((ox+512)/80);gx++){
  const r=hash(seed,gx,gy,29);if(r<.42)continue;
  const x=gx*80+hash(seed,gx,gy,81)*48,y=gy*80+hash(seed,gx,gy,82)*48;
  const l=story?kantoLocationAt({x,y}):null;
  if(l&&(l.safe||!['forest','meadow'].includes(l.biome)))continue;
  if(at(x,y).road<3||at(x,y).water||at(x,y).edge>0)continue;
  for(let i=0;i<12;i++){
   const a=i*2.39996,d=Math.sqrt((i+1)/12)*25,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.65;
   if(at(px,py).road<3||at(px,py).water)continue;
   const xx=px-ox,yy=py-oy,h=4+hash(seed,gx,gy,i)*5;
   c.strokeStyle=i%3?'#438e67a0':'#b2d987be';c.lineWidth=1.4;
   c.beginPath();c.moveTo(xx-3,yy+1);c.quadraticCurveTo(xx-4,yy-h*.5,xx-5,yy-h);
   c.moveTo(xx-1,yy+1);c.quadraticCurveTo(xx+1,yy-h*.6,xx+3,yy-h-1);c.stroke();
  }
 }
 if(story)mask('deck',()=>{
  c.fillStyle='#b58b55';c.fillRect(0,0,512,512);
  c.fillStyle='#d5b57b';for(let y=0;y<512;y+=8)c.fillRect(0,y,512,5);
  c.fillStyle='#795f454d';for(let x=0;x<512;x+=64)c.fillRect(x,0,2,512);
 });
}
