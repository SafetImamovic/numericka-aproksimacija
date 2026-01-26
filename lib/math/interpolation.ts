import type { DataPoint, InterpolationResult, CalculationType } from '@/lib/types'
import {
  solveLinearSystem,
  vandermondeMatrix,
  matrixToLatex,
  vectorToLatex,
  formatNumber,
} from './matrix-utils'
import { polynomialToLatex, evaluatePolynomial } from './expression-parser'

/**
 * Calculate absolute and relative errors for each data point
 */
function calculatePointErrors(points: DataPoint[], result: InterpolationResult): { absolute: number, relative: number }[] {
  return points.map(point => {
    const yPred = evaluatePolynomial(result.coefficients, point.x)
    const absolute = Math.abs(point.y - yPred)
    const relative = point.y !== 0 ? absolute / Math.abs(point.y) : 0
    return { absolute, relative }
  })
}

/**
 * Lagrange interpolation
 * P(x) = Σ yₖ·Lₖ(x) where Lₖ(x) = Π(i≠k) (x - xᵢ)/(xₖ - xᵢ)
 */
export function lagrangeInterpolation(points: DataPoint[]): InterpolationResult & { steps: string[] } {
  const n = points.length
  const steps: string[] = []
  const basisPolynomials: string[] = []

  steps.push(`\\text{Lagrange Interpolation for } n = ${n} \\text{ points}`)
  steps.push(`P(x) = \\sum_{k=0}^{${n - 1}} y_k \\cdot L_k(x)`)
  steps.push(`L_k(x) = \\prod_{i \\neq k} \\frac{x - x_i}{x_k - x_i}`)

  // Calculate basis polynomials symbolically
  for (let k = 0; k < n; k++) {
    const numeratorTerms: string[] = []
    const denominatorTerms: string[] = []
    let denominator = 1

    for (let i = 0; i < n; i++) {
      if (i !== k) {
        const xi = points[i].x
        const xk = points[k].x

        // Build symbolic terms
        if (xi >= 0) {
          numeratorTerms.push(`(x - ${formatNumber(xi)})`)
        } else {
          numeratorTerms.push(`(x + ${formatNumber(-xi)})`)
        }

        denominator *= xk - xi
        denominatorTerms.push(`(${formatNumber(xk)} - ${formatNumber(xi)})`)
      }
    }

    const basisStr = `L_{${k}}(x) = \\frac{${numeratorTerms.join(' \\cdot ')}}{${formatNumber(denominator)}}`
    basisPolynomials.push(basisStr)

    steps.push(`${basisStr}`)
  }

  // Compute the coefficients by expanding
  const coefficients = computeLagrangeCoefficients(points)

  steps.push(`\\text{Expanding and combining terms:}`)
  steps.push(`P(x) = ${polynomialToLatex(coefficients)}`)

  const result: InterpolationResult & { steps: string[] } = {
    type: 'lagrange-interpolation',
    polynomial: polynomialToLatex(coefficients),
    coefficients,
    points,
    basisPolynomials,
    steps,
  }

  result.pointErrors = calculatePointErrors(points, result)
  return result
}

/**
 * Compute Lagrange coefficients numerically
 */
function computeLagrangeCoefficients(points: DataPoint[]): number[] {
  const n = points.length
  const coefficients = new Array(n).fill(0)

  for (let k = 0; k < n; k++) {
    // Compute the k-th basis polynomial coefficients
    const basisCoefs = computeBasisPolynomialCoefficients(points, k)

    // Multiply by y_k and add to result
    const yk = points[k].y
    for (let i = 0; i < n; i++) {
      coefficients[i] += yk * basisCoefs[i]
    }
  }

  return coefficients
}

/**
 * Compute coefficients of the k-th Lagrange basis polynomial
 */
function computeBasisPolynomialCoefficients(points: DataPoint[], k: number): number[] {
  const n = points.length
  const xk = points[k].x

  // Start with constant polynomial [1]
  let coefs = [1]

  // Multiply by (x - xi)/(xk - xi) for each i ≠ k
  for (let i = 0; i < n; i++) {
    if (i === k) continue

    const xi = points[i].x
    const divisor = xk - xi

    // Multiply current polynomial by (x - xi)
    const newCoefs = new Array(coefs.length + 1).fill(0)

    // (x - xi) * polynomial = x * polynomial - xi * polynomial
    for (let j = 0; j < coefs.length; j++) {
      newCoefs[j] += -xi * coefs[j] / divisor
      newCoefs[j + 1] += coefs[j] / divisor
    }

    coefs = newCoefs
  }

  return coefs
}

