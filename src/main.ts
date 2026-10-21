import {mapControls,selectMapPlace} from './map-controls.ts';
import {drawLocalMap} from './local-map.ts';
import {difficulty,isDifficulty,type Difficulty} from './difficulty.ts';
import {journalMarkup,recordProgress} from './progress.ts';
import {focusAt} from './combat-visuals.ts';
import {BOSSES} from './bosses.ts';
import {SimulationClock} from './simulation-clock.ts';
import type {RunMode} from './world.ts';
import {worldMapMarkup,placeCardMarkup} from './world-ui.ts';
import {storyStage,badgeCount,continueStory} from './story.ts';
import {KANTO_LOCATIONS,KANTO_UNLOCK_NAMES} from './kanto-world-catalog.ts';
import {dexMarkup,type DexMode} from './dex-ui.ts';
import {QUESTS,type QuestId} from './quests.ts';
import './ui-v2.css';
import {Engine,newRun,activeCapacity,knownMoves,xpNeeded} from './engine.ts';
import type {RunState} from './engine.ts';
import {SPECIES,STARTERS,POIS,PASSIVES,STONES,AVAILABLE_STONES,TYPE_NAME,WORLD_SIZE} from './data.ts';
import {SaveStore,defaultProfile,envelope,decodeEnvelope,validateState,saveSlot,decodeBackup,type BackupData} from './save.ts';
import type {Profile} from './save.ts';
import {TRAINERS,trainerById} from './trainer-art.ts';
import {pokemonImage} from './ui-components.ts';
import {homeMarkup,hudMarkup,updateHudDom,teamBody,upgradeCards} from './ui-v2.ts';
import {createView} from './view.ts';
import {GameAudio} from './audio.ts';
import {applyHudScale,normalizeSettings} from './settings.ts';
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML='<div id="world" aria-label="Spielfeld Auenwald"></div><div id="ui"></div><div id="modal"></div><div id="toast" role="status"></div><div id="announcer" class="sr-only" aria-live="polite"></div>';
const ui=document.querySelector<HTMLDivElement>('#ui')!,modal=document.querySelector<HTMLDivElement>('#modal')!,toast=document.querySelector<HTMLDivElement>('#toast')!;
const store=new SaveStore();
let profile:Profile=defaultProfile(),saved:RunState|null=null,engine:Engine|null=null;
let panel:'camp'|'none'|'team'|'pause'|'dex'|'help'|'settings'|'confirm'|'map'|'import-confirm'|'journal'='camp',previousPanel:'camp'|'pause'='camp';
let activeMap:ReturnType<typeof mapControls>;
let dexMode:DexMode='browse',mapZoom=1,selectedMapPlace:string|null=null,pendingImport:RunState|null=null;
let selectedDifficulty:Difficulty='standard',pendingBackup:BackupData|null=null;
let selectedTrainer='red',assetsReady=false;
let selectedStarterShiny=false;
let selectedStarter=1,mode:RunMode='learn',swapTarget:number|null=null,lastHud=0,lastAutosave=0;
let ready=false,writable=false,saveError='',lastSaved='',saveChain=Promise.resolve(),lastScreen='',lastMessage='',resultRecorded=false,toastTimer=0;
let releaseLock:()=>void=()=>{};

