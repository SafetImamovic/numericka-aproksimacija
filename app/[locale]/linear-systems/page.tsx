'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle, Copy, Check, Plus, Minus, ClipboardPaste, ClipboardCopy, Database, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LatexDisplay } from '@/components/math/latex-display'
import {
  gaussSaKoracima,
  gaussJordanSaKoracima,
  luDoolittleSaKoracima,
  prosirenaMatricaULatex,
  formatirajBroj,
} from '@/lib/math/matrica-utils'
import { PRECISION_OPTIONS } from '@/lib/types'
import type { PrecisionLevel } from '@/lib/types'

type SolverMethod = 'gauss' | 'gauss-jordan' | 'lu-doolittle'

const MIN_SIZE = 2
const MAX_SIZE = 6

interface ExampleSystem {
  nameKey: string
  A: number[][]
  b: number[]
}

const EXAMPLES: ExampleSystem[] = [
  {
    nameKey: 'example2x2',
    A: [[2, 1], [1, 3]],
    b: [5, 10],
  },
  {
    nameKey: 'example3x3',
    A: [[1, 1, 1], [2, 1, -1], [1, -1, 2]],
    b: [6, 1, 5],
  },
  {
    nameKey: 'example3x3k',
    A: [[4, -1, -1], [-1, 3, -1], [-1, -1, 5]],
    b: [8, 6, 10],
  },
  {
    nameKey: 'example4x4',
    A: [[1, 1, 1, 1], [2, -1, 1, -1], [1, 3, -1, 1], [1, -1, 2, 1]],
    b: [10, -1, 8, 9],
  },
]

function createMatrix(n: number): string[][] {
  return Array.from({ length: n }, () => Array(n).fill(''))
}

function createVector(n: number): string[] {
  return Array(n).fill('')
}

function parsePastedMatrix(text: string): { A: string[][]; b: string[] } | null {
  const lines = text.trim().split(/\n/).filter(l => l.trim())
  if (lines.length < MIN_SIZE) return null

  const rows: string[][] = lines.map(line => {
    const cleaned = line.replace('|', ' ')
    return cleaned.trim().split(/[\s,;]+/).filter(Boolean)
  })

  const n = rows.length
  if (n > MAX_SIZE) return null

  const hasB = rows.every(r => r.length === n + 1)
  const noB = rows.every(r => r.length === n)
  if (!hasB && !noB) return null

  return {
    A: rows.map(r => r.slice(0, n)),
    b: hasB ? rows.map(r => r[n]) : Array(n).fill(''),
  }
}

