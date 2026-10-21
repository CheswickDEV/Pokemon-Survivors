import {KANTO_CATALOG} from './kanto-catalog.ts';
import {SIGNATURE_WEAPONS} from './signature-weapons.ts';
import type {SignatureWeapon,WeaponPattern} from './signature-weapons.ts';
export type Element = 'normal'|'fire'|'water'|'grass'|'electric'|'ice'|'fighting'|'poison'|'ground'|'flying'|'psychic'|'bug'|'rock'|'ghost'|'dragon';
export type Pattern = WeaponPattern;
export interface Move {name:string;type:Element;pattern:Pattern;power:number;interval:number;range:number}
export interface Evolution {to:number;level:number;stone?:string}
export type TraitKind='heal'|'guard'|'burn'|'slow'|'magnet'|'extra'|'focus'|'none';
export interface Species {id:number;name:string;types:Element[];color:number;role:string;moves:Move[];weapon:SignatureWeapon;evolves?:Evolution;evolutions:Evolution[];stage:number;locomotion:string;traitKind:TraitKind;trait:string}
export const TYPE_NAME:Record<Element,string>={grass:'Pflanze',poison:'Gift',fire:'Feuer',water:'Wasser',normal:'Normal',electric:'Elektro',bug:'Käfer',flying:'Flug',ice:'Eis',fighting:'Kampf',ground:'Boden',psychic:'Psycho',rock:'Gestein',ghost:'Geist',dragon:'Drache'};
export const TYPE_COLOR:Record<Element,number>={grass:0xa5da84,fire:0xf6ae68,water:0x8bd0e4,electric:0xffdc75,normal:0xead9b9,bug:0xbfcf78,poison:0xd7a0d4,flying:0xb6d7ec,ice:0x99e5ec,fighting:0xe28c78,ground:0xd9b16d,psychic:0xf29bc3,rock:0xc2b486,ghost:0xa598d2,dragon:0xa292ed};
export const ELEMENTS=Object.keys(TYPE_NAME) as Element[];
const traitText=(kind:TraitKind,stage:number)=>({
 heal:'Saatruhe: im Kampf alle 45 s bis zu '+(1+stage)+' KP; teilt die teamweite Heilsperre von 10 s.',
 guard:'Panzerwache: '+(6+stage*2)+' % weniger Trainerschaden; alle 12 s bis zu 12 Schild.',
 burn:'Nachglut: Treffer verursachen zusätzlichen Brandschaden.',
 slow:'Hemmende Treffer: Gegner werden kurz um 25 % langsamer, Bosse um 15 %.',
 magnet:'Findigkeit: '+(stage?30:20)+' % größerer Sammelradius.',
 extra:'Restladung: ein weiteres Geschoss pro Salve.',
 focus:'Präzision: 8 Prozentpunkte zusätzliche kritische Trefferchance.',
 none:'Verlässlicher Partner: greift mit den ausgerüsteten Attacken automatisch an.'
}[kind]);
export const SPECIES:Record<number,Species>=Object.fromEntries(KANTO_CATALOG.map(entry=>{
 const types=entry.types as Element[],evolutions=entry.evolutions as Evolution[],traitKind=entry.traitKind as TraitKind;
 const weapon=SIGNATURE_WEAPONS[entry.id];
 const species:Species={...entry,types,evolutions,moves:[weapon],weapon,color:TYPE_COLOR[types[0]],traitKind,trait:traitText(traitKind,entry.stage),evolves:evolutions[0]};
 return [entry.id,species];
}));
export const STARTERS=[1,4,7];
export const RECRUIT_POOL=Array.from({length:151},(_,i)=>i+1);
export const LEGACY_RECRUITS=[25,19,10,7,4,1];
/** Every species can be the guaranteed first research encounter. The other five vary by run. */
export function encounterRoster(seed:number,target:number|null=null){
 if(target!==null&&!SPECIES[target])throw new Error('Ungültiges Forschungsziel.');
 let rng=(seed^0x91aef5c3)>>>0;const pool=RECRUIT_POOL.filter(id=>id!==target);
 for(let i=pool.length-1;i>0;i--){rng=(Math.imul(rng,1664525)+1013904223)>>>0;const j=rng%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
 return (target===null?pool:[target,...pool]).slice(0,6);
}
const raw:Partial<Record<Element,Partial<Record<Element,number>>>>={
 normal:{rock:.5,ghost:0},
 fire:{fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5},
 water:{fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5},
 grass:{fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5},
 electric:{water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},
 ice:{water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2},
 fighting:{normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0},
 poison:{grass:2,poison:.5,ground:.5,bug:2,rock:.5,ghost:.5},
 ground:{fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2},
 flying:{electric:.5,grass:2,fighting:2,bug:2,rock:.5},
 psychic:{fighting:2,poison:2,psychic:.5},
 bug:{fire:.5,grass:2,fighting:.5,poison:2,flying:.5,psychic:2,ghost:.5},
 rock:{fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2},
 ghost:{normal:0,psychic:0,ghost:2},
 dragon:{dragon:2}
};
export function typeFactor(attack:Element,defender:Element[]){
 const n=defender.reduce((v,t)=>v*(raw[attack]?.[t]??1),1);
 return ({'0':.25,'0.25':.6,'0.5':.8,'1':1,'2':1.35,'4':1.65} as Record<string,number>)[String(n)]??1;
}
export interface Passive {id:string;name:string;icon:string;description:(rank:number)=>string}
export const PASSIVES:Passive[]=[
 {id:'power',name:'Kraftband',icon:'✦',description:r=>'+'+r*5+' % Attackenschaden'},
 {id:'duration',name:'Dauerstein',icon:'⌛',description:r=>'+'+r*8+' % Dauer von Umlauf, Fallen und Feldern'},
 {id:'velocity',name:'Windfeder',icon:'➶',description:r=>'+'+r*6+' % Geschoss- und Umlaufgeschwindigkeit'},
 {id:'dash',name:'Sprintband',icon:'»',description:r=>'−'+r*6+' % Dash-Abklingzeit'},
 {id:'study',name:'Forscherheft',icon:'▤',description:r=>'+'+r*5+' % Trainer-EP aus Bodenfunden'},
 {id:'endurance',name:'Ausdauergurt',icon:'♧',description:r=>r*6+' % weniger Ausdauerverlust durch Bossattacken'},
 {id:'reach',name:'Spählinse',icon:'◎',description:r=>'+'+r*10+' % Reichweite'},
 {id:'tempo',name:'Taktmodul',icon:'◷',description:r=>'−'+r*4+' % Angriffsabklingzeit'},
 {id:'area',name:'Feldverstärker',icon:'◉',description:r=>'+'+r*5+' % Flächenradius'},
 {id:'crit',name:'Ziellinse',icon:'✧',description:r=>'+'+r*4+' Punkte kritische Chance'},
 {id:'shots',name:'Splitterspule',icon:'⋔',description:r=>'Jede '+Math.max(1,6-r)+'. Salve: ein Zusatzgeschoss'},
 {id:'armor',name:'Schutzweste',icon:'◇',description:r=>r*4+' % weniger Schaden'},
 {id:'heal',name:'Versorgungsset',icon:'✚',description:r=>'+'+r*8+' % Heilwirkung'},
 {id:'magnet',name:'Sammeltasche',icon:'◌',description:r=>'+'+r*15+' % Sammelradius'},
 {id:'speed',name:'Leichtsohlen',icon:'➚',description:r=>'+'+r*4+' % Bewegung'},
 {id:'status',name:'Statusbinder',icon:'≋',description:r=>'+'+r*8+' % Zustandsdauer'},
 {id:'focus',name:'Fokusmarke',icon:'⌖',description:r=>'+'+r*6+' % Schaden am Fokusziel'},
 {id:'shield',name:'Barrierekern',icon:'⬡',description:r=>'+'+r*8+' % Schutzschild'}
];
export const STONES:Record<string,string>={leaf:'Blattstein',fire:'Feuerstein',water:'Wasserstein',thunder:'Donnerstein',moon:'Mondstein',link:'Link-Marke'};
export const AVAILABLE_STONES=Object.fromEntries(Object.entries(STONES).filter(([id])=>Object.values(SPECIES).some(p=>p.evolutions.some(e=>e.stone===id))));
export const WORLD_SIZE=3072;
export const POIS=[
 {id:'camp',name:'Rangerlager',short:'Verlorene Vorräte',x:1250,y:1770,kind:'camp',goal:3},
 {id:'garden',name:'Pollengarten',short:'Die Blütenwacht',x:2040,y:1420,kind:'shrine',goal:30},
 {id:'tree',name:'Alter Baum',short:'Das Dornensiegel',x:1150,y:1040,kind:'tree',goal:4}
];
export const OBSTACLES=Array.from({length:32},(_,i)=>{
 const angle=i*2.399963, radius=340+(i%5)*175;
 const x=1536+Math.cos(angle)*radius,y=1536+Math.sin(angle)*radius;
 return {x,y,r:24+(i%3)*4};
}).filter(o=>!POIS.some(p=>Math.hypot(p.x-o.x,p.y-o.y)<145)&&Math.hypot(o.x-1536,o.y-1710)>180);
export const DATA_VERSION=6;
