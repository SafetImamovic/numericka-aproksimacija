// Data point type for interpolation/approximation
export interface DataPoint {
  x: number
  y: number
}

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
export type PrecisionLevel = 2 | 3 | 4 | 5 | 6 | 8 | 10

export const PRECISION_OPTIONS: { value: PrecisionLevel; label: string }[] = [
  { value: 2, label: '10⁻²' },
  { value: 3, label: '10⁻³' },
  { value: 4, label: '10⁻⁴' },
  { value: 5, label: '10⁻⁵' },
  { value: 6, label: '10⁻⁶' },
  { value: 8, label: '10⁻⁸' },
  { value: 10, label: '10⁻¹⁰' },
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
  vandermondeMatrix: string
  normalEquationsVTV: string
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
}
