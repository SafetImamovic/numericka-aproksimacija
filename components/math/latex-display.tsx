'use client'

import { useEffect, useState, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface LatexDisplayProps {
  latex: string
  displayMode?: boolean
  className?: string
  errorFallback?: string
}

export function LatexDisplay({
  latex,
  displayMode = false,
  className = '',
  errorFallback,
}: LatexDisplayProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || !latex) return

    try {
      katex.render(latex, containerRef.current, {
        displayMode,
        throwOnError: false,
        errorColor: '#ff6b6b',
        trust: true,
        strict: false,
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render LaTeX')
      if (containerRef.current) {
        containerRef.current.textContent = errorFallback || latex
      }
    }
  }, [latex, displayMode, errorFallback])

  if (!latex) {
    return null
  }

  return (
    <span
      ref={containerRef}
      className={`${className} ${error ? 'text-red-400' : ''}`}
      aria-label={`Mathematical expression: ${latex}`}
    />
  )
}

// Block display variant for equations
interface LatexBlockProps {
  latex: string
  className?: string
  label?: string
}

export function LatexBlock({ latex, className = '', label }: LatexBlockProps) {
  return (
    <div className={`math-container ${className}`} role="math" aria-label={label}>
      <LatexDisplay latex={latex} displayMode />
    </div>
  )
}

// Step-by-step display for showing calculation steps
interface LatexStepsProps {
  steps: string[]
  className?: string
}

export function LatexSteps({ steps, className = '' }: LatexStepsProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="math-step">
          <LatexDisplay latex={step} displayMode />
        </div>
      ))}
    </div>
  )
}

import { formatNumber } from '@/lib/math/matrix-utils'

// Matrix display component
interface MatrixDisplayProps {
  matrix: number[][]
  className?: string
  precision?: number
}

export function MatrixDisplay({ matrix, className = '', precision = 4 }: MatrixDisplayProps) {
  const rows = matrix
    .map((row) => row.map((val) => formatNumber(val, precision)).join(' & '))
    .join(' \\\\ ')

  const latex = `\\begin{bmatrix} ${rows} \\end{bmatrix}`

  return <LatexBlock latex={latex} className={className} />
}