/**
 * Newton interpolation with divided differences
 * P(x) = f[x₀] + f[x₀,x₁](x-x₀) + f[x₀,x₁,x₂](x-x₀)(x-x₁) + ...
 */
export function newtonInterpolation(points: DataPoint[]): InterpolationResult & { steps: string[] } {
  const n = points.length
  const steps: string[] = []

  steps.push(`\\text{Newton Interpolation with Divided Differences}`)
  steps.push(`P(x) = f[x_0] + \\sum_{k=1}^{${n - 1}} f[x_0, ..., x_k] \\prod_{i=0}^{k-1}(x - x_i)`)

  // Build divided differences table
  const divDiff: number[][] = []

  // First column is y values
  divDiff[0] = points.map((p) => p.y)

  steps.push(`\\text{Divided Differences Table:}`)

  // Compute higher order differences
  for (let j = 1; j < n; j++) {
    divDiff[j] = []
    for (let i = 0; i < n - j; i++) {
      divDiff[j][i] =
        (divDiff[j - 1][i + 1] - divDiff[j - 1][i]) /
        (points[i + j].x - points[i].x)
    }
  }

  // Format divided differences table for steps
  let tableStr = '\\begin{array}{c|' + 'c'.repeat(n) + '}'
  tableStr += ' x_i & f[\\cdot]'
  for (let j = 1; j < n; j++) {
    tableStr += ` & f[${'\\cdot,'.repeat(j)}\\cdot]`
  }
  tableStr += ' \\\\ \\hline'

  for (let i = 0; i < n; i++) {
    tableStr += ` ${formatNumber(points[i].x)}`
    for (let j = 0; j < n - i; j++) {
      tableStr += ` & ${formatNumber(divDiff[j][i])}`
    }
    for (let j = n - i; j < n; j++) {
      tableStr += ' &'
    }
    tableStr += ' \\\\'
  }
  tableStr += '\\end{array}'
  steps.push(tableStr)

  // Build Newton polynomial
  steps.push(`\\text{Newton polynomial:}`)

  let newtonStr = `P(x) = ${formatNumber(divDiff[0][0])}`
  for (let k = 1; k < n; k++) {
    const coef = divDiff[k][0]
    if (Math.abs(coef) < 1e-10) continue

    let term = ''
    for (let i = 0; i < k; i++) {
      const xi = points[i].x
      if (xi >= 0) {
        term += `(x - ${formatNumber(xi)})`
      } else {
        term += `(x + ${formatNumber(-xi)})`
      }
    }

    if (coef >= 0) {
      newtonStr += ` + ${formatNumber(coef)}${term}`
    } else {
      newtonStr += ` - ${formatNumber(-coef)}${term}`
    }
  }
  steps.push(newtonStr)

  // Convert to standard polynomial form
  const coefficients = computeNewtonCoefficients(points, divDiff)

  steps.push(`\\text{Standard form:}`)
  steps.push(`P(x) = ${polynomialToLatex(coefficients)}`)

  const result: InterpolationResult & { steps: string[] } = {
    type: 'newton-interpolation',
    polynomial: polynomialToLatex(coefficients),
    coefficients,
    points,
    dividedDifferences: divDiff,
    steps,
  }

  result.pointErrors = calculatePointErrors(points, result)
  return result
}

/**
 * Convert Newton form to standard polynomial coefficients
 */
function computeNewtonCoefficients(points: DataPoint[], divDiff: number[][]): number[] {
  const n = points.length
  const coefficients = new Array(n).fill(0)

  // Start with just the constant term
  let currentPoly = [divDiff[0][0]]

  for (let k = 1; k < n; k++) {
    // Multiply current polynomial by (x - x_{k-1})
    const factor = [-points[k - 1].x, 1] // represents (x - x_{k-1})
    const newPoly = multiplyPolynomials(currentPoly, factor)

    // Scale by the divided difference and add to result
    const coef = divDiff[k][0]
    for (let i = 0; i < newPoly.length; i++) {
      if (i < coefficients.length) {
        coefficients[i] += coef * newPoly[i]
      }
    }

    // Update current polynomial for next iteration
    currentPoly = newPoly.map((c, i) => (i < currentPoly.length ? currentPoly[i] : 0) + c * 0)
    // Actually we need to track the product of (x-x0)(x-x1)...(x-x_{k-1})
    currentPoly = newPoly
  }

  // Add the constant term
  coefficients[0] = divDiff[0][0]

  // Recalculate more carefully
  return computeNewtonCoefficientsCareful(points, divDiff)
}

