export interface Settings {sound:boolean;effects:boolean;hudScale:number;volume:number}
const bounded=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
export const normalizeSettings=(raw:Partial<Settings>|undefined):Settings=>({
 sound:raw?.sound===undefined?true:!!raw.sound,effects:raw?.effects!==false,
 hudScale:Math.round(bounded(raw?.hudScale,.7,1.5,1)*100)/100,
 volume:bounded(raw?.volume,0,1,.55)
});
export function applyHudScale(value:number){
 document.documentElement.style.setProperty('--hud-scale',String(normalizeSettings({hudScale:value}).hudScale));
}
