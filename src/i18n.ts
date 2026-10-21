import english from './locales/en.json' with {type:'json'};

export type Language = 'en'|'de';
let language:Language='en';
export const getLanguage=()=>language;
export const getLocale=()=>language==='de'?'de-DE':'en-US';
export function setLanguage(value:unknown):Language {
 language=value==='de'?'de':'en';
 if(typeof document!=='undefined')document.documentElement.lang=language;
 return language;
}

// German source strings are retained for legacy saves and generated game data.
// Translate presentation only: never IDs, save contents, markup or asset paths.
const catalog:Readonly<Record<string,string>>=english;
const escapePattern=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const keys=Object.keys(catalog).sort((a,b)=>b.length-a.length);
const pattern=new RegExp(keys.map(key=>
 (/^[\p{L}\p{N}]/u.test(key)?'(?<![\\p{L}\\p{N}])':'')+escapePattern(key)+
 (/[\p{L}\p{N}]$/u.test(key)?'(?![\\p{L}\\p{N}])':'')).join('|'),'gu');
const cache=new Map<string,string>();
export function translateText(source:string,target:Language=language):string {
 if(target==='de'||!source.trim())return source;
 const cached=cache.get(source);if(cached!==undefined)return cached;
 // A single pass prevents translating the output of another translation.
 const result=source.replace(pattern,match=>catalog[match]);
 if(cache.size>=4096)cache.clear();
 cache.set(source,result);return result;
}

type Original={source:string;output:string;language:Language};
const originals=new WeakMap<Node,Map<string,Original>>();
function localized(node:Node,key:string,current:string):string {
 let fields=originals.get(node);if(!fields){fields=new Map();originals.set(node,fields);}
 const old=fields.get(key);
 if(old?.output===current&&old.language===language)return current;
 const source=old?.output===current?old.source:current;
 const output=translateText(source);fields.set(key,{source,output,language});return output;
}
/** Called at UI render boundaries. Does not rebuild nodes or alter input values. */
export function localizeDom(root:Element):void {
 const doc=root.ownerDocument;
 const walker=doc.createTreeWalker(root,1|4);
 let node:Node|null=root;
 while(node){
  if(node.nodeType===3){
   const parent=node.parentElement;
   if(parent&&!parent.closest('script,style,textarea,[translate="no"]')){
    const current=node.nodeValue??'',next=localized(node,'text',current);if(next!==current)node.nodeValue=next;
   }
  }else if(node.nodeType===1){
   const element=node as Element;
   if(!element.closest('[translate="no"]'))for(const key of ['aria-label','title','alt','placeholder']){
    const current=element.getAttribute(key);if(current===null)continue;
    const next=localized(element,key,current);if(next!==current)element.setAttribute(key,next);
   }
  }
  node=walker.nextNode();
 }
}

export function languagePicker():string {
 return `<label class="language-picker"><span>${language==='de'?'Sprache':'Language'}</span><select data-setting="language" aria-label="${language==='de'?'Sprache':'Language'}" translate="no"><option value="en" lang="en" ${language==='en'?'selected':''}>English</option><option value="de" lang="de" ${language==='de'?'selected':''}>Deutsch</option></select></label>`;
}
