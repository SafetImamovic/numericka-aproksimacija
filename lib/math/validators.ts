import type { DataPoint, ValidationResult, CalculationType } from '@/lib/types'

/**
 * Validate data points for numerical calculations
 */
export function validateDataPoints(
  points: DataPoint[],
  options: {
    minPoints?: number
    requireUniqueX?: boolean
    requirePositiveX?: boolean
    requirePositiveY?: boolean
    calculationType?: CalculationType
  } = {}
): ValidationResult {
  const {
    minPoints = 2,
    requireUniqueX = false,
    requirePositiveX = false,
    requirePositiveY = false,
    calculationType,
  } = options

  const errors: string[] = []
  const warnings: string[] = []

  // Check minimum points
  if (points.length < minPoints) {
    errors.push(`minPoints:${minPoints}`)
  }

  // Check for valid numbers
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    if (isNaN(point.x) || !isFinite(point.x)) {
      errors.push(`invalidX:${i + 1}`)
    }
    if (isNaN(point.y) || !isFinite(point.y)) {
      errors.push(`invalidY:${i + 1}`)
    }
  }

  // Check for unique x values (required for interpolation)
  if (requireUniqueX) {
    const xValues = points.map((p) => p.x)
    const uniqueX = new Set(xValues)
    if (uniqueX.size !== xValues.length) {
      errors.push('uniqueXRequired')
    }
  }

  // Check for positive x values (required for power function)
  if (requirePositiveX) {
    const hasNonPositiveX = points.some((p) => p.x <= 0)
    if (hasNonPositiveX) {
      errors.push('positiveXRequired')
    }
  }

  // Check for positive y values (required for log transforms)
  if (requirePositiveY) {
    const hasNonPositiveY = points.some((p) => p.y <= 0)
    if (hasNonPositiveY) {
      errors.push('positiveYRequired')
    }
  }

  // Type-specific validations
  if (calculationType) {
    switch (calculationType) {
      case 'lagrange-interpolation':
      case 'newton-interpolation':
      case 'direct-interpolation':
        // Interpolation requires unique x values
        const xVals = points.map((p) => p.x)
        const uniqueXVals = new Set(xVals)
        if (uniqueXVals.size !== xVals.length) {
          errors.push('uniqueXRequired')
        }
        break

      case 'power-approximation':
        // Power function requires positive x and y
        if (points.some((p) => p.x <= 0)) {
          errors.push('positiveXRequired')
        }
        if (points.some((p) => p.y <= 0)) {
          errors.push('positiveYRequired')
        }
        break

      case 'exponential-approximation':
        // Exponential requires positive y
        if (points.some((p) => p.y <= 0)) {
          errors.push('positiveYRequired')
        }
        break
    }
  }

  // Warnings for potential numerical issues
  const xRange = Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x))
  const yRange = Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y))

  if (xRange > 1e6 || yRange > 1e6) {
    warnings.push('largeRange')
  }

  if (points.length > 20 && calculationType?.includes('interpolation')) {
    warnings.push('highDegreePolynomial')
  }

  return {
    isValid: errors.length === 0,
    errors: [...new Set(errors)], // Remove duplicates
    warnings: [...new Set(warnings)],
  }
}

/**
 * Parse CSV data into data points
 */
export function parseCSV(content: string): DataPoint[] {
  const lines = content.trim().split('\n')
  const points: DataPoint[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    // Try comma first, then semicolon, then tab
    let parts = trimmed.split(',')
    if (parts.length !== 2) {
      parts = trimmed.split(';')
    }
    if (parts.length !== 2) {
      parts = trimmed.split('\t')
    }

    if (parts.length === 2) {
      const x = parseFloat(parts[0].trim())
      const y = parseFloat(parts[1].trim())

      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y })
      }
    }
  }

  return points
}

/**
 * Parse JSON data into data points
 */
export function parseJSON(content: string): DataPoint[] {
  try {
    const data = JSON.parse(content)

    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array')
    }

    const points: DataPoint[] = []
    for (const item of data) {
      if (typeof item.x === 'number' && typeof item.y === 'number') {
        points.push({ x: item.x, y: item.y })
      }
    }

    return points
  } catch {
    return []
  }
}

/**
 * Detect file type and parse accordingly
 */
export function parseFile(content: string, filename: string): DataPoint[] {
  const extension = filename.toLowerCase().split('.').pop()

  if (extension === 'json') {
    return parseJSON(content)
  }

  // CSV, DAT, TXT and any other text format
  return parseCSV(content)
}

/**
 * Check if a string is a valid number
 */
export function isValidNumber(value: string): boolean {
  if (value.trim() === '') return false
  const num = parseFloat(value)
  return !isNaN(num) && isFinite(num)
}

/**
 * Format validation error message key for i18n
 */
export function getValidationErrorKey(error: string): string {
  if (error.startsWith('minPoints:')) {
    return 'validation.minPoints'
  }
  if (error.startsWith('invalidX:') || error.startsWith('invalidY:')) {
    return 'validation.invalidNumber'
  }
  if (error === 'uniqueXRequired') {
    return 'validation.uniqueXRequired'
  }
  if (error === 'positiveXRequired') {
    return 'validation.positiveXRequired'
  }
  if (error === 'positiveYRequired') {
    return 'validation.positiveYRequired'
  }
  return 'validation.error'
}
