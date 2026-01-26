'use client'

import { useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Calculator, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputTabs } from '@/components/data-input/input-tabs'
import { PolynomialResult } from '@/components/results/polynomial-result'
import { StepDisplay } from '@/components/results/step-display'
import { MatrixDisplay } from '@/components/math/latex-display'
import { ErrorCard } from '@/components/results/error-card'
import { FunctionPlot } from '@/components/math/function-plot'
import { useCalculation } from '@/lib/hooks/use-calculation'
import { useHistory } from '@/lib/hooks/use-history'
import { getValidationErrorKey } from '@/lib/math/validators'
import type { DataPoint, InterpolationResult } from '@/lib/types'

type InterpolationMethod =
  | 'lagrange-interpolation'
  | 'newton-interpolation'
  | 'direct-interpolation'

export default function InterpolationPage() {
  const t = useTranslations()
  const tInput = useTranslations('input')
  const tValidation = useTranslations('validation')
  const tResults = useTranslations('results')
  const { result, error, validation, isCalculating, calculate, evaluate, clear } =
    useCalculation()
  const { addEntry } = useHistory()

  const [points, setPoints] = useState<DataPoint[]>([
    { x: 0, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 2 },
    { x: 3, y: 5 },
  ])
  const [selectedMethod, setSelectedMethod] =
    useState<InterpolationMethod>('lagrange-interpolation')
  const [originalCurve, setOriginalCurve] = useState<DataPoint[]>([])

  const methods: { id: InterpolationMethod; labelKey: string; descKey: string }[] = [
    { id: 'lagrange-interpolation', labelKey: 'lagrange', descKey: 'lagrangeDesc' },
    { id: 'newton-interpolation', labelKey: 'newton', descKey: 'newtonDesc' },
    { id: 'direct-interpolation', labelKey: 'direct', descKey: 'directDesc' },
  ]

  const inputTranslations = useMemo(
    () => ({
      title: tInput('title'),
      manualTab: tInput('manualTab'),
      fileTab: tInput('fileTab'),
      functionTab: tInput('functionTab'),
      xValue: tInput('xValue'),
      yValue: tInput('yValue'),
      addRow: tInput('addRow'),
      clearAll: tInput('clearAll'),
      point: tInput('point'),
      uploadFile: tInput('uploadFile'),
      dragDrop: tInput('dragDrop'),
      or: tInput('or'),
      browseFiles: tInput('browseFiles'),
      supportedFormats: tInput('supportedFormats'),
      parseError: tValidation('parseError'),
      emptyFile: tValidation('emptyFile'),
      functionExpression: tInput('functionExpression'),
      functionPlaceholder: tInput('functionPlaceholder'),
      domainMin: tInput('domainMin'),
      domainMax: tInput('domainMax'),
      samplePoints: tInput('samplePoints'),
      generatePoints: tInput('generatePoints'),
      invalidExpression: tValidation('invalidExpression'),
      domainError: tValidation('domainError'),
      preview: tInput('preview'),
      dataPoints: tInput('dataPoints'),
    }),
    [tInput, tValidation]
  )

  const resultTranslations = useMemo(
    () => ({
      polynomial: tResults('polynomial'),
      graph: tResults('graph'),
      copyLatex: tResults('copyLatex'),
      saveToHistory: tResults('saveToHistory'),
      evaluate: tResults('evaluate'),
      evaluateAt: tResults('evaluateAt'),
      evaluatedValue: tResults('evaluatedValue'),
      coefficients: t('approximation.coefficients'),
      absoluteError: tResults('absoluteError'),
      relativeError: tResults('relativeError'),
      pointErrors: tResults('pointErrors'),
      resultsTitle: tResults('title'),
    }),
    [tResults, t]
  )

  const handleCalculate = useCallback(() => {
    // Filter out invalid points
    const validPoints = points.filter(
      (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
    )

    if (validPoints.length < 2) {
      return
    }

    calculate(validPoints, selectedMethod)
  }, [points, selectedMethod, calculate])

  const handleSaveToHistory = useCallback(() => {
    if (result) {
      const validPoints = points.filter(
        (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
      )
      addEntry({
        type: selectedMethod,
        points: validPoints,
        result,
      })
    }
  }, [result, points, selectedMethod, addEntry])

  const handlePointsChange = useCallback((newPoints: DataPoint[], curve?: DataPoint[]) => {
    setPoints(newPoints)
    if (curve) {
      setOriginalCurve(curve)
    } else {
      setOriginalCurve([])
    }
  }, [])

  const validPointCount = points.filter(
    (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
  ).length

  // Get interpolation-specific data
  const interpolationResult = result as (InterpolationResult & { steps: string[] }) | null

  // Generate fitted curve for plotting
  const fittedCurvePoints = useMemo(() => {
    if (!interpolationResult) return []

    const validPoints = points.filter(
      (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
    )

    if (validPoints.length < 2) return []

    const xMin = Math.min(...validPoints.map((p) => p.x))
    const xMax = Math.max(...validPoints.map((p) => p.x))
    const step = (xMax - xMin) / 100

    const curvePoints: DataPoint[] = []
    for (let i = 0; i <= 100; i++) {
      const x = xMin + i * step
      const y = evaluate(x)
      if (y !== null && isFinite(y)) {
        curvePoints.push({ x, y })
      }
    }

    return curvePoints
  }, [interpolationResult, points, evaluate])

  // Augment result with fitted points for plotting
  const resultWithCurve = useMemo(() => {
    if (!interpolationResult) return null
    return {
      ...interpolationResult,
      fittedPoints: fittedCurvePoints,
    }
  }, [interpolationResult, fittedCurvePoints])

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('interpolation.title')}</h1>
        <p className="text-muted-foreground">{t('interpolation.subtitle')}</p>
      </div>

      {/* Tier 1: Method and Input */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t('interpolation.selectMethod')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 text-left rounded-lg border transition-colors ${selectedMethod === method.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className="font-medium">
                      {t(`interpolation.${method.labelKey}`)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t(`interpolation.${method.descKey}`)}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 flex flex-col lg:col-span-8">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <InputTabs
                points={points}
                onPointsChange={handlePointsChange}
                translations={inputTranslations}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleCalculate}
              disabled={isCalculating || validPointCount < 2}
              className="flex-1"
              size="lg"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {isCalculating ? t('common.loading') : t('common.calculate')}
            </Button>
            <Button variant="outline" onClick={clear} size="lg">
              {t('common.clear')}
            </Button>
          </div>

          {/* Validation errors */}
          {validation && !validation.isValid && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg mt-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{t('common.error')}</span>
              </div>
              <ul className="list-disc list-inside text-sm text-destructive">
                {validation.errors.map((err, i) => (
                  <li key={i}>{t(getValidationErrorKey(err))}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tier 2: Full Width Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tResults('graph')}
            {!resultWithCurve && (
              <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
                {t('interpolation.selectMethod')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FunctionPlot
            dataPoints={points.filter(p => !isNaN(p.x) && !isNaN(p.y))}
            originalCurve={originalCurve}
            fittedCurve={resultWithCurve ? resultWithCurve.fittedPoints : []}
            height={500}
            dataPointsLabel={t('plot.dataPoints')}
            fittedCurveLabel={t('plot.fittedCurve')}
            originalCurveLabel={t('plot.originalCurve')}
          />
        </CardContent>
      </Card>

      {/* Tier 3: Results and Steps */}
      {resultWithCurve && (
        <div className="grid gap-6 lg:grid-cols-2 group">
          {/* Left Column: Results & Mistakes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('results.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <PolynomialResult
                  result={resultWithCurve}
                  onEvaluate={evaluate}
                  onSaveToHistory={handleSaveToHistory}
                  translations={resultTranslations}
                />
              </CardContent>
            </Card>

            <ErrorCard
              result={resultWithCurve}
              translations={resultTranslations}
            />
          </div>

          <div className="space-y-6">
            {error && !validation?.errors.length && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Method-specific displays */}
            {interpolationResult?.basisPolynomials && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">{t('interpolation.basisPolynomials')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-xs">
                    {interpolationResult.basisPolynomials.map((basis, i) => (
                      <div key={i} className="p-2 bg-card border border-border rounded">
                        {basis}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {interpolationResult?.dividedDifferences && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">{t('interpolation.dividedDifferences')}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="data-table text-xs">
                    <thead>
                      <tr>
                        <th>x</th>
                        <th>f[·]</th>
                        {interpolationResult.dividedDifferences
                          .slice(1)
                          .map((_, i) => (
                            <th key={i}>f[{'.'.repeat(i + 2)}]</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {interpolationResult.points.map((point, rowIdx) => (
                        <tr key={rowIdx}>
                          <td className="font-mono">{point.x}</td>
                          {interpolationResult.dividedDifferences!.map(
                            (col, colIdx) =>
                              rowIdx < col.length ? (
                                <td key={colIdx} className="font-mono text-[10px]">
                                  {col[rowIdx].toFixed(4)}
                                </td>
                              ) : (
                                <td key={colIdx} />
                              )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {interpolationResult?.vandermondeMatrix && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">{t('interpolation.vandermondeMatrix')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MatrixDisplay matrix={interpolationResult.vandermondeMatrix} />
                </CardContent>
              </Card>
            )}

            {/* Calculation steps */}
            {interpolationResult?.steps && (
              <StepDisplay
                steps={interpolationResult.steps}
                title={t('results.steps')}
                defaultExpanded={true}
              />
            )}
          </div>
        </div>
      )}

      {/* Empty State / Error */}
      {!result && error && !validation?.errors.length && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!result && !error && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('interpolation.selectMethod')}</p>
            <p className="text-sm mt-1">
              {validPointCount} {t('input.dataPoints')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
