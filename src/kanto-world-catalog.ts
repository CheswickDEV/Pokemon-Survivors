/** Kanto's Gen-I topology, compressed into one continuous survivors map.
 * Coordinates, encounter mixtures and wave objectives are this game's adaptation.
 * Original connections, leaders and key-item dependencies: analysis/KANTO-WORLD-REFERENCES.md.
 * Keep this separate from kanto-catalog.ts, which owns the 151 species.
 */
export type KantoBiome = 'town'|'meadow'|'forest'|'mountain'|'cave'|'coast'|'water'|'ruins';
export type KantoLocationKind = 'town'|'route'|'dungeon'|'landmark'|'league';
export type KantoBattleType = 'normal'|'rock'|'water'|'electric'|'grass'|'poison'|'psychic'|'fire'|'ground'|'ice'|'fighting'|'ghost'|'dragon';
export interface KantoLocation {
  id:string; name:string; x:number; y:number; radius:number;
  biome:KantoBiome; kind:KantoLocationKind; encounters:readonly number[]; safe:boolean;
}
export interface KantoRoute {
  id:string; from:string; to:string; name:string; width:number;
  /** A permanent story unlock. Undefined means the corridor is always traversable. */
  requirement?:string;
  /** Optional routing points keep underground passages separate from Saffron's gates. */
  via?:readonly {x:number;y:number}[];
}
export interface KantoGym {
  id:string; locationId:string; leader:string; name:string; type:KantoBattleType;
  badge:string; order:number; team:readonly number[]; levels:readonly number[];
  requiredUnlocks:readonly string[]; rewardUnlocks:readonly string[];
}
export interface KantoLeagueTrainer {
  id:string; name:string; type:KantoBattleType;
  team:readonly number[]; levels:readonly number[];
}
export interface KantoStoryMilestone {
  id:string; title:string; locationId:string; kind:'quest'|'gym'|'rival'|'league';
  description:string; objective:string;
  /** National Pokédex numbers; split across the requested waves, with no later-generation species. */
  team:readonly number[]; teams?:readonly (readonly number[])[];
  /** IDs of completed milestones, distinct from rewardUnlocks. */
  requires:readonly string[]; rewardUnlocks:readonly string[];
  waves:number; duration:number; coins:number;
}

const location = (id:string,name:string,x:number,y:number,kind:KantoLocationKind,biome:KantoBiome,
  encounters:readonly number[]=[],radius=360):KantoLocation =>
  ({id,name,x,y,kind,biome,encounters,radius:kind==='town'?480:kind==='route'?Math.max(radius,380):radius,safe:kind==='town'||kind==='league'||id==='sea-cottage'});

