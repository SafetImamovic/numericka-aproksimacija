import { ComputeEngine } from './compute-engine.esm.js'
import type { DataPoint, FunctionInput } from '@/lib/types'

// Create a Compute Engine instance
const ce = new ComputeEngine()

/**
 * Parse and evaluate a mathematical expression at a given x value
 */
export function evaluateExpression(expression: string, x: number): number {
  try {
    const expr = ce.parse(expression)
    // Use .N() for numeric evaluation and handle possible non-number returns
    const result = expr.subs({ x }).N().numericValue

    if (result === null || result === undefined) {
      throw new Error('Expression did not evaluate to a value')
    }

    const val = typeof result === 'number' ? result : Number(result)
    if (isNaN(val) || !isFinite(val)) {
      throw new Error('Expression did not evaluate to a finite number')
    }

    return val
  } catch (error) {
    throw new Error(`Failed to evaluate expression: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate if an expression is syntactically correct
 */
export function validateExpression(expression: string): { isValid: boolean; error?: string } {
  if (!expression.trim()) {
    return { isValid: false, error: 'Expression is empty' }
  }

  try {
    const expr = ce.parse(expression)

    // Check for obvious parsing errors (e.g., unexpected tokens)
    if (expr.head === 'Error') {
      return { isValid: false, error: 'Malformed expression' }
    }

    // Try evaluating at a test point
    const testResult = expr.subs({ x: 1 }).N().numericValue
    const val = typeof testResult === 'number' ? testResult : Number(testResult)

    if (isNaN(val) || !isFinite(val)) {
      return { isValid: false, error: 'Expression does not evaluate to a number' }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid expression',
    }
  }
}

/**
 * Generate sample points from a function expression
 */
export function generatePointsFromExpression(input: FunctionInput): DataPoint[] {
  const { expression, domain, sampleCount } = input

  const validation = validateExpression(expression)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  if (domain.min >= domain.max) {
    throw new Error('Domain min must be less than max')
  }

  if (sampleCount < 2) {
    throw new Error('Sample count must be at least 2')
  }

  const points: DataPoint[] = []
  const step = (domain.max - domain.min) / (sampleCount - 1)

  // Compile expression for better performance in loops
  const compiledExpr = ce.parse(expression)

  for (let i = 0; i < sampleCount; i++) {
    const x = domain.min + i * step
    try {
      const result = compiledExpr.subs({ x }).N().numericValue
      if (result !== null && result !== undefined) {
        const y = typeof result === 'number' ? result : Number(result)
        if (!isNaN(y) && isFinite(y)) {
          points.push({ x, y })
        }
      }
    } catch {
      // Skip points where evaluation fails (e.g., log of negative number)
    }
  }

  return points
}

/**
 * Generate points for plotting a polynomial
 */
export function generatePolynomialPoints(
  coefficients: number[],
  domain: { min: number; max: number },
  numPoints: number = 100
): DataPoint[] {
  const points: DataPoint[] = []
  const step = (domain.max - domain.min) / (numPoints - 1)

  for (let i = 0; i < numPoints; i++) {
    const x = domain.min + i * step
    let y = 0

    for (let j = 0; j < coefficients.length; j++) {
      y += coefficients[j] * Math.pow(x, j)
    }

    points.push({ x, y })
  }

  return points
}

/**
 * Evaluate a polynomial at a given x value
 */
export function evaluatePolynomial(coefficients: number[], x: number): number {
  let result = 0
  for (let i = 0; i < coefficients.length; i++) {
    result += coefficients[i] * Math.pow(x, i)
  }
  return result
}

/**
 * Format a polynomial as LaTeX
 */
export function polynomialToLatex(coefficients: number[], precision: number = 4): string {
  if (coefficients.length === 0) return '0'

  const terms: string[] = []

  for (let i = coefficients.length - 1; i >= 0; i--) {
    const coef = coefficients[i]

    // Skip zero coefficients
    if (Math.abs(coef) < 1e-10) continue

    let term = ''
    const absCoef = Math.abs(coef)
    const sign = coef < 0 ? '-' : terms.length > 0 ? '+' : ''

    // Format coefficient
    const coefStr = formatCoefficient(absCoef, precision)

    if (i === 0) {
      // Constant term
      term = `${sign} ${coefStr}`
    } else if (i === 1) {
      // Linear term
      if (absCoef === 1) {
        term = `${sign} x`
      } else {
        term = `${sign} ${coefStr}x`
      }
    } else {
      // Higher degree terms
      if (absCoef === 1) {
        term = `${sign} x^{${i}}`
      } else {
        term = `${sign} ${coefStr}x^{${i}}`
      }
    }

    terms.push(term.trim())
  }

  if (terms.length === 0) return '0'

  return terms.join(' ').replace(/^\+ /, '')
}

/**
 * Format a polynomial as LaTeX with scientific notation for coefficients.
 * Each coefficient is displayed as A·10^B where A has one digit before decimal.
 */
export function polynomialToLatexScientific(coefficients: number[], precision: number = 4): string {
  if (coefficients.length === 0) return '0'

  const terms: string[] = []

  for (let i = coefficients.length - 1; i >= 0; i--) {
    const coef = coefficients[i]
    if (Math.abs(coef) < 1e-15) continue

    const sign = coef < 0 ? '-' : terms.length > 0 ? '+' : ''
    const absCoef = Math.abs(coef)
    const coefStr = formatCoefficientScientific(absCoef, precision)

    let term = ''
    if (i === 0) {
      term = `${sign} ${coefStr}`
    } else if (i === 1) {
      term = `${sign} ${coefStr} \\cdot x`
    } else {
      term = `${sign} ${coefStr} \\cdot x^{${i}}`
    }

    terms.push(term.trim())
  }

  if (terms.length === 0) return '0'
  return terms.join(' ').replace(/^\+ /, '')
}

function formatCoefficientScientific(n: number, precision: number): string {
  if (n === 0) return '0'
  // Integers and "normal" numbers: keep as-is
  if (Math.abs(n) >= 0.01 && Math.abs(n) < 1e4) {
    return formatCoefficient(n, precision)
  }
  const eksponent = Math.floor(Math.log10(Math.abs(n)))
  const mantisa = n / Math.pow(10, eksponent)
  const mantisaStr = mantisa.toFixed(precision).replace(/\.?0+$/, '')
  return `${mantisaStr} \\cdot 10^{${eksponent}}`
}

/**
 * Format a coefficient for display
 */
function formatCoefficient(n: number | string, precision: number): string {
  const num = typeof n === 'number' ? n : Number(n)
  if (isNaN(num) || !isFinite(num)) return '0'
  if (Math.abs(num - Math.round(num)) < 1e-10) {
    return Math.round(num).toString()
  }
  return num.toFixed(precision).replace(/\.?0+$/, '')
}

/**
 * Get supported functions list for display
 */
export function getSupportedFunctions(): string[] {
  return [
    '\\sin(x), \\cos(x), \\tan(x)',
    '\\arcsin(x), \\arccos(x), \\arctan(x)',
    '\\sinh(x), \\cosh(x), \\tanh(x)',
    '\\exp(x), e^x',
    '\\ln(x), \\log_{10}(x)',
    '\\sqrt{x}, |x|',
    'x^n',
  ]
}
