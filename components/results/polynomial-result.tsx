'use client'

import { useState, useCallback, useMemo } from 'react'
import { Copy, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LatexBlock, LatexDisplay } from '@/components/math/latex-display'
import { polynomialToLatexScientific } from '@/lib/math/expression-parser'
import type { ApproximationResult, InterpolationResult, PrecisionLevel } from '@/lib/types'

interface PolynomialResultProps {
  result: ApproximationResult | InterpolationResult
  onEvaluate?: (x: number) => number | null
  onSaveToHistory?: () => void
  precision?: PrecisionLevel
  translations: {
    polynomial: string
    graph: string
    copyLatex: string
    saveToHistory: string
    evaluate: string
    evaluateAt: string
    evaluatedValue: string
    rSquared?: string
    sumSquaredError?: string
    coefficients: string
    absoluteError?: string
    relativeError?: string
    pointErrors?: string
    scientificNotation?: string
  }
}

function formatCoefficientSci(n: number, precision: number): string {
  console.log("Called! Polynomial Result")
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs > 1.0 || abs < 0.0) {
    if (Math.abs(n - Math.round(n)) < 1e-10) return Math.round(n).toString()
    return n.toFixed(precision).replace(/\.?0+$/, '')
  }
  const exp = Math.floor(Math.log10(abs))
  const mantissa = n / Math.pow(10, exp)
  const mStr = mantissa.toFixed(precision).replace(/\.?0+$/, '')
  return `${mStr} \\cdot 10^{${exp}}`
}

function buildScientificPolynomial(result: ApproximationResult | InterpolationResult, precision: number): string {
  const type = result.type
  const [a, b] = result.coefficients

  if (type === 'power-approximation') {
    const aStr = formatCoefficientSci(a, precision)
    const bStr = formatCoefficientSci(b, precision)
    return `${aStr} \\cdot x^{${bStr}}`
  }

  if (type === 'exponential-approximation') {
    const aStr = formatCoefficientSci(a, precision)
    const bStr = formatCoefficientSci(b, precision)
    return `${aStr} \\cdot e^{${bStr} \\cdot x}`
  }

  return polynomialToLatexScientific(result.coefficients, precision)
}

export function PolynomialResult({
  result,
  onEvaluate,
  onSaveToHistory,
  precision = 6,
  translations,
}: PolynomialResultProps) {
  const [evalX, setEvalX] = useState('')
  const [evalResult, setEvalResult] = useState<{ x: number; y: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [scientificNotation, setScientificNotation] = useState(false)

  const displayPolynomial = useMemo(() => {
    if (!scientificNotation) return result.polynomial
    return buildScientificPolynomial(result, precision)
  }, [scientificNotation, result, precision])

  const handleCopyLatex = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`P(x) = ${displayPolynomial}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [displayPolynomial])

  const handleSave = useCallback(() => {
    onSaveToHistory?.()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [onSaveToHistory])

  const handleEvaluate = useCallback(() => {
    const x = parseFloat(evalX)
    if (isNaN(x) || !onEvaluate) return

    const y = onEvaluate(x)
    if (y !== null) {
      setEvalResult({ x, y })
    }
  }, [evalX, onEvaluate])

  return (
    <div className="space-y-6">
      {/* Polynomial display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{translations.polynomial}</h4>
          <div className="flex gap-2">
            {translations.scientificNotation && (
              <Button
                variant={scientificNotation ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScientificNotation((v) => !v)}
                className="h-8 "
              >
                {translations.scientificNotation}:
                <LatexDisplay latex={`a \\cdot 10^n`} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLatex}
              className="h-8"
            >
              {copied ? (
                <Check className="h-4 w-4 mr-1 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {translations.copyLatex}
            </Button>
            {onSaveToHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8"
              >
                {saved ? (
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {translations.saveToHistory}
              </Button>
            )}
          </div>
        </div>

        <LatexBlock latex={`P(x) = ${displayPolynomial}`} />
      </div>

      {/* Coefficients */}
      <div className="space-y-2">
        <h4 className="font-medium">{translations.coefficients}</h4>
        <div className="flex flex-wrap gap-2">
          {result.coefficients.map((coef, i) => (
            <div
              key={i}
              className="px-3 py-1 bg-card border border-border rounded-md text-sm font-mono"
            >
              a<sub>{i}</sub> = {coef.toFixed(precision)}
            </div>
          ))}
        </div>
      </div>

      {/* Evaluate polynomial */}
      {onEvaluate && (
        <div className="space-y-3 pt-6 border-t border-border">
          <h4 className="font-medium">{translations.evaluate}</h4>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">
                {translations.evaluateAt}
              </label>
              <Input
                type="number"
                step="any"
                value={evalX}
                onChange={(e) => setEvalX(e.target.value)}
                placeholder="x"
                className="font-mono text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
              />
            </div>
            <Button onClick={handleEvaluate} disabled={!evalX}>
              {translations.evaluate}
            </Button>
          </div>

          {evalResult && (
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <LatexBlock
                latex={`P(${evalResult.x}) = ${evalResult.y.toFixed(precision)}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
