import type {Engine,Enemy,Point,RunState} from './engine.ts';
import type {BossStyle} from './bosses.ts';
import {KANTO_LOCATIONS,KANTO_STORY} from './kanto-world-catalog.ts';
/** Authored encounter budgets, never scaled to the player's current damage or HP. */
export const STORY_TRIALS={
 'oak-parcel':{hp:500,mechanic:'aim',style:'slash',name:'Lieferplatz',hint:'Ein einzelner gezielter Einschlag. Laufe aus dem Kreis.'},
 'oak-return':{hp:750,mechanic:'sweep',style:'slash',name:'Eichs Prüfung',hint:'Seitlich ausweichen: Die zweite Bahn folgt verzögert.'},
 brock:{hp:11200,mechanic:'fault',style:'stone',name:'Bruchlinien',hint:'Versetzte Felsspalten: Zwischen den Bahnen bleiben breite Korridore.'},
 'mt-moon':{hp:8500,mechanic:'fall',style:'stone',name:'Höhleneinsturz',hint:'Verlasse die alten Einschlagpunkte; die nächsten Brocken folgen seitlich.'},
 misty:{hp:13000,mechanic:'tide',style:'water',name:'Gezeitenwechsel',hint:'Erst der Flutring, dann das Zentrum. Wechsle rechtzeitig nach außen.'},
 bill:{hp:10500,mechanic:'mirror',style:'psychic',name:'Instabile Apparatur',hint:'Zwei versetzte Strahlen kreuzen sich. Suche die offenen Quadranten.'},
 'ss-anne':{hp:11500,mechanic:'sweep',style:'slash',name:'Deckduell',hint:'Zwei breite Angriffsbahnen wechseln ihre Richtung.'},
 surge:{hp:14000,mechanic:'circuit',style:'lightning',name:'Stromkreis',hint:'Blitzfelder zünden in zwei Gruppen. Merke dir ihre Reihenfolge.'},
 'rock-tunnel':{hp:13000,mechanic:'fault',style:'stone',name:'Tunnelbeben',hint:'Felsspalten wandern quer durch den Kampfbereich.'},
 'tower-mystery':{hp:12000,mechanic:'haunt',style:'shadow',name:'Geisterkreis',hint:'Der Schattenkreis lässt zwei Lücken offen. Das Zentrum ist nicht dauerhaft sicher.'},
 'rocket-hideout':{hp:18000,mechanic:'stampede',style:'stone',name:'Rocket-Durchbruch',hint:'Ein breiter Ansturm gefolgt von seitlichen Einschlägen.'},
 erika:{hp:17000,mechanic:'thorn',style:'vines',name:'Dornenblüte',hint:'Dornen öffnen sich im Kreis. Bleibe zwischen den Blütenfeldern.'},
 'tower-rescue':{hp:16000,mechanic:'haunt',style:'shadow',name:'Fluch der Turmspitze',hint:'Versetzte Schattenkreise sperren alte Standorte ab.'},
 koga:{hp:19000,mechanic:'venom',style:'spores',name:'Giftstaffel',hint:'Drei Giftfelder folgen versetzt. Laufe durch die noch freien Seiten.'},
 safari:{hp:18000,mechanic:'stampede',style:'slash',name:'Wilde Jagd',hint:'Weiche quer zum Ansturm aus, dann aus der Nachschlagzone.'},
 'silph-co':{hp:22000,mechanic:'circuit',style:'lightning',name:'Sicherheitsnetz',hint:'Die Generatorfelder zünden abwechselnd, danach folgt eine Querbahn.'},
 sabrina:{hp:22000,mechanic:'mirror',style:'psychic',name:'Spiegelraum',hint:'Gedrehte Strahlen treffen nacheinander. Der Schnittpunkt bleibt gefährlich.'},
 mansion:{hp:21000,mechanic:'venom',style:'flame',name:'Laborbrand',hint:'Drei Brandherde zünden nacheinander an alten Positionen.'},
 blaine:{hp:24000,mechanic:'inferno',style:'flame',name:'Feuerkorridore',hint:'Seitliche Feuerbahnen lassen die Mitte offen – bis der Nachschlag kommt.'},
 giovanni:{hp:24000,mechanic:'fault',style:'stone',name:'Tektonischer Bruch',hint:'Längs- und Querspalten wechseln. Halte deinen Dash für die späte Querbahn.'},
 'victory-road':{hp:25000,mechanic:'fall',style:'stone',name:'Letzter Aufstieg',hint:'Einschläge wandern durch den Bereich; bleibe nicht am Rand stehen.'},
 lorelei:{hp:28000,mechanic:'frost',style:'ice',name:'Frostkreise',hint:'Zwei Frostkreise zünden nacheinander. Innen und außen sind abwechselnd frei.'},
 bruno:{hp:30000,mechanic:'gauntlet',style:'stone',name:'Doppelschlag',hint:'Zwei Hiebe und ein verspäteter Bodenschlag. Spare den Dash für den Abschluss.'},
 agatha:{hp:28000,mechanic:'haunt',style:'shadow',name:'Schattenlabyrinth',hint:'Lücken im Geisterkreis und ein später Fluch auf deinem alten Standort.'},
 lance:{hp:32000,mechanic:'dragon',style:'solar',name:'Drachenfächer',hint:'Der Strahlenfächer zündet von einer Seite zur anderen.'},
 champion:{hp:34000,mechanic:'champion',style:'psychic',name:'Champ-Kombination',hint:'Blau kombiniert Bruchlinien, Flutringe und Strahlen in wechselnder Folge.'},
 mewtwo:{hp:72000,mechanic:'mind',style:'psychic',name:'Gedankensturm',hint:'Gedrehte Psychobahnen und ein später Kreis prüfen zwei Ausweichbewegungen.'},
} as const;
export const trialProfile=(id?:string)=>id?STORY_TRIALS[id as keyof typeof STORY_TRIALS]:undefined;
export function storyBossHealth(s:RunState,id:string,wave:number){
 const p=trialProfile(id)!;
 // Later team members are tougher, without multiplying every league member by campaign length.
 const q=KANTO_STORY.find(q=>q.id===id)!,ace=wave===q.waves-1?1.15:.9;
 const endurance=s.difficulty==='master'?(id==='mewtwo'?4:q.kind==='league'?2.4:q.kind==='quest'?(id.startsWith('oak-')?1.8:4):2.2):s.difficulty==='veteran'?1.15:1;
 return Math.round(p.hp*ace*endurance*({relaxed:.07,standard:.22,veteran:.64,master:1}[s.difficulty]));
}
export function trialMechanic(e:Engine,foe:Enemy,phase:number,cycle:number){
 const s=e.s,profile=trialProfile(foe.storyId);if(!profile)return;
 if(s.difficulty==='relaxed'||s.difficulty==='standard'&&phase<2)return;
 const q=KANTO_STORY.find(q=>q.id===foe.storyId)!,center=KANTO_LOCATIONS.find(l=>l.id===q.locationId)!;
 const t={x:s.trainer.x,y:s.trainer.y},angle=Math.atan2(t.y-foe.y,t.x-foe.x);
 const style=profile.style as BossStyle,power=foe.storyId?.startsWith('oak-')?13:19+phase*2;
 const warning=1.65,extra=phase*.05;
 const circle=(p:Point,r:number,delay=0)=>e.hazard('circle',p,0,r,0,warning+delay,power,style);
 const ring=(p:Point,r:number,delay=0)=>e.hazard('ring',p,0,r,16,warning+delay,power,style);
 const line=(p:Point,a:number,length=520,width=20,delay=0)=>e.hazard('line',p,a,length,width,warning+delay,power,style);
 let mechanic:string=profile.mechanic;
 if(mechanic==='champion')mechanic=['fault','tide','dragon'][cycle%3];
 switch(mechanic){
  case 'aim':circle(t,45);break;
  case 'sweep':[-.35,.35].forEach((v,i)=>line(foe,angle+v,430,18,i*.6));break;
  case 'fault':{
   const a=cycle%2?Math.PI/2:0,side={x:-Math.sin(a),y:Math.cos(a)};
   for(const sign of [-1,1])line({x:center.x-Math.cos(a)*260+side.x*100*sign,y:center.y-Math.sin(a)*260+side.y*100*sign},a,520,17,sign===1?.5:0);
   break;
  }
  case 'fall':[-1,0,1].forEach((v,i)=>circle({x:t.x+v*85,y:t.y+(i%2)*65},34,.3*i));break;
  case 'tide':ring(t,110);circle(t,48,.85+extra);break;
  case 'circuit':for(let i=0;i<4;i++){const a=i*Math.PI/2+cycle*.4;circle({x:center.x+Math.cos(a)*165,y:center.y+Math.sin(a)*165},42,(i%2)*.65);}break;
  case 'thorn':for(let i=0;i<6;i++){const a=i*Math.PI/3+cycle*.3;circle({x:t.x+Math.cos(a)*150,y:t.y+Math.sin(a)*150},32,(i%2)*.5);}break;
  case 'venom':[-1,0,1].forEach((v,i)=>circle({x:t.x+Math.cos(angle+Math.PI/2)*v*92,y:t.y+Math.sin(angle+Math.PI/2)*v*92},37,i*.5));break;
  case 'mirror':case 'mind':
   [Math.PI/4+cycle*.3,-Math.PI/4+cycle*.3].forEach((a,i)=>line({x:t.x-Math.cos(a)*230,y:t.y-Math.sin(a)*230},a,460,18,i*.7));
   if(mechanic==='mind')circle(t,52,1.4);break;
  case 'inferno':[-1,1].forEach((v,i)=>line({x:center.x+v*150,y:center.y-250},Math.PI/2,500,24,i*.45));if(phase>0)circle(t,46,1.1);break;
  case 'stampede':line(foe,angle,500,42);[-1,1].forEach(sign=>circle({x:t.x-Math.sin(angle)*90*sign,y:t.y+Math.cos(angle)*90*sign},40,.75));break;
  case 'frost':ring(center,110);ring(center,215,.6);break;
  case 'gauntlet':[-.45,.45].forEach((v,i)=>line(foe,angle+v,500,25,i*.5));circle(t,55,1.2);break;
  case 'haunt':for(let i=0;i<6;i++){if(i===(cycle%6)||i===(cycle+3)%6)continue;const a=i*Math.PI/3;circle({x:t.x+Math.cos(a)*115,y:t.y+Math.sin(a)*115},33,(i%2)*.4);}break;
  case 'dragon':[-.6,0,.6].forEach((v,i)=>line(foe,angle+v,600,22,i*.45));break;
 }
 // Master leaders also intercept the current heading. The destination is frozen
 // now and remains visible for 1.1 s: changing direction beats the prediction.
 // This prevents continuous circle-running from bypassing an entire encounter.
 if(s.difficulty==='master'&&cycle%3===0){
  const lead=140*(1+Math.min(.35,(s.passives.speed??0)*.04))*.95;
  const predicted={x:t.x+s.trainer.dx*lead,y:t.y+s.trainer.dy*lead};
  e.hazard('circle',predicted,0,70+phase*3,0,1.1,power,style);
  e.fx('quest',predicted,0xffd888,24,.9,{label:'Vorhalt · Richtung wechseln'});
 }
 e.fx('quest',foe,0xffd888,40,.8,{label:profile.name});
}