const esc=(s:unknown)=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]!));
const time=(n:number)=>`${Math.floor(n/60).toString().padStart(2,'0')}:${Math.floor(n%60).toString().padStart(2,'0')}`;
const btn=(action:string,text:string,cls='',attrs='')=>`<button type="button" data-action="${action}" class="${cls}" ${attrs}>${text}</button>`;
const image=(id:number,cls='')=>pokemonImage(id,cls,true);
function announce(text:string){document.querySelector('#announcer')!.textContent=text;}
function message(text:string,duration=3500){toast.textContent=text;window.clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>toast.textContent='',duration);announce(text);}
function dialog(title:string,subtitle:string,body:string,foot='',cls=''){
 modal.innerHTML=`<div class="veil"><section class="dialog ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="dialog-head"><div><div class="eyebrow">Pokémon Survivors · ${engine?.s.mode==='bossrush'?'Prüfungsarena':engine?.s.mode==='story'?'Kanto':'Auenwald'}</div><h2>${title}</h2><p>${subtitle}</p></div>${panel==='none'?'':btn('close','✕','close','aria-label="Fenster schließen"')}</div>${body}${foot?`<div class="dialog-foot">${foot}</div>`:''}</section></div>`;
 modal.querySelector<HTMLElement>('button:not(:disabled)')?.focus({preventScroll:true});
}
function home(){
 modal.innerHTML='';
 ui.innerHTML=homeMarkup({starter:selectedStarter,shiny:selectedStarterShiny,trainer:selectedTrainer,mode,difficulty:selectedDifficulty,profile,saved,ready,writable,assetsReady,error:saveError});
}
function hud(){if(engine)ui.innerHTML=hudMarkup(engine.s);}
function updateHud(){if(engine&&panel!=='camp')updateHudDom(engine);}
function showTeam(){
 if(!engine)return;
 const s=engine.s,locked=s.time<s.swapReady;
 dialog('Dein Pokémon-Team',locked?'Wechsel wieder in '+Math.ceil(s.swapReady-s.time)+' Sekunden Spielzeit. Die Zeit pausiert.':'Jeder Partner führt eine charakteristische Attacke mit acht Rängen. Ein Teamwechsel hat 20 Sekunden Abklingzeit.',
 teamBody(engine,swapTarget),btn('close','Zurück ins Abenteuer','primary'),'wide');
}
function showPause(){
 const body=`<div class="stack">${btn('close','Weiterspielen','primary')}${btn('save-camp','Speichern & ins Camp')}${btn('map','Karte & Reisetagebuch')}${engine?.s.story.active?btn('abort-story','Aktuelle Prüfung verlassen','quiet'):''}${btn('export','Lauf als Datei exportieren')}${btn('backup','Alle Spielstände & Profil sichern')}${btn('journal','Fortschrittsbuch')}${btn('settings','Einstellungen · HUD & Klang')}<label class="settings-row"><span>Spielklänge & Pokémon-Rufe</span><input type="checkbox" data-setting="sound" ${profile.settings.sound?'checked':''}></label><label class="settings-row"><span>Volle Kampfeffekte</span><input type="checkbox" data-setting="effects" ${profile.settings.effects?'checked':'' }></label><p class="save-state">${saveError?esc(saveError):lastSaved?'Zuletzt gespeichert: '+esc(lastSaved):'Automatisches Speichern alle 15 Sekunden und nach wichtigen Entscheidungen.'}</p><div class="row">${btn('help','Steuerung & Hilfe','quiet')}${btn('import','Spielstand importieren','quiet')}</div></div>`;
 dialog('Eine kurze Pause.','Dein Abenteuer wartet. Sämtliche Spielzeiten sind angehalten.',body,'','narrow');
}
function showDex(){
 dialog('Kanto-Pokédex',`${profile.caught.length} / 151 registriert · ${dexMode==='starter'?'Startpartner wählen':dexMode==='target'?'Forschungsziel wählen':'Deine Sammlung'}`,dexMarkup(profile,dexMode,writable),btn('close','Auswahl schließen','primary'),'dex-dialog');
}
function showSettings(){
 dialog('Deine Einstellungen','Passe die Anzeigen und Spielklänge an. Änderungen werden lokal gespeichert.',
 `<div class="stack"><label class="range-setting"><span>HUD-Größe <output id="hud-scale-value">${Math.round(profile.settings.hudScale*100)} %</output></span><input aria-label="HUD-Größe" type="range" min="70" max="150" step="5" value="${profile.settings.hudScale*100}" data-setting="hudScale"><small>70 % · kompakt <span>150 % · groß</span></small></label><label class="settings-row"><span>Spielklänge & Pokémon-Rufe</span><input type="checkbox" data-setting="sound" ${profile.settings.sound?'checked':''}></label><label class="range-setting"><span>Lautstärke <output id="volume-value">${Math.round(profile.settings.volume*100)} %</output></span><input aria-label="Lautstärke" type="range" min="0" max="100" step="5" value="${profile.settings.volume*100}" data-setting="volume"></label><label class="settings-row"><span>Volle Kampfeffekte</span><input type="checkbox" data-setting="effects" ${profile.settings.effects?'checked':''}></label>${btn('preview-sound','Spielklang & Pikachu-Ruf anhören','small')}<p class="muted">Klassische Pokémon-Rufe und neue mehrstimmige Spielklänge im Handheld-Stil. Die HUD-Größe betrifft Lebenspunkte, Team, Erfahrung und Karte.</p></div>`,btn('close','Fertig','primary'),'narrow');
}
function showHelp(){
 dialog('Zusammen durch den Wald.','Du bewegst den Trainer. Deine aktiven Pokémon greifen automatisch an.',
 `<div class="help-grid"><div><h3>Bewegen & ausweichen</h3><p>WASD oder Pfeiltasten bewegen dich. Leertaste gibt einen kurzen Ausweichschritt mit Unverwundbarkeit während des Dashs und kurz danach. Das Team folgt dir. Bossattacken kosten deine Pokémon nur dann Ausdauer, wenn du selbst getroffen wirst. Nach fünf Sekunden ohne Treffer erholen sich aktive Partner.</p></div><div><h3>Neue Partner</h3><p>Alle 151 Arten sind erreichbar. Im Camp wählst du ein Forschungsziel für die erste Begegnung. Besiege es, gehe hin und drücke E. Ein Ball garantiert den Fang.</p></div><div><h3>Team & Entwicklung</h3><p>Tab öffnet das Team. Bei Trainerlevel 4 und 8 werden weitere Aktivplätze frei. Aktive, einsatzfähige Pokémon erhalten eigene EP für besiegte Gegner und abgeschlossene Aufgaben. Ihre Entwicklung richtet sich nach ihrem eigenen Pokémon-Level; Reserven erhalten keine EP. Das Teamfenster zeigt alle Entwicklungsbedingungen. Evoli hat drei wählbare Zweige. Tausch-Entwicklungen nutzen die Link-Marke vom Ranger.</p></div><div><h3>Kanto-Story & Weltkarte</h3><p>M öffnet Karte und Reisetagebuch. Reise von Alabastia zum Markt in Vertania. E öffnet Gebäudetüren. Sprich drinnen mit den Personen: Schwester Joy füllt im Center nur die Pokémon-Ausdauer auf. Deine eigenen KP bleiben unverändert. Der Markt verkauft Ausrüstung und Arenaleiter starten ihre Kämpfe in der Arena. Der Ausgang ist unten im Raum. Tränke sind selten; plane Rastpunkte vor langen Routen ein.</p></div><div><h3>Drei Waldziele</h3><p>Rangerlager: Wachen besiegen, drei verstreute Kisten sichern und zurückkehren. Pollengarten: drei Wellen schlagen und die Blüten schützen. Alter Baum: drei Dornenherde zerstören und Bibor besiegen. Jeder Auftrag gibt Münzen, EP, Bälle, eine Belohnungswahl und einen Segen für den Lauf.</p></div><div><h3>Der Endkampf</h3><p>Nach 8 oder 20 Minuten erscheint ein Wächter. Der Lernlauf endet mit Bisaflor; Expedition und Endlos wechseln zwischen 15 Bossarten. Verlasse die goldenen Warnflächen vor dem Einschlag. Auf Standard bleiben eine bzw. zwei Minuten. Veteran verdoppelt, Meister vervierfacht dieses Zeitfenster für die längeren Bosskämpfe.</p></div><div><h3>Seltene Talente</h3><p>Zusätzlich zum Training kannst du bis zu drei Talente finden: Nachbild und Sammelwelle, epische Echos und Typenresonanz oder legendäre Zeitfalte, Phönixfeder und Dreiklang. Sie verändern deine Spielweise. Auslöser und Grenzen stehen auf jeder Karte und im Teamfenster.</p></div><div><h3>Lokal gespeichert</h3><p>Der Lauf speichert automatisch zwei wechselnde Kopien. Esc öffnet Speichern, Export und Import. Komplettsicherung im Camp oder Pausenmenü umfasst Profil und alle drei Speicherplätze. Beim Fensterwechsel läuft das Abenteuer weiter. Esc pausiert bewusst.</p></div></div>`,btn('close','Verstanden','primary'));
}
function levelDialog(){
 const s=engine!.s;
 dialog('Level '+s.level+' erreicht!', 'Training verbessert Ränge. Seltene Talente verleihen neue Spieleffekte · maximal drei pro Lauf.',upgradeCards(s),
 '<div class="row">'+btn('reroll','Neu würfeln · '+s.rerolls,'small',s.rerolls?'':'disabled')+btn('skip','Auslassen · '+s.skips,'small',s.skips?'':'disabled')+'</div><span class="muted">Diese Verbesserung gilt für deinen aktuellen Lauf.</span>');
}
function questDialog(){
 const id=engine!.s.pendingId as QuestId,q=QUESTS[id];
 dialog(q.title,q.story,`<ol class="quest-steps">${q.steps.map(text=>'<li>'+text+'</li>').join('')}</ol><div class="quest-prize"><b>Deine Belohnung</b><p>2 Pokébälle · ${q.coins} Münzen · ${Math.round(q.xp*100)} % einer EP-Stufe</p><strong>${q.perk}</strong><p>Zusätzlich: Training, Entwicklungsmittel oder Ausrüstung nach Wahl.</p></div>`,btn('start-quest','Auftrag annehmen','primary',`data-id="${id}"`)+btn('decline','Später','quiet'),'narrow');
}
function rewardDialog(){
 const s=engine!.s,id=s.pendingId as QuestId,q=QUESTS[id];
 dialog('Auftrag erfüllt: '+q.title,'Öffne den Waldschatz und wähle deinen zusätzlichen Fund.',
 `<div class="quest-prize"><b>Garantiert: 2 Bälle · ${q.coins} Münzen · ${Math.round(q.xp*100)} % einer EP-Stufe</b><p>${q.perk}</p></div><div class="reward-grid">${s.party.filter(p=>p.ranks[0]<8).map(p=>btn('reward',image(p.species)+`<b>${SPECIES[p.species].name}: Training</b><small>${SPECIES[p.species].weapon.name} · R${p.ranks[0]} → R${p.ranks[0]+1}</small>`,'',`data-kind="training" data-id="${p.uid}"`)).join('')}${Object.entries(AVAILABLE_STONES).map(([id,name])=>btn('reward',`<b>${name}</b><small>Entwicklungsmittel für die Tasche</small>`,'',`data-kind="stone" data-id="${id}"`)).join('')}${btn('reward','<b>Große Versorgung</b><small>Zusätzlich 15 Trainer-KP</small>','','data-kind="heal"')}${PASSIVES.filter(p=>engine!.canPassive(p.id)).slice(0,2).map(p=>btn('reward',`<b>${p.name}</b><small>${p.description((s.passives[p.id]??0)+1)}</small>`,'',`data-kind="passive" data-id="${p.id}"`)).join('')}</div>`);
}
function captureDialog(){
 const s=engine!.s,e=s.encounters.find(c=>c.id===s.pendingId)!;
 const existing=s.party.find(p=>p.species===e.species),duplicate=!!existing&&(!e.shiny||!!existing.shiny),full=s.party.length>=6&&!existing;
 dialog(e.shiny?'✦ Eine seltene Shiny-Begegnung!':'Eine neue Begegnung.',SPECIES[e.species].name+' ist bereit, mit dir zu reisen.',
 `${pokemonImage(e.species,'capture-portrait',true,!!e.shiny)}<div class="center"><h2>${SPECIES[e.species].name}</h2><p class="muted">${SPECIES[e.species].role} · ${duplicate?'Bereits im Team: Forschung ohne Ballverbrauch.':'Garantierter Fang · 1 Pokéball · '+s.balls+' verfügbar'}</p></div>${full&&!duplicate?`<div class="spacer"></div><p class="muted">Dein Team ist voll. Einen Partner ersetzen:</p><div class="reward-grid">${s.party.map(p=>btn('capture',SPECIES[p.species].name+' ersetzen','small',`data-uid="${p.uid}" ${s.balls?'':'disabled'}`)).join('')}</div>`:''}`,
 `<div class="row">${!full||duplicate?btn('capture',duplicate?'Begegnung erforschen':existing?'Shiny ins bestehende Team übernehmen':'Ins Team aufnehmen','primary',!duplicate&&!s.balls?'disabled':''):''}${!duplicate?btn('camp-capture','Nur im Camp registrieren','small',s.balls?'':'disabled'):''}${btn('decline','Später wiederkommen','quiet')}</div>`,'narrow');
}
function merchantDialog(){
 const s=engine!.s;
 dialog(s.mode==='story'?'Pokémon-Markt':'Rangerhandel',`${s.coins} Münzen · Vorräte gelten für diesen Lauf.`,
 `<div class="reward-grid">${Object.entries(AVAILABLE_STONES).map(([id,n])=>btn('buy',`<b>${n}</b><small>75 Münzen · ${s.mode==='story'?'vorrätig':s.merchantStock.stones+' verfügbar'}</small>`,'',`data-kind="stone" data-id="${id}" ${s.coins<75||!s.merchantStock.stones?'disabled':''}`)).join('')}
 ${btn('buy','<b>Pokéball</b><small>20 Münzen · '+(s.mode==='story'?'vorrätig':s.merchantStock.balls+' verfügbar')+'</small>','',`data-kind="ball" ${s.coins<20||!s.merchantStock.balls?'disabled':''}`)}
 ${btn('buy','<b>Notversorgung</b><small>75 Münzen · +10 KP · '+Math.max(0,2-s.healing.purchased)+' im Lauf verfügbar</small>','',`data-kind="heal" ${s.coins<75||s.healing.purchased>=2||s.trainer.hp>=100?'disabled':''}`)}
 ${PASSIVES.filter(p=>engine!.canPassive(p.id)).map(p=>btn('buy',`<b>${p.name}</b><small>50 Münzen · ${p.description((s.passives[p.id]??0)+1)}</small>`,'',`data-kind="passive" data-id="${p.id}" ${s.coins<50?'disabled':''}`)).join('')}</div>`,btn('decline',s.mode==='story'?'Zurück in den Markt':'Zurück in den Wald','primary'));
}
function storyDialog(){
 const q=storyStage(engine!.s.pendingId!)!;
 dialog(q.title,q.description,`<div class="story-brief"><p>${q.objective}</p><div class="story-team">${q.team.map(id=>image(id)).join('')}</div><p>${q.waves} Kampfwellen${q.duration?' · '+q.duration+' Sekunden Gebiet sichern':''}</p><div class="quest-prize"><b>Belohnung: ${q.coins} Münzen · 3 Pokébälle · Trainer- & Pokémon-EP</b><p>${q.rewardUnlocks.map(id=>esc(KANTO_UNLOCK_NAMES[id]??id)).join(' · ')}</p><small>${engine!.s.interior?'Der Kampf findet im Innenraum statt. Du kannst die Prüfung am Ausgang unten abbrechen und später erneut beginnen.':'Bleibe im markierten Gebiet. Wenn du es verlässt, kannst du die Prüfung neu beginnen.'}</small></div></div>`,btn('start-story','Prüfung beginnen','primary',`data-id="${q.id}"`)+btn('decline','Später','quiet'),'narrow');
}
function treasureDialog(){dialog('Ein wertvoller Fund!','Die Truhe verbessert dein aktuelles Team.',`<ul class="treasure-results">${engine!.s.world.lastTreasure.map(r=>'<li>✦ '+esc(r)+'</li>').join('')}</ul>`,btn('decline','Weiterreisen','primary'),'narrow');}
function showMap(){activeMap?.destroy();if(engine!.s.mode==='bossrush'){dialog('Die Prüfungsarena','Prüfung '+Math.min(15,engine!.s.gauntlet.round+1)+' von 15','<p>Die steinerne Arena hat einen festen Rand. Alle Trefferflächen werden vor dem Einschlag markiert. Zwischen zwei Bossen bleiben sechs Sekunden zur Vorbereitung; Teammenü und Verbesserungswahl pausieren die Zeit.</p><ol>'+BOSSES.map((b,i)=>'<li style="padding:6px">'+(i<engine!.s.gauntlet.round?'✓ ':'')+SPECIES[b.species].name+' · '+b.title+'</li>').join('')+'</ol>',btn('close','Zurück','primary'),'narrow');return;}dialog(engine!.s.mode==='story'?'Kanto · Karte & Reisetagebuch':'Auenwald · Reiseziele',engine!.s.mode==='story'?'Eine zusammenhängende Welt · Städte, Routen und Dungeons':'Unbegrenzte Landschaft · einmalige Waldaufträge',worldMapMarkup(engine!.s,mapZoom,selectedMapPlace),'','world-map-dialog');activeMap=mapControls(modal,mapZoom,z=>mapZoom=z);}
function resultDialog(){
 const s=engine!.s,win=s.outcome==='win';
 if(s.mode==='bossrush'){dialog(win?'Alle 15 Prüfungen bestanden!':s.outcome==='timeout'?'Die Prüfungszeit ist abgelaufen.':'Die nächste Herausforderung wartet.',difficulty(s).name+' · '+s.gauntlet.round+'/'+BOSSES.length+' Bosse besiegt',`<div class="result-stats"><div><strong>${s.gauntlet.round}</strong><small>Prüfungen</small></div><div><strong>${time(s.time)}</strong><small>Kampfzeit</small></div><div><strong>${s.level}</strong><small>Trainerlevel</small></div></div>`,btn('result-camp','Zurück ins Camp','primary')+btn('export','Lauf exportieren','quiet'));return;}
 if(s.mode==='story'){
  dialog(win?'Du bist Kanto-Champion!':'Neue Kraft für die Reise.',win?'Alle acht Orden und die Pokémon-Liga sind geschafft. Die Azuria-Höhle ist jetzt zugänglich.':'Dein Team erholt sich am zuletzt besuchten Pokémon-Center. Orden und Storyfortschritt bleiben erhalten.',`<div class="result-stats"><div><strong>${badgeCount(s)}/8</strong><small>Orden</small></div><div><strong>${s.story.done.length}/27</strong><small>Storyetappen</small></div><div><strong>${time(s.time)}</strong><small>Reisezeit</small></div></div>`,btn('continue-story',win?'Kanto weiter erkunden':'Am Pokémon-Center fortsetzen','primary')+btn('result-camp','Speichern & ins Camp','quiet'));return;
 }
 dialog(win?'Der Auenwald atmet auf.':s.outcome==='timeout'?'Der Wald bleibt ungezähmt.':'Jede Reise hinterlässt Spuren.',
 win?'Der Wächter ist besiegt. Deine Expedition war erfolgreich · '+difficulty(s).name+'.':s.outcome==='timeout'?'Der Wächter war noch aktiv, als die Kampfzeit endete.':'Dein Trainer hat keine Lebenspunkte mehr. Dein Pokédex-Fortschritt bleibt.',
 `<div class="result-stats"><div><strong>${time(s.time)}</strong><small>Überlebenszeit</small></div><div><strong>${s.kills}</strong><small>Besiegte Gegner</small></div><div><strong>${s.level}</strong><small>Trainerlevel</small></div></div><div class="row" style="justify-content:center">${s.party.map(p=>image(p.species)).join('')}</div><p class="center muted" style="margin-top:16px">${s.completed.length}/3 Waldziele · ${s.evolved.length} Entwicklungen · ${s.caught.length} Spezies registriert</p>`,
 `${btn('result-camp','Zurück ins Camp','primary')}${btn('export','Lauf exportieren','quiet')}`);
}
function render(){
 if(panel==='camp'){home();return;}
 if(!ui.querySelector('.hud')&&engine)hud();
 updateHud();
 if(panel==='team')showTeam();
 else if(panel==='pause')showPause();
 else if(panel==='map')showMap();
 else if(panel==='dex')showDex();
 else if(panel==='help')showHelp();
 else if(panel==='settings')showSettings();
 else if(panel==='journal')dialog('Dein Fortschrittsbuch','Sammlung, Abzeichen, Bosse & Ausrüstung',journalMarkup(profile),btn('close','Zurück','primary'),'wide');
 else if(panel==='import-confirm'&&pendingBackup)dialog('Vollständige Sicherung wiederherstellen?',pendingBackup.profile.caught.length+' registrierte Arten · Profil und bis zu drei Laufstände','<p>Diese Datei ersetzt dein Profil, den Waldlauf, die Kanto-Story und den Bossansturm. Sichere deinen bisherigen Stand, bevor du fortfährst.</p>',btn('backup','Bisherigen Stand sichern')+btn('accept-backup','Alles wiederherstellen','primary')+btn('cancel-import','Abbrechen','quiet'),'narrow');
 else if(panel==='import-confirm'&&pendingImport)dialog('Spielstand laden?',(pendingImport.mode==='bossrush'?'Bossansturm':pendingImport.mode==='story'?'Kanto-Story':'Auenwald')+' · '+time(pendingImport.time)+' · Trainerlevel '+pendingImport.level,'<p>Die gespeicherte '+(pendingImport.mode==='bossrush'?'Bossprüfung':pendingImport.mode==='story'?'Story':'Waldexpedition')+' wird durch diese Datei ersetzt. Die anderen Speicherplätze und dein Profil bleiben erhalten.</p>',btn('accept-import','Spielstand laden','primary')+btn('cancel-import','Abbrechen','quiet'),'narrow');
 else if(panel==='confirm')dialog('Eine neue Expedition?','Dein unterbrochener Lauf wird durch den neuen ersetzt.','<p class="muted">Du kannst den bisherigen Lauf vorher als Datei exportieren.</p>',btn('start','Neuen Lauf starten','primary')+btn('export-saved','Bisherigen Lauf exportieren')+btn('cancel-new','Abbrechen','quiet'),'narrow');
 else {
  const screen=engine?.s.screen;
  if(screen==='story')storyDialog();else if(screen==='treasure')treasureDialog();else if(screen==='quest')questDialog();else if(screen==='level')levelDialog();else if(screen==='reward')rewardDialog();else if(screen==='capture')captureDialog();else if(screen==='merchant')merchantDialog();else if(screen==='result')resultDialog();else modal.innerHTML='';
 }
}
function queueSave(){
 if(!engine||!ready||!writable)return saveChain;
 const snapshot=JSON.parse(JSON.stringify(engine.s)) as RunState;
 saveChain=saveChain.catch(()=>{}).then(async()=>{
  try{await store.saveRun(snapshot);saved=snapshot;lastSaved=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});saveError='';}
  catch(e){saveError='Speichern fehlgeschlagen: '+(e as Error).message;message(saveError,7000);}
 });
 return saveChain;
}
function syncProfile(){
 if(!engine)return;
 const progressChanged=recordProgress(profile,engine.s);
 const before=profile.caught.length;
 profile.caught=[...new Set([...profile.caught,...engine.s.caught])].sort((a,b)=>a-b);
 if(progressChanged||profile.caught.length!==before)void store.put('profile',profile).catch(()=>message('Pokédex konnte nicht gespeichert werden.'));
 if(engine.s.outcome&&!resultRecorded){
  const token=engine.s.seed+':'+engine.s.mode+':'+engine.s.difficulty+':'+engine.s.outcome+':'+engine.s.story.done.length;
  if(profile.lastOutcome!==token){profile.runs++;if(engine.s.outcome==='win')profile.wins++;profile.best=Math.max(profile.best,engine.s.time);profile.lastOutcome=token;void store.put('profile',profile).catch(()=>message('Ergebnis konnte nicht gespeichert werden.'));}
  resultRecorded=true;void queueSave();
 }
}
const simulationClock=new SimulationClock();
const gameAudio=new GameAudio(()=>profile.settings);
const sound=(name:string)=>gameAudio.play(name);
document.addEventListener('pointerdown',()=>{void gameAudio.unlock();});
document.addEventListener('keydown',()=>{void gameAudio.unlock();});
function advanceRun(delta:number,keys:{x:number;y:number;dash?:boolean},background=false){
  if(!engine||panel!=='none'||!writable){simulationClock.reset();return;}
  const old=engine.s.screen;
  simulationClock.advance(delta,keys,(dt,input)=>{engine!.step(dt,input);return engine!.s.screen==='play';},background?2:.15);
  const s=engine.s;
  if(s.message!==lastMessage&&s.messageUntil>s.time){lastMessage=s.message;message(s.message);}
  if(s.screen!==lastScreen||old!==s.screen){lastScreen=s.screen;render();if(s.screen!=='play')void queueSave();}
  if(s.time-lastAutosave>=15){lastAutosave=s.time;void queueSave();}
  if(s.time-lastHud>=.12){lastHud=s.time;updateHud();syncProfile();}
  if(!background){const minimap=document.getElementById('minimap') as HTMLCanvasElement|null;if(minimap)drawLocalMap(minimap,s);}
  for(const event of engine.soundEvents.splice(0))if(!background)sound(event);
 }
