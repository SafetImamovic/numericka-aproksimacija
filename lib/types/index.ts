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

// Approximation result
export interface ApproximationResult {
  type: CalculationType
  coefficients: number[]
  polynomial: string // LaTeX representation
  rSquared?: number // Coefficient of determination
  sumSquaredError?: number
  points: DataPoint[] // Original data points
  fittedPoints: DataPoint[] // Points on the fitted curve
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
