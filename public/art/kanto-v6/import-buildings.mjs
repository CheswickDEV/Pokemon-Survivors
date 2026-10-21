/**
 * Deterministic asset import only: trim transparent margins, nearest-neighbour
 * resize, preserve alpha, pack atlas. The artwork itself comes from ImageGen.
 *
 * Usage from project root: node public/art/kanto-v6/import-buildings.mjs
 * Optional dependencies: cd tools/assets, then npm ci.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {loadSharp} from '../../../scripts/asset-tools.mjs';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const sharp=loadSharp();
const manifest=JSON.parse(await fs.readFile(path.join(root,'prompts.json'),'utf8'));
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const sprites=[],atlasParts=[],proofParts=[],frames={};
const cellW=288,cellH=288,columns=4;

for(const [i,item] of manifest.assets.entries()){
 const input=await fs.readFile(path.join(root,'generated',item.id+'.png'));
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=0,bottom=0,transparent=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const a=data[(y*info.width+x)*4+3];
  if(a===0)transparent++;
  if(a>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 }
 if(!transparent||right<=left||bottom<=top)throw Error(item.id+': transparent sprite required');
 const crop={left,top,width:right-left+1,height:bottom-top+1};
 const h=Math.round(crop.height*item.width/crop.width);
 const image=await sharp(input).extract(crop).resize(item.width,h,{kernel:'nearest'}).extend({top:2,right:2,bottom:2,left:2,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
 const width=item.width+4,height=h+4;
 await fs.writeFile(path.join(root,item.id+'.png'),image);
 // Relative to the bottom-centre render anchor. The roof and upper facade
 // overhang the solid ground footprint, allowing correct depth sorting.
 const footprintWidth=Math.round(item.width*(item.id==='cave'?.88:.86));
 const footprintDepth=Math.round(item.width*(item.id==='cave'?.33:.36));
 const footprint={x:-Math.round(footprintWidth/2),y:-footprintDepth-4,width:footprintWidth,height:footprintDepth};
 const sprite={id:item.id,file:item.id+'.png',width,height,worldWidth:width,worldHeight:height,origin:{x:.5,y:1},ground:{x:width/2,y:height-2},door:{x:0,y:-2},interact:{x:0,y:24},footprint,sourceCrop:crop,sourceSha256:sha(input),sha256:sha(image)};
 sprites.push(sprite);
 const x=(i%columns)*cellW+Math.floor((cellW-width)/2),y=Math.floor(i/columns)*cellH+cellH-height-24;
 atlasParts.push({input:image,left:x,top:y});
 proofParts.push({input:image,left:x,top:y});
 frames[item.id]={frame:{x,y,w:width,h:height},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w:width,h:height},sourceSize:{w:width,h:height}};
 const proof=`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg"><text x="144" y="16" fill="#183e42" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold">${item.id}</text><text x="144" y="282" fill="#183e42" text-anchor="middle" font-family="Arial" font-size="10">${width}×${height} · footprint ${footprint.width}×${footprint.height}</text></svg>`;
 proofParts.push({input:Buffer.from(proof),left:(i%columns)*cellW,top:Math.floor(i/columns)*cellH});
}
const atlasWidth=columns*cellW,atlasHeight=Math.ceil(sprites.length/columns)*cellH;
await sharp({create:{width:atlasWidth,height:atlasHeight,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(atlasParts).png().toFile(path.join(root,'buildings-atlas.png'));
await sharp({create:{width:atlasWidth,height:atlasHeight,channels:4,background:'#86c6a0'}}).composite(proofParts).png().toFile(path.join(root,'contact-sheet.png'));
await fs.writeFile(path.join(root,'buildings-atlas.json'),JSON.stringify({frames,meta:{image:'buildings-atlas.png',format:'RGBA8888',size:{w:atlasWidth,h:atlasHeight},scale:'1'}},null,2)+'\n');
await fs.writeFile(path.join(root,'metadata.json'),JSON.stringify({version:1,style:'Kanto-inspired original pixel artwork; whole building sprites',units:'World pixels at scale 1; footprint, door, interact relative to bottom-centre image origin.',sprites},null,2)+'\n');
console.log(JSON.stringify({sprites:sprites.length,atlas:{width:atlasWidth,height:atlasHeight},items:sprites.map(s=>({id:s.id,width:s.width,height:s.height,footprint:s.footprint}))},null,2));