export const KANTO_START = {x:0,y:0,locationId:'pallet'} as const;
export const KANTO_LOCATIONS:readonly KantoLocation[] = [
  location('pallet','Alabastia',0,0,'town','town'),
  location('viridian','Vertania City',0,-1950,'town','town'),
  location('pewter','Marmoria City',0,-5200,'town','town'),
  location('cerulean','Azuria City',6400,-5850,'town','town'),
  location('lavender','Lavandia',9600,-3900,'town','town'),
  location('vermilion','Orania City',6400,-1300,'town','town'),
  location('celadon','Prismania City',4000,-3900,'town','town'),
  location('fuchsia','Fuchsania City',4800,1300,'town','town'),
  location('cinnabar','Zinnoberinsel',0,2600,'town','coast'),
  location('saffron','Saffronia City',6400,-3900,'town','town'),
  location('indigo','Indigo-Plateau',-1600,-5850,'league','mountain',[],500),

  location('route-1','Route 1',0,-975,'route','meadow',[16,19],270),
  location('route-2','Route 2',0,-3050,'route','meadow',[16,19,10,13],270),
  location('route-3','Route 3',1600,-5200,'route','mountain',[16,21,39,27,23],300),
  location('route-4','Route 4',4800,-5850,'route','mountain',[19,21,23,27],300),
  location('route-5','Route 5',6400,-4900,'route','meadow',[16,43,69,52,56],300),
  location('route-6','Route 6',6400,-2250,'route','meadow',[16,43,69,52,54],300),
  location('route-7','Route 7',5100,-3900,'route','meadow',[16,43,69,52,37,58],260),
  location('route-8','Route 8',8100,-3900,'route','meadow',[16,52,37,58,63],300),
  location('route-9','Route 9',8000,-5850,'route','mountain',[19,21,23,27],300),
  location('route-10','Route 10',9600,-5850,'route','mountain',[21,100,27,23],300),
  location('route-11','Route 11',8000,-1300,'route','meadow',[21,23,27,96],300),
  location('route-12','Route 12',9600,-1300,'route','coast',[43,69,16,48,72,98],300),
  location('route-13','Route 13',8800,0,'route','coast',[43,69,16,48,132],300),
  location('route-14','Route 14',7200,650,'route','meadow',[43,69,16,48,132],300),
  location('route-15','Route 15',6400,1300,'route','meadow',[43,69,16,48,132],300),
  location('route-16','Route 16',2400,-3900,'route','meadow',[19,20,21,84],300),
  location('route-17','Route 17',1600,-1300,'route','meadow',[19,20,21,84],320),
  location('route-18','Route 18',3200,1300,'route','meadow',[19,20,21,84],300),
  location('route-19','Route 19',4800,2600,'route','water',[72,73,116,120,118],400),
  location('route-20','Route 20',1200,2600,'route','water',[72,73,90,116,120],350),
  location('route-21','Route 21',0,1300,'route','water',[72,73,114,129,118],350),
  location('route-22','Route 22',-1600,-1950,'route','meadow',[19,29,32,21,56],300),
  location('route-23','Route 23',-1600,-3250,'route','mountain',[21,22,23,24,27,28,132],320),
  location('route-24','Route 24 · Nugget-Brücke',6400,-6700,'route','meadow',[10,13,43,69,63],300),
  location('route-25','Route 25',7600,-7150,'route','meadow',[10,13,43,69,63],300),

  location('viridian-forest','Vertania-Wald',0,-4150,'dungeon','forest',[10,11,13,14,25],440),
  location('mt-moon','Mondberg',3200,-5850,'dungeon','cave',[41,74,46,35],440),
  location('digletts-cave','Digdas Höhle',3400,-2800,'dungeon','cave',[50,51],360),
  location('rock-tunnel','Felstunnel',9600,-5000,'dungeon','cave',[41,74,66,95],440),
  location('pokemon-tower','Pokémon-Turm',10400,-3900,'dungeon','ruins',[92,93,104],380),
  location('rocket-hideout','Rocket-Versteck',4000,-4700,'dungeon','ruins',[19,20,41,23,109,96],340),
  location('silph-co','Silph Co.',7100,-3300,'dungeon','ruins',[100,81,109,88,96,20],360),
  location('safari-zone','Safari-Zone',4800,350,'dungeon','forest',[29,32,33,30,102,111,113,115,123,127,128,147],470),
  location('seafoam-islands','Seeschauminseln',2800,2600,'dungeon','cave',[86,87,79,80,54,55,90,98],450),
  location('pokemon-mansion','Pokémon-Villa',-800,2700,'dungeon','ruins',[77,88,109,58,37,132],350),
  location('power-plant','Kraftwerk',10500,-5550,'dungeon','ruins',[25,26,81,82,100,101,125],400),
  location('victory-road','Siegesstraße',-1600,-4500,'dungeon','cave',[66,67,74,75,95,41,42],460),
  location('cerulean-cave','Azuria-Höhle',5400,-6600,'dungeon','cave',[42,64,67,82,101,112,113,132],390),
  location('ss-anne','M.S. Anne',6700,-400,'dungeon','coast',[66,72,90,116,120],360),
  location('sea-cottage','Bills Küstenhaus',8400,-7150,'landmark','coast',[],280),
];

