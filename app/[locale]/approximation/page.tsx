'use client'

import { useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Calculator, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputTabs } from '@/components/data-input/input-tabs'
import { PolynomialResult } from '@/components/results/polynomial-result'
import { StepDisplay } from '@/components/results/step-display'
import { useCalculation } from '@/lib/hooks/use-calculation'
import { useHistory } from '@/lib/hooks/use-history'
import type { DataPoint } from '@/lib/types'

type ApproximationMethod =
  | 'linear-approximation'
  | 'quadratic-approximation'
  | 'polynomial-approximation'
  | 'power-approximation'
  | 'exponential-approximation'

export default function ApproximationPage() {
  const t = useTranslations()
  const tInput = useTranslations('input')
  const tValidation = useTranslations('validation')
  const tResults = useTranslations('results')
  const tApproximation = useTranslations('approximation')
  const { result, error, validation, isCalculating, calculate, evaluate, clear } =
    useCalculation()
  const { addEntry } = useHistory()

  const [points, setPoints] = useState<DataPoint[]>([
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 5 },
    { x: 4, y: 4 },
    { x: 5, y: 5 },
  ])
  const [selectedMethod, setSelectedMethod] =
    useState<ApproximationMethod>('linear-approximation')
  const [polynomialDegree, setPolynomialDegree] = useState(3)

  const methods: { id: ApproximationMethod; labelKey: string; descKey: string }[] = [
    { id: 'linear-approximation', labelKey: 'linear', descKey: 'linearDesc' },
    { id: 'quadratic-approximation', labelKey: 'quadratic', descKey: 'quadraticDesc' },
    { id: 'polynomial-approximation', labelKey: 'polynomial', descKey: 'polynomialDesc' },
    { id: 'power-approximation', labelKey: 'power', descKey: 'powerDesc' },
    { id: 'exponential-approximation', labelKey: 'exponential', descKey: 'exponentialDesc' },
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
      rSquared: tApproximation('rSquared'),
      sumSquaredError: tApproximation('sumSquaredError'),
      coefficients: tApproximation('coefficients'),
    }),
    [tResults, tApproximation]
  )

  const handleCalculate = useCallback(() => {
    // Filter out invalid points
    const validPoints = points.filter(
      (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
    )

    if (validPoints.length < 2) {
      return
    }

    calculate(validPoints, selectedMethod, { degree: polynomialDegree })
  }, [points, selectedMethod, polynomialDegree, calculate])

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

  const validPointCount = points.filter(
    (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
  ).length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('approximation.title')}</h1>
        <p className="text-muted-foreground">{t('approximation.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Input */}
        <div className="space-y-6">
          {/* Method selection */}
          <Card>
            <CardHeader>
              <CardTitle>{t('approximation.selectMethod')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">
                      {t(`approximation.${method.labelKey}`)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t(`approximation.${method.descKey}`)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Polynomial degree selector */}
              {selectedMethod === 'polynomial-approximation' && (
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-sm font-medium">
                    {t('approximation.degree')}:
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={polynomialDegree}
                    onChange={(e) => setPolynomialDegree(parseInt(e.target.value) || 3)}
                    className="w-20 font-mono"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data input */}
          <Card>
            <CardContent className="pt-6">
              <InputTabs
                points={points}
                onPointsChange={setPoints}
                translations={inputTranslations}
              />
            </CardContent>
          </Card>

          {/* Calculate button */}
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
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{t('common.error')}</span>
              </div>
              <ul className="list-disc list-inside text-sm text-destructive">
                {validation.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column - Results */}
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

          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{t('results.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <PolynomialResult
                    result={result}
                    onEvaluate={evaluate}
                    onSaveToHistory={handleSaveToHistory}
                    translations={resultTranslations}
                  />
                </CardContent>
              </Card>

              {/* Calculation steps */}
              {'steps' in result && result.steps && (
                <StepDisplay
                  steps={result.steps}
                  title={t('results.steps')}
                  defaultExpanded={false}
                />
              )}
            </>
          )}

          {!result && !error && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('approximation.selectMethod')}</p>
                <p className="text-sm mt-1">
                  {validPointCount} {t('input.dataPoints')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
