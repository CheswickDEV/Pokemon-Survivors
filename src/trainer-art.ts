/** Original input sheets plus metadata for the eight-direction runtime projection.
 * Source provenance remains in /art/trainers/SOURCES.md; see TRAINER-MOTION.md for rendering. */
export type TrainerId = 'red' | 'leaf' | 'ethan' | 'kris' | 'brendan' | 'may';
export const TRAINER_DIRECTIONS=['down','downRight','right','upRight','up','upLeft','left','downLeft'] as const;
export type TrainerDirection = typeof TRAINER_DIRECTIONS[number];

export interface TrainerArt {
  id: TrainerId;
  name: string;
  region: 'Kanto' | 'Johto' | 'Hoenn';
  /** Generation in which the playable character first appeared, not the sprite's hardware generation. */
  generation: 1 | 2 | 3;
  edition: string;
  /** Original 12 x 32px source frames, retained unchanged. */
  sheet: string;
  portrait: string;
  frameWidth: number;
  frameHeight: number;
  /** Eight articulated walk phases per direction in the runtime atlas. */
  animations: Record<TrainerDirection, number[]>;
  idleFrames: Record<TrainerDirection,number>;
  frameRate: number;
  /** Atlas cells are 64px; preserve the existing visible size of every trainer. */
  displayScale: number;
  groundOrigin: number;
}

const animations = (): TrainerArt['animations'] => Object.fromEntries(TRAINER_DIRECTIONS.map((direction,row)=>[direction,Array.from({length:8},(_,i)=>row*9+i+1)])) as TrainerArt['animations'];

const trainer = (id: TrainerId, name: string, region: TrainerArt['region'], generation: TrainerArt['generation'], edition: string): TrainerArt => ({
  id, name, region, generation, edition,
  sheet: `/art/trainers/${id}.png`, portrait: `/art/trainers/${id}-portrait.png`,
  frameWidth: 64, frameHeight: 64, animations: animations(), frameRate: 8/ (120/140), displayScale: generation===2?.7:1.2,groundOrigin:generation===2?1:62/64,
  idleFrames:Object.fromEntries(TRAINER_DIRECTIONS.map((direction,row)=>[direction,row*9])) as TrainerArt['idleFrames'],
});

export const DEFAULT_TRAINER_ID: TrainerId = 'red';
export const TRAINERS: readonly TrainerArt[] = [
  trainer('red', 'Rot', 'Kanto', 1, 'Feuerrot / Blattgrün'),
  trainer('ethan', 'Klarin', 'Johto', 2, 'Kristall'),
  trainer('kris', 'Kris', 'Johto', 2, 'Kristall'),
  trainer('brendan', 'Brix', 'Hoenn', 3, 'Smaragd'),
  trainer('may', 'Maike', 'Hoenn', 3, 'Smaragd'),
  trainer('leaf', 'Blatt', 'Kanto', 3, 'Feuerrot / Blattgrün'),
];

/** Old saves and unknown preferences fall back to Rot. */
export function trainerById(id: unknown): TrainerArt {
  return TRAINERS.find(entry => entry.id === id) ?? TRAINERS[0];
}
