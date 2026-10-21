"""Build the offline Kanto combat catalogue from a pinned PokeAPI CSV snapshot."""
from pathlib import Path
import csv, io, json, urllib.request, hashlib, concurrent.futures, math

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache' / 'kanto-data'
CACHE.mkdir(parents=True, exist_ok=True)
headers = {'User-Agent': 'Auenwald-local-catalog/0.3'}
def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=60) as r:
        return r.read()
REV = '6fd69dfe90465ba96534f6816fc817737d1f97f6'
revision_file = CACHE / 'revision.txt'
if revision_file.exists():
    assert revision_file.read_text().strip()==REV,'Clear or move the old catalogue source cache before changing snapshots.'
else:
    revision_file.write_text(REV)
FILES = ['pokemon_species_names.csv','pokemon_species.csv','pokemon_types.csv','pokemon_types_past.csv','move_changelog.csv',
         'type_efficacy.csv','type_efficacy_past.csv',
         'pokemon_moves.csv','moves.csv','move_names.csv','types.csv','pokemon_evolution.csv','items.csv',
         'version_groups.csv']
def source_file(name):
    path = CACHE / name
    if not path.exists():
        path.write_bytes(fetch(f'https://raw.githubusercontent.com/PokeAPI/pokeapi/{REV}/data/v2/csv/{name}'))
    return name, list(csv.DictReader(io.StringIO(path.read_text(encoding='utf-8'))))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    data = dict(pool.map(source_file, FILES))
NAMES={int(x['pokemon_species_id']):x['name'] for x in data['pokemon_species_names.csv'] if x['local_language_id']=='6'}
SPECIES={int(x['id']):x for x in data['pokemon_species.csv'] if int(x['id'])<=151}
TYPES={int(x['id']):x['identifier'] for x in data['types.csv']}
MOVES={x['identifier']:x for x in data['moves.csv'] if int(x['id'])<=165}
MOVE_NAMES={int(x['move_id']):x['name'] for x in data['move_names.csv'] if x['local_language_id']=='6'}
LEGAL={i:set() for i in SPECIES}
for x in data['pokemon_moves.csv']:
    if int(x['pokemon_id']) in LEGAL and x['version_group_id'] in ['1','2']:
        LEGAL[int(x['pokemon_id'])].add(int(x['move_id']))
def parent(i):
    p=int(SPECIES[i]['evolves_from_species_id'] or 0)
    return p if p in SPECIES else 0
def ancestors(i):
    chain=[i]
    while parent(chain[-1]): chain.append(parent(chain[-1]))
    return chain
def legal(i,slug):
    # A Pokémon may retain moves learned before evolution.
    return any(int(MOVES[slug]['id']) in LEGAL[p] for p in ancestors(i))

# A hand-authored, thematic four-move set for every family; evolved forms can
# specialize further below. Identifiers are checked against Red/Blue/Yellow.
PREFERENCES={}
def family(ids, *moves):
    for i in ids: PREFERENCES[i]=list(moves)