const path = (from:string,to:string,name:string,requirement?:string,width=190,
  via?:readonly {x:number;y:number}[]):KantoRoute =>
  ({id:`${from}--${to}`,from,to,name,width:name.includes('Tunnel')||name==='Digdas Höhle'?width:Math.max(width,380),...(requirement?{requirement}:{}),...(via?{via}:{})});

/** Both ordinary paths and dungeon/underground links live in this one connected graph. */
export const KANTO_ROUTES:readonly KantoRoute[] = [
  path('pallet','route-1','Route 1'), path('route-1','viridian','Route 1'),
  path('viridian','route-2','Route 2','pokedex'), path('route-2','viridian-forest','Vertania-Wald'),
  path('viridian-forest','pewter','Route 2'), path('pewter','route-3','Route 3','boulder-badge'),
  path('route-3','mt-moon','Mondberg'), path('mt-moon','route-4','Route 4','moon-pass'),
  path('route-4','cerulean','Route 4'), path('cerulean','route-24','Nugget-Brücke'),
  path('route-24','route-25','Route 25'), path('route-25','sea-cottage','Bills Küstenhaus'),
  path('cerulean','route-5','Route 5'), path('route-5','saffron','Nordtor','drink'),
  path('saffron','route-6','Südtor','drink'), path('route-6','vermilion','Route 6'),
  path('route-5','route-6','Tunnel Nord–Süd',undefined,120,[{x:5800,y:-4900},{x:5800,y:-2250}]),
  path('vermilion','ss-anne','Hafensteg','ticket'), path('vermilion','route-11','Route 11'),
  path('route-11','digletts-cave','Digdas Höhle',undefined,130,[{x:8000,y:-2300}]),
  path('digletts-cave','route-2','Digdas Höhle','cut',130),
  path('cerulean','route-9','Route 9','cut'), path('route-9','route-10','Route 10'),
  path('route-10','rock-tunnel','Felstunnel'), path('rock-tunnel','lavender','Route 10 · Süd','tunnel-pass'),
  path('route-10','power-plant','Fluss zum Kraftwerk','surf',160),
  path('lavender','pokemon-tower','Pokémon-Turm'), path('lavender','route-8','Route 8'),
  path('route-8','saffron','Osttor','drink'), path('saffron','route-7','Westtor','drink'),
  path('route-7','celadon','Route 7'),
  path('route-8','route-7','Tunnel Ost–West',undefined,120,[{x:8100,y:-4400},{x:5100,y:-4400}]),
  path('celadon','rocket-hideout','Spielhalle'), path('saffron','silph-co','Silph Co.'),
  path('lavender','route-12','Route 12'), path('route-11','route-12','Relaxo am Steg','flute'),
  path('route-12','route-13','Route 12 · Süd','flute'), path('route-13','route-14','Route 13'),
  path('route-14','route-15','Route 14'), path('route-15','fuchsia','Route 15'),
  path('celadon','route-16','Relaxo am Radweg','flute'), path('route-16','route-17','Route 17 · Radweg'),
  path('route-17','route-18','Route 18',undefined,190,[{x:1600,y:1300}]),
  path('route-18','fuchsia','Route 18'), path('fuchsia','safari-zone','Safari-Tor'),
  path('fuchsia','route-19','Route 19','surf',240),
  path('route-19','seafoam-islands','Route 20 · Ost','surf',240),
  path('seafoam-islands','route-20','Seeschaum-Durchgang','strength',220),
  path('route-20','cinnabar','Route 20 · West','surf',240),
  path('pallet','route-21','Route 21','surf',240), path('route-21','cinnabar','Route 21','surf',240),
  path('cinnabar','pokemon-mansion','Pokémon-Villa'), path('viridian','route-22','Route 22'),
  path('route-22','route-23','Orden-Tore','badges8'), path('route-23','victory-road','Siegesstraße','strength'),
  path('victory-road','indigo','Indigo-Aufstieg','victory-pass'),
  path('cerulean','cerulean-cave','Azuria-Höhle','champion',160),
];
export const KANTO_CONNECTIONS = KANTO_ROUTES;

