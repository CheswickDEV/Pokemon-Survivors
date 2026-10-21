import {KANTO_ATLAS} from './kanto-atlas.ts';
import {currentLocation} from './world.ts';
import type {RunState,Point} from './engine.ts';
import {KANTO_LOCATIONS,KANTO_GYMS} from './kanto-world-catalog.ts';
import {WORLD_ROUTES,reachableKanto} from './world.ts';
import {nextStoryStage} from './story.ts';
import {POIS} from './data.ts';
import {mapObjects,forestRoadPolygons} from './map-geometry.ts';
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
export function regionalSvg(s:RunState,zoom:number,selected:string|null){
 const reached=reachableKanto(s.story.unlocks),stage=nextStoryStage(s);
 const location=currentLocation(s),me=KANTO_ATLAS[location.id],goal=stage&&KANTO_ATLAS[stage.locationId];
 return `<svg class="region-atlas original-atlas" style="width:${zoom*100}%;height:${zoom*56}vh" viewBox="0 0 192 144" role="group" aria-label="Originale Kanto-Regionskarte aus Feuerrot und Blattgrün. Orte auswählen, Mausrad zum Zoomen, Ziehen zum Verschieben.">
 <rect width="192" height="144" fill="#77bbbd"/>
 <image href="/art/original-overworld/kanto-region-map-cropped.png" width="192" height="144" style="image-rendering:pixelated"/>
 <g pointer-events="none"><rect x="168" y="112" width="24" height="24" fill="#77bbbd"/><path d="M180 118l4 12-4-3-4 3z" fill="#fff6c1" stroke="#3b6970" stroke-width=".6"/><text x="180" y="117" text-anchor="middle" font-size="4" fill="#28585f">N</text></g>
 ${KANTO_LOCATIONS.map(l=>{
  const p=KANTO_ATLAS[l.id],chosen=l.id===selected;
  return `<g role="button" tabindex="0" data-action="map-place" data-id="${l.id}" aria-pressed="${chosen}" aria-label="${esc(l.name)}${reached.has(l.id)?'':' · noch gesperrt'}" class="atlas-place${chosen?' selected':''}" transform="translate(${p.x} ${p.y})"><title>${esc(l.name)}</title><rect x="-2.4" y="-2.4" width="4.8" height="4.8" rx="1" fill="transparent"/><rect class="atlas-selection" x="-4.5" y="-4.5" width="9" height="9" rx="1" fill="#fff9bc33" stroke="#fffbd0" stroke-width="1"/>${reached.has(l.id)?'':'<circle r="1.3" fill="#46505f" opacity=".65"/>'}</g>`;
 }).join('')}
 ${goal?`<circle cx="${goal.x}" cy="${goal.y}" r="5.5" fill="none" stroke="#ffef7c" stroke-width="1.2" pointer-events="none"/>`:''}
 <g transform="translate(${me.x} ${me.y})" pointer-events="none"><path d="M0 2l-3-4a3.7 3.7 0 1 1 6 0z" fill="#d94e5d" stroke="#fff9da" stroke-width=".8"/><circle cy="-4" r="1.1" fill="#fff9da"/></g>
 </svg>`;
}
export function forestSvg(s:RunState){
 const nearHome=Math.hypot(s.trainer.x-1536,s.trainer.y-1536)<1000;
 const center=nearHome?{x:1536,y:1536}:s.trainer,bounds={x:center.x-1600,y:center.y-640/900*1600,width:3200,height:640/900*3200};
 const scale=900/bounds.width,p=(v:Point)=>({x:(v.x-bounds.x)*scale,y:(v.y-bounds.y)*scale}),me=p(s.trainer);
 const roads=forestRoadPolygons(bounds).map(poly=>`<polygon points="${poly.map(v=>{const q=p(v);return q.x.toFixed(1)+','+q.y.toFixed(1);}).join(' ')}" fill="#efddb0"/>`).join('');
 const scenery=mapObjects(s,bounds).map(o=>{
  const q=p(o),w=o.width*scale,h=o.height*scale;
  if(o.kind==='cabin')return `<g transform="translate(${q.x} ${q.y})"><path d="M${-w/2} 0v${-h*.7}h${w}v${h*.7}z" fill="#f3e5c4" stroke="#8d7958"/><path d="M${-w*.55} ${-h*.65}L0 ${-h}L${w*.55} ${-h*.65}z" fill="#779ebc"/></g>`;
  if(o.kind==='garden')return `<ellipse cx="${q.x}" cy="${q.y}" rx="${w/2}" ry="${h/2}" fill="none" stroke="#b38ba4" stroke-width="3"/>`;
  return `<ellipse cx="${q.x}" cy="${q.y-h*.45}" rx="${w*.5}" ry="${h*.42}" fill="${o.kind==='rock'?'#9ca496':o.kind==='tree'?'#5e8b68':'#86a16d'}" stroke="${o.kind==='rock'?'#7b897a':'#4d785d'}" stroke-width="1"/><ellipse cx="${q.x-w*.1}" cy="${q.y-h*.57}" rx="${w*.3}" ry="${h*.2}" fill="${o.kind==='rock'?'#bac0af':'#97b681'}"/>`;
 }).join('');
 const markers=POIS.map((goal,i)=>{
  const point=p(goal),x=Math.max(24,Math.min(876,point.x)),y=Math.max(24,Math.min(590,point.y)),outside=x!==point.x||y!==point.y;
  return `<g transform="translate(${x} ${y})"><circle r="17" fill="#fff2cb" stroke="#897342" stroke-width="2"/><text y="6" text-anchor="middle" font-size="18" fill="#527e5f">${s.completed.includes(goal.id)?'✓':i+1}</text>${outside?`<path d="M0-26l-5 8h10z" transform="rotate(${Math.atan2(point.y-y,point.x-x)*180/Math.PI+90})" fill="#897342"/>`:''}${!outside?`<text y="35" text-anchor="middle" font-size="14" font-weight="bold" fill="#294f40" paint-order="stroke" stroke="#fff9e1" stroke-width="4">${goal.name}</text>`:''}</g>`;
 }).join('');
 return `<svg class="forest-atlas" viewBox="0 0 900 640" role="img" aria-label="Auenwald: tatsächliche Wege, Bäume, Gebäude und Aufträge"><rect width="900" height="640" fill="#c3d7ac"/>${roads}${scenery}${markers}<g transform="translate(${me.x} ${me.y})"><path d="M0-13L9 9 0 5-9 9Z" fill="#c9575d" stroke="#fff8df" stroke-width="3"/><text y="-24" text-anchor="middle" font-size="16" font-weight="bold" fill="#344f40">Du</text></g><g transform="translate(860 42)" fill="#416454"><text text-anchor="middle" font-size="17" font-weight="bold">N</text><path d="M0 7l-5 13h10z"/></g><rect x="20" y="597" width="860" height="30" rx="5" fill="#fff8e4dd"/><text x="35" y="617" fill="#456b50" font-size="13" letter-spacing="1">AUENWALD · WEGE UND LANDSCHAFT ENTSPRECHEN DER SPIELWELT</text></svg>`;
}