function computeNewtonCoefficientsCareful(points: DataPoint[], divDiff: number[][]): number[] {
  const n = points.length

  // Build polynomial term by term
  // P(x) = c0 + c1*(x-x0) + c2*(x-x0)*(x-x1) + ...

  // Start with polynomial = c0
  const result = [divDiff[0][0]]

  // Current product (x-x0)(x-x1)...(x-x_{k-1})
  let product = [1]

  for (let k = 1; k < n; k++) {
    // Multiply product by (x - x_{k-1})
    product = multiplyPolynomials(product, [-points[k - 1].x, 1])

    // Add c_k * product to result
    const ck = divDiff[k][0]
    while (result.length < product.length) {
      result.push(0)
    }

    for (let i = 0; i < product.length; i++) {
      result[i] += ck * product[i]
    }
  }

  return result
}

/**
 * Multiply two polynomials represented as coefficient arrays
 */
function multiplyPolynomials(a: number[], b: number[]): number[] {
  const result = new Array(a.length + b.length - 1).fill(0)

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j]
    }
  }

  return result
}

/**
 * Direct method using Vandermonde matrix
 */
export function directInterpolation(points: DataPoint[]): InterpolationResult & { steps: string[] } {
  const n = points.length
  const steps: string[] = []
  const degree = n - 1

  steps.push(`\\text{Direct Interpolation using Vandermonde Matrix}`)
  steps.push(`\\text{For } n = ${n} \\text{ points, we find a polynomial of degree } ${degree}`)

  // Create Vandermonde matrix
  const V = vandermondeMatrix(points.map((p) => p.x), degree)
  const y = points.map((p) => p.y)

  steps.push(`\\text{Vandermonde matrix } V:`)
  steps.push(matrixToLatex(V))

  steps.push(`\\text{System of equations } V \\cdot \\mathbf{a} = \\mathbf{y}:`)
  steps.push(`${matrixToLatex(V)} ${vectorToLatex(['a_0', 'a_1', '...', `a_{${degree}}`] as unknown as number[])} = ${vectorToLatex(y)}`)

  // Solve the system
  const coefficients = solveLinearSystem(V, y)

  steps.push(`\\text{Solution:}`)
  for (let i = 0; i <= degree; i++) {
    steps.push(`a_${i} = ${formatNumber(coefficients[i])}`)
  }

  steps.push(`\\text{Result:}`)
  steps.push(`P(x) = ${polynomialToLatex(coefficients)}`)

  const result: InterpolationResult & { steps: string[] } = {
    type: 'direct-interpolation',
    polynomial: polynomialToLatex(coefficients),
    coefficients,
    points,
    vandermondeMatrix: V,
    steps,
  }

  result.pointErrors = calculatePointErrors(points, result)
  return result
}

/**
 * Main interpolation function that dispatches to the appropriate method
 */
export function interpolate(
  points: DataPoint[],
  type: CalculationType
): InterpolationResult & { steps: string[] } {
  // Check for unique x values
  const xValues = points.map((p) => p.x)
  const uniqueX = new Set(xValues)
  if (uniqueX.size !== xValues.length) {
    throw new Error('Interpolation requires unique x values')
  }

  switch (type) {
    case 'lagrange-interpolation':
      return lagrangeInterpolation(points)
    case 'newton-interpolation':
      return newtonInterpolation(points)
    case 'direct-interpolation':
      return directInterpolation(points)
    default:
      throw new Error(`Unknown interpolation type: ${type}`)
  }
}

/**
 * Evaluate interpolation polynomial at a specific x value
 */
export function evaluateInterpolation(result: InterpolationResult, x: number): number {
  return evaluatePolynomial(result.coefficients, x)
}