family([1,2,3], 'razor-leaf','vine-whip','mega-drain','solar-beam')
family([4,5,6], 'ember','slash','fire-spin','flamethrower')
family([7,8,9], 'water-gun','bubble','bite','hydro-pump')
family([10,11], 'tackle','string-shot','harden')
family([12], 'confusion','gust','sleep-powder','psybeam')
family([13,14], 'poison-sting','string-shot','harden')
family([15], 'twineedle','fury-attack','pin-missile','agility')
family([16,17,18], 'gust','quick-attack','wing-attack','mirror-move')
family([19,20], 'tackle','quick-attack','hyper-fang','super-fang')
family([21,22], 'peck','fury-attack','drill-peck','fly')
family([23,24], 'poison-sting','wrap','acid','glare')
family([25,26], 'thunder-shock','thunder-wave','thunderbolt','thunder')
family([27,28], 'scratch','sand-attack','dig','slash')
family([29,30], 'poison-sting','double-kick','bite','body-slam')
family([31], 'double-kick','body-slam','earthquake','blizzard')
family([32,33], 'horn-attack','poison-sting','double-kick','fury-attack')
family([34], 'horn-attack','thrash','earthquake','thunderbolt')
family([35,36], 'pound','double-slap','sing','metronome')
family([37,38], 'ember','quick-attack','confuse-ray','fire-spin')
family([39,40], 'pound','sing','double-slap','body-slam')
family([41,42], 'leech-life','supersonic','bite','wing-attack')
family([43,44,45], 'absorb','acid','stun-spore','petal-dance')
family([46,47], 'scratch','leech-life','spore','slash')
family([48,49], 'confusion','poison-powder','leech-life','psybeam')
family([50,51], 'scratch','sand-attack','dig','earthquake')
family([52,53], 'scratch','pay-day','bite','slash')
family([54,55], 'water-gun','confusion','scratch','hydro-pump')
family([56,57], 'scratch','low-kick','karate-chop','seismic-toss')
family([58,59], 'bite','ember','take-down','flamethrower')
family([60,61], 'bubble','water-gun','double-slap','body-slam')
family([62], 'water-gun','double-slap','submission','hydro-pump')
family([63], 'psywave','seismic-toss','psychic','teleport')
family([64,65], 'confusion','psybeam','recover','psychic')
family([66,67,68], 'karate-chop','low-kick','seismic-toss','submission')
family([69,70,71], 'vine-whip','wrap','acid','razor-leaf')
family([72,73], 'acid','wrap','bubble-beam','hydro-pump')
family([74,75,76], 'tackle','rock-throw','earthquake','rock-slide')
family([77,78], 'ember','stomp','take-down','fire-spin')
family([79,80], 'confusion','water-gun','headbutt','psychic')
family([81,82], 'sonic-boom','thunder-shock','thunder-wave','thunderbolt')
family([83], 'peck','fury-attack','slash','swords-dance')
family([84,85], 'peck','fury-attack','tri-attack','drill-peck')
family([86,87], 'headbutt','aurora-beam','ice-beam','surf')
family([88,89], 'pound','sludge','poison-gas','acid-armor')
family([90,91], 'tackle','clamp','aurora-beam','ice-beam')
family([92,93,94], 'lick','night-shade','confuse-ray','dream-eater')
family([95], 'bind','rock-throw','slam','rock-slide')
family([96,97], 'pound','confusion','psybeam','psychic')
family([98,99], 'vice-grip','stomp','crabhammer','bubble')
family([100,101], 'tackle','sonic-boom','swift','thunderbolt')
family([102,103], 'barrage','confusion','egg-bomb','solar-beam')
family([104,105], 'bone-club','headbutt','bonemerang','thrash')
family([106], 'double-kick','rolling-kick','jump-kick','high-jump-kick')
family([107], 'comet-punch','fire-punch','ice-punch','thunder-punch')
family([108], 'lick','stomp','slam','wrap')
family([109,110], 'smog','tackle','sludge','poison-gas')
family([111,112], 'horn-attack','stomp','fury-attack','earthquake')
family([113], 'pound','double-slap','soft-boiled','egg-bomb')
family([114], 'bind','absorb','stun-spore','slam')
family([115], 'comet-punch','bite','mega-punch','dizzy-punch')
family([116,117], 'bubble','water-gun','smokescreen','hydro-pump')
family([118,119], 'peck','horn-attack','fury-attack','waterfall')
family([120,121], 'water-gun','swift','recover','bubble-beam')
family([122], 'confusion','barrier','double-slap','psychic')
family([123], 'quick-attack','slash','swords-dance','double-team')
family([124], 'pound','ice-punch','powder-snow','blizzard')
family([125], 'quick-attack','thunder-shock','thunder-punch','thunder')
family([126], 'ember','smog','fire-punch','flamethrower')
family([127], 'vice-grip','seismic-toss','slash','submission')
family([128], 'tackle','stomp','take-down','thrash')
family([129], 'tackle','splash')
family([130], 'bite','dragon-rage','hydro-pump','hyper-beam')
family([131], 'water-gun','ice-beam','body-slam','hydro-pump')
family([132], 'transform')
family([133], 'tackle','quick-attack','bite','take-down')
family([134], 'water-gun','quick-attack','aurora-beam','hydro-pump')
family([135], 'thunder-shock','double-kick','pin-missile','thunder')
family([136], 'ember','bite','fire-spin','flamethrower')
family([137], 'psybeam','tri-attack','recover','hyper-beam')
family([138,139], 'water-gun','withdraw','hydro-pump','ice-beam')
family([140,141], 'scratch','absorb','slash','hydro-pump')
family([142], 'wing-attack','bite','take-down','hyper-beam')
family([143], 'headbutt','body-slam','rest','hyper-beam')
family([144], 'peck','ice-beam','blizzard','sky-attack')
family([145], 'thunder-shock','drill-peck','thunder','sky-attack')
family([146], 'peck','fire-spin','fire-blast','sky-attack')
family([147,148,149], 'wrap','thunder-wave','dragon-rage','slam')
family([150], 'confusion','psychic','recover','swift')
family([151], 'pound','psychic','mega-punch','metronome')
# Evolved Pokémon trade some early-family moves for a distinctive kit.
PREFERENCES[3]=['razor-leaf','vine-whip','mega-drain','solar-beam']
PREFERENCES[6]=['ember','slash','fire-spin','fire-blast']
PREFERENCES[9]=['water-gun','bubble-beam','skull-bash','hydro-pump']
PREFERENCES[18]=['quick-attack','wing-attack','mirror-move','sky-attack']
PREFERENCES[22]=['peck','drill-peck','fury-attack','sky-attack']
PREFERENCES[38]=['ember','confuse-ray','fire-spin','fire-blast']
PREFERENCES[45]=['absorb','acid','petal-dance','solar-beam']
PREFERENCES[47]=['leech-life','spore','slash','mega-drain']
PREFERENCES[49]=['confusion','leech-life','psybeam','psychic']
PREFERENCES[51]=['dig','slash','earthquake','rock-slide']
PREFERENCES[55]=['water-gun','confusion','fury-swipes','hydro-pump']
PREFERENCES[59]=['bite','take-down','flamethrower','fire-blast']
PREFERENCES[68]=['karate-chop','seismic-toss','submission','rock-slide']
PREFERENCES[76]=['rock-throw','body-slam','earthquake','rock-slide']
PREFERENCES[78]=['stomp','fire-spin','take-down','fire-blast']
PREFERENCES[80]=['water-gun','confusion','rest','psychic']
PREFERENCES[82]=['sonic-boom','thunder-wave','thunderbolt','tri-attack']
PREFERENCES[85]=['fury-attack','drill-peck','tri-attack','fly']
PREFERENCES[87]=['aurora-beam','ice-beam','surf','blizzard']
PREFERENCES[91]=['clamp','spike-cannon','ice-beam','blizzard']
PREFERENCES[94]=['lick','night-shade','dream-eater','psychic']
PREFERENCES[99]=['vice-grip','stomp','crabhammer','surf']
PREFERENCES[101]=['sonic-boom','swift','thunderbolt','thunder']
PREFERENCES[103]=['confusion','egg-bomb','solar-beam','psychic']
PREFERENCES[110]=['smog','sludge','poison-gas','thunderbolt']
PREFERENCES[112]=['horn-attack','stomp','earthquake','rock-slide']
PREFERENCES[117]=['bubble','water-gun','hydro-pump','ice-beam']
PREFERENCES[119]=['horn-attack','fury-attack','waterfall','surf']
PREFERENCES[121]=['water-gun','recover','psychic','hydro-pump']
PREFERENCES[139]=['water-gun','hydro-pump','ice-beam','rock-slide']
PREFERENCES[141]=['absorb','slash','hydro-pump','mega-drain']
PREFERENCES[149]=['dragon-rage','slam','wing-attack','hyper-beam']