export default function LinearSystemsPage() {
  const t = useTranslations('linearSystems')
  const tSteps = useTranslations('steps')
  const tApproximation = useTranslations('approximation')
  const tInput = useTranslations('input')

  const [size, setSize] = useState(3)
  const [matrix, setMatrix] = useState<string[][]>(createMatrix(3))
  const [vectorB, setVectorB] = useState<string[]>(createVector(3))
  const [solverMethod, setSolverMethod] = useState<SolverMethod>('gauss')
  const [precision, setPrecision] = useState<PrecisionLevel>(4)
  const [solution, setSolution] = useState<number[] | null>(null)
  const [steps, setSteps] = useState<string[] | null>(null)
  const [augmentedLatex, setAugmentedLatex] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stepsCopied, setStepsCopied] = useState(false)
  const [solutionCopied, setSolutionCopied] = useState(false)
  const [dataCopied, setDataCopied] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const exampleSelectRef = useRef<HTMLSelectElement>(null)

  const showFeedback = useCallback((message: string) => {
    setFeedbackMessage(message)
    setTimeout(() => setFeedbackMessage(null), 2000)
  }, [])

  const resizeTo = useCallback((newSize: number) => {
    if (newSize < MIN_SIZE || newSize > MAX_SIZE) return
    setSize(newSize)
    setMatrix(prev => {
      const next = createMatrix(newSize)
      for (let i = 0; i < Math.min(prev.length, newSize); i++)
        for (let j = 0; j < Math.min(prev[i].length, newSize); j++)
          next[i][j] = prev[i][j]
      return next
    })
    setVectorB(prev => {
      const next = createVector(newSize)
      for (let i = 0; i < Math.min(prev.length, newSize); i++) next[i] = prev[i]
      return next
    })
    setSolution(null)
    setSteps(null)
    setAugmentedLatex(null)
    setError(null)
  }, [])

  const handleMatrixChange = useCallback((row: number, col: number, value: string) => {
    setMatrix(prev => { const next = prev.map(r => [...r]); next[row][col] = value; return next })
  }, [])

  const handleVectorChange = useCallback((row: number, value: string) => {
    setVectorB(prev => { const next = [...prev]; next[row] = value; return next })
  }, [])

  const loadExample = useCallback((ex: ExampleSystem) => {
    const n = ex.A.length
    setSize(n)
    setMatrix(ex.A.map(row => row.map(String)))
    setVectorB(ex.b.map(String))
    setSolution(null)
    setSteps(null)
    setAugmentedLatex(null)
    setError(null)
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text')
    const parsed = parsePastedMatrix(text)
    if (!parsed) return
    const n = parsed.A.length
    e.preventDefault()
    setSize(n)
    setMatrix(parsed.A)
    setVectorB(parsed.b)
    setSolution(null)
    setSteps(null)
    setAugmentedLatex(null)
    setError(null)
  }, [])

  const handleCopyData = useCallback(async () => {
    const rows = matrix.map((row, i) => `${row.join(' ')} ${vectorB[i] || '0'}`)
    try {
      await navigator.clipboard.writeText(rows.join('\n'))
      setDataCopied(true)
      setTimeout(() => setDataCopied(false), 2000)
      showFeedback(tInput('copiedPoints'))
    } catch { /* ignore */ }
  }, [matrix, vectorB, tInput, showFeedback])

  const handleClearAll = useCallback(() => {
    setMatrix(createMatrix(size))
    setVectorB(createVector(size))
    setSolution(null)
    setSteps(null)
    setAugmentedLatex(null)
    setError(null)
  }, [size])

  const handlePasteButton = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      const parsed = parsePastedMatrix(text)
      if (!parsed) return
      const n = parsed.A.length
      setSize(n)
      setMatrix(parsed.A)
      setVectorB(parsed.b)
      setSolution(null)
      setSteps(null)
      setAugmentedLatex(null)
      setError(null)
      showFeedback(tInput('pastedPoints', { count: n }))
    } catch { /* ignore */ }
  }, [tInput, showFeedback])

  const stepTranslations = useMemo(() => ({
    normalEquations: tSteps('normalEquations'),
    solution: tSteps('solution'),
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
    luDecomposition: tSteps('luDecomposition'),
    solvingLy: tSteps('solvingLy'),
    solvingUx: tSteps('solvingUx'),
    forwardSubstitution: tSteps('forwardSubstitution'),
    backwardSubstitution: tSteps('backwardSubstitution'),
  }), [tSteps])

  const handleSolve = useCallback(() => {
    setError(null)
    setSolution(null)
    setSteps(null)
    setAugmentedLatex(null)

    const A: number[][] = []
    const b: number[] = []
    for (let i = 0; i < size; i++) {
      const row: number[] = []
      for (let j = 0; j < size; j++) {
        const val = parseFloat(matrix[i][j] || '0')
        if (isNaN(val)) { setError(t('invalidInput')); return }
        row.push(val)
      }
      A.push(row)
      const bVal = parseFloat(vectorB[i] || '0')
      if (isNaN(bVal)) { setError(t('invalidInput')); return }
      b.push(bVal)
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t_ = stepTranslations as any
      let result: { rjesenje: number[]; koraci: string[] }
      if (solverMethod === 'gauss') result = gaussSaKoracima(A, b, precision, t_)
      else if (solverMethod === 'gauss-jordan') result = gaussJordanSaKoracima(A, b, precision, t_)
      else result = luDoolittleSaKoracima(A, b, precision, t_)
      setSolution(result.rjesenje)
      setSteps(result.koraci)
      setAugmentedLatex(prosirenaMatricaULatex(A, b, precision))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('noSolution'))
    }
  }, [size, matrix, vectorB, solverMethod, precision, stepTranslations, t])

  const handleCopySolution = useCallback(async () => {
    if (!solution) return
    const parts: string[] = []
    if (augmentedLatex) parts.push(augmentedLatex)
    parts.push(solution.map((val, i) => `x_{${i + 1}} = ${formatirajBroj(val, precision)}`).join(', \\quad '))
    try {
      await navigator.clipboard.writeText(parts.join('\n\n'))
      setSolutionCopied(true)
      setTimeout(() => setSolutionCopied(false), 2000)
    } catch { /* ignore */ }
  }, [solution, augmentedLatex, precision])

  const handleCopySteps = useCallback(async () => {
    if (!steps) return
    try {
      await navigator.clipboard.writeText(steps.join('\n\n'))
      setStepsCopied(true)
      setTimeout(() => setStepsCopied(false), 2000)
    } catch { /* ignore */ }
  }, [steps])

  const solverMethods: { id: SolverMethod; labelKey: string; descKey: string }[] = [
    { id: 'gauss', labelKey: 'gaussElimination', descKey: 'gaussDesc' },
    { id: 'gauss-jordan', labelKey: 'gaussJordan', descKey: 'gaussJordanDesc' },
    { id: 'lu-doolittle', labelKey: 'luFactorization', descKey: 'luDesc' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Settings */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('solverMethod')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {/* Solver method grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {solverMethods.map((solver) => (
                  <button
                    key={solver.id}
                    onClick={() => setSolverMethod(solver.id)}
                    className={`aspect-square p-2 flex flex-col items-center justify-center text-center rounded-lg border transition-colors ${
                      solverMethod === solver.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-xs leading-tight">
                      {tApproximation(solver.labelKey)}
                    </div>
                    <div className="text-[9px] text-muted-foreground leading-tight mt-1">
                      {tApproximation(solver.descKey)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Precision */}
              <div>
                <p className="text-xs font-medium mb-1">{tApproximation('precision')}</p>
                <div className="flex gap-1 flex-wrap">
                  {PRECISION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPrecision(opt.value)}
                      className={`px-2 py-0.5 text-xs rounded border transition-colors ${
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

        {/* Right: Matrix input */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('matrixInput')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3" onPaste={handlePaste}>
                {/* Example picker */}
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground shrink-0" />
                  <select
                    ref={exampleSelectRef}
                    defaultValue=""
                    onChange={(e) => {
                      const ex = EXAMPLES.find(x => x.nameKey === e.target.value)
                      if (ex) loadExample(ex)
                      if (exampleSelectRef.current) exampleSelectRef.current.value = ''
                    }}
                    className="border-input dark:bg-input/30 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    <option value="" disabled className="text-neutral-600">
                      {t('selectExample')}
                    </option>
                    {EXAMPLES.map((ex) => (
                      <option key={ex.nameKey} value={ex.nameKey} className="text-neutral-900">
                        {t(ex.nameKey)} ({ex.A.length}×{ex.A.length})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <div className="inline-block">
                    {/* Column headers */}
                    <div className="flex gap-1 mb-1 items-center">
                      {Array.from({ length: size }, (_, j) => (
                        <div key={j} className="w-14 text-center text-xs text-muted-foreground">
                          <LatexDisplay latex={`x_{${j + 1}}`} />
                        </div>
                      ))}
                      <div className="w-5" />
                      <div className="w-14 text-center text-xs text-muted-foreground">
                        <LatexDisplay latex={`b`} />
                      </div>
                    </div>

                    {/* Matrix rows */}
                    {Array.from({ length: size }, (_, i) => (
                      <div key={i} className="flex gap-1 mb-1 items-center">
                        {Array.from({ length: size }, (_, j) => (
                          <Input
                            key={j}
                            type="number"
                            step="any"
                            value={matrix[i][j]}
                            onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                            className="w-14 h-7 text-center font-mono text-sm px-1"
                            placeholder="0"
                          />
                        ))}
                        <div className="w-5 text-center text-muted-foreground text-sm select-none">|</div>
                        <Input
                          type="number"
                          step="any"
                          value={vectorB[i]}
                          onChange={(e) => handleVectorChange(i, e.target.value)}
                          className="w-14 h-7 text-center font-mono text-sm px-1 border-primary/40"
                          placeholder="0"
                        />
                      </div>
                    ))}

                    {/* Resize controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => resizeTo(size - 1)}
                        disabled={size <= MIN_SIZE}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-destructive/70 hover:text-destructive text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs text-muted-foreground font-mono">{size}×{size}</span>
                      <button
                        onClick={() => resizeTo(size + 1)}
                        disabled={size >= MAX_SIZE}
                        className="w-7 h-7 flex items-center justify-center rounded border border-dashed border-border hover:border-primary/70 hover:text-primary text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="text-xs text-muted-foreground">{t('addRowCol')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyData}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {dataCopied ? (
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4 mr-2" />
                    )}
                    {tInput('copyData')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePasteButton}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ClipboardPaste className="h-4 w-4 mr-2" />
                    {tInput('pasteData')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {tInput('clearAll')}
                  </Button>
                  {feedbackMessage && (
                    <span className="text-sm text-green-500 animate-in fade-in duration-200">
                      {feedbackMessage}
                    </span>
                  )}
                </div>

                <Button onClick={handleSolve} className="w-full">
                  {t('solveButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solution */}
      {solution && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t('solution')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCopySolution} className="h-8">
              {solutionCopied ? (
                <Check className="h-4 w-4 mr-1 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {t('copyLatex')}
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {augmentedLatex && (
              <div className="mb-4 math-container">
                <LatexDisplay latex={augmentedLatex} displayMode />
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {solution.map((val, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg math-container"
                >
                  <LatexDisplay
                    latex={`x_{${i + 1}} = ${formatirajBroj(val, precision)}`}
                    displayMode
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps */}
      {steps && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t('steps')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCopySteps} className="h-8">
              {stepsCopied ? (
                <Check className="h-4 w-4 mr-1 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {t('copyLatex')}
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="math-step">
                  <LatexDisplay latex={step} displayMode />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
