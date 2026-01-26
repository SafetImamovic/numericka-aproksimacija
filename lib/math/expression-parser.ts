import { create, all, type MathJsInstance } from 'mathjs'
import type { DataPoint, FunctionInput } from '@/lib/types'

// Create a mathjs instance with all functions
const math: MathJsInstance = create(all)

/**
 * Parse and evaluate a mathematical expression at a given x value
 */
export function evaluateExpression(expression: string, x: number): number {
  try {
    // Replace common notations with mathjs compatible syntax
    const normalized = normalizeExpression(expression)
    const result = math.evaluate(normalized, { x })

    if (typeof result === 'number' && isFinite(result)) {
      return result
    }

    throw new Error('Expression did not evaluate to a finite number')
  } catch (error) {
    throw new Error(`Failed to evaluate expression: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Normalize mathematical expression for mathjs parsing
 */
function normalizeExpression(expression: string): string {
  const normalized = expression
    // Replace e^x with exp(x)
    .replace(/e\^(\([^)]+\))/g, 'exp($1)')
    .replace(/e\^(-?\d+\.?\d*)/g, 'exp($1)')
    .replace(/e\^x/g, 'exp(x)')
    .replace(/e\^(-?x)/g, 'exp($1)')
    // Replace ln with log (mathjs uses log for natural log)
    .replace(/\bln\(/g, 'log(')
    // Replace log10 for base-10 log
    .replace(/\blog10\(/g, 'log10(')
    // Handle implicit multiplication: 2x -> 2*x, x2 -> x*2
    .replace(/(\d)([a-zA-Z])/g, '$1*$2')
    .replace(/([a-zA-Z])(\d)/g, '$1*$2')
    // Handle implicit multiplication with parentheses: 2(x) -> 2*(x), (x)2 -> (x)*2
    .replace(/(\d)\(/g, '$1*(')
    .replace(/\)(\d)/g, ')*$1')
    // Handle )( -> )*(
    .replace(/\)\(/g, ')*(')
    // Handle x( -> x*(
    .replace(/([a-zA-Z])\(/g, (match, letter) => {
      // Don't add * before function names
      const funcs = ['sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'abs', 'ceil', 'floor', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh']
      const preceding = normalized.substring(0, normalized.indexOf(match)).split(/[^a-zA-Z]/).pop() || ''
      const funcName = preceding + letter
      if (funcs.includes(funcName)) {
        return match
      }
      return `${letter}*(`
    })

  return normalized
}

/**
 * Validate if an expression is syntactically correct
 */
export function validateExpression(expression: string): { isValid: boolean; error?: string } {
  if (!expression.trim()) {
    return { isValid: false, error: 'Expression is empty' }
  }

  try {
    // Try parsing the expression
    const normalized = normalizeExpression(expression)
    math.parse(normalized)

    // Try evaluating at a test point
    const testResult = math.evaluate(normalized, { x: 1 })

    if (typeof testResult !== 'number' || !isFinite(testResult)) {
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

  for (let i = 0; i < sampleCount; i++) {
    const x = domain.min + i * step
    try {
      const y = evaluateExpression(expression, x)
      if (isFinite(y)) {
        points.push({ x, y })
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
 * Format a coefficient for display
 */
function formatCoefficient(n: number, precision: number): string {
  if (Math.abs(n - Math.round(n)) < 1e-10) {
    return Math.round(n).toString()
  }
  console.log("Coefficient Ovdje")
  return n.toFixed(precision).replace(/\.?0+$/, '')
}

/**
 * Get supported functions list for display
 */
export function getSupportedFunctions(): string[] {
  return [
    'sin(x), cos(x), tan(x)',
    'asin(x), acos(x), atan(x)',
    'sinh(x), cosh(x), tanh(x)',
    'exp(x), e^x',
    'log(x), ln(x), log10(x)',
    'sqrt(x), abs(x)',
    'ceil(x), floor(x)',
    'x^n, x**n',
  ]
}
