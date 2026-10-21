import type {CatalogElement} from './kanto-catalog.ts';

/** One automatic weapon per Pokémon. All distances are world pixels, time is seconds,
 * arc is radians, power is damage per hit, and bounces counts additional targets. */
export type WeaponPattern = 'shot'|'fan'|'burst'|'beam'|'chain'|'orbit'|'nova'|'cone'|'slash'|'dash'|'boomerang'|'mine'|'zone'|'drain'|'charge'|'ricochet';
export interface SignatureWeapon {
 name:string;type:CatalogElement;pattern:WeaponPattern;power:number;interval:number;range:number;
 count:number;size:number;speed:number;pierce:number;bounces:number;duration:number;arc:number;
 burn:boolean;slow:boolean;healing:number;description:string;
 upgradeFocus:'count'|'pierce'|'bounces'|'area'|'duration'|'tempo';rankNotes:string[];
}
type Seed = Pick<SignatureWeapon,'name'|'type'|'pattern'|'power'|'interval'|'range'|'description'|'upgradeFocus'> & Partial<Omit<SignatureWeapon,'rankNotes'>>;
const weapons:Record<number,SignatureWeapon>={};
function notes(w:Omit<SignatureWeapon,'rankNotes'>):string[]{
 return Array.from({length:8},(_,i)=>{
  if(i===0)return w.description;
  const rank=i+1,milestone=[3,5,8].includes(rank);
  const focus:Record<SignatureWeapon['upgradeFocus'],string>={
   count:'Ein weiterer Angriff pro Auslösung (bis zu acht).',pierce:'Durchdringt einen zusätzlichen Gegner.',
   bounces:'Springt zu einem weiteren Ziel.',area:'Trefferfläche wächst um weitere 12 %.',
   duration:'Wirkungsdauer steigt um weitere 20 %.',tempo:'Abklingzeit sinkt zusätzlich um 7 %.'
  };
  return `Grundschaden +${16*i} %, Abklingzeit −${4*i} % gegenüber Rang 1.${milestone?' '+focus[w.upgradeFocus]:''}`;
 });
}
function line(ids:number[],seed:Seed,changes:Record<number,Partial<Seed>>={}):void{
 for(const id of ids){
  if(weapons[id])throw new Error(`Doppelte Signaturwaffe: ${id}`);
  const w:Omit<SignatureWeapon,'rankNotes'>={count:1,size:12,speed:320,pierce:0,bounces:0,duration:.45,arc:.65,burn:false,slow:false,healing:0,...seed,...changes[id]};
  // Keep the weapon silhouettes legible beside the trainer. Attack upgrades may
  // widen their hit area; evolution itself does not alter any Pokémon sprite size.
  if(['shot','burst','ricochet','boomerang'].includes(w.pattern))w.size=Math.min(12,w.size);
  if(w.pattern==='zone'||w.pattern==='mine')w.size=Math.max(45,w.size);
  if(w.pattern==='nova')w.size=Math.min(110,w.range);
  if(w.pattern==='orbit'){w.range=Math.round(w.range*.62);w.size=Math.min(17,w.size);}
  weapons[id]=Object.freeze({...w,rankNotes:notes(w)});
 }
}

