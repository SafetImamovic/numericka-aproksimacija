import type { DataPoint } from '@/lib/types'

export interface ExampleDataset {
  id: string
  points: DataPoint[]
}

// --- Approximation datasets (curve-fitting) ---

export const approximationDatasets: ExampleDataset[] = [
  {
    id: 'temperatureAltitude',
    points: [
      { x: 0, y: 20 },
      { x: 500, y: 16.8 },
      { x: 1000, y: 13.3 },
      { x: 1500, y: 10.1 },
      { x: 2000, y: 6.5 },
      { x: 2500, y: 3.2 },
      { x: 3000, y: 0.1 },
    ],
  },
  {
    id: 'projectileMotion',
    points: [
      { x: 0, y: 0 },
      { x: 0.5, y: 11.3 },
      { x: 1, y: 19.6 },
      { x: 1.5, y: 24.9 },
      { x: 2, y: 27.2 },
      { x: 2.5, y: 26.5 },
      { x: 3, y: 22.8 },
      { x: 3.5, y: 16.1 },
      { x: 4, y: 6.4 },
    ],
  },
  {
    id: 'seasonalSales',
    points: [
      { x: 1, y: 120 },
      { x: 2, y: 98 },
      { x: 3, y: 110 },
      { x: 4, y: 135 },
      { x: 5, y: 160 },
      { x: 6, y: 178 },
      { x: 7, y: 190 },
      { x: 8, y: 185 },
      { x: 9, y: 170 },
      { x: 10, y: 148 },
      { x: 11, y: 130 },
      { x: 12, y: 142 },
    ],
  },
  {
    id: 'areaScaling',
    points: [
      { x: 1, y: 1 },
      { x: 2, y: 4.1 },
      { x: 3, y: 8.9 },
      { x: 4, y: 16.2 },
      { x: 5, y: 24.8 },
      { x: 6, y: 36.3 },
      { x: 7, y: 49.1 },
    ],
  },
  {
    id: 'bacterialGrowth',
    points: [
      { x: 0, y: 100 },
      { x: 1, y: 122 },
      { x: 2, y: 151 },
      { x: 3, y: 182 },
      { x: 4, y: 225 },
      { x: 5, y: 271 },
      { x: 6, y: 335 },
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
]