# Better matching legal alternatives for a few moves not present in Gen I.
FALLBACKS={
 15:['double-edge','twineedle'],96:['hypnosis','headbutt'],97:['hypnosis','headbutt'],
 106:['mega-kick','body-slam'],124:['lovely-kiss','ice-beam'],128:['body-slam','earthquake'],
 139:['blizzard','body-slam'],149:['fire-blast','thunderbolt'],
}
AUDIT=[]
for i,prefs in PREFERENCES.items():
    selected=[]
    for slug in prefs:
        if slug in MOVES and legal(i,slug): selected.append(slug)
        else: AUDIT.append({'species':i,'requested':slug,'reason':'Not in Red/Blue/Yellow learnset; replaced.'})
    if i not in [10,11,13,14,129,132]:
        for slug in FALLBACKS.get(i,[])+['swift','body-slam','double-edge','psywave','tackle','headbutt','rest','bide']:
            if len(selected)==4: break
            if slug not in selected and legal(i,slug): selected.append(slug)
        assert len(selected)==4,(i,selected)
    PREFERENCES[i]=selected

def gen1_types(i):
    # Past records name the last generation BEFORE a type changed. The earliest
    # available record therefore gives Gen-I typing (e.g. Magnemite -> Electric).
    past=[x for x in data['pokemon_types_past.csv'] if int(x['pokemon_id'])==i]
    rows=[x for x in data['pokemon_types.csv'] if int(x['pokemon_id'])==i]
    if past:
        gen=min(int(x['generation_id']) for x in past)
        rows=[x for x in past if int(x['generation_id'])==gen]
    return [TYPES[int(x['type_id'])] for x in sorted(rows,key=lambda x:int(x['slot']))]

