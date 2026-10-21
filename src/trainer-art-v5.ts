import type {TrainerDirection, TrainerId} from './trainer-art.ts';

/** Newly drawn whole-character diagonal views. Matching original cardinal rows are transparent.
 * Each file uses the existing 9-column by 8-direction atlas layout (64 px cells).
 * Column 0 is the rest pose, columns 1-8 are walk phases. Left views mirror entire poses.
 */
export const TRAINER_DIAGONAL_ROWS: readonly TrainerDirection[] = ['downRight', 'upRight', 'upLeft', 'downLeft'];
export const TRAINER_DIAGONAL_SHEETS: Record<TrainerId, string> = {
  red: '/art/trainers-v5/red-diagonals.png',
  leaf: '/art/trainers-v5/leaf-diagonals.png',
  ethan: '/art/trainers-v5/ethan-diagonals.png',
  kris: '/art/trainers-v5/kris-diagonals.png',
  brendan: '/art/trainers-v5/brendan-diagonals.png',
  may: '/art/trainers-v5/may-diagonals.png',
};

/** Full replacement atlas: original cardinal art is no longer needed at runtime. */
export const TRAINER_COMPLETE_SHEETS: Record<TrainerId, string> = {
  red: '/art/trainers-v5/red-complete.png',
  leaf: '/art/trainers-v5/leaf-complete.png',
  ethan: '/art/trainers-v5/ethan-complete.png',
  kris: '/art/trainers-v5/kris-complete.png',
  brendan: '/art/trainers-v5/brendan-complete.png',
  may: '/art/trainers-v5/may-complete.png',
};
