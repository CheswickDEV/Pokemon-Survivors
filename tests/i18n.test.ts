import test from 'node:test';
import assert from 'node:assert/strict';
import {getLanguage,getLocale,setLanguage,translateText,languagePicker} from '../src/i18n.ts';
import {normalizeSettings} from '../src/settings.ts';
import {defaultProfile,validateProfile,backupEnvelope,decodeBackup} from '../src/save.ts';
import {newRun} from '../src/engine.ts';
import {dexMarkup} from '../src/dex-ui.ts';
import {SPECIES} from '../src/data.ts';

test('English is the default, including legacy and unsupported preferences',()=>{
 assert.equal(getLanguage(),'en');assert.equal(getLocale(),'en-US');
 const profile=defaultProfile();assert.equal(profile.settings.language,'en');
 const legacy=structuredClone(profile) as any;delete legacy.settings.language;
 assert.equal(validateProfile(legacy).settings.language,'en');
 assert.equal(normalizeSettings({language:'fr'} as any).language,'en');
 assert.equal(normalizeSettings({language:'de'}).language,'de');
});
test('German preference survives a full backup without changing the run',()=>{
 const profile=defaultProfile();profile.settings.language='de';
 const forest=newRun(1,'learn',123);
 const restored=decodeBackup(backupEnvelope({profile,forest,story:null,bossrush:null}));
 assert.equal(restored.profile.settings.language,'de');assert.deepEqual(restored.forest,forest);
 assert.equal(profile.caught[0],1);
});
test('names, story prose and dynamic messages translate as complete display text',()=>{
 assert.equal(translateText('Bisasam & Glumanda & Schiggy'),'Bulbasaur & Charmander & Squirtle');
 assert.equal(translateText('Rang 3 von 8'),'Rank 3 of 8');
 assert.equal(translateText('Wechsel wieder in 12 Sekunden Spielzeit. Die Zeit pausiert.'),'Switch available in 12 seconds of game time. Time is paused.');
 assert.equal(translateText('E · Schatztruhe öffnen'),'E · Open treasure chest');
 assert.equal(translateText('Schwester Joy · Deine Pokémon sind wieder fit'),'Nurse Joy · Your Pokémon are fit again');
 assert.equal(translateText('Ungültige Begegnung.'),'Invalid encounter.');
});
test('German retains canonical messages and toggling restores number locale',()=>{
 try{
  setLanguage('de');assert.equal(getLocale(),'de-DE');
  assert.equal(translateText('Bisasam · Rang 3 von 8'),'Bisasam · Rang 3 von 8');
  assert.match(languagePicker(),/value="de" lang="de" selected/);
  setLanguage('en');assert.equal(getLocale(),'en-US');assert.equal(translateText('Bisasam'),'Bulbasaur');
 }finally{setLanguage('en');}
});
test('translation boundaries preserve unrelated words and whitespace',()=>{
 assert.equal(translateText('  Gift  '),'  Poison  ');
 assert.equal(translateText('Gifts, Gifted, identity-123'),'Gifts, Gifted, identity-123');
 assert.equal(translateText('Already English.'),'Already English.');
 assert.equal(translateText(''), '');
});
test('Pokédex search indexes both languages without changing species IDs',()=>{
 const html=dexMarkup(defaultProfile(),'starter',true);
 assert.match(html,/data-search="bisasam bulbasaur 001"/);
 assert.match(html,/data-search="mewtu mewtwo 150"/);
 assert.match(html,/data-id="1"/);
 assert.equal(SPECIES[1].name,'Bisasam');
 assert.equal(SPECIES[150].name,'Mewtu');
});
