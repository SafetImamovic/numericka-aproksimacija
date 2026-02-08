// Data point type for interpolation/approximation
export interface DataPoint {
  x: number
  y: number
}

// Solver method for linear systems (interpolation & approximation)
export type MetodaRjesavanja = 'gauss' | 'gauss-jordan' | 'lu-doolittle'

// Calculation types
export type CalculationType =
  | 'linear-approximation'
  | 'quadratic-approximation'
  | 'polynomial-approximation'
  | 'power-approximation'
  | 'exponential-approximation'
  | 'lagrange-interpolation'
  | 'newton-interpolation'
  | 'direct-interpolation'

// Error information for a single data point
export interface PointError {
  absolute: number
  relative: number
}

// Approximation result
export interface ApproximationResult {
  type: CalculationType
  coefficients: number[]
  polynomial: string // LaTeX representation
  rSquared?: number // Coefficient of determination
  sumSquaredError?: number
  points: DataPoint[] // Original data points
  fittedPoints: DataPoint[] // Points on the fitted curve
  pointErrors?: PointError[] // Errors for each input point
}

// Interpolation result
export interface InterpolationResult {
  type: CalculationType
  polynomial: string // LaTeX representation
  coefficients: number[]
  points: DataPoint[]
  dividedDifferences?: number[][] // For Newton method
  basisPolynomials?: string[] // For Lagrange method
  vandermondeMatrix?: number[][] // For direct method
  pointErrors?: PointError[] // Errors for each input point
  metodaRjesavanja?: MetodaRjesavanja // Solver method used (direct interpolation)
}

// Calculation history entry
export interface HistoryEntry {
  id: string
  timestamp: number
  type: CalculationType
  points: DataPoint[]
  result: ApproximationResult | InterpolationResult
  evaluatedAt?: { x: number; y: number }[]
}

// Input mode for data entry
export type InputMode = 'manual' | 'file' | 'function'

// Precision options for calculation results
export type PrecisionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12

export const PRECISION_OPTIONS: { value: PrecisionLevel; latex: string }[] = [
  { value: 1, latex: '10^{-1}' },
  { value: 2, latex: '10^{-2}' },
  { value: 3, latex: '10^{-3}' },
  { value: 4, latex: '10^{-4}' },
  { value: 5, latex: '10^{-5}' },
  { value: 6, latex: '10^{-6}' },
  { value: 8, latex: '10^{-8}' },
  { value: 10, latex: '10^{-10}' },
  { value: 12, latex: '10^{-12}' },
]

// Function expression input
export interface FunctionInput {
  expression: string
  domain: { min: number; max: number }
  sampleCount: number
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Plot data for visualization
export interface PlotData {
  dataPoints: DataPoint[]
  fittedCurve?: { x: number[]; y: number[] }
  title?: string
  xLabel?: string
  yLabel?: string
}

// Matrix types for calculations
export type Matrix = number[][]
export type Vector = number[]

// Step translations for calculation steps
export interface StepTranslations {
  normalEquations: string
  solution: string
  linearization: string
  let: string
  then: string
  linearRegressionTransformed: string
  result: string
  coefficientMatrix: string
  expandingTerms: string
  standardForm: string
  lagrangeInterpolation: string
  points: string
  dividedDifferencesTable: string
  newtonInterpolation: string
  newtonPolynomial: string
  directInterpolation: string
  forNPoints: string
  findPolynomialDegree: string
  systemOfEquations: string
  // Gauss elimination steps
  gaussElimination?: string
  augmentedMatrix?: string
  pivoting?: string
  rowSwap?: string
  eliminationStep?: string
  backSubstitution?: string
  upperTriangularForm?: string
  // Gauss-Jordan steps
  gaussJordan?: string
  reducedRowEchelonForm?: string
  normalizeRow?: string
  eliminateAbove?: string
  // LU factorization steps
  luFactorization?: string
  lMatrix?: string
  uMatrix?: string
  forwardSubstitution?: string
  backwardSubstitution?: string
  luDecomposition?: string
  solvingLy?: string
  solvingUx?: string
}
