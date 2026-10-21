export function mapControls(root:HTMLElement,initial:number,onZoom:(zoom:number)=>void){
 const viewport=root.querySelector<HTMLElement>('.map-viewport'),atlas=viewport?.querySelector<SVGElement>('svg');
 if(!viewport||!atlas)return;
 let zoom=initial,drag:{x:number;y:number;left:number;top:number;id:number}|null=null,moved=false,suppressClick=false;
 const controller=new AbortController(),signal=controller.signal;
 const setZoom=(next:number,x=viewport.clientWidth/2,y=viewport.clientHeight/2)=>{
  next=Math.max(1,Math.min(4,next));
  const wx=(viewport.scrollLeft+x)/zoom,wy=(viewport.scrollTop+y)/zoom;
  zoom=next;atlas.style.width=viewport.clientWidth*zoom+'px';atlas.style.height=viewport.clientHeight*zoom+'px';
  viewport.scrollLeft=wx*zoom-x;viewport.scrollTop=wy*zoom-y;
  const label=root.querySelector('.map-tools b');if(label)label.textContent=Math.round(zoom*100)+' %';
  const minus=root.querySelector<HTMLButtonElement>('[data-action="map-minus"]'),plus=root.querySelector<HTMLButtonElement>('[data-action="map-plus"]');
  if(minus)minus.disabled=zoom<=1;if(plus)plus.disabled=zoom>=4;onZoom(zoom);
 };
 viewport.addEventListener('wheel',e=>{e.preventDefault();const b=viewport.getBoundingClientRect();setZoom(zoom*Math.exp(-e.deltaY*.0015),e.clientX-b.left,e.clientY-b.top);},{passive:false,signal});
 viewport.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  suppressClick=false;moved=false;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop,id:e.pointerId};
 },{signal});
 viewport.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!moved&&Math.hypot(dx,dy)<4)return;
  moved=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');
  viewport.scrollLeft=drag.left-dx;viewport.scrollTop=drag.top-dy;e.preventDefault();
 },{signal});
 const end=()=>{if(drag&&viewport.hasPointerCapture(drag.id))viewport.releasePointerCapture(drag.id);suppressClick=moved;drag=null;viewport.classList.remove('dragging');};
 viewport.addEventListener('pointerup',end,{signal});viewport.addEventListener('pointercancel',end,{signal});viewport.addEventListener('pointerleave',()=>{if(!moved)drag=null;},{signal});
 viewport.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},{capture:true,signal});
 setZoom(initial);
 return {setZoom,destroy:()=>controller.abort()};
}
export function selectMapPlace(root:HTMLElement,id:string,card:string){
 for(const node of root.querySelectorAll<SVGElement>('.atlas-place')){
  const chosen=node.dataset.id===id;node.classList.toggle('selected',chosen);node.setAttribute('aria-pressed',String(chosen));
 }
 const slot=root.querySelector('.map-place-card');if(slot)slot.outerHTML=card;
}
