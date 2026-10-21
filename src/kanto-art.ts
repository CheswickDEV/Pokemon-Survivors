import type Phaser from 'phaser';
import type {BuildingKind} from './kanto-layout.ts';
export const BUILDING_FILES:Record<BuildingKind,string>={
 'house-red':'house-red','house-blue':'house-blue',lab:'oak-lab',center:'pokemon-center',mart:'mart',gym:'gym',
 department:'department-store',silph:'silph-office',tower:'lavender-tower',mansion:'mansion',league:'league',cave:'cave',
};
export function preloadKantoArt(scene:Phaser.Scene){
 for(const [kind,file] of Object.entries(BUILDING_FILES))scene.load.image('kanto-'+kind,'/art/kanto-v6/'+file+'.png');
}
