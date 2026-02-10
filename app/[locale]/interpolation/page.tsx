'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Calculator, AlertCircle, Copy, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputTabs } from '@/components/data-input/input-tabs'
import { PolynomialResult } from '@/components/results/polynomial-result'
import { LatexDisplay, MatrixDisplay } from '@/components/math/latex-display'
import { ErrorCard } from '@/components/results/error-card'
import { FunctionPlot } from '@/components/math/function-plot'
import { useCalculation } from '@/lib/hooks/use-calculation'
import { useHistory } from '@/lib/hooks/use-history'
import { interpolationDatasets } from '@/lib/data/example-datasets'
import { getValidationErrorKey } from '@/lib/math/validators'
import type { DataPoint, InterpolationResult, PrecisionLevel, MetodaRjesavanja } from '@/lib/types'
import { PRECISION_OPTIONS } from '@/lib/types'

type InterpolationMethod =
  | 'lagrange-interpolation'
  | 'newton-interpolation'
  | 'direct-interpolation'

export default function InterpolationPage() {
  const t = useTranslations()
  const tInput = useTranslations('input')
  const tValidation = useTranslations('validation')
  const tResults = useTranslations('results')
  const tSteps = useTranslations('steps')
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
  const [metodaRjesavanja, setMetodaRjesavanja] = useState<MetodaRjesavanja>('gauss')
  const [precision, setPrecision] = useState<PrecisionLevel>(4)
  const [originalCurve, setOriginalCurve] = useState<DataPoint[]>([])
  const [stepsCopied, setStepsCopied] = useState(false)

  // Restore from history (sessionStorage)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('restore-calculation')
      if (stored) {
        sessionStorage.removeItem('restore-calculation')
        const data = JSON.parse(stored)
        if (data.points?.length > 0) {
          setPoints(data.points)
        }
        if (data.type?.includes('interpolation')) {
          setSelectedMethod(data.type as InterpolationMethod)
        }
      }
    } catch { /* ignore */ }
  }, [])

  const validPointCount = points.filter(
    (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
  ).length

  const solverMethods: { id: MetodaRjesavanja; labelKey: string; descKey: string }[] = [
    { id: 'gauss', labelKey: 'gaussElimination', descKey: 'gaussDesc' },
    { id: 'gauss-jordan', labelKey: 'gaussJordan', descKey: 'gaussJordanDesc' },
    { id: 'lu-doolittle', labelKey: 'luFactorization', descKey: 'luDesc' },
  ]

  const methods: { id: InterpolationMethod; labelKey: string; descKey: string }[] = [
    { id: 'lagrange-interpolation', labelKey: 'lagrange', descKey: 'lagrangeDesc' },
    { id: 'newton-interpolation', labelKey: 'newton', descKey: 'newtonDesc' },
    { id: 'direct-interpolation', labelKey: 'direct', descKey: 'directDesc' },
  ]

  const datasetTranslations = useMemo(
    () => ({
      exampleDatasets: tInput('exampleDatasets'),
      selectDataset: tInput('selectDataset'),
      datasetNames: Object.fromEntries(
        interpolationDatasets.map((d) => [d.id, tInput(`datasets.${d.id}`)])
      ),
    }),
    [tInput]
  )

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
      copyData: tInput('copyData'),
      pasteData: tInput('pasteData'),
      pastedPoints: (count: number) => tInput('pastedPoints', { count }),
      copiedPoints: tInput('copiedPoints'),
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
      usePoints: tInput('usePoints'),
      cancel: tInput('cancel'),
      help: tInput('help'),
      supportedFunctions: tInput('supportedFunctions'),
      andMore: tInput('andMore'),
      sampleCountError: tInput('sampleCountError'),
      notEnoughPoints: tInput('notEnoughPoints'),
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

  const stepTranslations = useMemo(
    () => ({
      normalEquations: tSteps('normalEquations'),
      solution: tSteps('solution'),
      linearization: tSteps('linearization'),
      let: tSteps('let'),
      then: tSteps('then'),
      linearRegressionTransformed: tSteps('linearRegressionTransformed'),
      result: tSteps('result'),
      coefficientMatrix: tSteps('coefficientMatrix'),
      expandingTerms: tSteps('expandingTerms'),
      standardForm: tSteps('standardForm'),
      lagrangeInterpolation: tSteps('lagrangeInterpolation'),
      points: tSteps('points'),
      dividedDifferencesTable: tSteps('dividedDifferencesTable'),
      newtonInterpolation: tSteps('newtonInterpolation'),
      newtonPolynomial: tSteps('newtonPolynomial'),
      directInterpolation: tSteps('directInterpolation'),
      forNPoints: tSteps('forNPoints'),
      findPolynomialDegree: tSteps('findPolynomialDegree'),
      systemOfEquations: tSteps('systemOfEquations'),
      gaussElimination: tSteps('gaussElimination'),
      augmentedMatrix: tSteps('augmentedMatrix'),
      pivoting: tSteps('pivoting'),
      rowSwap: tSteps('rowSwap'),
      eliminationStep: tSteps('eliminationStep'),
      backSubstitution: tSteps('backSubstitution'),
      upperTriangularForm: tSteps('upperTriangularForm'),
      gaussJordan: tSteps('gaussJordan'),
      reducedRowEchelonForm: tSteps('reducedRowEchelonForm'),
      normalizeRow: tSteps('normalizeRow'),
      eliminateAbove: tSteps('eliminateAbove'),
      luFactorization: tSteps('luFactorization'),
      lMatrix: tSteps('lMatrix'),
      uMatrix: tSteps('uMatrix'),
      forwardSubstitution: tSteps('forwardSubstitution'),
      backwardSubstitution: tSteps('backwardSubstitution'),
      luDecomposition: tSteps('luDecomposition'),
      solvingLy: tSteps('solvingLy'),
      solvingUx: tSteps('solvingUx'),
    }),
    [tSteps]
  )

  const handleCopySteps = useCallback(async (steps: string[]) => {
    try {
      await navigator.clipboard.writeText(steps.join('\n\n'))
      setStepsCopied(true)
      setTimeout(() => setStepsCopied(false), 2000)
    } catch { /* ignore */ }
  }, [])

  const handleCalculate = useCallback(() => {
    // Filter out invalid points
    const validPoints = points.filter(
      (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
    )

    if (validPoints.length < 2) {
      return
    }

    calculate(validPoints, selectedMethod, { stepTranslations, precision, metodaRjesavanja: selectedMethod === 'direct-interpolation' ? metodaRjesavanja : undefined })
  }, [points, selectedMethod, calculate, stepTranslations, precision, metodaRjesavanja])

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
        <div className="space-y-6 lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('interpolation.selectMethod')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-1.5">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-2 text-left rounded-lg border transition-colors ${selectedMethod === method.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className="font-medium text-sm">
                      {t(`interpolation.${method.labelKey}`)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {t(`interpolation.${method.descKey}`)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Solver method selector (only for Direct) */}
              {selectedMethod === 'direct-interpolation' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <label className="text-xs font-medium block mb-2">
                    {t('interpolation.solverMethod')}:
                  </label>
                  <div className="grid gap-1.5">
                    {solverMethods.map((solver) => (
                      <button
                        key={solver.id}
                        onClick={() => setMetodaRjesavanja(solver.id)}
                        className={`p-2 text-left rounded-lg border transition-colors ${
                          metodaRjesavanja === solver.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium text-xs">
                          {t(`interpolation.${solver.labelKey}`)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {t(`interpolation.${solver.descKey}`)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Precision selector */}
              <div className="mt-4 pt-4 border-t border-border">
                <label className="text-xs font-medium block mb-2">
                  {t('approximation.precision')}:
                </label>
                <div className="flex flex-wrap gap-1">
                  {PRECISION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPrecision(opt.value)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        precision === opt.value
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <LatexDisplay latex={opt.latex} />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 flex flex-col lg:col-span-9">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <InputTabs
                points={points}
                onPointsChange={handlePointsChange}
                datasets={interpolationDatasets}
                datasetTranslations={datasetTranslations}
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

      {/* Tier 3: Results - full width for LaTeX overflow */}
      {resultWithCurve && (
        <Card>
          <CardHeader>
            <CardTitle>{t('results.title')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <PolynomialResult
              result={resultWithCurve}
              onEvaluate={evaluate}
              onSaveToHistory={handleSaveToHistory}
              precision={precision}
              translations={resultTranslations}
            />
          </CardContent>
        </Card>
      )}

      {/* Tier 4: Method-specific displays - full width */}
      {resultWithCurve && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basis Polynomials (Lagrange) */}
          {interpolationResult?.basisPolynomials && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">{t('interpolation.basisPolynomials')}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto max-h-[300px] overflow-y-auto">
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

          {/* Divided Differences (Newton) */}
          {interpolationResult?.dividedDifferences && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">{t('interpolation.dividedDifferences')}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto max-h-[300px] overflow-y-auto">
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

          {/* Coefficient Matrix (Direct) */}
          {interpolationResult?.vandermondeMatrix && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">{t('interpolation.coefficientMatrix')}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <MatrixDisplay matrix={interpolationResult.vandermondeMatrix} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tier 5: Steps - full width for LaTeX overflow */}
      {resultWithCurve && interpolationResult?.steps && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t('results.steps')}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySteps(interpolationResult.steps)}
              className="h-8"
            >
              {stepsCopied ? (
                <Check className="h-4 w-4 mr-1 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {t('results.copyLatex')}
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {interpolationResult.steps.map((step, index) => (
                <div key={index} className="math-step">
                  <LatexDisplay latex={step} displayMode />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error display */}
      {resultWithCurve && error && !validation?.errors.length && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier 4: Full Width Error Analysis */}
      {resultWithCurve && (
        <ErrorCard
          result={resultWithCurve}
          translations={resultTranslations}
        />
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
