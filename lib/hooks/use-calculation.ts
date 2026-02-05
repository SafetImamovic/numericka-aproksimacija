'use client'

import { useState, useCallback } from 'react'
import type {
  DataPoint,
  CalculationType,
  ApproximationResult,
  InterpolationResult,
  ValidationResult,
  StepTranslations,
  PrecisionLevel,
} from '@/lib/types'
import { validateDataPoints } from '@/lib/math/validators'
import { approximate } from '@/lib/math/approximation'
import { interpolate, evaluateInterpolation } from '@/lib/math/interpolation'
import { evaluatePolynomial } from '@/lib/math/expression-parser'

type CalculationResult = (ApproximationResult | InterpolationResult) & { steps: string[] }

interface CalculationOptions {
  degree?: number
  stepTranslations?: StepTranslations
  precision?: PrecisionLevel
}

interface UseCalculationReturn {
  result: CalculationResult | null
  error: string | null
  validation: ValidationResult | null
  isCalculating: boolean
  calculate: (points: DataPoint[], type: CalculationType, options?: CalculationOptions) => void
  evaluate: (x: number, precision?: PrecisionLevel) => number | null
  clear: () => void
}

export function useCalculation(): UseCalculationReturn {
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculate = useCallback(
    (points: DataPoint[], type: CalculationType, options?: CalculationOptions) => {
      setIsCalculating(true)
      setError(null)
      setResult(null)

      // Determine validation requirements based on calculation type
      const isInterpolation = type.includes('interpolation')
      const isPower = type === 'power-approximation'
      const isExponential = type === 'exponential-approximation'

      // Minimalan broj tačaka zavisi od metode:
      // - linear: 2
      // - quadratic: 3 (a + bx + cx^2)
      // - polynomial stepena d: d+1
      let minPoints = 2

      if (isInterpolation) {
        minPoints = 2
      } else if (type === 'quadratic-approximation') {
        minPoints = 3
      } else if (type === 'polynomial-approximation') {
        const degree = Math.max(1, options?.degree ?? 1)
        minPoints = degree + 1
      }
      
      const requireUniqueX = isInterpolation
      const requirePositiveX = isPower
      const requirePositiveY = isPower || isExponential

      // Validate data points
      const validationResult = validateDataPoints(points, {
        minPoints,
        requireUniqueX,
        requirePositiveX,
        requirePositiveY,
        calculationType: type,
      })

      setValidation(validationResult)

      if (!validationResult.isValid) {
        setError('Validation failed')
        setIsCalculating(false)
        return
      }

      const precision = options?.precision ?? 4

      try {
        let calculationResult: CalculationResult

        if (isInterpolation) {
          calculationResult = interpolate(points, type, options?.stepTranslations, precision)
        } else {
          calculationResult = approximate(points, type, options?.degree, options?.stepTranslations, precision)
        }

        setResult(calculationResult)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Calculation failed')
      } finally {
        setIsCalculating(false)
      }
    },
    []
  )

  const evaluate = useCallback(
    (x: number): number | null => {
      if (!result) return null

      try {
        if (result.type.includes('interpolation')) {
          return evaluateInterpolation(result as InterpolationResult, x)
        } else {
          const approxResult = result as ApproximationResult

          // Handle special cases for power and exponential
          if (result.type === 'power-approximation') {
            const [a, b] = approxResult.coefficients
            return a * Math.pow(x, b)
          }

          if (result.type === 'exponential-approximation') {
            const [a, b] = approxResult.coefficients
            return a * Math.exp(b * x)
          }

          // Standard polynomial evaluation
          return evaluatePolynomial(approxResult.coefficients, x)
        }
      } catch {
        return null
      }
    },
    [result]
  )

  const clear = useCallback(() => {
    setResult(null)
    setError(null)
    setValidation(null)
  }, [])

  return {
    result,
    error,
    validation,
    isCalculating,
    calculate,
    evaluate,
    clear,
  }
}