TYPE_OVERRIDE={'bite':'normal','gust':'normal','karate-chop':'normal','sand-attack':'normal'}
MOVE_SHAPES={
 'shot':set('water-gun hydro-pump bubble-beam ice-beam aurora-beam hyper-beam psybeam solar-beam dragon-rage thunder-shock thunderbolt poison-sting acid sludge night-shade psywave confusion psychic egg-bomb rock-throw sonic-boom ember leech-seed'.split()),
 'fan':set('razor-leaf bubble pin-missile spike-cannon barrage swift fire-blast smog poison-powder sleep-powder stun-spore spore flamethrower blizzard twineedle fury-attack tri-attack double-slap comet-punch smokescreen'.split()),
 'pulse':set('vine-whip stomp earthquake rock-slide thunder thunder-wave glare growl roar sing supersonic poison-gas flash haze mist harden reflect light-screen barrier hypnosis kinesis smokescreen'.split()),
 'dash':set('pound tackle scratch quick-attack bite peck drill-peck wing-attack fly sky-attack horn-attack slash fury-swipes horn-drill dig body-slam take-down double-edge headbutt slam skull-bash strength cut vice-grip guillotine crabhammer waterfall karate-chop low-kick double-kick mega-punch mega-kick jump-kick rolling-kick high-jump-kick submission seismic-toss fire-punch ice-punch thunder-punch dizzy-punch counter teleport agility lovely-kiss'.split()),
 'heal':set('recover rest soft-boiled absorb mega-drain leech-life dream-eater'.split()),
 'orbit':set('fire-spin gust razor-wind whirlwind wrap bind constrict clamp swords-dance thrash double-team acid-armor withdraw confuse-ray mirror-move metronome'.split())
}

