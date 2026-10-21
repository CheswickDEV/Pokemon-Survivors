import type Phaser from 'phaser';
import {roomRug,roomSurface,type roomPlan} from './interior-layout.ts';
import {ROOM_PROP_BOUNDS} from './interior-bounds.ts';
const NPCS=['nurse','clerk','professor','civilian','mom','scientist','brock','misty','surge','erika','koga','sabrina','blaine','giovanni','bill','fuji','rocket','guide'];
export function preloadInteriorArt(scene:Phaser.Scene){
 for(const name of NPCS)scene.load.image('npc-'+name,'/art/interiors-v7/npc-'+name+'.png');
 for(const [key,art] of Object.entries(ROOM_PROP_BOUNDS))if(!['rock','bicycle'].includes(key))scene.load.image('room-'+key,'/art/interiors-v7/prop-'+art.asset+'.png');
 for(const theme of ['center','mart','home','lab','gym']){
  scene.load.image('room-floor-'+theme,'/art/interiors-v7/tile-floor-'+theme+'.png');
  for(const side of ['top','bottom'])scene.load.image('room-wall-'+theme+'-'+side,'/art/interiors-v7/tile-wall-'+theme+'-'+side+'.png');
 }
}
function bicycleArt(scene:Phaser.Scene){
 if(scene.textures.exists('room-bicycle'))return;
 const canvas=document.createElement('canvas');canvas.width=48;canvas.height=32;
 const c=canvas.getContext('2d')!;
 // Integer-pixel outlines keep the small display bike crisp at the room's 2x scale.
 const line=(x:number,y:number,ex:number,ey:number,color:string)=>{
  c.fillStyle=color;const dx=Math.abs(ex-x),dy=Math.abs(ey-y),sx=x<ex?1:-1,sy=y<ey?1:-1;let err=dx-dy;
  for(;;){c.fillRect(x,y,2,2);if(x===ex&&y===ey)break;const e=err*2;if(e>-dy){err-=dy;x+=sx;}if(e<dx){err+=dx;y+=sy;}}
 };
 c.fillStyle='#38554b66';c.fillRect(3,29,42,3);
 for(const x of [11,36]){
  c.strokeStyle='#273a45';c.lineWidth=3;c.beginPath();c.arc(x,22,8,0,Math.PI*2);c.stroke();
  c.strokeStyle='#a8bac3';c.lineWidth=1;c.beginPath();c.arc(x,22,5,0,Math.PI*2);c.stroke();
  line(x-4,22,x+4,22,'#bcd0cf');line(x,18,x,26,'#bcd0cf');
 }
 for(const [x,y,ex,ey] of [[11,22,18,11],[18,11,24,22],[24,22,11,22],[18,11,32,11],[32,11,24,22],[30,6,36,22]])line(x,y,ex,ey,'#a94842');
 line(18,10,17,6,'#d8e3d7');line(13,5,20,5,'#34434e');line(30,6,29,3,'#d8e3d7');line(29,3,35,3,'#34434e');
 line(24,22,26,25,'#d8e3d7');line(25,25,29,25,'#34434e');
 scene.textures.addCanvas('room-bicycle',canvas);
}
export function drawInterior(scene:Phaser.Scene,room:ReturnType<typeof roomPlan>,texture:string){
 const {origin,width:w,height:h}=room,objects:Phaser.GameObjects.GameObject[]=[];
 const canvas=document.createElement('canvas');canvas.width=w+64;canvas.height=h+112;
 const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;
 const type=room.building.kind;
 const surface=roomSurface(room),theme=surface==='tower'?'lab':surface==='cave'?'gym':surface;
 const palette:Record<string,string>={rock:'#c6b48a',water:'#91cbd3',electric:'#d3cb88',grass:'#b6d7a0',poison:'#bdabd1',psychic:'#caacd1',fire:'#dbb09b',ground:'#c6af8a',cave:'#9c9b8a',tower:'#b7b3c7',league:'#a6c2ce'};
 const tile=(key:string,x:number,y:number)=>c.drawImage(scene.textures.get(key).getSourceImage() as HTMLImageElement,x,y,32,32);
 c.fillStyle='#263d40';c.fillRect(0,0,canvas.width,canvas.height);
 c.save();c.beginPath();c.rect(32,80,w,h);c.clip();
 // Clip the final partial row/column: room dimensions are not multiples of 32.
 for(let y=80;y<h+80;y+=32)for(let x=32;x<w+32;x+=32)tile('room-floor-'+(theme==='mart'?'home':theme),x,y);
 if(theme==='mart'){
  c.fillStyle='#e8e5cf';c.fillRect(32,80,w,h);
  for(let y=80;y<h+80;y+=64)for(let x=32;x<w+32;x+=64){
   c.fillStyle=((x-32)/64+(y-80)/64)%2?'#e4e1ca':'#ede9d4';c.fillRect(x+1,y+1,62,62);
   c.fillStyle='#f6f2dd';c.fillRect(x+2,y+2,60,2);c.fillRect(x+2,y+2,2,60);
   c.fillStyle='#cccdb8';c.fillRect(x+2,y+62,61,1);
  }
 }
 if(palette[room.theme]){
  c.globalAlpha=.38;c.fillStyle=palette[room.theme];c.fillRect(32,80,w,h);c.globalAlpha=1;
 }
 if(type==='cave'){
  c.fillStyle='#b5ac8e';c.fillRect(32,80,w,h);
  for(let y=80;y<h+80;y+=32)for(let x=32;x<w+32;x+=32){
   const n=((x/32)*13+(y-80)/32*7)%5;c.fillStyle=n<2?'#c1b99b':'#aaa388';
   c.fillRect(x+6+n*2,y+8+n,8,3);c.fillStyle='#c9c1a5';c.fillRect(x+22,y+24,3,2);
  }
 }
 c.restore();
 // Keep all four wall bases on the same 12 px collision inset.
 const wallTop=theme==='center'?48:16;
 c.save();c.beginPath();c.rect(32,wallTop,w,80-wallTop);c.clip();
 for(let x=32;x<w+32;x+=32){
  tile('room-wall-'+theme+'-top',x,wallTop);
  if(theme!=='center')tile('room-wall-'+theme+'-bottom',x,48);
 }
 c.restore();
 c.fillStyle='#647d71';c.fillRect(32,80,w,12);c.fillRect(32,80,12,h);c.fillRect(w+20,80,12,h);
 c.fillStyle='#d8ddc5';c.fillRect(32,wallTop,8,h+80-wallTop);c.fillRect(w+24,wallTop,8,h+80-wallTop);
 c.fillStyle='#aebba1';c.fillRect(40,80,4,h);c.fillRect(w+20,80,4,h);
 c.fillStyle='#24443922';c.fillRect(44,92,w-24,6);c.fillRect(44,92,5,h-24);
 if(surface==='cave'){
  // Rock faces lie outside the walkable floor instead of using house wallpaper.
  c.save();c.beginPath();c.rect(32,16,w,h+76);c.clip();
  c.fillStyle='#5a594b';c.fillRect(32,16,w,64);
  const rock=scene.textures.get('forest-rock').getSourceImage() as HTMLImageElement;
  for(let row=0;row<3;row++)for(let x=16+(row%2)*8;x<w+32;x+=20)c.drawImage(rock,x,18+row*16,32,32);
  c.fillStyle='#444b3d';c.fillRect(32,80,w,8);c.fillStyle='#85816a';c.fillRect(32,88,w,4);
  for(const x of [32,w+20]){
   c.save();c.beginPath();c.rect(x,80,12,h);c.clip();
   c.fillStyle='#666552';c.fillRect(x,80,12,h);
   for(let y=64;y<h+80;y+=20)c.drawImage(rock,x-10,y,32,32);
   c.restore();
  }
  c.restore();
 }
 if(surface==='gym'){
  c.strokeStyle='#f9f0d0';c.lineWidth=4;c.strokeRect(152,205,w-240,h-290);
  c.beginPath();c.moveTo(152,h/2+80);c.lineTo(w-88,h/2+80);c.stroke();
  c.beginPath();c.arc(w/2+32,h/2+80,64,0,Math.PI*2);c.stroke();
  c.fillStyle='#f9f0d0';c.beginPath();c.arc(w/2+32,h/2+80,13,0,Math.PI*2);c.fill();
  const leader=room.npcs[0],padY=leader.y-origin.y+h/2+80;
  c.fillStyle='#66796c';c.fillRect(w/2-50,padY-30,164,48);
  c.fillStyle=palette[room.theme]??'#bdc4a4';c.fillRect(w/2-46,padY-26,156,40);
  c.strokeStyle='#eee9d0';c.lineWidth=2;c.strokeRect(w/2-43,padY-23,150,34);
 }else{
  const rug=roomRug(room);
  if(rug){
   const x=rug.x-origin.x+w/2+32,y=rug.y-origin.y+h/2+80;
   c.fillStyle=rug.color;c.fillRect(x,y,rug.w,rug.h);
   c.strokeStyle='#f6e6b7';c.lineWidth=2;c.strokeRect(x+5,y+5,rug.w-10,rug.h-10);
  }
 }
 // Foreground wall leaves an actual doorway in the centre, with a continuous skirting.
 for(const [x,width] of [[32,w/2-46],[w/2+78,w/2-46]]){
  c.fillStyle=surface==='cave'?'#494e40':'#61796c';c.fillRect(x,h+68,width,24);
  c.fillStyle=surface==='cave'?'#999277':'#e2e4cc';c.fillRect(x,h+68,width,7);
  c.fillStyle=surface==='cave'?'#666552':'#99ad93';c.fillRect(x,h+75,width,10);
 }
 // Exit mat, clear and centred. E opens the exterior without triggering another door immediately.
 c.fillStyle='#a85d58';c.fillRect(w/2-11,h+34,86,46);c.fillStyle='#eacb8f';c.fillRect(w/2-5,h+39,74,4);
 c.fillStyle='#fff4cf';c.beginPath();c.moveTo(w/2+22,h+56);c.lineTo(w/2+42,h+56);c.lineTo(w/2+32,h+68);c.fill();
 scene.textures.addCanvas(texture,canvas);
 objects.push(scene.add.image(origin.x-w/2-32,origin.y-h/2-80,texture).setOrigin(0).setDepth(-100000000));
 for(const prop of room.props){
  if(prop.key==='bicycle')bicycleArt(scene);
  const key=prop.key==='rock'?'forest-rock':'room-'+prop.key;
  const art=ROOM_PROP_BOUNDS[prop.key],source=scene.textures.get(key);
  if(art.splitY!==undefined){
   const split=art.splitY,scale=prop.w/art.width,[sx,sy,width,height]=art.crop;
   for(const [name,y,h] of [['back',0,split],['front',split,height-split]] as const){
    if(!source.has(name))source.add(name,0,sx,sy+y,width,h);
    const foot=prop.y-(height-y-h)*scale;
    objects.push(scene.add.image(prop.x,foot,key,name).setOrigin(.5,1).setScale(scale).setDepth(foot));
   }
   continue;
  }
  if(!source.has('visible'))source.add('visible',0,...art.crop);
  const image=scene.add.image(prop.x,prop.y,key,'visible').setOrigin(.5,1);
  image.setScale(prop.w/art.width).setDepth(prop.y);objects.push(image);
 }
 // Source frames include one transparent row below the feet (Mom includes two).
 for(const npc of room.npcs)objects.push(scene.add.image(npc.x,npc.y,'npc-'+npc.sprite).setOrigin(.5,npc.sprite==='mom'?30/32:31/32).setScale(2).setDepth(npc.y));
 return {texture,objects};
}
