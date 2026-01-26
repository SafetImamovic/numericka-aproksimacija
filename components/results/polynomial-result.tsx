'use client'

import { useState, useCallback } from 'react'
import { Copy, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LatexBlock } from '@/components/math/latex-display'
import { FunctionPlot } from '@/components/math/function-plot'
import type { ApproximationResult, InterpolationResult } from '@/lib/types'

interface PolynomialResultProps {
  result: ApproximationResult | InterpolationResult
  onEvaluate?: (x: number) => number | null
  onSaveToHistory?: () => void
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
  }
}

export function PolynomialResult({
  result,
  onEvaluate,
  onSaveToHistory,
  translations,
}: PolynomialResultProps) {
  const [evalX, setEvalX] = useState('')
  const [evalResult, setEvalResult] = useState<{ x: number; y: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleCopyLatex = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`P(x) = ${result.polynomial}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [result.polynomial])

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

  const isApproximation = 'rSquared' in result

  // Get fitted points for plotting
  const fittedPoints = isApproximation
    ? (result as ApproximationResult).fittedPoints
    : []

  return (
    <div className="space-y-6">
      {/* Polynomial display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{translations.polynomial}</h4>
          <div className="flex gap-2">
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

        <LatexBlock latex={`P(x) = ${result.polynomial}`} />
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
              a<sub>{i}</sub> = {coef.toFixed(6)}
            </div>
          ))}
        </div>
      </div>

      {/* Approximation-specific metrics */}
      {isApproximation && (
        <div className="grid grid-cols-2 gap-4">
          {(result as ApproximationResult).rSquared !== undefined && (
            <div className="p-3 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                {translations.rSquared}
              </p>
              <p className="text-lg font-mono font-semibold">
                {((result as ApproximationResult).rSquared! * 100).toFixed(2)}%
              </p>
            </div>
          )}
          {(result as ApproximationResult).sumSquaredError !== undefined && (
            <div className="p-3 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                {translations.sumSquaredError}
              </p>
              <p className="text-lg font-mono font-semibold">
                {(result as ApproximationResult).sumSquaredError!.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Graph */}
      <div className="space-y-3">
        <h4 className="font-medium">{translations.graph}</h4>
        <FunctionPlot
          dataPoints={result.points}
          fittedCurve={fittedPoints}
          height={350}
        />
      </div>

      {/* Evaluate polynomial */}
      {onEvaluate && (
        <div className="space-y-3">
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
                className="font-mono"
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
                latex={`P(${evalResult.x}) = ${evalResult.y.toFixed(6)}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