line([1,2,3],{name:'Rasierblatt',type:'grass',pattern:'boomerang',power:12,interval:1.55,range:245,count:2,speed:285,size:11,pierce:1,duration:1.7,arc:.35,upgradeFocus:'count',description:'Zwei scharfe Blätter fliegen hinaus und kehren durch die Gegner zurück.'});
line([4,5,6],{name:'Flammenwurf',type:'fire',pattern:'cone',power:25,interval:1.55,range:165,size:16,arc:.8,duration:.5,burn:true,upgradeFocus:'area',description:'Ein gerichteter Flammenkegel verbrennt Gegner vor dem Pokémon.'},{4:{name:'Glut',range:150},6:{name:'Feuersturm',arc:.95}});
line([7,8,9],{name:'Aquaknarre',type:'water',pattern:'beam',power:29,interval:1.4,range:300,size:17,pierce:3,duration:.3,upgradeFocus:'pierce',description:'Ein gebündelter Wasserstrahl durchdringt mehrere Gegner in einer Linie.'},{9:{name:'Hydropumpe',size:20}});
line([10,11,12],{name:'Fadenschuss',type:'bug',pattern:'zone',power:10,interval:1.85,range:210,size:40,duration:2.8,slow:true,upgradeFocus:'duration',description:'Ein klebriges Feld bremst Gegner und verursacht wiederholt Schaden.'},{12:{name:'Schlafpuder',type:'grass',description:'Ein Puderfeld bremst Gegner und verursacht wiederholt Schaden.'}});
line([13,14,15],{name:'Giftstachel',type:'poison',pattern:'slash',power:14,interval:1.55,range:110,count:2,size:11,arc:.6,upgradeFocus:'count',description:'Zwei kurze Stiche treffen Gegner direkt vor dem Pokémon.'},{15:{name:'Duonadel',type:'bug'}});
line([16,17,18],{name:'Windstoß',type:'normal',pattern:'orbit',power:17,interval:1.65,range:105,size:15,speed:190,duration:1.5,upgradeFocus:'duration',description:'Eine Windklinge umkreist das ausführende Pokémon und räumt den unmittelbaren Weg frei.'},{18:{name:'Spiegeltrick',description:'Eine gespiegelte Windklinge umkreist das ausführende Pokémon und räumt den Weg frei.'}});
line([19,20],{name:'Ruckzuckhieb',type:'normal',pattern:'dash',power:28,interval:1.3,range:175,size:17,speed:560,upgradeFocus:'tempo',description:'Ein kurzer, sehr schneller Vorstoß trifft den nächsten Gegner.'});
line([21,22],{name:'Pikser',type:'flying',pattern:'charge',power:37,interval:1.95,range:235,size:14,speed:520,pierce:2,upgradeFocus:'pierce',description:'Ein langer, schmaler Sturzflug durchstößt hintereinander stehende Gegner.'},{22:{name:'Bohrschnabel'}});
line([23,24],{name:'Säure',type:'poison',pattern:'zone',power:12,interval:1.8,range:225,size:34,duration:2.7,upgradeFocus:'duration',description:'Eine Säurepfütze bleibt am Ziel liegen und verletzt hineinlaufende Gegner.'});
line([25,26],{name:'Donnerschock',type:'electric',pattern:'chain',power:23,interval:1.65,range:250,size:8,bounces:2,slow:true,upgradeFocus:'bounces',description:'Ein Blitz springt vom ersten Gegner auf zwei weitere Ziele über.'},{26:{name:'Donnerblitz'}});
line([27,28],{name:'Schaufler',type:'ground',pattern:'mine',power:29,interval:1.8,range:175,size:38,duration:3.6,upgradeFocus:'count',description:'Ein Erdhügel wartet auf Gegner und bricht beim Kontakt unter ihnen auf.'});
line([29,30,31],{name:'Giftstachel',type:'poison',pattern:'fan',power:10,interval:1.55,range:225,count:3,size:8,speed:280,arc:.55,upgradeFocus:'count',description:'Drei Giftstacheln decken einen schmalen Fächer vor dem Pokémon ab.'},{31:{name:'Giftstachel · Königin'}});
line([32,33,34],{name:'Hornattacke',type:'normal',pattern:'charge',power:39,interval:2.05,range:220,size:22,speed:370,pierce:1,upgradeFocus:'pierce',description:'Ein kräftiger Hornstoß durchbricht eine kurze Reihe dicht stehender Gegner.'});
line([35,36],{name:'Metronom',type:'normal',pattern:'ricochet',power:20,interval:1.4,range:245,size:12,speed:265,bounces:3,upgradeFocus:'bounces',description:'Ein rhythmischer Stern prallt zwischen nahen Gegnern weiter.'});
line([37,38],{name:'Feuerwirbel',type:'fire',pattern:'orbit',power:12,interval:2.1,range:98,count:2,size:13,speed:170,duration:2.2,burn:true,upgradeFocus:'duration',description:'Zwei Flammen kreisen als brennender Schutz um das ausführende Pokémon.'});
line([39,40],{name:'Gesang',type:'normal',pattern:'nova',power:27,interval:2,range:115,size:16,slow:true,upgradeFocus:'area',description:'Eine Klangwelle breitet sich rundum aus, trifft und verlangsamt nahe Gegner.'});
line([41,42],{name:'Blutsauger',type:'bug',pattern:'drain',power:23,interval:1.55,range:195,size:10,healing:.6,upgradeFocus:'tempo',description:'Ein Saugtreffer verletzt das Ziel und gibt dem Trainer etwas KP zurück.'});
line([43,44,45],{name:'Blättertanz',type:'grass',pattern:'orbit',power:9,interval:2.1,range:115,count:3,size:10,speed:205,duration:2.4,upgradeFocus:'count',description:'Drei Blütenblätter bilden einen weiten, kreisenden Schutzring.'});
line([46,47],{name:'Pilzspore',type:'grass',pattern:'zone',power:10,interval:2,range:215,size:46,duration:3,slow:true,upgradeFocus:'area',description:'Ein breites Sporenfeld hält Gegner auf und verletzt sie wiederholt.'});
line([48,49],{name:'Giftpuder',type:'poison',pattern:'fan',power:8,interval:1.75,range:215,count:4,size:11,speed:180,arc:.95,duration:1.4,slow:true,upgradeFocus:'count',description:'Vier langsame Puderwolken fächern breit auf und bremsen getroffene Gegner.'});
line([50,51],{name:'Schaufler',type:'ground',pattern:'beam',power:32,interval:1.95,range:285,size:17,pierce:5,duration:.55,upgradeFocus:'area',description:'Eine schmale Erdspalte läuft gerade durch die Gegnergruppe.'});
line([52,53],{name:'Zahltag',type:'normal',pattern:'ricochet',power:20,interval:1.25,range:275,size:8,speed:360,bounces:2,upgradeFocus:'bounces',description:'Eine schnelle Münze springt nach jedem Treffer zu einem weiteren Gegner.'});
line([54,55],{name:'Konfusion',type:'psychic',pattern:'burst',power:15,interval:1.6,range:260,count:2,size:13,speed:260,slow:true,upgradeFocus:'count',description:'Zwei gezielte Psychoimpulse folgen schnell aufeinander und bremsen ihr Ziel.'});
line([56,57],{name:'Karateschlag',type:'normal',pattern:'slash',power:16,interval:1.65,range:125,count:2,size:15,arc:1.3,upgradeFocus:'tempo',description:'Zwei schnelle Handkantenschläge treffen einen breiten Bereich unmittelbar voraus.'});
line([58,59],{name:'Bodycheck',type:'normal',pattern:'charge',power:39,interval:2.05,range:265,size:21,speed:510,pierce:2,upgradeFocus:'area',description:'Ein langer Ansturm schlägt eine breite Schneise in die Gegnergruppe.'});
line([60,61,62],{name:'Blubber',type:'water',pattern:'burst',power:9,interval:1.85,range:245,count:4,size:13,speed:175,slow:true,upgradeFocus:'count',description:'Vier langsame Blasen werden nacheinander auf das nächste Ziel geschossen.'},{62:{name:'Blubbstrahl'}});
line([63,64,65],{name:'Psywelle',type:'psychic',pattern:'beam',power:27,interval:1.65,range:325,size:12,pierce:3,duration:.4,upgradeFocus:'pierce',description:'Ein präziser Psychostrahl durchdringt Gegner in einer langen, geraden Linie.'},{64:{name:'Psystrahl'},65:{name:'Psystrahl'}});
line([66,67,68],{name:'Karateschlag',type:'normal',pattern:'slash',power:38,interval:1.75,range:110,size:24,arc:1.8,upgradeFocus:'area',description:'Ein schwerer Nahkampfhieb trifft viele Gegner im Halbkreis vor dem Pokémon.'},{68:{name:'Überroller',type:'fighting'}});
line([69,70,71],{name:'Rankenhieb',type:'grass',pattern:'cone',power:28,interval:1.6,range:185,size:13,arc:.38,slow:true,upgradeFocus:'area',description:'Eine lange Ranke peitscht durch einen schmalen Korridor und bremst ihre Ziele.'});
line([72,73],{name:'Wickel',type:'normal',pattern:'orbit',power:14,interval:2,range:92,count:2,size:16,speed:140,duration:2,slow:true,upgradeFocus:'duration',description:'Zwei Tentakelkreise umkreisen das ausführende Pokémon und bremsen Gegner in Reichweite.'});
line([74,75,76],{name:'Steinwurf',type:'rock',pattern:'ricochet',power:28,interval:1.8,range:285,size:16,speed:245,bounces:1,upgradeFocus:'bounces',description:'Ein schwerer Fels trifft sein Ziel und prallt zu einem zweiten Gegner.'});
line([77,78],{name:'Stampfer',type:'normal',pattern:'charge',power:31,interval:1.6,range:215,size:19,speed:620,pierce:1,upgradeFocus:'tempo',description:'Ein schneller Hufantritt trifft Gegner entlang einer kurzen Galoppspur.'});
line([79,80],{name:'Konfusion',type:'psychic',pattern:'zone',power:12,interval:2,range:265,size:49,duration:2.8,slow:true,upgradeFocus:'duration',description:'Ein träges Psychofeld bremst eine Gruppe und fügt ihr wiederholt Schaden zu.'});
line([81,82],{name:'Donnerschock',type:'electric',pattern:'chain',power:17,interval:1.3,range:215,size:7,bounces:3,upgradeFocus:'bounces',description:'Kurze magnetische Entladungen verketten vier nahe Gegner miteinander.'},{82:{name:'Donnerblitz'}});
line([83],{name:'Schlitzer',type:'normal',pattern:'slash',power:33,interval:1.75,range:150,size:18,arc:1.65,upgradeFocus:'area',description:'Ein weiter Schnitt mit der Lauchstange trifft alle Gegner im vorderen Bogen.'});
line([84,85],{name:'Pikser',type:'flying',pattern:'burst',power:19,interval:1.8,range:185,count:2,size:8,speed:460,upgradeFocus:'count',description:'Die Köpfe stoßen nacheinander geradlinig auf nahe Ziele ein.'},{85:{name:'Bohrschnabel',count:3,power:13}});
line([86,87],{name:'Aurorastrahl',type:'ice',pattern:'beam',power:27,interval:1.85,range:335,size:12,pierce:4,duration:.5,slow:true,upgradeFocus:'pierce',description:'Ein langer Eisstrahl durchbohrt die Gegnerreihe und verlangsamt sie.'},{87:{name:'Eisstrahl'}});
line([88,89],{name:'Schlammbad',type:'poison',pattern:'mine',power:21,interval:1.65,range:185,size:46,duration:4,slow:true,upgradeFocus:'duration',description:'Ein klebriger Schlammklumpen bleibt liegen und platzt bei Gegnerkontakt.'});
line([90,91],{name:'Dornkanone',type:'normal',pattern:'burst',power:10,interval:1.85,range:295,count:4,size:7,speed:400,pierce:1,upgradeFocus:'count',description:'Vier harte Dornen werden in einer schnellen geraden Salve abgefeuert.'});
line([92,93,94],{name:'Nachtnebel',type:'ghost',pattern:'drain',power:23,interval:1.95,range:245,size:18,healing:.7,upgradeFocus:'tempo',description:'Ein geisterhafter Nebelstrahl entzieht einem entfernten Ziel KP und heilt leicht.'},{94:{name:'Traumfresser',type:'psychic'}});
line([95],{name:'Steinwurf',type:'rock',pattern:'orbit',power:14,interval:2.2,range:88,count:2,size:19,speed:150,duration:2.5,upgradeFocus:'count',description:'Schwere Felsbrocken umkreisen den Trainer als enger, kräftiger Schutzring.'});
line([96,97],{name:'Hypnose',type:'psychic',pattern:'mine',power:24,interval:1.95,range:225,size:40,duration:3.2,slow:true,upgradeFocus:'duration',description:'Ein Hypnosesiegel wartet auf Gegner; beim Betreten verletzt und bremst es sie.'});
line([98,99],{name:'Krabbhammer',type:'water',pattern:'slash',power:43,interval:2.2,range:120,size:29,arc:1.05,upgradeFocus:'area',description:'Ein schwerer Scherenschlag zertrümmert einen kompakten Bereich direkt voraus.'});
line([100,101],{name:'Donnerblitz',type:'electric',pattern:'nova',power:33,interval:2.1,range:145,size:18,upgradeFocus:'tempo',description:'Eine runde elektrische Entladung trifft alle Gegner in unmittelbarer Nähe.'},{101:{name:'Donner'}});
line([102,103],{name:'Eierbombe',type:'normal',pattern:'mine',power:18,interval:2.2,range:255,count:2,size:41,duration:3,upgradeFocus:'count',description:'Zwei Eier bleiben als Fallen liegen und explodieren bei Gegnerkontakt.'});
line([104,105],{name:'Knochmerang',type:'ground',pattern:'boomerang',power:26,interval:1.9,range:240,size:13,speed:280,pierce:2,duration:1.8,upgradeFocus:'pierce',description:'Ein Knochen trifft auf dem Hin- und Rückweg und durchdringt mehrere Gegner.'});
line([106],{name:'Sprungkick',type:'fighting',pattern:'charge',power:43,interval:2.05,range:245,size:18,speed:540,pierce:2,upgradeFocus:'pierce',description:'Ein langer gerader Sprungtritt durchbricht mehrere Gegner hintereinander.'});
line([107],{name:'Kometenhieb',type:'normal',pattern:'burst',power:10,interval:1.75,range:130,count:4,size:11,speed:480,upgradeFocus:'count',description:'Eine schnelle Folge von vier Faustschlägen trifft nahe Ziele.'});
line([108],{name:'Wickel',type:'normal',pattern:'cone',power:31,interval:1.95,range:175,size:16,arc:.45,slow:true,upgradeFocus:'area',description:'Die lange Zunge wischt durch einen schmalen Bereich und bremst getroffene Gegner.'});
line([109,110],{name:'Smog',type:'poison',pattern:'zone',power:10,interval:2.05,range:235,size:61,duration:3.5,upgradeFocus:'area',description:'Eine große Giftgaswolke bleibt stehen und schädigt Gegner, die hindurchlaufen.'});
line([111,112],{name:'Hornattacke',type:'normal',pattern:'charge',power:44,interval:2.5,range:295,size:29,speed:320,pierce:4,upgradeFocus:'area',description:'Ein langsamer, schwerer Ansturm räumt eine breite und lange Gegnerreihe ab.'});
line([113],{name:'Eierbombe',type:'normal',pattern:'mine',power:32,interval:2.2,range:230,size:41,duration:3.4,healing:.8,upgradeFocus:'area',description:'Ein heilendes Ei explodiert bei Gegnerkontakt und gibt dem Trainer etwas KP zurück.'});
line([114],{name:'Absorber',type:'grass',pattern:'drain',power:24,interval:1.75,range:205,size:14,healing:.8,slow:true,upgradeFocus:'tempo',description:'Eine saugende Ranke verletzt und bremst ein Ziel, während der Trainer etwas KP erhält.'});
line([115],{name:'Kometenhieb',type:'normal',pattern:'burst',power:22,interval:2,range:155,count:2,size:15,speed:400,upgradeFocus:'count',description:'Ein kräftiger Doppelschlag trifft zwei Mal kurz nacheinander.'});
line([116,117],{name:'Aquaknarre',type:'water',pattern:'shot',power:24,interval:1.2,range:335,size:8,speed:490,pierce:2,upgradeFocus:'pierce',description:'Ein sehr schneller, schlanker Wasserbolzen durchdringt mehrere entfernte Gegner.'},{117:{name:'Hydropumpe'}});
line([118,119],{name:'Hornattacke',type:'normal',pattern:'charge',power:30,interval:1.55,range:225,size:14,speed:570,pierce:1,upgradeFocus:'tempo',description:'Ein schmaler Hornvorstoß durchschneidet eine kurze Gegnerreihe.'});
line([120,121],{name:'Sternschauer',type:'normal',pattern:'boomerang',power:12,interval:2.1,range:275,count:3,size:12,speed:365,pierce:1,duration:1.65,arc:1.1,upgradeFocus:'count',description:'Drei Sterne fliegen in verschiedene Richtungen und kehren zum Pokémon zurück.'});
line([122],{name:'Barriere',type:'psychic',pattern:'zone',power:12,interval:2.15,range:195,size:49,duration:3.5,slow:true,upgradeFocus:'duration',description:'Ein Psychofeld bildet eine schädigende Barriere, die Gegner stark ausbremst.'});
line([123],{name:'Schlitzer',type:'normal',pattern:'slash',power:25,interval:1.75,range:155,count:2,size:17,arc:1.1,upgradeFocus:'count',description:'Zwei gekreuzte Sichelschnitte treffen die Gegner direkt vor dem Pokémon.'});
line([124],{name:'Blizzard',type:'ice',pattern:'cone',power:28,interval:1.85,range:195,size:14,arc:1.25,slow:true,upgradeFocus:'area',description:'Ein breiter Eisfächer trifft und verlangsamt viele Gegner in kurzer Entfernung.'});
line([125],{name:'Donnerschlag',type:'electric',pattern:'slash',power:35,interval:1.65,range:125,size:18,arc:1.1,upgradeFocus:'tempo',description:'Ein schneller elektrischer Fausthieb trifft die Gegner unmittelbar voraus.'});
line([126],{name:'Glut',type:'fire',pattern:'burst',power:15,interval:2.1,range:255,count:3,size:12,speed:255,burn:true,upgradeFocus:'count',description:'Drei glühende Feuerkugeln folgen nacheinander und setzen getroffene Gegner in Brand.'});
line([127],{name:'Klammer',type:'normal',pattern:'slash',power:49,interval:2.35,range:110,size:27,arc:.7,upgradeFocus:'area',description:'Ein wuchtiger Zangenschlag trifft einen engen Nahkampfbereich besonders hart.'});
line([128],{name:'Bodycheck',type:'normal',pattern:'charge',power:43,interval:2.1,range:285,size:24,speed:600,pierce:3,upgradeFocus:'tempo',description:'Ein schneller langer Ansturm durchpflügt mehrere Gegner in einer Reihe.'});
line([129],{name:'Platscher',type:'normal',pattern:'nova',power:29,interval:1.65,range:92,size:14,upgradeFocus:'area',description:'Ein kräftiger Platscher trifft Gegner in einem kleinen Kreis um das Pokémon.'});
line([130],{name:'Hydropumpe',type:'water',pattern:'beam',power:34,interval:1.85,range:355,size:18,pierce:5,duration:.6,upgradeFocus:'area',description:'Ein breiter Hochdruckstrahl durchschlägt eine lange Gegnerreihe.'});
line([131],{name:'Eisstrahl',type:'ice',pattern:'cone',power:28,interval:1.9,range:245,size:16,arc:.55,slow:true,upgradeFocus:'area',description:'Ein langer, schmaler Eisfächer trifft mehrere Gegner und verlangsamt sie.'});
line([132],{name:'Wandler · Reflexball',type:'normal',pattern:'ricochet',power:27,interval:1.85,range:265,size:16,speed:225,bounces:3,upgradeFocus:'bounces',description:'Ein elastischer Wandlerball hüpft zwischen Gegnern; er übernimmt keine fremden Attacken.'});
line([133],{name:'Ruckzuckhieb',type:'normal',pattern:'dash',power:28,interval:1.3,range:165,size:13,speed:580,upgradeFocus:'tempo',description:'Ein flinker, kompakter Vorstoß trifft das nächste Ziel.'});
line([134],{name:'Surfer',type:'water',pattern:'zone',power:12,interval:1.9,range:265,size:61,duration:2.8,slow:true,upgradeFocus:'area',description:'Eine Wasserfläche trifft Gegner wiederholt und bremst ihren Vormarsch.'});
line([135],{name:'Nadelrakete',type:'bug',pattern:'fan',power:8,interval:1.7,range:295,count:5,size:7,speed:445,pierce:1,arc:.6,upgradeFocus:'count',description:'Fünf schnelle Nadeln fliegen in einem engen, durchdringenden Fächer.'});
line([136],{name:'Flammenwurf',type:'fire',pattern:'cone',power:30,interval:1.9,range:205,size:17,arc:.48,duration:.7,burn:true,upgradeFocus:'area',description:'Ein langer schmaler Flammenkegel verbrennt Gegner in einem Korridor.'});
line([137],{name:'Triplette',type:'normal',pattern:'burst',power:15,interval:2.2,range:305,count:3,size:10,speed:325,upgradeFocus:'count',description:'Drei digitale Energieimpulse treffen ihr Ziel in rascher Folge.'});
line([138,139],{name:'Panzerschutz',type:'water',pattern:'orbit',power:15,interval:2,range:75,count:2,size:18,speed:145,duration:2.2,slow:true,upgradeFocus:'duration',description:'Zwei Wasserpanzer kreisen dicht um das ausführende Pokémon und bremsen nahe Gegner.'});
line([140,141],{name:'Schlitzer',type:'normal',pattern:'slash',power:36,interval:1.85,range:135,size:21,arc:1.75,upgradeFocus:'area',description:'Eine weite fossile Sichel schneidet durch die Gegner im vorderen Halbkreis.'},{140:{name:'Kratzer'}});
line([142],{name:'Flügelschlag',type:'flying',pattern:'boomerang',power:33,interval:2.15,range:315,size:17,speed:445,pierce:2,duration:1.5,upgradeFocus:'pierce',description:'Eine rasende Flügelklinge durchquert eine lange Strecke und kehrt zurück.'});
line([143],{name:'Bodyslam',type:'normal',pattern:'nova',power:55,interval:2.8,range:130,size:26,slow:true,upgradeFocus:'area',description:'Ein schwerer Aufprall trifft rundum und verlangsamt alle nahen Gegner.'});
line([144],{name:'Blizzard',type:'ice',pattern:'fan',power:11,interval:2.35,range:325,count:5,size:13,speed:235,arc:1.25,slow:true,upgradeFocus:'count',description:'Fünf Eisgeschosse decken einen weiten Fächer ab und verlangsamen ihre Ziele.'});
line([145],{name:'Donner',type:'electric',pattern:'chain',power:35,interval:2.6,range:335,size:13,bounces:4,upgradeFocus:'bounces',description:'Ein gewaltiger Blitz verbindet bis zu fünf Gegner über große Entfernung.'});
line([146],{name:'Feuersturm',type:'fire',pattern:'zone',power:15,interval:2.6,range:285,size:71,duration:3.2,burn:true,upgradeFocus:'duration',description:'Ein großes Flammenfeld bleibt zurück und verbrennt Gegner bei jedem Kontakt.'});
line([147,148,149],{name:'Drachenwut',type:'dragon',pattern:'shot',power:38,interval:2,range:325,size:18,speed:250,pierce:3,upgradeFocus:'area',description:'Eine große Drachenenergiekugel fliegt langsam und durchdringt mehrere Gegner.'});
line([150],{name:'Psychokinese',type:'psychic',pattern:'mine',power:39,interval:2.25,range:305,size:66,duration:3.1,slow:true,upgradeFocus:'area',description:'Ein mächtiges Psychosiegel entlädt sich beim Kontakt über einen großen Bereich.'});
line([151],{name:'Metronom',type:'psychic',pattern:'orbit',power:13,interval:2.45,range:128,count:3,size:15,speed:215,duration:2.5,upgradeFocus:'count',description:'Drei psychische Lichtkugeln tanzen als weiter Schutzkreis um das ausführende Pokémon.'});

export const SIGNATURE_WEAPONS:Readonly<Record<number,SignatureWeapon>>=Object.freeze(weapons);
