'use client'

import { useState, useCallback } from 'react'
import { Play, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MathInput } from '@/components/math/math-input'
import { LatexDisplay } from '@/components/math/latex-display'
import {
  validateExpression,
  generatePointsFromExpression,
  getSupportedFunctions,
} from '@/lib/math/expression-parser'
import type { DataPoint, FunctionInput as FunctionInputType } from '@/lib/types'

interface FunctionInputState {
  expression: string
  domainMin: string
  domainMax: string
  sampleCount: string
}

interface FunctionInputProps {
  onPointsGenerated: (points: DataPoint[], originalCurve?: DataPoint[]) => void
  disabled?: boolean
  state: FunctionInputState
  onStateChange: (state: FunctionInputState) => void
  translations: {
    functionExpression: string
    functionPlaceholder: string
    domainMin: string
    domainMax: string
    samplePoints: string
    generatePoints: string
    invalidExpression: string
    domainError: string
    preview: string
    dataPoints: string
    usePoints: string
    cancel: string
    help: string
    supportedFunctions: string
    andMore: string
    sampleCountError: string
    notEnoughPoints: string
  }
}

export type { FunctionInputState }

export function FunctionInput({
  onPointsGenerated,
  disabled = false,
  state,
  onStateChange,
  translations,
}: FunctionInputProps) {
  const { expression, domainMin, domainMax, sampleCount } = state
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<DataPoint[] | null>(null)
  const [originalCurve, setOriginalCurve] = useState<DataPoint[] | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  const updateState = (updates: Partial<FunctionInputState>) => {
    onStateChange({ ...state, ...updates })
  }

  const handleGenerate = useCallback(() => {
    setError(null)
    setPreview(null)
    setOriginalCurve(null)

    // Validate expression
    const validation = validateExpression(expression)
    if (!validation.isValid) {
      setError(validation.error || translations.invalidExpression)
      return
    }

    // Validate domain
    const min = parseFloat(domainMin)
    const max = parseFloat(domainMax)
    const count = parseInt(sampleCount, 10)

    if (isNaN(min) || isNaN(max) || min >= max) {
      setError(translations.domainError)
      return
    }

    if (isNaN(count) || count < 2 || count > 100) {
      setError(translations.sampleCountError)
      return
    }

    try {
      const input: FunctionInputType = {
        expression,
        domain: { min, max },
        sampleCount: count,
      }

      const points = generatePointsFromExpression(input)

      // Generate high-resolution points for smooth plotting
      const highResPoints = generatePointsFromExpression({
        ...input,
        sampleCount: 200 // More points for a smoother curve
      })

      if (points.length < 2) {
        setError(translations.notEnoughPoints)
        return
      }

      setPreview(points)
      setOriginalCurve(highResPoints)
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.invalidExpression)
    }
  }, [expression, domainMin, domainMax, sampleCount, translations])

  const handleConfirm = useCallback(() => {
    if (preview) {
      onPointsGenerated(preview, originalCurve || undefined)
      setPreview(null)
      setOriginalCurve(null)
    }
  }, [preview, originalCurve, onPointsGenerated])

  const handleCancel = useCallback(() => {
    setPreview(null)
    setOriginalCurve(null)
    setError(null)
  }, [])

  const supportedFunctions = getSupportedFunctions()

  return (
    <div className="space-y-4">
      {/* Expression input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {translations.functionExpression}
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="h-6 px-2 text-muted-foreground"
          >
            <Info className="h-3 w-3 mr-1" />
            {translations.help}
          </Button>
        </div>

        <MathInput
          value={expression}
          onChange={(val) => updateState({ expression: val })}
          placeholder={translations.functionPlaceholder}
          disabled={disabled}
          className="border rounded-md px-3 py-2 bg-background"
        />

        {showHelp && (
          <div className="p-3 bg-card border border-border rounded-lg shadow-sm">
            <p className="font-medium mb-3 text-sm">{translations.supportedFunctions}</p>
            <div className="grid grid-cols-2 gap-2">
              {supportedFunctions.map((func, i) => (
                <div key={i} className="flex items-center p-2 rounded bg-muted/50 border border-border/50">
                  <LatexDisplay
                    latex={func}
                    className="text-xs"
                    errorFallback={func}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Domain inputs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">
            {translations.domainMin}
          </label>
          <Input
            type="number"
            value={domainMin}
            onChange={(e) => updateState({ domainMin: e.target.value })}
            disabled={disabled}
            className="font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">
            {translations.domainMax}
          </label>
          <Input
            type="number"
            value={domainMax}
            onChange={(e) => updateState({ domainMax: e.target.value })}
            disabled={disabled}
            className="font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">
            {translations.samplePoints}
          </label>
          <Input
            type="number"
            min={2}
            max={100}
            value={sampleCount}
            onChange={(e) => updateState({ sampleCount: e.target.value })}
            disabled={disabled}
            className="font-mono"
          />
        </div>
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={disabled || !expression.trim()}
        className="w-full"
      >
        <Play className="h-4 w-4 mr-2" />
        {translations.generatePoints}
      </Button>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {translations.preview}: {preview.length} {translations.dataPoints}
          </p>

          <div className="max-h-[200px] overflow-y-auto bg-card border border-border rounded-lg">
            <table className="data-table text-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>x</th>
                  <th>y</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((point, index) => (
                  <tr key={index}>
                    <td className="text-muted-foreground">{index + 1}</td>
                    <td className="font-mono">{point.x.toFixed(4)}</td>
                    <td className="font-mono">{point.y.toFixed(4)}</td>
                  </tr>
                ))}
                {preview.length > 10 && (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground">
                      {translations.andMore} {preview.length - 10}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConfirm} className="flex-1">
              {translations.usePoints}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              {translations.cancel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