export const KANTO_GYMS:readonly KantoGym[] = [
  {id:'brock',locationId:'pewter',leader:'Rocko',name:'Arena von Marmoria',type:'rock',badge:'Felsorden',order:1,team:[74,95],levels:[12,14],requiredUnlocks:['pokedex'],rewardUnlocks:['boulder-badge']},
  {id:'misty',locationId:'cerulean',leader:'Misty',name:'Arena von Azuria',type:'water',badge:'Quellorden',order:2,team:[120,121],levels:[18,21],requiredUnlocks:['moon-pass'],rewardUnlocks:['cascade-badge']},
  {id:'surge',locationId:'vermilion',leader:'Major Bob',name:'Arena von Orania',type:'electric',badge:'Donnerorden',order:3,team:[100,25,26],levels:[21,18,24],requiredUnlocks:['cut'],rewardUnlocks:['thunder-badge']},
  {id:'erika',locationId:'celadon',leader:'Erika',name:'Arena von Prismania',type:'grass',badge:'Farborden',order:4,team:[71,114,45],levels:[29,24,29],requiredUnlocks:['cut'],rewardUnlocks:['rainbow-badge','drink']},
  {id:'koga',locationId:'fuchsia',leader:'Koga',name:'Arena von Fuchsania',type:'poison',badge:'Seelenorden',order:5,team:[109,89,109,110],levels:[37,39,37,43],requiredUnlocks:['flute'],rewardUnlocks:['soul-badge']},
  {id:'sabrina',locationId:'saffron',leader:'Sabrina',name:'Arena von Saffronia',type:'psychic',badge:'Sumpforden',order:6,team:[64,122,49,65],levels:[38,37,38,43],requiredUnlocks:['silph-liberated'],rewardUnlocks:['marsh-badge']},
  {id:'blaine',locationId:'cinnabar',leader:'Pyro',name:'Arena der Zinnoberinsel',type:'fire',badge:'Vulkanorden',order:7,team:[58,77,78,59],levels:[42,40,42,47],requiredUnlocks:['secret-key'],rewardUnlocks:['volcano-badge']},
  {id:'giovanni',locationId:'viridian',leader:'Giovanni',name:'Arena von Vertania',type:'ground',badge:'Erdorden',order:8,team:[111,51,31,34,112],levels:[45,42,44,45,50],requiredUnlocks:['volcano-badge','marsh-badge','soul-badge'],rewardUnlocks:['earth-badge','badges8']},
];

/** Red/Blue teams. The fixed Champion party is the Blastoise variant. */
export const KANTO_ELITE_FOUR:readonly KantoLeagueTrainer[] = [
  {id:'lorelei',name:'Lorelei',type:'ice',team:[87,91,80,124,131],levels:[54,53,54,56,56]},
  {id:'bruno',name:'Bruno',type:'fighting',team:[95,107,106,95,68],levels:[53,55,55,56,58]},
  {id:'agatha',name:'Agathe',type:'ghost',team:[94,42,93,24,94],levels:[56,56,55,58,60]},
  {id:'lance',name:'Siegfried',type:'dragon',team:[130,148,148,142,149],levels:[58,56,56,60,62]},
];
export const KANTO_CHAMPION:KantoLeagueTrainer =
  {id:'champion',name:'Blau',type:'normal',team:[18,65,112,59,103,9],levels:[61,59,61,61,63,65]};

const milestone = (id:string,title:string,locationId:string,description:string,objective:string,
  team:readonly number[],requires:readonly string[],rewardUnlocks:readonly string[],waves=3,duration=12,coins=60,
  kind:KantoStoryMilestone['kind']='quest'):KantoStoryMilestone =>
  ({id,title,locationId,kind,description,objective,team,requires,rewardUnlocks,waves,duration,coins});
