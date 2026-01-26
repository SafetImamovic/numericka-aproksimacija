import type { DataPoint, ApproximationResult, CalculationType } from '@/lib/types'
import {
  solveLinearSystem,
  vandermondeMatrix,
  normalEquationsMatrix,
  normalEquationsVector,
  matrixToLatex,
  vectorToLatex,
  formatNumber,
} from './matrix-utils'
import { polynomialToLatex, generatePolynomialPoints } from './expression-parser'

/**
 * Calculate the sum of x^power for all points
 */
function sumPow(points: DataPoint[], power: number): number {
  return points.reduce((sum, p) => sum + Math.pow(p.x, power), 0)
}

/**
 * Calculate the sum of x^power * y for all points
 */
function sumXPowY(points: DataPoint[], power: number): number {
  return points.reduce((sum, p) => sum + Math.pow(p.x, power) * p.y, 0)
}

/**
 * Calculate R-squared (coefficient of determination)
 */
function calculateRSquared(points: DataPoint[], coefficients: number[]): number {
  const n = points.length
  const yMean = points.reduce((sum, p) => sum + p.y, 0) / n

  let ssTot = 0 // Total sum of squares
  let ssRes = 0 // Residual sum of squares

  for (const point of points) {
    let yPred = 0
    for (let i = 0; i < coefficients.length; i++) {
      yPred += coefficients[i] * Math.pow(point.x, i)
    }

    ssTot += Math.pow(point.y - yMean, 2)
    ssRes += Math.pow(point.y - yPred, 2)
  }

  return 1 - ssRes / ssTot
}

/**
 * Calculate sum of squared errors
 */
function calculateSSE(points: DataPoint[], coefficients: number[]): number {
  let sse = 0
  for (const point of points) {
    let yPred = 0
    for (let i = 0; i < coefficients.length; i++) {
      yPred += coefficients[i] * Math.pow(point.x, i)
    }
    sse += Math.pow(point.y - yPred, 2)
  }
  return sse
}

/**
 * Linear least squares approximation: y = a + bx
 */
export function linearApproximation(points: DataPoint[]): ApproximationResult & { steps: string[] } {
  const n = points.length
  const steps: string[] = []

  // Calculate sums
  const sumX = sumPow(points, 1)
  const sumX2 = sumPow(points, 2)
  const sumY = sumXPowY(points, 0)
  const sumXY = sumXPowY(points, 1)

  steps.push(`N = ${n}`)
  steps.push(`\\sum x_i = ${formatNumber(sumX)}`)
  steps.push(`\\sum x_i^2 = ${formatNumber(sumX2)}`)
  steps.push(`\\sum y_i = ${formatNumber(sumY)}`)
  steps.push(`\\sum x_i y_i = ${formatNumber(sumXY)}`)

  // Normal equations matrix
  const A = [
    [n, sumX],
    [sumX, sumX2],
  ]
  const b = [sumY, sumXY]

  steps.push(`\\text{Normal equations:}`)
  steps.push(`${matrixToLatex(A)} ${vectorToLatex(['a', 'b'] as unknown as number[])} = ${vectorToLatex(b)}`)

  // Solve
  const coefficients = solveLinearSystem(A, b)

  steps.push(`\\text{Solution:}`)
  steps.push(`a = ${formatNumber(coefficients[0])}, \\quad b = ${formatNumber(coefficients[1])}`)

  // Generate fitted points for plotting
  const xMin = Math.min(...points.map((p) => p.x))
  const xMax = Math.max(...points.map((p) => p.x))
  const fittedPoints = generatePolynomialPoints(coefficients, { min: xMin, max: xMax })

  return {
    type: 'linear-approximation',
    coefficients,
    polynomial: polynomialToLatex(coefficients),
    rSquared: calculateRSquared(points, coefficients),
    sumSquaredError: calculateSSE(points, coefficients),
    points,
    fittedPoints,
    steps,
  }
}

/**
 * Quadratic least squares approximation: y = a + bx + cx²
 */
