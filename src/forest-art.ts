/** FireRed source art, decoded with its original palettes. See public/art/forest/PROVENANCE.md. */
import type Phaser from 'phaser';

export const FOREST_IMAGES = {
  tree: { key: 'forest-tree', url: '/art/forest/tree.png', width: 32, height: 48, originX: .5, originY: .9 },
  sapling: { key: 'forest-sapling', url: '/art/forest/sapling.png', width: 16, height: 32, originX: .5, originY: .9 },
  bush: { key: 'forest-bush', url: '/art/forest/bush.png', width: 16, height: 16, originX: .5, originY: .85 },
  sign: { key: 'forest-sign', url: '/art/forest/sign.png', width: 16, height: 16, originX: .5, originY: .9 },
  cabin: { key: 'forest-cabin', url: '/art/forest/cabin.png', width: 64, height: 48, originX: .5, originY: 1 },
  rock: { key: 'forest-rock', url: '/art/forest/rock.png', width: 16, height: 16, originX: .5, originY: .9 },
} as const;

export const FOREST_SHEETS = {
  grass: { key: 'forest-grass', url: '/art/forest/grass.png', frameWidth: 16, frameHeight: 16, frameCount: 6 },
  path: { key: 'forest-path', url: '/art/forest/path.png', frameWidth: 16, frameHeight: 16, frameCount: 9 },
  flower: { key: 'forest-flower', url: '/art/forest/flowers.png', frameWidth: 16, frameHeight: 16, frameCount: 5 },
  water: { key: 'forest-water', url: '/art/forest/water.png', frameWidth: 16, frameHeight: 16, frameCount: 8 },
} as const;

/** Path frames form a nine-slice: NW,N,NE / W,center,E / SW,S,SE. All are opaque ground. */
export const FOREST_PATH_FRAMES = { nw: 0, n: 1, ne: 2, w: 3, center: 4, e: 5, sw: 6, s: 7, se: 8 } as const;

/** Normal source rate: one frame per 16 video frames (~3.75fps). */
export const FOREST_ANIMATIONS = {
  flower: { key: 'forest-flower-sway', texture: FOREST_SHEETS.flower.key, end: 4, frameRate: 3.75 },
  water: { key: 'forest-water-ripple', texture: FOREST_SHEETS.water.key, end: 7, frameRate: 3.75 },
} as const;

export function preloadForestArt(scene: Phaser.Scene): void {
  for (const image of Object.values(FOREST_IMAGES)) scene.load.image(image.key, image.url);
  for (const sheet of Object.values(FOREST_SHEETS)) scene.load.spritesheet(sheet.key, sheet.url, { frameWidth: sheet.frameWidth, frameHeight: sheet.frameHeight });
}

export function registerForestAnimations(scene: Phaser.Scene): void {
  for (const animation of Object.values(FOREST_ANIMATIONS)) {
    if (!scene.anims.exists(animation.key)) scene.anims.create({ key: animation.key, frames: scene.anims.generateFrameNumbers(animation.texture, { start: 0, end: animation.end }), frameRate: animation.frameRate, repeat: -1 });
  }
}