const gymStory = (id:string,requires:readonly string[]):KantoStoryMilestone => {
  const gym=KANTO_GYMS.find(g=>g.id===id)!;
  return milestone(id,`${gym.leader} · ${gym.badge}`,gym.locationId,
    `Fordere ${gym.leader} in der ${gym.name} heraus. Das Arenateam greift in aufeinanderfolgenden Wellen an.`,
    `Besiege das komplette Arenateam und gewinne den ${gym.badge}.`,gym.team,requires,gym.rewardUnlocks,
    gym.team.length,10,80+gym.order*25,'gym');
};

/** Deliberately guided survivor campaign, not a claim that Red/Blue enforces this one gym order. */
export const KANTO_STORY:readonly KantoStoryMilestone[] = [
  milestone('oak-parcel','Eichs Paket','viridian','Der Markt hat eine Lieferung für Professor Eich. Hilf dem Lieferanten im Markt, damit er dir das Paket übergibt.',
    'Halte die wilden Pokémon vom Lieferplatz fern.',[19,16],[],['parcel'],2,8,35),
  milestone('oak-return','Zurück nach Alabastia','pallet','Bring Professor Eich sein Paket. Eine kurze Teamprüfung in seinem Labor schließt deine Vorbereitung ab.',
    'Schließe Eichs Fang- und Kampftraining ab.',[16,19],['oak-parcel'],['pokedex'],2,8,40),
  gymStory('brock',['oak-return']),
  milestone('mt-moon','Das Fossil im Mondberg','mt-moon','Team Rocket plündert den Mondberg. Kämpfe dich durch die Höhle und sichere das Fossil.',
    'Wehre drei Rocket-Wellen ab und öffne den östlichen Ausgang.',[41,19,27,20],['brock'],['moon-pass','fossil'],3,12,80),
  gymStory('misty',['mt-moon']),
  milestone('bill','Bills Experiment','sea-cottage','Bills Experiment ist außer Kontrolle geraten. Beschütze das Küstenhaus während der Rückverwandlung.',
    'Verteidige Bills Anlage und erhalte das Schiffsticket.',[63,43,69],['misty'],['ticket'],3,10,75),
  milestone('ss-anne','Der Kapitän der M.S. Anne','ss-anne','Auf dem Deck wartet dein Rivale. Gewinne die Deckkämpfe und hilf dem Kapitän.',
    'Besiege das Rivalenteam und erhalte Zerschneider.',[17,20,64,8],['bill'],['cut'],4,10,95,'rival'),
  gymStory('surge',['ss-anne']),
  milestone('rock-tunnel','Durch den Felstunnel','rock-tunnel','Sichere drei Lagerpunkte im dunklen Felstunnel und schütze die Reisenden nach Lavandia.',
    'Überstehe drei Höhlenwellen und erschließe den Südausgang.',[41,74,66,95],['surge'],['tunnel-pass','flash'],3,14,100),
  milestone('tower-mystery','Das Geheimnis des Turms','pokemon-tower','Im Pokémon-Turm bleiben die Geister verborgen. Ein erster Vorstoß führt zur Spur des Silph Scope in Prismania.',
    'Halte den Eingang frei und sichere die Spur nach Prismania.',[92,104],['rock-tunnel'],['tower-clue'],2,12,80),
  milestone('rocket-hideout','Unter der Spielhalle','rocket-hideout','Folge der Spur ins Rocket-Versteck. Die letzte Welle wird von Giovannis Boden-Pokémon angeführt.',
    'Besiege die Rocket-Wachen und Giovanni; sichere das Silph Scope.',[20,109,95,111,115],['tower-mystery'],['scope'],4,13,150),
  gymStory('erika',['rocket-hideout']),
  milestone('tower-rescue','Mr. Fuji und die Pokéflöte','pokemon-tower','Mit dem Silph Scope erkennst du die Geister. Befreie Mr. Fuji von den Rockets an der Turmspitze.',
    'Besänftige Knogga und vertreibe drei Rocket-Gruppen.',[105,42,109,96,20],['erika'],['flute'],4,12,150),
  gymStory('koga',['tower-rescue']),
  milestone('safari','Das Geheimhaus der Safari-Zone','safari-zone','Finde das Geheimhaus und die Goldzähne des Wärters. Halte den Pfad durch die Safari-Zone offen.',
    'Bewältige drei Safari-Wellen und erhalte Surfer und Stärke.',[102,111,123,127,128],['koga'],['surf','strength'],3,15,140),
  milestone('silph-co','Saffronia befreien','silph-co','Team Rocket hält die Silph Co. besetzt. Befreie die Angestellten und besiege Giovanni.',
    'Schlage vier Rocket-Wellen zurück und befreie die Firma.',[100,82,110,31,111,115],['safari'],['silph-liberated','master-ball'],4,15,180),
  gymStory('sabrina',['silph-co']),
  milestone('mansion','Der Schlüssel der Pokémon-Villa','pokemon-mansion','Verlassene Labore verbergen den Schlüssel zur Arena der Zinnoberinsel. Sichere die Forschungsräume.',
    'Sichere drei Laborbereiche und finde den Geheimschlüssel.',[88,89,109,110,77],['sabrina'],['secret-key'],3,15,160),
  gymStory('blaine',['mansion']),
  gymStory('giovanni',['blaine']),
  milestone('victory-road','Die Siegesstraße','victory-road','Acht Orden öffnen die Tore. Räume die Engstellen der Siegesstraße und erreiche das Indigo-Plateau.',
    'Bestehe vier Bergwellen und öffne den Weg zur Liga.',[67,75,95,42,68],['giovanni'],['victory-pass'],4,16,200),
  ...KANTO_ELITE_FOUR.map((trainer,index)=>milestone(trainer.id,`Top Vier · ${trainer.name}`,'indigo',
    `${trainer.name} fordert dich im ${index+1}. Ligakampf heraus. Besiege jedes Pokémon des Teams.`,
    `Gewinne alle fünf Wellen gegen ${trainer.name}.`,trainer.team,
    [index?KANTO_ELITE_FOUR[index-1]!.id:'victory-road'],[`${trainer.id}-defeated`],5,12,240+index*30,'league')),
  milestone('champion','Der neue Champ','indigo','Blau hat die Top Vier bereits besiegt. Erobere deinen Platz in der Ruhmeshalle.',
    'Besiege Blaus vollständiges Team in sechs Wellen.',KANTO_CHAMPION.team,['lance'],['champion'],6,14,500,'league'),
  milestone('mewtwo','Nachspiel · Die Azuria-Höhle','cerulean-cave','Als Champ darfst du die Azuria-Höhle betreten. Tief im Inneren wartet Mewtu.',
    'Überstehe zwei Höhlenwellen und stelle dich Mewtu.',[112,113,150],['champion'],['mewtwo-sanctuary'],3,16,300),
];