export function quadraticApproximation(points: DataPoint[]): ApproximationResult & { steps: string[] } {
  const n = points.length
  const steps: string[] = []

  // Calculate sums
  const sumX = sumPow(points, 1)
  const sumX2 = sumPow(points, 2)
  const sumX3 = sumPow(points, 3)
  const sumX4 = sumPow(points, 4)
  const sumY = sumXPowY(points, 0)
  const sumXY = sumXPowY(points, 1)
  const sumX2Y = sumXPowY(points, 2)

  steps.push(`N = ${n}`)
  steps.push(`\\sum x_i = ${formatNumber(sumX)}, \\quad \\sum x_i^2 = ${formatNumber(sumX2)}`)
  steps.push(`\\sum x_i^3 = ${formatNumber(sumX3)}, \\quad \\sum x_i^4 = ${formatNumber(sumX4)}`)
  steps.push(`\\sum y_i = ${formatNumber(sumY)}, \\quad \\sum x_i y_i = ${formatNumber(sumXY)}, \\quad \\sum x_i^2 y_i = ${formatNumber(sumX2Y)}`)

  // Normal equations matrix
  const A = [
    [n, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4],
  ]
  const b = [sumY, sumXY, sumX2Y]

  steps.push(`\\text{Normal equations:}`)
  steps.push(`${matrixToLatex(A)} ${vectorToLatex(['a', 'b', 'c'] as unknown as number[])} = ${vectorToLatex(b)}`)

  // Solve
  const coefficients = solveLinearSystem(A, b)

  steps.push(`\\text{Solution:}`)
  steps.push(`a = ${formatNumber(coefficients[0])}, \\quad b = ${formatNumber(coefficients[1])}, \\quad c = ${formatNumber(coefficients[2])}`)

  // Generate fitted points
  const xMin = Math.min(...points.map((p) => p.x))
  const xMax = Math.max(...points.map((p) => p.x))
  const fittedPoints = generatePolynomialPoints(coefficients, { min: xMin, max: xMax })

  return {
    type: 'quadratic-approximation',
    coefficients,
    polynomial: polynomialToLatex(coefficients),
    rSquared: calculateRSquared(points, coefficients),
    sumSquaredError: calculateSSE(points, coefficients),
    points,
    fittedPoints,
    steps,
  }
}

/**
 * General polynomial least squares approximation
 */
export function polynomialApproximation(
  points: DataPoint[],
  degree: number
): ApproximationResult & { steps: string[]; normalMatrix: number[][]; normalVector: number[] } {
  const steps: string[] = []

  // Create Vandermonde matrix
  const V = vandermondeMatrix(points.map((p) => p.x), degree)
  const y = points.map((p) => p.y)

  steps.push(`\\text{Vandermonde matrix } V:`)
  steps.push(matrixToLatex(V))

  // Create normal equations
  const AtA = normalEquationsMatrix(V)
  const Atb = normalEquationsVector(V, y)

  steps.push(`\\text{Normal equations } V^T V \\cdot \\mathbf{a} = V^T \\mathbf{y}:`)
  steps.push(`${matrixToLatex(AtA)} \\mathbf{a} = ${vectorToLatex(Atb)}`)

  // Solve
  const coefficients = solveLinearSystem(AtA, Atb)

  steps.push(`\\text{Solution:}`)
  for (let i = 0; i <= degree; i++) {
    steps.push(`a_${i} = ${formatNumber(coefficients[i])}`)
  }

  // Generate fitted points
  const xMin = Math.min(...points.map((p) => p.x))
  const xMax = Math.max(...points.map((p) => p.x))
  const fittedPoints = generatePolynomialPoints(coefficients, { min: xMin, max: xMax })

  return {
    type: 'polynomial-approximation',
    coefficients,
    polynomial: polynomialToLatex(coefficients),
    rSquared: calculateRSquared(points, coefficients),
    sumSquaredError: calculateSSE(points, coefficients),
    points,
    fittedPoints,
    steps,
    normalMatrix: AtA,
    normalVector: Atb,
  }
}

/**
 * Power function approximation: y = ax^b
 * Uses linearization: ln(y) = ln(a) + b*ln(x)
 */
export function powerApproximation(points: DataPoint[]): ApproximationResult & { steps: string[]; transformedPoints: DataPoint[] } {
  const steps: string[] = []

  // Check for positive values
  if (points.some((p) => p.x <= 0 || p.y <= 0)) {
    throw new Error('Power approximation requires positive x and y values')
  }

  // Transform to linear: X = ln(x), Y = ln(y)
  const transformedPoints = points.map((p) => ({
    x: Math.log(p.x),
    y: Math.log(p.y),
  }))

  steps.push(`\\text{Linearization: } \\ln(y) = \\ln(a) + b \\ln(x)`)
  steps.push(`\\text{Let } X = \\ln(x), \\quad Y = \\ln(y)`)
  steps.push(`\\text{Then } Y = \\ln(a) + b X`)

  // Apply linear regression on transformed data
  const n = transformedPoints.length
  const sumX = transformedPoints.reduce((s, p) => s + p.x, 0)
  const sumX2 = transformedPoints.reduce((s, p) => s + p.x * p.x, 0)
  const sumY = transformedPoints.reduce((s, p) => s + p.y, 0)
  const sumXY = transformedPoints.reduce((s, p) => s + p.x * p.y, 0)

  const A = [
    [n, sumX],
    [sumX, sumX2],
  ]
  const bVec = [sumY, sumXY]

  const linearCoefs = solveLinearSystem(A, bVec)
  const lnA = linearCoefs[0]
  const b = linearCoefs[1]
  const a = Math.exp(lnA)

  steps.push(`\\text{Linear regression on transformed data:}`)
  steps.push(`\\ln(a) = ${formatNumber(lnA)}, \\quad b = ${formatNumber(b)}`)
  steps.push(`a = e^{${formatNumber(lnA)}} = ${formatNumber(a)}`)
  steps.push(`\\text{Result: } y = ${formatNumber(a)} \\cdot x^{${formatNumber(b)}}`)

  // Generate fitted points using power function
  const xMin = Math.min(...points.map((p) => p.x))
  const xMax = Math.max(...points.map((p) => p.x))
  const fittedPoints: DataPoint[] = []
  const numPoints = 100
  const step = (xMax - xMin) / (numPoints - 1)

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step
    const y = a * Math.pow(x, b)
    fittedPoints.push({ x, y })
  }

  // Calculate R-squared for power model
  const yMean = points.reduce((s, p) => s + p.y, 0) / n
  let ssTot = 0
  let ssRes = 0
  for (const point of points) {
    const yPred = a * Math.pow(point.x, b)
    ssTot += Math.pow(point.y - yMean, 2)
    ssRes += Math.pow(point.y - yPred, 2)
  }
  const rSquared = 1 - ssRes / ssTot

  return {
    type: 'power-approximation',
    coefficients: [a, b],
    polynomial: `${formatNumber(a)} \\cdot x^{${formatNumber(b)}}`,
    rSquared,
    sumSquaredError: ssRes,
    points,
    fittedPoints,
    steps,
    transformedPoints,
  }
}