def attack(slug,i,index):
    src=MOVES[slug]
    typ=TYPE_OVERRIDE.get(slug,TYPES[int(src['type_id'])])
    shape=next((shape for shape,slugs in MOVE_SHAPES.items() if slug in slugs),'pulse')
    raw=int(src['power'] or 55)
    # Fixed damage and OHKO moves are intentionally ordinary balanced attacks.
    strength=min(1,max(0,(raw-20)/100))
    if shape=='shot': power=round(15+strength*13); interval=round(.85+strength*.7,2); reach=round(245+strength*75)
    elif shape=='fan': power=round(8+strength*6); interval=round(1.55+strength*.95,2); reach=round(230+strength*70)
    elif shape=='dash': power=round(23+strength*15); interval=round(1.15+strength*.55,2); reach=round(145+strength*55)
    elif shape=='heal': power=round(4+strength*2); interval=round(8+strength*2,2); reach=140
    elif shape=='orbit': power=round(18+strength*13); interval=round(2.5+strength*.8,2); reach=round(125+strength*45)
    else: power=round(17+strength*13); interval=round(2.3+strength*.9,2); reach=round(120+strength*45)
    return {'name':MOVE_NAMES[int(src['id'])],'type':typ,'pattern':shape,'power':power,'interval':interval,'range':reach}

SPECIAL_MOVES={
 10:[('tackle','Tackle','dash',26,1.15,155),('string-shot','Fadenschuss','shot',16,1.05,240),('tackle','Tackle · Sprung','pulse',18,2.5,125),('string-shot','Fadenschuss · Fächer','fan',12,1.9,245)],
 11:[('tackle','Tackle','dash',26,1.15,155),('string-shot','Fadenschuss','shot',16,1.05,240),('harden','Härtner · Stoß','pulse',20,2.7,130),('string-shot','Fadenschuss · Ring','orbit',19,2.9,150)],
 13:[('poison-sting','Giftstachel','shot',17,1,255),('string-shot','Fadenschuss','shot',16,1.05,240),('poison-sting','Giftstachel · Fächer','fan',12,2,250),('string-shot','Fadenschuss · Ring','orbit',19,2.9,150)],
 14:[('poison-sting','Giftstachel','shot',17,1,255),('string-shot','Fadenschuss','shot',16,1.05,240),('harden','Härtner · Stoß','pulse',20,2.7,130),('poison-sting','Giftstachel · Fächer','fan',12,2,250)],
 129:[('tackle','Tackle','dash',26,1.15,155),('splash','Platscher · Spritzfächer','fan',10,1.8,225),('splash','Platscher · Welle','pulse',19,2.5,140),('tackle','Tackle · Sprung','dash',33,1.6,195)],
 132:[('transform','Wandler · Kopierstoß','dash',27,1.2,165),('transform','Wandler · Kopiersalve','fan',12,1.9,260),('transform','Wandler · Spiegelkreis','orbit',23,2.8,155),('transform','Wandler · Kopierimpuls','pulse',25,2.9,155)]
}

def move_set(i):
    if i in SPECIAL_MOVES:
        return [{'name':name,'type':TYPE_OVERRIDE.get(slug,TYPES[int(MOVES[slug]['type_id'])]),'pattern':shape,'power':power,'interval':interval,'range':reach}
                for slug,name,shape,power,interval,reach in SPECIAL_MOVES[i]]
    return [attack(slug,i,n) for n,slug in enumerate(PREFERENCES[i])]