const view=createView(document.getElementById('world')!,{
 engine:()=>engine,
 trainer:()=>engine?.s.trainerId??selectedTrainer,
 effects:()=>profile.settings.effects,
 playing:()=>!!engine&&engine.s.screen==='play'&&panel==='none'&&writable,
 step:()=>sound('step'),
 ready:()=>{assetsReady=true;if(panel==='camp')home();},
 loadError:()=>{saveError='Einige Grafikdateien konnten nicht geladen werden. Bitte die Seite neu laden.';if(panel==='camp')home();},
 tick:(delta,keys)=>{if(!document.hidden)advanceRun(delta,keys);},
 key:key=>{
  if(!engine||panel==='camp')return;
  if((key==='m'||key==='M')&&(panel==='map'||panel==='none'&&engine.s.screen==='play')){panel=panel==='map'?'none':'map';view.scene.resetKeys();render();}
  if(key==='Tab'&&panel==='none'&&engine.s.screen==='play'){panel='team';swapTarget=null;render();}
  if(key==='Escape'){if(panel==='none'&&engine.s.screen==='play'){panel='pause';render();void queueSave();}else if(panel==='pause'||panel==='team'||panel==='map'){panel='none';render();}}
  if((key==='e'||key==='E')&&panel==='none'&&engine.s.screen==='play'){engine.interact();render();void queueSave();}
  if(['1','2','3'].includes(key)&&panel==='none'&&engine.s.screen==='level'){engine.choose(Number(key)-1);render();void queueSave();}
 },
 focus:(x,y)=>{if(engine&&panel==='none'&&engine.s.screen==='play'){engine.s.focus=focusAt(engine.s,{x,y});}}
});
function begin(state:RunState){
 mode=state.mode;selectedDifficulty=state.difficulty;engine=new Engine(state);panel='none';lastScreen='';lastHud=-1;lastAutosave=state.time;lastMessage='';resultRecorded=false;simulationClock.reset();
 if(state.time>0&&state.screen==='play')panel='pause';
 view.scene.resetKeys();hud();render();void queueSave();
}
function exportRun(s:RunState|null){
 if(!s){message('Noch kein Lauf zum Exportieren.');return;}
 const blob=new Blob([JSON.stringify(envelope(s,store.generation+1),null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Auenwald-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importRun(){
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;document.body.append(input);
 input.addEventListener('cancel',()=>input.remove(),{once:true});
 input.onchange=async()=>{
  const file=input.files?.[0];if(!file)return;
  try{
   if(file.size>16_500_000)throw new Error('Datei ist zu groß.');
   const raw=JSON.parse(await file.text());
   if(raw?.format==='pokemon-survivors-backup'){pendingBackup=decodeBackup(raw);pendingImport=null;panel='import-confirm';render();return;}
   const state=decodeEnvelope(raw);pendingBackup=null;
   pendingImport=state;panel='import-confirm';render();
  }catch(e){message('Import abgelehnt: '+(e as Error).message,7000);}finally{input.remove();}
 };input.click();
}
document.addEventListener('click',async event=>{
 const target=(event.target as HTMLElement).closest<HTMLElement|SVGElement>('[data-action]');if(!target||target instanceof HTMLButtonElement&&target.disabled)return;
 const action=target.dataset.action!,id=target.dataset.id,uid=Number(target.dataset.uid),slot=Number(target.dataset.slot),s=engine?.s;
 await gameAudio.unlock();
 if(action==='backup'){await queueSave();await saveChain;const data=await store.backup(),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.download='Pokemon-Survivors-Komplettsicherung-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);message('Vollständige Sicherung erstellt.');return;}
 if(action==='accept-backup'&&pendingBackup&&writable){await saveChain;await store.restoreBackup(pendingBackup);profile=await store.loadProfile();saved=await store.loadRun();pendingBackup=null;pendingImport=null;engine=null;panel='camp';mode=saved?.mode??'learn';selectedDifficulty=saved?.difficulty??'standard';selectedTrainer=profile.trainerId;selectedStarter=1;applyHudScale(profile.settings.hudScale);gameAudio.updateVolume();render();message('Profil und alle Laufstände wiederhergestellt.');return;}
 if(action==='difficulty'&&isDifficulty(id)){selectedDifficulty=id;home();return;}
 if(action==='journal'){previousPanel=engine?'pause':'camp';panel='journal';render();return;}
 if(action==='cry'){sound('cry:'+id);return;}
 if(action==='preview-sound'){
  if(!profile.settings.sound){message('Aktiviere zuerst Spielklänge & Pokémon-Rufe.');return;}
  sound('catch');window.setTimeout(()=>{void gameAudio.cry(25).then(ok=>message(ok?'Pikachus Ruf wird abgespielt.':'Der Ruf konnte gerade nicht abgespielt werden. Bitte erneut versuchen.'));},900);return;
 }
 if(action==='pick-starter'||action==='pick-target'){previousPanel='camp';dexMode=action==='pick-starter'?'starter':'target';panel='dex';render();return;}
 if(action==='dex-mode'&&['browse','starter','target'].includes(id??'')){dexMode=id as DexMode;showDex();return;}
 if((action==='dex-starter'||action==='dex-shiny')&&writable&&profile.caught.includes(Number(id))){if(action==='dex-shiny'&&!profile.shinies.includes(Number(id)))return;selectedStarterShiny=action==='dex-shiny';selectedStarter=Number(id);sound('cry:'+id);panel='camp';render();return;}
 if(action==='random-target'&&writable){profile.targetSpecies=null;await store.put('profile',profile);home();return;}
 if(action==='dex-target'&&writable&&SPECIES[Number(id)]){profile.targetSpecies=Number(id);await store.put('profile',profile);panel=previousPanel;render();message(SPECIES[Number(id)].name+' ist dein Forschungsziel für den nächsten Lauf.');return;}
 if(action==='trainer'&&TRAINERS.some(t=>t.id===id)){
  selectedTrainer=id!;profile.trainerId=id!;
  if(writable)void store.put('profile',profile).catch(()=>message('Trainerwahl konnte nicht gespeichert werden.'));
  home();return;
 }
 if(action==='starter'){selectedStarter=Number(id);selectedStarterShiny=false;sound('cry:'+id);home();return;}
 if(action.startsWith('mode-')&&['learn','normal','endless','story','bossrush'].includes(action.slice(5))){mode=action.slice(5) as RunMode;saved=await store.loadRun(saveSlot(mode));home();return;}
 if(action==='confirm-new'){panel='confirm';render();return;}
 if(action==='cancel-new'){panel='camp';render();return;}
 if(action==='start'){if(!writable||!ready||!assetsReady)return;await saveChain;await store.clearRun(saveSlot(mode));begin(newRun(selectedStarter,mode,undefined,selectedTrainer,profile.targetSpecies,selectedDifficulty,selectedStarterShiny&&profile.shinies.includes(selectedStarter)));sound('cry:'+selectedStarter);return;}
 if(action==='resume'&&saved){begin(validateState(saved));return;}
 if(action==='dex'||action==='help'||action==='settings'){if(action==='dex')dexMode='browse';previousPanel=panel==='camp'?'camp':'pause';panel=action;render();return;}
 if(action==='close'){
  if(panel==='dex'||panel==='help'||panel==='settings'||panel==='journal')panel=previousPanel;else if(panel==='confirm')panel='camp';else if(panel==='import-confirm'){pendingImport=null;pendingBackup=null;panel=engine?'pause':'camp';}else panel='none';
  swapTarget=null;view.scene.resetKeys();render();return;
 }
 if(action==='accept-import'&&pendingImport){const state=pendingImport;pendingImport=null;await saveChain;await store.saveRun(state);saved=state;begin(state);message('Spielstand geladen.');return;}
 if(action==='cancel-import'){pendingImport=null;pendingBackup=null;panel=engine?'pause':'camp';render();return;}
 if(action==='export-saved'){exportRun(saved);return;}
 if(action==='import'){if(writable)importRun();return;}
 if(!engine||!s)return;
 if(action==='pause'){panel='pause';void queueSave();}
 if(action==='map-place'&&id){selectedMapPlace=id;selectMapPlace(modal,id,placeCardMarkup(engine!.s,id));return;}
 if(action==='map-plus'||action==='map-minus'){activeMap?.setZoom(mapZoom+(action==='map-plus'?.5:-.5));return;}
 if(action==='map'&&s.screen==='play'){panel='map';view.scene.resetKeys();}
 if(action==='start-story')engine.startStory(id!);
 if(action==='abort-story'){engine.abortStory();panel='none';}
 if(action==='continue-story'&&s.mode==='story'&&s.outcome){
  continueStory(engine);resultRecorded=false;panel='none';
 }
 if(action==='team'){panel='team';swapTarget=null;}
 if(action==='save-camp'){mode=s.mode;await queueSave();if(saveError){message('Der Lauf bleibt geöffnet, bis Speichern wieder funktioniert.');return;}panel='camp';engine=null;}
 if(action==='result-camp'){mode=s.mode;await queueSave();panel='camp';engine=null;}
 if(action==='export')exportRun(s);
 if(action==='choose')engine!.choose(Number(target.dataset.index));
 if(action==='reroll')engine!.reroll();
 if(action==='skip')engine!.skip();
 if(action==='formation'&&['ring','wedge','trail'].includes(id??''))s.formation=id as RunState['formation'];
 if(action==='activate'){if(s.active.length<activeCapacity(s))engine!.setActive([...s.active,uid]);else swapTarget=uid;}
 if(action==='swap-with'&&swapTarget){if(engine!.setActive(s.active.map(x=>x===uid?swapTarget!:x)))swapTarget=null;}
 if(action==='legacy-move-disabled'){
  const p=engine!.getPartner(uid);
  if(p){let slots=p.equipped.filter(i=>i<knownMoves(s));if(slots.includes(slot))slots=slots.filter(i=>i!==slot);else slots=slots.length===2?[slots[0],slot]:[...slots,slot];if(!engine!.setMoves(uid,slots))message('Mindestens ein Angriff bleibt ausgerüstet. Beachte die Wechselsperre.');}
 }
 if(action==='evolve')engine!.evolve(uid,Number(target.dataset.target));
 if(action==='start-quest')engine!.startQuest(id as QuestId);
 if(action==='reward')engine!.claimReward(target.dataset.kind!,id);
 if(action==='capture')engine!.capture(Number.isFinite(uid)?uid:undefined);
 if(action==='camp-capture')engine!.capture(undefined,true);
 if(action==='decline'){s.screen='play';s.pendingId=null;}
 if(action==='buy'&&!engine!.buy(target.dataset.kind!,id))message('Kauf derzeit nicht möglich.');
 if(engine){syncProfile();void queueSave();for(const event of engine.soundEvents.splice(0))sound(event);}
 render();
});
document.addEventListener('change',event=>{
 const target=event.target as HTMLInputElement;
 if(target.id==='extra-starter'){if(SPECIES[Number(target.value)])selectedStarter=Number(target.value);sound('cry:'+selectedStarter);home();}
 if(target.id==='research-target'&&writable){profile.targetSpecies=SPECIES[Number(target.value)]?Number(target.value):null;void store.put('profile',profile);}
 if(target.dataset.setting==='effects')profile.settings.effects=target.checked;
 if(target.dataset.setting==='sound'){profile.settings.sound=target.checked;void gameAudio.unlock().then(()=>sound('select'));gameAudio.updateVolume();}
 if(target.dataset.setting&&writable)void store.put('profile',profile);
});
document.addEventListener('input',event=>{
 const target=event.target as HTMLInputElement,key=target.dataset.setting;
 if(key==='hudScale'||key==='volume'){
  profile.settings=normalizeSettings({...profile.settings,[key]:Number(target.value)/100});
  applyHudScale(profile.settings.hudScale);gameAudio.updateVolume();
  const output=document.getElementById(key==='hudScale'?'hud-scale-value':'volume-value');if(output)output.textContent=Math.round(profile.settings[key]*100)+' %';
 }
 if(target.id==='dex-search'||target.id==='dex-caught-only'){const term=(document.getElementById('dex-search') as HTMLInputElement)?.value.trim().toLocaleLowerCase('de')??'',caught=(document.getElementById('dex-caught-only') as HTMLInputElement)?.checked;document.querySelectorAll<HTMLElement>('.dex-card').forEach(card=>card.hidden=!card.dataset.search?.includes(term)||!!caught&&card.dataset.caught!=='true');}
});
document.addEventListener('keydown',ev=>{
 if(ev.key==='Escape'&&['dex','help','settings'].includes(panel)){panel=previousPanel;render();return;}
 if(ev.key!=='Tab'||!modal.querySelector('[role=dialog]'))return;
 const nodes=[...modal.querySelectorAll<HTMLElement>('button:not(:disabled),input,select')].filter(node=>node.getClientRects().length>0);if(!nodes.length)return;
 if(ev.shiftKey&&document.activeElement===nodes[0]){ev.preventDefault();nodes[nodes.length-1].focus();}
 else if(!ev.shiftKey&&document.activeElement===nodes[nodes.length-1]){ev.preventDefault();nodes[0].focus();}
});
// Losing focus releases held keys; only explicit menus or choices pause the run.
let hiddenTick=performance.now();
window.addEventListener('blur',()=>{view.scene.resetKeys();void queueSave();});
function backgroundTick(){
 const now=performance.now(),delta=(now-hiddenTick)/1000;hiddenTick=now;
 advanceRun(delta,{x:0,y:0},true);
}
document.addEventListener('visibilitychange',()=>{
 view.scene.resetKeys();
 if(document.hidden){simulationClock.reset();hiddenTick=performance.now();void queueSave();}
 else {backgroundTick();simulationClock.reset();updateHud();}
});
// Browsers suspend animation frames in hidden tabs. A separate bounded timer owns
// simulation there; the foreground RAF never advances the same elapsed interval.
window.setInterval(()=>{if(document.hidden)backgroundTick();},250);
window.addEventListener('pagehide',()=>{void queueSave();writable=false;releaseLock();});
window.addEventListener('pageshow',event=>{if(event.persisted)window.location.reload();});
window.addEventListener('unhandledrejection',ev=>{console.error(ev.reason);message('Ein Fehler ist aufgetreten. Bitte den Lauf exportieren und neu laden.',7000);});
async function boot(){
 try{
  await store.open();profile=await store.loadProfile();selectedTrainer=trainerById(profile.trainerId).id;applyHudScale(profile.settings.hudScale);
  try{saved=await store.loadRun();if(saved){mode=saved.mode;selectedDifficulty=saved.difficulty;}if(store.recovered)saveError='Die vorherige gültige Laufkopie wurde wiederhergestellt.';}catch(e){saveError=(e as Error).message;}
  if(navigator.locks){
   await new Promise<void>(resolve=>{void navigator.locks.request('auenwald-save-writer',{ifAvailable:true},async lock=>{writable=!!lock;resolve();if(lock)await new Promise<void>(release=>releaseLock=release);});});
  }else{saveError='Dieser Browser unterstützt den Spielstandschutz nicht. Bitte einen aktuellen Edge oder Chrome verwenden.';writable=false;}
  ready=true;home();
 }catch(e){saveError='Lokaler Speicher nicht verfügbar: '+(e as Error).message;ready=true;home();}
}
home();void boot();

document.addEventListener('keydown',event=>{const target=event.target as Element;if((event.key==='Enter'||event.key===' ')&&target.matches('.atlas-place')){event.preventDefault();target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
