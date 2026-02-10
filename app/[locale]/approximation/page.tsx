'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Calculator, AlertCircle, Copy, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputTabs } from '@/components/data-input/input-tabs'
import { PolynomialResult } from '@/components/results/polynomial-result'
import { ErrorCard } from '@/components/results/error-card'
import { FunctionPlot } from '@/components/math/function-plot'
import { LatexDisplay } from '@/components/math/latex-display'
import { useCalculation } from '@/lib/hooks/use-calculation'
import { useHistory } from '@/lib/hooks/use-history'
import { approximationDatasets } from '@/lib/data/example-datasets'
import { getValidationErrorKey } from '@/lib/math/validators'
import type { DataPoint, ApproximationResult, PrecisionLevel, MetodaRjesavanja } from '@/lib/types'
import { PRECISION_OPTIONS } from '@/lib/types'

type ApproximationMethod =
  | 'linear-approximation'
  | 'quadratic-approximation'
  | 'polynomial-approximation'
  | 'power-approximation'
  | 'exponential-approximation'

const LINEARIZABLE_METHODS: ApproximationMethod[] = ['linear-approximation', 'power-approximation', 'exponential-approximation']

export default function ApproximationPage() {
  const t = useTranslations()
  const tInput = useTranslations('input')
  const tValidation = useTranslations('validation')
  const tResults = useTranslations('results')
  const tApproximation = useTranslations('approximation')
  const tSteps = useTranslations('steps')
  const { result, error, validation, isCalculating, calculate, evaluate, clear } =
    useCalculation()
  const { addEntry } = useHistory()

  const [points, setPoints] = useState<DataPoint[]>([
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 5 },
    { x: 4, y: 4 },
    { x: 5, y: 5 },
    { x: 6, y: 7 },
    { x: 7, y: 8 },
    { x: 8, y: 6 },
    { x: 9, y: 9 },
    { x: 10, y: 10 },
  ])
  const [selectedMethod, setSelectedMethod] =
    useState<ApproximationMethod>('linear-approximation')
  const [polynomialDegree, setPolynomialDegree] = useState(3)
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
        if (data.type?.includes('approximation')) {
          setSelectedMethod(data.type as ApproximationMethod)
        }
      }
    } catch { /* ignore */ }
  }, [])

  // Za N tačaka, maksimalni stepen polinoma je N-1 (da izbjegnemo singularne matrice)
  const maxPolynomialDegree = Math.max(1, points.length - 1)

  // Ako korisnik obriše tačke pa degree postane prevelik, automatski ga spusti
  useEffect(() => {
    if (polynomialDegree > maxPolynomialDegree) {
      setPolynomialDegree(maxPolynomialDegree)
    }
  }, [maxPolynomialDegree, polynomialDegree])

  // Reset solver to gauss if direct formulas selected but method doesn't support it
  useEffect(() => {
    if (metodaRjesavanja === 'direktne-formule' && !LINEARIZABLE_METHODS.includes(selectedMethod)) {
      setMetodaRjesavanja('gauss')
    }
  }, [selectedMethod, metodaRjesavanja])

  const methods: { id: ApproximationMethod; labelKey: string; descKey: string }[] = [
    { id: 'linear-approximation', labelKey: 'linear', descKey: 'linearDesc' },
    { id: 'quadratic-approximation', labelKey: 'quadratic', descKey: 'quadraticDesc' },
    { id: 'polynomial-approximation', labelKey: 'polynomial', descKey: 'polynomialDesc' },
    { id: 'power-approximation', labelKey: 'power', descKey: 'powerDesc' },
    { id: 'exponential-approximation', labelKey: 'exponential', descKey: 'exponentialDesc' },
  ]

  const solverMethods: { id: MetodaRjesavanja; labelKey: string; descKey: string; linearOnly?: boolean }[] = [
    { id: 'gauss', labelKey: 'gaussElimination', descKey: 'gaussDesc' },
    { id: 'gauss-jordan', labelKey: 'gaussJordan', descKey: 'gaussJordanDesc' },
    { id: 'lu-doolittle', labelKey: 'luFactorization', descKey: 'luDesc' },
    { id: 'direktne-formule', labelKey: 'directFormulas', descKey: 'directFormulasDesc', linearOnly: true },
  ]

  const visibleSolverMethods = solverMethods.filter(
    (s) => !s.linearOnly || LINEARIZABLE_METHODS.includes(selectedMethod)
  )

  const datasetTranslations = useMemo(
    () => ({
      exampleDatasets: tInput('exampleDatasets'),
      selectDataset: tInput('selectDataset'),
      datasetNames: Object.fromEntries(
        approximationDatasets.map((d) => [d.id, tInput(`datasets.${d.id}`)])
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
      rSquared: tApproximation('rSquared'),
      sumSquaredError: tApproximation('sumSquaredError'),
      coefficients: tApproximation('coefficients'),
      absoluteError: tResults('absoluteError'),
      relativeError: tResults('relativeError'),
      pointErrors: tResults('pointErrors'),
      resultsTitle: tResults('title'),
      scientificNotation: tResults('scientificNotation'),
    }),
    [tResults, tApproximation]
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
      directFormulas: tSteps('directFormulas'),
      meanValues: tSteps('meanValues'),
      formulaForB: tSteps('formulaForB'),
      formulaForA: tSteps('formulaForA'),
      formulaForBCapital: tSteps('formulaForBCapital'),
      formulaForACapital: tSteps('formulaForACapital'),
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

    calculate(validPoints, selectedMethod, { degree: polynomialDegree, stepTranslations, precision, metodaRjesavanja })
  }, [points, selectedMethod, polynomialDegree, calculate, stepTranslations, precision, metodaRjesavanja])

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('approximation.title')}</h1>
        <p className="text-muted-foreground">{t('approximation.subtitle')}</p>
      </div>

      {/* Tier 1: Method and Input */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('approximation.selectMethod')}</CardTitle>
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
                      {t(`approximation.${method.labelKey}`)}
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      <LatexDisplay latex={t(`approximation.${method.descKey}`)} />

                    </div>
                  </button>
                ))}
              </div>

              {/* Polynomial degree selector */}
              {selectedMethod === 'polynomial-approximation' && (
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-xs font-medium">
                    {t('approximation.degree')}:
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={maxPolynomialDegree}
                    value={polynomialDegree}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value, 10)
                      const next = Number.isFinite(raw) ? raw : 1
                      const clamped = Math.min(Math.max(next, 1), maxPolynomialDegree)
                      setPolynomialDegree(clamped)
                    }}
                    className="w-16 h-8 font-mono text-sm"
                  />
                </div>
              )}

              {/* Solver method selector */}
              <div className="mt-4 pt-4 border-t border-border">
                <label className="text-xs font-medium block mb-2">
                  {t('approximation.solverMethod')}:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {visibleSolverMethods.map((solver) => (
                    <button
                      key={solver.id}
                      onClick={() => setMetodaRjesavanja(solver.id)}
                      className={`aspect-square p-2 flex flex-col items-center justify-center text-center rounded-lg border transition-colors ${metodaRjesavanja === solver.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className="font-medium text-xs leading-tight">
                        {t(`approximation.${solver.labelKey}`)}
                      </div>
                      <div className="text-[9px] text-muted-foreground leading-tight mt-1">
                        {t(`approximation.${solver.descKey}`)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

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
                      className={`px-2 py-1 text-xs rounded border transition-colors ${precision === opt.value
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

        <div className="space-y-6 flex flex-col lg:col-span-8">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <InputTabs
                points={points}
                onPointsChange={handlePointsChange}
                datasets={approximationDatasets}
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
            {!result && (
              <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
                {t('approximation.selectMethod')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FunctionPlot
            dataPoints={points.filter(p => !isNaN(p.x) && !isNaN(p.y))}
            originalCurve={originalCurve}
            fittedCurve={result ? (result as ApproximationResult).fittedPoints : []}
            height={500}
            dataPointsLabel={t('plot.dataPoints')}
            fittedCurveLabel={t('plot.fittedCurve')}
            originalCurveLabel={t('plot.originalCurve')}
          />
        </CardContent>
      </Card>

      {/* Tier 3: Results - full width for LaTeX overflow */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{t('results.title')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <PolynomialResult
              result={result}
              onEvaluate={evaluate}
              onSaveToHistory={handleSaveToHistory}
              precision={precision}
              translations={resultTranslations}
            />
          </CardContent>
        </Card>
      )}

      {/* Tier 4: Steps - full width for LaTeX overflow */}
      {result && 'steps' in result && result.steps && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t('results.steps')}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySteps(result.steps)}
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
              {result.steps.map((step, index) => (
                <div key={index} className="math-step">
                  <LatexDisplay latex={step} displayMode />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error display */}
      {result && error && !validation?.errors.length && (
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
      {result && (
        <ErrorCard
          result={result}
          translations={resultTranslations}
        />
      )}

      {/* Empty State when no result */}
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
    </div>
  )
}