ITEMS={int(x['id']):x['identifier'] for x in data['items.csv']}
EVOLUTIONS={i:[] for i in SPECIES}
for target in SPECIES:
    before=parent(target)
    if not before: continue
    rows=[x for x in data['pokemon_evolution.csv'] if int(x['evolved_species_id'])==target and x['version_group_id'] in ['1','2']]
    assert rows,(before,target)
    source=sorted(rows,key=lambda x:int(x['version_group_id']))[0]
    original=int(source['minimum_level'] or 0)
    stone=None
    if source['evolution_trigger_id']=='3':
        stone=ITEMS[int(source['trigger_item_id'])].replace('-stone','')
    elif source['evolution_trigger_id']=='2': stone='link'
    level=8 if stone else max(4,min(18,round(original/2)))
    if (before,target) in [(1,2),(4,5),(7,8)]: level=8
    elif (before,target) in [(2,3),(5,6),(8,9)]: level=16
    elif (before,target) in [(10,11),(13,14)]: level=4
    elif (before,target) in [(11,12),(14,15)]: level=8
    elif (before,target)==(19,20): level=10
    elif target in [65,68,76,94]: level=14
    elif (before,target)==(148,149): level=18
    entry={'to':target,'level':level}
    if stone: entry['stone']=stone
    EVOLUTIONS[before].append(entry)

LOCOMOTION={}
def movement(kind,ids):
    for i in ids: LOCOMOTION[i]=kind
movement('fly',[6,12,15,16,17,18,21,22,41,42,49,83,123,142,144,145,146,149])
movement('float',[81,82,92,93,94,109,110,137,150,151])
movement('hop',[11,14,35,36,39,40,43,44,45,69,70,71,74,75,100,101,102,103,120,121,129,132])
movement('slither',[10,13,23,24,50,51,88,89,95,147,148])
movement('swim',[60,61,72,73,79,80,86,87,90,91,116,117,118,119,130,131,138,139])
ROLES={'grass':'Saat & Kontrolle','fire':'Flammenangriff','water':'Wasserangriff','normal':'Nahkampf & Vielseitigkeit','electric':'Salvenangriff','bug':'Gift & Kontrolle','poison':'Giftangriff','flying':'Luftangriff','ground':'Bodenkontrolle','rock':'Felsenschutz','fighting':'Nahkampf','psychic':'Fernkampf & Fokus','ice':'Frostkontrolle','ghost':'Spuk & Kontrolle','dragon':'Drachenangriff'}
def trait(i,types):
    if i in [7,8,9,11,14,27,28,74,75,76,90,91,95,111,112,138,139,140,141,143]: return 'guard'
    if i in [1,2,3,35,36,43,44,45,102,103,113,114,151]: return 'heal'
    if i in [19,20,52,53,81,82,100,101]: return 'magnet'
    if i in [25,26,135]: return 'extra'
    if 'fire' in types: return 'burn'
    if 'ice' in types or i in [10,12,13,23,24,46,47,48,49,69,70,71,72,73,88,89,109,110]: return 'slow'
    if 'psychic' in types or 'ghost' in types or i in [83,106,107,123,127,132,147,148,149]: return 'focus'
    return 'none'

CATALOG=[]
for i in range(1,152):
    types=gen1_types(i)
    assert all(t in ['normal','fighting','flying','poison','ground','rock','bug','ghost','fire','water','grass','electric','psychic','ice','dragon'] for t in types),(i,types)
    entries=move_set(i)
    # Slot 0 is available immediately. It must always fight, even for a
    # newly caught healing specialist at trainer level 1.
    if entries[0]['pattern']=='heal':
        offensive=next(n for n,m in enumerate(entries) if m['pattern']!='heal')
        entries[0],entries[offensive]=entries[offensive],entries[0]
    assert len(entries)==4
    CATALOG.append({'id':i,'name':NAMES[i],'types':types,'moves':entries,'evolutions':EVOLUTIONS[i],
                    'stage':len(ancestors(i))-1,'locomotion':LOCOMOTION.get(i,'walk'),
                    'role':ROLES[types[0]],'traitKind':trait(i,types)})
assert sum(len(x['evolutions']) for x in CATALOG)==72
assert len({x['id'] for x in CATALOG})==151
assert gen1_types(81)==['electric'] and gen1_types(122)==['psychic']

