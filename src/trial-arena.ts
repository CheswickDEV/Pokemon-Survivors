import type Phaser from 'phaser';
export const TRIAL_ARENA={x:1536,y:1710,r:620};
export function drawTrialArena(scene:Phaser.Scene){
 const {x,y,r}=TRIAL_ARENA,g=scene.add.graphics().setDepth(-10000);
 g.fillStyle(0x314d4b).fillCircle(x,y,r+70);
 g.fillStyle(0xc2c7ae).fillCircle(x,y,r);
 for(let ty=-r;ty<=r;ty+=32)for(let tx=-r;tx<=r;tx+=32){
  if(Math.hypot(tx+16,ty+16)>r-24)continue;
  g.fillStyle((Math.floor(tx/32)+Math.floor(ty/32))%2?0xb4bba1:0xbec3a9).fillRoundedRect(x+tx+1,y+ty+1,30,30,2);
  g.lineStyle(1,0xd8d9bd,.65).lineBetween(x+tx+3,y+ty+3,x+tx+27,y+ty+3);
 }
 g.lineStyle(8,0xf2dc98).strokeCircle(x,y,270);
 g.lineStyle(4,0x657f77).strokeCircle(x,y,280).strokeCircle(x,y,68);
 g.lineBetween(x-r+30,y,x-68,y).lineBetween(x+68,y,x+r-30,y);
 g.fillStyle(0xf2dc98).fillCircle(x,y,26);g.lineStyle(6,0x657f77).strokeCircle(x,y,26);
 for(let i=0;i<64;i++){
  const a=i*Math.PI/32,px=x+Math.cos(a)*(r+16),py=y+Math.sin(a)*(r+16);
  g.fillStyle(0x253f40).fillRoundedRect(px-18,py-15,36,36,5);
  g.fillStyle(0x7e9690).fillRoundedRect(px-18,py-24,36,30,5);
  g.fillStyle(0xb5c1a8).fillRect(px-13,py-21,26,5);
 }
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,px=x+Math.cos(a)*(r+48),py=y+Math.sin(a)*(r+48);
  g.fillStyle(0x284447).fillRect(px-6,py-50,12,65);
  g.fillStyle(i%2?0x5797a4:0xc86d61).fillTriangle(px+6,py-48,px+48,py-36,px+6,py-24);
  g.lineStyle(3,0xe2c681).lineBetween(px+8,py-45,px+37,py-36);
 }
 return g;
}