export const KANTO_UNLOCK_NAMES:Readonly<Record<string,string>> = {
  parcel:'Eichs Paket',pokedex:'Pokédex',ticket:'Bootsticket',cut:'Zerschneider',flash:'Blitz',
  scope:'Silph Scope',flute:'Pokéflöte',surf:'Surfer',strength:'Stärke',drink:'Getränk für die Torwachen',
  'moon-pass':'Mondberg-Ausgang','tunnel-pass':'Felstunnel-Ausgang','tower-clue':'Spur zur Spielhalle',
  'silph-liberated':'Silph Co. befreit','secret-key':'Geheimschlüssel','victory-pass':'Liga-Zugang',
  'boulder-badge':'Felsorden','cascade-badge':'Quellorden','thunder-badge':'Donnerorden',
  'rainbow-badge':'Farborden','soul-badge':'Seelenorden','marsh-badge':'Sumpforden',
  'volcano-badge':'Vulkanorden','earth-badge':'Erdorden',badges8:'Acht Orden',champion:'Champ-Titel',
  fossil:'Mondberg-Fossil','master-ball':'Meisterball','mewtwo-sanctuary':'Mewtus Zuflucht',
};
export const kantoLocation = (id:string):KantoLocation|undefined => KANTO_LOCATIONS.find(place=>place.id===id);
