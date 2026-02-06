import type { DataPoint } from '@/lib/types'

export interface ExampleDataset {
  id: string
  points: DataPoint[]
}

// --- Approximation datasets (curve-fitting) ---

export const approximationDatasets: ExampleDataset[] = [
  {
    id: 'hookovZakon',
    points: [
      { x: 2, y: 5.1 },
      { x: 4, y: 9.8 },
      { x: 6, y: 15.2 },
      { x: 8, y: 19.9 },
      { x: 10, y: 25.1 },
    ],
  },
  {
    id: 'kondenzator',
    points: [
      { x: 0, y: 10.0 },
      { x: 1, y: 6.1 },
      { x: 2, y: 3.7 },
      { x: 3, y: 2.2 },
      { x: 4, y: 1.4 },
    ],
  },
  {
    id: 'pump',
    points: [
      { x: 0, y: 50.0 },
      { x: 10, y: 49.2 },
      { x: 20, y: 46.5 },
      { x: 30, y: 42.1 },
      { x: 40, y: 35.5 },
    ],
  },
  {
    id: 'proj',
    points: [
      { x: 0, y: 5.0 },
      { x: 10, y: 7.8 },
      { x: 20, y: 8.9 },
      { x: 30, y: 8.2 },
      { x: 40, y: 5.7 },
    ],
  },
  {
    id: 'fluid',
    points: [
      { x: 1, y: 0.5 },
      { x: 2, y: 2.1 },
      { x: 3, y: 4.8 },
      { x: 4, y: 8.9 },
      { x: 5, y: 14.2 },
    ],
  },
  {
    id: 'studyScores',
    points: [
      { x: 1, y: 45 },
      { x: 2, y: 55 },
      { x: 3, y: 58 },
      { x: 4, y: 68 },
      { x: 5, y: 72 },
      { x: 6, y: 78 },
      { x: 7, y: 82 },
      { x: 8, y: 88 },
    ],
  },
  {
    id: 'cpLowTemp',
    points: [
      { x: 300, y: 1.0045 },
      { x: 400, y: 1.0134 },
      { x: 500, y: 1.0296 },
      { x: 600, y: 1.0507 },
      { x: 700, y: 1.0743 },
      { x: 800, y: 1.0984 },
      { x: 900, y: 1.1212 },
      { x: 1000, y: 1.1410 },
    ],
  },
  {
    id: 'cpHighTemp',
    points: [
      { x: 1000, y: 1.1410 },
      { x: 1500, y: 1.2095 },
      { x: 2000, y: 1.2520 },
      { x: 2500, y: 1.2782 },
      { x: 3000, y: 1.2955 },
    ],
  },
  {
    id: 'expDoubling',
    points: [
      { x: 0, y: 3 },
      { x: 1, y: 6 },
      { x: 2, y: 12 },
      { x: 3, y: 24 },
      { x: 4, y: 48 },
    ],
  },
]

// --- Interpolation datasets (polynomial construction) ---

export const interpolationDatasets: ExampleDataset[] = [
  {
    id: 'textbookBasic',
    points: [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 7 },
      { x: 3, y: 13 },
    ],
  },
  {
    id: 'sineSampling',
    points: [
      { x: 0, y: 0 },
      { x: 1.571, y: 1 },
      { x: 3.142, y: 0 },
      { x: 4.712, y: -1 },
      { x: 6.283, y: 0 },
    ],
  },
  {
    id: 'pressureVolume',
    points: [
      { x: 1, y: 8.314 },
      { x: 2, y: 4.157 },
      { x: 4, y: 2.079 },
      { x: 8, y: 1.039 },
      { x: 16, y: 0.52 },
    ],
  },
  {
    id: 'squareRootData',
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 4, y: 2 },
      { x: 9, y: 3 },
      { x: 16, y: 4 },
      { x: 25, y: 5 },
    ],
  },
  {
    id: 'rungeExample',
    points: [
      { x: -5, y: 0.038 },
      { x: -3, y: 0.1 },
      { x: -1, y: 0.5 },
      { x: 0, y: 1 },
      { x: 1, y: 0.5 },
      { x: 3, y: 0.1 },
      { x: 5, y: 0.038 },
    ],
  },
  {
    id: 'populationData',
    points: [
      { x: 1960, y: 3.03 },
      { x: 1970, y: 3.7 },
      { x: 1980, y: 4.44 },
      { x: 1990, y: 5.32 },
      { x: 2000, y: 6.14 },
      { x: 2010, y: 6.96 },
    ],
  },
  {
    id: 'reciprocalSmall',
    points: [
      { x: 3.35, y: 0.298507 },
      { x: 3.40, y: 0.294118 },
      { x: 3.50, y: 0.285714 },
      { x: 3.60, y: 0.277778 },
    ],
  },
  {
    id: 'reciprocalLarge',
    points: [
      { x: 3.1, y: 0.322581 },
      { x: 3.2, y: 0.312500 },
      { x: 3.3, y: 0.303030 },
      { x: 3.4, y: 0.294118 },
      { x: 3.5, y: 0.285714 },
      { x: 3.6, y: 0.277778 },
      { x: 3.7, y: 0.270270 },
      { x: 3.8, y: 0.263158 },
      { x: 3.9, y: 0.256410 },
    ],
  },
]