HEADER="""// Generated by scripts/build-kanto-catalog.py. See KANTO-CATALOG.md for sources and adaptations.
// Source data: Copyright (c) 2013–2023 Paul Hallett and PokeAPI contributors; BSD-3-Clause.
// Full notice: public/art/data/PokeAPI-LICENSE.txt.
export type CatalogElement = 'normal'|'fighting'|'flying'|'poison'|'ground'|'rock'|'bug'|'ghost'|'fire'|'water'|'grass'|'electric'|'psychic'|'ice'|'dragon';
export type CatalogPattern = 'shot'|'fan'|'pulse'|'dash'|'heal'|'orbit';
export type Locomotion = 'walk'|'hop'|'fly'|'float'|'slither'|'swim';
export interface CatalogMove {name:string;type:CatalogElement;pattern:CatalogPattern;power:number;interval:number;range:number}
export interface CatalogEvolution {to:number;level:number;stone?:'leaf'|'fire'|'water'|'thunder'|'moon'|'link'}
export interface CatalogEntry {id:number;name:string;types:CatalogElement[];moves:[CatalogMove,CatalogMove,CatalogMove,CatalogMove];evolutions:CatalogEvolution[];stage:0|1|2;locomotion:Locomotion;role:string;traitKind:'heal'|'guard'|'burn'|'slow'|'magnet'|'extra'|'focus'|'none'}
export const KANTO_CATALOG: readonly CatalogEntry[] = [
"""
body=',\n'.join(' '+json.dumps(row,ensure_ascii=False,separators=(',',':')) for row in CATALOG)
gen1_type_names={t for row in CATALOG for t in row['types']}
chart={t:{} for t in sorted(gen1_type_names)}
for row in data['type_efficacy.csv']:
    attacker=TYPES[int(row['damage_type_id'])]
    defender=TYPES[int(row['target_type_id'])]
    if attacker in chart and defender in chart:
        factor=int(row['damage_factor'])/100
        if factor!=1: chart[attacker][defender]=factor
for row in data['type_efficacy_past.csv']:
    if row['generation_id']!='1': continue
    attacker=TYPES[int(row['damage_type_id'])]
    defender=TYPES[int(row['target_type_id'])]
    factor=int(row['damage_factor'])/100
    if factor!=1: chart[attacker][defender]=factor
    else: chart[attacker].pop(defender,None)
chart_code='\n// Unlisted pairings are neutral. Values precede Survivors effectiveness scaling.\nexport const KANTO_TYPE_CHART: Readonly<Record<CatalogElement,Partial<Record<CatalogElement,number>>>> = '+json.dumps(chart,ensure_ascii=False,indent=1)+';\n'
(ROOT/'src'/'kanto-catalog.ts').write_text(HEADER+body+'\n];\n'+chart_code,encoding='utf-8')
audit={'revision':REV,'sources':{name:{'url':f'https://raw.githubusercontent.com/PokeAPI/pokeapi/{REV}/data/v2/csv/{name}',
       'sha256':hashlib.sha256((CACHE/name).read_bytes()).hexdigest()} for name in FILES},
       'moveReplacements':AUDIT,
       'selectedMoveIds':{str(i):[int(MOVES[x]['id']) for x in PREFERENCES[i]] for i in PREFERENCES},
       'species':151,'evolutionEdges':72,'moves':604}
(ROOT/'qa'/'kanto-catalog-audit.json').write_text(json.dumps(audit,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
license_path=CACHE/'PokeAPI-LICENSE.txt'
if not license_path.exists():
    license_path.write_bytes(fetch(f'https://raw.githubusercontent.com/PokeAPI/pokeapi/{REV}/LICENSE.md'))
license_target=ROOT/'public'/'art'/'data'
license_target.mkdir(parents=True,exist_ok=True)
(license_target/'PokeAPI-LICENSE.txt').write_bytes(license_path.read_bytes())
print('Generated 151 species, 604 attacks, 72 evolution edges; source snapshot',REV)
print('Legal Gen-I replacements:',json.dumps(AUDIT,ensure_ascii=False))