/**
 * Exponential approximation: y = ae^(bx)
 * Uses linearization: ln(y) = ln(a) + b*x
 */
export function exponentialApproximation(points: DataPoint[]): ApproximationResult & { steps: string[]; transformedPoints: DataPoint[] } {
  const steps: string[] = []

  // Check for positive y values
  if (points.some((p) => p.y <= 0)) {
    throw new Error('Exponential approximation requires positive y values')
  }

  // Transform: Y = ln(y)
  const transformedPoints = points.map((p) => ({
    x: p.x,
    y: Math.log(p.y),
  }))

  steps.push(`\\text{Linearization: } \\ln(y) = \\ln(a) + bx`)
  steps.push(`\\text{Let } Y = \\ln(y)`)
  steps.push(`\\text{Then } Y = \\ln(a) + bx`)

  // Apply linear regression
  const n = transformedPoints.length
  const sumX = transformedPoints.reduce((s, p) => s + p.x, 0)
  const sumX2 = transformedPoints.reduce((s, p) => s + p.x * p.x, 0)
  const sumY = transformedPoints.reduce((s, p) => s + p.y, 0)
  const sumXY = transformedPoints.reduce((s, p) => s + p.x * p.y, 0)

  const A = [
    [n, sumX],
    [sumX, sumX2],
  ]
  const bVec = [sumY, sumXY]

  const linearCoefs = solveLinearSystem(A, bVec)
  const lnA = linearCoefs[0]
  const b = linearCoefs[1]
  const a = Math.exp(lnA)

  steps.push(`\\text{Linear regression on transformed data:}`)
  steps.push(`\\ln(a) = ${formatNumber(lnA)}, \\quad b = ${formatNumber(b)}`)
  steps.push(`a = e^{${formatNumber(lnA)}} = ${formatNumber(a)}`)
  steps.push(`\\text{Result: } y = ${formatNumber(a)} \\cdot e^{${formatNumber(b)}x}`)

  // Generate fitted points
  const xMin = Math.min(...points.map((p) => p.x))
  const xMax = Math.max(...points.map((p) => p.x))
  const fittedPoints: DataPoint[] = []
  const numPoints = 100
  const step = (xMax - xMin) / (numPoints - 1)

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step
    const y = a * Math.exp(b * x)
    fittedPoints.push({ x, y })
  }

  // Calculate R-squared
  const yMean = points.reduce((s, p) => s + p.y, 0) / n
  let ssTot = 0
  let ssRes = 0
  for (const point of points) {
    const yPred = a * Math.exp(b * point.x)
    ssTot += Math.pow(point.y - yMean, 2)
    ssRes += Math.pow(point.y - yPred, 2)
  }
  const rSquared = 1 - ssRes / ssTot

  return {
    type: 'exponential-approximation',
    coefficients: [a, b],
    polynomial: `${formatNumber(a)} \\cdot e^{${formatNumber(b)}x}`,
    rSquared,
    sumSquaredError: ssRes,
    points,
    fittedPoints,
    steps,
    transformedPoints,
  }
}

/**
 * Main approximation function that dispatches to the appropriate method
 */
export function approximate(
  points: DataPoint[],
  type: CalculationType,
  degree?: number
): ApproximationResult & { steps: string[] } {
  switch (type) {
    case 'linear-approximation':
      return linearApproximation(points)
    case 'quadratic-approximation':
      return quadraticApproximation(points)
    case 'polynomial-approximation':
      return polynomialApproximation(points, degree || 3)
    case 'power-approximation':
      return powerApproximation(points)
    case 'exponential-approximation':
      return exponentialApproximation(points)
    default:
      throw new Error(`Unknown approximation type: ${type}`)
  }
}
